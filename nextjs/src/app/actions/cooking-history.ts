"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  CookingHistoryEntry,
  CookingHistoryWithRecipe,
  MarkAsCookedInput,
} from "@/types/cooking-history";

export async function markAsCooked(input: MarkAsCookedInput & {
  modifications?: string | null;
  photo_url?: string | null;
}) {
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
      user_id: user.id,
      household_id: membership.household_id,
      cooked_by: user.id,
      cooked_at: input.cooked_at || new Date().toISOString(),
      rating: input.rating || null,
      notes: input.notes || null,
      modifications: input.modifications || null,
      photo_url: input.photo_url || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error marking as cooked:", error);
    return { error: "Failed to mark recipe as cooked" };
  }

  revalidatePath("/app/recipes");
  revalidatePath(`/app/recipes/${input.recipe_id}`);
  return { data: data as CookingHistoryEntry };
}

export async function updateCookingHistoryEntry(
  id: string,
  updates: {
    rating?: number | null;
    notes?: string | null;
    modifications?: string | null;
    cooked_at?: string;
    photo_url?: string | null;
  }
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  // Get user's household for authorization
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return { error: "No household found" };
  }

  // Verify user can edit this entry (must be in same household)
  const { data: entry } = await supabase
    .from("cooking_history")
    .select("household_id, cooked_by, photo_url, recipe_id")
    .eq("id", id)
    .single();

  if (!entry) {
    return { error: "Entry not found" };
  }

  if (entry.household_id !== membership.household_id) {
    return { error: "Not authorized to edit this entry" };
  }

  // Build update object with only defined values
  const updateData: Record<string, unknown> = {};
  if (updates.rating !== undefined) updateData.rating = updates.rating;
  if (updates.notes !== undefined) updateData.notes = updates.notes;
  if (updates.modifications !== undefined) updateData.modifications = updates.modifications;
  if (updates.cooked_at !== undefined) updateData.cooked_at = updates.cooked_at;
  if (updates.photo_url !== undefined) updateData.photo_url = updates.photo_url;

  const { data, error } = await supabase
    .from("cooking_history")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating cooking history:", error);
    return { error: "Failed to update entry" };
  }

  revalidatePath("/app/recipes");
  revalidatePath("/app/history");
  revalidatePath(`/app/recipes/${entry.recipe_id}`);
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

  // Get user's household for authorization
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return { error: "No household found" };
  }

  // Verify user can delete this entry (must be in same household)
  const { data: entry } = await supabase
    .from("cooking_history")
    .select("household_id")
    .eq("id", id)
    .single();

  if (!entry) {
    return { error: "Entry not found" };
  }

  if (entry.household_id !== membership.household_id) {
    return { error: "Not authorized to delete this entry" };
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
  revalidatePath("/app/history");
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

/**
 * Bulk delete multiple cooking history entries.
 * All entries must belong to the user's household.
 */
export async function bulkDeleteCookingHistory(ids: string[]) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  if (!ids.length) {
    return { error: "No entries selected" };
  }

  // Get user's household for authorization
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return { error: "No household found" };
  }

  // Verify all entries belong to user's household and get their photo URLs
  const { data: entries } = await supabase
    .from("cooking_history")
    .select("id, household_id, photo_url")
    .in("id", ids);

  if (!entries) {
    return { error: "Entries not found" };
  }

  // Check authorization for all entries
  const unauthorizedEntries = entries.filter(
    (e) => e.household_id !== membership.household_id
  );
  if (unauthorizedEntries.length > 0) {
    return { error: "Not authorized to delete some entries" };
  }

  // Delete photos from storage
  const photosToDelete = entries
    .filter((e) => e.photo_url)
    .map((e) => {
      const urlParts = e.photo_url!.split("/cooking-history-photos/");
      return urlParts[1];
    })
    .filter(Boolean);

  if (photosToDelete.length > 0) {
    await supabase.storage.from("cooking-history-photos").remove(photosToDelete);
  }

  // Delete the entries
  const { error } = await supabase
    .from("cooking_history")
    .delete()
    .in("id", ids);

  if (error) {
    console.error("Error bulk deleting cooking history:", error);
    return { error: "Failed to delete entries" };
  }

  revalidatePath("/app/recipes");
  revalidatePath("/app/history");

  return { success: true, deletedCount: ids.length };
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
