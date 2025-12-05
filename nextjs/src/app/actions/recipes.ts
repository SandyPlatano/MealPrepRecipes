"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Recipe, RecipeFormData } from "@/types/recipe";

// Get all recipes for the current user (own + shared household recipes)
export async function getRecipes() {
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

  // Get recipes: user's own + shared household recipes
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .or(
      `user_id.eq.${user.id},and(household_id.eq.${membership?.household_id},is_shared_with_household.eq.true)`
    )
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message, data: null };
  }

  return { error: null, data: data as Recipe[] };
}

// Get a single recipe by ID
export async function getRecipe(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  return { error: null, data: data as Recipe };
}

// Create a new recipe
export async function createRecipe(formData: RecipeFormData) {
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

  const { data, error } = await supabase
    .from("recipes")
    .insert({
      title: formData.title,
      recipe_type: formData.recipe_type,
      category: formData.category || null,
      protein_type: formData.protein_type || null,
      prep_time: formData.prep_time || null,
      cook_time: formData.cook_time || null,
      servings: formData.servings || null,
      base_servings: formData.base_servings || null,
      ingredients: formData.ingredients,
      instructions: formData.instructions,
      tags: formData.tags,
      notes: formData.notes || null,
      source_url: formData.source_url || null,
      image_url: formData.image_url || null,
      user_id: user.id,
      household_id: membership?.household_id || null,
      is_shared_with_household: formData.is_shared_with_household ?? true,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  revalidatePath("/app/recipes");
  return { error: null, data: data as Recipe };
}

// Update an existing recipe
export async function updateRecipe(id: string, formData: Partial<RecipeFormData>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  // Build update object, only including fields that are provided
  const updateData: Record<string, unknown> = {};

  if (formData.title !== undefined) updateData.title = formData.title;
  if (formData.recipe_type !== undefined) updateData.recipe_type = formData.recipe_type;
  if (formData.category !== undefined) updateData.category = formData.category || null;
  if (formData.protein_type !== undefined) updateData.protein_type = formData.protein_type || null;
  if (formData.prep_time !== undefined) updateData.prep_time = formData.prep_time || null;
  if (formData.cook_time !== undefined) updateData.cook_time = formData.cook_time || null;
  if (formData.servings !== undefined) updateData.servings = formData.servings || null;
  if (formData.base_servings !== undefined) updateData.base_servings = formData.base_servings || null;
  if (formData.ingredients !== undefined) updateData.ingredients = formData.ingredients;
  if (formData.instructions !== undefined) updateData.instructions = formData.instructions;
  if (formData.tags !== undefined) updateData.tags = formData.tags;
  if (formData.notes !== undefined) updateData.notes = formData.notes || null;
  if (formData.source_url !== undefined) updateData.source_url = formData.source_url || null;
  if (formData.image_url !== undefined) updateData.image_url = formData.image_url || null;
  if (formData.is_shared_with_household !== undefined) {
    updateData.is_shared_with_household = formData.is_shared_with_household;
  }

  const { data, error } = await supabase
    .from("recipes")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", user.id) // Only owner can update
    .select()
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  revalidatePath("/app/recipes");
  revalidatePath(`/app/recipes/${id}`);
  return { error: null, data: data as Recipe };
}

// Delete a recipe
export async function deleteRecipe(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("recipes")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id); // Only owner can delete

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/recipes");
  return { error: null };
}

// Update recipe rating
export async function updateRecipeRating(id: string, rating: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("recipes")
    .update({ rating })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/recipes");
  revalidatePath(`/app/recipes/${id}`);
  return { error: null };
}

// Toggle favorite status
export async function toggleFavorite(recipeId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", isFavorite: false };
  }

  // Check if already favorited
  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("recipe_id", recipeId)
    .single();

  if (existing) {
    // Remove favorite
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("recipe_id", recipeId);

    if (error) {
      return { error: error.message, isFavorite: true };
    }

    revalidatePath("/app/recipes");
    return { error: null, isFavorite: false };
  } else {
    // Add favorite
    const { error } = await supabase.from("favorites").insert({
      user_id: user.id,
      recipe_id: recipeId,
    });

    if (error) {
      return { error: error.message, isFavorite: false };
    }

    revalidatePath("/app/recipes");
    return { error: null, isFavorite: true };
  }
}

// Get user's favorite recipe IDs
export async function getFavorites() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: [] };
  }

  const { data, error } = await supabase
    .from("favorites")
    .select("recipe_id")
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message, data: [] };
  }

  return { error: null, data: data.map((f) => f.recipe_id) };
}

// Mark recipe as cooked (add to history)
export async function markAsCooked(
  recipeId: string,
  rating?: number,
  notes?: string
) {
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

  const { error } = await supabase.from("cooking_history").insert({
    recipe_id: recipeId,
    household_id: membership?.household_id || null,
    cooked_by: user.id,
    rating: rating || null,
    notes: notes || null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/recipes");
  revalidatePath(`/app/recipes/${recipeId}`);
  revalidatePath("/app/stats");
  return { error: null };
}

// Get cooking history for a recipe
export async function getRecipeHistory(recipeId: string) {
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

  const { data, error } = await supabase
    .from("cooking_history")
    .select(`
      *,
      cooked_by_profile:profiles!cooking_history_cooked_by_fkey(name)
    `)
    .eq("household_id", membership?.household_id)
    .eq("recipe_id", recipeId)
    .order("cooked_at", { ascending: false });

  if (error) {
    return { error: error.message, data: [] };
  }

  return { error: null, data };
}
