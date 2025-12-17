"use client";

import { useState, useMemo, useCallback, useTransition } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";
import { PlannerHeader } from "./planner-header";
import { PlannerSummary } from "./planner-summary";
import { PlannerDayRow } from "./planner-day-row";
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
import type { MealTypeCustomization, PlannerViewSettings } from "@/types/settings";
import { DEFAULT_PLANNER_VIEW_SETTINGS } from "@/types/settings";
import type { EnergyModePreferences } from "@/types/energy-mode";
import { DEFAULT_ENERGY_MODE_PREFERENCES } from "@/types/energy-mode";
import { EnergyModeProvider } from "@/contexts/energy-mode-context";
import { EnergyHeaderWidget } from "@/components/energy-mode";

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
  energyModePreferences?: EnergyModePreferences;
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
  energyModePreferences = DEFAULT_ENERGY_MODE_PREFERENCES,
}: MealPlannerGridProps) {
  const [isPending, startTransition] = useTransition();
  const [isSending, setIsSending] = useState(false);

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

  return (
    <EnergyModeProvider preferences={energyModePreferences}>
      <TooltipProvider>
        {/* Loading Indicator */}
        {isPending && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm font-medium">Updating...</span>
          </div>
        )}

        <div className="space-y-4 md:space-y-6">
          {/* Energy Mode Check-In Widget */}
          {energyModePreferences.enabled && (
            <div className="flex justify-end">
              <EnergyHeaderWidget />
            </div>
          )}

          {/* Header */}
          <div className={isPending ? "opacity-75 pointer-events-none" : ""}>
            <PlannerHeader
              weekStartStr={weekStartStr}
              onCopyLastWeek={handleCopyLastWeek}
              onClearAll={handleClearAll}
              onSendPlan={handleSendPlan}
              hasMeals={hasMeals}
              previousWeekMealCount={previousWeekMealCount}
              isSending={isSending}
              currentWeekMealCount={allAssignments.length}
              subscriptionTier={subscriptionTier}
              aiQuotaRemaining={aiQuotaRemaining}
              existingMealDays={existingMealDays}
              canNavigateWeeks={canNavigateWeeks}
              plannerViewSettings={plannerViewSettings}
              onPlannerViewChange={setPlannerViewSettings}
            />
          </div>

          {/* Vertical Stacked Cards */}
          <div className={`space-y-3 md:space-y-4 transition-opacity ${isPending ? "opacity-60" : ""}`}>
            {DAYS_OF_WEEK.map((day, index) => {
              const dayDate = new Date(weekStartDate);
              dayDate.setDate(dayDate.getDate() + index);

              return (
                <PlannerDayRow
                  key={day}
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
                />
              );
            })}
          </div>

          {/* Summary Footer */}
          <PlannerSummary
            assignments={allAssignments}
            weekStartStr={weekStartStr}
            cookColors={cookColors}
            nutritionEnabled={nutritionEnabled}
            nutritionData={nutritionData}
            weeklyNutritionDashboard={weeklyNutritionDashboard}
            macroGoals={macroGoals}
          />
        </div>
      </TooltipProvider>
    </EnergyModeProvider>
  );
}

