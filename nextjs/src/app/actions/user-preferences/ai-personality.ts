"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { AiPersonalityType, UserPreferencesV2 } from "@/types/user-preferences-v2";
import { getCurrentUserId, getUserPreferencesV2 } from "./core";

export async function updateAiPersonality(
  userId: string,
  personality: AiPersonalityType,
  customPrompt?: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();

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

export async function updateAiPersonalityAuto(
  personality: AiPersonalityType,
  customPrompt: string | null
): Promise<{ error: string | null }> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Not authenticated" };
  return updateAiPersonality(userId, personality, customPrompt ?? undefined);
}
