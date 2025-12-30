"use server";

/**
 * Read operations for cooking history
 */

import { createClient } from "@/lib/supabase/server";
import type { CookingHistoryWithRecipe } from "@/types/cooking-history";

/**
 * Get all cooking history for the user's household
 */
export async function getCookingHistory(limit?: number) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated", data: [] };
  }

  // Get user's household
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return { error: "No household found", data: [] };
  }

  const effectiveLimit = limit ?? 50; // Default limit to prevent unbounded queries

  const { data, error } = await supabase
    .from("cooking_history")
    .select(
      `
      *,
      recipe:recipes(id, title, recipe_type, category, protein_type, image_url),
      cooked_by_profile:profiles!cooking_history_cooked_by_fkey(first_name, last_name, avatar_url)
    `
    )
    .eq("household_id", membership.household_id)
    .order("cooked_at", { ascending: false })
    .limit(effectiveLimit);

  if (error) {
    console.error("Error fetching cooking history:", error);
    return { error: "Failed to fetch cooking history", data: [] };
  }

  return { data: data as CookingHistoryWithRecipe[] };
}

/**
 * Get cooking history for a specific recipe
 */
export async function getRecipeHistory(recipeId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated", data: [] };
  }

  const { data, error } = await supabase
    .from("cooking_history")
    .select(
      `
      *,
      cooked_by_profile:profiles!cooking_history_cooked_by_fkey(first_name, last_name, avatar_url)
    `
    )
    .eq("recipe_id", recipeId)
    .order("cooked_at", { ascending: false })
    .limit(30); // Limit to recent history

  if (error) {
    console.error("Error fetching recipe history:", error);
    return { error: "Failed to fetch recipe history", data: [] };
  }

  return { data };
}

/**
 * Get cooking history for a specific user (for profile display).
 * Shows entries where the user was the cook.
 */
export async function getUserCookingHistory(userId: string, limit?: number) {
  const supabase = await createClient();

  let query = supabase
    .from("cooking_history")
    .select(
      `
      *,
      recipe:recipes(id, title, recipe_type, category, protein_type, image_url),
      cooked_by_profile:profiles!cooking_history_cooked_by_fkey(first_name, last_name, avatar_url)
    `
    )
    .eq("cooked_by", userId)
    .order("cooked_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching user cooking history:", error);
    return { error: "Failed to fetch cooking history", data: [] };
  }

  return { data: data as CookingHistoryWithRecipe[] };
}

/**
 * Get recipe IDs that were cooked in the last N days.
 * Used for parallel fetching in page components.
 */
export async function getRecentlyCookedRecipeIds(days: number = 30): Promise<{
  error: string | null;
  data: string[];
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated", data: [] };
  }

  // Get user's household
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return { error: "No household found", data: [] };
  }

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const { data, error } = await supabase
    .from("cooking_history")
    .select("recipe_id")
    .eq("household_id", membership.household_id)
    .gte("cooked_at", cutoffDate.toISOString());

  if (error) {
    return { error: error.message, data: [] };
  }

  // Return unique recipe IDs
  const uniqueIds = Array.from(new Set(data.map((h) => h.recipe_id)));
  return { error: null, data: uniqueIds };
}

/**
 * Get most recent cooking history entry for a recipe.
 * Used to determine if user has cooked before (for rating click behavior).
 */
export async function getMostRecentCookingEntry(recipeId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { data: null };
  }

  // Get user's household
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return { data: null };
  }

  const { data, error } = await supabase
    .from("cooking_history")
    .select(
      `
      *,
      cooked_by_profile:profiles!cooking_history_cooked_by_fkey(first_name, last_name)
    `
    )
    .eq("recipe_id", recipeId)
    .eq("household_id", membership.household_id)
    .order("cooked_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    // Not finding an entry is not an error
    return { data: null };
  }

  return { data };
}
