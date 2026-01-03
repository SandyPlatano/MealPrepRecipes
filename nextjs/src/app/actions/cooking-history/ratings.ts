"use server";

/**
 * Rating operations for cooking history
 */

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

function isValidRating(rating: number): boolean {
  return rating >= 1 && rating <= 5 && rating % 0.5 === 0;
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

  // Validate rating (supports half-stars: 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5)
  if (!isValidRating(rating)) {
    return { error: "Rating must be between 1 and 5 in half-star increments" };
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

/**
 * Rate a recipe with notes - creates a cooking history entry with rating and notes.
 * This also updates the recipe's rating field to the new rating.
 */
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

  // Validate rating (supports half-stars: 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5)
  if (!isValidRating(rating)) {
    return { error: "Rating must be between 1 and 5 in half-star increments" };
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
