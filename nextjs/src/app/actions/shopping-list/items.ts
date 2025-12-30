"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { NewShoppingListItem } from "@/types/shopping-list";
import { getOrCreateShoppingList } from "./read";

/**
 * Add item to shopping list
 */
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

/**
 * Toggle item checked status
 */
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
    .maybeSingle();

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

/**
 * Remove item from shopping list
 */
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
