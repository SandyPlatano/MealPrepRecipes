"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { UserPreferencesV2 } from "@/types/user-preferences-v2";
import type { SidebarPreferencesV2 } from "@/types/sidebar-customization";
import { DEFAULT_SIDEBAR_PREFERENCES_V2 } from "@/types/sidebar-customization";
import { normalizeSidebarPreferences } from "@/lib/sidebar/sidebar-migration";

/**
 * Gets current sidebar preferences V2 from database.
 */
export async function getSidebarPreferencesV2(
  userId: string
): Promise<{ error: string | null; data: SidebarPreferencesV2 }> {
  const supabase = await createClient();

  const { data: settings, error } = await supabase
    .from("user_settings")
    .select("preferences_v2")
    .eq("user_id", userId)
    .single();

  if (error || !settings?.preferences_v2) {
    return {
      error: null,
      data: structuredClone(DEFAULT_SIDEBAR_PREFERENCES_V2),
    };
  }

  const prefs = settings.preferences_v2 as Partial<UserPreferencesV2>;
  const sidebarPrefs = normalizeSidebarPreferences(prefs.sidebar);

  return { error: null, data: sidebarPrefs };
}

/**
 * Updates sidebar preferences V2 in database.
 */
export async function updateSidebarPreferencesV2(
  userId: string,
  sidebarPrefs: SidebarPreferencesV2
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  // Get current full preferences
  const { data: settings } = await supabase
    .from("user_settings")
    .select("preferences_v2")
    .eq("user_id", userId)
    .single();

  const currentPrefs =
    (settings?.preferences_v2 as Partial<UserPreferencesV2>) || {};

  // Cast through unknown to handle backwards compatibility between v1 and v2
  const updatedPreferences = {
    ...currentPrefs,
    sidebar: sidebarPrefs as unknown,
  } as Partial<UserPreferencesV2>;

  const { error } = await supabase
    .from("user_settings")
    .upsert(
      { user_id: userId, preferences_v2: updatedPreferences },
      { onConflict: "user_id" }
    );

  if (error) {
    console.error("Error updating sidebar preferences V2:", error);
    return { error: "Failed to update sidebar preferences" };
  }

  revalidatePath("/app");
  return { error: null };
}
