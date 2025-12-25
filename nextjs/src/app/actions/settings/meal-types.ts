"use server";

/**
 * Meal Type Settings Actions
 *
 * Actions for managing meal type emojis, colors, and customization.
 */

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  MealTypeEmojiSettings,
  MealTypeCustomization,
  MealTypeSettings,
  MealTypeKey,
  UserSettingsPreferences,
} from "@/types/settings";
import {
  DEFAULT_MEAL_TYPE_EMOJIS,
  DEFAULT_MEAL_TYPE_SETTINGS,
} from "@/types/settings";

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

  return {
    error: null,
    data: { ...DEFAULT_MEAL_TYPE_EMOJIS, ...mealTypeEmojis },
  };
}

/**
 * Update meal type emoji settings in the preferences JSONB column
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

  const { data: existingData } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  const existingPreferences = (existingData?.preferences || {}) as UserSettingsPreferences;
  const existingEmojis = existingPreferences.mealTypeEmojis || DEFAULT_MEAL_TYPE_EMOJIS;

  const updatedPreferences: UserSettingsPreferences = {
    ...existingPreferences,
    mealTypeEmojis: { ...existingEmojis, ...newSettings },
  };

  const { error } = await supabase
    .from("user_settings")
    .update({ preferences: updatedPreferences })
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/plan");
  revalidatePath("/app/settings");
  return { error: null };
}

// ============================================================================
// Full Meal Type Customization (Emoji, Color, Calendar Time)
// ============================================================================

/**
 * Helper to migrate from old emoji-only format to new full format
 */
function migrateToFullSettings(
  oldEmojis: MealTypeEmojiSettings | undefined,
  newSettings: MealTypeCustomization | undefined
): MealTypeCustomization {
  if (newSettings) {
    const result: MealTypeCustomization = { ...DEFAULT_MEAL_TYPE_SETTINGS };
    for (const key of Object.keys(DEFAULT_MEAL_TYPE_SETTINGS) as MealTypeKey[]) {
      if (newSettings[key]) {
        result[key] = { ...DEFAULT_MEAL_TYPE_SETTINGS[key], ...newSettings[key] };
      }
    }
    return result;
  }

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

  return DEFAULT_MEAL_TYPE_SETTINGS;
}

/**
 * Get full meal type customization settings (emoji, color, calendar time)
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

  const updatedSettings: MealTypeCustomization = {
    ...existingSettings,
    [mealType]: { ...existingSettings[mealType], ...updates },
  };

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

  const updatedSettings: MealTypeCustomization = { ...existingSettings };
  for (const key of Object.keys(updates) as MealTypeKey[]) {
    if (updates[key]) {
      updatedSettings[key] = { ...existingSettings[key], ...updates[key] };
    }
  }

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

  const { data: existingData } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  const existingPreferences = (existingData?.preferences || {}) as UserSettingsPreferences;

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
