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
import type { FolderWithChildren, FolderCategoryWithFolders, ActiveFolderFilter } from "@/types/folder";
import type { SystemSmartFolder } from "@/types/smart-folder";
import type { EvaluationContext } from "@/lib/smart-folders";
import type { PinnedItem } from "@/types/user-preferences-v2";
import { getRecipeFolderIds } from "@/app/actions/folders";
import {
  filterRecipesBySmartFolder,
  countMatchingRecipes,
  SYSTEM_FOLDER_CRITERIA,
} from "@/lib/smart-folders";

interface RecipesPageClientProps {
  recipes: RecipeWithFavoriteAndNutrition[];
  recipeCookCounts: Record<string, number>;
  recentlyCookedIds: string[];
  userAllergenAlerts?: string[];
  customDietaryRestrictions?: string[];
  customBadges?: CustomBadge[];
  folders: FolderWithChildren[];
  categories: FolderCategoryWithFolders[];
  folderMemberships: Record<string, string[]>; // folderId -> recipeIds[]
  // Smart folder data
  systemSmartFolders: SystemSmartFolder[];
  userSmartFolders: FolderWithChildren[];
  cookingHistoryContext: EvaluationContext;
  // Pinned items
  pinnedItems: PinnedItem[];
}

export function RecipesPageClient({
  recipes,
  recipeCookCounts,
  recentlyCookedIds,
  userAllergenAlerts = [],
  customDietaryRestrictions = [],
  customBadges = [],
  folders,
  categories,
  folderMemberships,
  systemSmartFolders,
  userSmartFolders,
  cookingHistoryContext,
  pinnedItems,
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

  // Ensure cookingHistoryContext always has the expected structure
  // This prevents "Cannot convert undefined or null to object" errors
  const safeCookingHistoryContext = useMemo<EvaluationContext>(() => ({
    cookCounts: cookingHistoryContext?.cookCounts ?? {},
    lastCookedDates: cookingHistoryContext?.lastCookedDates ?? {},
  }), [cookingHistoryContext]);

  // Calculate smart folder counts for all system and user smart folders
  const smartFolderCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    // Count for system smart folders
    for (const folder of systemSmartFolders) {
      const criteria = SYSTEM_FOLDER_CRITERIA[folder.id] || folder.smart_filters;
      // Ensure criteria has valid conditions before counting
      if (criteria?.conditions && Array.isArray(criteria.conditions)) {
        counts[folder.id] = countMatchingRecipes(recipes, criteria, safeCookingHistoryContext);
      } else {
        counts[folder.id] = 0;
      }
    }

    // Count for user smart folders
    for (const folder of userSmartFolders) {
      if (folder.smart_filters?.conditions && Array.isArray(folder.smart_filters.conditions)) {
        counts[folder.id] = countMatchingRecipes(recipes, folder.smart_filters, safeCookingHistoryContext);
      } else {
        counts[folder.id] = 0;
      }
    }

    return counts;
  }, [recipes, systemSmartFolders, userSmartFolders, safeCookingHistoryContext]);

  // Get recipe IDs for active folder filter
  const folderRecipeIds = useMemo(() => {
    if (activeFilter.type === "all") {
      return null; // No filtering
    }

    if (activeFilter.type === "smart") {
      if (activeFilter.isSystem) {
        // System smart folder
        const systemFolder = systemSmartFolders.find(
          (f) => f.id === activeFilter.id
        );
        const criteria = SYSTEM_FOLDER_CRITERIA[activeFilter.id] || systemFolder?.smart_filters;
        if (criteria) {
          return filterRecipesBySmartFolder(recipes, criteria, safeCookingHistoryContext);
        }
      } else {
        // User smart folder
        const userFolder = userSmartFolders.find(
          (f) => f.id === activeFilter.id
        );
        if (userFolder?.smart_filters) {
          return filterRecipesBySmartFolder(recipes, userFolder.smart_filters, safeCookingHistoryContext);
        }
      }
      return [];
    }

    if (activeFilter.type === "folder") {
      return folderMemberships[activeFilter.id] || [];
    }

    return null;
  }, [activeFilter, recipes, folderMemberships, systemSmartFolders, userSmartFolders, safeCookingHistoryContext]);

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
        categories={categories}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        totalRecipeCount={recipes.length}
        systemSmartFolders={systemSmartFolders}
        userSmartFolders={userSmartFolders}
        smartFolderCounts={smartFolderCounts}
        pinnedItems={pinnedItems}
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
