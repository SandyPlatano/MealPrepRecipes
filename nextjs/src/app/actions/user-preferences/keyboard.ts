"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { KeyboardPreferences, UserPreferencesV2 } from "@/types/user-preferences-v2";
import { getCurrentUserId, getUserPreferencesV2 } from "./core";

export async function updateKeyboardShortcuts(
  userId: string,
  shortcuts: Record<string, string>
): Promise<{ error: string | null }> {
  const supabase = await createClient();

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
