import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getRecipes, getFavorites, getRecipeCookCounts } from "@/app/actions/recipes";
import { getSettings } from "@/app/actions/settings";
import { RecipeGrid } from "@/components/recipes/recipe-grid";
import { RecipeFilters } from "@/components/recipes/recipe-filters";
import { OnboardingWrapper } from "@/components/onboarding/onboarding-wrapper";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get user's profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id)
    .single();

  // Get recipes, favorites, cook counts, and settings
  const [recipesResult, favoritesResult, cookCountsResult, settingsResult] = await Promise.all([
    getRecipes(),
    getFavorites(),
    getRecipeCookCounts(),
    getSettings(),
  ]);

  const recipes = recipesResult.data || [];
  const favoriteIds = new Set(favoritesResult.data || []);
  const cookCounts = cookCountsResult.data || {};
  const settings = settingsResult.data;
  
  // Check if user needs onboarding (no recipes and no cook names set)
  const needsOnboarding = recipes.length === 0 && (!settings?.cook_names || settings.cook_names.length === 0);

  // Add favorite status to recipes
  const recipesWithFavorites = recipes.map((recipe) => ({
    ...recipe,
    is_favorite: favoriteIds.has(recipe.id),
  }));

  return (
    <>
      <OnboardingWrapper 
        shouldShow={needsOnboarding}
        currentName={profile?.first_name && profile?.last_name ? `${profile.first_name} ${profile.last_name}` : profile?.name || ""}
        currentCookNames={settings?.cook_names || []}
      />
      
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-mono font-bold tracking-tight">
            Hey, {profile?.first_name || profile?.name || "there"}!
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Your recipe collection. {recipes.length} recipes and counting.
          </p>
        </div>

        {/* Main Content */}
        <Suspense fallback={<div>Loading...</div>}>
          <RecipeGrid recipes={recipesWithFavorites} recipeCookCounts={cookCounts} />
        </Suspense>
      </div>
    </>
  );
}
