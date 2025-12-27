"use server";

import { createClient } from "@/lib/supabase/server";
import {
  getCachedUser,
  getCachedUserWithHousehold,
} from "@/lib/supabase/cached-queries";
import { revalidatePath, revalidateTag } from "next/cache";
import { getCached, invalidateCache, foldersKey, CACHE_TTL } from "@/lib/cache/redis";
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
  try {
    const { user, household, error: authError } = await getCachedUserWithHousehold();

    if (authError || !user || !household?.household_id) {
      return { error: "Not authenticated", data: null };
    }

    const supabase = await createClient();

    // Use Redis cache for folder data
    return getCached(
      foldersKey(household.household_id),
      async () => {
        // Run folder fetch and member counts in PARALLEL (not sequential)
        const [foldersResult, memberCountsResult] = await Promise.all([
          supabase
            .from("recipe_folders")
            .select(
              `
              *,
              cover_recipe:recipes!recipe_folders_cover_recipe_id_fkey(image_url)
            `
            )
            .eq("household_id", household.household_id)
            .order("sort_order", { ascending: true }),
          supabase
            .from("recipe_folder_members")
            .select("folder_id, recipe_folders!inner(household_id)")
            .eq("recipe_folders.household_id", household.household_id),
        ]);

        const { data: folders, error } = foldersResult;
        const { data: memberCounts, error: countError } = memberCountsResult;

        if (error) {
          return { error: error.message, data: null };
        }

        if (countError) {
          console.error("Failed to get folder member counts:", countError);
        }

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
            category_id: folder.category_id,
            sort_order: folder.sort_order,
            is_smart: folder.is_smart ?? false,
            smart_filters: folder.smart_filters ?? null,
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
      },
      CACHE_TTL.FOLDERS
    );
  } catch (error) {
    console.error("getFolders error:", error);
    return { error: "Failed to load folders. Please try again.", data: null };
  }
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
    .select("id, household_id, created_by_user_id, name, emoji, color, parent_folder_id, cover_recipe_id, category_id, sort_order, is_smart, smart_filters, created_at, updated_at")
    .eq("id", id)
    .eq("household_id", household.household_id)
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  return { error: null, data: data as RecipeFolder };
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
  try {
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
        category_id: formData.category_id || null,
        sort_order: maxOrder + 1,
      })
      .select()
      .single();

    if (error) {
      return { error: error.message, data: null };
    }

    revalidatePath("/app/recipes");
    revalidateTag(`folders-${household.household_id}`, "default");
    await invalidateCache(foldersKey(household.household_id));
    return { error: null, data: data as RecipeFolder };
  } catch (error) {
    console.error("createFolder error:", error);
    return { error: "Failed to create folder. Please try again.", data: null };
  }
}

/**
 * Update an existing folder
 */
export async function updateFolder(
  id: string,
  formData: Partial<FolderFormData>
): Promise<{ error: string | null; data: RecipeFolder | null }> {
  try {
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
    if (formData.category_id !== undefined) {
      updateData.category_id = formData.category_id || null;
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
    revalidateTag(`folders-${household.household_id}`, "default");
    await invalidateCache(foldersKey(household.household_id));
    return { error: null, data: data as RecipeFolder };
  } catch (error) {
    console.error("updateFolder error:", error);
    return { error: "Failed to update folder. Please try again.", data: null };
  }
}

/**
 * Duplicate a folder (creates a copy with same properties and recipes)
 */
export async function duplicateFolder(
  folderId: string
): Promise<{ error: string | null; data: RecipeFolder | null }> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household?.household_id) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  // Get the folder to duplicate
  const { data: originalFolder, error: fetchError } = await supabase
    .from("recipe_folders")
    .select("id, household_id, created_by_user_id, name, emoji, color, parent_folder_id, cover_recipe_id, category_id, sort_order, is_smart, smart_filters, created_at, updated_at")
    .eq("id", folderId)
    .eq("household_id", household.household_id)
    .single();

  if (fetchError || !originalFolder) {
    return { error: "Folder not found", data: null };
  }

  // Get recipe members from the original folder
  const { data: recipeMembers } = await supabase
    .from("recipe_folder_members")
    .select("recipe_id")
    .eq("folder_id", folderId);

  // Generate unique name for copy
  const { data: existingFolders } = await supabase
    .from("recipe_folders")
    .select("name")
    .eq("household_id", household.household_id)
    .like("name", `${originalFolder.name}%`);

  let copyNumber = 1;
  let newName = `${originalFolder.name} (Copy)`;

  // Check for existing copies and increment number
  while (existingFolders?.some(f => f.name === newName)) {
    copyNumber++;
    newName = `${originalFolder.name} (Copy ${copyNumber})`;
  }

  // Get max sort_order for new folder
  const { data: sortOrderFolders } = await supabase
    .from("recipe_folders")
    .select("sort_order")
    .eq("household_id", household.household_id)
    .is("parent_folder_id", originalFolder.parent_folder_id)
    .order("sort_order", { ascending: false })
    .limit(1);

  const maxOrder = sortOrderFolders?.[0]?.sort_order ?? 0;

  // Create the duplicate folder
  const { data: newFolder, error: createError } = await supabase
    .from("recipe_folders")
    .insert({
      household_id: household.household_id,
      created_by_user_id: user.id,
      name: newName,
      emoji: originalFolder.emoji,
      color: originalFolder.color,
      parent_folder_id: originalFolder.parent_folder_id,
      category_id: originalFolder.category_id,
      cover_recipe_id: originalFolder.cover_recipe_id,
      sort_order: maxOrder + 1,
      is_smart: false, // Duplicates are always regular folders
      smart_filters: null,
    })
    .select()
    .single();

  if (createError || !newFolder) {
    return { error: createError?.message || "Failed to create folder", data: null };
  }

  // Copy recipe memberships if there are any
  if (recipeMembers && recipeMembers.length > 0) {
    const memberInserts = recipeMembers.map(member => ({
      folder_id: newFolder.id,
      recipe_id: member.recipe_id,
    }));

    await supabase
      .from("recipe_folder_members")
      .insert(memberInserts);
  }

  revalidatePath("/app/recipes");
  revalidateTag(`folders-${household.household_id}`, "default");
  return { error: null, data: newFolder as RecipeFolder };
}

/**
 * Delete a folder (cascade deletes children and memberships)
 */
export async function deleteFolder(
  id: string
): Promise<{ error: string | null }> {
  try {
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
    revalidateTag(`folders-${household.household_id}`, "default");
    await invalidateCache(foldersKey(household.household_id));
    return { error: null };
  } catch (error) {
    console.error("deleteFolder error:", error);
    return { error: "Failed to delete folder. Please try again." };
  }
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
