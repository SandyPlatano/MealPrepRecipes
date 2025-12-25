"use server";

/**
 * Meal Plan Assignments Actions
 *
 * Actions for managing meal assignments (add, remove, update, move).
 */

import { createClient } from "@/lib/supabase/server";
import { getCachedUser, getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import { revalidatePath, revalidateTag } from "next/cache";
import type { DayOfWeek, MealType } from "@/types/meal-plan";
import { getOrCreateMealPlan } from "./core";
import { addRecipeToShoppingList, removeRecipeFromShoppingList } from "./helpers";

/**
 * Add a recipe to a day
 */
export async function addMealAssignment(
  weekStart: string,
  recipeId: string,
  dayOfWeek: DayOfWeek,
  cook?: string,
  mealType?: MealType | null,
  servingSize?: number | null
) {
  try {
    // Check authentication first
    const { user: authUser, error: authError } = await getCachedUser();

    if (authError || !authUser) {
      return { error: "Not authenticated" };
    }

    // Get household separately (required for meal planning)
    const { household } = await getCachedUserWithHousehold();

    if (!household) {
      return { error: "Please create or join a household to use meal planning" };
    }

    const supabase = await createClient();

    // Get or create meal plan
    const planResult = await getOrCreateMealPlan(weekStart);
    if (planResult.error || !planResult.data) {
      return { error: planResult.error || "Failed to get meal plan" };
    }

    // Add assignment with serving_size
    const { error } = await supabase.from("meal_assignments").insert({
      meal_plan_id: planResult.data.id,
      recipe_id: recipeId,
      day_of_week: dayOfWeek,
      cook: cook || null,
      meal_type: mealType ?? null,
      serving_size: servingSize ?? null,
    });

    if (error) {
      return { error: error.message };
    }

    // Auto-add recipe ingredients to shopping list (with scaling)
    const { data: recipe } = await supabase
      .from("recipes")
      .select("title, ingredients, base_servings")
      .eq("id", recipeId)
      .single();

    if (recipe && recipe.ingredients && recipe.ingredients.length > 0) {
      await addRecipeToShoppingList(
        supabase,
        household!.household_id,
        planResult.data.id,
        recipeId,
        recipe.title,
        recipe.ingredients,
        servingSize,
        recipe.base_servings
      );
    }

    revalidateTag(`meal-plan-${household!.household_id}`, "default");
    revalidatePath("/app");
    revalidatePath("/app/plan");
    revalidatePath("/app/shop");
    return { error: null };
  } catch (error) {
    console.error("addMealAssignment error:", error);
    return { error: "Failed to add meal. Please try again." };
  }
}

/**
 * Remove an assignment
 */
export async function removeMealAssignment(assignmentId: string) {
  try {
    // Check authentication first
    const { user: authUser, error: authError } = await getCachedUser();

    if (authError || !authUser) {
      return { error: "Not authenticated" };
    }

    // Get household separately (required for meal planning)
    const { household } = await getCachedUserWithHousehold();

    if (!household) {
      return { error: "Please create or join a household to use meal planning" };
    }

    const supabase = await createClient();

    // First get the assignment details before deleting (might already be deleted)
    const { data: assignment } = await supabase
      .from("meal_assignments")
      .select("meal_plan_id, recipe_id")
      .eq("id", assignmentId)
      .maybeSingle();

    // Delete the assignment
    const { error } = await supabase.from("meal_assignments").delete().eq("id", assignmentId);

    if (error) {
      return { error: error.message };
    }

    // Remove recipe ingredients from shopping list
    if (assignment) {
      // Check if this recipe is still assigned elsewhere in this meal plan
      const { data: otherAssignments } = await supabase
        .from("meal_assignments")
        .select("id")
        .eq("meal_plan_id", assignment.meal_plan_id)
        .eq("recipe_id", assignment.recipe_id);

      // Only remove from shopping list if no other assignments for this recipe
      if (!otherAssignments || otherAssignments.length === 0) {
        await removeRecipeFromShoppingList(supabase, assignment.meal_plan_id, assignment.recipe_id);
      }
    }

    revalidateTag(`meal-plan-${household!.household_id}`, "default");
    revalidatePath("/app");
    revalidatePath("/app/plan");
    revalidatePath("/app/shop");
    return { error: null };
  } catch (error) {
    console.error("removeMealAssignment error:", error);
    return { error: "Failed to remove meal. Please try again." };
  }
}

/**
 * Update assignment (change day, cook, meal type, or serving size)
 */
export async function updateMealAssignment(
  assignmentId: string,
  updates: {
    day_of_week?: DayOfWeek;
    cook?: string | null;
    meal_type?: MealType | null;
    serving_size?: number | null;
  }
) {
  try {
    // Check authentication first
    const { user: authUser, error: authError } = await getCachedUser();

    if (authError || !authUser) {
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
      revalidateTag(`meal-plan-${household.household_id}`, "default");
    }
    revalidatePath("/app");
    revalidatePath("/app/plan");
    revalidatePath("/app/shop");
    return { error: null };
  } catch (error) {
    console.error("updateMealAssignment error:", error);
    return { error: "Failed to update meal. Please try again." };
  }
}

/**
 * Move assignment to a different day (for drag and drop)
 */
export async function moveAssignment(assignmentId: string, newDay: DayOfWeek) {
  return updateMealAssignment(assignmentId, { day_of_week: newDay });
}

/**
 * Clear all assignments for a day
 */
export async function clearDayAssignments(weekStart: string, dayOfWeek: DayOfWeek) {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "No household found" };
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
    return { error: null }; // No plan means nothing to clear
  }

  // Get recipes being cleared from this day
  const { data: assignmentsToRemove } = await supabase
    .from("meal_assignments")
    .select("recipe_id")
    .eq("meal_plan_id", mealPlan.id)
    .eq("day_of_week", dayOfWeek);

  // Delete assignments for that day
  const { error } = await supabase
    .from("meal_assignments")
    .delete()
    .eq("meal_plan_id", mealPlan.id)
    .eq("day_of_week", dayOfWeek);

  if (error) {
    return { error: error.message };
  }

  // Remove ingredients for recipes that are no longer in the plan (batched check)
  if (assignmentsToRemove && assignmentsToRemove.length > 0) {
    const removedRecipeIds = Array.from(new Set(assignmentsToRemove.map((a) => a.recipe_id)));

    // Batch query: get all recipes that are still assigned in this meal plan
    const { data: remainingAssignments } = await supabase
      .from("meal_assignments")
      .select("recipe_id")
      .eq("meal_plan_id", mealPlan.id)
      .in("recipe_id", removedRecipeIds);

    const stillAssignedRecipeIds = new Set(remainingAssignments?.map((a) => a.recipe_id) || []);

    // Remove from shopping list only recipes that are no longer assigned anywhere
    for (const recipeId of removedRecipeIds) {
      if (!stillAssignedRecipeIds.has(recipeId)) {
        await removeRecipeFromShoppingList(supabase, mealPlan.id, recipeId);
      }
    }
  }

  revalidateTag(`meal-plan-${household.household_id}`, "default");
  revalidatePath("/app");
  revalidatePath("/app/plan");
  revalidatePath("/app/shop");
  return { error: null };
}
