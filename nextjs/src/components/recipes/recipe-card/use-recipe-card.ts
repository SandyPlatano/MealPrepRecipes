import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  toggleFavorite,
  deleteRecipe,
  getRecipe,
  createRecipe,
} from "@/app/actions/recipes";
import { getMostRecentCookingEntry } from "@/app/actions/cooking-history";
import { addMealAssignment } from "@/app/actions/meal-plans";
import { getWeekStart } from "@/types/meal-plan";
import { useUndoToast } from "@/hooks/use-undo-toast";
import { recipeKeys } from "@/hooks/queries/use-recipes-query";
import { triggerHaptic } from "@/lib/haptics";
import type { RecipeWithFavoriteAndNutrition, RecipeFormData } from "@/types/recipe";
import type { DayOfWeek } from "@/types/meal-plan";

interface UseRecipeCardProps {
  recipe: RecipeWithFavoriteAndNutrition;
}

export function useRecipeCard({ recipe }: UseRecipeCardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showUndoToast } = useUndoToast();

  const [isFavorite, setIsFavorite] = useState(recipe.is_favorite);
  const [currentRating, setCurrentRating] = useState<number | null>(recipe.rating);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showCookedDialog, setShowCookedDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showEditHistoryDialog, setShowEditHistoryDialog] = useState(false);
  const [cookingEntryToEdit, setCookingEntryToEdit] = useState<{
    id: string;
    cooked_at: string;
    rating: number | null;
    notes: string | null;
    modifications: string | null;
    photo_url?: string | null;
    cooked_by_profile?: { first_name: string | null; last_name: string | null } | null;
  } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isAddingToPlan, setIsAddingToPlan] = useState(false);
  const [showAddToPlanSheet, setShowAddToPlanSheet] = useState(false);

  // Prefetch recipe data and route on hover for instant navigation
  const handlePrefetch = useCallback(() => {
    // Prefetch the route
    router.prefetch(`/app/recipes/${recipe.id}`);

    // Prefetch the recipe data into React Query cache
    queryClient.prefetchQuery({
      queryKey: recipeKeys.detail(recipe.id),
      queryFn: async () => {
        const result = await getRecipe(recipe.id);
        if (result.error) throw new Error(result.error);
        return result.data;
      },
      staleTime: 60 * 1000, // Don't refetch if less than 1 min old
    });
  }, [router, queryClient, recipe.id]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowAddToPlanSheet(true);
  };

  const handleAddFromSheet = async (
    day: DayOfWeek,
    cook: string | null,
    servingSize: number | null
  ) => {
    setIsAddingToPlan(true);
    try {
      const weekStart = getWeekStart(new Date());
      const weekStartStr = weekStart.toISOString().split("T")[0];

      const result = await addMealAssignment(
        weekStartStr,
        recipe.id,
        day,
        cook ?? undefined,
        null, // mealType
        servingSize
      );

      if (result.error) {
        toast.error(result.error);
      } else {
        triggerHaptic("success");
        const servingsText = servingSize ? ` (${servingSize} servings)` : "";
        const message = cook
          ? `Added to ${day} for ${cook}${servingsText}`
          : `Added to ${day}${servingsText}`;
        toast.success(message);
      }
    } finally {
      setIsAddingToPlan(false);
      setShowAddToPlanSheet(false);
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    triggerHaptic("light");

    // Optimistic update for instant UI feedback
    const optimisticState = !isFavorite;
    setIsFavorite(optimisticState);

    startTransition(async () => {
      const result = await toggleFavorite(recipe.id);
      if (!result.error) {
        setIsFavorite(result.isFavorite);
        toast.success(
          result.isFavorite ? "Added to favorites ❤️" : "Removed from favorites"
        );
      } else {
        // Revert on error
        setIsFavorite(!optimisticState);
        toast.error("Failed to update favorite");
      }
    });
  };

  const handleExportPDF = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Open print dialog for PDF
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${recipe.title}</title>
            <style>
              body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
              h1 { margin-bottom: 10px; }
              .meta { color: #666; margin-bottom: 20px; }
              h2 { border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-top: 30px; }
              ul, ol { line-height: 1.8; }
              .notes { background: #f5f5f5; padding: 15px; border-radius: 8px; margin-top: 20px; }
              .tags { margin-top: 20px; }
              .tag { display: inline-block; background: #e0e0e0; padding: 4px 8px; border-radius: 4px; margin-right: 5px; font-size: 12px; }
            </style>
          </head>
          <body>
            <h1>${recipe.title}</h1>
            <p class="meta">
              ${recipe.recipe_type} • ${recipe.category || ""} •
              Prep: ${recipe.prep_time || "N/A"} • Cook: ${recipe.cook_time || "N/A"} •
              Serves: ${recipe.servings || "N/A"}
            </p>
            <h2>Ingredients</h2>
            <ul>
              ${recipe.ingredients.map((ing) => `<li>${ing}</li>`).join("")}
            </ul>
            <h2>Instructions</h2>
            <ol>
              ${recipe.instructions.map((inst) => `<li>${inst}</li>`).join("")}
            </ol>
            ${recipe.notes ? `<div class="notes"><strong>Notes:</strong> ${recipe.notes}</div>` : ""}
            ${recipe.tags.length > 0 ? `<div class="tags">${recipe.tags.map((t) => `<span class="tag">${t}</span>`).join("")}</div>` : ""}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
    toast.success("Opening PDF...");
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowShareDialog(true);
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    // Capture recipe data for potential undo before deletion
    const recipeData: RecipeFormData = {
      title: recipe.title,
      recipe_type: recipe.recipe_type,
      category: recipe.category ?? undefined,
      protein_type: recipe.protein_type ?? undefined,
      prep_time: recipe.prep_time ?? undefined,
      cook_time: recipe.cook_time ?? undefined,
      servings: recipe.servings ?? undefined,
      base_servings: recipe.base_servings ?? undefined,
      ingredients: recipe.ingredients ?? [],
      instructions: recipe.instructions ?? [],
      tags: recipe.tags ?? [],
      notes: recipe.notes ?? undefined,
      source_url: recipe.source_url ?? undefined,
      image_url: recipe.image_url ?? undefined,
      allergen_tags: recipe.allergen_tags ?? undefined,
      is_shared_with_household: recipe.is_shared_with_household,
      is_public: recipe.is_public,
    };

    startTransition(async () => {
      const result = await deleteRecipe(recipe.id);
      if (result.error) {
        console.error("Failed to delete:", result.error);
        toast.error("Failed to delete recipe");
        setIsDeleting(false);
      } else {
        // Show undo toast instead of simple success
        showUndoToast(`Deleted "${recipe.title}"`, async () => {
          const restoreResult = await createRecipe(recipeData);
          if (restoreResult.error) {
            throw new Error(restoreResult.error);
          }
          // Refresh the page to show the restored recipe
          router.refresh();
        });
      }
      setDeleteDialogOpen(false);
    });
  };

  // Handle rating click - check if cooking history exists
  const handleRatingClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if user has cooking history for this recipe
    const result = await getMostRecentCookingEntry(recipe.id);

    if (result.data) {
      // Has cooking history - open edit dialog
      setCookingEntryToEdit(result.data);
      setShowEditHistoryDialog(true);
    } else {
      // No cooking history - open mark as cooked dialog
      setShowCookedDialog(true);
    }
  };

  // Handle successful cooking history edit
  const handleCookingEntryUpdated = (
    updated: typeof cookingEntryToEdit
  ) => {
    if (updated?.rating !== undefined) {
      setCurrentRating(updated.rating);
    }
    setCookingEntryToEdit(null);
    router.refresh();
  };

  const handleCookingSuccess = (newRating: number | null) => {
    if (newRating !== null) {
      setCurrentRating(newRating);
    }
    router.refresh();
  };

  return {
    // State
    isFavorite,
    currentRating,
    isDeleting,
    deleteDialogOpen,
    showCookedDialog,
    showShareDialog,
    showEditHistoryDialog,
    cookingEntryToEdit,
    isPending,
    isAddingToPlan,
    showAddToPlanSheet,
    // State setters
    setDeleteDialogOpen,
    setShowCookedDialog,
    setShowShareDialog,
    setShowEditHistoryDialog,
    setCookingEntryToEdit,
    setShowAddToPlanSheet,
    // Handlers
    handlePrefetch,
    handleAddToCart,
    handleAddFromSheet,
    handleToggleFavorite,
    handleExportPDF,
    handleShare,
    handleDelete,
    handleRatingClick,
    handleCookingEntryUpdated,
    handleCookingSuccess,
  };
}
