"use server";

/**
 * Recipe Nutrition Actions
 * Handles CRUD operations for recipe nutrition data
 */

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import {
  getCached,
  invalidateCachePattern,
  nutritionKey,
  CACHE_TTL,
} from "@/lib/cache/redis";
import type { RecipeNutrition, NutritionData } from "@/types/nutrition";

/**
 * Get nutrition data for a specific recipe
 */
export async function getRecipeNutrition(recipeId: string): Promise<{
  data: RecipeNutrition | null;
  error: string | null;
}> {
  try {
    const { user } = await getCachedUserWithHousehold();
    // Only check for actual auth errors, not household/subscription errors
    if (!user) {
      return { data: null, error: "Not authenticated" };
    }
    // authError might be from household/subscription lookup, which is OK for nutrition tracking

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("recipe_nutrition")
      .select("id, recipe_id, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, source, confidence_score, input_tokens, output_tokens, cost_usd, created_at, updated_at")
      .eq("recipe_id", recipeId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching recipe nutrition:", error);
      return { data: null, error: error.message };
    }

    // maybeSingle returns null if not found, which is expected
    if (!data) {
      return { data: null, error: null };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Error in getRecipeNutrition:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch nutrition",
    };
  }
}

/**
 * Manually update or create nutrition data for a recipe
 * Used when user wants to override AI-extracted data or add manual data
 */
export async function updateRecipeNutrition(
  recipeId: string,
  nutrition: NutritionData
): Promise<{
  data: RecipeNutrition | null;
  error: string | null;
}> {
  try {
    const { user } = await getCachedUserWithHousehold();
    // Only check for actual auth errors, not household/subscription errors
    if (!user) {
      return { data: null, error: "Not authenticated" };
    }
    // authError might be from household/subscription lookup, which is OK for nutrition tracking

    const supabase = await createClient();

    // Verify user owns the recipe
    const { data: recipe, error: recipeError } = await supabase
      .from("recipes")
      .select("id, user_id")
      .eq("id", recipeId)
      .single();

    if (recipeError || !recipe) {
      return { data: null, error: "Recipe not found" };
    }

    if (recipe.user_id !== user.id) {
      return { data: null, error: "You don't have permission to modify this recipe" };
    }

    // Upsert nutrition data (marked as manual source)
    const { data, error } = await supabase
      .from("recipe_nutrition")
      .upsert(
        {
          recipe_id: recipeId,
          ...nutrition,
          source: "manual",
          confidence_score: 1.0, // Manual entries are 100% confident
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "recipe_id",
        }
      )
      .select()
      .single();

    if (error) {
      console.error("Error updating recipe nutrition:", error);
      return { data: null, error: error.message };
    }

    // Invalidate Redis cache for nutrition
    await invalidateCachePattern(`nutrition:*`);

    // Revalidate relevant paths
    revalidatePath(`/app/recipes/${recipeId}`);
    revalidatePath("/app/recipes");
    revalidateTag(`recipes-${user.id}`, "default");

    // Also revalidate meal plans that might use this recipe
    revalidatePath("/app/plan");

    return { data, error: null };
  } catch (error) {
    console.error("Error in updateRecipeNutrition:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to update nutrition",
    };
  }
}

/**
 * Delete nutrition data for a recipe
 */
export async function deleteRecipeNutrition(recipeId: string): Promise<{
  success: boolean;
  error: string | null;
}> {
  try {
    const { user } = await getCachedUserWithHousehold();
    // Only check for actual auth errors, not household/subscription errors
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }
    // authError might be from household/subscription lookup, which is OK for nutrition tracking

    const supabase = await createClient();

    // Verify user owns the recipe
    const { data: recipe, error: recipeError } = await supabase
      .from("recipes")
      .select("id, user_id")
      .eq("id", recipeId)
      .single();

    if (recipeError || !recipe) {
      return { success: false, error: "Recipe not found" };
    }

    if (recipe.user_id !== user.id) {
      return { success: false, error: "You don't have permission to modify this recipe" };
    }

    const { error } = await supabase
      .from("recipe_nutrition")
      .delete()
      .eq("recipe_id", recipeId);

    if (error) {
      console.error("Error deleting recipe nutrition:", error);
      return { success: false, error: error.message };
    }

    // Invalidate Redis cache for nutrition
    await invalidateCachePattern(`nutrition:*`);

    // Revalidate relevant paths
    revalidatePath(`/app/recipes/${recipeId}`);
    revalidatePath("/app/recipes");
    revalidateTag(`recipes-${user.id}`, "default");
    revalidatePath("/app/plan");

    return { success: true, error: null };
  } catch (error) {
    console.error("Error in deleteRecipeNutrition:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete nutrition",
    };
  }
}

/**
 * Bulk fetch nutrition data for multiple recipes
 * Useful for meal plan page where we need nutrition for many recipes at once
 */
export async function getBulkRecipeNutrition(recipeIds: string[]): Promise<{
  data: Record<string, RecipeNutrition>;
  error: string | null;
}> {
  try {
    const { user, household } = await getCachedUserWithHousehold();
    // Only check for actual auth errors, not household/subscription errors
    if (!user) {
      return { data: {}, error: "Not authenticated" };
    }
    // authError might be from household/subscription lookup, which is OK for nutrition tracking

    // Skip if no recipe IDs
    if (recipeIds.length === 0) {
      return { data: {}, error: null };
    }

    // Use Redis cache with household-scoped key
    const cacheKey = nutritionKey(household?.household_id || user.id);

    const nutritionMap = await getCached<Record<string, RecipeNutrition>>(
      cacheKey,
      async () => {
        const supabase = await createClient();

        const { data, error } = await supabase
          .from("recipe_nutrition")
          .select("id, recipe_id, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, source, confidence_score, input_tokens, output_tokens, cost_usd, created_at, updated_at")
          .in("recipe_id", recipeIds);

        if (error) {
          throw new Error(error.message);
        }

        // Convert array to record keyed by recipe_id
        const result: Record<string, RecipeNutrition> = {};
        data.forEach((nutrition) => {
          result[nutrition.recipe_id] = nutrition;
        });

        return result;
      },
      CACHE_TTL.NUTRITION
    );

    return { data: nutritionMap, error: null };
  } catch (error) {
    console.error("Error in getBulkRecipeNutrition:", error);
    return {
      data: {},
      error: error instanceof Error ? error.message : "Failed to fetch nutrition",
    };
  }
}

/**
 * Get nutrition extraction cost summary
 * Returns total cost and cost breakdown by recipe
 */
export async function getNutritionExtractionCosts(): Promise<{
  data: {
    totalCost: number;
    totalRecipes: number;
    averageCostPerRecipe: number;
    recipes: Array<{
      recipe_id: string;
      recipe_title: string;
      cost_usd: number;
      input_tokens: number;
      output_tokens: number;
      extracted_at: string;
    }>;
  } | null;
  error: string | null;
}> {
  try {
    const { user } = await getCachedUserWithHousehold();
    if (!user) {
      return { data: null, error: "Not authenticated" };
    }

    const supabase = await createClient();

    // Get all nutrition extractions with costs for user's recipes
    const { data, error } = await supabase
      .from("recipe_nutrition")
      .select(`
        recipe_id,
        cost_usd,
        input_tokens,
        output_tokens,
        created_at,
        recipes!inner (
          id,
          title,
          user_id
        )
      `)
      .eq("recipes.user_id", user.id)
      .not("cost_usd", "is", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching nutrition costs:", error);
      return { data: null, error: error.message };
    }

    if (!data || data.length === 0) {
      return {
        data: {
          totalCost: 0,
          totalRecipes: 0,
          averageCostPerRecipe: 0,
          recipes: [],
        },
        error: null,
      };
    }

    const recipes = data.map((item) => ({
      recipe_id: item.recipe_id,
      recipe_title: (item.recipes as { title?: string } | null)?.title || "Unknown Recipe",
      cost_usd: Number(item.cost_usd),
      input_tokens: item.input_tokens || 0,
      output_tokens: item.output_tokens || 0,
      extracted_at: item.created_at,
    }));

    const totalCost = recipes.reduce((sum, r) => sum + r.cost_usd, 0);
    const totalRecipes = recipes.length;
    const averageCostPerRecipe = totalRecipes > 0 ? totalCost / totalRecipes : 0;

    return {
      data: {
        totalCost,
        totalRecipes,
        averageCostPerRecipe,
        recipes,
      },
      error: null,
    };
  } catch (error) {
    console.error("Error in getNutritionExtractionCosts:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch costs",
    };
  }
}
