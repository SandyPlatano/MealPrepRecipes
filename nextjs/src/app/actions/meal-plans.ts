"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedUser, getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
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
    /salt|pepper|cumin|paprika|oregano|thyme|rosemary|cinnamon|nutmeg|ginger|turmeric|chili|cayenne|spice|seasoning|fennel|cardamom|coriander|clove|allspice|anise|caraway|dill|mustard seed/i.test(
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

  // Beverages (using word boundaries to prevent "tea" matching "teaspoon")
  if (/\b(juice|soda|water|coffee|tea|wine|beer)\b/i.test(lower)) {
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

  // Try to get existing meal plan
  let { data: mealPlan } = await supabase
    .from("meal_plans")
    .select("*")
    .eq("household_id", household!.household_id)
    .eq("week_start", weekStart)
    .single();

  // Create if doesn't exist
  if (!mealPlan) {
    const { data: newPlan, error } = await supabase
      .from("meal_plans")
      .insert({
        household_id: household!.household_id,
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

  // Get meal plan for the week
  const { data: mealPlan } = await supabase
    .from("meal_plans")
    .select("*")
    .eq("household_id", household!.household_id)
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
      household!.household_id,
      planResult.data.id,
      recipeId,
      recipe.title,
      recipe.ingredients
    );
  }

  revalidateTag(`meal-plan-${household!.household_id}`);
  revalidatePath("/app");
  revalidatePath("/app/plan");
  revalidatePath("/app/shop");
  return { error: null };
}

// Remove an assignment
export async function removeMealAssignment(assignmentId: string) {
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

  revalidateTag(`meal-plan-${household!.household_id}`);
  revalidatePath("/app");
  revalidatePath("/app/plan");
  revalidatePath("/app/shop");
  return { error: null };
}

// Update assignment (change day or cook)
export async function updateMealAssignment(
  assignmentId: string,
  updates: { day_of_week?: DayOfWeek; cook?: string }
) {
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
    revalidateTag(`meal-plan-${household.household_id}`);
  }
  revalidatePath("/app");
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
  revalidatePath("/app");
  revalidatePath("/app/plan");
  revalidatePath("/app/shop");
  return { error: null };
}

// Mark a meal plan as sent (finalized)
export async function markMealPlanAsSent(weekStart: string) {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    console.error("[markMealPlanAsSent] Auth error:", authError?.message || "No household found");
    return { error: authError?.message || "No household found" };
  }

  const supabase = await createClient();

  // First, check if meal plan exists
  const { data: existingPlans, error: fetchError } = await supabase
    .from("meal_plans")
    .select("id, week_start, sent_at")
    .eq("household_id", household.household_id)
    .eq("week_start", weekStart);

  if (fetchError) {
    console.error("[markMealPlanAsSent] Fetch error:", fetchError.message);
    return { error: fetchError.message };
  }

  if (!existingPlans || existingPlans.length === 0) {
    console.error("[markMealPlanAsSent] No meal plan found for week:", weekStart, "household:", household.household_id);
    return { error: "No meal plan found for this week" };
  }

  const existingPlan = existingPlans[0];
  console.log("[markMealPlanAsSent] Found meal plan:", existingPlan.id, "for week:", weekStart);

  // Update the meal plan to mark it as sent
  const { data: updatedPlans, error } = await supabase
    .from("meal_plans")
    .update({ sent_at: new Date().toISOString() })
    .eq("id", existingPlan.id)
    .select();

  if (error) {
    console.error("[markMealPlanAsSent] Update error:", error.message);
    return { error: error.message };
  }

  if (!updatedPlans || updatedPlans.length === 0) {
    console.error("[markMealPlanAsSent] Update returned no data");
    return { error: "Failed to update meal plan" };
  }

  console.log("[markMealPlanAsSent] Successfully updated meal plan:", updatedPlans[0].id, "sent_at:", updatedPlans[0].sent_at);

  revalidateTag(`meal-plan-${household.household_id}`);
  revalidatePath("/app/history");
  return { error: null, data: updatedPlans[0] };
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
  // Match the auth pattern of getWeekPlan for consistency
  const { user: authUser, error: authError } = await getCachedUser();

  if (authError || !authUser) {
    console.error("[getWeekPlanWithFullRecipes] Auth error:", authError?.message || "Not authenticated");
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
    .select("*")
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
  revalidatePath("/app");
  revalidatePath("/app/plan");
  revalidatePath("/app/shop");
  return { error: null };
}

// Clear all meal assignments for an entire week
export async function clearWeekMealPlan(weekStart: string): Promise<{
  error: string | null;
  clearedCount: number;
}> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "No household found", clearedCount: 0 };
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

  // Clear the shopping list for this meal plan
  const { data: shoppingList } = await supabase
    .from("shopping_lists")
    .select("id")
    .eq("meal_plan_id", mealPlan.id)
    .single();

  if (shoppingList) {
    await supabase
      .from("shopping_list_items")
      .delete()
      .eq("shopping_list_id", shoppingList.id);
  }

  revalidateTag(`meal-plan-${household.household_id}`);
  revalidatePath("/app");
  revalidatePath("/app/plan");
  revalidatePath("/app/shop");
  return { error: null, clearedCount };
}

// Get meal counts for multiple weeks (for multi-week shopping list selector)
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

// Get recipe repetition warnings across weeks (shows recipes that appear multiple times)
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
    .select(`
      recipe_id,
      meal_plan_id,
      recipe:recipes(id, title)
    `)
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

// Delete a meal plan from history
export async function deleteMealPlan(planId: string): Promise<{
  error: string | null;
}> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "No household found" };
  }

  const supabase = await createClient();

  // Verify the meal plan belongs to this household
  const { data: mealPlan, error: fetchError } = await supabase
    .from("meal_plans")
    .select("id, household_id")
    .eq("id", planId)
    .single();

  if (fetchError || !mealPlan) {
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
  const { error: deleteError } = await supabase
    .from("meal_plans")
    .delete()
    .eq("id", planId);

  if (deleteError) {
    return { error: deleteError.message };
  }

  revalidateTag(`meal-plan-${household.household_id}`);
  revalidatePath("/app/history");
  return { error: null };
}

// Create a template from an existing meal plan (by plan ID)
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

  // Get the meal plan and verify ownership
  const { data: mealPlan, error: fetchError } = await supabase
    .from("meal_plans")
    .select("id, household_id")
    .eq("id", planId)
    .single();

  if (fetchError || !mealPlan) {
    return { error: "Meal plan not found" };
  }

  if (mealPlan.household_id !== household.household_id) {
    return { error: "Not authorized to access this meal plan" };
  }

  // Get all assignments for this plan
  const { data: assignments, error: assignmentsError } = await supabase
    .from("meal_assignments")
    .select("recipe_id, day_of_week, cook")
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
