import { Suspense } from "react";
import { getRecipes, getFavorites, getRecipeCookCounts } from "@/app/actions/recipes";
import { getSettings } from "@/app/actions/settings";
import { createClient } from "@/lib/supabase/server";
import { RecipesPageClient } from "@/components/recipes/recipes-page-client";

export default async function RecipesPage() {
  const supabase = await createClient();
  
  const [recipesResult, favoritesResult, settingsResult, cookCountsResult] = await Promise.all([
    getRecipes(),
    getFavorites(),
    getSettings(),
    getRecipeCookCounts(),
  ]);

  const recipes = recipesResult.data || [];
  const favoriteIds = new Set(favoritesResult.data || []);
  const userAllergenAlerts = settingsResult.data?.allergen_alerts || [];
  const customDietaryRestrictions = settingsResult.data?.custom_dietary_restrictions || [];
  const recipeCookCounts = cookCountsResult.data || {};

  // Add favorite status to recipes
  const recipesWithFavorites = recipes.map((recipe) => ({
    ...recipe,
    is_favorite: favoriteIds.has(recipe.id),
  }));

  // Get recently cooked recipes (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: recentHistory } = await supabase
    .from("cooking_history")
    .select("recipe_id")
    .gte("cooked_at", thirtyDaysAgo.toISOString());

  const recentlyCookedIds = Array.from(
    new Set(recentHistory?.map((h) => h.recipe_id) || [])
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-mono font-bold">Recipes</h1>
        <p className="text-muted-foreground mt-1">
          Your collection of culinary wins. {recipes.length} recipes and counting.
        </p>
      </div>

      <Suspense fallback={<div>Loading recipes...</div>}>
        <RecipesPageClient
          recipes={recipesWithFavorites}
          recipeCookCounts={recipeCookCounts}
          recentlyCookedIds={recentlyCookedIds}
          userAllergenAlerts={userAllergenAlerts}
          customDietaryRestrictions={customDietaryRestrictions}
        />
      </Suspense>
    </div>
  );
}
