import { Suspense } from "react";
import { getRecipes, getFavorites } from "@/app/actions/recipes";
import { getSettings } from "@/app/actions/settings";
import { RecipeGrid } from "@/components/recipes/recipe-grid";

export default async function RecipesPage() {
  const [recipesResult, favoritesResult, settingsResult] = await Promise.all([
    getRecipes(),
    getFavorites(),
    getSettings(),
  ]);

  const recipes = recipesResult.data || [];
  const favoriteIds = new Set(favoritesResult.data || []);
  const userAllergenAlerts = settingsResult.data?.allergen_alerts || [];
  const customDietaryRestrictions = settingsResult.data?.custom_dietary_restrictions || [];

  // Add favorite status to recipes
  const recipesWithFavorites = recipes.map((recipe) => ({
    ...recipe,
    is_favorite: favoriteIds.has(recipe.id),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-mono font-bold">The Vault</h1>
        <p className="text-muted-foreground mt-1">
          Your collection of culinary wins. {recipes.length} recipes and counting.
        </p>
      </div>

      <Suspense fallback={<div>Loading recipes...</div>}>
        <RecipeGrid recipes={recipesWithFavorites} userAllergenAlerts={userAllergenAlerts} customDietaryRestrictions={customDietaryRestrictions} />
      </Suspense>
    </div>
  );
}
