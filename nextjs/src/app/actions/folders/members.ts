"use server";

import { createClient } from "@/lib/supabase/server";
import {
  getCachedUser,
  getCachedUserWithHousehold,
} from "@/lib/supabase/cached-queries";
import { revalidatePath } from "next/cache";

// =====================================================
// GET FOLDER MEMBERSHIPS
// =====================================================

/**
 * Get all recipe IDs in a folder
 */
export async function getFolderRecipeIds(
  folderId: string
): Promise<{ error: string | null; data: string[] }> {
  const { user, error: authError } = await getCachedUser();

  if (authError || !user) {
    return { error: "Not authenticated", data: [] };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("recipe_folder_members")
    .select("recipe_id")
    .eq("folder_id", folderId);

  if (error) {
    return { error: error.message, data: [] };
  }

  return { error: null, data: data.map((m) => m.recipe_id) };
}

/**
 * Get all folder memberships for the household (folderId -> recipeIds[])
 * Used for parallel fetching in page components
 */
export async function getAllFolderMemberships(): Promise<{
  error: string | null;
  data: Record<string, string[]>;
}> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household?.household_id) {
    return { error: "Not authenticated", data: {} };
  }

  const supabase = await createClient();

  const { data: memberships, error } = await supabase
    .from("recipe_folder_members")
    .select("folder_id, recipe_id, recipe_folders!inner(household_id)")
    .eq("recipe_folders.household_id", household.household_id);

  if (error) {
    return { error: error.message, data: {} };
  }

  const membershipMap: Record<string, string[]> = {};
  for (const m of memberships || []) {
    if (!membershipMap[m.folder_id]) {
      membershipMap[m.folder_id] = [];
    }
    membershipMap[m.folder_id].push(m.recipe_id);
  }

  return { error: null, data: membershipMap };
}

/**
 * Get all folder IDs that contain a recipe
 */
export async function getRecipeFolderIds(
  recipeId: string
): Promise<{ error: string | null; data: string[] }> {
  const { user, error: authError } = await getCachedUser();

  if (authError || !user) {
    return { error: "Not authenticated", data: [] };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("recipe_folder_members")
    .select("folder_id")
    .eq("recipe_id", recipeId);

  if (error) {
    return { error: error.message, data: [] };
  }

  return { error: null, data: data.map((m) => m.folder_id) };
}

// =====================================================
// RECIPE-FOLDER MEMBERSHIP OPERATIONS
// =====================================================

/**
 * Add a recipe to a folder
 */
export async function addRecipeToFolder(
  recipeId: string,
  folderId: string
): Promise<{ error: string | null }> {
  const { user, error: authError } = await getCachedUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("recipe_folder_members").insert({
    folder_id: folderId,
    recipe_id: recipeId,
    added_by_user_id: user.id,
  });

  if (error) {
    // Handle unique constraint violation (already in folder)
    if (error.code === "23505") {
      return { error: null }; // Silently succeed if already in folder
    }
    return { error: error.message };
  }

  revalidatePath("/app/recipes");
  return { error: null };
}

/**
 * Remove a recipe from a folder
 */
export async function removeRecipeFromFolder(
  recipeId: string,
  folderId: string
): Promise<{ error: string | null }> {
  const { user, error: authError } = await getCachedUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("recipe_folder_members")
    .delete()
    .eq("folder_id", folderId)
    .eq("recipe_id", recipeId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/recipes");
  return { error: null };
}

/**
 * Set all folders for a recipe (replaces existing memberships)
 */
export async function setRecipeFolders(
  recipeId: string,
  folderIds: string[]
): Promise<{ error: string | null }> {
  const { user, error: authError } = await getCachedUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

  // Remove all existing memberships for this recipe
  await supabase
    .from("recipe_folder_members")
    .delete()
    .eq("recipe_id", recipeId);

  // Add new memberships
  if (folderIds.length > 0) {
    const { error } = await supabase.from("recipe_folder_members").insert(
      folderIds.map((folderId) => ({
        folder_id: folderId,
        recipe_id: recipeId,
        added_by_user_id: user.id,
      }))
    );

    if (error) {
      return { error: error.message };
    }
  }

  revalidatePath("/app/recipes");
  return { error: null };
}
