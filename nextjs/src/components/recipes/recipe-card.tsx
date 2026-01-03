"use client";

import { useState, memo, useTransition, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Heart,
  Download,
  Trash2,
  UtensilsCrossed,
  Cookie,
  Croissant,
  Coffee,
  IceCream,
  Salad,
  MoreVertical,
  ChefHat,
  Edit,
  Share2,
  AlertTriangle,
  FolderPlus,
  Star,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toggleFavorite, deleteRecipe, getRecipe, createRecipe } from "@/app/actions/recipes";
import { useUndoToast } from "@/hooks/use-undo-toast";
import type { RecipeFormData } from "@/types/recipe";
import { useQueryClient } from "@tanstack/react-query";
import { recipeKeys } from "@/hooks/queries/use-recipes-query";
import { RatingBadge } from "@/components/ui/rating-badge";
import { getMostRecentCookingEntry } from "@/app/actions/cooking-history";

// Lazy load dialogs - only loaded when user opens them
const EditCookingHistoryDialog = dynamic(
  () => import("@/components/recipes/edit-cooking-history-dialog").then((mod) => mod.EditCookingHistoryDialog),
  { ssr: false }
);
import type { RecipeWithFavoriteAndNutrition, RecipeType } from "@/types/recipe";
import type { DayOfWeek } from "@/types/meal-plan";
import type { FolderWithChildren } from "@/types/folder";
import { addMealAssignment } from "@/app/actions/meal-plans";
import { getWeekStart } from "@/types/meal-plan";
import { AddToPlanSheet } from "./add-to-plan-sheet";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Lazy load modal dialogs - only loaded when user opens them
const MarkCookedDialog = dynamic(
  () => import("./mark-cooked-dialog").then((mod) => mod.MarkCookedDialog),
  { ssr: false }
);

// Lazy load share/export sheet - only loaded when user clicks share
const ShareExportSheet = dynamic(
  () => import("./share-export-sheet").then((mod) => mod.ShareExportSheet),
  { ssr: false }
);
import { detectAllergens, mergeAllergens, getAllergenDisplayName, hasUserAllergens, hasCustomRestrictions } from "@/lib/allergen-detector";
import { triggerHaptic } from "@/lib/haptics";
import { calculateCustomBadges, getBadgeColorClasses, type CustomBadge } from "@/lib/nutrition/badge-calculator";
import { buildRecipeMetadata } from "@/lib/recipe/metadata-utils";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/sidebar";
import { useDifficultyThresholds } from "@/contexts/difficulty-thresholds-context";
import { HighlightText } from "@/components/ui/highlight-text";

// Get icon based on recipe type (smaller for compact badge)
function getRecipeIcon(recipeType: RecipeType) {
  switch (recipeType) {
    case "Baking":
      return <Cookie className="size-3" />;
    case "Breakfast":
      return <Coffee className="size-3" />;
    case "Dessert":
      return <IceCream className="size-3" />;
    case "Snack":
      return <Croissant className="size-3" />;
    case "Side Dish":
      return <Salad className="size-3" />;
    case "Dinner":
    default:
      return <UtensilsCrossed className="size-3" />;
  }
}

// Get color classes for recipe type badge
function getRecipeTypeBadgeClasses(recipeType: RecipeType): string {
  switch (recipeType) {
    case "Dinner":
      // Coral - the main event
      return "bg-primary text-primary-foreground";
    case "Breakfast":
      // Warm amber
      return "bg-amber-500 text-white dark:bg-amber-600";
    case "Baking":
      // Warm brown
      return "bg-amber-700 text-white dark:bg-amber-800";
    case "Dessert":
      // Sweet pink
      return "bg-pink-500 text-white dark:bg-pink-600";
    case "Snack":
      // Sage green (brand accent)
      return "bg-accent text-accent-foreground";
    case "Side Dish":
      // Muted sage
      return "bg-emerald-600 text-white dark:bg-emerald-700";
    default:
      return "bg-muted text-muted-foreground";
  }
}


interface RecipeCardProps {
  recipe: RecipeWithFavoriteAndNutrition;
  lastMadeDate?: string | null;
  userAllergenAlerts?: string[];
  customDietaryRestrictions?: string[];
  customBadges?: CustomBadge[];
  /** Animation delay index for staggered animations (multiplied by 50ms) */
  animationIndex?: number;
  /** Available folders for "Add to Folder" feature */
  folders?: FolderWithChildren[];
  /** Callback when user clicks "Add to Folders" */
  onAddToFolder?: (recipeId: string) => void;
  /** Current search term for highlighting matches */
  searchTerm?: string;
}

export const RecipeCard = memo(function RecipeCard({ recipe, lastMadeDate, userAllergenAlerts = [], customDietaryRestrictions = [], customBadges = [], animationIndex, folders: _folders = [], onAddToFolder, searchTerm = "" }: RecipeCardProps) {
  const { isMobile } = useSidebar();
  const { thresholds: difficultyThresholds } = useDifficultyThresholds();
  const [isFavorite, setIsFavorite] = useState(recipe.is_favorite);
  const [currentRating, setCurrentRating] = useState<number | null>(recipe.rating);
  const [isDeleting, setIsDeleting] = useState(false);

  // Calculate which nutrition badges apply to this recipe
  const nutritionBadges = calculateCustomBadges(recipe.nutrition || null, customBadges);

  // Calculate recipe metadata for card display (total time, calories, protein, difficulty)
  const metadata = buildRecipeMetadata(recipe, difficultyThresholds);

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
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showUndoToast } = useUndoToast();

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

  // Detect allergens
  const detectedAllergens = detectAllergens(recipe.ingredients);
  const allergens = mergeAllergens(detectedAllergens, recipe.allergen_tags || []);
  
  // Check if recipe contains user's allergens
  const hasUserAllergensFlag = hasUserAllergens(allergens, userAllergenAlerts);
  const matchingAllergens = allergens.filter((allergen) => userAllergenAlerts.includes(allergen));
  
  // Check for custom dietary restrictions
  const matchingCustomRestrictions = hasCustomRestrictions(recipe.ingredients, customDietaryRestrictions);
  const hasAnyWarnings = hasUserAllergensFlag || matchingCustomRestrictions.length > 0;
  const allWarnings = [...matchingAllergens.map(getAllergenDisplayName), ...matchingCustomRestrictions];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Open the sheet to select day and cook
    setShowAddToPlanSheet(true);
  };

  const handleAddFromSheet = async (day: DayOfWeek, cook: string | null, servingSize: number | null) => {
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
  const handleCookingEntryUpdated = (updated: typeof cookingEntryToEdit) => {
    if (updated?.rating !== undefined) {
      setCurrentRating(updated.rating);
    }
    setCookingEntryToEdit(null);
    router.refresh();
  };

  return (
    <>
      <Link
        href={`/app/recipes/${recipe.id}`}
        onMouseEnter={handlePrefetch}
        onFocus={handlePrefetch}
      >
        <Card
          className="group h-full bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 ease-out flex flex-col cursor-pointer overflow-hidden animate-slide-up-fade relative dark:bg-slate-800 dark:border-gray-700"
          style={animationIndex !== undefined ? { animationDelay: `${animationIndex * 50}ms`, animationFillMode: 'backwards' } : undefined}
        >
          {/* Image Section - ALWAYS present for consistent card height */}
          <div className="relative w-full h-40 rounded-t-xl overflow-hidden bg-[#FEF7E8]">
            {recipe.image_url ? (
              <Image
                src={recipe.image_url}
                alt={recipe.title}
                fill
                className="object-cover transition-opacity duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAYH/8QAIhAAAgEDAwUBAAAAAAAAAAAAAQIDAAQRBQYhEhMiMVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAZEQADAQEBAAAAAAAAAAAAAAAAAQIDEUH/2gAMAwEAAhEDEQA/ALTce5Nw6XfRWOnWtjJAkccjGaN2LFhnHDDjgce/dSX9x73/AGb/AHfz/Sla1FNRlpHD9J//2Q=="
              />
            ) : (
              /* Placeholder for cards without images - warm brand gradient */
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#FEF7E8] to-[#F5EFE0]">
                <UtensilsCrossed className="size-12 text-[#C4B8A5]" />
              </div>
            )}

            {/* NEW Badge - for recently added recipes (last 7 days) */}
            {(() => {
              const isNew = recipe.created_at &&
                (Date.now() - new Date(recipe.created_at).getTime()) < 7 * 24 * 60 * 60 * 1000;
              return isNew ? (
                <div className="absolute top-2 left-2 z-10">
                  <Badge
                    variant="default"
                    className="bg-[#D9F99D] hover:bg-[#D9F99D] text-[#1A1A1A] text-[10px] px-1.5 py-0.5 font-semibold shadow-sm"
                  >
                    NEW
                  </Badge>
                </div>
              ) : null;
            })()}

            {/* Quick Action Hover Bar - Desktop Only */}
            {!isMobile && (
              <div
                className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 p-3 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                onClick={(e) => e.preventDefault()}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8 px-3 bg-white/90 hover:bg-white text-black shadow-lg"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    router.push(`/app/recipes/${recipe.id}/cook`);
                  }}
                  aria-label={`Cook ${recipe.title}`}
                >
                  <ChefHat className="size-4 mr-1.5" />
                  Cook
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8 px-3 bg-white/90 hover:bg-white text-black shadow-lg"
                  onClick={handleAddToCart}
                  disabled={isAddingToPlan}
                  aria-label={`Add ${recipe.title} to meal plan`}
                >
                  <UtensilsCrossed className="size-4 mr-1.5" />
                  Plan
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8 px-3 bg-white/90 hover:bg-white text-black shadow-lg"
                  onClick={handleShare}
                  aria-label={`Share ${recipe.title}`}
                >
                  <Share2 className="size-4 mr-1.5" />
                  Share
                </Button>
              </div>
            )}

            {/* More Menu - Top Right */}
            <div
              className="absolute top-2 right-2 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-full bg-black/50 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/70 shadow-lg ring-1 ring-white/20"
                    aria-label="More actions"
                  >
                    <MoreVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    router.push(`/app/recipes/${recipe.id}/cook`);
                  }}>
                    <UtensilsCrossed className="size-4 mr-2" />
                    Start Cooking
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShare}>
                    <Share2 className="size-4 mr-2" />
                    Share Recipe
                  </DropdownMenuItem>
                  {onAddToFolder && (
                    <DropdownMenuItem onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onAddToFolder(recipe.id);
                    }}>
                      <FolderPlus className="size-4 mr-2" />
                      Add to Folders
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowCookedDialog(true);
                  }}>
                    <ChefHat className="size-4 mr-2" />
                    Mark as Cooked
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    router.push(`/app/recipes/${recipe.id}/edit`);
                  }}>
                    <Edit className="size-4 mr-2" />
                    Edit Recipe
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportPDF}>
                    <Download className="size-4 mr-2" />
                    Export as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDeleteDialogOpen(true);
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="size-4 mr-2" />
                    Delete Recipe
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Optional Badges Section - fixed height area for consistent card heights */}
          <div className="min-h-[32px] flex flex-col justify-center shrink-0">
            {/* Allergen & Dietary Restriction Warning Banner */}
            {hasAnyWarnings && (
              <div className="bg-amber-50 dark:bg-amber-950 border-l-4 border-amber-500 px-4 py-2 flex items-start gap-2">
                <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-amber-800 dark:text-amber-200">
                    Contains: {allWarnings.join(", ")}
                  </p>
                </div>
              </div>
            )}

            {/* Nutrition Badges */}
            {nutritionBadges.length > 0 && (
              <div className="px-4 py-1.5 flex flex-wrap gap-1 border-b">
                {nutritionBadges.map((badge) => {
                  const colors = getBadgeColorClasses(badge.color);
                  return (
                    <span
                      key={badge.key}
                      className={cn(
                        "inline-flex items-center rounded-full border px-1.5 py-0 text-[10px] font-medium",
                        colors.bg,
                        colors.text,
                        colors.border
                      )}
                      title={badge.description}
                    >
                      {badge.label}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Title Section - with rating - fixed height for consistency */}
          <div className="px-4 py-3 border-b border-gray-300 dark:border-gray-600 shrink-0 min-h-[60px] flex items-center">
            <div className="flex items-start justify-between gap-2 w-full">
              <CardTitle className="text-base leading-snug line-clamp-2 flex-1 text-[#1A1A1A] dark:text-white">
                <HighlightText text={recipe.title} searchTerm={searchTerm} />
              </CardTitle>
              {/* Rating - clickable to open cooking history */}
              <div onClick={(e) => e.stopPropagation()}>
                {currentRating ? (
                  <RatingBadge
                    rating={currentRating}
                    size="sm"
                    onClick={handleRatingClick}
                  />
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-muted-foreground hover:text-yellow-500"
                    onClick={handleRatingClick}
                    aria-label="Rate this recipe"
                  >
                    <Star className="size-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Badge + Metadata Row - shrink-0 for consistent height */}
          <div className="px-4 py-2 border-b border-gray-300 dark:border-gray-600 flex items-center gap-2 flex-wrap shrink-0">
            {/* Recipe Type Badge - Smaller */}
            <div
              className={cn(
                "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium",
                "transition-all duration-300 ease-out",
                "group-hover:scale-105",
                getRecipeTypeBadgeClasses(recipe.recipe_type)
              )}
            >
              {getRecipeIcon(recipe.recipe_type)}
              <span>{recipe.recipe_type}</span>
            </div>

            {/* Enhanced Metadata: Time • Calories • Protein • Difficulty */}
            <span className="text-xs text-muted-foreground flex items-center gap-1 flex-wrap">
              <span>{metadata.totalTime}</span>
              <span className="text-muted-foreground/50">•</span>
              <span>{metadata.calories}</span>
              <span className="text-muted-foreground/50">•</span>
              <span>{metadata.protein}</span>
              <span className="text-muted-foreground/50">•</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className={cn(
                      "cursor-help underline decoration-dotted underline-offset-2",
                      metadata.difficulty === "Easy" &&
                        "text-green-600 dark:text-green-400",
                      metadata.difficulty === "Medium" &&
                        "text-amber-600 dark:text-amber-400",
                      metadata.difficulty === "Hard" &&
                        "text-red-600 dark:text-red-400"
                    )}
                  >
                    {metadata.difficulty}
                  </span>
                </TooltipTrigger>
                <TooltipContent className="text-xs">
                  <div className="flex flex-col gap-1">
                    <p className="font-medium">Difficulty Breakdown</p>
                    <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5">
                      <span className="text-muted-foreground">Time:</span>
                      <span>
                        {metadata.difficultyBreakdown.time.minutes !== null
                          ? `${metadata.difficultyBreakdown.time.minutes} min`
                          : "N/A"}{" "}
                        ({metadata.difficultyBreakdown.time.score})
                      </span>
                      <span className="text-muted-foreground">Ingredients:</span>
                      <span>
                        {metadata.difficultyBreakdown.ingredients.count} items (
                        {metadata.difficultyBreakdown.ingredients.score})
                      </span>
                      <span className="text-muted-foreground">Steps:</span>
                      <span>
                        {metadata.difficultyBreakdown.steps.count} steps (
                        {metadata.difficultyBreakdown.steps.score})
                      </span>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
              {lastMadeDate && (
                <>
                  <span className="text-muted-foreground/50">•</span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    Made{" "}
                    {formatDistanceToNow(new Date(lastMadeDate), {
                      addSuffix: true,
                    })}
                  </Badge>
                </>
              )}
            </span>
          </div>
          <CardContent className="flex flex-col flex-1 pt-0">
            {/* Key Ingredients Section - hidden on mobile for cleaner cards */}
            {!isMobile && (
              <div className="py-3">
                <p className="text-sm font-medium mb-1">Key Ingredients</p>
                <p className="text-sm text-muted-foreground">
                  {recipe.ingredients.slice(0, 5).map((ingredient, idx) => (
                    <span key={idx}>
                      {idx > 0 && ", "}
                      <HighlightText text={ingredient} searchTerm={searchTerm} />
                    </span>
                  ))}
                  {recipe.ingredients.length > 5 && "..."}
                </p>
              </div>
            )}

            {/* Footer: Add to Plan + Favorite */}
            <div className={cn("pt-3 mt-auto flex items-center gap-2", !isMobile && "border-t border-gray-300 dark:border-gray-600")}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="default"
                    className={cn(
                      "flex-1 hover:scale-105 transition-transform bg-[#D9F99D] hover:bg-[#D9F99D]/90 text-[#1A1A1A]",
                      isMobile && "h-12 text-base" // Larger touch target on mobile
                    )}
                    onClick={handleAddToCart}
                    disabled={isAddingToPlan}
                  >
                    {isAddingToPlan ? "Adding..." : "Add to Plan"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add this recipe to your weekly meal plan</TooltipContent>
              </Tooltip>

              {/* Favorite Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "shrink-0 transition-all duration-200",
                      isMobile && "size-12", // Match Add to Plan height on mobile
                      isFavorite
                        ? "text-red-500 hover:text-red-600"
                        : "text-muted-foreground hover:text-red-500"
                    )}
                    onClick={handleToggleFavorite}
                    disabled={isPending}
                    aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Heart
                      className={cn(
                        "size-5 transition-all duration-300",
                        isFavorite && "fill-current scale-110 animate-[heartBeat_0.3s_ease-in-out]"
                      )}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isFavorite ? "Remove from favorites" : "Add to favorites"}
                </TooltipContent>
              </Tooltip>
            </div>
          </CardContent>
        </Card>
      </Link>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete This Recipe?</AlertDialogTitle>
            <AlertDialogDescription>
              You&apos;re about to delete &quot;{recipe.title}&quot; forever.
              Gone from your collection, favorites, and any meal plans. No
              take-backs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep It</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <MarkCookedDialog
        recipeId={recipe.id}
        recipeTitle={recipe.title}
        open={showCookedDialog}
        onOpenChange={setShowCookedDialog}
        onSuccess={() => router.refresh()}
      />

      {cookingEntryToEdit && (
        <EditCookingHistoryDialog
          entry={cookingEntryToEdit}
          open={showEditHistoryDialog}
          onOpenChange={(open) => {
            setShowEditHistoryDialog(open);
            if (!open) setCookingEntryToEdit(null);
          }}
          onSuccess={handleCookingEntryUpdated}
        />
      )}

      <ShareExportSheet
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        recipe={recipe}
        isPublic={recipe.is_public ?? false}
        shareToken={recipe.share_token ?? null}
        viewCount={recipe.view_count ?? 0}
      />

      <AddToPlanSheet
        recipe={recipe}
        isOpen={showAddToPlanSheet}
        onClose={() => setShowAddToPlanSheet(false)}
        onAdd={handleAddFromSheet}
      />
    </>
  );
});
