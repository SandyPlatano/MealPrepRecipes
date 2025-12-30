"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import { revalidatePath } from "next/cache";
import {
  getCached,
  invalidateCache,
  CACHE_TTL,
} from "@/lib/cache/redis";

// Cache key generator
const cookCountsKey = (householdId: string) => `cookcounts:${householdId}`;

/**
 * Mark recipe as cooked (add to history)
 */
export async function markAsCooked(
  recipeId: string,
  rating?: number,
  notes?: string,
  modifications?: string
) {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("cooking_history").insert({
    recipe_id: recipeId,
    user_id: user.id,
    household_id: household?.household_id || null,
    cooked_by: user.id,
    rating: rating || null,
    notes: notes || null,
    modifications: modifications || null,
  });

  if (error) {
    return { error: error.message };
  }

  // Invalidate cook counts cache
  await invalidateCache(cookCountsKey(household?.household_id || user.id));

  revalidatePath("/app/recipes");
  revalidatePath(`/app/recipes/${recipeId}`);
  return { error: null };
}

/**
 * Get cooking history for a recipe
 */
export async function getRecipeHistory(recipeId: string) {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user) {
    return { error: "Not authenticated", data: [] };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cooking_history")
    .select(`
      *,
      cooked_by_profile:profiles!cooking_history_cooked_by_fkey(first_name, last_name)
    `)
    .eq("household_id", household?.household_id)
    .eq("recipe_id", recipeId)
    .order("cooked_at", { ascending: false });

  if (error) {
    return { error: error.message, data: [] };
  }

  return { error: null, data };
}

/**
 * Get cook counts for all recipes in the household
 */
export async function getRecipeCookCounts() {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user) {
    return { error: "Not authenticated", data: {} };
  }

  try {
    const cacheKey = cookCountsKey(household?.household_id || user.id);

    const counts = await getCached<Record<string, number>>(
      cacheKey,
      async () => {
        const supabase = await createClient();

        // Use database function for efficient aggregation
        const { data, error } = await supabase.rpc("get_recipe_cook_counts", {
          p_household_id: household?.household_id,
        });

        if (error) {
          throw new Error(error.message);
        }

        // Transform array to record for backwards compatibility
        const result: Record<string, number> = {};
        (data as Array<{ recipe_id: string; count: number }>)?.forEach((entry) => {
          result[entry.recipe_id] = entry.count;
        });

        return result;
      },
      CACHE_TTL.COOK_COUNTS
    );

    return { error: null, data: counts };
  } catch (error) {
    console.error("getRecipeCookCounts error:", error);
    return { error: "Failed to load cook counts", data: {} };
  }
}
