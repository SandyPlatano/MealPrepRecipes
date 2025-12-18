import { Suspense } from "react";
import { getRecipes, getFavorites, getRecipeCookCounts } from "@/app/actions/recipes";
import { getSettings } from "@/app/actions/settings";
import { getBulkRecipeNutrition } from "@/app/actions/nutrition";
import { getActiveCustomBadges } from "@/app/actions/custom-badges";
import { getFolders, getFolderCategories } from "@/app/actions/folders";
import { getSystemSmartFolders, getUserSmartFolders, getCookingHistoryContext } from "@/app/actions/smart-folders";
import { getSidebarPreferencesAuto } from "@/app/actions/sidebar-preferences";
import { createClient } from "@/lib/supabase/server";
import { RecipesPageClient } from "@/components/recipes/recipes-page-client";
import { ContextualHint } from "@/components/hints/contextual-hint";
import { HINT_IDS, HINT_CONTENT } from "@/lib/hints";
import type { FolderWithChildren, FolderCategoryWithFolders } from "@/types/folder";
import { EmptyState } from "@/components/ui/empty-state";
import { UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function RecipesPage() {
  const supabase = await createClient();

  const [
    recipesResult,
    favoritesResult,
    settingsResult,
    cookCountsResult,
    customBadgesResult,
    foldersResult,
    categoriesResult,
    systemSmartFoldersResult,
    userSmartFoldersResult,
    cookingHistoryResult,
    sidebarPreferencesResult,
  ] = await Promise.all([
    getRecipes(),
    getFavorites(),
    getSettings(),
    getRecipeCookCounts(),
    getActiveCustomBadges(),
    getFolders(),
    getFolderCategories(),
    getSystemSmartFolders(),
    getUserSmartFolders(),
    getCookingHistoryContext(),
    getSidebarPreferencesAuto(),
  ]);

  const recipes = recipesResult.data || [];
  const favoriteIds = new Set(favoritesResult.data || []);
  const userAllergenAlerts = settingsResult.data?.allergen_alerts || [];
  const customDietaryRestrictions = settingsResult.data?.custom_dietary_restrictions || [];
  const recipeCookCounts = cookCountsResult.data || {};
  const customBadges = customBadgesResult.data || [];
  const folders = foldersResult.data || [];
  const categories = categoriesResult.data || [];
  const systemSmartFolders = systemSmartFoldersResult.data || [];
  const userSmartFolders = userSmartFoldersResult.data || [];
  const cookingHistoryContext = cookingHistoryResult.data || { cookCounts: {}, lastCookedDates: {} };
  const pinnedItems = sidebarPreferencesResult.data?.pinnedItems || [];

  // Build folder membership map (folderId -> recipeIds[])
  const folderMemberships: Record<string, string[]> = {};
  const buildMembershipMap = (folderList: FolderWithChildren[]) => {
    for (const folder of folderList) {
      // We'll populate this with actual data from the database
      folderMemberships[folder.id] = [];
      if (folder.children.length > 0) {
        buildMembershipMap(folder.children);
      }
    }
  };
  buildMembershipMap(folders);

  // Fetch all folder memberships
  if (folders.length > 0) {
    const allFolderIds = Object.keys(folderMemberships);
    const { data: memberships } = await supabase
      .from("recipe_folder_members")
      .select("folder_id, recipe_id")
      .in("folder_id", allFolderIds);

    if (memberships) {
      for (const m of memberships) {
        if (!folderMemberships[m.folder_id]) {
          folderMemberships[m.folder_id] = [];
        }
        folderMemberships[m.folder_id].push(m.recipe_id);
      }
    }
  }

  // Fetch nutrition data for all recipes
  const recipeIds = recipes.map((r) => r.id);
  const nutritionResult = await getBulkRecipeNutrition(recipeIds);
  const nutritionMap = nutritionResult.data || {};

  // Add favorite status and nutrition to recipes
  const recipesWithFavorites = recipes.map((recipe) => ({
    ...recipe,
    is_favorite: favoriteIds.has(recipe.id),
    nutrition: nutritionMap[recipe.id] || null,
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

      <ContextualHint
        hintId={HINT_IDS.RECIPES_INTRO}
        title={HINT_CONTENT[HINT_IDS.RECIPES_INTRO].title}
        description={HINT_CONTENT[HINT_IDS.RECIPES_INTRO].description}
      />

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
        <Suspense fallback={<div>Loading recipes...</div>}>
          <RecipesPageClient
            recipes={recipesWithFavorites}
            recipeCookCounts={recipeCookCounts}
            recentlyCookedIds={recentlyCookedIds}
            userAllergenAlerts={userAllergenAlerts}
            customDietaryRestrictions={customDietaryRestrictions}
            customBadges={customBadges}
            folders={folders}
            categories={categories}
            folderMemberships={folderMemberships}
            systemSmartFolders={systemSmartFolders}
            userSmartFolders={userSmartFolders}
            cookingHistoryContext={cookingHistoryContext}
            pinnedItems={pinnedItems}
          />
        </Suspense>
      )}
    </div>
  );
}
