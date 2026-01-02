"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { AddFromRecipeResult } from "@/types/quick-cart";
import { normalizeIngredientName } from "@/lib/ingredient-scaler";
import { getOrCreateShoppingList } from "./read";
import { parseIngredient } from "./utils";

/**
 * Quick add item from the cart panel
 * Parses the raw ingredient string and adds with source='quick_add'
 */
export async function quickAddItem(
  rawIngredient: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const listResult = await getOrCreateShoppingList();
  if (listResult.error || !listResult.data) {
    return { error: listResult.error || "Failed to get shopping list" };
  }

  const parsed = parseIngredient(rawIngredient);

  const { error } = await supabase.from("shopping_list_items").insert({
    shopping_list_id: listResult.data.id,
    ingredient: parsed.ingredient,
    quantity: parsed.quantity || null,
    unit: parsed.unit || null,
    category: parsed.category || "Other",
    is_checked: false,
    source: "quick_add",
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/shop");
  return { error: null };
}

/**
 * Add multiple ingredients from a recipe
 * Handles duplicate detection and batch insert
 */
export async function addIngredientsFromRecipe(
  ingredients: string[],
  recipeId: string,
  recipeTitle: string
): Promise<AddFromRecipeResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { added: 0, skipped: 0, error: "Not authenticated" };
  }

  const listResult = await getOrCreateShoppingList();
  if (listResult.error || !listResult.data) {
    return {
      added: 0,
      skipped: 0,
      error: listResult.error || "Failed to get shopping list",
    };
  }

  // Get existing items for duplicate detection
  const { data: existingItems } = await supabase
    .from("shopping_list_items")
    .select("ingredient")
    .eq("shopping_list_id", listResult.data.id);

  const existingNormalized = new Set(
    (existingItems || []).map((i) => normalizeIngredientName(i.ingredient))
  );

  // Parse ingredients and filter duplicates
  const itemsToAdd: Array<{
    shopping_list_id: string;
    ingredient: string;
    quantity: string | null;
    unit: string | null;
    category: string;
    recipe_id: string;
    recipe_title: string;
    is_checked: boolean;
    source: string;
  }> = [];
  let skipped = 0;

  for (const ing of ingredients) {
    const parsed = parseIngredient(ing);
    const normalized = normalizeIngredientName(parsed.ingredient);

    if (existingNormalized.has(normalized)) {
      skipped++;
    } else {
      itemsToAdd.push({
        shopping_list_id: listResult.data.id,
        ingredient: parsed.ingredient,
        quantity: parsed.quantity || null,
        unit: parsed.unit || null,
        category: parsed.category || "Other",
        recipe_id: recipeId,
        recipe_title: recipeTitle,
        is_checked: false,
        source: "recipe_direct",
      });
      // Prevent duplicates within the same batch
      existingNormalized.add(normalized);
    }
  }

  if (itemsToAdd.length === 0) {
    return { added: 0, skipped, error: null };
  }

  // Batch insert
  const { error } = await supabase.from("shopping_list_items").insert(itemsToAdd);

  if (error) {
    return { added: 0, skipped, error: error.message };
  }

  revalidatePath("/app/shop");
  return { added: itemsToAdd.length, skipped, error: null };
}

/**
 * Check which ingredients already exist in the shopping list
 * Used for the preview dialog before batch adding
 */
export async function checkExistingIngredients(
  ingredients: string[]
): Promise<{ existing: string[]; error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { existing: [], error: "Not authenticated" };
  }

  const listResult = await getOrCreateShoppingList();
  if (listResult.error || !listResult.data) {
    return { existing: [], error: listResult.error || "Failed to get shopping list" };
  }

  // Get existing items
  const { data: existingItems } = await supabase
    .from("shopping_list_items")
    .select("ingredient")
    .eq("shopping_list_id", listResult.data.id);

  const existingNormalized = new Set(
    (existingItems || []).map((i) => normalizeIngredientName(i.ingredient))
  );

  // Find which ingredients already exist
  const existing = ingredients.filter((ing) => {
    const parsed = parseIngredient(ing);
    return existingNormalized.has(normalizeIngredientName(parsed.ingredient));
  });

  return { existing, error: null };
}

/**
 * Add a single ingredient from a recipe page
 * With recipe context (id and title)
 */
export async function addSingleIngredientFromRecipe(
  rawIngredient: string,
  recipeId: string,
  recipeTitle: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const listResult = await getOrCreateShoppingList();
  if (listResult.error || !listResult.data) {
    return { error: listResult.error || "Failed to get shopping list" };
  }

  const parsed = parseIngredient(rawIngredient);

  const { error } = await supabase.from("shopping_list_items").insert({
    shopping_list_id: listResult.data.id,
    ingredient: parsed.ingredient,
    quantity: parsed.quantity || null,
    unit: parsed.unit || null,
    category: parsed.category || "Other",
    recipe_id: recipeId,
    recipe_title: recipeTitle,
    is_checked: false,
    source: "recipe_direct",
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/shop");
  return { error: null };
}
