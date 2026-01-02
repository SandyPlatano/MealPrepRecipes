"use client";

import { useState, useMemo, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";
import { useSwipeGesture } from "@/hooks/use-swipe-gesture";
import { usePlannerKeyboard } from "@/hooks/use-planner-keyboard";
import { PlannerHeader } from "./planner-header";
import { PlannerDayRow } from "./planner-day-row";
import { PlannerDndContext } from "./planner-dnd-context";
import { DroppableDay } from "./droppable-day";
import { PlannerFab } from "./planner-fab";
import { RecipePickerModal } from "./recipe-picker-modal";
import { BulkSelectionToolbar } from "./bulk-selection-toolbar";
import { copySelectedDaysToNextWeek } from "@/app/actions/meal-plan-suggestions";
import {
  addMealAssignment,
  removeMealAssignment,
  updateMealAssignment,
  clearDayAssignments,
} from "@/app/actions/meal-plans";
import { copyPreviousWeek } from "@/app/actions/meal-plan-suggestions";
import { toast } from "sonner";
import {
  type WeekPlanData,
  type DayOfWeek,
  type MealAssignmentWithRecipe,
  type MealType,
  DAYS_OF_WEEK,
  formatWeekRange,
} from "@/types/meal-plan";

interface Recipe {
  id: string;
  title: string;
  recipe_type: string;
  category?: string | null;
  prep_time?: string | null;
  cook_time?: string | null;
  image_url?: string | null;
  tags?: string[];
}

import type { SubscriptionTier } from "@/types/subscription";
import type { RecipeNutrition, WeeklyMacroDashboard, MacroGoals } from "@/types/nutrition";
import type { MealTypeCustomization, PlannerViewSettings, DefaultCooksByDay } from "@/types/settings";
import { DEFAULT_PLANNER_VIEW_SETTINGS } from "@/types/settings";

interface MealPlannerGridProps {
  weekStartStr: string;
  weekPlan: WeekPlanData;
  recipes: Recipe[];
  cookNames: string[];
  cookColors: Record<string, string>;
  userAllergenAlerts?: string[];
  calendarExcludedDays?: string[];
  googleConnected?: boolean;
  favorites: string[];
  recentRecipeIds: string[];
  suggestedRecipeIds: string[];
  previousWeekMealCount: number;
  subscriptionTier?: SubscriptionTier;
  aiQuotaRemaining?: number | null;
  existingMealDays?: string[];
  nutritionEnabled?: boolean;
  nutritionData?: Map<string, RecipeNutrition> | null;
  weeklyNutritionDashboard?: WeeklyMacroDashboard | null;
  macroGoals?: MacroGoals | null;
  canNavigateWeeks?: boolean;
  mealTypeSettings?: MealTypeCustomization;
  plannerViewSettings?: PlannerViewSettings;
  defaultCooksByDay?: DefaultCooksByDay;
}

export function MealPlannerGrid({
  weekStartStr,
  weekPlan,
  recipes,
  cookNames,
  cookColors,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  userAllergenAlerts = [],
  calendarExcludedDays = [],
  googleConnected = false,
  favorites,
  recentRecipeIds,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  suggestedRecipeIds,
  previousWeekMealCount,
  subscriptionTier = 'free',
  aiQuotaRemaining = null,
  existingMealDays = [],
  nutritionEnabled = false,
  nutritionData = null,
  weeklyNutritionDashboard = null,
  macroGoals = null,
  canNavigateWeeks = false,
  mealTypeSettings,
  plannerViewSettings: initialPlannerViewSettings,
  defaultCooksByDay = {},
}: MealPlannerGridProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSending, setIsSending] = useState(false);

  // Swipe gesture for week navigation (mobile)
  const navigateWeek = useCallback((direction: "prev" | "next") => {
    if (!canNavigateWeeks) return; // Don't navigate if user can't navigate weeks
    const newDate = new Date(weekStartStr + "T00:00:00");
    newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    const weekStr = newDate.toISOString().split("T")[0];
    router.push(`/app/plan?week=${weekStr}`);
  }, [weekStartStr, canNavigateWeeks, router]);

  const { ref: swipeRef, isSwiping } = useSwipeGesture({
    onSwipeLeft: () => navigateWeek("next"),
    onSwipeRight: () => navigateWeek("prev"),
    threshold: 75,
    enabled: canNavigateWeeks,
    hapticFeedback: true,
  });

  // Track open modal state for keyboard navigation
  const [keyboardModalDay, setKeyboardModalDay] = useState<typeof DAYS_OF_WEEK[number] | null>(null);

  // FAB modal state (for mobile quick-add)
  const [fabModalDay, setFabModalDay] = useState<typeof DAYS_OF_WEEK[number] | null>(null);

  // Bulk selection mode
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedDays, setSelectedDays] = useState<Set<DayOfWeek>>(new Set());

  // Clipboard state for copy/paste day functionality
  const [clipboardDay, setClipboardDay] = useState<DayOfWeek | null>(null);

  // Keyboard shortcuts for planner navigation
  const { focusedDayIndex } = usePlannerKeyboard({
    enabled: true,
    onAddMeal: (day) => {
      // Trigger modal open for the focused day
      setKeyboardModalDay(day);
    },
    onNavigateWeek: navigateWeek,
  });

  // Planner view settings state (for optimistic updates from the header toggle)
  const [plannerViewSettings, setPlannerViewSettings] = useState<PlannerViewSettings>(
    initialPlannerViewSettings || DEFAULT_PLANNER_VIEW_SETTINGS
  );

  // Optimistic state for cook assignments (instant UI feedback)
  const [optimisticCooks, setOptimisticCooks] = useState<Record<string, string | null>>({});

  // Apply optimistic cook values to assignments for instant UI feedback
  const assignmentsWithOptimisticCooks = useMemo(() => {
    const result: Record<DayOfWeek, MealAssignmentWithRecipe[]> = {} as Record<DayOfWeek, MealAssignmentWithRecipe[]>;
    for (const day of DAYS_OF_WEEK) {
      result[day] = (weekPlan.assignments[day] || []).map(assignment => {
        if (assignment.id in optimisticCooks) {
          return {
            ...assignment,
            cook: optimisticCooks[assignment.id],
          };
        }
        return assignment;
      });
    }
    return result;
  }, [weekPlan.assignments, optimisticCooks]);

  // Get all assignments as a flat array (with optimistic values)
  const allAssignments = useMemo(() => {
    return Object.values(assignmentsWithOptimisticCooks).flat();
  }, [assignmentsWithOptimisticCooks]);

  // Create a Date object for display purposes (e.g., formatWeekRange)
  // Use 'T00:00:00' to ensure consistent parsing across timezones
  const weekStartDate = new Date(weekStartStr + "T00:00:00");

  // Handler for adding a meal (with optional cook, meal type, and serving size)
  const handleAddMeal = useCallback(
    async (recipeId: string, day: DayOfWeek, cook?: string, mealType?: MealType | null, servingSize?: number | null) => {
      const recipe = recipes.find((r) => r.id === recipeId);
      startTransition(async () => {
        const result = await addMealAssignment(weekStartStr, recipeId, day, cook, mealType, servingSize);
        if (result.error) {
          toast.error(result.error);
        } else {
          const servingsText = servingSize ? ` (${servingSize} servings)` : "";
          toast.success(`Added "${recipe?.title}" to ${day}${servingsText}`);
        }
      });
    },
    [weekStartStr, recipes]
  );

  // Handler for updating a cook with optimistic updates
  const handleUpdateCook = useCallback(
    async (assignmentId: string, cook: string | null) => {
      // Optimistically update local state immediately for instant UI feedback
      setOptimisticCooks(prev => ({ ...prev, [assignmentId]: cook }));

      startTransition(async () => {
        const result = await updateMealAssignment(assignmentId, { cook: cook || undefined });
        if (result.error) {
          // Rollback optimistic update on error
          setOptimisticCooks(prev => {
            const next = { ...prev };
            delete next[assignmentId];
            return next;
          });
          toast.error(result.error);
        }
      });
    },
    []
  );

  // Handler for updating a meal type
  const handleUpdateMealType = useCallback(
    async (assignmentId: string, mealType: MealType | null) => {
      startTransition(async () => {
        const result = await updateMealAssignment(assignmentId, { meal_type: mealType });
        if (result.error) {
          toast.error(result.error);
        }
      });
    },
    []
  );

  // Handler for removing a meal
  const handleRemoveMeal = useCallback(
    async (assignmentId: string) => {
      const assignment = allAssignments.find((a) => a.id === assignmentId);
      startTransition(async () => {
        const result = await removeMealAssignment(assignmentId);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success(`Removed "${assignment?.recipe.title}"`);
        }
      });
    },
    [allAssignments]
  );

  // Handler for copying last week
  const handleCopyLastWeek = useCallback(async () => {
    const previousWeekStart = new Date(weekStartStr + "T00:00:00");
    previousWeekStart.setDate(previousWeekStart.getDate() - 7);
    const prevWeekStr = previousWeekStart.toISOString().split("T")[0];

    startTransition(async () => {
      const result = await copyPreviousWeek(prevWeekStr, weekStartStr);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Copied ${result.copiedCount} meals from last week`);
      }
    });
  }, [weekStartStr]);

  // Handler for clearing all meals
  const handleClearAll = useCallback(async () => {
    startTransition(async () => {
      // Clear each day
      for (const day of DAYS_OF_WEEK) {
        await clearDayAssignments(weekStartStr, day);
      }
      toast.success("Cleared all meals");
    });
  }, [weekStartStr]);

  // Handler for sending the plan
  const handleSendPlan = useCallback(async () => {
    if (allAssignments.length === 0) {
      toast.error("No meals to send");
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch("/api/send-shopping-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekRange: formatWeekRange(weekStartDate),
          weekStart: weekStartStr,
          items: allAssignments.map((a) => ({
            recipe: a.recipe,
            cook: a.cook,
            day: a.day_of_week,
          })),
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error || "Failed to send plan");
      } else {
        toast.success(result.message || "Plan sent!");
      }
    } catch {
      toast.error("Failed to send plan");
    } finally {
      setIsSending(false);
    }
  }, [allAssignments, weekStartDate, weekStartStr]);

  const hasMeals = allAssignments.length > 0;

  // Count how many days have at least one meal
  const daysWithMealsCount = useMemo(() => {
    return DAYS_OF_WEEK.filter((day) => (assignmentsWithOptimisticCooks[day]?.length || 0) > 0).length;
  }, [assignmentsWithOptimisticCooks]);

  // Calculate meal counts per day for bulk actions
  const mealCountsPerDay = useMemo(() => {
    const counts: Record<DayOfWeek, number> = {} as Record<DayOfWeek, number>;
    for (const day of DAYS_OF_WEEK) {
      counts[day] = assignmentsWithOptimisticCooks[day]?.length || 0;
    }
    return counts;
  }, [assignmentsWithOptimisticCooks]);

  // Toggle day selection
  const toggleDaySelection = useCallback((day: DayOfWeek) => {
    setSelectedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) {
        next.delete(day);
      } else {
        next.add(day);
      }
      return next;
    });
  }, []);

  // Select all days with meals
  const selectAllDays = useCallback(() => {
    const daysWithMeals = DAYS_OF_WEEK.filter((day) => mealCountsPerDay[day] > 0);
    setSelectedDays(new Set(daysWithMeals));
  }, [mealCountsPerDay]);

  // Clear selected days handler
  const handleClearSelectedDays = useCallback(async (days: DayOfWeek[]) => {
    for (const day of days) {
      await clearDayAssignments(weekStartStr, day);
    }
  }, [weekStartStr]);

  // Copy selected days to next week
  const handleCopyToNextWeek = useCallback(async (days: DayOfWeek[]) => {
    const nextWeekStart = new Date(weekStartStr + "T00:00:00");
    nextWeekStart.setDate(nextWeekStart.getDate() + 7);
    const nextWeekStr = nextWeekStart.toISOString().split("T")[0];
    await copySelectedDaysToNextWeek(weekStartStr, nextWeekStr, days);
  }, [weekStartStr]);

  // Cancel selection mode
  const cancelSelectionMode = useCallback(() => {
    setIsSelectionMode(false);
    setSelectedDays(new Set());
  }, []);

  // Copy day to clipboard (context menu)
  const handleCopyDay = useCallback((day: DayOfWeek) => {
    setClipboardDay(day);
    toast.success(`Copied ${day}'s meals to clipboard`);
  }, []);

  // Paste clipboard to day (context menu)
  const handlePasteDay = useCallback(async (targetDay: DayOfWeek) => {
    if (!clipboardDay) return;
    const sourceMeals = assignmentsWithOptimisticCooks[clipboardDay] || [];
    if (sourceMeals.length === 0) {
      toast.error("Nothing to paste");
      return;
    }

    startTransition(async () => {
      for (const meal of sourceMeals) {
        await addMealAssignment(weekStartStr, meal.recipe_id, targetDay, meal.cook || undefined, meal.meal_type);
      }
      toast.success(`Pasted ${sourceMeals.length} meal(s) to ${targetDay}`);
    });
  }, [clipboardDay, assignmentsWithOptimisticCooks, weekStartStr]);

  // Clear day (context menu)
  const handleClearDayContext = useCallback(async (day: DayOfWeek) => {
    startTransition(async () => {
      await clearDayAssignments(weekStartStr, day);
      toast.success(`Cleared ${day}`);
    });
  }, [weekStartStr]);

  return (
    <TooltipProvider>
        {/* Loading Indicator */}
        {isPending && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#D9F99D] text-[#1A1A1A] px-4 py-2 rounded-full shadow-md flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm font-medium">Updating...</span>
          </div>
        )}

        <div className="flex flex-col gap-2 md:gap-3 flex-1 min-h-0 h-full">
          {/* Header */}
          <div className={`flex-shrink-0 ${isPending ? "opacity-75 pointer-events-none" : ""}`}>
            <PlannerHeader
              weekStartStr={weekStartStr}
              onCopyLastWeek={handleCopyLastWeek}
              onClearAll={handleClearAll}
              onSendPlan={handleSendPlan}
              hasMeals={hasMeals}
              previousWeekMealCount={previousWeekMealCount}
              isSending={isSending}
              currentWeekMealCount={allAssignments.length}
              daysWithMealsCount={daysWithMealsCount}
              subscriptionTier={subscriptionTier}
              aiQuotaRemaining={aiQuotaRemaining}
              existingMealDays={existingMealDays}
              canNavigateWeeks={canNavigateWeeks}
              plannerViewSettings={plannerViewSettings}
              onPlannerViewChange={setPlannerViewSettings}
              isSelectionMode={isSelectionMode}
              onToggleSelectionMode={() => setIsSelectionMode((prev) => !prev)}
            />
          </div>

          {/* Bulk Selection Toolbar */}
          {isSelectionMode && (
            <BulkSelectionToolbar
              selectedDays={selectedDays}
              mealCounts={mealCountsPerDay}
              onClearDays={handleClearSelectedDays}
              onCopyToNextWeek={handleCopyToNextWeek}
              onCancel={cancelSelectionMode}
              onSelectAll={selectAllDays}
              totalDays={DAYS_OF_WEEK.length}
            />
          )}

          {/* 7 Stacked Rows Layout - swipe enabled for week navigation on mobile */}
          <PlannerDndContext assignments={assignmentsWithOptimisticCooks}>
            <div
              ref={swipeRef}
              className={`grid grid-rows-7 gap-1 flex-1 min-h-0 h-full transition-opacity ${isPending ? "opacity-60" : ""} ${isSwiping ? "select-none" : ""}`}
            >
              {DAYS_OF_WEEK.map((day, index) => {
                const dayDate = new Date(weekStartDate);
                dayDate.setDate(dayDate.getDate() + index);

                return (
                  <DroppableDay key={day} day={day}>
                    <PlannerDayRow
                      day={day}
                      date={dayDate}
                      assignments={assignmentsWithOptimisticCooks[day]}
                      recipes={recipes}
                      favorites={favorites}
                      recentRecipeIds={recentRecipeIds}
                      suggestedRecipeIds={suggestedRecipeIds}
                      cookNames={cookNames}
                      cookColors={cookColors}
                      userAllergenAlerts={userAllergenAlerts}
                      isCalendarExcluded={calendarExcludedDays.includes(day)}
                      googleConnected={googleConnected}
                      onAddMeal={handleAddMeal}
                      onUpdateCook={handleUpdateCook}
                      onUpdateMealType={handleUpdateMealType}
                      onRemoveMeal={handleRemoveMeal}
                      nutritionData={nutritionData}
                      mealTypeSettings={mealTypeSettings}
                      viewSettings={plannerViewSettings}
                      defaultCooksByDay={defaultCooksByDay}
                      isFocused={focusedDayIndex === index}
                      keyboardModalOpen={keyboardModalDay === day}
                      onKeyboardModalClose={() => setKeyboardModalDay(null)}
                      isSelectionMode={isSelectionMode}
                      isSelected={selectedDays.has(day)}
                      onToggleSelection={() => toggleDaySelection(day)}
                      isHorizontalLayout
                      onCopyDay={handleCopyDay}
                      onPasteDay={handlePasteDay}
                      onClearDay={handleClearDayContext}
                      canPaste={clipboardDay !== null}
                    />
                  </DroppableDay>
                );
              })}
            </div>
          </PlannerDndContext>
        </div>

        {/* Mobile FAB for quick meal adding */}
        <PlannerFab
          weekStartDate={weekStartDate}
          onSelectDay={(day) => setFabModalDay(day)}
        />

        {/* FAB Recipe Picker Modal */}
        {fabModalDay && (
          <RecipePickerModal
            open={!!fabModalDay}
            onOpenChange={(open) => !open && setFabModalDay(null)}
            day={fabModalDay}
            recipes={recipes}
            favorites={favorites}
            recentRecipeIds={recentRecipeIds}
            suggestedRecipeIds={suggestedRecipeIds}
            cookNames={cookNames}
            cookColors={cookColors}
            defaultCooksByDay={defaultCooksByDay}
            onAdd={async (recipeIds, cook, mealType) => {
              for (const recipeId of recipeIds) {
                await handleAddMeal(recipeId, fabModalDay, cook || undefined, mealType);
              }
            }}
          />
        )}
    </TooltipProvider>
  );
}

