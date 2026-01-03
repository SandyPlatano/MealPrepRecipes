"use client";

import { memo } from "react";
import Link from "next/link";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { HoverCard, HoverCardTrigger } from "@/components/ui/hover-card";
import { HighlightText } from "@/components/ui/highlight-text";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDifficultyThresholds } from "@/contexts/difficulty-thresholds-context";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  detectAllergens,
  mergeAllergens,
  getAllergenDisplayName,
  hasUserAllergens,
  hasCustomRestrictions,
} from "@/lib/allergen-detector";
import { calculateCustomBadges, type CustomBadge } from "@/lib/nutrition/badge-calculator";
import { buildRecipeMetadata } from "@/lib/recipe/metadata-utils";
import type { RecipeWithFavoriteAndNutrition } from "@/types/recipe";
import type { FolderWithChildren } from "@/types/folder";
import { RecipeCardImage } from "./recipe-card-image";
import { RecipeCardBadges } from "./recipe-card-badges";
import { RecipeCardMenu } from "./recipe-card-menu";
import { RecipeCardMetadata } from "./recipe-card-metadata";
import { RecipeCardActions } from "./recipe-card-actions";
import { RecipeCardHover } from "./recipe-card-hover";
import { RecipeCardDialogs } from "./recipe-card-dialogs";
import { useRecipeCard } from "./use-recipe-card";

interface RecipeCardContentProps {
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

export const RecipeCardContent = memo(function RecipeCardContent({
  recipe,
  lastMadeDate: _lastMadeDate,
  userAllergenAlerts = [],
  customDietaryRestrictions = [],
  customBadges = [],
  animationIndex,
  folders: _folders = [],
  onAddToFolder,
  searchTerm = "",
}: RecipeCardContentProps) {
  const isMobile = useIsMobile();
  const { thresholds: difficultyThresholds } = useDifficultyThresholds();
  const router = useRouter();

  // Calculate which nutrition badges apply to this recipe
  const _nutritionBadges = calculateCustomBadges(recipe.nutrition || null, customBadges);

  // Calculate recipe metadata for card display (total time, calories, protein, difficulty)
  const metadata = buildRecipeMetadata(recipe, difficultyThresholds);

  // Detect allergens
  const detectedAllergens = detectAllergens(recipe.ingredients);
  const allergens = mergeAllergens(detectedAllergens, recipe.allergen_tags || []);

  // Check if recipe contains user's allergens
  const hasUserAllergensFlag = hasUserAllergens(allergens, userAllergenAlerts);
  const matchingAllergens = allergens.filter((allergen) =>
    userAllergenAlerts.includes(allergen)
  );

  // Check for custom dietary restrictions
  const matchingCustomRestrictions = hasCustomRestrictions(
    recipe.ingredients,
    customDietaryRestrictions
  );
  const hasAnyWarnings = hasUserAllergensFlag || matchingCustomRestrictions.length > 0;
  const allWarnings = [
    ...matchingAllergens.map(getAllergenDisplayName),
    ...matchingCustomRestrictions,
  ];

  // Use the custom hook for state and handlers
  const {
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
    setDeleteDialogOpen,
    setShowCookedDialog,
    setShowShareDialog,
    setShowEditHistoryDialog,
    setCookingEntryToEdit,
    setShowAddToPlanSheet,
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
  } = useRecipeCard({ recipe });

  return (
    <>
      <HoverCard openDelay={200} closeDelay={100}>
        <HoverCardTrigger asChild>
          <Link
            href={`/app/recipes/${recipe.id}`}
            onMouseEnter={handlePrefetch}
            onFocus={handlePrefetch}
          >
            <Card
              className="group h-full bg-white rounded-2xl border border-gray-100 border-l-4 border-l-gray-200 shadow-lg hover:shadow-2xl hover:-translate-y-2 hover:border-l-gray-300 transition-all duration-300 ease-out flex flex-col cursor-pointer overflow-hidden animate-slide-up-fade relative"
              style={
                animationIndex !== undefined
                  ? {
                      animationDelay: `${animationIndex * 50}ms`,
                      animationFillMode: "backwards",
                    }
                  : undefined
              }
            >
              {/* Image Section */}
              <RecipeCardImage
                recipe={recipe}
                totalTime={metadata.totalTime}
                currentRating={currentRating}
                onRatingClick={handleRatingClick}
              />

              {/* Allergen Warning Icon - overlays image */}
              <RecipeCardBadges hasAnyWarnings={hasAnyWarnings} allWarnings={allWarnings} />

              {/* More Menu - Top Right */}
              <RecipeCardMenu
                recipeId={recipe.id}
                onStartCooking={() => {
                  router.push(`/app/recipes/${recipe.id}/cook`);
                }}
                onShare={handleShare}
                onAddToFolder={
                  onAddToFolder
                    ? () => {
                        onAddToFolder(recipe.id);
                      }
                    : undefined
                }
                onMarkCooked={() => {
                  setShowCookedDialog(true);
                }}
                onEdit={() => {
                  router.push(`/app/recipes/${recipe.id}/edit`);
                }}
                onExportPDF={handleExportPDF}
                onDelete={() => {
                  setDeleteDialogOpen(true);
                }}
              />

              {/* Title Section - clean and prominent */}
              <div className="px-4 pt-4 pb-2 shrink-0">
                <CardTitle className="text-lg font-semibold leading-snug line-clamp-2 text-[#1A1A1A] group-hover:text-[#333] transition-colors">
                  <HighlightText text={recipe.title} searchTerm={searchTerm} />
                </CardTitle>
              </div>

              {/* Type Badge + Simple Metadata */}
              <RecipeCardMetadata
                recipeType={recipe.recipe_type}
                totalTime={metadata.totalTime}
                servings={recipe.servings}
              />

              <CardContent className="flex flex-col flex-1 pt-0 px-4 pb-4">
                {/* Footer: Add to Plan + Favorite */}
                <RecipeCardActions
                  isFavorite={isFavorite}
                  isPending={isPending}
                  isAddingToPlan={isAddingToPlan}
                  isMobile={isMobile}
                  onToggleFavorite={handleToggleFavorite}
                  onAddToCart={handleAddToCart}
                />
              </CardContent>
            </Card>
          </Link>
        </HoverCardTrigger>

        {/* HoverCard Content - Desktop only, shows nutrition & quick actions */}
        {!isMobile && (
          <RecipeCardHover
            recipe={recipe}
            isFavorite={isFavorite}
            isPending={isPending}
            isAddingToPlan={isAddingToPlan}
            hasAnyWarnings={hasAnyWarnings}
            allWarnings={allWarnings}
            onToggleFavorite={handleToggleFavorite}
            onAddToCart={handleAddToCart}
            onShare={handleShare}
            onStartCooking={() => {
              router.push(`/app/recipes/${recipe.id}/cook`);
            }}
          />
        )}
      </HoverCard>

      {/* All dialogs and sheets */}
      <RecipeCardDialogs
        recipe={recipe}
        deleteDialogOpen={deleteDialogOpen}
        isDeleting={isDeleting}
        showCookedDialog={showCookedDialog}
        showShareDialog={showShareDialog}
        showEditHistoryDialog={showEditHistoryDialog}
        showAddToPlanSheet={showAddToPlanSheet}
        cookingEntryToEdit={cookingEntryToEdit}
        onDeleteDialogChange={setDeleteDialogOpen}
        onDelete={handleDelete}
        onCookedDialogChange={setShowCookedDialog}
        onCookingSuccess={handleCookingSuccess}
        onShareDialogClose={() => setShowShareDialog(false)}
        onEditHistoryDialogChange={(open) => {
          setShowEditHistoryDialog(open);
          if (!open) setCookingEntryToEdit(null);
        }}
        onCookingEntryUpdated={handleCookingEntryUpdated}
        onAddToPlanSheetClose={() => setShowAddToPlanSheet(false)}
        onAddFromSheet={handleAddFromSheet}
      />
    </>
  );
});
