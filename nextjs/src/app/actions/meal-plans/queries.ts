"use server";

/**
 * Meal Plan Queries
 *
 * Read-heavy query operations for meal plans.
 */

import { createClient } from "@/lib/supabase/server";
import { getCachedUser, getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import type { MealAssignmentWithRecipe, DayOfWeek } from "@/types/meal-plan";

/**
 * Get recipes available for planning (user's + household shared)
 */
export async function getRecipesForPlanning() {
  // Check authentication first - household is optional
  const { user: authUser, error: authError } = await getCachedUser();

  if (authError || !authUser) {
    return { error: "Not authenticated", data: [] };
  }

  // Get household separately (optional - user can have recipes without household)
  const { household } = await getCachedUserWithHousehold();

  const supabase = await createClient();

  // Build query: user's own recipes OR shared household recipes
  // If user has no household, only get their own recipes
  let query = supabase
    .from("recipes")
    .select("id, title, recipe_type, category, prep_time, cook_time, tags, protein_type");

  if (household?.household_id) {
    // User has household - get own recipes + shared household recipes
    query = query.or(
      `user_id.eq.${authUser.id},and(household_id.eq.${household.household_id},is_shared_with_household.eq.true)`
    );
  } else {
    // User has no household - only get their own recipes
    query = query.eq("user_id", authUser.id);
  }

  const { data, error } = await query.order("title");

  if (error) {
    return { error: error.message, data: [] };
  }

  return { error: null, data };
}

/**
 * Get week plan with full recipe details (including ingredients) for finalize page
 */
export async function getWeekPlanWithFullRecipes(weekStart: string) {
  // Match the auth pattern of getWeekPlan for consistency
  const { user: authUser, error: authError } = await getCachedUser();

  if (authError || !authUser) {
    console.error(
      "[getWeekPlanWithFullRecipes] Auth error:",
      authError?.message || "Not authenticated"
    );
    return { error: "Not authenticated", data: null };
  }

  // Get household separately (required for meal planning)
  const { household } = await getCachedUserWithHousehold();

  if (!household) {
    console.error("[getWeekPlanWithFullRecipes] No household found");
    return { error: "Please create or join a household to use meal planning", data: null };
  }

  const supabase = await createClient();

  // Get meal plan for the week
  const { data: mealPlan, error: mealPlanError } = await supabase
    .from("meal_plans")
    .select("id, household_id, week_start, sent_at, created_at, updated_at")
    .eq("household_id", household.household_id)
    .eq("week_start", weekStart)
    .single();

  // Note: .single() returns PGRST116 error if no rows found - this is expected for new weeks
  if (mealPlanError && mealPlanError.code !== "PGRST116") {
    console.error("[getWeekPlanWithFullRecipes] Meal plan error:", mealPlanError);
  }

  // Initialize empty assignments for each day
  const assignments: Record<DayOfWeek, MealAssignmentWithRecipe[]> = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  };

  if (mealPlan) {
    // Get assignments with full recipe details including ingredients
    // Select specific fields instead of (*) to avoid potential RLS issues
    const { data: assignmentData, error: assignmentError } = await supabase
      .from("meal_assignments")
      .select(
        `
        *,
        recipe:recipes(id, title, recipe_type, prep_time, cook_time, ingredients, instructions)
      `
      )
      .eq("meal_plan_id", mealPlan.id);

    if (assignmentError) {
      console.error("[getWeekPlanWithFullRecipes] Assignment error:", assignmentError);
      return { error: assignmentError.message, data: null };
    }

    if (assignmentData) {
      for (const assignment of assignmentData) {
        const day = assignment.day_of_week as DayOfWeek;
        if (assignments[day]) {
          assignments[day].push(assignment);
        }
      }
    }
  }

  return {
    error: null,
    data: {
      meal_plan: mealPlan,
      assignments,
    },
  };
}

/**
 * Get week plan with minimal recipe data for shopping list (optimized query)
 */
export async function getWeekPlanForShoppingList(weekStart: string) {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "No household found", data: null };
  }

  const supabase = await createClient();

  // Get meal plan for the week (might not exist - use maybeSingle)
  const { data: mealPlan } = await supabase
    .from("meal_plans")
    .select("id")
    .eq("household_id", household.household_id)
    .eq("week_start", weekStart)
    .maybeSingle();

  if (!mealPlan) {
    return { error: null, data: null };
  }

  // Get assignments with only the fields needed for shopping list display
  const { data: assignmentData } = await supabase
    .from("meal_assignments")
    .select(
      `
      id,
      day_of_week,
      cook,
      recipe:recipes(id, title)
    `
    )
    .eq("meal_plan_id", mealPlan.id);

  // Group by day for easier consumption
  const assignments: Record<string, typeof assignmentData> = {};
  if (assignmentData) {
    for (const assignment of assignmentData) {
      const day = assignment.day_of_week;
      if (!assignments[day]) {
        assignments[day] = [];
      }
      assignments[day].push(assignment);
    }
  }

  return {
    error: null,
    data: {
      assignments,
    },
  };
}

/**
 * Get meal counts for multiple weeks (for multi-week shopping list selector)
 */
export async function getWeeksMealCounts(weekStarts: string[]): Promise<{
  error: string | null;
  data: Array<{ weekStart: string; mealCount: number }>;
}> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "No household found", data: [] };
  }

  const supabase = await createClient();

  // Get meal plans for the requested weeks
  const { data: mealPlans, error: plansError } = await supabase
    .from("meal_plans")
    .select("id, week_start")
    .eq("household_id", household.household_id)
    .in("week_start", weekStarts);

  if (plansError) {
    return { error: plansError.message, data: [] };
  }

  // Get assignment counts for each meal plan
  const result: Array<{ weekStart: string; mealCount: number }> = [];

  for (const weekStart of weekStarts) {
    const mealPlan = mealPlans?.find((mp) => mp.week_start === weekStart);

    if (mealPlan) {
      const { count } = await supabase
        .from("meal_assignments")
        .select("id", { count: "exact", head: true })
        .eq("meal_plan_id", mealPlan.id);

      result.push({ weekStart, mealCount: count || 0 });
    } else {
      result.push({ weekStart, mealCount: 0 });
    }
  }

  return { error: null, data: result };
}

/**
 * Get recipe repetition warnings across weeks (shows recipes that appear multiple times)
 */
export async function getRecipeRepetitionWarnings(weekStarts: string[]): Promise<{
  error: string | null;
  data: Array<{ recipeId: string; recipeTitle: string; count: number; weeks: string[] }>;
}> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "No household found", data: [] };
  }

  if (!weekStarts || weekStarts.length === 0) {
    return { error: null, data: [] };
  }

  const supabase = await createClient();

  // Get meal plans for the requested weeks
  const { data: mealPlans, error: plansError } = await supabase
    .from("meal_plans")
    .select("id, week_start")
    .eq("household_id", household.household_id)
    .in("week_start", weekStarts);

  if (plansError) {
    return { error: plansError.message, data: [] };
  }

  if (!mealPlans || mealPlans.length === 0) {
    return { error: null, data: [] };
  }

  const mealPlanIds = mealPlans.map((mp) => mp.id);
  const mealPlanIdToWeek = new Map(mealPlans.map((mp) => [mp.id, mp.week_start]));

  // Get all assignments with recipe details
  const { data: assignments, error: assignmentsError } = await supabase
    .from("meal_assignments")
    .select(
      `
      recipe_id,
      meal_plan_id,
      recipe:recipes(id, title)
    `
    )
    .in("meal_plan_id", mealPlanIds);

  if (assignmentsError) {
    return { error: assignmentsError.message, data: [] };
  }

  // Count recipe occurrences across weeks
  const recipeCounts = new Map<string, { title: string; count: number; weeks: Set<string> }>();

  for (const assignment of assignments || []) {
    const recipe = assignment.recipe as unknown as { id: string; title: string } | null;
    if (!recipe) continue;

    const week = mealPlanIdToWeek.get(assignment.meal_plan_id) || "";

    if (recipeCounts.has(recipe.id)) {
      const existing = recipeCounts.get(recipe.id)!;
      existing.count++;
      existing.weeks.add(week);
    } else {
      recipeCounts.set(recipe.id, {
        title: recipe.title,
        count: 1,
        weeks: new Set([week]),
      });
    }
  }

  // Filter to recipes that appear 3+ times (warning threshold)
  const warnings = Array.from(recipeCounts.entries())
    .filter(([, data]) => data.count >= 3)
    .map(([recipeId, data]) => ({
      recipeId,
      recipeTitle: data.title,
      count: data.count,
      weeks: Array.from(data.weeks).sort(),
    }))
    .sort((a, b) => b.count - a.count);

  return { error: null, data: warnings };
}
