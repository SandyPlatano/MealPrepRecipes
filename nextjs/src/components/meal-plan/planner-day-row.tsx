"use client";

import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RecipePickerModal } from "./recipe-picker-modal";
import { MealSlotHeader } from "./meal-slot-header";
import { QuickAddDropdown } from "./quick-add-dropdown";
import { DraggableMeal } from "./draggable-meal";
import { cn } from "@/lib/utils";
import type { DayOfWeek, MealAssignmentWithRecipe, MealType } from "@/types/meal-plan";
import { MEAL_TYPE_ORDER } from "@/types/meal-plan";
import type { RecipeNutrition } from "@/types/nutrition";
import type { MealTypeCustomization, MealTypeKey, PlannerViewSettings, DefaultCooksByDay } from "@/types/settings";
import { usePlannerDayState } from "@/hooks/use-planner-day-state";
import { DateBadge, EmptyDayAddMeal, RecipeRow, HorizontalLayout } from "./planner-day";

interface Recipe {
  id: string;
  title: string;
  recipe_type: string;
  prep_time?: string | null;
  image_url?: string | null;
}

interface PlannerDayRowProps {
  day: DayOfWeek;
  date: Date;
  assignments: MealAssignmentWithRecipe[];
  recipes: Recipe[];
  favorites: string[];
  recentRecipeIds: string[];
  suggestedRecipeIds: string[];
  cookNames: string[];
  cookColors: Record<string, string>;
  userAllergenAlerts?: string[];
  isCalendarExcluded?: boolean;
  googleConnected?: boolean;
  onAddMeal: (recipeId: string, day: DayOfWeek, cook?: string, mealType?: MealType | null, servingSize?: number | null) => Promise<void>;
  onUpdateCook: (assignmentId: string, cook: string | null) => Promise<void>;
  onUpdateMealType: (assignmentId: string, mealType: MealType | null) => Promise<void>;
  onRemoveMeal: (assignmentId: string) => Promise<void>;
  nutritionData?: Map<string, RecipeNutrition> | null;
  mealTypeSettings?: MealTypeCustomization;
  viewSettings?: PlannerViewSettings;
  defaultCooksByDay?: DefaultCooksByDay;
  isFocused?: boolean;
  keyboardModalOpen?: boolean;
  onKeyboardModalClose?: () => void;
  // Selection mode props
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: () => void;
  // Horizontal layout for stacked rows
  isHorizontalLayout?: boolean;
  // Context menu actions
  onCopyDay?: (day: DayOfWeek) => void;
  onPasteDay?: (day: DayOfWeek) => void;
  onClearDay?: (day: DayOfWeek) => Promise<void>;
  canPaste?: boolean;
}

export const PlannerDayRow = memo(function PlannerDayRow({
  day,
  date,
  assignments,
  recipes,
  favorites,
  recentRecipeIds,
  suggestedRecipeIds,
  cookNames,
  cookColors,
  userAllergenAlerts = [],
  isCalendarExcluded = false,
  googleConnected = false,
  onAddMeal,
  onUpdateCook,
  onUpdateMealType,
  onRemoveMeal,
  nutritionData = null,
  mealTypeSettings,
  viewSettings,
  defaultCooksByDay = {},
  isFocused = false,
  keyboardModalOpen = false,
  onKeyboardModalClose,
  isSelectionMode = false,
  isSelected = false,
  onToggleSelection,
  isHorizontalLayout = false,
  onCopyDay,
  onPasteDay,
  onClearDay,
  canPaste = false,
}: PlannerDayRowProps) {
  const { state, actions, dialogs } = usePlannerDayState({
    day,
    date,
    assignments,
    keyboardModalOpen,
    onKeyboardModalClose,
    onAddMeal,
  });

  const {
    isPending,
    isMounted,
    groupedAssignments,
    isToday,
    isPast,
    dayNumber,
    dayAbbrev,
    monthAbbrev,
    keyboardNumber,
  } = state;

  const { startTransition, handleModalClose, handleAddMeal } = actions;
  const { modalOpen, setModalOpen } = dialogs;

  // Horizontal layout - compact single row for stacked view
  if (isHorizontalLayout) {
    return (
      <>
        <HorizontalLayout
          dayNumber={dayNumber}
          dayAbbrev={dayAbbrev}
          monthAbbrev={monthAbbrev}
          isToday={isToday}
          isPast={isPast}
          isPending={isPending}
          assignments={assignments}
          recipes={recipes}
          recentRecipeIds={recentRecipeIds}
          cookNames={cookNames}
          cookColors={cookColors}
          nutritionData={nutritionData}
          isSelectionMode={isSelectionMode}
          isSelected={isSelected}
          onToggleSelection={onToggleSelection}
          onRemoveMeal={onRemoveMeal}
          onUpdateCook={onUpdateCook}
          onAddMeal={async (recipeId) => {
            await handleAddMeal(recipeId);
          }}
          setModalOpen={setModalOpen}
          day={day}
          onCopyDay={onCopyDay}
          onPasteDay={onPasteDay}
          onClearDay={onClearDay}
          canPaste={canPaste}
        />

        {/* Recipe Picker Modal */}
        {!isPast && (
          <RecipePickerModal
            open={modalOpen}
            onOpenChange={handleModalClose}
            day={day}
            recipes={recipes}
            favorites={favorites}
            recentRecipeIds={recentRecipeIds}
            suggestedRecipeIds={suggestedRecipeIds}
            cookNames={cookNames}
            cookColors={cookColors}
            userAllergenAlerts={userAllergenAlerts}
            defaultCooksByDay={defaultCooksByDay}
            onAdd={async (recipeIds, cook, mealType) => {
              startTransition(async () => {
                for (const recipeId of recipeIds) {
                  await onAddMeal(recipeId, day, cook || undefined, mealType);
                }
              });
            }}
          />
        )}
      </>
    );
  }

  // Original card layout
  return (
    <Card
      className={cn(
        "group relative transition-all h-full min-h-0 overflow-hidden bg-[#FAFAF8] shadow-md",
        isToday && "ring-2 ring-primary shadow-lg",
        isPast && "opacity-70",
        isFocused && !isToday && "ring-2 ring-primary/50 shadow-lg",
        isSelectionMode && isSelected && "ring-2 ring-[#D9F99D] bg-[#D9F99D]/10",
        isPending && "opacity-60"
      )}
      onClick={isSelectionMode ? onToggleSelection : undefined}
    >
      {/* Internal Date Badge - top left corner */}
      <DateBadge
        dayNumber={dayNumber}
        dayAbbrev={dayAbbrev}
        monthAbbrev={monthAbbrev}
        isToday={isToday}
        isFocused={isFocused}
        keyboardNumber={keyboardNumber}
        googleConnected={googleConnected}
        isCalendarExcluded={isCalendarExcluded}
        isSelectionMode={isSelectionMode}
        isSelected={isSelected}
        onToggleSelection={onToggleSelection}
      />

      {/* Card Content - shifted right to accommodate date badge */}
      <CardContent
        className={cn(
          // Base spacing - flex column with gap, scrollable if needed
          "flex flex-col gap-1.5 md:gap-2 h-full overflow-y-auto",
          // Left padding for date badge + drag handle space
          "pl-14 md:pl-18",
          // Density-based padding
          viewSettings?.density === "compact" && "p-2 pl-12 md:pl-16 gap-1",
          viewSettings?.density === "comfortable" && "p-2 md:p-3 pl-14 md:pl-18",
          viewSettings?.density === "spacious" && "p-3 md:p-4 pl-16 md:pl-20 gap-2 md:gap-3",
          // Default if no viewSettings
          !viewSettings?.density && "p-2 md:p-3 pl-14 md:pl-18"
        )}
      >
          {assignments.length === 0 ? (
            isPast ? (
              <div className={cn(
                "text-sm text-muted-foreground text-center flex-1 flex items-center justify-center",
                viewSettings?.density === "compact" ? "py-2 md:py-3" : "py-3 md:py-4"
              )}>
                No meals planned
              </div>
            ) : (
              <EmptyDayAddMeal
                recipes={recipes}
                recentRecipeIds={recentRecipeIds}
                onQuickAdd={async (recipeId) => {
                  await handleAddMeal(recipeId);
                }}
                onOpenFullPicker={() => setModalOpen(true)}
                disabled={isPending}
                density={viewSettings?.density}
              />
            )
          ) : (
            <>
              {/* Render grouped assignments by meal type */}
              {MEAL_TYPE_ORDER.map((mealType) => {
                const typeMeals = groupedAssignments.get(mealType) || [];
                if (typeMeals.length === 0) return null;

                return (
                  <div
                    key={mealType ?? "other"}
                    className={cn(
                      "flex flex-col",
                      viewSettings?.density === "compact" ? "gap-1.5" : "gap-2 md:gap-3"
                    )}
                  >
                    {/* Conditionally render meal type header based on settings */}
                    {viewSettings?.showMealTypeHeaders !== false && (
                      <MealSlotHeader
                        mealType={mealType}
                        mealCount={typeMeals.length}
                        customEmoji={mealTypeSettings?.[(mealType ?? "other") as MealTypeKey]?.emoji}
                        customColor={mealTypeSettings?.[(mealType ?? "other") as MealTypeKey]?.color}
                      />
                    )}
                    {typeMeals.map((assignment) => (
                      <DraggableMeal
                        key={assignment.id}
                        id={assignment.id}
                        disabled={isPast}
                      >
                        <RecipeRow
                          assignment={assignment}
                          cookNames={cookNames}
                          cookColors={cookColors}
                          onUpdateCook={onUpdateCook}
                          onUpdateMealType={onUpdateMealType}
                          onRemove={onRemoveMeal}
                          onSwap={() => {
                            // First remove the current recipe, then open modal to add new one
                            onRemoveMeal(assignment.id);
                            setModalOpen(true);
                          }}
                          nutrition={nutritionData?.get(assignment.recipe_id) || null}
                          mealTypeSettings={mealTypeSettings}
                          showNutrition={viewSettings?.showNutritionBadges !== false}
                          showPrepTime={viewSettings?.showPrepTime !== false}
                          compact={viewSettings?.density === "compact"}
                        />
                      </DraggableMeal>
                    ))}
                  </div>
                );
              })}

              {/* Add Meal Button - only shown when there are existing meals */}
              {!isPast && (
                <QuickAddDropdown
                  recipes={recipes}
                  recentRecipeIds={recentRecipeIds}
                  onQuickAdd={async (recipeId) => {
                    await handleAddMeal(recipeId);
                  }}
                  onOpenFullPicker={() => setModalOpen(true)}
                  disabled={isPending}
                  compact={viewSettings?.density === "compact"}
                />
              )}
            </>
          )}

          {/* Recipe Picker Modal - used by both empty state and add button */}
          {!isPast && (
            <RecipePickerModal
                open={modalOpen}
                onOpenChange={handleModalClose}
                day={day}
                recipes={recipes}
                favorites={favorites}
                recentRecipeIds={recentRecipeIds}
                suggestedRecipeIds={suggestedRecipeIds}
                cookNames={cookNames}
                cookColors={cookColors}
                userAllergenAlerts={userAllergenAlerts}
                defaultCooksByDay={defaultCooksByDay}
                onAdd={async (recipeIds, cook, mealType) => {
                  startTransition(async () => {
                    // Add each recipe with the cook and meal type assignment
                    for (const recipeId of recipeIds) {
                      await onAddMeal(recipeId, day, cook || undefined, mealType);
                    }
                  });
                }}
              />
          )}
        </CardContent>
    </Card>
  );
});
