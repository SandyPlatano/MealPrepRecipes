"use server";

/**
 * Recipe Settings Actions
 *
 * Actions for managing recipe preferences and export settings.
 */

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  RecipePreferences,
  RecipeExportPreferences,
  UserSettingsPreferences,
} from "@/types/settings";
import {
  DEFAULT_RECIPE_PREFERENCES,
  DEFAULT_RECIPE_EXPORT_PREFERENCES,
} from "@/types/settings";

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

  return {
    error: null,
    data: { ...DEFAULT_RECIPE_PREFERENCES, ...recipe },
  };
}

/**
 * Update recipe preferences in the preferences JSONB column
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

  const { data: existingData } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  const existingPreferences = (existingData?.preferences || {}) as UserSettingsPreferences;
  const existingRecipe = existingPreferences.recipe || DEFAULT_RECIPE_PREFERENCES;

  const updatedRecipe: RecipePreferences = {
    ...existingRecipe,
    ...newSettings,
  };

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

  return {
    error: null,
    data: { ...DEFAULT_RECIPE_EXPORT_PREFERENCES, ...recipeExport },
  };
}

/**
 * Update recipe export preferences in the preferences JSONB column
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

  const { data: existingData } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  const existingPreferences = (existingData?.preferences || {}) as UserSettingsPreferences;
  const existingRecipeExport =
    existingPreferences.recipeExport || DEFAULT_RECIPE_EXPORT_PREFERENCES;

  const updatedRecipeExport: RecipeExportPreferences = {
    ...existingRecipeExport,
    ...newSettings,
  };

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

/**
 * Update show recipe sources preference (stored in preferences JSONB)
 */
export async function updateShowRecipeSources(showRecipeSources: boolean) {
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
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  const currentPreferences = (settings?.preferences as Record<string, unknown>) || {};

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
