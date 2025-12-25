"use server";

/**
 * Default Cooks by Day Settings Actions
 *
 * Actions for managing default cook assignments per day of week.
 */

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { DefaultCooksByDay, UserSettingsPreferences } from "@/types/settings";
import { DEFAULT_COOKS_BY_DAY } from "@/types/settings";
import type { DayOfWeek } from "@/types/meal-plan";

/**
 * Get default cook assignments per day of week from the preferences JSONB column
 */
export async function getDefaultCooksByDay(): Promise<{
  error: string | null;
  data: DefaultCooksByDay;
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: null, data: DEFAULT_COOKS_BY_DAY };
  }

  const { data: settings } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!settings?.preferences) {
    return { error: null, data: DEFAULT_COOKS_BY_DAY };
  }

  const preferences = settings.preferences as UserSettingsPreferences;
  const defaultCooksByDay = preferences.defaultCooksByDay;

  if (!defaultCooksByDay) {
    return { error: null, data: DEFAULT_COOKS_BY_DAY };
  }

  return { error: null, data: defaultCooksByDay };
}

/**
 * Update default cook assignments per day in the preferences JSONB column
 */
export async function updateDefaultCooksByDay(
  newSettings: DefaultCooksByDay
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
  const existingCooks = existingPreferences.defaultCooksByDay || DEFAULT_COOKS_BY_DAY;

  const updatedCooks: DefaultCooksByDay = {
    ...existingCooks,
    ...newSettings,
  };

  const updatedPreferences: UserSettingsPreferences = {
    ...existingPreferences,
    defaultCooksByDay: updatedCooks,
  };

  const { error } = await supabase
    .from("user_settings")
    .update({ preferences: updatedPreferences })
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app");
  revalidatePath("/app/plan");
  revalidatePath("/app/settings");
  return { error: null };
}

/**
 * Set default cook for a specific day of the week
 */
export async function setDefaultCookForDay(
  day: DayOfWeek,
  cook: string | null
): Promise<{ error: string | null }> {
  return updateDefaultCooksByDay({ [day]: cook });
}

/**
 * Reset all default cook assignments to empty
 */
export async function resetDefaultCooksByDay(): Promise<{ error: string | null }> {
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
    defaultCooksByDay: DEFAULT_COOKS_BY_DAY,
  };

  const { error } = await supabase
    .from("user_settings")
    .update({ preferences: updatedPreferences })
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app");
  revalidatePath("/app/plan");
  revalidatePath("/app/settings");
  return { error: null };
}
