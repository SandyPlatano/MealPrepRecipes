"use server";

/**
 * Difficulty Threshold Settings Actions
 *
 * Actions for managing recipe difficulty thresholds.
 */

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { UserSettingsPreferences } from "@/types/settings";
import { DifficultyThresholds, DEFAULT_DIFFICULTY_THRESHOLDS } from "@/types/settings";

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

  const { data: existingData } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  const existingPreferences = (existingData?.preferences || {}) as UserSettingsPreferences;
  const existingThresholds =
    existingPreferences.difficultyThresholds || DEFAULT_DIFFICULTY_THRESHOLDS;

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
