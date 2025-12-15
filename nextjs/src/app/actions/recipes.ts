"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedUser, getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import { revalidatePath, revalidateTag } from "next/cache";
import type { Recipe, RecipeFormData } from "@/types/recipe";
import { randomUUID } from "crypto";
import { isNutritionTrackingEnabled } from "./nutrition";

// Get all recipes for the current user (own + shared household recipes)
export async function getRecipes() {
  // Check authentication first - household is optional
  const { user: authUser, error: authError } = await getCachedUser();
  
  if (authError || !authUser) {
    return { error: "Not authenticated", data: null };
  }

  // Get household separately (optional - user can have recipes without household)
  const { household } = await getCachedUserWithHousehold();

  const supabase = await createClient();

  // Build query: user's own recipes OR shared household recipes
  // If user has no household, only get their own recipes
  let query = supabase
    .from("recipes")
    .select("*");

  if (household?.household_id) {
    // User has household - get own recipes + shared household recipes
    query = query.or(
      `user_id.eq.${authUser.id},and(household_id.eq.${household.household_id},is_shared_with_household.eq.true)`
    );
  } else {
    // User has no household - only get their own recipes
    query = query.eq("user_id", authUser.id);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    return { error: error.message, data: null };
  }

  return { error: null, data: data as Recipe[] };
}

// Get a single recipe by ID
export async function getRecipe(id: string) {
  // Check authentication first - household is optional
  const { user: authUser, error: authError } = await getCachedUser();
  
  if (authError || !authUser) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

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
  // Check authentication first - household is optional
  const { user: authUser, error: authError } = await getCachedUser();
  
  if (authError || !authUser) {
    return { error: "Not authenticated", data: null };
  }

  // Get household separately (optional - user can create recipes without household)
  const { household } = await getCachedUserWithHousehold();

  const supabase = await createClient();

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
      allergen_tags: formData.allergen_tags || [],
      user_id: authUser.id,
      household_id: household?.household_id || null,
      is_shared_with_household: formData.is_shared_with_household ?? true,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  // Background task: Auto-extract nutrition if tracking is enabled
  // This runs asynchronously and doesn't block the response
  const nutritionCheck = await isNutritionTrackingEnabled();
  if (nutritionCheck.enabled && data) {
    // Fire and forget - don't await to avoid blocking recipe creation
    extractNutritionInBackground(data.id, {
      title: data.title,
      ingredients: data.ingredients,
      servings: data.base_servings || 4,
    }).catch((err) => {
      // Log error but don't fail recipe creation
      console.error("Background nutrition extraction failed:", err);
    });
  }

  revalidatePath("/app/recipes");
  revalidateTag(`recipes-${authUser.id}`);
  return { error: null, data: data as Recipe };
}

// Update an existing recipe
export async function updateRecipe(id: string, formData: Partial<RecipeFormData>) {
  // Check authentication first - household is optional
  const { user: authUser, error: authError } = await getCachedUser();
  
  if (authError || !authUser) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

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
  if (formData.allergen_tags !== undefined) updateData.allergen_tags = formData.allergen_tags || [];
  if (formData.is_shared_with_household !== undefined) {
    updateData.is_shared_with_household = formData.is_shared_with_household;
  }

  const { data, error } = await supabase
    .from("recipes")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", authUser.id) // Only owner can update
    .select()
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  // Background task: Re-extract nutrition if ingredients were updated and tracking is enabled
  const ingredientsUpdated = formData.ingredients !== undefined;
  if (ingredientsUpdated && data) {
    const nutritionCheck = await isNutritionTrackingEnabled();
    if (nutritionCheck.enabled) {
      // Fire and forget - don't await to avoid blocking recipe update
      extractNutritionInBackground(data.id, {
        title: data.title,
        ingredients: data.ingredients,
        servings: data.base_servings || 4,
      }).catch((err) => {
        // Log error but don't fail recipe update
        console.error("Background nutrition re-extraction failed:", err);
      });
    }
  }

  revalidatePath("/app/recipes");
  revalidatePath(`/app/recipes/${id}`);
  revalidateTag(`recipes-${authUser.id}`);
  return { error: null, data: data as Recipe };
}

// Delete a recipe
export async function deleteRecipe(id: string) {
  // Check authentication first - household is optional
  const { user: authUser, error: authError } = await getCachedUser();
  
  if (authError || !authUser) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("recipes")
    .delete()
    .eq("id", id)
    .eq("user_id", authUser.id); // Only owner can delete

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/recipes");
  revalidateTag(`recipes-${authUser.id}`);
  return { error: null };
}

// Update recipe rating
export async function updateRecipeRating(id: string, rating: number) {
  // Check authentication first - household is optional
  const { user: authUser, error: authError } = await getCachedUser();
  
  if (authError || !authUser) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("recipes")
    .update({ rating })
    .eq("id", id)
    .eq("user_id", authUser.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/recipes");
  revalidatePath(`/app/recipes/${id}`);
  revalidateTag(`recipes-${authUser.id}`);
  return { error: null };
}

// Toggle favorite status
export async function toggleFavorite(recipeId: string) {
  const { user, error: authError } = await getCachedUser();

  if (authError || !user) {
    return { error: "Not authenticated", isFavorite: false };
  }

  const supabase = await createClient();

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
    revalidatePath("/app/history");
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
    revalidatePath("/app/history");
    return { error: null, isFavorite: true };
  }
}

// Get user's favorite recipe IDs
export async function getFavorites() {
  const { user, error: authError } = await getCachedUser();

  if (authError || !user) {
    return { error: "Not authenticated", data: [] };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("favorites")
    .select("recipe_id")
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message, data: [] };
  }

  return { error: null, data: data.map((f) => f.recipe_id) };
}

// Get user's favorite recipes with full recipe details
export async function getFavoriteRecipes() {
  const { user, error: authError } = await getCachedUser();

  if (authError || !user) {
    return { error: "Not authenticated", data: [] };
  }

  const supabase = await createClient();

  // Join favorites with recipes to get full recipe data
  const { data, error } = await supabase
    .from("favorites")
    .select(`
      recipe_id,
      created_at,
      recipe:recipes(*)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message, data: [] };
  }

  // Transform to include favorited_at timestamp
  const favorites = data.map((f) => ({
    ...f.recipe,
    favorited_at: f.created_at,
  }));

  return { error: null, data: favorites as (Recipe & { favorited_at: string })[] };
}

// Mark recipe as cooked (add to history)
export async function markAsCooked(
  recipeId: string,
  rating?: number,
  notes?: string,
  modifications?: string
) {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("cooking_history").insert({
    recipe_id: recipeId,
    user_id: user.id,
    household_id: household?.household_id || null,
    cooked_by: user.id,
    rating: rating || null,
    notes: notes || null,
    modifications: modifications || null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/recipes");
  revalidatePath(`/app/recipes/${recipeId}`);
  return { error: null };
}

// Get cooking history for a recipe
export async function getRecipeHistory(recipeId: string) {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user) {
    return { error: "Not authenticated", data: [] };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cooking_history")
    .select(`
      *,
      cooked_by_profile:profiles!cooking_history_cooked_by_fkey(name)
    `)
    .eq("household_id", household?.household_id)
    .eq("recipe_id", recipeId)
    .order("cooked_at", { ascending: false });

  if (error) {
    return { error: error.message, data: [] };
  }

  return { error: null, data };
}

// Get cook counts for all recipes in the household
export async function getRecipeCookCounts() {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user) {
    return { error: "Not authenticated", data: {} };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cooking_history")
    .select("recipe_id")
    .eq("household_id", household?.household_id);

  if (error) {
    return { error: error.message, data: {} };
  }

  // Count occurrences of each recipe_id
  const counts: Record<string, number> = {};
  data.forEach((entry) => {
    counts[entry.recipe_id] = (counts[entry.recipe_id] || 0) + 1;
  });

  return { error: null, data: counts };
}

// Upload recipe image to Supabase Storage
export async function uploadRecipeImage(formData: FormData) {
  const { user, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user) {
    return { error: "Not authenticated", data: null };
  }

  const file = formData.get("file") as File;
  if (!file) {
    return { error: "No file provided", data: null };
  }

  // Validate file type
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
  if (!validTypes.includes(file.type)) {
    return { error: "Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.", data: null };
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { error: "File too large. Maximum size is 5MB.", data: null };
  }

  const supabase = await createClient();

  // Generate unique filename
  const fileExt = file.name.split(".").pop();
  const fileName = `${user.id}/${randomUUID()}.${fileExt}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from("recipe-images")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    return { error: error.message, data: null };
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from("recipe-images")
    .getPublicUrl(fileName);

  return { error: null, data: { path: data.path, url: publicUrl } };
}

// Delete recipe image from Supabase Storage
export async function deleteRecipeImage(imagePath: string) {
  const { user, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

  const { error } = await supabase.storage
    .from("recipe-images")
    .remove([imagePath]);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

// Helper function to extract nutrition in the background
async function extractNutritionInBackground(
  recipeId: string,
  recipeData: { title: string; ingredients: string[]; servings: number }
) {
  try {
    // Call the nutrition extraction API endpoint
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/ai/extract-nutrition`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipeId,
        title: recipeData.title,
        ingredients: recipeData.ingredients,
        servings: recipeData.servings,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || "Nutrition extraction failed");
    }

    console.log(`[Nutrition] Auto-extracted for recipe ${recipeId}`);
  } catch (error) {
    console.error(`[Nutrition] Background extraction failed for recipe ${recipeId}:`, error);
    throw error;
  }
}
