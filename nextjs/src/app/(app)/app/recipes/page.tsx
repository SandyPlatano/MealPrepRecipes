import { Suspense } from "react";
import { getRecipes, getFavorites, getRecipeCookCounts } from "@/app/actions/recipes";
import { getSettings } from "@/app/actions/settings";
import { getBulkRecipeNutrition } from "@/app/actions/nutrition";
import { getActiveCustomBadges } from "@/app/actions/custom-badges";
import { getFolders, getAllFolderMemberships } from "@/app/actions/folders";
import { getSystemSmartFolders, getUserSmartFolders, getCookingHistoryContext, getSmartFolderCache } from "@/app/actions/smart-folders";
import { getRecentlyCookedRecipeIds } from "@/app/actions/cooking-history";
import { createClient } from "@/lib/supabase/server";
import { RecipesPageClient } from "@/components/recipes/recipes-page-client";
import { RecipeGridSkeleton } from "@/components/recipes/recipe-card-skeleton";
import { ContextualHint } from "@/components/hints/contextual-hint";
import { FirstRecipeHint } from "@/components/hints/first-recipe-hint";
import { HINT_IDS, HINT_CONTENT } from "@/lib/hints";
import { EmptyState } from "@/components/ui/empty-state";
import { UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PersonalizedGreeting } from "@/components/ui/personalized-greeting";

interface RecipesPageProps {
  searchParams: Promise<{
    filter?: string;
    id?: string;
    system?: string;
  }>;
}

export default async function RecipesPage({ searchParams }: RecipesPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch all data in parallel (optimized - no sequential queries)
  const [
    profileResult,
    recipesResult,
    favoritesResult,
    settingsResult,
    cookCountsResult,
    customBadgesResult,
    foldersResult,
    systemSmartFoldersResult,
    userSmartFoldersResult,
    cookingHistoryResult,
    folderMembershipsResult,
    recentlyCookedResult,
    smartFolderCacheResult,
  ] = await Promise.all([
    user ? supabase.from("profiles").select("first_name").eq("id", user.id).single() : Promise.resolve({ data: null }),
    getRecipes(),
    getFavorites(),
    getSettings(),
    getRecipeCookCounts(),
    getActiveCustomBadges(),
    getFolders(),
    getSystemSmartFolders(),
    getUserSmartFolders(),
    getCookingHistoryContext(),
    getAllFolderMemberships(),
    getRecentlyCookedRecipeIds(30),
    getSmartFolderCache(),
  ]);

  const profile = profileResult.data;
  const recipes = recipesResult.data || [];
  const favoriteIds = new Set(favoritesResult.data || []);
  const userAllergenAlerts = (settingsResult.data?.allergen_alerts || []) as string[];
  const customDietaryRestrictions = (settingsResult.data?.custom_dietary_restrictions || []) as string[];
  const recipeCookCounts = cookCountsResult.data || {};
  const customBadges = customBadgesResult.data || [];
  const folders = foldersResult.data || [];
  const systemSmartFolders = systemSmartFoldersResult.data || [];
  const userSmartFolders = userSmartFoldersResult.data || [];
  const cookingHistoryContext = cookingHistoryResult.data || { cookCounts: {}, lastCookedDates: {} };
  const folderMemberships = folderMembershipsResult.data || {};
  const recentlyCookedIds = recentlyCookedResult.data || [];
  const smartFolderCache = smartFolderCacheResult.data || {};

  // NOTE: Removed blocking lazy rebuild - cache is populated by database triggers
  // Client-side filtering serves as fallback if cache is empty

  // Fetch nutrition data (single sequential call - depends on recipe IDs)
  const recipeIds = recipes.map((r) => r.id);
  const nutritionResult = await getBulkRecipeNutrition(recipeIds);
  const nutritionMap = nutritionResult.data || {};

  // Add favorite status and nutrition to recipes
  const recipesWithFavorites = recipes.map((recipe) => ({
    ...recipe,
    is_favorite: favoriteIds.has(recipe.id),
    nutrition: nutritionMap[recipe.id] || null,
  }));

  return (
    <div className="flex flex-col gap-6">
      <PersonalizedGreeting
        userName={profile?.first_name}
        fallbackMessage="Ready to cook something great?"
      />

      <ContextualHint
        hintId={HINT_IDS.RECIPES_INTRO}
        title={HINT_CONTENT[HINT_IDS.RECIPES_INTRO].title}
        description={HINT_CONTENT[HINT_IDS.RECIPES_INTRO].description}
      />

      <FirstRecipeHint recipeCount={recipes.length} />

      {recipes.length === 0 ? (
        <EmptyState
          icon={<UtensilsCrossed className="h-12 w-12 text-muted-foreground" />}
          title="No recipes yet"
          description="Create your first recipe or discover recipes from the community"
          action={
            <Button asChild>
              <Link href="/app/recipes/new">Create Recipe</Link>
            </Button>
          }
        />
      ) : (
        <Suspense fallback={<RecipeGridSkeleton count={6} />}>
          <RecipesPageClient
            recipes={recipesWithFavorites}
            recipeCookCounts={recipeCookCounts}
            recentlyCookedIds={recentlyCookedIds}
            userAllergenAlerts={userAllergenAlerts}
            customDietaryRestrictions={customDietaryRestrictions}
            customBadges={customBadges}
            folders={folders}
            folderMemberships={folderMemberships}
            systemSmartFolders={systemSmartFolders}
            userSmartFolders={userSmartFolders}
            cookingHistoryContext={cookingHistoryContext}
            smartFolderCache={smartFolderCache}
            searchParams={params}
            totalRecipes={recipes.length}
          />
        </Suspense>
      )}
    </div>
  );
}
