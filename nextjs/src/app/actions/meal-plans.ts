"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import { revalidatePath, revalidateTag } from "next/cache";
import type {
  MealPlan,
  MealAssignmentWithRecipe,
  DayOfWeek,
  WeekPlanData,
  MealPlanTemplate,
  TemplateAssignment,
} from "@/types/meal-plan";
import {
  mergeShoppingItems,
  type MergeableItem,
} from "@/lib/ingredient-scaler";

// Helper to parse ingredient string into components
function parseIngredient(ingredient: string): {
  quantity?: string;
  unit?: string;
  ingredient: string;
  category: string;
} {
  // Try to extract quantity and unit from beginning
  // Pattern: "2 cups flour" or "1/2 lb chicken" or "3 large eggs"
  const quantityMatch = ingredient.match(
    /^([\d\/\.\s]+)?\s*(cups?|tbsp?|tsp?|oz|lb|lbs?|g|kg|ml|l|large|medium|small|cloves?|cans?|packages?|bunche?s?|heads?)?\s*(.+)$/i
  );

  if (quantityMatch) {
    return {
      quantity: quantityMatch[1]?.trim() || undefined,
      unit: quantityMatch[2]?.trim() || undefined,
      ingredient: quantityMatch[3]?.trim() || ingredient,
      category: guessCategory(ingredient),
    };
  }

  return {
    ingredient: ingredient.trim(),
    category: guessCategory(ingredient),
  };
}

// Guess ingredient category based on keywords
function guessCategory(ingredient: string): string {
  const lower = ingredient.toLowerCase();

  if (
    /lettuce|tomato|onion|garlic|pepper|carrot|celery|potato|spinach|kale|broccoli|cauliflower|cucumber|zucchini|squash|mushroom|apple|banana|orange|lemon|lime|berry|fruit|vegetable|herb|basil|cilantro|parsley|mint|avocado/i.test(
      lower
    )
  ) {
    return "Produce";
  }

  if (
    /chicken|beef|pork|lamb|turkey|fish|salmon|shrimp|bacon|sausage|steak|ground|meat|seafood|tuna|cod|tilapia/i.test(
      lower
    )
  ) {
    return "Meat & Seafood";
  }

  if (
    /milk|cheese|butter|cream|yogurt|egg|sour cream|cottage|ricotta|mozzarella|cheddar|parmesan/i.test(
      lower
    )
  ) {
    return "Dairy & Eggs";
  }

  if (/bread|roll|bun|bagel|tortilla|pita|croissant|muffin|baguette/i.test(lower)) {
    return "Bakery";
  }

  if (
    /flour|sugar|rice|pasta|noodle|oil|vinegar|sauce|broth|stock|can|bean|lentil|chickpea|oat|cereal|honey|maple|soy sauce|sriracha/i.test(
      lower
    )
  ) {
    return "Pantry";
  }

  if (/frozen|ice cream/i.test(lower)) {
    return "Frozen";
  }

  if (
    /salt|pepper|cumin|paprika|oregano|thyme|rosemary|cinnamon|nutmeg|ginger|turmeric|chili|cayenne|spice|seasoning/i.test(
      lower
    )
  ) {
    return "Spices";
  }

  if (
    /ketchup|mustard|mayo|mayonnaise|relish|hot sauce|bbq|dressing|salsa/i.test(
      lower
    )
  ) {
    return "Condiments";
  }

  if (/juice|soda|water|coffee|tea|wine|beer/i.test(lower)) {
    return "Beverages";
  }

  return "Other";
}

// Helper to add recipe ingredients to shopping list
async function addRecipeToShoppingList(
  supabase: Awaited<ReturnType<typeof createClient>>,
  householdId: string,
  mealPlanId: string,
  recipeId: string,
  recipeTitle: string,
  ingredients: string[]
) {
  // Get or create shopping list for this meal plan
  let { data: shoppingList } = await supabase
    .from("shopping_lists")
    .select("id")
    .eq("meal_plan_id", mealPlanId)
    .maybeSingle();

  if (!shoppingList) {
    const { data: newList, error: createError } = await supabase
      .from("shopping_lists")
      .insert({
        household_id: householdId,
        meal_plan_id: mealPlanId,
      })
      .select("id")
      .single();

    if (createError) {
      console.error("Failed to create shopping list:", createError);
      return;
    }
    shoppingList = newList;
  }

  // Parse and prepare ingredients for merging
  const ingredientsToAdd: MergeableItem[] = ingredients.map((ing) => {
    const parsed = parseIngredient(ing);
    return {
      ...parsed,
      recipe_id: recipeId,
      recipe_title: recipeTitle,
    };
  });

  // Merge ingredients (combines duplicates within this recipe)
  const mergedItems = mergeShoppingItems(ingredientsToAdd);

  // Insert items into shopping list
  if (mergedItems.length > 0) {
    const itemsToInsert = mergedItems.map((item) => ({
      shopping_list_id: shoppingList!.id,
      ingredient: item.ingredient,
      quantity: item.quantity || null,
      unit: item.unit || null,
      category: item.category || "Other",
      recipe_id: recipeId,
      recipe_title: recipeTitle,
      is_checked: false,
    }));

    const { error: insertError } = await supabase
      .from("shopping_list_items")
      .insert(itemsToInsert);

    if (insertError) {
      console.error("Failed to insert shopping list items:", insertError);
    }
  }
}

// Helper to remove recipe ingredients from shopping list
async function removeRecipeFromShoppingList(
  supabase: Awaited<ReturnType<typeof createClient>>,
  mealPlanId: string,
  recipeId: string
) {
  // Get shopping list for this meal plan
  const { data: shoppingList } = await supabase
    .from("shopping_lists")
    .select("id")
    .eq("meal_plan_id", mealPlanId)
    .maybeSingle();

  if (!shoppingList) return;

  // Delete items from this recipe
  const { error } = await supabase
    .from("shopping_list_items")
    .delete()
    .eq("shopping_list_id", shoppingList.id)
    .eq("recipe_id", recipeId);

  if (error) {
    console.error("Failed to remove shopping list items:", error);
  }
}

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
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
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

  // Auto-add recipe ingredients to shopping list
  const { data: recipe } = await supabase
    .from("recipes")
    .select("title, ingredients")
    .eq("id", recipeId)
    .single();

  if (recipe && recipe.ingredients && recipe.ingredients.length > 0) {
    await addRecipeToShoppingList(
      supabase,
      household.household_id,
      planResult.data.id,
      recipeId,
      recipe.title,
      recipe.ingredients
    );
  }

  revalidateTag(`meal-plan-${household.household_id}`);
  revalidatePath("/app/plan");
  revalidatePath("/app/shop");
  return { error: null };
}

// Remove an assignment
export async function removeMealAssignment(assignmentId: string) {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

  // First get the assignment details before deleting
  const { data: assignment } = await supabase
    .from("meal_assignments")
    .select("meal_plan_id, recipe_id")
    .eq("id", assignmentId)
    .single();

  // Delete the assignment
  const { error } = await supabase
    .from("meal_assignments")
    .delete()
    .eq("id", assignmentId);

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
      await removeRecipeFromShoppingList(
        supabase,
        assignment.meal_plan_id,
        assignment.recipe_id
      );
    }
  }

  revalidateTag(`meal-plan-${household.household_id}`);
  revalidatePath("/app/plan");
  revalidatePath("/app/shop");
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
  revalidatePath("/app/shop");
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
    const removedRecipeIds = Array.from(new Set(assignmentsToRemove.map(a => a.recipe_id)));

    // Batch query: get all recipes that are still assigned in this meal plan
    const { data: remainingAssignments } = await supabase
      .from("meal_assignments")
      .select("recipe_id")
      .eq("meal_plan_id", mealPlan.id)
      .in("recipe_id", removedRecipeIds);

    const stillAssignedRecipeIds = new Set(remainingAssignments?.map(a => a.recipe_id) || []);

    // Remove from shopping list only recipes that are no longer assigned anywhere
    for (const recipeId of removedRecipeIds) {
      if (!stillAssignedRecipeIds.has(recipeId)) {
        await removeRecipeFromShoppingList(supabase, mealPlan.id, recipeId);
      }
    }
  }

  revalidateTag(`meal-plan-${household.household_id}`);
  revalidatePath("/app/plan");
  revalidatePath("/app/shop");
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

// Get week plan with full recipe details (including ingredients) for finalize page
export async function getWeekPlanWithFullRecipes(weekStart: string) {
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
    // Get assignments with full recipe details including ingredients
    const { data: assignmentData } = await supabase
      .from("meal_assignments")
      .select(
        `
        *,
        recipe:recipes(*)
      `
      )
      .eq("meal_plan_id", mealPlan.id);

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

// Get week plan with minimal recipe data for shopping list (optimized query)
export async function getWeekPlanForShoppingList(weekStart: string) {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "No household found", data: null };
  }

  const supabase = await createClient();

  // Get meal plan for the week
  const { data: mealPlan } = await supabase
    .from("meal_plans")
    .select("id")
    .eq("household_id", household.household_id)
    .eq("week_start", weekStart)
    .single();

  if (!mealPlan) {
    return { error: null, data: null };
  }

  // Get assignments with only the fields needed for shopping list display
  const { data: assignmentData } = await supabase
    .from("meal_assignments")
    .select(`
      id,
      day_of_week,
      cook,
      recipe:recipes(id, title)
    `)
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

// ============================================
// MEAL PLAN TEMPLATE FUNCTIONS
// ============================================

// Get all templates for the household
export async function getMealPlanTemplates() {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "No household found", data: [] };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("meal_plan_templates")
    .select("*")
    .eq("household_id", household.household_id)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message, data: [] };
  }

  return { error: null, data: data as MealPlanTemplate[] };
}

// Create a template from the current week's meal plan
export async function createMealPlanTemplate(
  name: string,
  weekStart: string
) {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "No household found" };
  }

  const supabase = await createClient();

  // Get the meal plan for this week
  const { data: mealPlan } = await supabase
    .from("meal_plans")
    .select("id")
    .eq("household_id", household.household_id)
    .eq("week_start", weekStart)
    .single();

  if (!mealPlan) {
    return { error: "No meal plan found for this week" };
  }

  // Get all assignments for this meal plan
  const { data: assignments, error: assignmentsError } = await supabase
    .from("meal_assignments")
    .select("recipe_id, day_of_week, cook")
    .eq("meal_plan_id", mealPlan.id);

  if (assignmentsError) {
    return { error: assignmentsError.message };
  }

  // Convert assignments to template format
  const templateAssignments: TemplateAssignment[] = (assignments || []).map(
    (a) => ({
      recipe_id: a.recipe_id,
      day_of_week: a.day_of_week as DayOfWeek,
      cook: a.cook,
    })
  );

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

  revalidateTag(`meal-plan-${household.household_id}`);
  return { error: null, data: template as MealPlanTemplate };
}

// Update a template
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

  revalidateTag(`meal-plan-${household.household_id}`);
  return { error: null, data: template as MealPlanTemplate };
}

// Delete a template
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

  revalidateTag(`meal-plan-${household.household_id}`);
  return { error: null };
}

// Apply a template to a specific week
export async function applyMealPlanTemplate(
  templateId: string,
  weekStart: string
) {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "No household found" };
  }

  const supabase = await createClient();

  // Get the template
  const { data: template, error: templateError } = await supabase
    .from("meal_plan_templates")
    .select("*")
    .eq("id", templateId)
    .eq("household_id", household.household_id)
    .single();

  if (templateError || !template) {
    return { error: templateError?.message || "Template not found" };
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
    const validAssignments = assignments.filter((a) =>
      validRecipeIds.has(a.recipe_id)
    );

    if (validAssignments.length > 0) {
      const assignmentsToInsert = validAssignments.map((a) => ({
        meal_plan_id: planResult.data.id,
        recipe_id: a.recipe_id,
        day_of_week: a.day_of_week,
        cook: a.cook,
      }));

      const { error: insertError } = await supabase
        .from("meal_assignments")
        .insert(assignmentsToInsert);

      if (insertError) {
        return { error: insertError.message };
      }

      // Add ingredients to shopping list for all recipes (batched query)
      const assignmentRecipeIds = Array.from(new Set(validAssignments.map(a => a.recipe_id)));
      const { data: recipesWithIngredients } = await supabase
        .from("recipes")
        .select("id, title, ingredients")
        .in("id", assignmentRecipeIds);

      if (recipesWithIngredients) {
        const recipeMap = new Map(recipesWithIngredients.map(r => [r.id, r]));

        for (const assignment of validAssignments) {
          const recipe = recipeMap.get(assignment.recipe_id);
          if (recipe && recipe.ingredients && recipe.ingredients.length > 0) {
            await addRecipeToShoppingList(
              supabase,
              household.household_id,
              planResult.data.id,
              assignment.recipe_id,
              recipe.title,
              recipe.ingredients
            );
          }
        }
      }
    }
  }

  revalidateTag(`meal-plan-${household.household_id}`);
  revalidatePath("/app/plan");
  revalidatePath("/app/shop");
  return { error: null };
}
