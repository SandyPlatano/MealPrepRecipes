"use server";

import { createClient } from "@/lib/supabase/server";
import type { Recipe } from "@/types/recipe";

/**
 * Get a recipe by share token (for guest viewing)
 * This can be called without authentication
 */
export async function getRecipeByShareToken(token: string): Promise<{
  error: string | null;
  data: (Recipe & { author?: { username: string; avatar_url: string | null } }) | null;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("recipes")
    .select(`
      *,
      profiles:user_id (
        username,
        avatar_url
      )
    `)
    .eq("share_token", token)
    .single();

  if (error || !data) {
    return { error: "Recipe not found or link has expired", data: null };
  }

  // Transform the data to include author info
  const { profiles, ...recipeData } = data;
  return {
    error: null,
    data: {
      ...recipeData,
      author: profiles
        ? {
            username: profiles.username || "Anonymous",
            avatar_url: profiles.avatar_url,
          }
        : undefined,
    } as Recipe & { author?: { username: string; avatar_url: string | null } },
  };
}

/**
 * Get a public recipe by ID (for guest viewing)
 */
export async function getPublicRecipe(recipeId: string): Promise<{
  error: string | null;
  data: (Recipe & { author?: { username: string; avatar_url: string | null } }) | null;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("recipes")
    .select(`
      *,
      profiles:user_id (
        username,
        avatar_url
      )
    `)
    .eq("id", recipeId)
    .eq("is_public", true)
    .single();

  if (error || !data) {
    return { error: "Recipe not found or is private", data: null };
  }

  const { profiles, ...recipeData } = data;
  return {
    error: null,
    data: {
      ...recipeData,
      author: profiles
        ? {
            username: profiles.username || "Anonymous",
            avatar_url: profiles.avatar_url,
          }
        : undefined,
    } as Recipe & { author?: { username: string; avatar_url: string | null } },
  };
}
