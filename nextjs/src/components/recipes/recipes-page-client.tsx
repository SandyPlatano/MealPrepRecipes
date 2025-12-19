"use client";

import { useState, useMemo, useCallback } from "react";
import { RecipeGrid } from "./recipe-grid";
import { DiscoverDialog } from "./discover-dialog";
import { AddToFolderSheet } from "@/components/folders/add-to-folder-sheet";
import type {
  RecipeWithFavoriteAndNutrition,
  RecipeWithFavorite,
  Recipe,
} from "@/types/recipe";
import type { CustomBadge } from "@/lib/nutrition/badge-calculator";
import type { FolderWithChildren, ActiveFolderFilter } from "@/types/folder";
import type { SystemSmartFolder } from "@/types/smart-folder";
import type { EvaluationContext } from "@/lib/smart-folders";
import { getRecipeFolderIds } from "@/app/actions/folders";
import {
  filterRecipesBySmartFolder,
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
  folderMemberships: Record<string, string[]>; // folderId -> recipeIds[]
  // Smart folder data
  systemSmartFolders: SystemSmartFolder[];
  userSmartFolders: FolderWithChildren[];
  cookingHistoryContext: EvaluationContext;
  // URL search params for folder filtering
  searchParams?: {
    filter?: string;
    id?: string;
    system?: string;
  };
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
  systemSmartFolders,
  userSmartFolders,
  cookingHistoryContext,
  searchParams,
}: RecipesPageClientProps) {
  const [discoverOpen, setDiscoverOpen] = useState(false);

  // Derive active filter from URL search params
  const activeFilter = useMemo<ActiveFolderFilter>(() => {
    const filterType = searchParams?.filter;
    const filterId = searchParams?.id;
    const isSystem = searchParams?.system === "true";

    if (filterType === "folder" && filterId) {
      // Validate folder exists
      if (!folderMemberships[filterId]) return { type: "all" };
      return { type: "folder", id: filterId };
    }

    if (filterType === "smart" && filterId) {
      // Validate smart folder exists before applying filter
      if (isSystem) {
        const systemFolderExists = systemSmartFolders.some((f) => f.id === filterId);
        if (!systemFolderExists) return { type: "all" };
      } else {
        const userFolderExists = userSmartFolders.some((f) => f.id === filterId);
        if (!userFolderExists) return { type: "all" };
      }
      return { type: "smart", id: filterId, isSystem };
    }

    return { type: "all" };
  }, [searchParams, folderMemberships, systemSmartFolders, userSmartFolders]);
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
      // Smart folder not found or has no filters - show all recipes as fallback
      return null;
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
    <>
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
    </>
  );
}
