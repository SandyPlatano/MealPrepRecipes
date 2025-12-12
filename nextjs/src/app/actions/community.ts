"use server";

import { createClient } from "@/lib/supabase/server";
import type {
  PublicRecipe,
  TrendingRecipe,
  RecipeReportReason,
} from "@/types/social";

// Get public recipes with filtering
export async function getPublicRecipes(options?: {
  limit?: number;
  offset?: number;
  category?: string;
  recipeType?: string;
  search?: string;
}): Promise<{ data: PublicRecipe[] | null; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase.rpc("get_public_recipes", {
    p_limit: options?.limit ?? 20,
    p_offset: options?.offset ?? 0,
    p_category: options?.category ?? null,
    p_recipe_type: options?.recipeType ?? null,
    p_search: options?.search ?? null,
    p_user_id: user?.id ?? null,
  });

  if (error) {
    console.error("Error fetching public recipes:", error);
    return { data: null, error: error.message };
  }

  // Transform database response to PublicRecipe type
  const recipes: PublicRecipe[] = (data || []).map((r: {
    id: string;
    title: string;
    recipe_type: string;
    category: string | null;
    prep_time: string | null;
    cook_time: string | null;
    servings: string | null;
    image_url: string | null;
    view_count: number;
    avg_rating: number | null;
    review_count: number;
    created_at: string;
    author_id: string;
    author_username: string;
    author_avatar_url: string | null;
    is_saved: boolean;
  }) => ({
    id: r.id,
    title: r.title,
    recipe_type: r.recipe_type,
    category: r.category,
    prep_time: r.prep_time,
    cook_time: r.cook_time,
    servings: r.servings,
    image_url: r.image_url,
    view_count: r.view_count,
    avg_rating: r.avg_rating,
    review_count: r.review_count,
    created_at: r.created_at,
    author: {
      id: r.author_id,
      username: r.author_username,
      avatar_url: r.author_avatar_url,
    },
    is_saved: r.is_saved,
  }));

  return { data: recipes, error: null };
}

// Get trending recipes
export async function getTrendingRecipes(
  limit: number = 10
): Promise<{ data: TrendingRecipe[] | null; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase.rpc("get_trending_recipes", {
    p_limit: limit,
    p_user_id: user?.id ?? null,
  });

  if (error) {
    console.error("Error fetching trending recipes:", error);
    return { data: null, error: error.message };
  }

  // Transform database response to TrendingRecipe type
  const recipes: TrendingRecipe[] = (data || []).map((r: {
    id: string;
    title: string;
    recipe_type: string;
    category: string | null;
    image_url: string | null;
    view_count: number;
    save_count: number;
    score: number;
    author_id: string;
    author_username: string;
    author_avatar_url: string | null;
    is_saved: boolean;
  }) => ({
    id: r.id,
    title: r.title,
    recipe_type: r.recipe_type,
    category: r.category,
    image_url: r.image_url,
    view_count: r.view_count,
    save_count: r.save_count,
    score: r.score,
    author: {
      id: r.author_id,
      username: r.author_username,
      avatar_url: r.author_avatar_url,
    },
    is_saved: r.is_saved,
  }));

  return { data: recipes, error: null };
}

// Save a public recipe
export async function saveRecipe(
  recipeId: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be signed in to save recipes" };
  }

  const { error } = await supabase.from("saved_recipes").insert({
    user_id: user.id,
    recipe_id: recipeId,
  });

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "Recipe already saved" };
    }
    console.error("Error saving recipe:", error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

// Unsave a recipe
export async function unsaveRecipe(
  recipeId: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be signed in" };
  }

  const { error } = await supabase
    .from("saved_recipes")
    .delete()
    .eq("user_id", user.id)
    .eq("recipe_id", recipeId);

  if (error) {
    console.error("Error unsaving recipe:", error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

// Get user's saved recipes
export async function getSavedRecipes(options?: {
  limit?: number;
  offset?: number;
}): Promise<{ data: PublicRecipe[] | null; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "You must be signed in" };
  }

  const limit = options?.limit ?? 20;
  const offset = options?.offset ?? 0;

  const { data, error } = await supabase
    .from("saved_recipes")
    .select(
      `
      recipe:recipes!inner (
        id,
        title,
        recipe_type,
        category,
        prep_time,
        cook_time,
        servings,
        image_url,
        view_count,
        avg_rating,
        review_count,
        created_at,
        user:profiles!recipes_user_id_fkey (
          id,
          username,
          avatar_url
        )
      )
    `
    )
    .eq("user_id", user.id)
    .range(offset, offset + limit - 1)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching saved recipes:", error);
    return { data: null, error: error.message };
  }

  // Transform to PublicRecipe type
  const recipes: PublicRecipe[] = (data || []).map((item) => {
    const r = item.recipe as {
      id: string;
      title: string;
      recipe_type: string;
      category: string | null;
      prep_time: string | null;
      cook_time: string | null;
      servings: string | null;
      image_url: string | null;
      view_count: number;
      avg_rating: number | null;
      review_count: number;
      created_at: string;
      user: { id: string; username: string; avatar_url: string | null };
    };
    return {
      id: r.id,
      title: r.title,
      recipe_type: r.recipe_type,
      category: r.category,
      prep_time: r.prep_time,
      cook_time: r.cook_time,
      servings: r.servings,
      image_url: r.image_url,
      view_count: r.view_count,
      avg_rating: r.avg_rating,
      review_count: r.review_count,
      created_at: r.created_at,
      author: {
        id: r.user.id,
        username: r.user.username,
        avatar_url: r.user.avatar_url,
      },
      is_saved: true,
    };
  });

  return { data: recipes, error: null };
}

// Report a recipe
export async function reportRecipe(
  recipeId: string,
  reason: RecipeReportReason,
  description?: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be signed in to report recipes" };
  }

  // Check that recipe exists and is public
  const { data: recipe } = await supabase
    .from("recipes")
    .select("id, user_id, is_public")
    .eq("id", recipeId)
    .single();

  if (!recipe) {
    return { success: false, error: "Recipe not found" };
  }

  if (!recipe.is_public) {
    return { success: false, error: "Can only report public recipes" };
  }

  if (recipe.user_id === user.id) {
    return { success: false, error: "Cannot report your own recipe" };
  }

  const { error } = await supabase.from("recipe_reports").insert({
    recipe_id: recipeId,
    reporter_id: user.id,
    reason,
    description: description || null,
  });

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "You have already reported this recipe" };
    }
    console.error("Error reporting recipe:", error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

// Get available categories from public recipes
export async function getPublicCategories(): Promise<{
  data: string[] | null;
  error: string | null;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("recipes")
    .select("category")
    .eq("is_public", true)
    .eq("hidden_from_public", false)
    .not("category", "is", null);

  if (error) {
    console.error("Error fetching categories:", error);
    return { data: null, error: error.message };
  }

  // Get unique categories
  const categories = [...new Set(data.map((r) => r.category).filter(Boolean))] as string[];
  return { data: categories.sort(), error: null };
}

// Get available recipe types from public recipes
export async function getPublicRecipeTypes(): Promise<{
  data: string[] | null;
  error: string | null;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("recipes")
    .select("recipe_type")
    .eq("is_public", true)
    .eq("hidden_from_public", false);

  if (error) {
    console.error("Error fetching recipe types:", error);
    return { data: null, error: error.message };
  }

  // Get unique recipe types
  const types = [...new Set(data.map((r) => r.recipe_type).filter(Boolean))] as string[];
  return { data: types.sort(), error: null };
}

// Refresh trending cache (called by cron)
export async function refreshTrendingCache(): Promise<{
  success: boolean;
  error: string | null;
}> {
  const supabase = await createClient();

  const { error } = await supabase.rpc("refresh_trending_cache");

  if (error) {
    console.error("Error refreshing trending cache:", error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}
