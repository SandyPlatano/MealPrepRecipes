"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  ShoppingListItem,
  ShoppingListWithItems,
} from "@/types/shopping-list";
import {
  mergeShoppingItems,
  type MergeableItem,
} from "@/lib/ingredient-scaler";
import { getOrCreateShoppingList } from "./read";
import { parseIngredient } from "./utils";

/**
 * Generate shopping list from meal plan
 * Uses the current week's meal plan (automatically linked via getOrCreateShoppingList)
 */
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

/**
 * Generate shopping list from multiple weeks' meal plans (Pro+ feature)
 */
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
    .maybeSingle();

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
    .select("id, shopping_list_id, ingredient, quantity, unit, category, is_checked, recipe_id, recipe_title, created_at, substituted_from, substitution_log_id")
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
