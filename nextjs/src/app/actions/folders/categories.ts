"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import { revalidatePath, revalidateTag } from "next/cache";
import type {
  FolderCategory,
  FolderCategoryWithFolders,
  FolderCategoryFormData,
} from "@/types/folder";
import { getFolders } from "./crud";

// =====================================================
// FOLDER CATEGORY OPERATIONS
// =====================================================

/**
 * Get all folder categories with their folders
 */
export async function getFolderCategories(): Promise<{
  error: string | null;
  data: FolderCategoryWithFolders[] | null;
}> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household?.household_id) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  // Get all categories
  const { data: categories, error: catError } = await supabase
    .from("folder_categories")
    .select("id, household_id, created_by_user_id, name, emoji, is_system, sort_order, created_at, updated_at")
    .eq("household_id", household.household_id)
    .order("sort_order", { ascending: true });

  if (catError) {
    return { error: catError.message, data: null };
  }

  // Get all folders (reuse existing getFolders logic)
  const foldersResult = await getFolders();
  if (foldersResult.error) {
    return { error: foldersResult.error, data: null };
  }

  const allFolders = foldersResult.data || [];

  // Group folders by category
  const categoriesWithFolders: FolderCategoryWithFolders[] = categories.map((cat) => ({
    ...cat,
    folders: allFolders.filter((f) => f.category_id === cat.id),
  }));

  // Handle uncategorized folders
  const uncategorizedFolders = allFolders.filter((f) => f.category_id === null);

  if (uncategorizedFolders.length > 0) {
    if (categoriesWithFolders.length > 0) {
      // Add orphaned folders to the first category
      categoriesWithFolders[0].folders.push(...uncategorizedFolders);
    } else {
      // No categories exist - create a virtual "My Folders" category
      categoriesWithFolders.push({
        id: "virtual-my-folders",
        household_id: household.household_id,
        created_by_user_id: user.id,
        name: "My Folders",
        emoji: null,
        is_system: false,
        sort_order: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        folders: uncategorizedFolders,
      });
    }
  }

  return { error: null, data: categoriesWithFolders };
}

/**
 * Create a new folder category
 */
export async function createFolderCategory(
  formData: FolderCategoryFormData
): Promise<{ error: string | null; data: FolderCategory | null }> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household?.household_id) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  // Get max sort_order
  const { data: existingCats } = await supabase
    .from("folder_categories")
    .select("sort_order")
    .eq("household_id", household.household_id)
    .order("sort_order", { ascending: false })
    .limit(1);

  const maxOrder = existingCats?.[0]?.sort_order ?? 0;

  const { data, error } = await supabase
    .from("folder_categories")
    .insert({
      household_id: household.household_id,
      created_by_user_id: user.id,
      name: formData.name,
      emoji: formData.emoji || null,
      is_system: false,
      sort_order: maxOrder + 1,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  revalidatePath("/app/recipes");
  revalidateTag(`folder-categories-${household.household_id}`, "default");
  return { error: null, data: data as FolderCategory };
}

/**
 * Update a folder category
 */
export async function updateFolderCategory(
  id: string,
  formData: Partial<FolderCategoryFormData>
): Promise<{ error: string | null; data: FolderCategory | null }> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household?.household_id) {
    return { error: "Not authenticated", data: null };
  }

  // Can't update the virtual "uncategorized" category
  if (id === "uncategorized") {
    return { error: "Cannot update this category", data: null };
  }

  const supabase = await createClient();

  const updateData: Record<string, unknown> = {};
  if (formData.name !== undefined) updateData.name = formData.name;
  if (formData.emoji !== undefined) updateData.emoji = formData.emoji || null;

  const { data, error } = await supabase
    .from("folder_categories")
    .update(updateData)
    .eq("id", id)
    .eq("household_id", household.household_id)
    .select()
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  revalidatePath("/app/recipes");
  revalidateTag(`folder-categories-${household.household_id}`, "default");
  return { error: null, data: data as FolderCategory };
}

/**
 * Delete a folder category (moves folders to uncategorized)
 */
export async function deleteFolderCategory(
  id: string
): Promise<{ error: string | null }> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household?.household_id) {
    return { error: "Not authenticated" };
  }

  // Can't delete the virtual "uncategorized" category
  if (id === "uncategorized") {
    return { error: "Cannot delete this category" };
  }

  const supabase = await createClient();

  // Check if it's a system category
  const { data: category } = await supabase
    .from("folder_categories")
    .select("is_system")
    .eq("id", id)
    .single();

  if (category?.is_system) {
    return { error: "Cannot delete system categories" };
  }

  // Move all folders in this category to uncategorized (null)
  await supabase
    .from("recipe_folders")
    .update({ category_id: null })
    .eq("category_id", id);

  // Delete the category
  const { error } = await supabase
    .from("folder_categories")
    .delete()
    .eq("id", id)
    .eq("household_id", household.household_id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/recipes");
  revalidateTag(`folder-categories-${household.household_id}`, "default");
  return { error: null };
}

/**
 * Create default categories for a household
 */
export async function createDefaultFolderCategories(): Promise<{ error: string | null }> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household?.household_id) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

  // Check if categories already exist
  const { count } = await supabase
    .from("folder_categories")
    .select("id", { count: "exact", head: true })
    .eq("household_id", household.household_id);

  if (count && count > 0) {
    return { error: null }; // Categories already exist
  }

  // Call the database function to create defaults
  const { error } = await supabase.rpc("create_default_folder_categories_for_household", {
    p_household_id: household.household_id,
    p_user_id: user.id,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/recipes");
  return { error: null };
}
