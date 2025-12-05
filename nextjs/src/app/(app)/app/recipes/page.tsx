import { Suspense } from "react";
import { getRecipes, getFavorites } from "@/app/actions/recipes";
import { RecipeGrid } from "@/components/recipes/recipe-grid";
import { RecipeFilters } from "@/components/recipes/recipe-filters";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function RecipesPage() {
  const [recipesResult, favoritesResult] = await Promise.all([
    getRecipes(),
    getFavorites(),
  ]);

  const recipes = recipesResult.data || [];
  const favoriteIds = new Set(favoritesResult.data || []);

  // Add favorite status to recipes
  const recipesWithFavorites = recipes.map((recipe) => ({
    ...recipe,
    is_favorite: favoriteIds.has(recipe.id),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-mono font-bold">The Vault</h1>
          <p className="text-muted-foreground mt-1">
            Your collection of culinary wins. {recipes.length} recipes and counting.
          </p>
        </div>
        <Link href="/app/recipes/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Recipe
          </Button>
        </Link>
      </div>

      <Suspense fallback={<div>Loading filters...</div>}>
        <RecipeFilters />
      </Suspense>

      <Suspense fallback={<div>Loading recipes...</div>}>
        <RecipeGrid recipes={recipesWithFavorites} />
      </Suspense>
    </div>
  );
}
