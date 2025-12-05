import { notFound } from "next/navigation";
import Link from "next/link";
import { getRecipe, getFavorites, getRecipeHistory } from "@/app/actions/recipes";
import { RecipeDetail } from "@/components/recipes/recipe-detail";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";

interface RecipePageProps {
  params: Promise<{ id: string }>;
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { id } = await params;
  const [recipeResult, favoritesResult, historyResult] = await Promise.all([
    getRecipe(id),
    getFavorites(),
    getRecipeHistory(id),
  ]);

  if (recipeResult.error || !recipeResult.data) {
    notFound();
  }

  const recipe = recipeResult.data;
  const favoriteIds = new Set(favoritesResult.data || []);
  const isFavorite = favoriteIds.has(recipe.id);
  const history = historyResult.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/app/recipes">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to The Vault
          </Button>
        </Link>
        <Link href={`/app/recipes/${id}/edit`}>
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit Recipe
          </Button>
        </Link>
      </div>

      <RecipeDetail recipe={recipe} isFavorite={isFavorite} history={history} />
    </div>
  );
}
