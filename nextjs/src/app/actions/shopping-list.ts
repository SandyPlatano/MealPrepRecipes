"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  ShoppingList,
  ShoppingListItem,
  ShoppingListWithItems,
  NewShoppingListItem,
} from "@/types/shopping-list";
import {
  mergeShoppingItems,
  type MergeableItem,
} from "@/lib/ingredient-scaler";
import { getWeekStart } from "@/types/meal-plan";

// Get or create the current shopping list for the household
// Automatically links to the current week's meal plan
export async function getOrCreateShoppingList() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  // Get user's household
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return { error: "No household found", data: null };
  }

  // Get the current week start
  const weekStart = getWeekStart(new Date());
  const weekStartStr = weekStart.toISOString().split("T")[0];

  // Find or create the current week's meal plan
  let { data: mealPlan } = await supabase
    .from("meal_plans")
    .select("*")
    .eq("household_id", membership.household_id)
    .eq("week_start", weekStartStr)
    .single();

  if (!mealPlan) {
    // Create meal plan for this week
    const { data: newPlan, error: planError } = await supabase
      .from("meal_plans")
      .insert({
        household_id: membership.household_id,
        week_start: weekStartStr,
      })
      .select()
      .single();

    if (planError) {
      return { error: planError.message, data: null };
    }
    mealPlan = newPlan;
  }

  // Try to get existing shopping list linked to this meal plan
  let { data: shoppingList } = await supabase
    .from("shopping_lists")
    .select("*")
    .eq("meal_plan_id", mealPlan.id)
    .maybeSingle();

  // Create if doesn't exist
  if (!shoppingList) {
    const { data: newList, error } = await supabase
      .from("shopping_lists")
      .insert({
        household_id: membership.household_id,
        meal_plan_id: mealPlan.id,
      })
      .select()
      .single();

    if (error) {
      return { error: error.message, data: null };
    }
    shoppingList = newList;
  }

  return { error: null, data: shoppingList as ShoppingList };
}

// Get shopping list with all items
export async function getShoppingListWithItems(): Promise<{
  error: string | null;
  data: ShoppingListWithItems | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  // Get user's household
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return { error: "No household found", data: null };
  }

  // Get or create shopping list
  const listResult = await getOrCreateShoppingList();
  if (listResult.error || !listResult.data) {
    return { error: listResult.error, data: null };
  }

  // Get items
  const { data: items, error } = await supabase
    .from("shopping_list_items")
    .select("*")
    .eq("shopping_list_id", listResult.data.id)
    .order("category")
    .order("ingredient");

  if (error) {
    return { error: error.message, data: null };
  }

  return {
    error: null,
    data: {
      ...listResult.data,
      items: (items || []) as ShoppingListItem[],
    },
  };
}

// Add item to shopping list
export async function addShoppingListItem(item: NewShoppingListItem) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Get or create shopping list
  const listResult = await getOrCreateShoppingList();
  if (listResult.error || !listResult.data) {
    return { error: listResult.error || "Failed to get shopping list" };
  }

  const { error } = await supabase.from("shopping_list_items").insert({
    shopping_list_id: listResult.data.id,
    ingredient: item.ingredient,
    quantity: item.quantity || null,
    unit: item.unit || null,
    category: item.category || "Other",
    recipe_id: item.recipe_id || null,
    recipe_title: item.recipe_title || null,
    is_checked: false,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/shop");
  return { error: null };
}

// Toggle item checked status
export async function toggleShoppingListItem(itemId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Get current item status
  const { data: item } = await supabase
    .from("shopping_list_items")
    .select("is_checked")
    .eq("id", itemId)
    .single();

  if (!item) {
    return { error: "Item not found" };
  }

  // Toggle
  const { error } = await supabase
    .from("shopping_list_items")
    .update({ is_checked: !item.is_checked })
    .eq("id", itemId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/shop");
  return { error: null };
}

// Remove item from shopping list
export async function removeShoppingListItem(itemId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("shopping_list_items")
    .delete()
    .eq("id", itemId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/shop");
  return { error: null };
}

// Clear all checked items
export async function clearCheckedItems() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Get user's shopping list
  const listResult = await getOrCreateShoppingList();
  if (listResult.error || !listResult.data) {
    return { error: listResult.error || "Failed to get shopping list" };
  }

  const { error } = await supabase
    .from("shopping_list_items")
    .delete()
    .eq("shopping_list_id", listResult.data.id)
    .eq("is_checked", true);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/shop");
  return { error: null };
}

// Clear entire shopping list
export async function clearShoppingList() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Get user's shopping list
  const listResult = await getOrCreateShoppingList();
  if (listResult.error || !listResult.data) {
    return { error: listResult.error || "Failed to get shopping list" };
  }

  const { error } = await supabase
    .from("shopping_list_items")
    .delete()
    .eq("shopping_list_id", listResult.data.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/shop");
  return { error: null };
}

// Remove all items from a specific recipe
export async function removeItemsByRecipeId(recipeId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", count: 0 };
  }

  // Get user's shopping list
  const listResult = await getOrCreateShoppingList();
  if (listResult.error || !listResult.data) {
    return { error: listResult.error || "Failed to get shopping list", count: 0 };
  }

  // Count items before deletion for feedback
  const { count: itemCount } = await supabase
    .from("shopping_list_items")
    .select("*", { count: "exact", head: true })
    .eq("shopping_list_id", listResult.data.id)
    .eq("recipe_id", recipeId);

  const { error } = await supabase
    .from("shopping_list_items")
    .delete()
    .eq("shopping_list_id", listResult.data.id)
    .eq("recipe_id", recipeId);

  if (error) {
    return { error: error.message, count: 0 };
  }

  revalidatePath("/app/shop");
  return { error: null, count: itemCount || 0 };
}

// Generate shopping list from meal plan
// Uses the current week's meal plan (automatically linked via getOrCreateShoppingList)
export async function generateFromMealPlan() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", count: 0 };
  }

  // Get or create shopping list (automatically linked to current week's meal plan)
  const listResult = await getOrCreateShoppingList();
  if (listResult.error || !listResult.data) {
    return { error: listResult.error || "Failed to get shopping list", count: 0 };
  }

  const shoppingList = listResult.data;

  // Get meal plan from the shopping list
  if (!shoppingList.meal_plan_id) {
    return { error: "No meal plan linked to shopping list", count: 0 };
  }

  // Get all assignments with recipe details
  const { data: assignments } = await supabase
    .from("meal_assignments")
    .select(
      `
      recipe_id,
      recipe:recipes(id, title, ingredients)
    `
    )
    .eq("meal_plan_id", shoppingList.meal_plan_id);

  if (!assignments || assignments.length === 0) {
    return { error: "No meals planned for this week", count: 0 };
  }

  // Collect all ingredients from all recipes
  const ingredientsToAdd: MergeableItem[] = [];

  for (const assignment of assignments) {
    const recipe = assignment.recipe as unknown as {
      id: string;
      title: string;
      ingredients: string[];
    };

    if (recipe && recipe.ingredients) {
      for (const ingredient of recipe.ingredients) {
        // Parse ingredient (basic parsing - could be enhanced)
        const parsed = parseIngredient(ingredient);
        ingredientsToAdd.push({
          ...parsed,
          recipe_id: recipe.id,
          recipe_title: recipe.title,
        });
      }
    }
  }

  // Merge duplicate ingredients with smart unit conversion
  const mergedItems = mergeShoppingItems(ingredientsToAdd);

  // Get existing items in the shopping list to avoid duplicates
  const { data: existingItems } = await supabase
    .from("shopping_list_items")
    .select("ingredient, recipe_id")
    .eq("shopping_list_id", shoppingList.id);

  // Create a set of existing recipe IDs for quick lookup
  const existingRecipeIds = new Set(
    (existingItems || [])
      .filter(item => item.recipe_id)
      .map(item => item.recipe_id)
  );

  // Filter out items that are already in the list (by recipe_id)
  // This prevents duplicates when regenerating from the same meal plan
  const newItems = mergedItems.filter(item => {
    const recipeId = item.sources[0]?.recipe_id;
    return recipeId ? !existingRecipeIds.has(recipeId) : true;
  });

  // Add only new merged ingredients to shopping list
  if (newItems.length > 0) {
    const itemsToInsert = newItems.map((item) => ({
      shopping_list_id: shoppingList.id,
      ingredient: item.ingredient,
      quantity: item.quantity || null,
      unit: item.unit || null,
      category: item.category || "Other",
      // Store the first recipe source; sources array is for future display
      recipe_id: item.sources[0]?.recipe_id || null,
      recipe_title: item.sources.length > 1
        ? `${item.sources[0]?.recipe_title || "Recipe"} +${item.sources.length - 1} more`
        : item.sources[0]?.recipe_title || null,
      is_checked: false,
    }));

    const { error } = await supabase
      .from("shopping_list_items")
      .insert(itemsToInsert);

    if (error) {
      return { error: error.message, count: 0 };
    }
  }

  revalidatePath("/app/shop");
  return { error: null, count: newItems.length };
}

// Simple ingredient parser
function parseIngredient(ingredient: string): NewShoppingListItem {
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

  // Produce
  if (
    /lettuce|tomato|onion|garlic|pepper|carrot|celery|potato|spinach|kale|broccoli|cauliflower|cucumber|zucchini|squash|mushroom|apple|banana|orange|lemon|lime|berry|fruit|vegetable|herb|basil|cilantro|parsley|mint|avocado/i.test(
      lower
    )
  ) {
    return "Produce";
  }

  // Meat & Seafood
  if (
    /chicken|beef|pork|lamb|turkey|fish|salmon|shrimp|bacon|sausage|steak|ground|meat|seafood|tuna|cod|tilapia/i.test(
      lower
    )
  ) {
    return "Meat & Seafood";
  }

  // Dairy & Eggs
  if (
    /milk|cheese|butter|cream|yogurt|egg|sour cream|cottage|ricotta|mozzarella|cheddar|parmesan/i.test(
      lower
    )
  ) {
    return "Dairy & Eggs";
  }

  // Bakery
  if (/bread|roll|bun|bagel|tortilla|pita|croissant|muffin|baguette/i.test(lower)) {
    return "Bakery";
  }

  // Pantry
  if (
    /flour|sugar|rice|pasta|noodle|oil|vinegar|sauce|broth|stock|can|bean|lentil|chickpea|oat|cereal|honey|maple|soy sauce|sriracha/i.test(
      lower
    )
  ) {
    return "Pantry";
  }

  // Frozen
  if (/frozen|ice cream/i.test(lower)) {
    return "Frozen";
  }

  // Spices
  if (
    /salt|pepper|cumin|paprika|oregano|thyme|rosemary|cinnamon|nutmeg|ginger|turmeric|chili|cayenne|spice|seasoning|fennel|cardamom|coriander|clove|allspice|anise|caraway|dill|mustard seed/i.test(
      lower
    )
  ) {
    return "Spices";
  }

  // Condiments
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

// Generate shopping list from multiple weeks' meal plans (Pro+ feature)
export async function generateMultiWeekShoppingList(
  weekStarts: string[]
): Promise<{
  error: string | null;
  data: ShoppingListWithItems | null;
  itemCount: number;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null, itemCount: 0 };
  }

  if (!weekStarts || weekStarts.length === 0) {
    return { error: "No weeks selected", data: null, itemCount: 0 };
  }

  // Get user's household
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return { error: "No household found", data: null, itemCount: 0 };
  }

  // Get meal plans for all selected weeks
  const { data: mealPlans } = await supabase
    .from("meal_plans")
    .select("id")
    .eq("household_id", membership.household_id)
    .in("week_start", weekStarts);

  if (!mealPlans || mealPlans.length === 0) {
    return { error: "No meal plans found for selected weeks", data: null, itemCount: 0 };
  }

  const mealPlanIds = mealPlans.map((mp) => mp.id);

  // Get all assignments with recipe details from all selected weeks
  const { data: assignments } = await supabase
    .from("meal_assignments")
    .select(
      `
      recipe_id,
      recipe:recipes(id, title, ingredients)
    `
    )
    .in("meal_plan_id", mealPlanIds);

  if (!assignments || assignments.length === 0) {
    return { error: "No meals planned for selected weeks", data: null, itemCount: 0 };
  }

  // Collect all ingredients from all recipes
  const ingredientsToAdd: MergeableItem[] = [];

  for (const assignment of assignments) {
    const recipe = assignment.recipe as unknown as {
      id: string;
      title: string;
      ingredients: string[];
    };

    if (recipe && recipe.ingredients) {
      for (const ingredient of recipe.ingredients) {
        const parsed = parseIngredient(ingredient);
        ingredientsToAdd.push({
          ...parsed,
          recipe_id: recipe.id,
          recipe_title: recipe.title,
        });
      }
    }
  }

  // Merge duplicate ingredients with smart unit conversion
  const mergedItems = mergeShoppingItems(ingredientsToAdd);

  // Get or create shopping list for current week (default list)
  const listResult = await getOrCreateShoppingList();
  if (listResult.error || !listResult.data) {
    return { error: listResult.error || "Failed to get shopping list", data: null, itemCount: 0 };
  }

  const shoppingList = listResult.data;

  // Clear existing items before adding new multi-week items
  await supabase
    .from("shopping_list_items")
    .delete()
    .eq("shopping_list_id", shoppingList.id);

  // Add merged ingredients to shopping list
  const itemsToInsert = mergedItems.map((item) => ({
    shopping_list_id: shoppingList.id,
    ingredient: item.ingredient,
    quantity: item.quantity || null,
    unit: item.unit || null,
    category: item.category || "Other",
    recipe_id: item.sources[0]?.recipe_id || null,
    recipe_title:
      item.sources.length > 1
        ? `${item.sources[0]?.recipe_title || "Recipe"} +${item.sources.length - 1} more`
        : item.sources[0]?.recipe_title || null,
    is_checked: false,
  }));

  if (itemsToInsert.length > 0) {
    const { error } = await supabase
      .from("shopping_list_items")
      .insert(itemsToInsert);

    if (error) {
      return { error: error.message, data: null, itemCount: 0 };
    }
  }

  // Fetch the updated shopping list with items
  const { data: items, error: fetchError } = await supabase
    .from("shopping_list_items")
    .select("*")
    .eq("shopping_list_id", shoppingList.id)
    .order("category")
    .order("ingredient");

  if (fetchError) {
    return { error: fetchError.message, data: null, itemCount: 0 };
  }

  revalidatePath("/app/shop");

  return {
    error: null,
    data: {
      ...shoppingList,
      items: (items || []) as ShoppingListItem[],
    },
    itemCount: items?.length || 0,
  };
}
