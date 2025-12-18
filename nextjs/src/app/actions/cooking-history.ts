"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  CookingHistoryEntry,
  CookingHistoryWithRecipe,
  MarkAsCookedInput,
} from "@/types/cooking-history";

export async function markAsCooked(input: MarkAsCookedInput) {
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

  const { data, error } = await supabase
    .from("cooking_history")
    .insert({
      recipe_id: input.recipe_id,
      household_id: membership.household_id,
      cooked_by: user.id,
      cooked_at: input.cooked_at || new Date().toISOString(),
      rating: input.rating || null,
      notes: input.notes || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error marking as cooked:", error);
    return { error: "Failed to mark recipe as cooked" };
  }

  revalidatePath("/app/recipes");
  return { data: data as CookingHistoryEntry };
}

export async function updateCookingHistoryEntry(
  id: string,
  updates: { rating?: number; notes?: string }
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("cooking_history")
    .update({
      rating: updates.rating,
      notes: updates.notes,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating cooking history:", error);
    return { error: "Failed to update entry" };
  }

  revalidatePath("/app/recipes");
  return { data: data as CookingHistoryEntry };
}

export async function deleteCookingHistoryEntry(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("cooking_history")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting cooking history:", error);
    return { error: "Failed to delete entry" };
  }

  revalidatePath("/app/recipes");
  return { success: true };
}

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

  let query = supabase
    .from("cooking_history")
    .select(
      `
      *,
      recipe:recipes(id, title, recipe_type, category, protein_type),
      cooked_by_profile:profiles!cooking_history_cooked_by_fkey(first_name, last_name)
    `
    )
    .eq("household_id", membership.household_id)
    .order("cooked_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching cooking history:", error);
    return { error: "Failed to fetch cooking history", data: [] };
  }

  return { data: data as CookingHistoryWithRecipe[] };
}

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
      cooked_by_profile:profiles!cooking_history_cooked_by_fkey(first_name, last_name)
    `
    )
    .eq("recipe_id", recipeId)
    .order("cooked_at", { ascending: false });

  if (error) {
    console.error("Error fetching recipe history:", error);
    return { error: "Failed to fetch recipe history", data: [] };
  }

  return { data };
}

/**
 * Quick rate a recipe - creates a cooking history entry with just a rating.
 * This also updates the recipe's rating field to the new rating.
 */
export async function quickRate(recipeId: string, rating: number) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  // Validate rating
  if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    return { error: "Rating must be an integer between 1 and 5" };
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

  // Create cooking history entry with rating
  const { error: historyError } = await supabase
    .from("cooking_history")
    .insert({
      recipe_id: recipeId,
      user_id: user.id,
      household_id: membership.household_id,
      cooked_by: user.id,
      cooked_at: new Date().toISOString(),
      rating: rating,
      notes: null,
    });

  if (historyError) {
    console.error("Error creating cooking history:", historyError);
    return { error: "Failed to save rating" };
  }

  // Update recipe's rating field to the new rating
  const { error: recipeError } = await supabase
    .from("recipes")
    .update({ rating: rating })
    .eq("id", recipeId);

  if (recipeError) {
    console.error("Error updating recipe rating:", recipeError);
    // Don't return error - history was saved successfully
  }

  revalidatePath("/app/recipes");
  revalidatePath(`/app/recipes/${recipeId}`);

  return { data: { rating } };
}

export async function rateRecipeWithNotes(
  recipeId: string,
  rating: number,
  notes?: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  // Validate rating
  if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    return { error: "Rating must be an integer between 1 and 5" };
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

  // Create cooking history entry with rating and notes
  const { error: historyError } = await supabase
    .from("cooking_history")
    .insert({
      recipe_id: recipeId,
      user_id: user.id,
      household_id: membership.household_id,
      cooked_by: user.id,
      cooked_at: new Date().toISOString(),
      rating: rating,
      notes: notes || null,
    });

  if (historyError) {
    console.error("Error creating cooking history:", historyError);
    return { error: "Failed to save rating" };
  }

  // Update recipe's rating field to the new rating
  const { error: recipeError } = await supabase
    .from("recipes")
    .update({ rating: rating })
    .eq("id", recipeId);

  if (recipeError) {
    console.error("Error updating recipe rating:", recipeError);
    // Don't return error - history was saved successfully
  }

  revalidatePath("/app/recipes");
  revalidatePath(`/app/recipes/${recipeId}`);

  return { data: { rating, notes } };
}
