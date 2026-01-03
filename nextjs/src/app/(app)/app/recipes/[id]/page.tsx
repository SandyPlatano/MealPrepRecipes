import { notFound } from "next/navigation";
import Link from "next/link";
import { getRecipe, getFavorites, getRecipeHistory } from "@/app/actions/recipes";
import { getSettings } from "@/app/actions/settings";
import { getRecipeNutrition, isNutritionTrackingEnabled } from "@/app/actions/nutrition";
import { findSubstitutionsForIngredients } from "@/app/actions/substitutions";
import { getUserPreferencesV2 } from "@/app/actions/user-preferences";
import { RecipeDetail } from "@/components/recipes/recipe-detail";
import { AppBreadcrumb } from "@/components/navigation/app-breadcrumb";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_RECIPE_LAYOUT_PREFERENCES } from "@/types/recipe-layout";

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
  const backLabel = from === "plan" ? "Back to Plan" : "Back to Recipes";

  // Get current user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [recipeResult, favoritesResult, historyResult, settingsResult, nutritionTrackingResult, prefsResult] = await Promise.all([
    getRecipe(id),
    getFavorites(),
    getRecipeHistory(id),
    getSettings(),
    isNutritionTrackingEnabled(),
    user?.id ? getUserPreferencesV2(user.id) : Promise.resolve({ error: null, data: null }),
  ]);

  if (recipeResult.error || !recipeResult.data) {
    notFound();
  }

  const recipe = recipeResult.data;
  const favoriteIds = new Set(favoritesResult.data || []);
  const isFavorite = favoriteIds.has(recipe.id);
  const history = historyResult.data || [];
  const userAllergenAlerts = (settingsResult.data?.allergen_alerts || []) as string[];
  const customDietaryRestrictions = (settingsResult.data?.custom_dietary_restrictions || []) as string[];
  const userUnitSystem = (settingsResult.data?.unit_system as "imperial" | "metric") || "imperial";
  const layoutPrefs = prefsResult.data?.recipeLayout ?? DEFAULT_RECIPE_LAYOUT_PREFERENCES;

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
    <div className="flex flex-col gap-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <AppBreadcrumb currentTitle={recipe.title} />
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
        currentUserId={user?.id}
        userUnitSystem={userUnitSystem}
        layoutPrefs={layoutPrefs}
      />
    </div>
  );
}
