"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { UserPreferencesV2 } from "@/types/user-preferences-v2";
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

export async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

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
