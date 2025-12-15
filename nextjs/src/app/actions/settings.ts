"use server";

import { createClient } from "@/lib/supabase/server";
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
      // Keep name field updated for backwards compatibility
      name: `${firstName} ${lastName}`.trim(),
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
      created_at,
      updated_at,
      email_notifications
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
          google_connected_account: null as string | null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      };
    }
    
    // Add default email_notifications to the result
    settings = settingsWithoutEmail ? { ...settingsWithoutEmail, email_notifications: true } : null;
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
    if (!settings.cook_names || !Array.isArray(settings.cook_names)) {
      settings.cook_names = ["Me"];
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
        name,
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
export async function deleteAccount() {
  const { user, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

  try {
    // Delete the user's auth account
    // This will cascade delete all related data due to foreign key constraints
    const { error } = await supabase.auth.admin.deleteUser(user.id);

    if (error) {
      // If admin API not available, try RPC or direct deletion
      // The user's data will be deleted via CASCADE on auth.users deletion
      return { error: "Unable to delete account. Please contact support." };
    }

    return { error: null };
  } catch {
    return { error: "Failed to delete account. Please try again." };
  }
}

