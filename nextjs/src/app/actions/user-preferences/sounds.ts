"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { SoundPreferences, UserPreferencesV2 } from "@/types/user-preferences-v2";
import { getCurrentUserId, getUserPreferencesV2 } from "./core";

export async function updateSoundPreferences(
  userId: string,
  data: Partial<SoundPreferences>
): Promise<{ error: string | null }> {
  const supabase = await createClient();

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

export async function updateSoundPreferencesAuto(
  data: Partial<SoundPreferences>
): Promise<{ error: string | null }> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Not authenticated" };
  return updateSoundPreferences(userId, data);
}
