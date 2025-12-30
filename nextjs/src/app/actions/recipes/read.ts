"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedUser, getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import type { Recipe } from "@/types/recipe";
import {
  getCached,
  recipesListKey,
  CACHE_TTL,
} from "@/lib/cache/redis";

/**
 * Get all recipes for the current user (own + shared household recipes)
 */
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

/**
 * Get a single recipe by ID
 */
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
