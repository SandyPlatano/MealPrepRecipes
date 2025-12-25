"use server";

/**
 * Calendar Settings Actions
 *
 * Actions for managing calendar integration preferences.
 */

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { CalendarPreferences, UserSettingsPreferences } from "@/types/settings";
import { DEFAULT_CALENDAR_PREFERENCES } from "@/types/settings";

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
    .select(
      "preferences, calendar_event_time, calendar_event_duration_minutes, calendar_excluded_days"
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (!settings?.preferences) {
    // Fallback to column values during migration period
    return {
      error: null,
      data: {
        eventTime: settings?.calendar_event_time || DEFAULT_CALENDAR_PREFERENCES.eventTime,
        eventDurationMinutes:
          settings?.calendar_event_duration_minutes ||
          DEFAULT_CALENDAR_PREFERENCES.eventDurationMinutes,
        excludedDays:
          settings?.calendar_excluded_days || DEFAULT_CALENDAR_PREFERENCES.excludedDays,
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
        eventDurationMinutes:
          settings?.calendar_event_duration_minutes ||
          DEFAULT_CALENDAR_PREFERENCES.eventDurationMinutes,
        excludedDays:
          settings?.calendar_excluded_days || DEFAULT_CALENDAR_PREFERENCES.excludedDays,
      },
    };
  }

  return {
    error: null,
    data: { ...DEFAULT_CALENDAR_PREFERENCES, ...calendar },
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

  const { data: existingData } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  const existingPreferences = (existingData?.preferences || {}) as UserSettingsPreferences;
  const existingCalendar = existingPreferences.calendar || DEFAULT_CALENDAR_PREFERENCES;

  const updatedCalendar: CalendarPreferences = {
    ...existingCalendar,
    ...newSettings,
  };

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
