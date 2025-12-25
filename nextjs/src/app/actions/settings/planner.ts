"use server";

/**
 * Planner View Settings Actions
 *
 * Actions for managing planner/meal plan view preferences.
 */

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { PlannerViewSettings, UserSettingsPreferences } from "@/types/settings";
import { DEFAULT_PLANNER_VIEW_SETTINGS } from "@/types/settings";

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

  return {
    error: null,
    data: { ...DEFAULT_PLANNER_VIEW_SETTINGS, ...plannerView },
  };
}

/**
 * Update planner view settings in the preferences JSONB column
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

  const { data: existingData } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  const existingPreferences = (existingData?.preferences || {}) as UserSettingsPreferences;
  const existingPlannerView =
    existingPreferences.plannerView || DEFAULT_PLANNER_VIEW_SETTINGS;

  const updatedPlannerView: PlannerViewSettings = {
    ...existingPlannerView,
    ...newSettings,
  };

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

  const { data: existingData } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  const existingPreferences = (existingData?.preferences || {}) as UserSettingsPreferences;

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
