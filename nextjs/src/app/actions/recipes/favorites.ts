"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedUser } from "@/lib/supabase/cached-queries";
import { revalidatePath } from "next/cache";
import type { Recipe } from "@/types/recipe";
import {
  getCached,
  invalidateCache,
  CACHE_TTL,
} from "@/lib/cache/redis";

// Cache key generator
const favoritesKey = (userId: string) => `favorites:${userId}`;

/**
 * Toggle favorite status for a recipe
 */
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

/**
 * Get user's favorite recipe IDs
 */
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

/**
 * Get user's favorite recipes with full recipe details
 */
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
