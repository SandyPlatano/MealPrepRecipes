"use server";

import { createClient } from "@/lib/supabase/server";
import {
  getCachedUser,
  getCachedUserWithHousehold,
} from "@/lib/supabase/cached-queries";
import { revalidatePath, revalidateTag } from "next/cache";
import { getCached, CACHE_TTL } from "@/lib/cache/redis";
import type {
  SystemSmartFolder,
  SmartFilterCriteria,
} from "@/types/smart-folder";
import type { FolderWithChildren } from "@/types/folder";

// =====================================================
// SMART FOLDER FORM DATA
// =====================================================

export interface SmartFolderFormData {
  name: string;
  emoji?: string | null;
  color?: string | null;
  smart_filters: SmartFilterCriteria;
  category_id?: string | null;
}

// =====================================================
// SYSTEM SMART FOLDERS (Built-in, Read-Only)
// =====================================================

/**
 * Get all system smart folders (built-in, read-only)
 */
export async function getSystemSmartFolders(): Promise<{
  error: string | null;
  data: SystemSmartFolder[] | null;
}> {
  const { user, error: authError } = await getCachedUser();

  if (authError || !user) {
    return { error: "Not authenticated", data: null };
  }

  // System smart folders are read-only, cache for 1 hour
  return getCached(
    "system-smart-folders",
    async () => {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from("system_smart_folders")
        .select("id, name, description, emoji, color, smart_filters, sort_order, created_at")
        .order("sort_order", { ascending: true });

      if (error) {
        return { error: error.message, data: null };
      }

      // Parse JSONB smart_filters into typed objects
      const parsed: SystemSmartFolder[] = data.map((folder) => ({
        ...folder,
        smart_filters:
          typeof folder.smart_filters === "string"
            ? JSON.parse(folder.smart_filters)
            : folder.smart_filters,
      }));

      return { error: null, data: parsed };
    },
    3600 // 1 hour TTL for read-only system data
  );
}

// =====================================================
// USER SMART FOLDERS (Household-owned, Editable)
// =====================================================

/**
 * Get all user-created smart folders for the household
 */
export async function getUserSmartFolders(): Promise<{
  error: string | null;
  data: FolderWithChildren[] | null;
}> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household?.household_id) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  const { data: folders, error } = await supabase
    .from("recipe_folders")
    .select("id, household_id, created_by_user_id, name, emoji, color, is_smart, smart_filters, parent_folder_id, cover_recipe_id, category_id, sort_order, created_at, updated_at")
    .eq("household_id", household.household_id)
    .eq("is_smart", true)
    .order("sort_order", { ascending: true });

  if (error) {
    return { error: error.message, data: null };
  }

  // Convert to FolderWithChildren format (smart folders don't have children)
  const smartFolders: FolderWithChildren[] = folders.map((folder) => ({
    ...folder,
    smart_filters:
      typeof folder.smart_filters === "string"
        ? JSON.parse(folder.smart_filters)
        : folder.smart_filters,
    children: [],
    recipe_count: 0, // Dynamic count calculated client-side
    cover_image_url: null,
  }));

  return { error: null, data: smartFolders };
}

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

// =====================================================
// COOKING HISTORY CONTEXT DATA
// =====================================================

// =====================================================
// SMART FOLDER CACHE OPERATIONS
// =====================================================

/**
 * Get cached smart folder memberships for the household
 * Returns a map of folderId -> recipeIds[]
 */
export async function getSmartFolderCache(): Promise<{
  error: string | null;
  data: Record<string, string[]>;
}> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household?.household_id) {
    return { error: "Not authenticated", data: {} };
  }

  const supabase = await createClient();

  const { data: cacheEntries, error } = await supabase
    .from("smart_folder_recipe_cache")
    .select("smart_folder_id, recipe_id")
    .eq("household_id", household.household_id);

  if (error) {
    return { error: error.message, data: {} };
  }

  const cacheMap: Record<string, string[]> = {};
  for (const entry of cacheEntries || []) {
    if (!cacheMap[entry.smart_folder_id]) {
      cacheMap[entry.smart_folder_id] = [];
    }
    cacheMap[entry.smart_folder_id].push(entry.recipe_id);
  }

  return { error: null, data: cacheMap };
}

/**
 * Check if smart folder cache exists for the household
 */
export async function hasSmartFolderCache(): Promise<boolean> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household?.household_id) {
    return false;
  }

  const supabase = await createClient();

  const { count } = await supabase
    .from("smart_folder_recipe_cache")
    .select("*", { count: "exact", head: true })
    .eq("household_id", household.household_id);

  return (count ?? 0) > 0;
}

/**
 * Rebuild the smart folder cache for the household
 * Evaluates all recipes against all smart folders and populates the cache
 */
export async function rebuildSmartFolderCache(): Promise<{
  error: string | null;
  data: { foldersProcessed: number; recipesMatched: number } | null;
}> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household?.household_id) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  // Import filter evaluator dynamically to avoid bundling issues
  const { filterRecipesBySmartFolder, SYSTEM_FOLDER_CRITERIA } = await import(
    "@/lib/smart-folders/filter-evaluator"
  );

  // Fetch all data in parallel
  const [recipesRes, favoritesRes, nutritionRes, historyRes, userFoldersRes, systemFoldersRes] =
    await Promise.all([
      supabase.from("recipes").select("*").eq("household_id", household.household_id),
      supabase.from("favorites").select("recipe_id").eq("user_id", user.id),
      supabase
        .from("recipe_nutrition")
        .select("recipe_id, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg"),
      supabase
        .from("cooking_history")
        .select("recipe_id, cooked_at")
        .eq("household_id", household.household_id)
        .order("cooked_at", { ascending: false }),
      supabase
        .from("recipe_folders")
        .select("id, smart_filters")
        .eq("household_id", household.household_id)
        .eq("is_smart", true),
      supabase.from("system_smart_folders").select("id, smart_filters"),
    ]);

  if (recipesRes.error) {
    return { error: `Failed to fetch recipes: ${recipesRes.error.message}`, data: null };
  }

  const recipes = recipesRes.data || [];
  const favoriteIds = new Set((favoritesRes.data || []).map((f) => f.recipe_id));

  // Build nutrition map
  const nutritionMap: Record<string, {
    calories?: number;
    protein_g?: number;
    carbs_g?: number;
    fat_g?: number;
    fiber_g?: number;
    sugar_g?: number;
    sodium_mg?: number;
  }> = {};
  for (const n of nutritionRes.data || []) {
    nutritionMap[n.recipe_id] = n;
  }

  // Build cooking history context
  const cookCounts: Record<string, number> = {};
  const lastCookedDates: Record<string, string | null> = {};
  for (const entry of historyRes.data || []) {
    cookCounts[entry.recipe_id] = (cookCounts[entry.recipe_id] || 0) + 1;
    if (!lastCookedDates[entry.recipe_id]) {
      lastCookedDates[entry.recipe_id] = entry.cooked_at;
    }
  }
  const context = { cookCounts, lastCookedDates };

  // Prepare recipes with favorite and nutrition data
  const recipesWithData = recipes.map((recipe) => ({
    ...recipe,
    is_favorite: favoriteIds.has(recipe.id),
    nutrition: nutritionMap[recipe.id] || null,
  }));

  // Clear existing cache for this household
  await supabase.from("smart_folder_recipe_cache").delete().eq("household_id", household.household_id);

  // Collect all cache entries to insert
  const cacheEntries: { smart_folder_id: string; recipe_id: string; household_id: string }[] = [];

  // Process user smart folders
  for (const folder of userFoldersRes.data || []) {
    const criteria =
      typeof folder.smart_filters === "string"
        ? JSON.parse(folder.smart_filters)
        : folder.smart_filters;

    if (criteria?.conditions?.length > 0) {
      const matchingIds = filterRecipesBySmartFolder(recipesWithData, criteria, context);
      for (const recipeId of matchingIds) {
        cacheEntries.push({
          smart_folder_id: folder.id,
          recipe_id: recipeId,
          household_id: household.household_id,
        });
      }
    }
  }

  // Process system smart folders
  for (const folder of systemFoldersRes.data || []) {
    // Use built-in criteria or folder's smart_filters
    const criteria =
      SYSTEM_FOLDER_CRITERIA[folder.id] ||
      (typeof folder.smart_filters === "string"
        ? JSON.parse(folder.smart_filters)
        : folder.smart_filters);

    if (criteria?.conditions?.length > 0) {
      const matchingIds = filterRecipesBySmartFolder(recipesWithData, criteria, context);
      for (const recipeId of matchingIds) {
        cacheEntries.push({
          smart_folder_id: folder.id,
          recipe_id: recipeId,
          household_id: household.household_id,
        });
      }
    }
  }

  // Insert all cache entries in batches
  if (cacheEntries.length > 0) {
    // Insert in chunks of 500 to avoid payload limits
    const chunkSize = 500;
    for (let i = 0; i < cacheEntries.length; i += chunkSize) {
      const chunk = cacheEntries.slice(i, i + chunkSize);
      const { error: insertError } = await supabase.from("smart_folder_recipe_cache").insert(chunk);
      if (insertError) {
        console.error("Failed to insert cache chunk:", insertError);
      }
    }
  }

  const foldersProcessed = (userFoldersRes.data?.length || 0) + (systemFoldersRes.data?.length || 0);

  return {
    error: null,
    data: { foldersProcessed, recipesMatched: cacheEntries.length },
  };
}

// =====================================================
// COOKING HISTORY CONTEXT DATA
// =====================================================

/**
 * Get cooking history data for smart folder evaluation
 * Returns cook counts and last cooked dates for all household recipes
 */
export async function getCookingHistoryContext(): Promise<{
  error: string | null;
  data: {
    cookCounts: Record<string, number>;
    lastCookedDates: Record<string, string | null>;
  } | null;
}> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household?.household_id) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  // Get all cooking history for household recipes
  const { data: history, error } = await supabase
    .from("cooking_history")
    .select("recipe_id, cooked_at")
    .order("cooked_at", { ascending: false });

  if (error) {
    return { error: error.message, data: null };
  }

  // Aggregate cook counts and find last cooked dates
  const cookCounts: Record<string, number> = {};
  const lastCookedDates: Record<string, string | null> = {};

  history?.forEach((entry) => {
    // Increment count
    cookCounts[entry.recipe_id] = (cookCounts[entry.recipe_id] || 0) + 1;

    // Track last cooked date (first occurrence in sorted list)
    if (!lastCookedDates[entry.recipe_id]) {
      lastCookedDates[entry.recipe_id] = entry.cooked_at;
    }
  });

  return { error: null, data: { cookCounts, lastCookedDates } };
}
