"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import { revalidatePath } from "next/cache";
import type { CustomRecipeType, CustomRecipeTypeFormData } from "@/types/custom-recipe-type";
import { SUBSCRIPTION_TIERS } from "@/lib/stripe/client-config";

const CUSTOM_RECIPE_TYPE_LIMIT = SUBSCRIPTION_TIERS.free.limits.customRecipeTypes;

/**
 * Get the current usage of custom recipe types for a household
 * Returns the count of custom (non-system) types and the limit
 */
export async function getCustomRecipeTypeUsage(householdId: string): Promise<{
  data: { count: number; limit: number } | null;
  error: string | null;
}> {
  const { user, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  const { count, error } = await supabase
    .from("custom_recipe_types")
    .select("*", { count: "exact", head: true })
    .eq("household_id", householdId)
    .eq("is_system", false);

  if (error) {
    return { error: error.message, data: null };
  }

  return {
    error: null,
    data: {
      count: count ?? 0,
      limit: CUSTOM_RECIPE_TYPE_LIMIT,
    },
  };
}

/**
 * Get all custom recipe types for a household
 */
export async function getCustomRecipeTypes(householdId: string): Promise<{
  data: CustomRecipeType[] | null;
  error: string | null;
}> {
  const { user, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("custom_recipe_types")
    .select("id, household_id, name, slug, emoji, color, description, sort_order, is_system, created_at")
    .eq("household_id", householdId)
    .order("sort_order", { ascending: true });

  if (error) {
    return { error: error.message, data: null };
  }

  // Map database columns to camelCase
  const mappedData: CustomRecipeType[] = (data || []).map((item) => ({
    id: item.id,
    householdId: item.household_id,
    name: item.name,
    slug: item.slug,
    emoji: item.emoji,
    color: item.color,
    description: item.description,
    sortOrder: item.sort_order,
    isSystem: item.is_system,
    createdAt: item.created_at,
  }));

  return { error: null, data: mappedData };
}

/**
 * Create a new custom recipe type
 */
export async function createCustomRecipeType(
  householdId: string,
  formData: CustomRecipeTypeFormData
): Promise<{
  data: CustomRecipeType | null;
  error: string | null;
}> {
  const { user, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  // Check limit before creating
  const { count: existingCount, error: countError } = await supabase
    .from("custom_recipe_types")
    .select("*", { count: "exact", head: true })
    .eq("household_id", householdId)
    .eq("is_system", false);

  if (countError) {
    return { error: countError.message, data: null };
  }

  if ((existingCount ?? 0) >= CUSTOM_RECIPE_TYPE_LIMIT) {
    return {
      error: `You've reached the maximum of ${CUSTOM_RECIPE_TYPE_LIMIT} custom recipe types. Delete an existing type to add a new one.`,
      data: null,
    };
  }

  // Generate slug from name
  const slug = formData.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  // Get the max sort_order to append new type at the end
  const { data: existingTypes } = await supabase
    .from("custom_recipe_types")
    .select("sort_order")
    .eq("household_id", householdId)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextSortOrder = existingTypes && existingTypes.length > 0
    ? existingTypes[0].sort_order + 1
    : 0;

  const { data, error } = await supabase
    .from("custom_recipe_types")
    .insert({
      household_id: householdId,
      name: formData.name,
      slug,
      emoji: formData.emoji,
      color: formData.color,
      description: formData.description || null,
      sort_order: nextSortOrder,
      is_system: false,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  // Map to camelCase
  const mappedData: CustomRecipeType = {
    id: data.id,
    householdId: data.household_id,
    name: data.name,
    slug: data.slug,
    emoji: data.emoji,
    color: data.color,
    description: data.description,
    sortOrder: data.sort_order,
    isSystem: data.is_system,
    createdAt: data.created_at,
  };

  revalidatePath("/app/settings");
  revalidatePath("/app/recipes");

  return { error: null, data: mappedData };
}

/**
 * Update an existing custom recipe type
 */
export async function updateCustomRecipeType(
  id: string,
  updates: Partial<CustomRecipeTypeFormData>
): Promise<{
  data: CustomRecipeType | null;
  error: string | null;
}> {
  const { user, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  // Build update object with snake_case keys
  const updateData: Record<string, unknown> = {};

  if (updates.name !== undefined) {
    updateData.name = updates.name;
    // Regenerate slug if name changes
    updateData.slug = updates.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }
  if (updates.emoji !== undefined) updateData.emoji = updates.emoji;
  if (updates.color !== undefined) updateData.color = updates.color;
  if (updates.description !== undefined) updateData.description = updates.description || null;

  const { data, error } = await supabase
    .from("custom_recipe_types")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  // Map to camelCase
  const mappedData: CustomRecipeType = {
    id: data.id,
    householdId: data.household_id,
    name: data.name,
    slug: data.slug,
    emoji: data.emoji,
    color: data.color,
    description: data.description,
    sortOrder: data.sort_order,
    isSystem: data.is_system,
    createdAt: data.created_at,
  };

  revalidatePath("/app/settings");
  revalidatePath("/app/recipes");

  return { error: null, data: mappedData };
}

/**
 * Delete a custom recipe type (only non-system types)
 */
export async function deleteCustomRecipeType(id: string): Promise<{
  error: string | null;
}> {
  const { user, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

  // First check if it's a system type
  const { data: recipeType } = await supabase
    .from("custom_recipe_types")
    .select("is_system")
    .eq("id", id)
    .single();

  if (recipeType?.is_system) {
    return { error: "Cannot delete system recipe types" };
  }

  const { error } = await supabase
    .from("custom_recipe_types")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings");
  revalidatePath("/app/recipes");

  return { error: null };
}

/**
 * Reorder custom recipe types
 */
export async function reorderCustomRecipeTypes(
  householdId: string,
  orderedIds: string[]
): Promise<{
  error: string | null;
}> {
  const { user, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

  // Update sort_order for each type
  const updates = orderedIds.map((id, index) =>
    supabase
      .from("custom_recipe_types")
      .update({ sort_order: index })
      .eq("id", id)
      .eq("household_id", householdId)
  );

  const results = await Promise.all(updates);

  const firstError = results.find((result) => result.error);
  if (firstError?.error) {
    return { error: firstError.error.message };
  }

  revalidatePath("/app/settings");
  revalidatePath("/app/recipes");

  return { error: null };
}

/**
 * Reassign all recipes from one type to another (useful when deleting)
 */
export async function reassignRecipesToType(
  fromTypeId: string,
  toTypeId: string
): Promise<{
  error: string | null;
}> {
  const { user, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("recipes")
    .update({ recipe_type_id: toTypeId })
    .eq("recipe_type_id", fromTypeId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/recipes");

  return { error: null };
}
