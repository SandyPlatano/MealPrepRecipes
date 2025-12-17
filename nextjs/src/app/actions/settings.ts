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
    .single();

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
      created_at,
      updated_at,
      email_notifications,
      unit_system,
      recipe_export_preferences
    `)
    .eq("user_id", user.id)
    .single();

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
        unit_system,
        preferences,
        recipe_export_preferences,
        created_at,
        updated_at
      `)
      .eq("user_id", user.id)
      .single();
    
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
  recipe_export_preferences?: {
    include_ingredients: boolean;
    include_instructions: boolean;
    include_nutrition: boolean;
    include_tags: boolean;
    include_times: boolean;
    include_notes: boolean;
    include_servings: boolean;
  };
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
    .single();

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
  if (settings.recipe_export_preferences !== undefined) {
    settingsToSave.recipe_export_preferences = settings.recipe_export_preferences;
  }

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
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError || "No household found", data: null };
  }

  const supabase = await createClient();
  
  // Get full household details
  const { data: householdDetails } = await supabase
    .from("households")
    .select("id, name, created_at")
    .eq("id", household.household_id)
    .single();

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
      role: household.role,
      members: members || [],
    },
  };
}

// Update household name
export async function updateHouseholdName(name: string) {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError || "No household found" };
  }

  // Only owners can update household name
  if (household.role !== "owner") {
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
      .single();

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
    .single();

  const currentHints = settings?.dismissed_hints || [];

  // Only add if not already dismissed
  if (!currentHints.includes(hintId)) {
    const { error } = await supabase
      .from("user_settings")
      .update({ dismissed_hints: [...currentHints, hintId] })
      .eq("user_id", user.id);

    if (error) {
      return { error: error.message };
    }
  }

  revalidatePath("/app");
  revalidatePath("/app/recipes");
  revalidatePath("/app/shop");
  revalidatePath("/app/pantry");

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
    .single();

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
  MealTypeEmojiSettings,
  UserSettingsPreferences,
} from "@/types/settings";
import { DEFAULT_COOK_MODE_SETTINGS, DEFAULT_MEAL_TYPE_EMOJIS } from "@/types/settings";

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
    .single();

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
    .single();

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
    .single();

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
    .single();

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
