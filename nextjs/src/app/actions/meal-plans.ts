"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import { revalidatePath, revalidateTag } from "next/cache";
import type {
  MealPlan,
  MealAssignmentWithRecipe,
  DayOfWeek,
  WeekPlanData,
} from "@/types/meal-plan";

// Get or create a meal plan for a specific week
export async function getOrCreateMealPlan(weekStart: string) {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "No household found", data: null };
  }

  const supabase = await createClient();

  // Try to get existing meal plan
  let { data: mealPlan } = await supabase
    .from("meal_plans")
    .select("*")
    .eq("household_id", household.household_id)
    .eq("week_start", weekStart)
    .single();

  // Create if doesn't exist
  if (!mealPlan) {
    const { data: newPlan, error } = await supabase
      .from("meal_plans")
      .insert({
        household_id: household.household_id,
        week_start: weekStart,
      })
      .select()
      .single();

    if (error) {
      return { error: error.message, data: null };
    }
    mealPlan = newPlan;
  }

  return { error: null, data: mealPlan as MealPlan };
}

// Get week plan data with all assignments
export async function getWeekPlan(weekStart: string): Promise<{
  error: string | null;
  data: WeekPlanData | null;
}> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "No household found", data: null };
  }

  const supabase = await createClient();

  // Get meal plan for the week
  const { data: mealPlan } = await supabase
    .from("meal_plans")
    .select("*")
    .eq("household_id", household.household_id)
    .eq("week_start", weekStart)
    .single();

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

// Add a recipe to a day
export async function addMealAssignment(
  weekStart: string,
  recipeId: string,
  dayOfWeek: DayOfWeek,
  cook?: string
) {
  const { user, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

  // Get or create meal plan
  const planResult = await getOrCreateMealPlan(weekStart);
  if (planResult.error || !planResult.data) {
    return { error: planResult.error || "Failed to get meal plan" };
  }

  // Add assignment
  const { error } = await supabase.from("meal_assignments").insert({
    meal_plan_id: planResult.data.id,
    recipe_id: recipeId,
    day_of_week: dayOfWeek,
    cook: cook || null,
  });

  if (error) {
    return { error: error.message };
  }

  // Get household for cache tag
  const { household } = await getCachedUserWithHousehold();
  if (household) {
    revalidateTag(`meal-plan-${household.household_id}`);
  }
  revalidatePath("/app/plan");
  return { error: null };
}

// Remove an assignment
export async function removeMealAssignment(assignmentId: string) {
  const { user, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("meal_assignments")
    .delete()
    .eq("id", assignmentId);

  if (error) {
    return { error: error.message };
  }

  // Get household for cache tag
  const { household } = await getCachedUserWithHousehold();
  if (household) {
    revalidateTag(`meal-plan-${household.household_id}`);
  }
  revalidatePath("/app/plan");
  return { error: null };
}

// Update assignment (change day or cook)
export async function updateMealAssignment(
  assignmentId: string,
  updates: { day_of_week?: DayOfWeek; cook?: string }
) {
  const { user, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("meal_assignments")
    .update(updates)
    .eq("id", assignmentId);

  if (error) {
    return { error: error.message };
  }

  // Get household for cache tag
  const { household } = await getCachedUserWithHousehold();
  if (household) {
    revalidateTag(`meal-plan-${household.household_id}`);
  }
  revalidatePath("/app/plan");
  return { error: null };
}

// Move assignment to a different day (for drag and drop)
export async function moveAssignment(
  assignmentId: string,
  newDay: DayOfWeek
) {
  return updateMealAssignment(assignmentId, { day_of_week: newDay });
}

// Get recipes available for planning (user's + household shared)
export async function getRecipesForPlanning() {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user) {
    return { error: "Not authenticated", data: [] };
  }

  const supabase = await createClient();

  // Get recipes
  const { data, error } = await supabase
    .from("recipes")
    .select("id, title, recipe_type, category, prep_time, cook_time, tags")
    .or(
      `user_id.eq.${user.id},and(household_id.eq.${household?.household_id},is_shared_with_household.eq.true)`
    )
    .order("title");

  if (error) {
    return { error: error.message, data: [] };
  }

  return { error: null, data };
}

// Clear all assignments for a day
export async function clearDayAssignments(weekStart: string, dayOfWeek: DayOfWeek) {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "No household found" };
  }

  const supabase = await createClient();

  // Get the meal plan
  const { data: mealPlan } = await supabase
    .from("meal_plans")
    .select("id")
    .eq("household_id", household.household_id)
    .eq("week_start", weekStart)
    .single();

  if (!mealPlan) {
    return { error: null }; // No plan means nothing to clear
  }

  // Delete assignments for that day
  const { error } = await supabase
    .from("meal_assignments")
    .delete()
    .eq("meal_plan_id", mealPlan.id)
    .eq("day_of_week", dayOfWeek);

  if (error) {
    return { error: error.message };
  }

  revalidateTag(`meal-plan-${household.household_id}`);
  revalidatePath("/app/plan");
  return { error: null };
}

// Mark a meal plan as sent (finalized)
export async function markMealPlanAsSent(weekStart: string) {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "No household found" };
  }

  const supabase = await createClient();

  // Update the meal plan to mark it as sent
  const { error } = await supabase
    .from("meal_plans")
    .update({ sent_at: new Date().toISOString() })
    .eq("household_id", household.household_id)
    .eq("week_start", weekStart);

  if (error) {
    return { error: error.message };
  }

  revalidateTag(`meal-plan-${household.household_id}`);
  revalidatePath("/app/history");
  return { error: null };
}

// Get all past meal plans that were sent
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
