"use server";

/**
 * Global Search Server Actions
 *
 * Server-side search for recipes and public profiles.
 */

import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import type { RecipeSearchResult, ProfileSearchResult, SearchResults } from "@/types/global-search";

export interface GlobalSearchResponse {
  data: SearchResults | null;
  error: string | null;
}

/**
 * Search recipes and public profiles
 *
 * @param query - Search query string (min 2 characters)
 * @returns Search results grouped by type
 */
export async function globalSearch(query: string): Promise<GlobalSearchResponse> {
  const trimmedQuery = query.trim();

  // Return empty results for short queries
  if (!trimmedQuery || trimmedQuery.length < 2) {
    return { data: { recipes: [], profiles: [] }, error: null };
  }

  const { user, household } = await getCachedUserWithHousehold();

  if (!user) {
    return { data: null, error: "Not authenticated" };
  }

  const supabase = await createClient();

  // Run both searches in parallel
  const [recipesResult, profilesResult] = await Promise.all([
    supabase.rpc("search_user_recipes", {
      p_user_id: user.id,
      p_household_id: household?.household_id ?? null,
      p_query: trimmedQuery,
      p_limit: 8,
    }),
    supabase.rpc("search_public_profiles", {
      p_query: trimmedQuery,
      p_limit: 5,
    }),
  ]);

  if (recipesResult.error) {
    console.error("[globalSearch] Recipe search error:", recipesResult.error);
    return { data: null, error: recipesResult.error.message };
  }

  // Don't fail entirely if profiles search fails - just return empty profiles
  if (profilesResult.error) {
    console.error("[globalSearch] Profile search error:", profilesResult.error);
  }

  const recipes: RecipeSearchResult[] = (recipesResult.data ?? []).map((r: RecipeSearchResult) => ({
    id: r.id,
    title: r.title,
    recipe_type: r.recipe_type,
    category: r.category,
    image_url: r.image_url,
    protein_type: r.protein_type,
    relevance: r.relevance,
  }));

  const profiles: ProfileSearchResult[] = (profilesResult.data ?? []).map((p: ProfileSearchResult) => ({
    id: p.id,
    username: p.username,
    first_name: p.first_name,
    last_name: p.last_name,
    avatar_url: p.avatar_url,
    bio: p.bio,
    public_recipe_count: p.public_recipe_count,
  }));

  return {
    data: { recipes, profiles },
    error: null,
  };
}
