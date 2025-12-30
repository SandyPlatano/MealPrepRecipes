"use server";

/**
 * Cooking history context for smart folder evaluation
 */

import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";

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
