"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { UserPreferencesV2 } from "@/types/user-preferences-v2";
import type { RecipeLayoutPreferences } from "@/types/recipe-layout";
import { getCurrentUserId, getUserPreferencesV2 } from "./core";

export async function updateRecipeLayoutPreferences(
  userId: string,
  data: RecipeLayoutPreferences
): Promise<{ error: string | null }> {
  const supabase = await createClient();

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
