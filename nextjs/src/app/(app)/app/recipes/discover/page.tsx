import { getRecipes, getFavorites, getRecipeCookCounts } from "@/app/actions/recipes";
import { RecipeDiscovery } from "@/components/recipes/recipe-discovery";
import { createClient } from "@/lib/supabase/server";

export default async function DiscoverPage() {
  const supabase = await createClient();

  // Get recipes, favorites, and cook counts
  const [recipesResult, favoritesResult, cookCountsResult] = await Promise.all([
    getRecipes(),
    getFavorites(),
    getRecipeCookCounts(),
  ]);

  const recipes = recipesResult.data || [];
  const favoriteIds = new Set(favoritesResult.data || []);
  const cookCounts = cookCountsResult.data || {};

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

  const recentlyCookedIds = Array.from(new Set(recentHistory?.map((h) => h.recipe_id) || []));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-mono font-bold tracking-tight">Discover Recipes</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Find your next meal from your collection.
        </p>
      </div>

      {/* Discovery Component */}
      <RecipeDiscovery
        recipes={recipesWithFavorites}
        recipeCookCounts={cookCounts}
        recentlyCookedIds={recentlyCookedIds}
      />
    </div>
  );
}

