"use server";

/**
 * Global Search Server Actions
 *
 * Server-side search for recipes, quick actions, and public profiles.
 */

import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import type {
  RecipeSearchResult,
  ProfileSearchResult,
  ActionSearchResult,
  GroupedSearchResults,
} from "@/types/global-search";
import { searchActions } from "./global-search-index";

export interface GlobalSearchResponse {
  data: GroupedSearchResults;
  error: string | null;
}

const emptyResults: GroupedSearchResults = {
  recipes: [],
  actions: [],
  profiles: [],
};

/**
 * Search recipes, quick actions, and public profiles
 *
 * @param query - Search query string (min 1 character)
 * @returns Search results grouped by type
 */
export async function globalSearch(query: string): Promise<GlobalSearchResponse> {
  const trimmedQuery = query.trim();

  // Return empty results for empty queries
  if (!trimmedQuery) {
    return { data: emptyResults, error: null };
  }

  // Search local actions (always available, even without auth)
  const matchedActions = searchActions(trimmedQuery);
  const actions: ActionSearchResult[] = matchedActions.map((action) => ({
    id: action.id,
    category: "actions" as const,
    title: action.label,
    subtitle: action.description,
    label: action.label,
    description: action.description,
    keywords: action.keywords,
    action_category: action.category,
    icon: action.icon,
    action_type: action.behavior === "navigate" ? "navigation" : "command",
    behavior: action.behavior,
    destination: action.href,
    href: action.href,
    command: action.functionId,
    functionId: action.functionId,
  }));

  const { user, household } = await getCachedUserWithHousehold();

  // Return only actions if not authenticated
  if (!user) {
    return { data: { ...emptyResults, actions }, error: null };
  }

  const supabase = await createClient();

  // Run recipe and profile searches in parallel
  const [recipesResult, profilesResult] = await Promise.all([
    household?.household_id
      ? supabase.rpc("search_user_recipes", {
          p_user_id: user.id,
          p_household_id: household.household_id,
          p_query: trimmedQuery,
          p_limit: 8,
        })
      : Promise.resolve({ data: [], error: null }),
    supabase.rpc("search_public_profiles", {
      p_query: trimmedQuery,
      p_limit: 5,
    }),
  ]);

  if (recipesResult.error) {
    console.error("[globalSearch] Recipe search error:", recipesResult.error);
  }

  if (profilesResult.error) {
    console.error("[globalSearch] Profile search error:", profilesResult.error);
  }

  // Transform recipe results
  const recipes: RecipeSearchResult[] = (recipesResult.data ?? []).map(
    (r: {
      id: string;
      title: string;
      description: string | null;
      recipe_type: string;
      protein_type: string | null;
      category: string | null;
      prep_time: string | null;
      cook_time: string | null;
      servings: number | null;
      image_url: string | null;
      tags: string[];
      relevance_score: number;
    }) => ({
      id: r.id,
      category: "recipes" as const,
      title: r.title,
      subtitle: [r.recipe_type, r.protein_type, r.category].filter(Boolean).join(" • "),
      recipe_type: r.recipe_type,
      category_name: r.category,
      image_url: r.image_url,
      protein_type: r.protein_type,
      cook_time: r.cook_time ? parseInt(r.cook_time) : null,
      prep_time: r.prep_time ? parseInt(r.prep_time) : null,
      servings: r.servings,
      difficulty: null,
      tags: r.tags || [],
      description: r.description,
      relevance: r.relevance_score,
    })
  );

  // Transform profile results
  const profiles: ProfileSearchResult[] = (profilesResult.data ?? []).map(
    (p: {
      id: string;
      username: string;
      first_name: string | null;
      last_name: string | null;
      avatar_url: string | null;
      bio: string | null;
      public_recipe_count: number;
    }) => ({
      id: p.id,
      category: "profiles" as const,
      title: p.username,
      subtitle: [p.first_name, p.last_name].filter(Boolean).join(" ") || undefined,
      username: p.username,
      display_name: [p.first_name, p.last_name].filter(Boolean).join(" ") || p.username,
      first_name: p.first_name,
      last_name: p.last_name,
      avatar_url: p.avatar_url,
      bio: p.bio,
      public_recipe_count: p.public_recipe_count,
      follower_count: null,
      is_following: null,
    })
  );

  return {
    data: { recipes, actions, profiles },
    error: null,
  };
}
