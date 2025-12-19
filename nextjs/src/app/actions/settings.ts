"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import { revalidatePath } from "next/cache";

// Get user profile
export async function getProfile() {
  const { user } = await getCachedUserWithHousehold();

  // Only check if user exists - authError might be from household/subscription lookup, not auth
  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return { error: error.message, data: null };
  }

  return { error: null, data: profile };
}

// Update user profile
export async function updateProfile(firstName: string, lastName: string) {
  // Use direct auth check instead of getCachedUserWithHousehold since user might not have a household yet
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: firstName,
      last_name: lastName,
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings");
  revalidatePath("/app");
  return { error: null };
}

// Get user settings (from user_settings table, or create default)
export async function getSettings() {
  const { user } = await getCachedUserWithHousehold();

  // Only check if user exists - authError might be from household/subscription lookup, not auth
  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  // Try to get existing settings
  // Explicitly select columns to avoid schema cache issues with missing columns
  // eslint-disable-next-line prefer-const -- selectError is not reassigned but settings is
  let { data: settings, error: selectError } = await supabase
    .from("user_settings")
    .select(`
      id,
      user_id,
      dark_mode,
      cook_names,
      cook_colors,
      allergen_alerts,
      custom_dietary_restrictions,
      category_order,
      calendar_event_time,
      calendar_event_duration_minutes,
      calendar_excluded_days,
      google_connected_account,
      dismissed_hints,
      preferences,
      unit_system,
      created_at,
      updated_at,
      email_notifications
    `)
    .eq("user_id", user.id)
    .maybeSingle();

  // If select failed due to missing column, try without email_notifications
  if (selectError && selectError.message?.includes("email_notifications")) {
    const { data: settingsWithoutEmail, error: retryError } = await supabase
      .from("user_settings")
      .select(`
        id,
        user_id,
        dark_mode,
        cook_names,
        cook_colors,
        allergen_alerts,
        custom_dietary_restrictions,
        category_order,
        calendar_event_time,
        calendar_event_duration_minutes,
        calendar_excluded_days,
        google_connected_account,
        dismissed_hints,
        preferences,
        unit_system,
        created_at,
        updated_at
      `)
      .eq("user_id", user.id)
      .maybeSingle();
    
    if (retryError) {
      // If still fails, return defaults
      return {
        error: null,
        data: {
          id: "",
          user_id: user.id,
          dark_mode: false,
          cook_names: ["Me"],
          cook_colors: {} as Record<string, string>,
          email_notifications: true,
          allergen_alerts: [],
          custom_dietary_restrictions: [],
          category_order: null as string[] | null,
          calendar_event_time: null as string | null,
          calendar_event_duration_minutes: null as number | null,
          calendar_excluded_days: [],
          dismissed_hints: [],
          unit_system: "imperial" as const,
          preferences: {} as Record<string, unknown>,
          google_connected_account: null as string | null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      };
    }

    // Add default email_notifications and ensure dismissed_hints, unit_system, and preferences exist
    settings = settingsWithoutEmail ? {
      ...settingsWithoutEmail,
      email_notifications: true,
      dismissed_hints: settingsWithoutEmail.dismissed_hints || [],
      unit_system: settingsWithoutEmail.unit_system || "imperial",
      preferences: settingsWithoutEmail.preferences || {},
    } : null;
  } else if (selectError) {
    // Other error - return defaults
    return {
      error: null,
      data: {
        id: "",
        user_id: user.id,
        dark_mode: false,
        cook_names: ["Me"],
        cook_colors: {} as Record<string, string>,
        email_notifications: true,
        allergen_alerts: [],
        custom_dietary_restrictions: [],
        category_order: null as string[] | null,
        calendar_event_time: null as string | null,
        calendar_event_duration_minutes: null as number | null,
        calendar_excluded_days: [],
        dismissed_hints: [],
        unit_system: "imperial" as const,
        preferences: {} as Record<string, unknown>,
        google_connected_account: null as string | null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };
  }

  // Ensure email_notifications has a default value if missing
  if (settings && settings.email_notifications === undefined) {
    settings.email_notifications = true;
  }

  // Ensure array fields are never null - convert to empty arrays
  if (settings) {
    if (!settings.allergen_alerts || !Array.isArray(settings.allergen_alerts)) {
      settings.allergen_alerts = [];
    }
    if (!settings.custom_dietary_restrictions || !Array.isArray(settings.custom_dietary_restrictions)) {
      settings.custom_dietary_restrictions = [];
    }
    if (!settings.calendar_excluded_days || !Array.isArray(settings.calendar_excluded_days)) {
      settings.calendar_excluded_days = [];
    }
    if (!settings.dismissed_hints || !Array.isArray(settings.dismissed_hints)) {
      settings.dismissed_hints = [];
    }
    if (!settings.cook_names || !Array.isArray(settings.cook_names)) {
      settings.cook_names = ["Me"];
    }
    if (!settings.unit_system) {
      settings.unit_system = "imperial";
    }
    if (!settings.preferences) {
      settings.preferences = {};
    }
  }

  // Create default settings if none exist
  if (!settings) {
    const { data: newSettings, error } = await supabase
      .from("user_settings")
      .insert({
        user_id: user.id,
        dark_mode: false,
        cook_names: ["Me"],
        email_notifications: true,
        allergen_alerts: [],
        custom_dietary_restrictions: [],
        calendar_excluded_days: [],
      })
      .select()
      .single();

    if (error) {
      // Table might not exist or column missing - return defaults
      return {
        error: null,
        data: {
          id: "",
          user_id: user.id,
          dark_mode: false,
          cook_names: ["Me"],
          cook_colors: {} as Record<string, string>,
          email_notifications: true,
          allergen_alerts: [],
          custom_dietary_restrictions: [],
          category_order: null as string[] | null,
          calendar_event_time: null as string | null,
          calendar_event_duration_minutes: null as number | null,
          calendar_excluded_days: [],
          dismissed_hints: [],
          unit_system: "imperial" as const,
          preferences: {} as Record<string, unknown>,
          google_connected_account: null as string | null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      };
    }
    settings = newSettings;

    // Ensure array fields are arrays after insert
    if (settings) {
      if (!settings.allergen_alerts || !Array.isArray(settings.allergen_alerts)) {
        settings.allergen_alerts = [];
      }
      if (!settings.custom_dietary_restrictions || !Array.isArray(settings.custom_dietary_restrictions)) {
        settings.custom_dietary_restrictions = [];
      }
      if (!settings.calendar_excluded_days || !Array.isArray(settings.calendar_excluded_days)) {
        settings.calendar_excluded_days = [];
      }
    }
  }

  return { error: null, data: settings };
}

// Update user settings
export async function updateSettings(settings: {
  dark_mode?: boolean;
  cook_names?: string[];
  cook_colors?: Record<string, string>;
  email_notifications?: boolean;
  allergen_alerts?: string[];
  custom_dietary_restrictions?: string[];
  category_order?: string[] | null;
  calendar_event_time?: string | null;
  calendar_event_duration_minutes?: number | null;
  calendar_excluded_days?: string[] | null;
  unit_system?: "imperial" | "metric";
}) {
  // Use direct auth check instead of getCachedUserWithHousehold since user might not have a household yet
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  // First, get existing settings to merge with new values
  const { data: existingSettings } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  // Prepare settings for save - merge existing with new, ensure array fields are arrays (never null)
  const settingsToSave: Record<string, unknown> = {
    user_id: user.id,
    updated_at: new Date().toISOString(),
    // Start with existing settings if they exist
    ...(existingSettings || {}),
  };

  // Override with new values that are explicitly provided
  // Always ensure arrays are arrays (never null or undefined)
  if (settings.dark_mode !== undefined) settingsToSave.dark_mode = settings.dark_mode;
  if (settings.cook_names !== undefined) settingsToSave.cook_names = settings.cook_names || ["Me"];
  if (settings.cook_colors !== undefined) settingsToSave.cook_colors = settings.cook_colors;
  if (settings.email_notifications !== undefined) settingsToSave.email_notifications = settings.email_notifications;
  
  // Array fields - always ensure they're arrays
  if (settings.allergen_alerts !== undefined) {
    settingsToSave.allergen_alerts = Array.isArray(settings.allergen_alerts) ? settings.allergen_alerts : [];
  }
  if (settings.custom_dietary_restrictions !== undefined) {
    settingsToSave.custom_dietary_restrictions = Array.isArray(settings.custom_dietary_restrictions) 
      ? settings.custom_dietary_restrictions 
      : [];
  }
  if (settings.calendar_excluded_days !== undefined) {
    settingsToSave.calendar_excluded_days = Array.isArray(settings.calendar_excluded_days) 
      ? settings.calendar_excluded_days 
      : [];
  }
  
  if (settings.category_order !== undefined) settingsToSave.category_order = settings.category_order;
  if (settings.calendar_event_time !== undefined) settingsToSave.calendar_event_time = settings.calendar_event_time;
  if (settings.calendar_event_duration_minutes !== undefined) settingsToSave.calendar_event_duration_minutes = settings.calendar_event_duration_minutes;
  if (settings.unit_system !== undefined) settingsToSave.unit_system = settings.unit_system;

  // Ensure array fields are never null in the final object
  if (!settingsToSave.allergen_alerts || !Array.isArray(settingsToSave.allergen_alerts)) {
    settingsToSave.allergen_alerts = [];
  }
  if (!settingsToSave.custom_dietary_restrictions || !Array.isArray(settingsToSave.custom_dietary_restrictions)) {
    settingsToSave.custom_dietary_restrictions = [];
  }
  if (!settingsToSave.calendar_excluded_days || !Array.isArray(settingsToSave.calendar_excluded_days)) {
    settingsToSave.calendar_excluded_days = [];
  }

  // Upsert settings - this will update existing or create new
  const { error } = await supabase.from("user_settings").upsert(
    settingsToSave,
    { onConflict: "user_id" }
  ).select();

  if (error) {
    console.error('Error saving settings:', error);
    return { error: error.message };
  }

  revalidatePath("/app/settings");
  revalidatePath("/app");
  return { error: null };
}

// Get household info
export async function getHouseholdInfo() {
  const { user, household, membership, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household || !membership) {
    return { error: authError || "No household found", data: null };
  }

  const supabase = await createClient();

  // Get full household details
  const { data: householdDetails } = await supabase
    .from("households")
    .select("id, name, created_at")
    .eq("id", household.household_id)
    .maybeSingle();

  // Get household members
  const { data: members } = await supabase
    .from("household_members")
    .select(
      `
      user_id,
      role,
      profiles (
        first_name,
        last_name,
        email
      )
    `
    )
    .eq("household_id", household.household_id);

  return {
    error: null,
    data: {
      household: householdDetails,
      role: membership.role,
      members: members || [],
    },
  };
}

// Update household name
export async function updateHouseholdName(name: string) {
  const { user, household, membership, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household || !membership) {
    return { error: authError || "No household found" };
  }

  // Only owners can update household name
  if (membership.role !== "owner") {
    return { error: "Only the household owner can update the name" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("households")
    .update({ name })
    .eq("id", household.household_id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings");
  revalidatePath("/app");
  return { error: null };
}

// Delete account permanently
// Uses admin client with service role to delete user and cascade all data
export async function deleteAccount() {
  const { user, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  try {
    const adminClient = createAdminClient();

    // First, cancel any active Stripe subscription
    const { data: subscription } = await adminClient
      .from("subscriptions")
      .select("stripe_subscription_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (subscription?.stripe_subscription_id) {
      try {
        const { getStripe } = await import("@/lib/stripe/client");
        const stripe = getStripe();
        await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
      } catch (stripeError) {
        console.error("Failed to cancel Stripe subscription:", stripeError);
        // Continue with deletion even if Stripe cancellation fails
      }
    }

    // Delete the user using admin API
    // This will cascade delete all related data due to ON DELETE CASCADE
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(
      user.id
    );

    if (deleteError) {
      console.error("Failed to delete user:", deleteError);
      return { error: "Failed to delete account. Please contact support." };
    }

    return { error: null };
  } catch (error) {
    console.error("Account deletion error:", error);
    return { error: "Failed to delete account. Please try again." };
  }
}

// Dismiss a contextual hint
export async function dismissHint(hintId: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  // Get current dismissed hints
  const { data: settings } = await supabase
    .from("user_settings")
    .select("dismissed_hints")
    .eq("user_id", user.id)
    .maybeSingle();

  const currentHints = settings?.dismissed_hints || [];

  // Only add if not already dismissed
  if (!currentHints.includes(hintId)) {
    // Use upsert to ensure the row exists, creating it if necessary
    const { error } = await supabase
      .from("user_settings")
      .upsert(
        {
          user_id: user.id,
          dismissed_hints: [...currentHints, hintId],
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (error) {
      return { error: error.message };
    }
  }

  revalidatePath("/app");
  revalidatePath("/app/recipes");
  revalidatePath("/app/shop");
  revalidatePath("/app/pantry");
  // Also revalidate cook pages so wizard dismissal takes effect immediately
  revalidatePath("/app/recipes/[id]/cook", "page");

  return { error: null };
}

// Reset all dismissed hints (re-enable all hints)
export async function resetAllHints() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("user_settings")
    .update({ dismissed_hints: [] })
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app");
  revalidatePath("/app/recipes");
  revalidatePath("/app/shop");
  revalidatePath("/app/pantry");
  revalidatePath("/app/settings");

  return { error: null };
}

// Update show recipe sources preference (stored in preferences JSONB)
export async function updateShowRecipeSources(showRecipeSources: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  // Get current preferences
  const { data: settings } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  const currentPreferences = (settings?.preferences as Record<string, unknown>) || {};

  // Merge with new value under ui namespace
  const updatedPreferences = {
    ...currentPreferences,
    ui: {
      ...((currentPreferences.ui as Record<string, unknown>) || {}),
      showRecipeSources,
    },
  };

  const { error } = await supabase
    .from("user_settings")
    .update({ preferences: updatedPreferences })
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/shop");

  return { error: null };
}

// ============================================================================
// Cook Mode Settings
// ============================================================================

import type {
  CookModeSettings,
  CustomCookModePreset,
  MealTypeEmojiSettings,
  MealTypeCustomization,
  MealTypeKey,
  MealTypeSettings,
  PlannerViewSettings,
  RecipePreferences,
  RecipeExportPreferences,
  CalendarPreferences,
  UserSettingsPreferences,
} from "@/types/settings";
import {
  DEFAULT_COOK_MODE_SETTINGS,
  DEFAULT_MEAL_TYPE_EMOJIS,
  DEFAULT_MEAL_TYPE_SETTINGS,
  DEFAULT_PLANNER_VIEW_SETTINGS,
  DEFAULT_RECIPE_PREFERENCES,
  DEFAULT_RECIPE_EXPORT_PREFERENCES,
  DEFAULT_CALENDAR_PREFERENCES,
  DifficultyThresholds,
  DEFAULT_DIFFICULTY_THRESHOLDS,
} from "@/types/settings";

/**
 * Get cook mode settings from the preferences JSONB column
 */
export async function getCookModeSettings(): Promise<{
  error: string | null;
  data: CookModeSettings;
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    // Return defaults for non-authenticated users
    return { error: null, data: DEFAULT_COOK_MODE_SETTINGS };
  }

  const { data: settings } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!settings?.preferences) {
    return { error: null, data: DEFAULT_COOK_MODE_SETTINGS };
  }

  const preferences = settings.preferences as UserSettingsPreferences;
  const cookMode = preferences.cookMode;

  if (!cookMode) {
    return { error: null, data: DEFAULT_COOK_MODE_SETTINGS };
  }

  // Deep merge with defaults to ensure all fields exist
  return {
    error: null,
    data: {
      display: {
        ...DEFAULT_COOK_MODE_SETTINGS.display,
        ...cookMode.display,
      },
      visibility: {
        ...DEFAULT_COOK_MODE_SETTINGS.visibility,
        ...cookMode.visibility,
      },
      behavior: {
        ...DEFAULT_COOK_MODE_SETTINGS.behavior,
        ...cookMode.behavior,
      },
      navigation: {
        ...DEFAULT_COOK_MODE_SETTINGS.navigation,
        ...cookMode.navigation,
      },
      voice: {
        ...DEFAULT_COOK_MODE_SETTINGS.voice,
        ...cookMode.voice,
      },
      gestures: {
        ...DEFAULT_COOK_MODE_SETTINGS.gestures,
        ...cookMode.gestures,
      },
      audio: {
        ...DEFAULT_COOK_MODE_SETTINGS.audio,
        ...cookMode.audio,
      },
      timers: {
        ...DEFAULT_COOK_MODE_SETTINGS.timers,
        ...cookMode.timers,
      },
    },
  };
}

/**
 * Update cook mode settings in the preferences JSONB column
 * Supports partial updates - only the fields provided will be updated
 */
export async function updateCookModeSettings(
  newSettings: Partial<CookModeSettings>
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  // Get existing preferences
  const { data: existingData } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  const existingPreferences = (existingData?.preferences ||
    {}) as UserSettingsPreferences;
  const existingCookMode =
    existingPreferences.cookMode || DEFAULT_COOK_MODE_SETTINGS;

  // Deep merge the new settings with existing
  const updatedCookMode: CookModeSettings = {
    display: {
      ...existingCookMode.display,
      ...(newSettings.display || {}),
    },
    visibility: {
      ...existingCookMode.visibility,
      ...(newSettings.visibility || {}),
    },
    behavior: {
      ...existingCookMode.behavior,
      ...(newSettings.behavior || {}),
    },
    navigation: {
      ...existingCookMode.navigation,
      ...(newSettings.navigation || {}),
    },
    voice: {
      ...existingCookMode.voice,
      ...(newSettings.voice || {}),
    },
    gestures: {
      ...existingCookMode.gestures,
      ...(newSettings.gestures || {}),
    },
    audio: {
      ...existingCookMode.audio,
      ...(newSettings.audio || {}),
    },
    timers: {
      ...existingCookMode.timers,
      ...(newSettings.timers || {}),
    },
  };

  // Update the preferences JSONB with the new cook mode settings
  const updatedPreferences: UserSettingsPreferences = {
    ...existingPreferences,
    cookMode: updatedCookMode,
  };

  const { error } = await supabase
    .from("user_settings")
    .update({ preferences: updatedPreferences })
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

// ============================================================================
// Meal Type Emoji Settings
// ============================================================================

/**
 * Get meal type emoji settings from the preferences JSONB column
 */
export async function getMealTypeEmojiSettings(): Promise<{
  error: string | null;
  data: MealTypeEmojiSettings;
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    // Return defaults for non-authenticated users
    return { error: null, data: DEFAULT_MEAL_TYPE_EMOJIS };
  }

  const { data: settings } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!settings?.preferences) {
    return { error: null, data: DEFAULT_MEAL_TYPE_EMOJIS };
  }

  const preferences = settings.preferences as UserSettingsPreferences;
  const mealTypeEmojis = preferences.mealTypeEmojis;

  if (!mealTypeEmojis) {
    return { error: null, data: DEFAULT_MEAL_TYPE_EMOJIS };
  }

  // Merge with defaults to ensure all fields exist
  return {
    error: null,
    data: {
      ...DEFAULT_MEAL_TYPE_EMOJIS,
      ...mealTypeEmojis,
    },
  };
}

/**
 * Update meal type emoji settings in the preferences JSONB column
 * Supports partial updates - only the fields provided will be updated
 */
export async function updateMealTypeEmojiSettings(
  newSettings: Partial<MealTypeEmojiSettings>
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  // Get existing preferences
  const { data: existingData } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  const existingPreferences = (existingData?.preferences ||
    {}) as UserSettingsPreferences;
  const existingEmojis =
    existingPreferences.mealTypeEmojis || DEFAULT_MEAL_TYPE_EMOJIS;

  // Merge the new settings with existing
  const updatedEmojis: MealTypeEmojiSettings = {
    ...existingEmojis,
    ...newSettings,
  };

  // Update the preferences JSONB with the new meal type emoji settings
  const updatedPreferences: UserSettingsPreferences = {
    ...existingPreferences,
    mealTypeEmojis: updatedEmojis,
  };

  const { error } = await supabase
    .from("user_settings")
    .update({ preferences: updatedPreferences })
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  // Revalidate meal planner paths
  revalidatePath("/app/plan");
  revalidatePath("/app/settings");

  return { error: null };
}

// ============================================================================
// Meal Type Customization (Full Settings: Emoji, Color, Calendar Time)
// ============================================================================

/**
 * Helper to migrate from old emoji-only format to new full format
 */
function migrateToFullSettings(
  oldEmojis: MealTypeEmojiSettings | undefined,
  newSettings: MealTypeCustomization | undefined
): MealTypeCustomization {
  // If new settings exist, use them
  if (newSettings) {
    // Merge with defaults to ensure all fields exist
    const result: MealTypeCustomization = { ...DEFAULT_MEAL_TYPE_SETTINGS };
    for (const key of Object.keys(DEFAULT_MEAL_TYPE_SETTINGS) as MealTypeKey[]) {
      if (newSettings[key]) {
        result[key] = {
          ...DEFAULT_MEAL_TYPE_SETTINGS[key],
          ...newSettings[key],
        };
      }
    }
    return result;
  }

  // If only old emoji settings exist, migrate them
  if (oldEmojis) {
    const result: MealTypeCustomization = { ...DEFAULT_MEAL_TYPE_SETTINGS };
    for (const key of Object.keys(DEFAULT_MEAL_TYPE_SETTINGS) as MealTypeKey[]) {
      result[key] = {
        ...DEFAULT_MEAL_TYPE_SETTINGS[key],
        emoji: oldEmojis[key] ?? DEFAULT_MEAL_TYPE_SETTINGS[key].emoji,
      };
    }
    return result;
  }

  // Return defaults
  return DEFAULT_MEAL_TYPE_SETTINGS;
}

/**
 * Get full meal type customization settings (emoji, color, calendar time)
 * Automatically migrates from old emoji-only format
 */
export async function getMealTypeCustomization(): Promise<{
  error: string | null;
  data: MealTypeCustomization;
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: null, data: DEFAULT_MEAL_TYPE_SETTINGS };
  }

  const { data: settings } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!settings?.preferences) {
    return { error: null, data: DEFAULT_MEAL_TYPE_SETTINGS };
  }

  const preferences = settings.preferences as UserSettingsPreferences;
  const migrated = migrateToFullSettings(
    preferences.mealTypeEmojis,
    preferences.mealTypeSettings
  );

  return { error: null, data: migrated };
}

/**
 * Update a single meal type's settings
 */
export async function updateMealTypeSetting(
  mealType: MealTypeKey,
  updates: Partial<MealTypeSettings>
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  // Get existing preferences
  const { data: existingData } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  const existingPreferences = (existingData?.preferences || {}) as UserSettingsPreferences;
  const existingSettings = migrateToFullSettings(
    existingPreferences.mealTypeEmojis,
    existingPreferences.mealTypeSettings
  );

  // Update the specific meal type
  const updatedSettings: MealTypeCustomization = {
    ...existingSettings,
    [mealType]: {
      ...existingSettings[mealType],
      ...updates,
    },
  };

  // Update preferences (keep mealTypeEmojis for backward compatibility)
  const updatedPreferences: UserSettingsPreferences = {
    ...existingPreferences,
    mealTypeSettings: updatedSettings,
  };

  const { error } = await supabase
    .from("user_settings")
    .update({ preferences: updatedPreferences })
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app");
  revalidatePath("/app/settings");

  return { error: null };
}

/**
 * Update all meal type settings at once
 */
export async function updateMealTypeCustomization(
  updates: Partial<MealTypeCustomization>
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  // Get existing preferences
  const { data: existingData } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  const existingPreferences = (existingData?.preferences || {}) as UserSettingsPreferences;
  const existingSettings = migrateToFullSettings(
    existingPreferences.mealTypeEmojis,
    existingPreferences.mealTypeSettings
  );

  // Merge updates
  const updatedSettings: MealTypeCustomization = { ...existingSettings };
  for (const key of Object.keys(updates) as MealTypeKey[]) {
    if (updates[key]) {
      updatedSettings[key] = {
        ...existingSettings[key],
        ...updates[key],
      };
    }
  }

  // Update preferences
  const updatedPreferences: UserSettingsPreferences = {
    ...existingPreferences,
    mealTypeSettings: updatedSettings,
  };

  const { error } = await supabase
    .from("user_settings")
    .update({ preferences: updatedPreferences })
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app");
  revalidatePath("/app/settings");

  return { error: null };
}

/**
 * Reset all meal type settings to defaults
 */
export async function resetMealTypeCustomization(): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  // Get existing preferences
  const { data: existingData } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  const existingPreferences = (existingData?.preferences || {}) as UserSettingsPreferences;

  // Reset to defaults and remove old emoji-only settings
  const updatedPreferences: UserSettingsPreferences = {
    ...existingPreferences,
    mealTypeSettings: DEFAULT_MEAL_TYPE_SETTINGS,
    mealTypeEmojis: undefined, // Clean up old format
  };

  const { error } = await supabase
    .from("user_settings")
    .update({ preferences: updatedPreferences })
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app");
  revalidatePath("/app/settings");

  return { error: null };
}

// ============================================================================
// Planner View Settings
// ============================================================================

/**
 * Get planner view settings from the preferences JSONB column
 */
export async function getPlannerViewSettings(): Promise<{
  error: string | null;
  data: PlannerViewSettings;
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    // Return defaults for non-authenticated users
    return { error: null, data: DEFAULT_PLANNER_VIEW_SETTINGS };
  }

  const { data: settings } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!settings?.preferences) {
    return { error: null, data: DEFAULT_PLANNER_VIEW_SETTINGS };
  }

  const preferences = settings.preferences as UserSettingsPreferences;
  const plannerView = preferences.plannerView;

  if (!plannerView) {
    return { error: null, data: DEFAULT_PLANNER_VIEW_SETTINGS };
  }

  // Merge with defaults to ensure all fields exist
  return {
    error: null,
    data: {
      ...DEFAULT_PLANNER_VIEW_SETTINGS,
      ...plannerView,
    },
  };
}

/**
 * Update planner view settings in the preferences JSONB column
 * Supports partial updates - only the fields provided will be updated
 */
export async function updatePlannerViewSettings(
  newSettings: Partial<PlannerViewSettings>
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  // Get existing preferences
  const { data: existingData } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  const existingPreferences = (existingData?.preferences ||
    {}) as UserSettingsPreferences;
  const existingPlannerView =
    existingPreferences.plannerView || DEFAULT_PLANNER_VIEW_SETTINGS;

  // Merge the new settings with existing
  const updatedPlannerView: PlannerViewSettings = {
    ...existingPlannerView,
    ...newSettings,
  };

  // Update the preferences JSONB with the new planner view settings
  const updatedPreferences: UserSettingsPreferences = {
    ...existingPreferences,
    plannerView: updatedPlannerView,
  };

  const { error } = await supabase
    .from("user_settings")
    .update({ preferences: updatedPreferences })
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  // Revalidate meal planner paths
  revalidatePath("/app");
  revalidatePath("/app/settings");

  return { error: null };
}

/**
 * Reset planner view settings to defaults
 */
export async function resetPlannerViewSettings(): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  // Get existing preferences
  const { data: existingData } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  const existingPreferences = (existingData?.preferences || {}) as UserSettingsPreferences;

  // Reset to defaults
  const updatedPreferences: UserSettingsPreferences = {
    ...existingPreferences,
    plannerView: DEFAULT_PLANNER_VIEW_SETTINGS,
  };

  const { error } = await supabase
    .from("user_settings")
    .update({ preferences: updatedPreferences })
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app");
  revalidatePath("/app/settings");

  return { error: null };
}

// ============================================================================
// Recipe Preferences (Default Serving Size)
// ============================================================================

/**
 * Get recipe preferences from the preferences JSONB column
 */
export async function getRecipePreferences(): Promise<{
  error: string | null;
  data: RecipePreferences;
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    // Return defaults for non-authenticated users
    return { error: null, data: DEFAULT_RECIPE_PREFERENCES };
  }

  const { data: settings } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!settings?.preferences) {
    return { error: null, data: DEFAULT_RECIPE_PREFERENCES };
  }

  const preferences = settings.preferences as UserSettingsPreferences;
  const recipe = preferences.recipe;

  if (!recipe) {
    return { error: null, data: DEFAULT_RECIPE_PREFERENCES };
  }

  // Merge with defaults to ensure all fields exist
  return {
    error: null,
    data: {
      ...DEFAULT_RECIPE_PREFERENCES,
      ...recipe,
    },
  };
}

/**
 * Update recipe preferences in the preferences JSONB column
 * Supports partial updates - only the fields provided will be updated
 */
export async function updateRecipePreferences(
  newSettings: Partial<RecipePreferences>
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  // Get existing preferences
  const { data: existingData } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  const existingPreferences = (existingData?.preferences ||
    {}) as UserSettingsPreferences;
  const existingRecipe =
    existingPreferences.recipe || DEFAULT_RECIPE_PREFERENCES;

  // Merge the new settings with existing
  const updatedRecipe: RecipePreferences = {
    ...existingRecipe,
    ...newSettings,
  };

  // Update the preferences JSONB with the new recipe settings
  const updatedPreferences: UserSettingsPreferences = {
    ...existingPreferences,
    recipe: updatedRecipe,
  };

  const { error } = await supabase
    .from("user_settings")
    .update({ preferences: updatedPreferences })
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app");
  revalidatePath("/app/settings");

  return { error: null };
}

// ============================================================================
// Recipe Export Preferences
// ============================================================================

/**
 * Get recipe export preferences from the preferences JSONB column
 */
export async function getRecipeExportPreferences(): Promise<{
  error: string | null;
  data: RecipeExportPreferences;
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    // Return defaults for non-authenticated users
    return { error: null, data: DEFAULT_RECIPE_EXPORT_PREFERENCES };
  }

  const { data: settings } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!settings?.preferences) {
    return { error: null, data: DEFAULT_RECIPE_EXPORT_PREFERENCES };
  }

  const preferences = settings.preferences as UserSettingsPreferences;
  const recipeExport = preferences.recipeExport;

  if (!recipeExport) {
    return { error: null, data: DEFAULT_RECIPE_EXPORT_PREFERENCES };
  }

  // Merge with defaults to ensure all fields exist
  return {
    error: null,
    data: {
      ...DEFAULT_RECIPE_EXPORT_PREFERENCES,
      ...recipeExport,
    },
  };
}

/**
 * Update recipe export preferences in the preferences JSONB column
 * Supports partial updates - only the fields provided will be updated
 */
export async function updateRecipeExportPreferences(
  newSettings: Partial<RecipeExportPreferences>
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  // Get existing preferences
  const { data: existingData } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  const existingPreferences = (existingData?.preferences ||
    {}) as UserSettingsPreferences;
  const existingRecipeExport =
    existingPreferences.recipeExport || DEFAULT_RECIPE_EXPORT_PREFERENCES;

  // Merge the new settings with existing
  const updatedRecipeExport: RecipeExportPreferences = {
    ...existingRecipeExport,
    ...newSettings,
  };

  // Update the preferences JSONB with the new recipe export settings
  const updatedPreferences: UserSettingsPreferences = {
    ...existingPreferences,
    recipeExport: updatedRecipeExport,
  };

  const { error } = await supabase
    .from("user_settings")
    .update({ preferences: updatedPreferences })
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app");
  revalidatePath("/app/settings");

  return { error: null };
}

// ============================================================================
// Custom Cook Mode Preset Actions
// ============================================================================

/**
 * Get all custom cook mode presets for the current user
 */
export async function getCustomCookModePresets(): Promise<{
  error: string | null;
  data: CustomCookModePreset[];
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: null, data: [] };
  }

  const { data: settings } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!settings?.preferences) {
    return { error: null, data: [] };
  }

  const preferences = settings.preferences as UserSettingsPreferences;
  const presets = preferences.cookModePresets || [];

  return { error: null, data: presets };
}

/**
 * Save a new custom cook mode preset
 */
export async function saveCustomCookModePreset(
  preset: Omit<CustomCookModePreset, "id" | "createdAt">
): Promise<{
  error: string | null;
  data: CustomCookModePreset | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated", data: null };
  }

  // Get existing preferences
  const { data: existingData } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  const existingPreferences = (existingData?.preferences || {}) as UserSettingsPreferences;
  const existingPresets = existingPreferences.cookModePresets || [];

  // Create new preset with id and timestamp
  const newPreset: CustomCookModePreset = {
    ...preset,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  // Append to existing presets
  const updatedPresets = [...existingPresets, newPreset];

  // Update preferences
  const updatedPreferences: UserSettingsPreferences = {
    ...existingPreferences,
    cookModePresets: updatedPresets,
  };

  const { error } = await supabase
    .from("user_settings")
    .update({ preferences: updatedPreferences })
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message, data: null };
  }

  revalidatePath("/app/settings");

  return { error: null, data: newPreset };
}

/**
 * Update an existing custom cook mode preset
 */
export async function updateCustomCookModePreset(
  id: string,
  updates: Partial<Omit<CustomCookModePreset, "id" | "createdAt">>
): Promise<{
  error: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  // Get existing preferences
  const { data: existingData } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  const existingPreferences = (existingData?.preferences || {}) as UserSettingsPreferences;
  const existingPresets = existingPreferences.cookModePresets || [];

  // Find and update the preset
  const presetIndex = existingPresets.findIndex((p) => p.id === id);
  if (presetIndex === -1) {
    return { error: "Preset not found" };
  }

  const updatedPresets = [...existingPresets];
  updatedPresets[presetIndex] = {
    ...updatedPresets[presetIndex],
    ...updates,
  };

  // Update preferences
  const updatedPreferences: UserSettingsPreferences = {
    ...existingPreferences,
    cookModePresets: updatedPresets,
  };

  const { error } = await supabase
    .from("user_settings")
    .update({ preferences: updatedPreferences })
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings");

  return { error: null };
}

/**
 * Delete a custom cook mode preset
 */
export async function deleteCustomCookModePreset(
  id: string
): Promise<{
  error: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  // Get existing preferences
  const { data: existingData } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  const existingPreferences = (existingData?.preferences || {}) as UserSettingsPreferences;
  const existingPresets = existingPreferences.cookModePresets || [];

  // Filter out the preset
  const updatedPresets = existingPresets.filter((p) => p.id !== id);

  // Update preferences
  const updatedPreferences: UserSettingsPreferences = {
    ...existingPreferences,
    cookModePresets: updatedPresets,
  };

  const { error } = await supabase
    .from("user_settings")
    .update({ preferences: updatedPreferences })
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings");

  return { error: null };
}

/**
 * Set a preset as the default (unset any previous default)
 */
export async function setDefaultCookModePreset(
  id: string | null  // null to clear default
): Promise<{
  error: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  // Get existing preferences
  const { data: existingData } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  const existingPreferences = (existingData?.preferences || {}) as UserSettingsPreferences;
  const existingPresets = existingPreferences.cookModePresets || [];

  // Update all presets to set isDefault accordingly
  const updatedPresets = existingPresets.map((p) => ({
    ...p,
    isDefault: id === null ? false : p.id === id,
  }));

  // If setting a default, verify the preset exists
  if (id !== null && !updatedPresets.some((p) => p.id === id)) {
    return { error: "Preset not found" };
  }

  // Update preferences
  const updatedPreferences: UserSettingsPreferences = {
    ...existingPreferences,
    cookModePresets: updatedPresets,
  };

  const { error } = await supabase
    .from("user_settings")
    .update({ preferences: updatedPreferences })
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings");

  return { error: null };
}

/**
 * Duplicate an existing preset with a new name
 */
export async function duplicateCookModePreset(
  id: string,
  newName: string
): Promise<{
  error: string | null;
  data: CustomCookModePreset | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated", data: null };
  }

  // Get existing preferences
  const { data: existingData } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  const existingPreferences = (existingData?.preferences || {}) as UserSettingsPreferences;
  const existingPresets = existingPreferences.cookModePresets || [];

  // Find the preset to duplicate
  const presetToDuplicate = existingPresets.find((p) => p.id === id);
  if (!presetToDuplicate) {
    return { error: "Preset not found", data: null };
  }

  // Create duplicate with new id, name, and createdAt
  const duplicatedPreset: CustomCookModePreset = {
    ...presetToDuplicate,
    id: crypto.randomUUID(),
    name: newName,
    createdAt: new Date().toISOString(),
    isDefault: false, // Duplicates are never default
  };

  // Append to existing presets
  const updatedPresets = [...existingPresets, duplicatedPreset];

  // Update preferences
  const updatedPreferences: UserSettingsPreferences = {
    ...existingPreferences,
    cookModePresets: updatedPresets,
  };

  const { error } = await supabase
    .from("user_settings")
    .update({ preferences: updatedPreferences })
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message, data: null };
  }

  revalidatePath("/app/settings");

  return { error: null, data: duplicatedPreset };
}

// ============================================================================
// Calendar Preferences
// ============================================================================

/**
 * Get calendar preferences from the preferences JSONB column
 */
export async function getCalendarPreferences(): Promise<{
  error: string | null;
  data: CalendarPreferences;
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: null, data: DEFAULT_CALENDAR_PREFERENCES };
  }

  const { data: settings } = await supabase
    .from("user_settings")
    .select("preferences, calendar_event_time, calendar_event_duration_minutes, calendar_excluded_days")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!settings?.preferences) {
    // Fallback to column values during migration period
    return {
      error: null,
      data: {
        eventTime: settings?.calendar_event_time || DEFAULT_CALENDAR_PREFERENCES.eventTime,
        eventDurationMinutes: settings?.calendar_event_duration_minutes || DEFAULT_CALENDAR_PREFERENCES.eventDurationMinutes,
        excludedDays: settings?.calendar_excluded_days || DEFAULT_CALENDAR_PREFERENCES.excludedDays,
      },
    };
  }

  const preferences = settings.preferences as UserSettingsPreferences;
  const calendar = preferences.calendar;

  if (!calendar) {
    // Fallback to column values during migration period
    return {
      error: null,
      data: {
        eventTime: settings?.calendar_event_time || DEFAULT_CALENDAR_PREFERENCES.eventTime,
        eventDurationMinutes: settings?.calendar_event_duration_minutes || DEFAULT_CALENDAR_PREFERENCES.eventDurationMinutes,
        excludedDays: settings?.calendar_excluded_days || DEFAULT_CALENDAR_PREFERENCES.excludedDays,
      },
    };
  }

  return {
    error: null,
    data: {
      ...DEFAULT_CALENDAR_PREFERENCES,
      ...calendar,
    },
  };
}

/**
 * Update calendar preferences in the preferences JSONB column
 */
export async function updateCalendarPreferences(
  newSettings: Partial<CalendarPreferences>
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  // Get existing preferences
  const { data: existingData } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  const existingPreferences = (existingData?.preferences || {}) as UserSettingsPreferences;
  const existingCalendar = existingPreferences.calendar || DEFAULT_CALENDAR_PREFERENCES;

  // Merge new settings with existing
  const updatedCalendar: CalendarPreferences = {
    ...existingCalendar,
    ...newSettings,
  };

  // Update the preferences JSONB with the new calendar settings
  const updatedPreferences: UserSettingsPreferences = {
    ...existingPreferences,
    calendar: updatedCalendar,
  };

  const { error } = await supabase
    .from("user_settings")
    .update({ preferences: updatedPreferences })
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app");
  revalidatePath("/app/settings");

  return { error: null };
}

// ============================================================================
// Custom Dietary Restrictions
// ============================================================================

/**
 * Add a custom dietary restriction to the user's settings
 */
export async function addCustomDietaryRestriction(
  restriction: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  // Validate input
  const trimmed = restriction.trim();
  if (!trimmed) {
    return { error: "Restriction cannot be empty" };
  }

  // Get current restrictions
  const { data: settings } = await supabase
    .from("user_settings")
    .select("custom_dietary_restrictions")
    .eq("user_id", user.id)
    .maybeSingle();

  const current = settings?.custom_dietary_restrictions || [];

  // Check for duplicates (case-insensitive)
  if (current.some((r: string) => r.toLowerCase() === trimmed.toLowerCase())) {
    return { error: "This restriction already exists" };
  }

  const updated = [...current, trimmed];

  const { error } = await supabase
    .from("user_settings")
    .update({ custom_dietary_restrictions: updated })
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings");
  revalidatePath("/app/settings/dietary");

  return { error: null };
}

/**
 * Remove a custom dietary restriction from the user's settings
 */
export async function removeCustomDietaryRestriction(
  restriction: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  const { data: settings } = await supabase
    .from("user_settings")
    .select("custom_dietary_restrictions")
    .eq("user_id", user.id)
    .maybeSingle();

  const current = settings?.custom_dietary_restrictions || [];
  const updated = current.filter((r: string) => r !== restriction);

  const { error } = await supabase
    .from("user_settings")
    .update({ custom_dietary_restrictions: updated })
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings");
  revalidatePath("/app/settings/dietary");

  return { error: null };
}

// ============================================================================
// Difficulty Thresholds Settings
// ============================================================================

/**
 * Get difficulty thresholds from the preferences JSONB column
 */
export async function getDifficultyThresholds(): Promise<{
  error: string | null;
  data: DifficultyThresholds;
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    // Return defaults for non-authenticated users
    return { error: null, data: DEFAULT_DIFFICULTY_THRESHOLDS };
  }

  const { data: settings } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!settings?.preferences) {
    return { error: null, data: DEFAULT_DIFFICULTY_THRESHOLDS };
  }

  const preferences = settings.preferences as UserSettingsPreferences;
  const thresholds = preferences.difficultyThresholds;

  if (!thresholds) {
    return { error: null, data: DEFAULT_DIFFICULTY_THRESHOLDS };
  }

  // Merge with defaults to ensure all fields exist
  return {
    error: null,
    data: {
      time: { ...DEFAULT_DIFFICULTY_THRESHOLDS.time, ...thresholds.time },
      ingredients: { ...DEFAULT_DIFFICULTY_THRESHOLDS.ingredients, ...thresholds.ingredients },
      steps: { ...DEFAULT_DIFFICULTY_THRESHOLDS.steps, ...thresholds.steps },
    },
  };
}

/**
 * Update difficulty thresholds in the preferences JSONB column
 */
export async function updateDifficultyThresholds(
  newThresholds: Partial<DifficultyThresholds>
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  // Get existing preferences
  const { data: existingData } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  const existingPreferences = (existingData?.preferences ||
    {}) as UserSettingsPreferences;
  const existingThresholds =
    existingPreferences.difficultyThresholds || DEFAULT_DIFFICULTY_THRESHOLDS;

  // Deep merge the new thresholds with existing
  const updatedThresholds: DifficultyThresholds = {
    time: { ...existingThresholds.time, ...newThresholds.time },
    ingredients: { ...existingThresholds.ingredients, ...newThresholds.ingredients },
    steps: { ...existingThresholds.steps, ...newThresholds.steps },
  };

  const updatedPreferences: UserSettingsPreferences = {
    ...existingPreferences,
    difficultyThresholds: updatedThresholds,
  };

  const { error } = await supabase
    .from("user_settings")
    .update({ preferences: updatedPreferences })
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings");
  revalidatePath("/app/settings/difficulty");
  revalidatePath("/app/recipes");

  return { error: null };
}

/**
 * Reset difficulty thresholds to defaults
 */
export async function resetDifficultyThresholds(): Promise<{ error: string | null }> {
  return updateDifficultyThresholds(DEFAULT_DIFFICULTY_THRESHOLDS);
}
