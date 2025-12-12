import { notFound } from "next/navigation";
import Link from "next/link";
import { getRecipe, getFavorites, getRecipeHistory } from "@/app/actions/recipes";
import { getSettings } from "@/app/actions/settings";
import { getRecipeNutrition, isNutritionTrackingEnabled } from "@/app/actions/nutrition";
import { findSubstitutionsForIngredients } from "@/lib/substitutions";
import { RecipeDetail } from "@/components/recipes/recipe-detail";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";

interface RecipePageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ from?: string | string[] }>;
}

export default async function RecipePage({ params, searchParams }: RecipePageProps) {
  const { id } = await params;
  const search = searchParams ? await searchParams : {};
  const fromParam = search?.from;
  const from = Array.isArray(fromParam) ? fromParam[0] : fromParam;
  const backHref = from === "plan" ? "/app/plan" : "/app/recipes";
  const backLabel = from === "plan" ? "Back to Plan" : "Back to The Vault";
  const [recipeResult, favoritesResult, historyResult, settingsResult, nutritionTrackingResult] = await Promise.all([
    getRecipe(id),
    getFavorites(),
    getRecipeHistory(id),
    getSettings(),
    isNutritionTrackingEnabled(),
  ]);

  if (recipeResult.error || !recipeResult.data) {
    notFound();
  }

  const recipe = recipeResult.data;
  const favoriteIds = new Set(favoritesResult.data || []);
  const isFavorite = favoriteIds.has(recipe.id);
  const history = historyResult.data || [];
  const userAllergenAlerts = settingsResult.data?.allergen_alerts || [];
  const customDietaryRestrictions = settingsResult.data?.custom_dietary_restrictions || [];

  // Fetch nutrition data if tracking is enabled
  const nutritionEnabled = nutritionTrackingResult.enabled || false;
  let nutrition = null;
  if (nutritionEnabled) {
    const nutritionResult = await getRecipeNutrition(id);
    nutrition = nutritionResult.data;
  }

  // Fetch substitutions for this recipe's ingredients
  const substitutions = await findSubstitutionsForIngredients(recipe.ingredients);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href={backHref}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {backLabel}
          </Button>
        </Link>
        <Link href={`/app/recipes/${id}/edit`}>
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit Recipe
          </Button>
        </Link>
      </div>

      <RecipeDetail
        recipe={recipe}
        isFavorite={isFavorite}
        history={history}
        userAllergenAlerts={userAllergenAlerts}
        customDietaryRestrictions={customDietaryRestrictions}
        nutrition={nutrition}
        nutritionEnabled={nutritionEnabled}
        substitutions={substitutions}
      />
    </div>
  );
}
