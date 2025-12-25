"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { PantryItem } from "@/types/shopping-list";
import { normalizeIngredientName } from "@/lib/ingredient-scaler";

// Get all pantry items for the user's household
export async function getPantryItems(): Promise<{
  error: string | null;
  data: PantryItem[] | null;
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

  const { data: items, error } = await supabase
    .from("pantry_items")
    .select("id, household_id, ingredient, normalized_ingredient, category, source, last_restocked, created_at, updated_at")
    .eq("household_id", membership.household_id)
    .order("category")
    .order("ingredient");

  if (error) {
    return { error: error.message, data: null };
  }

  return { error: null, data: items as PantryItem[] };
}

// Get normalized pantry item names for quick lookup
export async function getPantryLookup(): Promise<{
  error: string | null;
  data: Set<string> | null;
}> {
  const result = await getPantryItems();
  if (result.error || !result.data) {
    return { error: result.error, data: null };
  }

  const lookup = new Set(result.data.map((item) => item.normalized_ingredient));
  return { error: null, data: lookup };
}

// Add an item to pantry
export async function addToPantry(
  ingredient: string,
  category?: string,
  source?: 'manual' | 'scan' | 'barcode'
): Promise<{ error: string | null }> {
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

  const normalizedIngredient = normalizeIngredientName(ingredient);

  const { error } = await supabase.from("pantry_items").upsert(
    {
      household_id: membership.household_id,
      ingredient: ingredient.trim(),
      normalized_ingredient: normalizedIngredient,
      category: category || "Other",
      source: source || 'manual',
      last_restocked: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "household_id,normalized_ingredient",
    }
  );

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/shop");
  revalidatePath("/app/pantry");
  return { error: null };
}

// Remove an item from pantry
export async function removeFromPantry(
  ingredient: string
): Promise<{ error: string | null }> {
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

  const normalizedIngredient = normalizeIngredientName(ingredient);

  const { error } = await supabase
    .from("pantry_items")
    .delete()
    .eq("household_id", membership.household_id)
    .eq("normalized_ingredient", normalizedIngredient);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/shop");
  return { error: null };
}

// Remove pantry item by ID
export async function removePantryItemById(
  itemId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("pantry_items")
    .delete()
    .eq("id", itemId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/shop");
  return { error: null };
}

// Check if an ingredient is in the pantry
export async function isInPantry(ingredient: string): Promise<boolean> {
  const result = await getPantryLookup();
  if (!result.data) return false;

  const normalized = normalizeIngredientName(ingredient);
  return result.data.has(normalized);
}

// Bulk add items to pantry (e.g., after shopping trip)
export async function bulkAddToPantry(
  items: Array<{ ingredient: string; category?: string }>
): Promise<{ error: string | null; count: number }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", count: 0 };
  }

  // Get user's household
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return { error: "No household found", count: 0 };
  }

  const itemsToInsert = items.map((item) => ({
    household_id: membership.household_id,
    ingredient: item.ingredient.trim(),
    normalized_ingredient: normalizeIngredientName(item.ingredient),
    category: item.category || "Other",
    last_restocked: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase.from("pantry_items").upsert(itemsToInsert, {
    onConflict: "household_id,normalized_ingredient",
  });

  if (error) {
    return { error: error.message, count: 0 };
  }

  revalidatePath("/app/shop");
  return { error: null, count: items.length };
}

// Clear all pantry items
export async function clearPantry(): Promise<{ error: string | null }> {
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

  const { error } = await supabase
    .from("pantry_items")
    .delete()
    .eq("household_id", membership.household_id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/shop");
  return { error: null };
}

