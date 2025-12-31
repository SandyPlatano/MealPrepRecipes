"use client";

import { useState, useTransition, memo, useEffect, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Eye, Pencil, ChefHat, CalendarOff, ChevronRight, Check, Plus, Zap, ChevronDown, Clock, Copy, ClipboardPaste, ArrowRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { RecipePickerModal } from "./recipe-picker-modal";
import { MealSlotHeader } from "./meal-slot-header";
import { MealTypeSelector } from "./meal-type-selector";
import { QuickAddDropdown } from "./quick-add-dropdown";
import { DraggableMeal } from "./draggable-meal";
import { RecipePreviewPopover } from "./recipe-preview-popover";
import { cn } from "@/lib/utils";
import type { DayOfWeek, MealAssignmentWithRecipe, MealType } from "@/types/meal-plan";
import { groupMealsByType, getMealTypeConfig, MEAL_TYPE_ORDER } from "@/types/meal-plan";
import type { RecipeNutrition } from "@/types/nutrition";
import type { MealTypeCustomization, MealTypeKey, PlannerViewSettings, DefaultCooksByDay } from "@/types/settings";

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
  const [isPending, startTransition] = useTransition();
  const [modalOpen, setModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Handle keyboard-triggered modal
  useEffect(() => {
    if (keyboardModalOpen && !modalOpen) {
      setModalOpen(true);
    }
  }, [keyboardModalOpen, modalOpen]);

  // Handle modal close (including keyboard-triggered)
  const handleModalClose = (open: boolean) => {
    setModalOpen(open);
    if (!open && onKeyboardModalClose) {
      onKeyboardModalClose();
    }
  };

  // Track when component is mounted (client-side only) to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Group assignments by meal type for organized display
  const groupedAssignments = useMemo(() => {
    return groupMealsByType(assignments);
  }, [assignments]);

  // Only compute "today" on client to avoid server/client mismatch
  const today = isMounted ? new Date() : new Date(date);
  today.setHours(0, 0, 0, 0);
  const isToday = isMounted && date.toDateString() === today.toDateString();
  const isPast = isMounted && date < today;

  const dayNumber = date.getDate();
  const dayAbbrev = day.slice(0, 3).toUpperCase();
  // Use a consistent format that doesn't depend on locale
  const monthAbbrev = date.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
  // Keyboard shortcut number (1-7 for Mon-Sun)
  const keyboardNumber = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].indexOf(day) + 1;

  // Horizontal layout - compact single row for stacked view
  if (isHorizontalLayout) {
    return (
      <ContextMenu>
        <ContextMenuTrigger asChild disabled={isSelectionMode}>
          <Card
        className={cn(
          "group relative transition-all flex-1 min-h-0",
          isToday && "ring-2 ring-primary",
          isPast && "opacity-60",
          isFocused && !isToday && "ring-2 ring-primary/50",
          isSelectionMode && isSelected && "ring-2 ring-primary bg-primary/5",
          isPending && "opacity-50"
        )}
        onClick={isSelectionMode ? onToggleSelection : undefined}
      >
        <CardContent className="flex items-center gap-2 md:gap-3 p-2 md:p-3 h-full min-h-0">
          {/* Date badge - left side */}
          <div
            className={cn(
              "flex items-center gap-2 md:gap-3 flex-shrink-0 min-w-[70px] md:min-w-[80px]",
              isToday && "text-primary",
              isSelectionMode && "cursor-pointer"
            )}
            onClick={isSelectionMode ? (e) => { e.stopPropagation(); onToggleSelection?.(); } : undefined}
          >
            {/* Selection Checkbox */}
            {isSelectionMode && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSelection?.();
                }}
                className={cn(
                  "size-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0",
                  isSelected
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-muted-foreground/30 hover:border-primary/50"
                )}
                aria-label={isSelected ? "Deselect day" : "Select day"}
              >
                {isSelected && <Check className="size-3" />}
              </button>
            )}

            <div className="flex items-baseline gap-1.5">
              <span className="text-lg md:text-xl font-bold font-mono leading-none">
                {dayNumber}
              </span>
              <div className="flex flex-col">
                <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wide leading-none">
                  {dayAbbrev}
                </span>
                <span className="text-[9px] md:text-[10px] text-muted-foreground leading-none">
                  {monthAbbrev}
                </span>
              </div>
            </div>
            {isToday && (
              <Badge variant="default" className="text-[8px] md:text-[9px] px-1.5 py-0 h-4">
                Today
              </Badge>
            )}
          </div>

          {/* Meals content - center/right */}
          <div className="flex-1 flex items-center gap-2 min-w-0 overflow-hidden">
            {assignments.length === 0 ? (
              isPast ? (
                <span className="text-sm text-muted-foreground">No meals</span>
              ) : (
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  disabled={isPending}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md border border-dashed border-muted-foreground/30",
                    "hover:border-primary/50 hover:bg-primary/5 transition-all text-sm text-muted-foreground",
                    "hover:text-primary"
                  )}
                >
                  <Plus className="size-4" />
                  <span className="hidden sm:inline">Add meal</span>
                </button>
              )
            ) : (
              <div className="flex items-center gap-2 flex-1 min-w-0 overflow-x-auto">
                {/* Show first few meals inline */}
                {assignments.slice(0, 3).map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary/50 border border-border/50 text-sm min-w-0 max-w-[300px]"
                  >
                    <RecipePreviewPopover
                      recipe={assignment.recipe}
                      nutrition={nutritionData?.get(assignment.recipe_id) || null}
                    >
                      <span className="truncate font-medium hover:underline cursor-pointer">
                        {assignment.recipe.title}
                      </span>
                    </RecipePreviewPopover>
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      <Link href={`/app/recipes/${assignment.recipe.id}`} target="_blank">
                        <Button variant="ghost" size="icon" className="size-6 hover:bg-background">
                          <Eye className="size-3" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-6 hover:bg-background"
                        onClick={() => {
                          onRemoveMeal(assignment.id);
                          setModalOpen(true);
                        }}
                      >
                        <Pencil className="size-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-6 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => onRemoveMeal(assignment.id)}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                {assignments.length > 3 && (
                  <Badge variant="outline" className="flex-shrink-0">
                    +{assignments.length - 3} more
                  </Badge>
                )}
                {/* Add more button */}
                {!isPast && (
                  <QuickAddDropdown
                    recipes={recipes}
                    recentRecipeIds={recentRecipeIds}
                    onQuickAdd={async (recipeId) => {
                      await onAddMeal(recipeId, day);
                    }}
                    onOpenFullPicker={() => setModalOpen(true)}
                    disabled={isPending}
                    compact
                  />
                )}
              </div>
            )}
          </div>
        </CardContent>

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
          </Card>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          <ContextMenuItem
            onClick={() => onCopyDay?.(day)}
            disabled={assignments.length === 0}
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy day
            <ContextMenuShortcut>⌘C</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => onPasteDay?.(day)}
            disabled={!canPaste || isPast}
          >
            <ClipboardPaste className="mr-2 h-4 w-4" />
            Paste
            <ContextMenuShortcut>⌘V</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            onClick={() => setModalOpen(true)}
            disabled={isPast}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add meal
            <ContextMenuShortcut>A</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            onClick={() => onClearDay?.(day)}
            disabled={assignments.length === 0}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear day
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  }

  // Original card layout
  return (
    <Card
      className={cn(
        "group relative transition-all h-full min-h-0 overflow-hidden",
        isToday && "ring-2 ring-primary",
        isPast && "opacity-70",
        isFocused && !isToday && "ring-2 ring-primary/50 shadow-md",
        isSelectionMode && isSelected && "ring-2 ring-primary bg-primary/5",
        isPending && "opacity-60"
      )}
      onClick={isSelectionMode ? onToggleSelection : undefined}
    >
      {/* Internal Date Badge - top left corner */}
      <div
        className={cn(
          "absolute top-3 left-3 flex flex-col items-center z-10",
          isToday && "text-primary",
          isSelectionMode && "cursor-pointer"
        )}
        onClick={isSelectionMode ? (e) => { e.stopPropagation(); onToggleSelection?.(); } : undefined}
      >
        {/* Selection Checkbox (shown in selection mode) */}
        {isSelectionMode && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelection?.();
            }}
            className={cn(
              "size-6 rounded-md border-2 flex items-center justify-center transition-all mb-1",
              isSelected
                ? "bg-primary border-primary text-primary-foreground"
                : "border-muted-foreground/30 hover:border-primary/50"
            )}
            aria-label={isSelected ? "Deselect day" : "Select day"}
          >
            {isSelected && <Check className="size-4" />}
          </button>
        )}

        <div className="text-xl md:text-2xl font-bold font-mono leading-none">
          {dayNumber}
        </div>
        <div className="text-[9px] md:text-[10px] font-semibold uppercase tracking-wide">{dayAbbrev}</div>
        <div className="text-[8px] md:text-[9px] text-muted-foreground">{monthAbbrev}</div>
        {isToday && (
          <Badge variant="default" className="text-[7px] md:text-[8px] px-1 py-0 mt-1">
            Today
          </Badge>
        )}
        {googleConnected && isCalendarExcluded && (
          <div className="mt-1 flex items-center justify-center" title="Calendar sync disabled">
            <CalendarOff className="size-2.5 md:size-3 text-muted-foreground" />
          </div>
        )}
        {/* Keyboard shortcut hint - hidden on mobile */}
        <div
          className={cn(
            "hidden md:flex items-center justify-center mt-1 text-[9px] font-mono px-1 py-0.5 rounded transition-all",
            isFocused
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground opacity-0 group-hover:opacity-100"
          )}
          title={`Press ${keyboardNumber} to focus, then A to add`}
        >
          {keyboardNumber}
        </div>
      </div>

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
                  await onAddMeal(recipeId, day);
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
                    await onAddMeal(recipeId, day);
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

interface RecipeRowProps {
  assignment: MealAssignmentWithRecipe;
  cookNames: string[];
  cookColors: Record<string, string>;
  onUpdateCook: (assignmentId: string, cook: string | null) => Promise<void>;
  onUpdateMealType: (assignmentId: string, mealType: MealType | null) => Promise<void>;
  onRemove: (assignmentId: string) => Promise<void>;
  onSwap: () => void;
  nutrition?: RecipeNutrition | null;
  mealTypeSettings?: MealTypeCustomization;
  showNutrition?: boolean;
  showPrepTime?: boolean;
  compact?: boolean;
}

function RecipeRow({
  assignment,
  cookNames,
  cookColors,
  onUpdateCook,
  onUpdateMealType,
  onRemove,
  onSwap,
  nutrition = null,
  mealTypeSettings,
  showNutrition = true,
  showPrepTime = true,
  compact = false,
}: RecipeRowProps) {

  // Default colors for cooks (fallback)
  const defaultColors = [
    "#3b82f6", // blue
    "#a855f7", // purple
    "#10b981", // green
    "#f59e0b", // amber
    "#ec4899", // pink
  ];

  // Get cook color for styling - returns color for swatch and border
  const getCookColor = (cook: string | null): string | null => {
    if (!cook) return null;

    // Use saved color if available
    if (cookColors[cook]) {
      return cookColors[cook];
    }

    // Fall back to default color
    const index = cookNames.indexOf(cook);
    if (index >= 0) {
      return defaultColors[index % defaultColors.length];
    }

    return null;
  };

  // Get meal type config for colored border
  const mealTypeConfig = getMealTypeConfig(assignment.meal_type);
  // Use custom color if available, otherwise fall back to default
  const mealTypeKey = (assignment.meal_type ?? "other") as MealTypeKey;
  const customMealColor = mealTypeSettings?.[mealTypeKey]?.color;
  const mealAccentColor = customMealColor || mealTypeConfig.accentColor;

  const [isUpdating, setIsUpdating] = useState(false);
  const [isUpdatingMealType, setIsUpdatingMealType] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleCookChange = async (value: string) => {
    setIsUpdating(true);
    try {
      await onUpdateCook(assignment.id, value === "none" || value === "" ? null : value);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMealTypeChange = async (mealType: MealType | null) => {
    setIsUpdatingMealType(true);
    try {
      await onUpdateMealType(assignment.id, mealType);
    } finally {
      setIsUpdatingMealType(false);
    }
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await onRemove(assignment.id);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
      <div
        className={cn(
          "group flex flex-col gap-2 rounded-lg border bg-card/50 transition-all border-l-4",
          "hover:bg-card hover:shadow-sm hover:border-primary/30",
          compact ? "p-2" : "p-3",
          isRemoving && "opacity-50"
        )}
        style={{
          borderLeftColor: mealAccentColor,
        }}
      >
        {/* Title Row - Always visible */}
        <div className="flex items-center gap-2">
          {/* Chevron Toggle - larger on mobile for touch */}
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "size-10 md:size-8 flex-shrink-0 -ml-1",
                "hover:bg-muted/50",
                compact && "size-9 md:size-7"
              )}
              aria-label={isDetailsOpen ? "Collapse details" : "Expand details"}
            >
              <ChevronRight
                className={cn(
                  "size-5 md:size-4 text-muted-foreground transition-transform duration-200",
                  isDetailsOpen && "rotate-90"
                )}
              />
            </Button>
          </CollapsibleTrigger>

          {/* Recipe Title & Meta */}
          <div className="flex-1 min-w-0">
            <RecipePreviewPopover
              recipe={assignment.recipe}
              nutrition={nutrition}
            >
              <p
                className={cn(
                  "font-medium truncate hover:underline underline-offset-2",
                  compact ? "text-sm" : "text-sm md:text-base"
                )}
                title={assignment.recipe.title}
              >
                {assignment.recipe.title}
              </p>
            </RecipePreviewPopover>
            {/* Meta row */}
            {(showPrepTime && assignment.recipe.prep_time) || (showNutrition && nutrition) ? (
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                {showPrepTime && assignment.recipe.prep_time && (
                  <span className="text-xs text-muted-foreground">
                    {assignment.recipe.prep_time}
                  </span>
                )}
                {showNutrition && nutrition && (
                  <>
                    {nutrition.calories && (
                      <Badge variant="outline" className="text-[11px] font-mono px-1.5 py-0.5 h-5">
                        {Math.round(nutrition.calories)} cal
                      </Badge>
                    )}
                    {nutrition.protein_g && (
                      <Badge variant="outline" className="text-[11px] font-mono px-1.5 py-0.5 h-5">
                        {Math.round(nutrition.protein_g)}g protein
                      </Badge>
                    )}
                  </>
                )}
              </div>
            ) : null}
          </div>

          {/* Action buttons - always visible, larger on mobile for touch */}
          <div className="flex items-center gap-1 md:gap-1 flex-shrink-0">
            <Link href={`/app/recipes/${assignment.recipe.id}`} target="_blank">
              <Button
                variant="ghost"
                size="icon"
                className={cn("size-11 md:size-9", compact && "size-10 md:size-8")}
                title="View Recipe"
              >
                <Eye className={cn("size-5 md:size-4", compact && "size-4 md:size-3.5")} />
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className={cn("size-11 md:size-9", compact && "size-10 md:size-8")}
              onClick={onSwap}
              title="Change Recipe"
            >
              <Pencil className={cn("size-5 md:size-4", compact && "size-4 md:size-3.5")} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "size-11 md:size-9 hover:bg-destructive/10 hover:text-destructive",
                compact && "size-10 md:size-8"
              )}
              onClick={handleRemove}
              disabled={isRemoving}
              title="Remove"
            >
              <Trash2 className={cn("size-5 md:size-4", compact && "size-4 md:size-3.5")} />
            </Button>
          </div>
        </div>

        {/* Collapsible Details Panel */}
        <CollapsibleContent className="overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-200">
          <div
            className={cn(
              "flex items-center gap-2 pt-2 pl-7 border-t border-border/50 mt-1",
              compact && "pt-1.5 mt-0.5 pl-6"
            )}
          >
            {/* Meal Type Selector */}
            <div className="flex-1 min-w-0 max-w-[180px]">
              <MealTypeSelector
                value={assignment.meal_type}
                onChange={handleMealTypeChange}
                disabled={isUpdatingMealType}
                className={cn("h-9 text-sm", compact && "h-8 text-xs")}
                compact={false}
                mealTypeSettings={mealTypeSettings}
              />
            </div>

            {/* Cook Selector */}
            <div className="flex-1 min-w-0 max-w-[200px]">
              {(() => {
                const cookColor = getCookColor(assignment.cook);
                return (
                  <Select
                    value={assignment.cook || "none"}
                    onValueChange={handleCookChange}
                    disabled={isUpdating}
                  >
                    <SelectTrigger
                      className={cn(
                        "h-9 text-sm min-w-0 [&>span]:min-w-0 [&>span]:truncate",
                        compact && "h-8 text-xs"
                      )}
                      style={cookColor ? {
                        borderLeft: `3px solid ${cookColor}`,
                      } : undefined}
                    >
                      <ChefHat className={cn("size-4 mr-1.5 flex-shrink-0", compact && "size-3.5")} />
                      <SelectValue placeholder="Assign cook" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No cook assigned</SelectItem>
                      {cookNames.map((name) => {
                        const color = getCookColor(name);
                        return (
                          <SelectItem key={name} value={name}>
                            <span className="flex items-center gap-2">
                              {color && (
                                <span
                                  className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: color }}
                                  aria-hidden="true"
                                />
                              )}
                              {name}
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                );
              })()}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

// Merged empty state component: combines dashed add zone with quick-add dropdown
interface EmptyDayAddMealProps {
  recipes: Recipe[];
  recentRecipeIds: string[];
  onQuickAdd: (recipeId: string) => Promise<void>;
  onOpenFullPicker: () => void;
  disabled?: boolean;
  density?: "compact" | "comfortable" | "spacious";
}

function EmptyDayAddMeal({
  recipes,
  recentRecipeIds,
  onQuickAdd,
  onOpenFullPicker,
  disabled = false,
  density,
}: EmptyDayAddMealProps) {
  const [isAdding, setIsAdding] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Get the last 5 recently-cooked recipes
  const recentRecipes = recentRecipeIds
    .slice(0, 5)
    .map((id) => recipes.find((r) => r.id === id))
    .filter((r): r is Recipe => r !== undefined);

  const handleQuickAdd = async (recipeId: string) => {
    setIsAdding(recipeId);
    try {
      await onQuickAdd(recipeId);
      setIsOpen(false);
    } catch (error) {
      console.error("Error quick-adding recipe:", error);
    } finally {
      setIsAdding(null);
    }
  };

  return (
    <div
      className={cn(
        "relative w-full flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5 transition-all group/empty flex-1 min-h-0",
        density === "compact" ? "py-2 md:py-3" : "py-3 md:py-4",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {/* Main clickable area - opens full picker */}
      <button
        type="button"
        onClick={onOpenFullPicker}
        disabled={disabled}
        className="flex flex-col items-center justify-center gap-1 cursor-pointer w-full"
      >
        <div className="size-8 rounded-full bg-muted/50 group-hover/empty:bg-primary/10 flex items-center justify-center transition-colors">
          <Plus className="size-4 text-muted-foreground group-hover/empty:text-primary transition-colors" />
        </div>
        <span className="text-xs text-muted-foreground group-hover/empty:text-primary transition-colors">
          Add meal
        </span>
      </button>

      {/* Quick-add dropdown in corner - only if recent recipes exist */}
      {recentRecipes.length > 0 && (
        <div className="absolute bottom-2 right-2">
          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                disabled={disabled}
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  "h-8 px-2 gap-1 text-xs rounded-md",
                  "hover:bg-primary/10 hover:text-primary transition-colors",
                  "opacity-60 group-hover/empty:opacity-100"
                )}
              >
                <Zap className="size-3.5 text-amber-500" />
                <ChevronDown className="size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="size-3" />
                Quick Add Recent
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {recentRecipes.map((recipe) => (
                <DropdownMenuItem
                  key={recipe.id}
                  onClick={() => handleQuickAdd(recipe.id)}
                  disabled={isAdding !== null}
                  className={cn(
                    "flex flex-col items-start gap-0.5 py-2.5 cursor-pointer",
                    isAdding === recipe.id && "opacity-50"
                  )}
                >
                  <span className="font-medium truncate w-full">{recipe.title}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-2">
                    {recipe.recipe_type}
                    {recipe.prep_time && (
                      <>
                        <span>•</span>
                        {recipe.prep_time}
                      </>
                    )}
                  </span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setIsOpen(false);
                  onOpenFullPicker();
                }}
                className="text-muted-foreground"
              >
                <Plus className="size-4 mr-2" />
                Browse all recipes...
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}

