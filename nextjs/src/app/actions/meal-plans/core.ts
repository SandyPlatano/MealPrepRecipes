"use server";

/**
 * Meal Plans Core Actions
 *
 * Core CRUD operations for meal plans.
 */

import { createClient } from "@/lib/supabase/server";
import { getCachedUser, getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import { revalidatePath, revalidateTag } from "next/cache";
import type {
  MealPlan,
  MealAssignmentWithRecipe,
  DayOfWeek,
  WeekPlanData,
} from "@/types/meal-plan";

/**
 * Get or create a meal plan for a specific week
 */
export async function getOrCreateMealPlan(weekStart: string) {
  try {
    // Check authentication first
    const { user: authUser, error: authError } = await getCachedUser();

    if (authError || !authUser) {
      return { error: "Not authenticated", data: null };
    }

    // Get household separately (required for meal planning)
    const { household } = await getCachedUserWithHousehold();

    if (!household) {
      return { error: "Please create or join a household to use meal planning", data: null };
    }

    const supabase = await createClient();

    // Use upsert with ON CONFLICT to prevent race conditions
    // This atomically either inserts or returns existing row
    const { data: mealPlan, error } = await supabase
      .from("meal_plans")
      .upsert(
        {
          household_id: household!.household_id,
          week_start: weekStart,
        },
        {
          onConflict: "household_id,week_start",
          ignoreDuplicates: false,
        }
      )
      .select("id, household_id, week_start, sent_at, created_at, updated_at")
      .single();

    if (error) {
      return { error: error.message, data: null };
    }

    return { error: null, data: mealPlan as MealPlan };
  } catch (error) {
    console.error("getOrCreateMealPlan error:", error);
    return { error: "Failed to load meal plan. Please try again.", data: null };
  }
}

/**
 * Get week plan data with all assignments
 */
export async function getWeekPlan(weekStart: string): Promise<{
  error: string | null;
  data: WeekPlanData | null;
}> {
  // Check authentication first
  const { user: authUser, error: authError } = await getCachedUser();

  if (authError || !authUser) {
    return { error: "Not authenticated", data: null };
  }

  // Get household separately (required for meal planning)
  const { household } = await getCachedUserWithHousehold();

  if (!household) {
    return { error: "Please create or join a household to use meal planning", data: null };
  }

  const supabase = await createClient();

  // Get meal plan for the week (might not exist - use maybeSingle)
  const { data: mealPlan } = await supabase
    .from("meal_plans")
    .select("id, household_id, week_start, sent_at, created_at, updated_at")
    .eq("household_id", household!.household_id)
    .eq("week_start", weekStart)
    .maybeSingle();

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
    // Get assignments with recipe details
    const { data: assignmentData } = await supabase
      .from("meal_assignments")
      .select(
        `
        *,
        recipe:recipes(id, title, recipe_type, prep_time, cook_time)
      `
      )
      .eq("meal_plan_id", mealPlan.id);

    if (assignmentData) {
      for (const assignment of assignmentData) {
        const day = assignment.day_of_week as DayOfWeek;
        if (assignments[day]) {
          assignments[day].push(assignment as MealAssignmentWithRecipe);
        }
      }
    }
  }

  return {
    error: null,
    data: {
      meal_plan: mealPlan as MealPlan | null,
      assignments,
    },
  };
}

/**
 * Clear all meal assignments for an entire week
 */
export async function clearWeekMealPlan(weekStart: string): Promise<{
  error: string | null;
  clearedCount: number;
}> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "No household found", clearedCount: 0 };
  }

  const supabase = await createClient();

  // Get the meal plan (might not exist - use maybeSingle)
  const { data: mealPlan } = await supabase
    .from("meal_plans")
    .select("id")
    .eq("household_id", household.household_id)
    .eq("week_start", weekStart)
    .maybeSingle();

  if (!mealPlan) {
    return { error: null, clearedCount: 0 }; // No plan means nothing to clear
  }

  // Count assignments before clearing
  const { count } = await supabase
    .from("meal_assignments")
    .select("id", { count: "exact", head: true })
    .eq("meal_plan_id", mealPlan.id);

  const clearedCount = count || 0;

  // Delete all assignments for this week
  const { error } = await supabase
    .from("meal_assignments")
    .delete()
    .eq("meal_plan_id", mealPlan.id);

  if (error) {
    return { error: error.message, clearedCount: 0 };
  }

  // Clear the shopping list for this meal plan (might not exist - use maybeSingle)
  const { data: shoppingList } = await supabase
    .from("shopping_lists")
    .select("id")
    .eq("meal_plan_id", mealPlan.id)
    .maybeSingle();

  if (shoppingList) {
    await supabase
      .from("shopping_list_items")
      .delete()
      .eq("shopping_list_id", shoppingList.id);
  }

  revalidateTag(`meal-plan-${household.household_id}`, "default");
  revalidatePath("/app");
  revalidatePath("/app/plan");
  revalidatePath("/app/shop");
  return { error: null, clearedCount };
}

/**
 * Delete a meal plan from history
 */
export async function deleteMealPlan(planId: string): Promise<{
  error: string | null;
}> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "No household found" };
  }

  const supabase = await createClient();

  // Verify the meal plan belongs to this household (might not exist - use maybeSingle)
  const { data: mealPlan, error: fetchError } = await supabase
    .from("meal_plans")
    .select("id, household_id")
    .eq("id", planId)
    .maybeSingle();

  if (fetchError) {
    return { error: fetchError.message };
  }

  if (!mealPlan) {
    return { error: "Meal plan not found" };
  }

  if (mealPlan.household_id !== household.household_id) {
    return { error: "Not authorized to delete this meal plan" };
  }

  // Delete assignments first (foreign key constraint)
  const { error: assignmentError } = await supabase
    .from("meal_assignments")
    .delete()
    .eq("meal_plan_id", planId);

  if (assignmentError) {
    return { error: assignmentError.message };
  }

  // Delete the meal plan
  const { error: deleteError } = await supabase.from("meal_plans").delete().eq("id", planId);

  if (deleteError) {
    return { error: deleteError.message };
  }

  revalidateTag(`meal-plan-${household.household_id}`, "default");
  revalidatePath("/app/history");
  return { error: null };
}
