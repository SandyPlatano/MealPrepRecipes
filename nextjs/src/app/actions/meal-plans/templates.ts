"use server";

/**
 * Meal Plan Templates Actions
 *
 * Actions for managing meal plan templates (create, apply, delete).
 */

import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import { revalidatePath, revalidateTag } from "next/cache";
import type {
  MealPlanTemplate,
  TemplateAssignment,
  DayOfWeek,
  MealType,
} from "@/types/meal-plan";
import { getOrCreateMealPlan } from "./core";
import { addRecipeToShoppingList } from "./helpers";

/**
 * Get all templates for the household
 */
export async function getMealPlanTemplates() {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "No household found", data: [] };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("meal_plan_templates")
    .select("id, household_id, name, assignments, created_at")
    .eq("household_id", household.household_id)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message, data: [] };
  }

  return { error: null, data: data as MealPlanTemplate[] };
}

/**
 * Create a template from the current week's meal plan
 */
export async function createMealPlanTemplate(name: string, weekStart: string) {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "No household found" };
  }

  const supabase = await createClient();

  // Get the meal plan for this week (might not exist - use maybeSingle)
  const { data: mealPlan } = await supabase
    .from("meal_plans")
    .select("id")
    .eq("household_id", household.household_id)
    .eq("week_start", weekStart)
    .maybeSingle();

  if (!mealPlan) {
    return { error: "No meal plan found for this week" };
  }

  // Get all assignments for this meal plan
  const { data: assignments, error: assignmentsError } = await supabase
    .from("meal_assignments")
    .select("recipe_id, day_of_week, cook, meal_type, serving_size")
    .eq("meal_plan_id", mealPlan.id);

  if (assignmentsError) {
    return { error: assignmentsError.message };
  }

  // Convert assignments to template format
  const templateAssignments: TemplateAssignment[] = (assignments || []).map((a) => ({
    recipe_id: a.recipe_id,
    day_of_week: a.day_of_week as DayOfWeek,
    cook: a.cook,
    meal_type: a.meal_type as MealType | null,
    serving_size: a.serving_size as number | null,
  }));

  // Create the template
  const { data: template, error: templateError } = await supabase
    .from("meal_plan_templates")
    .insert({
      household_id: household.household_id,
      name: name.trim(),
      assignments: templateAssignments,
    })
    .select()
    .single();

  if (templateError) {
    return { error: templateError.message };
  }

  revalidateTag(`meal-plan-${household.household_id}`, "default");
  return { error: null, data: template as MealPlanTemplate };
}

/**
 * Update a template
 */
export async function updateMealPlanTemplate(
  templateId: string,
  updates: { name?: string; assignments?: TemplateAssignment[] }
) {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "No household found" };
  }

  const supabase = await createClient();

  const updateData: Partial<MealPlanTemplate> = {};
  if (updates.name !== undefined) {
    updateData.name = updates.name.trim();
  }
  if (updates.assignments !== undefined) {
    updateData.assignments = updates.assignments;
  }

  const { data: template, error } = await supabase
    .from("meal_plan_templates")
    .update(updateData)
    .eq("id", templateId)
    .eq("household_id", household.household_id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidateTag(`meal-plan-${household.household_id}`, "default");
  return { error: null, data: template as MealPlanTemplate };
}

/**
 * Delete a template
 */
export async function deleteMealPlanTemplate(templateId: string) {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "No household found" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("meal_plan_templates")
    .delete()
    .eq("id", templateId)
    .eq("household_id", household.household_id);

  if (error) {
    return { error: error.message };
  }

  revalidateTag(`meal-plan-${household.household_id}`, "default");
  return { error: null };
}

/**
 * Apply a template to a specific week
 */
export async function applyMealPlanTemplate(templateId: string, weekStart: string) {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "No household found" };
  }

  const supabase = await createClient();

  // Get the template (might not exist - use maybeSingle)
  const { data: template, error: templateError } = await supabase
    .from("meal_plan_templates")
    .select("id, household_id, name, assignments, created_at")
    .eq("id", templateId)
    .eq("household_id", household.household_id)
    .maybeSingle();

  if (templateError) {
    return { error: templateError.message };
  }

  if (!template) {
    return { error: "Template not found" };
  }

  // Get or create meal plan for the week
  const planResult = await getOrCreateMealPlan(weekStart);
  if (planResult.error || !planResult.data) {
    return { error: planResult.error || "Failed to get meal plan" };
  }

  // Clear existing assignments for this week
  const { error: clearError } = await supabase
    .from("meal_assignments")
    .delete()
    .eq("meal_plan_id", planResult.data.id);

  if (clearError) {
    return { error: clearError.message };
  }

  // Apply template assignments
  const assignments = template.assignments as TemplateAssignment[];
  if (assignments.length > 0) {
    // Verify all recipes still exist and are accessible
    const recipeIds = Array.from(new Set(assignments.map((a) => a.recipe_id)));
    const { data: recipes } = await supabase
      .from("recipes")
      .select("id")
      .in("id", recipeIds)
      .or(
        `user_id.eq.${user.id},and(household_id.eq.${household.household_id},is_shared_with_household.eq.true)`
      );

    const validRecipeIds = new Set((recipes || []).map((r) => r.id));

    // Filter out assignments with invalid recipes
    const validAssignments = assignments.filter((a) => validRecipeIds.has(a.recipe_id));

    if (validAssignments.length > 0) {
      const assignmentsToInsert = validAssignments.map((a) => ({
        meal_plan_id: planResult.data.id,
        recipe_id: a.recipe_id,
        day_of_week: a.day_of_week,
        cook: a.cook,
        meal_type: a.meal_type ?? null,
        serving_size: a.serving_size ?? null,
      }));

      const { error: insertError } = await supabase
        .from("meal_assignments")
        .insert(assignmentsToInsert);

      if (insertError) {
        return { error: insertError.message };
      }

      // Add ingredients to shopping list for all recipes (batched query, with scaling)
      const assignmentRecipeIds = Array.from(new Set(validAssignments.map((a) => a.recipe_id)));
      const { data: recipesWithIngredients } = await supabase
        .from("recipes")
        .select("id, title, ingredients, base_servings")
        .in("id", assignmentRecipeIds);

      if (recipesWithIngredients) {
        const recipeMap = new Map(recipesWithIngredients.map((r) => [r.id, r]));

        for (const assignment of validAssignments) {
          const recipe = recipeMap.get(assignment.recipe_id);
          if (recipe && recipe.ingredients && recipe.ingredients.length > 0) {
            await addRecipeToShoppingList(
              supabase,
              household.household_id,
              planResult.data.id,
              assignment.recipe_id,
              recipe.title,
              recipe.ingredients,
              assignment.serving_size,
              recipe.base_servings
            );
          }
        }
      }
    }
  }

  revalidateTag(`meal-plan-${household.household_id}`, "default");
  revalidatePath("/app");
  revalidatePath("/app/plan");
  revalidatePath("/app/shop");
  return { error: null };
}

/**
 * Create a template from an existing meal plan (by plan ID)
 */
export async function createMealPlanTemplateFromPlan(
  planId: string,
  templateName: string
): Promise<{
  error: string | null;
  data?: MealPlanTemplate;
}> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "No household found" };
  }

  if (!templateName.trim()) {
    return { error: "Template name is required" };
  }

  const supabase = await createClient();

  // Get the meal plan and verify ownership (might not exist - use maybeSingle)
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
    return { error: "Not authorized to access this meal plan" };
  }

  // Get all assignments for this plan
  const { data: assignments, error: assignmentsError } = await supabase
    .from("meal_assignments")
    .select("recipe_id, day_of_week, cook, meal_type, serving_size")
    .eq("meal_plan_id", planId);

  if (assignmentsError) {
    return { error: assignmentsError.message };
  }

  if (!assignments || assignments.length === 0) {
    return { error: "No meals to save as template" };
  }

  // Create the template
  const templateAssignments = assignments.map((a) => ({
    recipe_id: a.recipe_id,
    day_of_week: a.day_of_week,
    cook: a.cook,
    meal_type: a.meal_type as MealType | null,
    serving_size: a.serving_size as number | null,
  }));

  const { data: template, error: createError } = await supabase
    .from("meal_plan_templates")
    .insert({
      household_id: household.household_id,
      name: templateName.trim(),
      assignments: templateAssignments,
    })
    .select()
    .single();

  if (createError) {
    return { error: createError.message };
  }

  return { error: null, data: template as MealPlanTemplate };
}
