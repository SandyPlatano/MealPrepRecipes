"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getOrCreateShoppingList } from "./read";

/**
 * Clear all checked items from shopping list
 */
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

/**
 * Clear entire shopping list
 */
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

/**
 * Remove all items from a specific recipe
 */
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
