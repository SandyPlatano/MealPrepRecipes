"use server";

/**
 * Cache operations for smart folders
 */

import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";

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
