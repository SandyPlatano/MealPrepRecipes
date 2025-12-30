"use server";

/**
 * Create/Update/Delete operations for smart folders
 */

import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import { revalidatePath, revalidateTag } from "next/cache";
import type { FolderWithChildren } from "@/types/folder";
import type { SmartFolderFormData } from "./index";

/**
 * Create a new smart folder
 */
export async function createSmartFolder(
  formData: SmartFolderFormData
): Promise<{ error: string | null; data: FolderWithChildren | null }> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household?.household_id) {
    return { error: "Not authenticated", data: null };
  }

  // Validate that filters exist
  if (!formData.smart_filters?.conditions || formData.smart_filters.conditions.length === 0) {
    return { error: "Smart folders must have at least one filter condition", data: null };
  }

  const supabase = await createClient();

  // Get max sort_order for smart folders
  const { data: existingFolders } = await supabase
    .from("recipe_folders")
    .select("sort_order")
    .eq("household_id", household.household_id)
    .eq("is_smart", true)
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
      is_smart: true,
      smart_filters: formData.smart_filters,
      parent_folder_id: null, // Smart folders can't have parents
      cover_recipe_id: null, // No cover image for smart folders
      category_id: formData.category_id || null,
      sort_order: maxOrder + 1,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  const smartFolder: FolderWithChildren = {
    ...data,
    smart_filters:
      typeof data.smart_filters === "string"
        ? JSON.parse(data.smart_filters)
        : data.smart_filters,
    children: [],
    recipe_count: 0,
    cover_image_url: null,
  };

  revalidatePath("/app/recipes");
  revalidateTag(`folders-${household.household_id}`, "default");
  return { error: null, data: smartFolder };
}

/**
 * Update an existing smart folder
 */
export async function updateSmartFolder(
  id: string,
  formData: Partial<SmartFolderFormData>
): Promise<{ error: string | null; data: FolderWithChildren | null }> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household?.household_id) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  // Verify the folder exists, is owned by household, and is a smart folder
  const { data: existing } = await supabase
    .from("recipe_folders")
    .select("is_smart")
    .eq("id", id)
    .eq("household_id", household.household_id)
    .single();

  if (!existing) {
    return { error: "Smart folder not found", data: null };
  }

  if (!existing.is_smart) {
    return { error: "This is not a smart folder", data: null };
  }

  // Validate filters if provided
  if (formData.smart_filters !== undefined) {
    if (!formData.smart_filters?.conditions || formData.smart_filters.conditions.length === 0) {
      return { error: "Smart folders must have at least one filter condition", data: null };
    }
  }

  const updateData: Record<string, unknown> = {};
  if (formData.name !== undefined) updateData.name = formData.name;
  if (formData.emoji !== undefined) updateData.emoji = formData.emoji || null;
  if (formData.color !== undefined) updateData.color = formData.color || null;
  if (formData.smart_filters !== undefined) {
    updateData.smart_filters = formData.smart_filters;
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

  const smartFolder: FolderWithChildren = {
    ...data,
    smart_filters:
      typeof data.smart_filters === "string"
        ? JSON.parse(data.smart_filters)
        : data.smart_filters,
    children: [],
    recipe_count: 0,
    cover_image_url: null,
  };

  revalidatePath("/app/recipes");
  revalidateTag(`folders-${household.household_id}`, "default");
  return { error: null, data: smartFolder };
}

/**
 * Delete a smart folder
 */
export async function deleteSmartFolder(
  id: string
): Promise<{ error: string | null }> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household?.household_id) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

  // Verify the folder exists, is owned by household, and is a smart folder
  const { data: existing } = await supabase
    .from("recipe_folders")
    .select("is_smart")
    .eq("id", id)
    .eq("household_id", household.household_id)
    .single();

  if (!existing) {
    return { error: "Smart folder not found" };
  }

  if (!existing.is_smart) {
    return { error: "This is not a smart folder" };
  }

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
  return { error: null };
}
