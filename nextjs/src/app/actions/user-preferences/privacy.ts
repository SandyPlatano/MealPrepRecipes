"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { PrivacyPreferences, UserPreferencesV2 } from "@/types/user-preferences-v2";
import { DEFAULT_PRIVACY_PREFERENCES } from "@/types/user-preferences-v2";
import { getCurrentUserId, getUserPreferencesV2 } from "./core";

export async function updatePrivacyPreferences(
  userId: string,
  data: Partial<PrivacyPreferences>
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { data: currentPrefs } = await getUserPreferencesV2(userId);

  const currentPrivacy = currentPrefs.privacy ?? DEFAULT_PRIVACY_PREFERENCES;

  const updates: Partial<PrivacyPreferences> = { ...data };
  const privacyKeys: (keyof PrivacyPreferences)[] = [
    "analyticsEnabled",
    "crashReporting",
    "personalizedRecommendations",
  ];

  const anyOptIn = privacyKeys.some(
    (key) => data[key] === true && !currentPrivacy[key]
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

export async function updatePrivacyPreferencesAuto(
  data: Partial<PrivacyPreferences>
): Promise<{ error: string | null }> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Not authenticated" };
  return updatePrivacyPreferences(userId, data);
}
