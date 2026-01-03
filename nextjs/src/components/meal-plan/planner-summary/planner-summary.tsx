"use client";

import { cn } from "@/lib/utils";
import { usePlannerSummary } from "@/hooks/use-planner-summary";
import { WeekProgressSection } from "./week-progress-section";
import { NutritionSummarySection } from "./nutrition-summary-section";
import { RepetitionWarningSection } from "./repetition-warning-section";
import { PlannerEmptyState } from "./planner-empty-state";
import { GridCellSummary } from "./grid-cell-summary";
import type { PlannerSummaryProps } from "./types";

export function PlannerSummary({
  assignments,
  cookColors = {},
  nutritionEnabled = false,
  nutritionData = null,
  weeklyNutritionDashboard = null,
  macroGoals = null,
  repetitionWarnings = [],
  isGridCell = false,
}: PlannerSummaryProps) {
  // Use the custom hook for calculations
  const {
    daysWithMeals,
    cookBreakdown,
    calculatedNutritionProgress,
    totalMeals,
  } = usePlannerSummary({
    assignments,
    nutritionData,
    macroGoals,
  });

  // Show nutrition if enabled and we have either server data or client-calculated data
  const hasNutritionData = !!(weeklyNutritionDashboard || calculatedNutritionProgress);
  const showNutrition = nutritionEnabled && !!macroGoals && hasNutritionData;

  // Show empty state if no meals planned (only in non-grid mode)
  if (totalMeals === 0 && !isGridCell) {
    return <PlannerEmptyState />;
  }

  // Compact grid cell version - pairs with Sunday in 2-column layout
  if (isGridCell) {
    return (
      <GridCellSummary
        daysWithMeals={daysWithMeals}
        cookBreakdown={cookBreakdown}
        cookColors={cookColors}
        totalMeals={totalMeals}
        showNutrition={showNutrition}
        calculatedProgress={calculatedNutritionProgress}
      />
    );
  }

  // Full summary layout (original)
  return (
    <div className="animate-slide-up-fade flex flex-col gap-4 py-6">
      {/* Main content grid - responsive */}
      <div
        className={cn(
          "grid gap-4",
          showNutrition
            ? "grid-cols-1 md:grid-cols-2"
            : "grid-cols-1"
        )}
      >
        {/* Section 1: Week Progress */}
        <WeekProgressSection
          daysWithMeals={daysWithMeals}
          cookBreakdown={cookBreakdown}
          cookColors={cookColors}
          totalMeals={totalMeals}
        />

        {/* Section 2: Nutrition (conditional) */}
        {showNutrition && macroGoals && (
          <NutritionSummarySection
            dashboard={weeklyNutritionDashboard}
            calculatedProgress={calculatedNutritionProgress}
            goals={macroGoals}
          />
        )}
      </div>

      {/* Recipe Repetition Warnings (Pro+ feature for multi-week planning) */}
      {repetitionWarnings.length > 0 && (
        <RepetitionWarningSection warnings={repetitionWarnings} />
      )}
    </div>
  );
}
