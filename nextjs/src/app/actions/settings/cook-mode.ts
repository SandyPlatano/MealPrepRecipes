"use server";

/**
 * Cook Mode Settings Actions
 *
 * Actions for managing cook mode settings and custom presets.
 */

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  CookModeSettings,
  CustomCookModePreset,
  UserSettingsPreferences,
} from "@/types/settings";
import { DEFAULT_COOK_MODE_SETTINGS } from "@/types/settings";

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
      display: { ...DEFAULT_COOK_MODE_SETTINGS.display, ...cookMode.display },
      visibility: { ...DEFAULT_COOK_MODE_SETTINGS.visibility, ...cookMode.visibility },
      behavior: { ...DEFAULT_COOK_MODE_SETTINGS.behavior, ...cookMode.behavior },
      navigation: { ...DEFAULT_COOK_MODE_SETTINGS.navigation, ...cookMode.navigation },
      voice: { ...DEFAULT_COOK_MODE_SETTINGS.voice, ...cookMode.voice },
      gestures: { ...DEFAULT_COOK_MODE_SETTINGS.gestures, ...cookMode.gestures },
      audio: { ...DEFAULT_COOK_MODE_SETTINGS.audio, ...cookMode.audio },
      timers: { ...DEFAULT_COOK_MODE_SETTINGS.timers, ...cookMode.timers },
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

  const { data: existingData } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  const existingPreferences = (existingData?.preferences || {}) as UserSettingsPreferences;
  const existingCookMode = existingPreferences.cookMode || DEFAULT_COOK_MODE_SETTINGS;

  // Deep merge the new settings with existing
  const updatedCookMode: CookModeSettings = {
    display: { ...existingCookMode.display, ...(newSettings.display || {}) },
    visibility: { ...existingCookMode.visibility, ...(newSettings.visibility || {}) },
    behavior: { ...existingCookMode.behavior, ...(newSettings.behavior || {}) },
    navigation: { ...existingCookMode.navigation, ...(newSettings.navigation || {}) },
    voice: { ...existingCookMode.voice, ...(newSettings.voice || {}) },
    gestures: { ...existingCookMode.gestures, ...(newSettings.gestures || {}) },
    audio: { ...existingCookMode.audio, ...(newSettings.audio || {}) },
    timers: { ...existingCookMode.timers, ...(newSettings.timers || {}) },
  };

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
// Custom Cook Mode Presets
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
  return { error: null, data: preferences.cookModePresets || [] };
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

  const { data: existingData } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  const existingPreferences = (existingData?.preferences || {}) as UserSettingsPreferences;
  const existingPresets = existingPreferences.cookModePresets || [];

  const newPreset: CustomCookModePreset = {
    ...preset,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  const updatedPreferences: UserSettingsPreferences = {
    ...existingPreferences,
    cookModePresets: [...existingPresets, newPreset],
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
  const existingPresets = existingPreferences.cookModePresets || [];

  const presetIndex = existingPresets.findIndex((p) => p.id === id);
  if (presetIndex === -1) {
    return { error: "Preset not found" };
  }

  const updatedPresets = [...existingPresets];
  updatedPresets[presetIndex] = { ...updatedPresets[presetIndex], ...updates };

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
export async function deleteCustomCookModePreset(id: string): Promise<{ error: string | null }> {
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
  const existingPresets = existingPreferences.cookModePresets || [];

  const updatedPreferences: UserSettingsPreferences = {
    ...existingPreferences,
    cookModePresets: existingPresets.filter((p) => p.id !== id),
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
  id: string | null
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
  const existingPresets = existingPreferences.cookModePresets || [];

  const updatedPresets = existingPresets.map((p) => ({
    ...p,
    isDefault: id === null ? false : p.id === id,
  }));

  if (id !== null && !updatedPresets.some((p) => p.id === id)) {
    return { error: "Preset not found" };
  }

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

  const { data: existingData } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("user_id", user.id)
    .maybeSingle();

  const existingPreferences = (existingData?.preferences || {}) as UserSettingsPreferences;
  const existingPresets = existingPreferences.cookModePresets || [];

  const presetToDuplicate = existingPresets.find((p) => p.id === id);
  if (!presetToDuplicate) {
    return { error: "Preset not found", data: null };
  }

  const duplicatedPreset: CustomCookModePreset = {
    ...presetToDuplicate,
    id: crypto.randomUUID(),
    name: newName,
    createdAt: new Date().toISOString(),
    isDefault: false,
  };

  const updatedPreferences: UserSettingsPreferences = {
    ...existingPreferences,
    cookModePresets: [...existingPresets, duplicatedPreset],
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
