"use client";

import { useState, useMemo, useCallback } from "react";
import { RecipeGrid } from "./recipe-grid";
import { DiscoverDialog } from "./discover-dialog";
import { FolderSidebar } from "@/components/folders/folder-sidebar";
import { AddToFolderSheet } from "@/components/folders/add-to-folder-sheet";
import type {
  RecipeWithFavoriteAndNutrition,
  RecipeWithFavorite,
  Recipe,
} from "@/types/recipe";
import type { CustomBadge } from "@/lib/nutrition/badge-calculator";
import type { FolderWithChildren, ActiveFolderFilter } from "@/types/folder";
import { getRecipeFolderIds } from "@/app/actions/folders";

interface RecipesPageClientProps {
  recipes: RecipeWithFavoriteAndNutrition[];
  recipeCookCounts: Record<string, number>;
  recentlyCookedIds: string[];
  userAllergenAlerts?: string[];
  customDietaryRestrictions?: string[];
  customBadges?: CustomBadge[];
  folders: FolderWithChildren[];
  folderMemberships: Record<string, string[]>; // folderId -> recipeIds[]
}

export function RecipesPageClient({
  recipes,
  recipeCookCounts,
  recentlyCookedIds,
  userAllergenAlerts = [],
  customDietaryRestrictions = [],
  customBadges = [],
  folders,
  folderMemberships,
}: RecipesPageClientProps) {
  const [discoverOpen, setDiscoverOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ActiveFolderFilter>({
    type: "all",
  });
  const [addToFolderRecipe, setAddToFolderRecipe] = useState<Recipe | null>(
    null
  );
  const [currentRecipeFolderIds, setCurrentRecipeFolderIds] = useState<
    string[]
  >([]);

  // Cast for discover dialog which doesn't need nutrition data
  const recipesForDiscover = recipes as RecipeWithFavorite[];

  // Calculate recently added count (last 30 days)
  const recentlyAddedCount = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return recipes.filter(
      (r) => new Date(r.created_at) >= thirtyDaysAgo
    ).length;
  }, [recipes]);

  // Get recipe IDs for active folder filter
  const folderRecipeIds = useMemo(() => {
    if (activeFilter.type === "all") {
      return null; // No filtering
    }

    if (activeFilter.type === "smart") {
      if (activeFilter.id === "recently_added") {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return recipes
          .filter((r) => new Date(r.created_at) >= thirtyDaysAgo)
          .map((r) => r.id);
      }
    }

    if (activeFilter.type === "folder") {
      return folderMemberships[activeFilter.id] || [];
    }

    return null;
  }, [activeFilter, recipes, folderMemberships]);

  // Handle opening the add to folder sheet
  const handleAddToFolder = useCallback(
    async (recipeId: string) => {
      const recipe = recipes.find((r) => r.id === recipeId);
      if (!recipe) return;

      // Get current folder IDs for this recipe
      const result = await getRecipeFolderIds(recipeId);
      setCurrentRecipeFolderIds(result.data || []);
      setAddToFolderRecipe(recipe);
    },
    [recipes]
  );

  return (
    <div className="flex gap-0 -mx-4 sm:-mx-6 lg:-mx-8">
      {/* Folder Sidebar */}
      <FolderSidebar
        folders={folders}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        recentlyAddedCount={recentlyAddedCount}
        totalRecipeCount={recipes.length}
      />

      {/* Main Content */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8">
        <RecipeGrid
          recipes={recipes}
          recipeCookCounts={recipeCookCounts}
          userAllergenAlerts={userAllergenAlerts}
          customDietaryRestrictions={customDietaryRestrictions}
          customBadges={customBadges}
          onDiscoverClick={() => setDiscoverOpen(true)}
          folderRecipeIds={folderRecipeIds}
          folders={folders}
          onAddToFolder={handleAddToFolder}
        />

        <DiscoverDialog
          open={discoverOpen}
          onOpenChange={setDiscoverOpen}
          recipes={recipesForDiscover}
          recipeCookCounts={recipeCookCounts}
          recentlyCookedIds={recentlyCookedIds}
        />

        <AddToFolderSheet
          recipe={addToFolderRecipe}
          isOpen={addToFolderRecipe !== null}
          onClose={() => setAddToFolderRecipe(null)}
          folders={folders}
          currentFolderIds={currentRecipeFolderIds}
        />
      </div>
    </div>
  );
}
