"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import { revalidatePath } from "next/cache";
import type {
  CustomIngredientCategory,
  CustomIngredientCategoryFormData,
} from "@/types/custom-ingredient-category";

/**
 * Convert database row to CustomIngredientCategory
 */
function mapDbToCategory(dbRow: Record<string, unknown>): CustomIngredientCategory {
  return {
    id: dbRow.id as string,
    householdId: dbRow.household_id as string,
    name: dbRow.name as string,
    slug: dbRow.slug as string,
    emoji: dbRow.emoji as string,
    color: dbRow.color as string,
    sortOrder: dbRow.sort_order as number,
    isSystem: dbRow.is_system as boolean,
    parentCategoryId: (dbRow.parent_category_id as string | null) || null,
    defaultStoreId: (dbRow.default_store_id as string | null) || null,
    createdAt: dbRow.created_at as string,
  };
}

/**
 * Generate a URL-safe slug from a category name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove non-word chars
    .replace(/[\s_-]+/g, "-") // Replace spaces/underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Trim hyphens
}

/**
 * Get all custom ingredient categories for a household with hierarchy support
 */
export async function getCustomIngredientCategories(householdId: string): Promise<{
  data: CustomIngredientCategory[] | null;
  error: string | null;
}> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "Not authenticated", data: null };
  }

  // Verify household access
  if (household.household_id !== householdId) {
    return { error: "Unauthorized access to this household", data: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("custom_ingredient_categories")
    .select("*")
    .eq("household_id", householdId)
    .order("sort_order", { ascending: true });

  if (error) {
    return { error: error.message, data: null };
  }

  const categories = data.map(mapDbToCategory);

  return { error: null, data: categories };
}

/**
 * Create a new custom ingredient category
 */
export async function createCustomIngredientCategory(
  householdId: string,
  formData: CustomIngredientCategoryFormData
): Promise<{
  data: CustomIngredientCategory | null;
  error: string | null;
}> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "Not authenticated", data: null };
  }

  // Verify household access
  if (household.household_id !== householdId) {
    return { error: "Unauthorized access to this household", data: null };
  }

  const supabase = await createClient();

  // Generate slug from name
  const slug = generateSlug(formData.name);

  // Check for duplicate slug
  const { data: existing } = await supabase
    .from("custom_ingredient_categories")
    .select("id")
    .eq("household_id", householdId)
    .eq("slug", slug)
    .maybeSingle();

  if (existing) {
    return { error: "A category with this name already exists", data: null };
  }

  // Get max sort_order
  const { data: maxSortData } = await supabase
    .from("custom_ingredient_categories")
    .select("sort_order")
    .eq("household_id", householdId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextSortOrder = maxSortData ? (maxSortData.sort_order as number) + 1 : 0;

  // Create the category
  const { data, error } = await supabase
    .from("custom_ingredient_categories")
    .insert({
      household_id: householdId,
      name: formData.name,
      slug,
      emoji: formData.emoji,
      color: formData.color,
      parent_category_id: formData.parentCategoryId || null,
      default_store_id: formData.defaultStoreId || null,
      sort_order: nextSortOrder,
      is_system: false,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  revalidatePath("/app/settings");
  revalidatePath("/app/shop");

  return { error: null, data: mapDbToCategory(data) };
}

/**
 * Update an existing custom ingredient category
 */
export async function updateCustomIngredientCategory(
  id: string,
  formData: Partial<CustomIngredientCategoryFormData>
): Promise<{
  error: string | null;
}> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "Not authenticated" };
  }

  const supabase = await createClient();

  // Get the existing category to verify ownership and check if system
  const { data: existing, error: fetchError } = await supabase
    .from("custom_ingredient_categories")
    .select("household_id, is_system, slug, name")
    .eq("id", id)
    .single();

  if (fetchError) {
    return { error: "Category not found" };
  }

  // Verify household access
  if (existing.household_id !== household.household_id) {
    return { error: "Unauthorized access to this category" };
  }

  // Build update object
  const updates: Record<string, unknown> = {};

  if (formData.name !== undefined) {
    updates.name = formData.name;
    // Regenerate slug if name changes
    const newSlug = generateSlug(formData.name);
    if (newSlug !== existing.slug) {
      // Check for duplicate slug
      const { data: duplicate } = await supabase
        .from("custom_ingredient_categories")
        .select("id")
        .eq("household_id", existing.household_id)
        .eq("slug", newSlug)
        .neq("id", id)
        .maybeSingle();

      if (duplicate) {
        return { error: "A category with this name already exists" };
      }
      updates.slug = newSlug;
    }
  }

  if (formData.emoji !== undefined) updates.emoji = formData.emoji;
  if (formData.color !== undefined) updates.color = formData.color;
  if (formData.parentCategoryId !== undefined) {
    updates.parent_category_id = formData.parentCategoryId || null;
  }
  if (formData.defaultStoreId !== undefined) {
    updates.default_store_id = formData.defaultStoreId || null;
  }

  if (Object.keys(updates).length === 0) {
    return { error: null };
  }

  const { error } = await supabase
    .from("custom_ingredient_categories")
    .update(updates)
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings");
  revalidatePath("/app/shop");

  return { error: null };
}

/**
 * Delete a custom ingredient category (non-system only)
 * Note: Child categories will have their parent_category_id set to null (ON DELETE SET NULL)
 */
export async function deleteCustomIngredientCategory(id: string): Promise<{
  error: string | null;
}> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "Not authenticated" };
  }

  const supabase = await createClient();

  // Get the category to verify it's not a system category
  const { data: category, error: fetchError } = await supabase
    .from("custom_ingredient_categories")
    .select("household_id, is_system")
    .eq("id", id)
    .single();

  if (fetchError) {
    return { error: "Category not found" };
  }

  // Verify household access
  if (category.household_id !== household.household_id) {
    return { error: "Unauthorized access to this category" };
  }

  // Prevent deletion of system categories
  if (category.is_system) {
    return { error: "Cannot delete system categories" };
  }

  // Delete the category (RLS policy ensures only non-system categories can be deleted)
  const { error } = await supabase
    .from("custom_ingredient_categories")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings");
  revalidatePath("/app/shop");

  return { error: null };
}

/**
 * Reorder custom ingredient categories
 */
export async function reorderCustomIngredientCategories(
  householdId: string,
  orderedIds: string[]
): Promise<{
  error: string | null;
}> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "Not authenticated" };
  }

  // Verify household access
  if (household.household_id !== householdId) {
    return { error: "Unauthorized access to this household" };
  }

  const supabase = await createClient();

  // Update sort_order for each category
  const updates = orderedIds.map((id, index) =>
    supabase
      .from("custom_ingredient_categories")
      .update({ sort_order: index })
      .eq("id", id)
      .eq("household_id", householdId)
  );

  const results = await Promise.all(updates);

  // Check for errors
  const errors = results.filter((r) => r.error);
  if (errors.length > 0) {
    return { error: "Failed to reorder categories" };
  }

  revalidatePath("/app/settings");
  revalidatePath("/app/shop");

  return { error: null };
}

/**
 * Reassign shopping list items from one category to another
 */
export async function reassignItemsToCategory(
  fromCategoryId: string,
  toCategoryId: string
): Promise<{
  error: string | null;
}> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "Not authenticated" };
  }

  const supabase = await createClient();

  // Verify both categories belong to the user's household
  const { data: categories, error: fetchError } = await supabase
    .from("custom_ingredient_categories")
    .select("id, household_id")
    .in("id", [fromCategoryId, toCategoryId]);

  if (fetchError || !categories || categories.length !== 2) {
    return { error: "Invalid categories" };
  }

  const allBelongToHousehold = categories.every(
    (c) => c.household_id === household.household_id
  );

  if (!allBelongToHousehold) {
    return { error: "Unauthorized access to categories" };
  }

  // Update all shopping list items
  const { error } = await supabase
    .from("shopping_list_items")
    .update({ category_id: toCategoryId })
    .eq("category_id", fromCategoryId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/shop");

  return { error: null };
}
