"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  ShoppingList,
  ShoppingListItem,
  ShoppingListWithItems,
  NewShoppingListItem,
} from "@/types/shopping-list";

// Get or create the current shopping list for the household
export async function getOrCreateShoppingList(name?: string) {
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

  const listName = name || "Shopping List";

  // Try to get existing active shopping list
  let { data: shoppingList } = await supabase
    .from("shopping_lists")
    .select("*")
    .eq("household_id", membership.household_id)
    .eq("name", listName)
    .single();

  // Create if doesn't exist
  if (!shoppingList) {
    const { data: newList, error } = await supabase
      .from("shopping_lists")
      .insert({
        household_id: membership.household_id,
        name: listName,
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

// Generate shopping list from meal plan
export async function generateFromMealPlan(weekStart: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Get user's household
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return { error: "No household found" };
  }

  // Get meal plan for the week
  const { data: mealPlan } = await supabase
    .from("meal_plans")
    .select("id")
    .eq("household_id", membership.household_id)
    .eq("week_start", weekStart)
    .single();

  if (!mealPlan) {
    return { error: "No meal plan found for this week" };
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
    .eq("meal_plan_id", mealPlan.id);

  if (!assignments || assignments.length === 0) {
    return { error: "No meals planned for this week" };
  }

  // Get or create shopping list
  const listResult = await getOrCreateShoppingList();
  if (listResult.error || !listResult.data) {
    return { error: listResult.error || "Failed to get shopping list" };
  }

  // Collect all ingredients from all recipes
  const ingredientsToAdd: NewShoppingListItem[] = [];

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

  // Add all ingredients to shopping list
  if (ingredientsToAdd.length > 0) {
    const itemsToInsert = ingredientsToAdd.map((item) => ({
      shopping_list_id: listResult.data!.id,
      ingredient: item.ingredient,
      quantity: item.quantity || null,
      unit: item.unit || null,
      category: item.category || "Other",
      recipe_id: item.recipe_id || null,
      recipe_title: item.recipe_title || null,
      is_checked: false,
    }));

    const { error } = await supabase
      .from("shopping_list_items")
      .insert(itemsToInsert);

    if (error) {
      return { error: error.message };
    }
  }

  revalidatePath("/app/shop");
  return { error: null, count: ingredientsToAdd.length };
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
    /salt|pepper|cumin|paprika|oregano|thyme|rosemary|cinnamon|nutmeg|ginger|turmeric|chili|cayenne|spice|seasoning/i.test(
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

  // Beverages
  if (/juice|soda|water|coffee|tea|wine|beer/i.test(lower)) {
    return "Beverages";
  }

  return "Other";
}
