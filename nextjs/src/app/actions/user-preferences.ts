"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  UserPreferencesV2,
  DisplayPreferences,
  SoundPreferences,
  ServingSizePreset,
  KeyboardPreferences,
  AiPersonalityType,
  PrivacyPreferences,
  RecipeLayoutPreferences,
} from "@/types/user-preferences-v2";
import {
  DEFAULT_USER_PREFERENCES_V2,
  DEFAULT_DISPLAY_PREFERENCES,
  DEFAULT_SOUND_PREFERENCES,
  DEFAULT_SERVING_SIZE_PRESETS,
  DEFAULT_KEYBOARD_PREFERENCES,
  DEFAULT_PRIVACY_PREFERENCES,
  DEFAULT_SIDEBAR_PREFERENCES,
  DEFAULT_RECIPE_LAYOUT_PREFERENCES,
} from "@/types/user-preferences-v2";

// ============================================================================
// Get User Preferences V2
// ============================================================================

export async function getUserPreferencesV2(
  userId: string
): Promise<{ error: string | null; data: UserPreferencesV2 }> {
  const supabase = await createClient();

  const { data: settings, error } = await supabase
    .from("user_settings")
    .select("preferences_v2")
    .eq("user_id", userId)
    .single();

  if (error || !settings?.preferences_v2) {
    return { error: null, data: DEFAULT_USER_PREFERENCES_V2 };
  }

  const prefs = settings.preferences_v2 as Partial<UserPreferencesV2>;

  // Deep merge with defaults to ensure all fields exist
  return {
    error: null,
    data: {
      display: {
        ...DEFAULT_DISPLAY_PREFERENCES,
        ...(prefs.display || {}),
      },
      sounds: {
        ...DEFAULT_SOUND_PREFERENCES,
        ...(prefs.sounds || {}),
      },
      servingSizePresets:
        prefs.servingSizePresets || DEFAULT_SERVING_SIZE_PRESETS,
      keyboard: {
        ...DEFAULT_KEYBOARD_PREFERENCES,
        ...(prefs.keyboard || {}),
        shortcuts: {
          ...DEFAULT_KEYBOARD_PREFERENCES.shortcuts,
          ...((prefs.keyboard?.shortcuts as Record<string, string>) || {}),
        },
      },
      aiPersonality: prefs.aiPersonality || "friendly",
      customAiPrompt: prefs.customAiPrompt || null,
      privacy: {
        ...DEFAULT_PRIVACY_PREFERENCES,
        ...(prefs.privacy || {}),
      },
      sidebar: {
        ...DEFAULT_SIDEBAR_PREFERENCES,
        ...(prefs.sidebar || {}),
      },
      recipeLayout: {
        ...DEFAULT_RECIPE_LAYOUT_PREFERENCES,
        ...(prefs.recipeLayout || {}),
        sections: {
          ...DEFAULT_RECIPE_LAYOUT_PREFERENCES.sections,
          ...((prefs.recipeLayout?.sections as Record<string, unknown>) || {}),
        },
        sectionOrder:
          prefs.recipeLayout?.sectionOrder ||
          DEFAULT_RECIPE_LAYOUT_PREFERENCES.sectionOrder,
      },
    },
  };
}

// ============================================================================
// Update Display Preferences
// ============================================================================

export async function updateDisplayPreferences(
  userId: string,
  data: Partial<DisplayPreferences>
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  // Get current preferences
  const { data: currentPrefs } = await getUserPreferencesV2(userId);

  const updatedPreferences: UserPreferencesV2 = {
    ...currentPrefs,
    display: {
      ...currentPrefs.display,
      ...data,
    },
  };

  const { error } = await supabase
    .from("user_settings")
    .update({ preferences_v2: updatedPreferences })
    .eq("user_id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app");
  revalidatePath("/app/settings");
  return { error: null };
}

// ============================================================================
// Update Sound Preferences
// ============================================================================

export async function updateSoundPreferences(
  userId: string,
  data: Partial<SoundPreferences>
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  // Get current preferences
  const { data: currentPrefs } = await getUserPreferencesV2(userId);

  const updatedPreferences: UserPreferencesV2 = {
    ...currentPrefs,
    sounds: {
      ...currentPrefs.sounds,
      ...data,
    },
  };

  const { error } = await supabase
    .from("user_settings")
    .update({ preferences_v2: updatedPreferences })
    .eq("user_id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings");
  return { error: null };
}

// ============================================================================
// Update Serving Size Presets
// ============================================================================

export async function updateServingSizePresets(
  userId: string,
  presets: ServingSizePreset[]
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  // Get current preferences
  const { data: currentPrefs } = await getUserPreferencesV2(userId);

  const updatedPreferences: UserPreferencesV2 = {
    ...currentPrefs,
    servingSizePresets: presets,
  };

  const { error } = await supabase
    .from("user_settings")
    .update({ preferences_v2: updatedPreferences })
    .eq("user_id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app");
  revalidatePath("/app/settings");
  return { error: null };
}

// ============================================================================
// Update Keyboard Shortcuts
// ============================================================================

export async function updateKeyboardShortcuts(
  userId: string,
  shortcuts: Record<string, string>
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  // Get current preferences
  const { data: currentPrefs } = await getUserPreferencesV2(userId);

  const updatedPreferences: UserPreferencesV2 = {
    ...currentPrefs,
    keyboard: {
      ...currentPrefs.keyboard,
      shortcuts,
    },
  };

  const { error } = await supabase
    .from("user_settings")
    .update({ preferences_v2: updatedPreferences })
    .eq("user_id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app");
  revalidatePath("/app/settings");
  return { error: null };
}

export async function toggleKeyboardShortcuts(
  userId: string,
  enabled: boolean
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  // Get current preferences
  const { data: currentPrefs } = await getUserPreferencesV2(userId);

  const updatedPreferences: UserPreferencesV2 = {
    ...currentPrefs,
    keyboard: {
      ...currentPrefs.keyboard,
      enabled,
    },
  };

  const { error } = await supabase
    .from("user_settings")
    .update({ preferences_v2: updatedPreferences })
    .eq("user_id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app");
  revalidatePath("/app/settings");
  return { error: null };
}

// ============================================================================
// Update AI Personality
// ============================================================================

export async function updateAiPersonality(
  userId: string,
  personality: AiPersonalityType,
  customPrompt?: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  // Get current preferences
  const { data: currentPrefs } = await getUserPreferencesV2(userId);

  const updatedPreferences: UserPreferencesV2 = {
    ...currentPrefs,
    aiPersonality: personality,
    customAiPrompt: customPrompt || null,
  };

  const { error } = await supabase
    .from("user_settings")
    .update({ preferences_v2: updatedPreferences })
    .eq("user_id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings");
  return { error: null };
}

// ============================================================================
// Update Privacy Preferences
// ============================================================================

export async function updatePrivacyPreferences(
  userId: string,
  data: Partial<PrivacyPreferences>
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  // Get current preferences
  const { data: currentPrefs } = await getUserPreferencesV2(userId);

  // Safely access privacy with fallback to defaults
  const currentPrivacy = currentPrefs.privacy ?? DEFAULT_PRIVACY_PREFERENCES;

  // Track consent timestamp when any privacy setting changes from false to true
  const updates: Partial<PrivacyPreferences> = { ...data };
  const privacyKeys: (keyof PrivacyPreferences)[] = [
    "analyticsEnabled",
    "crashReporting",
    "personalizedRecommendations",
  ];

  const anyOptIn = privacyKeys.some(
    (key) =>
      data[key] === true && !currentPrivacy[key]
  );

  if (anyOptIn && !currentPrivacy.consentTimestamp) {
    updates.consentTimestamp = new Date().toISOString();
  }

  const updatedPreferences: UserPreferencesV2 = {
    ...currentPrefs,
    privacy: {
      ...currentPrivacy,
      ...updates,
    },
  };

  const { error } = await supabase
    .from("user_settings")
    .update({ preferences_v2: updatedPreferences })
    .eq("user_id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings");
  return { error: null };
}

// ============================================================================
// Custom CSS
// ============================================================================

export async function getCustomCss(
  userId: string
): Promise<{ error: string | null; data: string | null }> {
  const supabase = await createClient();

  const { data: settings, error } = await supabase
    .from("user_settings")
    .select("custom_css")
    .eq("user_id", userId)
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  return { error: null, data: settings?.custom_css || null };
}

export async function setCustomCss(
  userId: string,
  css: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("user_settings")
    .update({ custom_css: css })
    .eq("user_id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app");
  revalidatePath("/app/settings");
  return { error: null };
}

// ============================================================================
// Reset to Defaults
// ============================================================================

export async function resetPreferencesToDefaults(
  userId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("user_settings")
    .update({
      preferences_v2: DEFAULT_USER_PREFERENCES_V2,
      custom_css: null,
    })
    .eq("user_id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app");
  revalidatePath("/app/settings");
  return { error: null };
}

// ============================================================================
// Auto-authenticated wrappers (for SettingsContext)
// These functions get the current user automatically
// ============================================================================

async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function updateDisplayPreferencesAuto(
  data: Partial<DisplayPreferences>
): Promise<{ error: string | null }> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Not authenticated" };
  return updateDisplayPreferences(userId, data);
}

export async function updateSoundPreferencesAuto(
  data: Partial<SoundPreferences>
): Promise<{ error: string | null }> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Not authenticated" };
  return updateSoundPreferences(userId, data);
}

export async function updateKeyboardPreferencesAuto(
  data: Partial<KeyboardPreferences>
): Promise<{ error: string | null }> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Not authenticated" };

  const supabase = await createClient();
  const { data: currentPrefs } = await getUserPreferencesV2(userId);

  const updatedPreferences: UserPreferencesV2 = {
    ...currentPrefs,
    keyboard: {
      ...currentPrefs.keyboard,
      ...data,
    },
  };

  const { error } = await supabase
    .from("user_settings")
    .update({ preferences_v2: updatedPreferences })
    .eq("user_id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app");
  revalidatePath("/app/settings");
  return { error: null };
}

export async function updateAiPersonalityAuto(
  personality: AiPersonalityType,
  customPrompt: string | null
): Promise<{ error: string | null }> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Not authenticated" };
  return updateAiPersonality(userId, personality, customPrompt ?? undefined);
}

export async function updateServingSizePresetsAuto(
  presets: ServingSizePreset[]
): Promise<{ error: string | null }> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Not authenticated" };
  return updateServingSizePresets(userId, presets);
}

export async function updatePrivacyPreferencesAuto(
  data: Partial<PrivacyPreferences>
): Promise<{ error: string | null }> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Not authenticated" };
  return updatePrivacyPreferences(userId, data);
}

// ============================================================================
// Update Recipe Layout Preferences
// ============================================================================

export async function updateRecipeLayoutPreferences(
  userId: string,
  data: RecipeLayoutPreferences
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  // Get current preferences
  const { data: currentPrefs } = await getUserPreferencesV2(userId);

  const updatedPreferences: UserPreferencesV2 = {
    ...currentPrefs,
    recipeLayout: data,
  };

  const { error } = await supabase
    .from("user_settings")
    .update({ preferences_v2: updatedPreferences })
    .eq("user_id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app");
  revalidatePath("/app/recipes");
  revalidatePath("/app/settings");
  return { error: null };
}

export async function updateRecipeLayoutPreferencesAuto(
  data: RecipeLayoutPreferences
): Promise<{ error: string | null }> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Not authenticated" };
  return updateRecipeLayoutPreferences(userId, data);
}
