"use server";

/**
 * Meal Plan Status Actions
 *
 * Actions for marking plans as sent and getting sent plans.
 */

import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import { revalidatePath, revalidateTag } from "next/cache";
import { markMealPlanAsSentInternal } from "./helpers";

/**
 * Mark a meal plan as sent (finalized) - for use during render (no revalidation)
 */
export async function markMealPlanAsSentDuringRender(weekStart: string) {
  return markMealPlanAsSentInternal(weekStart);
}

/**
 * Mark a meal plan as sent (finalized) - server action version with revalidation
 */
export async function markMealPlanAsSent(weekStart: string) {
  const result = await markMealPlanAsSentInternal(weekStart);

  // Only revalidate if we have a household ID (successful auth)
  if (result.householdId) {
    revalidateTag(`meal-plan-${result.householdId}`, "default");
    revalidatePath("/app/history");
  }

  return { error: result.error, data: result.data };
}

/**
 * Get all past meal plans that were sent
 */
export async function getSentMealPlans() {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "No household found", data: [] };
  }

  const supabase = await createClient();

  // Get all meal plans that were sent, with their assignments
  const { data: mealPlans, error } = await supabase
    .from("meal_plans")
    .select(
      `
      *,
      meal_assignments (
        *,
        recipe:recipes(id, title, recipe_type)
      )
    `
    )
    .eq("household_id", household.household_id)
    .not("sent_at", "is", null)
    .order("week_start", { ascending: false });

  if (error) {
    return { error: error.message, data: [] };
  }

  return { error: null, data: mealPlans };
}
