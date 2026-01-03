"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { toggleFavorite, deleteRecipe } from "@/app/actions/recipes";
import { deleteCookingHistoryEntry, getMostRecentCookingEntry } from "@/app/actions/cooking-history";
import { updateRecipeLayoutPreferencesAuto } from "@/app/actions/user-preferences";
import { scaleIngredients, convertIngredientsToSystem, type UnitSystem } from "@/lib/ingredient-scaler";
import type { Recipe } from "@/types/recipe";
import type { RecipeNutrition } from "@/types/nutrition";
import type { RecipeLayoutPreferences } from "@/types/recipe-layout";
import { useQuickCartContext } from "@/components/quick-cart";

export interface CookingHistoryEntry {
  id: string;
  cooked_at: string;
  rating: number | null;
  notes: string | null;
  modifications: string | null;
  photo_url: string | null;
  cooked_by_profile?: { first_name: string | null; last_name: string | null } | null;
}

interface UseRecipeDetailStateProps {
  recipe: Recipe;
  initialIsFavorite: boolean;
  history: CookingHistoryEntry[];
  nutrition: RecipeNutrition | null;
  layoutPrefs: RecipeLayoutPreferences;
  userUnitSystem: UnitSystem;
}

const MAX_SERVINGS = 99;

export function useRecipeDetailState({
  recipe,
  initialIsFavorite,
  history,
  nutrition,
  layoutPrefs,
  userUnitSystem,
}: UseRecipeDetailStateProps) {
  const router = useRouter();
  const quickCart = useQuickCartContext();

  // ============================================================================
  // Dialog States
  // ============================================================================
  const [showCookedDialog, setShowCookedDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showLayoutCustomizer, setShowLayoutCustomizer] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showAddIngredientsDialog, setShowAddIngredientsDialog] = useState(false);

  // ============================================================================
  // Recipe Mutation States
  // ============================================================================
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [currentRating, setCurrentRating] = useState<number | null>(recipe.rating);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExtractingNutrition, setIsExtractingNutrition] = useState(false);
  const [isAddingIngredients, setIsAddingIngredients] = useState(false);

  // ============================================================================
  // Local Data States
  // ============================================================================
  const [localNutrition, setLocalNutrition] = useState<RecipeNutrition | null>(nutrition);
  const [localHistory, setLocalHistory] = useState(history);
  const [localLayoutPrefs, setLocalLayoutPrefs] = useState(layoutPrefs);

  // ============================================================================
  // History Editing States
  // ============================================================================
  const [editingHistoryEntry, setEditingHistoryEntry] = useState<CookingHistoryEntry | null>(null);
  const [deleteHistoryEntryId, setDeleteHistoryEntryId] = useState<string | null>(null);
  const [isDeletingHistoryEntry, setIsDeletingHistoryEntry] = useState(false);

  // ============================================================================
  // UI Interaction States
  // ============================================================================
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // ============================================================================
  // Serving Size States
  // ============================================================================
  const [currentServings, setCurrentServings] = useState(recipe.base_servings || 1);
  const [servingsInputValue, setServingsInputValue] = useState(String(recipe.base_servings || 1));

  // ============================================================================
  // Unit System State
  // ============================================================================
  const [localUnitSystem, setLocalUnitSystem] = useState<UnitSystem | null>(null);
  const effectiveUnitSystem = localUnitSystem ?? userUnitSystem;

  // ============================================================================
  // Derived Values
  // ============================================================================
  const canScale = recipe.base_servings !== null && recipe.base_servings > 0;
  const scaledIngredients = canScale
    ? scaleIngredients(recipe.ingredients, recipe.base_servings!, currentServings)
    : recipe.ingredients;
  const displayIngredients = convertIngredientsToSystem(scaledIngredients, effectiveUnitSystem);

  const today = new Date().toDateString();
  const cookedToday = localHistory.some(
    (entry) => new Date(entry.cooked_at).toDateString() === today
  );
  const lastCooked = localHistory.length > 0 ? localHistory[0].cooked_at : null;

  // ============================================================================
  // Ingredient Actions
  // ============================================================================
  const toggleIngredientCheck = useCallback((index: number) => {
    setCheckedIngredients(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  // ============================================================================
  // Step Completion Actions
  // ============================================================================
  const toggleStepCompletion = useCallback((index: number) => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  // ============================================================================
  // Favorite Actions
  // ============================================================================
  const handleToggleFavorite = useCallback(async () => {
    const result = await toggleFavorite(recipe.id);
    if (!result.error) {
      setIsFavorite(result.isFavorite);
      toast.success(
        result.isFavorite ? "Added to favorites ❤️" : "Removed from favorites"
      );
    }
  }, [recipe.id]);

  // ============================================================================
  // Rating Actions
  // ============================================================================
  const handleRatingClick = useCallback(async () => {
    const result = await getMostRecentCookingEntry(recipe.id);
    if (result.data) {
      setEditingHistoryEntry(result.data);
    } else {
      setShowCookedDialog(true);
    }
  }, [recipe.id]);

  // ============================================================================
  // Delete Actions
  // ============================================================================
  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    const result = await deleteRecipe(recipe.id);
    if (result.error) {
      console.error("Failed to delete:", result.error);
      setIsDeleting(false);
    } else {
      toast.success("Recipe deleted");
      router.push("/app/recipes");
    }
    setDeleteDialogOpen(false);
  }, [recipe.id, router]);

  // ============================================================================
  // Cooking History Actions
  // ============================================================================
  const handleCookedSuccess = useCallback(() => {
    const newEntry: CookingHistoryEntry = {
      id: `temp-${Date.now()}`,
      cooked_at: new Date().toISOString(),
      rating: null,
      notes: null,
      modifications: null,
      photo_url: null,
      cooked_by_profile: null,
    };
    setLocalHistory(prev => [newEntry, ...prev]);
    router.refresh();
  }, [router]);

  const handleEditHistorySuccess = useCallback((updatedEntry: {
    id: string;
    cooked_at: string;
    rating: number | null;
    notes: string | null;
    modifications: string | null;
  }) => {
    setLocalHistory(prev =>
      prev.map(entry =>
        entry.id === updatedEntry.id ? { ...entry, ...updatedEntry } : entry
      )
    );
    router.refresh();
  }, [router]);

  const handleDeleteHistoryEntry = useCallback(async () => {
    if (!deleteHistoryEntryId) return;

    setIsDeletingHistoryEntry(true);
    const result = await deleteCookingHistoryEntry(deleteHistoryEntryId);
    setIsDeletingHistoryEntry(false);

    if (result.error) {
      toast.error("Failed to delete", { description: result.error });
      return;
    }

    setLocalHistory(prev => prev.filter(entry => entry.id !== deleteHistoryEntryId));
    setDeleteHistoryEntryId(null);
    toast.success("Entry deleted");
    router.refresh();
  }, [deleteHistoryEntryId, router]);

  // ============================================================================
  // Layout Actions
  // ============================================================================
  const handleLayoutUpdate = useCallback(async (newPrefs: RecipeLayoutPreferences) => {
    setLocalLayoutPrefs(newPrefs);
    const result = await updateRecipeLayoutPreferencesAuto(newPrefs);
    if (result.error) {
      toast.error("Failed to save layout");
      setLocalLayoutPrefs(layoutPrefs);
    }
  }, [layoutPrefs]);

  // ============================================================================
  // Nutrition Actions
  // ============================================================================
  const handleExtractNutrition = useCallback(async () => {
    setIsExtractingNutrition(true);
    try {
      const response = await fetch("/api/ai/extract-nutrition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          recipe_id: recipe.id,
          title: recipe.title,
          ingredients: recipe.ingredients,
          servings: recipe.base_servings || 4,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Failed to extract nutrition");
        return;
      }

      setLocalNutrition(result.nutrition);
      toast.success("Nutrition extracted successfully!");
      router.refresh();
    } catch (error) {
      console.error("Error extracting nutrition:", error);
      toast.error("Failed to extract nutrition");
    } finally {
      setIsExtractingNutrition(false);
    }
  }, [recipe.id, recipe.title, recipe.ingredients, recipe.base_servings, router]);

  // ============================================================================
  // Serving Size Actions
  // ============================================================================
  const setServingsPreset = useCallback((multiplier: number) => {
    if (recipe.base_servings) {
      const newServings = Math.min(MAX_SERVINGS, Math.round(recipe.base_servings * multiplier));
      setCurrentServings(newServings);
      setServingsInputValue(String(newServings));
    }
  }, [recipe.base_servings]);

  const handleServingsInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === "") {
      setServingsInputValue("");
      return;
    }

    if (!/^\d+$/.test(value)) {
      return;
    }

    const numValue = parseInt(value, 10);

    if (numValue > MAX_SERVINGS) {
      setServingsInputValue(String(MAX_SERVINGS));
      setCurrentServings(MAX_SERVINGS);
      return;
    }

    if (numValue === 0) {
      setServingsInputValue("0");
      return;
    }

    setServingsInputValue(value);
    setCurrentServings(numValue);
  }, []);

  const handleServingsInputBlur = useCallback(() => {
    const numValue = parseInt(servingsInputValue, 10);

    if (servingsInputValue === "" || isNaN(numValue) || numValue < 1) {
      const fallback = recipe.base_servings || 1;
      setServingsInputValue(String(fallback));
      setCurrentServings(fallback);
      return;
    }

    const clampedValue = Math.min(MAX_SERVINGS, Math.max(1, numValue));
    setServingsInputValue(String(clampedValue));
    setCurrentServings(clampedValue);
  }, [servingsInputValue, recipe.base_servings]);

  // ============================================================================
  // Quick Cart Actions
  // ============================================================================
  const handleAddAllIngredients = useCallback(async () => {
    setIsAddingIngredients(true);
    try {
      const result = await quickCart.addItemsFromRecipe(
        recipe.ingredients,
        recipe.id,
        recipe.title
      );

      setShowAddIngredientsDialog(false);

      if (result.error) {
        toast.error(result.error);
      } else if (result.added > 0) {
        toast.success(`Added ${result.added} items to cart`, {
          description: result.skipped > 0 ? `${result.skipped} already in list` : undefined,
        });
      } else {
        toast.info("All ingredients already in cart");
      }
    } catch {
      toast.error("Failed to add ingredients");
    } finally {
      setIsAddingIngredients(false);
    }
  }, [quickCart, recipe.ingredients, recipe.id, recipe.title]);

  return {
    // State values
    state: {
      isFavorite,
      currentRating,
      isDeleting,
      isExtractingNutrition,
      isAddingIngredients,
      localNutrition,
      localHistory,
      localLayoutPrefs,
      editingHistoryEntry,
      deleteHistoryEntryId,
      isDeletingHistoryEntry,
      checkedIngredients,
      completedSteps,
      currentServings,
      servingsInputValue,
      effectiveUnitSystem,
      canScale,
      scaledIngredients,
      displayIngredients,
      cookedToday,
      lastCooked,
    },

    // Dialog controls
    dialogs: {
      showCookedDialog,
      setShowCookedDialog,
      showExportDialog,
      setShowExportDialog,
      showShareDialog,
      setShowShareDialog,
      showLayoutCustomizer,
      setShowLayoutCustomizer,
      deleteDialogOpen,
      setDeleteDialogOpen,
      showAddIngredientsDialog,
      setShowAddIngredientsDialog,
    },

    // Actions
    actions: {
      toggleIngredientCheck,
      toggleStepCompletion,
      handleToggleFavorite,
      handleRatingClick,
      handleDelete,
      handleCookedSuccess,
      handleEditHistorySuccess,
      handleDeleteHistoryEntry,
      handleLayoutUpdate,
      handleExtractNutrition,
      setServingsPreset,
      handleServingsInputChange,
      handleServingsInputBlur,
      handleAddAllIngredients,
      setLocalUnitSystem,
      setEditingHistoryEntry,
      setDeleteHistoryEntryId,
      setCurrentRating,
    },

    // Router for navigation
    router,
  };
}
