/**
 * Meal Plans Helpers
 *
 * Internal utility functions for meal plan operations.
 * These are not exported from the public API.
 * Note: No "use server" directive - these are internal helpers called by server actions.
 */

import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import {
  mergeShoppingItems,
  type MergeableItem,
} from "@/lib/ingredient-scaler";

// Helper to parse ingredient string into components
export function parseIngredient(ingredient: string): {
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
export function guessCategory(ingredient: string): string {
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

// Helper to scale a quantity string by a multiplier
export function scaleQuantity(quantity: string | undefined, scale: number): string | undefined {
  if (!quantity || scale === 1) return quantity;

  // Parse the quantity (handles fractions like "1/2", decimals like "1.5", and whole numbers)
  const trimmed = quantity.trim();

  // Handle fraction format (e.g., "1/2", "3/4")
  const fractionMatch = trimmed.match(/^(\d+)\/(\d+)$/);
  if (fractionMatch) {
    const numerator = parseInt(fractionMatch[1], 10);
    const denominator = parseInt(fractionMatch[2], 10);
    const value = (numerator / denominator) * scale;
    // Return as decimal if not a clean fraction
    return value % 1 === 0 ? value.toString() : value.toFixed(2).replace(/\.?0+$/, "");
  }

  // Handle mixed number format (e.g., "1 1/2")
  const mixedMatch = trimmed.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixedMatch) {
    const whole = parseInt(mixedMatch[1], 10);
    const numerator = parseInt(mixedMatch[2], 10);
    const denominator = parseInt(mixedMatch[3], 10);
    const value = (whole + numerator / denominator) * scale;
    return value % 1 === 0 ? value.toString() : value.toFixed(2).replace(/\.?0+$/, "");
  }

  // Handle simple number (integer or decimal)
  const num = parseFloat(trimmed);
  if (!isNaN(num)) {
    const scaled = num * scale;
    return scaled % 1 === 0 ? scaled.toString() : scaled.toFixed(2).replace(/\.?0+$/, "");
  }

  // Return original if we can't parse it
  return quantity;
}

// Helper to add recipe ingredients to shopping list
export async function addRecipeToShoppingList(
  supabase: Awaited<ReturnType<typeof createClient>>,
  householdId: string,
  mealPlanId: string,
  recipeId: string,
  recipeTitle: string,
  ingredients: string[],
  servingSize?: number | null,
  recipeBaseServings?: number | null
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

  // Calculate scaling ratio based on serving size
  const scale =
    servingSize && recipeBaseServings && recipeBaseServings > 0
      ? servingSize / recipeBaseServings
      : 1;

  // Parse and prepare ingredients for merging
  const ingredientsToAdd: MergeableItem[] = ingredients.map((ing) => {
    const parsed = parseIngredient(ing);
    return {
      ...parsed,
      // Scale the quantity if we have a valid scale factor
      quantity: scaleQuantity(parsed.quantity, scale),
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
export async function removeRecipeFromShoppingList(
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

// Internal helper to mark a meal plan as sent (finalized)
// Used by both render-safe and revalidating versions
export async function markMealPlanAsSentInternal(weekStart: string) {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    console.error("[markMealPlanAsSent] Auth error:", authError?.message || "No household found");
    return { error: authError?.message || "No household found", householdId: null };
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
    return { error: fetchError.message, householdId: household.household_id };
  }

  if (!existingPlans || existingPlans.length === 0) {
    console.error(
      "[markMealPlanAsSent] No meal plan found for week:",
      weekStart,
      "household:",
      household.household_id
    );
    return { error: "No meal plan found for this week", householdId: household.household_id };
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
    return { error: error.message, householdId: household.household_id };
  }

  if (!updatedPlans || updatedPlans.length === 0) {
    console.error("[markMealPlanAsSent] Update returned no data");
    return { error: "Failed to update meal plan", householdId: household.household_id };
  }

  console.log(
    "[markMealPlanAsSent] Successfully updated meal plan:",
    updatedPlans[0].id,
    "sent_at:",
    updatedPlans[0].sent_at
  );

  return { error: null, data: updatedPlans[0], householdId: household.household_id };
}
