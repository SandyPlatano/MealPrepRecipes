"use server";

/**
 * Core User Settings Actions
 *
 * Actions for managing base user settings (getSettings, updateSettings).
 */

import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import { revalidatePath } from "next/cache";
import { invalidateCache, settingsKey } from "@/lib/cache/redis";
import type { UserSettings } from "@/types/settings";

// Default settings shape for when table/columns don't exist
const DEFAULT_SETTINGS = {
  id: "",
  user_id: "",
  dark_mode: false,
  cook_names: ["Me"],
  cook_colors: {} as Record<string, string>,
  email_notifications: true,
  allergen_alerts: [] as string[],
  custom_dietary_restrictions: [] as string[],
  category_order: null as string[] | null,
  calendar_event_time: null as string | null,
  calendar_event_duration_minutes: null as number | null,
  calendar_excluded_days: [] as string[],
  dismissed_hints: [] as string[],
  unit_system: "imperial" as const,
  preferences: {} as Record<string, unknown>,
  google_connected_account: null as string | null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

/**
 * Ensure array fields are never null
 */
function normalizeArrayFields<T extends Record<string, unknown>>(settings: T): T {
  const result = { ...settings };

  const arrayFields = [
    "allergen_alerts",
    "custom_dietary_restrictions",
    "calendar_excluded_days",
    "dismissed_hints",
    "cook_names",
  ];

  for (const field of arrayFields) {
    if (field in result && (!result[field] || !Array.isArray(result[field]))) {
      (result as Record<string, unknown>)[field] =
        field === "cook_names" ? ["Me"] : [];
    }
  }

  // Ensure other fields have defaults
  if (!result.unit_system) {
    (result as Record<string, unknown>).unit_system = "imperial";
  }
  if (!result.preferences) {
    (result as Record<string, unknown>).preferences = {};
  }
  if (result.email_notifications === undefined) {
    (result as Record<string, unknown>).email_notifications = true;
  }

  return result;
}

/**
 * Get user settings (from user_settings table, or create default)
 */
export async function getSettings(): Promise<{
  error: string | null;
  data: UserSettings | null;
}> {
  const { user } = await getCachedUserWithHousehold();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  // Try to get existing settings with explicit columns
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
      return { error: null, data: { ...DEFAULT_SETTINGS, user_id: user.id } as UserSettings };
    }

    settings = settingsWithoutEmail
      ? { ...settingsWithoutEmail, email_notifications: true }
      : null;
  } else if (selectError) {
    return { error: null, data: { ...DEFAULT_SETTINGS, user_id: user.id } as UserSettings };
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
      return { error: null, data: { ...DEFAULT_SETTINGS, user_id: user.id } as UserSettings };
    }
    settings = newSettings;
  }

  // At this point settings is guaranteed to be non-null
  if (!settings) {
    return { error: null, data: { ...DEFAULT_SETTINGS, user_id: user.id } as UserSettings };
  }
  return { error: null, data: normalizeArrayFields(settings) as unknown as UserSettings };
}

/**
 * Update user settings
 */
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
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  // Get existing settings to merge with new values
  const { data: existingSettings } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  // Prepare settings for save
  const settingsToSave: Record<string, unknown> = {
    user_id: user.id,
    updated_at: new Date().toISOString(),
    ...(existingSettings || {}),
  };

  // Override with new values that are explicitly provided
  if (settings.dark_mode !== undefined) settingsToSave.dark_mode = settings.dark_mode;
  if (settings.cook_names !== undefined)
    settingsToSave.cook_names = settings.cook_names || ["Me"];
  if (settings.cook_colors !== undefined) settingsToSave.cook_colors = settings.cook_colors;
  if (settings.email_notifications !== undefined)
    settingsToSave.email_notifications = settings.email_notifications;

  // Array fields - always ensure they're arrays
  if (settings.allergen_alerts !== undefined) {
    settingsToSave.allergen_alerts = Array.isArray(settings.allergen_alerts)
      ? settings.allergen_alerts
      : [];
  }
  if (settings.custom_dietary_restrictions !== undefined) {
    settingsToSave.custom_dietary_restrictions = Array.isArray(
      settings.custom_dietary_restrictions
    )
      ? settings.custom_dietary_restrictions
      : [];
  }
  if (settings.calendar_excluded_days !== undefined) {
    settingsToSave.calendar_excluded_days = Array.isArray(settings.calendar_excluded_days)
      ? settings.calendar_excluded_days
      : [];
  }

  if (settings.category_order !== undefined)
    settingsToSave.category_order = settings.category_order;
  if (settings.calendar_event_time !== undefined)
    settingsToSave.calendar_event_time = settings.calendar_event_time;
  if (settings.calendar_event_duration_minutes !== undefined)
    settingsToSave.calendar_event_duration_minutes = settings.calendar_event_duration_minutes;
  if (settings.unit_system !== undefined) settingsToSave.unit_system = settings.unit_system;

  // Ensure array fields are never null in the final object
  for (const field of [
    "allergen_alerts",
    "custom_dietary_restrictions",
    "calendar_excluded_days",
  ]) {
    if (!settingsToSave[field] || !Array.isArray(settingsToSave[field])) {
      settingsToSave[field] = [];
    }
  }

  const { error } = await supabase
    .from("user_settings")
    .upsert(settingsToSave, { onConflict: "user_id" })
    .select();

  if (error) {
    console.error("Error saving settings:", error);
    return { error: error.message };
  }

  // Invalidate Redis cache for settings
  await invalidateCache(settingsKey(user.id));

  revalidatePath("/app/settings");
  revalidatePath("/app");
  return { error: null };
}
