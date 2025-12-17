"use server";

import { createClient } from "@/lib/supabase/server";
import {
  getCachedUser,
  getCachedUserWithHousehold,
} from "@/lib/supabase/cached-queries";
import { revalidatePath, revalidateTag } from "next/cache";
import type {
  RecipeFolder,
  FolderWithChildren,
  FolderFormData,
} from "@/types/folder";

// =====================================================
// GET OPERATIONS
// =====================================================

/**
 * Get all folders for the current household (with children nested)
 */
export async function getFolders(): Promise<{
  error: string | null;
  data: FolderWithChildren[] | null;
}> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household?.household_id) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  // Get all folders for household with cover recipe image
  const { data: folders, error } = await supabase
    .from("recipe_folders")
    .select(
      `
      *,
      cover_recipe:recipes!recipe_folders_cover_recipe_id_fkey(image_url)
    `
    )
    .eq("household_id", household.household_id)
    .order("sort_order", { ascending: true });

  if (error) {
    return { error: error.message, data: null };
  }

  // Get recipe counts per folder
  const { data: memberCounts } = await supabase
    .from("recipe_folder_members")
    .select("folder_id")
    .in(
      "folder_id",
      folders.map((f) => f.id)
    );

  const countMap = new Map<string, number>();
  memberCounts?.forEach((m) => {
    countMap.set(m.folder_id, (countMap.get(m.folder_id) || 0) + 1);
  });

  // Build tree structure
  const folderMap = new Map<string, FolderWithChildren>();
  const rootFolders: FolderWithChildren[] = [];

  // First pass: create folder objects
  folders.forEach((folder) => {
    const coverRecipe = folder.cover_recipe as { image_url: string | null } | null;
    const folderWithChildren: FolderWithChildren = {
      id: folder.id,
      household_id: folder.household_id,
      created_by_user_id: folder.created_by_user_id,
      name: folder.name,
      emoji: folder.emoji,
      color: folder.color,
      parent_folder_id: folder.parent_folder_id,
      cover_recipe_id: folder.cover_recipe_id,
      sort_order: folder.sort_order,
      created_at: folder.created_at,
      updated_at: folder.updated_at,
      children: [],
      recipe_count: countMap.get(folder.id) || 0,
      cover_image_url: coverRecipe?.image_url || null,
    };
    folderMap.set(folder.id, folderWithChildren);
  });

  // Second pass: build tree
  folders.forEach((folder) => {
    const folderWithChildren = folderMap.get(folder.id)!;
    if (folder.parent_folder_id) {
      const parent = folderMap.get(folder.parent_folder_id);
      if (parent) {
        parent.children.push(folderWithChildren);
      }
    } else {
      rootFolders.push(folderWithChildren);
    }
  });

  return { error: null, data: rootFolders };
}

/**
 * Get a single folder by ID
 */
export async function getFolder(
  id: string
): Promise<{ error: string | null; data: RecipeFolder | null }> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household?.household_id) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("recipe_folders")
    .select("*")
    .eq("id", id)
    .eq("household_id", household.household_id)
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  return { error: null, data: data as RecipeFolder };
}

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
// CREATE/UPDATE/DELETE OPERATIONS
// =====================================================

/**
 * Create a new folder
 */
export async function createFolder(
  formData: FolderFormData
): Promise<{ error: string | null; data: RecipeFolder | null }> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household?.household_id) {
    return { error: "Not authenticated", data: null };
  }

  // Validate max depth (parent cannot have a parent)
  if (formData.parent_folder_id) {
    const parentResult = await getFolder(formData.parent_folder_id);
    if (parentResult.data?.parent_folder_id) {
      return { error: "Maximum folder depth is 2 levels", data: null };
    }
  }

  const supabase = await createClient();

  // Get max sort_order for new folder position
  const { data: existingFolders } = await supabase
    .from("recipe_folders")
    .select("sort_order")
    .eq("household_id", household.household_id)
    .is("parent_folder_id", formData.parent_folder_id ?? null)
    .order("sort_order", { ascending: false })
    .limit(1);

  const maxOrder = existingFolders?.[0]?.sort_order ?? 0;

  const { data, error } = await supabase
    .from("recipe_folders")
    .insert({
      household_id: household.household_id,
      created_by_user_id: user.id,
      name: formData.name,
      emoji: formData.emoji || null,
      color: formData.color || null,
      parent_folder_id: formData.parent_folder_id || null,
      cover_recipe_id: formData.cover_recipe_id || null,
      sort_order: maxOrder + 1,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  revalidatePath("/app/recipes");
  revalidateTag(`folders-${household.household_id}`);
  return { error: null, data: data as RecipeFolder };
}

/**
 * Update an existing folder
 */
export async function updateFolder(
  id: string,
  formData: Partial<FolderFormData>
): Promise<{ error: string | null; data: RecipeFolder | null }> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household?.household_id) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  const updateData: Record<string, unknown> = {};
  if (formData.name !== undefined) updateData.name = formData.name;
  if (formData.emoji !== undefined) updateData.emoji = formData.emoji || null;
  if (formData.color !== undefined) updateData.color = formData.color || null;
  if (formData.cover_recipe_id !== undefined) {
    updateData.cover_recipe_id = formData.cover_recipe_id || null;
  }

  const { data, error } = await supabase
    .from("recipe_folders")
    .update(updateData)
    .eq("id", id)
    .eq("household_id", household.household_id)
    .select()
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  revalidatePath("/app/recipes");
  revalidateTag(`folders-${household.household_id}`);
  return { error: null, data: data as RecipeFolder };
}

/**
 * Delete a folder (cascade deletes children and memberships)
 */
export async function deleteFolder(
  id: string
): Promise<{ error: string | null }> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household?.household_id) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("recipe_folders")
    .delete()
    .eq("id", id)
    .eq("household_id", household.household_id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/recipes");
  revalidateTag(`folders-${household.household_id}`);
  return { error: null };
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

// =====================================================
// DEFAULT FOLDER CREATION
// =====================================================

/**
 * Create default folders for a household (called on signup or first access)
 */
export async function createDefaultFolders(): Promise<{ error: string | null }> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household?.household_id) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

  // Check if folders already exist
  const { count } = await supabase
    .from("recipe_folders")
    .select("id", { count: "exact", head: true })
    .eq("household_id", household.household_id);

  if (count && count > 0) {
    return { error: null }; // Folders already exist
  }

  // Call the database function to create defaults
  const { error } = await supabase.rpc("create_default_folders_for_household", {
    p_household_id: household.household_id,
    p_user_id: user.id,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/recipes");
  return { error: null };
}
