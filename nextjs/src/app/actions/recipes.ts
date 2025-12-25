"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedUser, getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import { revalidatePath, revalidateTag } from "next/cache";
import type { Recipe, RecipeFormData } from "@/types/recipe";
import type { QuickCookSuggestion } from "@/types/quick-cook";
import { randomUUID } from "crypto";
import { isNutritionTrackingEnabled, extractNutritionForRecipeInternal } from "./nutrition";
import { recipeFormSchema, recipeUpdateSchema, validateSchema } from "@/lib/validations/schemas";
import {
  getCached,
  invalidateCachePattern,
  invalidateCache,
  recipesListKey,
  CACHE_TTL,
} from "@/lib/cache/redis";

// Cache key generators for this module
const favoritesKey = (userId: string) => `favorites:${userId}`;
const cookCountsKey = (householdId: string) => `cookcounts:${householdId}`;

// Get all recipes for the current user (own + shared household recipes)
export async function getRecipes() {
  try {
    // Check authentication first - household is optional
    const { user: authUser, error: authError } = await getCachedUser();

    if (authError || !authUser) {
      return { error: "Not authenticated", data: null };
    }

    // Get household separately (optional - user can have recipes without household)
    const { household } = await getCachedUserWithHousehold();

    // Use Redis cache with household-scoped key
    const cacheKey = recipesListKey(household?.household_id || authUser.id);

    const recipes = await getCached<Recipe[]>(
      cacheKey,
      async () => {
        const supabase = await createClient();

        // Build query: user's own recipes OR shared household recipes
        // If user has no household, only get their own recipes
        let query = supabase
          .from("recipes")
          .select("id, title, recipe_type, category, protein_type, prep_time, cook_time, servings, base_servings, ingredients, instructions, tags, notes, source_url, image_url, rating, allergen_tags, user_id, household_id, is_shared_with_household, is_public, share_token, view_count, original_recipe_id, original_author_id, avg_rating, review_count, created_at, updated_at");

        if (household?.household_id) {
          // User has household - get own recipes + shared household recipes
          query = query.or(
            `user_id.eq.${authUser.id},and(household_id.eq.${household.household_id},is_shared_with_household.eq.true)`
          );
        } else {
          // User has no household - only get their own recipes
          query = query.eq("user_id", authUser.id);
        }

        const { data, error } = await query
          .order("created_at", { ascending: false })
          .limit(200); // Limit to prevent unbounded queries; implement infinite scroll for more

        if (error) {
          throw new Error(error.message);
        }

        return data as Recipe[];
      },
      CACHE_TTL.RECIPES_LIST
    );

    return { error: null, data: recipes };
  } catch (error) {
    console.error("getRecipes error:", error);
    return { error: "Failed to load recipes. Please try again.", data: null };
  }
}

// Get a single recipe by ID
export async function getRecipe(id: string) {
  try {
    // Check authentication first - household is optional
    const { user: authUser, error: authError } = await getCachedUser();

    if (authError || !authUser) {
      return { error: "Not authenticated", data: null };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("recipes")
      .select("id, title, recipe_type, category, protein_type, prep_time, cook_time, servings, base_servings, ingredients, instructions, tags, notes, source_url, image_url, rating, allergen_tags, user_id, household_id, is_shared_with_household, is_public, share_token, view_count, original_recipe_id, original_author_id, avg_rating, review_count, created_at, updated_at")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return { error: error.message, data: null };
    }

    if (!data) {
      return { error: "Recipe not found", data: null };
    }

    return { error: null, data: data as Recipe };
  } catch (error) {
    console.error("getRecipe error:", error);
    return { error: "Failed to load recipe. Please try again.", data: null };
  }
}

// Create a new recipe
export async function createRecipe(formData: RecipeFormData) {
  try {
    // Validate input
    const validation = validateSchema(recipeFormSchema, formData);
    if (!validation.success) {
      return { error: validation.error, data: null };
    }
    const validData = validation.data;

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
        title: validData.title,
        recipe_type: validData.recipe_type,
        category: validData.category || null,
        protein_type: validData.protein_type || null,
        prep_time: validData.prep_time || null,
        cook_time: validData.cook_time || null,
        servings: validData.servings || null,
        base_servings: validData.base_servings || null,
        ingredients: validData.ingredients,
        instructions: validData.instructions,
        tags: validData.tags,
        notes: validData.notes || null,
        source_url: validData.source_url || null,
        image_url: validData.image_url || null,
        allergen_tags: validData.allergen_tags,
        user_id: authUser.id,
        household_id: household?.household_id || null,
        is_shared_with_household: validData.is_shared_with_household,
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
      extractNutritionForRecipeInternal(data.id, {
        title: data.title,
        ingredients: data.ingredients,
        servings: data.base_servings || 4,
        instructions: data.instructions,
      }).catch((err: Error) => {
        // Log error but don't fail recipe creation
        console.error("Background nutrition extraction failed:", err);
      });
    }

    // Invalidate Redis cache for recipes
    await invalidateCachePattern(`recipes:*`);

    revalidatePath("/app/recipes");
    revalidateTag(`recipes-${authUser.id}`, "default");
    return { error: null, data: data as Recipe };
  } catch (error) {
    console.error("createRecipe error:", error);
    return { error: "Failed to create recipe. Please try again.", data: null };
  }
}

// Save a Quick Cook AI suggestion as a recipe
export async function saveQuickCookRecipe(suggestion: QuickCookSuggestion) {
  // Convert QuickCookSuggestion to RecipeFormData
  const formData: RecipeFormData = {
    title: suggestion.title,
    recipe_type: "Dinner", // Default type for AI suggestions
    category: suggestion.cuisine || undefined,
    protein_type: suggestion.protein_type || undefined,
    prep_time: suggestion.active_time ? `${suggestion.active_time} min` : undefined,
    cook_time: suggestion.total_time && suggestion.active_time
      ? `${suggestion.total_time - suggestion.active_time} min`
      : undefined,
    servings: `${suggestion.servings}`,
    base_servings: suggestion.servings,
    ingredients: suggestion.ingredients.map(
      (i) => `${i.quantity} ${i.item}${i.notes ? ` (${i.notes})` : ""}`
    ),
    instructions: suggestion.instructions,
    tags: suggestion.tags || [],
    notes: `AI-suggested recipe: "${suggestion.reason}"`,
    allergen_tags: [],
  };

  return createRecipe(formData);
}

// Update an existing recipe
export async function updateRecipe(id: string, formData: Partial<RecipeFormData>) {
  try {
    // Validate input
    const validation = validateSchema(recipeUpdateSchema, formData);
    if (!validation.success) {
      return { error: validation.error, data: null };
    }
    const validData = validation.data;

    // Check authentication first - household is optional
    const { user: authUser, error: authError } = await getCachedUser();

    if (authError || !authUser) {
      return { error: "Not authenticated", data: null };
    }

    const supabase = await createClient();

    // Build update object, only including fields that are provided
    const updateData: Record<string, unknown> = {};

    if (validData.title !== undefined) updateData.title = validData.title;
    if (validData.recipe_type !== undefined) updateData.recipe_type = validData.recipe_type;
    if (validData.category !== undefined) updateData.category = validData.category || null;
    if (validData.protein_type !== undefined) updateData.protein_type = validData.protein_type || null;
    if (validData.prep_time !== undefined) updateData.prep_time = validData.prep_time || null;
    if (validData.cook_time !== undefined) updateData.cook_time = validData.cook_time || null;
    if (validData.servings !== undefined) updateData.servings = validData.servings || null;
    if (validData.base_servings !== undefined) updateData.base_servings = validData.base_servings || null;
    if (validData.ingredients !== undefined) updateData.ingredients = validData.ingredients;
    if (validData.instructions !== undefined) updateData.instructions = validData.instructions;
    if (validData.tags !== undefined) updateData.tags = validData.tags;
    if (validData.notes !== undefined) updateData.notes = validData.notes || null;
    if (validData.source_url !== undefined) updateData.source_url = validData.source_url || null;
    if (validData.image_url !== undefined) updateData.image_url = validData.image_url || null;
    if (validData.allergen_tags !== undefined) updateData.allergen_tags = validData.allergen_tags;
    if (validData.is_shared_with_household !== undefined) {
      updateData.is_shared_with_household = validData.is_shared_with_household;
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
    const ingredientsUpdated = validData.ingredients !== undefined;
    if (ingredientsUpdated && data) {
      const nutritionCheck = await isNutritionTrackingEnabled();
      if (nutritionCheck.enabled) {
        // Fire and forget - don't await to avoid blocking recipe update
        extractNutritionForRecipeInternal(data.id, {
          title: data.title,
          ingredients: data.ingredients,
          servings: data.base_servings || 4,
          instructions: data.instructions,
        }).catch((err: Error) => {
          // Log error but don't fail recipe update
          console.error("Background nutrition re-extraction failed:", err);
        });
      }
    }

    // Invalidate Redis cache for recipes
    await invalidateCachePattern(`recipes:*`);

    revalidatePath("/app/recipes");
    revalidatePath(`/app/recipes/${id}`);
    revalidateTag(`recipes-${authUser.id}`, "default");
    return { error: null, data: data as Recipe };
  } catch (error) {
    console.error("updateRecipe error:", error);
    return { error: "Failed to update recipe. Please try again.", data: null };
  }
}

// Delete a recipe
export async function deleteRecipe(id: string) {
  try {
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

    // Invalidate Redis cache for recipes
    await invalidateCachePattern(`recipes:*`);

    revalidatePath("/app/recipes");
    revalidateTag(`recipes-${authUser.id}`, "default");
    return { error: null };
  } catch (error) {
    console.error("deleteRecipe error:", error);
    return { error: "Failed to delete recipe. Please try again." };
  }
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
  revalidateTag(`recipes-${authUser.id}`, "default");
  return { error: null };
}

// Toggle favorite status
export async function toggleFavorite(recipeId: string) {
  try {
    const { user, error: authError } = await getCachedUser();

    if (authError || !user) {
      return { error: "Not authenticated", isFavorite: false };
    }

    const supabase = await createClient();

    // Check if already favorited (use maybeSingle since it might not exist)
    const { data: existing } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("recipe_id", recipeId)
      .maybeSingle();

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

      // Invalidate favorites cache
      await invalidateCache(favoritesKey(user.id));

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

      // Invalidate favorites cache
      await invalidateCache(favoritesKey(user.id));

      revalidatePath("/app/recipes");
      revalidatePath("/app/history");
      return { error: null, isFavorite: true };
    }
  } catch (error) {
    console.error("toggleFavorite error:", error);
    return { error: "Failed to update favorite. Please try again.", isFavorite: false };
  }
}

// Get user's favorite recipe IDs
export async function getFavorites() {
  const { user, error: authError } = await getCachedUser();

  if (authError || !user) {
    return { error: "Not authenticated", data: [] };
  }

  try {
    const cacheKey = favoritesKey(user.id);

    const favoriteIds = await getCached<string[]>(
      cacheKey,
      async () => {
        const supabase = await createClient();

        const { data, error } = await supabase
          .from("favorites")
          .select("recipe_id")
          .eq("user_id", user.id);

        if (error) {
          throw new Error(error.message);
        }

        return data.map((f) => f.recipe_id);
      },
      CACHE_TTL.FAVORITES
    );

    return { error: null, data: favoriteIds };
  } catch (error) {
    console.error("getFavorites error:", error);
    return { error: "Failed to load favorites", data: [] };
  }
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
  // Supabase returns recipe as a single object for this foreign key relation
  const favorites = data
    .filter((f): f is typeof f & { recipe: Record<string, unknown> } =>
      f.recipe !== null && typeof f.recipe === 'object' && !Array.isArray(f.recipe))
    .map((f) => ({
      ...(f.recipe as unknown as Recipe),
      favorited_at: f.created_at,
    }));

  return { error: null, data: favorites };
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

  // Invalidate cook counts cache
  await invalidateCache(cookCountsKey(household?.household_id || user.id));

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
      cooked_by_profile:profiles!cooking_history_cooked_by_fkey(first_name, last_name)
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

  try {
    const cacheKey = cookCountsKey(household?.household_id || user.id);

    const counts = await getCached<Record<string, number>>(
      cacheKey,
      async () => {
        const supabase = await createClient();

        // Use database function for efficient aggregation
        const { data, error } = await supabase.rpc("get_recipe_cook_counts", {
          p_household_id: household?.household_id,
        });

        if (error) {
          throw new Error(error.message);
        }

        // Transform array to record for backwards compatibility
        const result: Record<string, number> = {};
        (data as Array<{ recipe_id: string; count: number }>)?.forEach((entry) => {
          result[entry.recipe_id] = entry.count;
        });

        return result;
      },
      CACHE_TTL.COOK_COUNTS
    );

    return { error: null, data: counts };
  } catch (error) {
    console.error("getRecipeCookCounts error:", error);
    return { error: "Failed to load cook counts", data: {} };
  }
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
