"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { toggleFavorite, deleteRecipe } from "@/app/actions/recipes";
import { getMostRecentCookingEntry } from "@/app/actions/cooking-history";
import { updateRecipeLayoutPreferencesAuto } from "@/app/actions/user-preferences";
import type { RecipeLayoutPreferences } from "@/types/recipe-layout";
import type { CookingHistoryEntry } from "./use-recipe-history";

export interface UseRecipeActionsOptions {
  recipeId: string;
  initialIsFavorite: boolean;
  initialRating: number | null;
  initialLayoutPrefs: RecipeLayoutPreferences;
  setEditingHistoryEntry: (entry: CookingHistoryEntry | null) => void;
}

export interface UseRecipeActionsReturn {
  isFavorite: boolean;
  currentRating: number | null;
  localLayoutPrefs: RecipeLayoutPreferences;
  showCookedDialog: boolean;
  showExportDialog: boolean;
  showShareDialog: boolean;
  showLayoutCustomizer: boolean;
  isDeleting: boolean;
  deleteDialogOpen: boolean;
  setShowCookedDialog: (show: boolean) => void;
  setShowExportDialog: (show: boolean) => void;
  setShowShareDialog: (show: boolean) => void;
  setShowLayoutCustomizer: (show: boolean) => void;
  setDeleteDialogOpen: (open: boolean) => void;
  handleToggleFavorite: () => Promise<void>;
  handleLayoutUpdate: (newPrefs: RecipeLayoutPreferences) => Promise<void>;
  handleRatingClick: () => Promise<void>;
  handleDelete: () => Promise<void>;
}

/**
 * Hook for recipe action handlers (favorite, delete, dialogs, layout).
 */
export function useRecipeActions({
  recipeId,
  initialIsFavorite,
  initialRating,
  initialLayoutPrefs,
  setEditingHistoryEntry,
}: UseRecipeActionsOptions): UseRecipeActionsReturn {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [currentRating, setCurrentRating] = useState<number | null>(initialRating);
  const [localLayoutPrefs, setLocalLayoutPrefs] = useState(initialLayoutPrefs);
  const [showCookedDialog, setShowCookedDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showLayoutCustomizer, setShowLayoutCustomizer] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleToggleFavorite = async () => {
    const result = await toggleFavorite(recipeId);
    if (!result.error) {
      setIsFavorite(result.isFavorite);
      toast.success(
        result.isFavorite ? "Added to favorites ❤️" : "Removed from favorites"
      );
    }
  };

  const handleLayoutUpdate = async (newPrefs: RecipeLayoutPreferences) => {
    setLocalLayoutPrefs(newPrefs);
    const result = await updateRecipeLayoutPreferencesAuto(newPrefs);
    if (result.error) {
      toast.error("Failed to save layout");
      setLocalLayoutPrefs(initialLayoutPrefs);
    }
  };

  const handleRatingClick = async () => {
    const result = await getMostRecentCookingEntry(recipeId);
    if (result.data) {
      setEditingHistoryEntry(result.data);
    } else {
      setShowCookedDialog(true);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteRecipe(recipeId);
    if (result.error) {
      console.error("Failed to delete:", result.error);
      setIsDeleting(false);
    } else {
      toast.success("Recipe deleted");
      router.push("/app/recipes");
    }
    setDeleteDialogOpen(false);
  };

  return {
    isFavorite,
    currentRating,
    localLayoutPrefs,
    showCookedDialog,
    showExportDialog,
    showShareDialog,
    showLayoutCustomizer,
    isDeleting,
    deleteDialogOpen,
    setShowCookedDialog,
    setShowExportDialog,
    setShowShareDialog,
    setShowLayoutCustomizer,
    setDeleteDialogOpen,
    handleToggleFavorite,
    handleLayoutUpdate,
    handleRatingClick,
    handleDelete,
  };
}
