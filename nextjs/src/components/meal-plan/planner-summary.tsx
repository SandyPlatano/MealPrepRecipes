"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Activity } from "lucide-react";
import Link from "next/link";
import type { MealAssignmentWithRecipe, DayOfWeek } from "@/types/meal-plan";
import { DAYS_OF_WEEK } from "@/types/meal-plan";
import type { RecipeNutrition, WeeklyMacroDashboard, MacroGoals } from "@/types/nutrition";
import { formatNutritionValue } from "@/lib/nutrition/calculations";

// Day letter abbreviations
const DAY_LETTERS: Record<DayOfWeek, string> = {
  Monday: "M",
  Tuesday: "T",
  Wednesday: "W",
  Thursday: "T",
  Friday: "F",
  Saturday: "S",
  Sunday: "S",
};

interface PlannerSummaryProps {
  assignments: MealAssignmentWithRecipe[];
  weekStartStr: string;
  cookColors?: Record<string, string>;
  nutritionEnabled?: boolean;
  nutritionData?: Map<string, RecipeNutrition> | null;
  weeklyNutritionDashboard?: WeeklyMacroDashboard | null;
  macroGoals?: MacroGoals | null;
}

export function PlannerSummary({
  assignments,
  weekStartStr,
  cookColors = {},
  nutritionEnabled = false,
  weeklyNutritionDashboard = null,
  macroGoals = null,
}: PlannerSummaryProps) {
  // Calculate which days have meals
  const daysWithMeals = useMemo(() => {
    const days = new Set<DayOfWeek>();
    assignments.forEach((a) => days.add(a.day_of_week));
    return days;
  }, [assignments]);

  // Calculate cook breakdown
  const cookBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    let unassigned = 0;

    assignments.forEach((a) => {
      if (a.cook) {
        breakdown[a.cook] = (breakdown[a.cook] || 0) + 1;
      } else {
        unassigned++;
      }
    });

    return { breakdown, unassigned };
  }, [assignments]);

  const totalMeals = assignments.length;
  const hasCooksAssigned = Object.keys(cookBreakdown.breakdown).length > 0;

  // Don't show if no meals planned
  if (totalMeals === 0) {
    return null;
  }

  return (
    <div className="space-y-4 py-6">
      {/* Nutrition Summary (if enabled and has data) */}
      {nutritionEnabled && weeklyNutritionDashboard && macroGoals && (
        <div className="flex items-center justify-center gap-4 pb-4 border-b">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Weekly Nutrition</span>
          </div>

          <div className="flex items-center gap-4 text-sm">
            {/* Calories */}
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Avg Cal:</span>
              <Badge
                variant={weeklyNutritionDashboard.overall_progress.calories.color === 'green' ? 'default' : 'secondary'}
                className="font-mono"
              >
                {formatNutritionValue(weeklyNutritionDashboard.overall_progress.calories.actual, '', 0)}
              </Badge>
              <span className="text-xs text-muted-foreground">
                / {macroGoals.calories}
              </span>
            </div>

            {/* Protein */}
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Protein:</span>
              <Badge
                variant={weeklyNutritionDashboard.overall_progress.protein.color === 'green' ? 'default' : 'secondary'}
                className="font-mono"
              >
                {formatNutritionValue(weeklyNutritionDashboard.overall_progress.protein.actual, 'g', 0)}
              </Badge>
              <span className="text-xs text-muted-foreground">
                / {macroGoals.protein_g}g
              </span>
            </div>

            {/* Days on target */}
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">On Target:</span>
              <Badge
                variant={weeklyNutritionDashboard.days_on_target >= 5 ? 'default' : 'secondary'}
                className="font-mono"
              >
                {weeklyNutritionDashboard.days_on_target}/7 days
              </Badge>
            </div>

            {/* Link to full dashboard */}
            <Link href="/app/nutrition" className="text-xs text-primary hover:underline ml-2">
              View Details →
            </Link>
          </div>
        </div>
      )}

      {/* Main Summary Row */}
      <div className="flex items-center justify-center gap-6 flex-wrap">
        {/* Day Letters Progress */}
        <div className="flex items-center gap-1">
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                daysWithMeals.has(day)
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {DAY_LETTERS[day]}
            </div>
          ))}
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-border" />

        {/* Cook Breakdown */}
        <div className="text-sm text-muted-foreground">
          {hasCooksAssigned ? (
            <div className="flex items-center gap-3">
              {Object.entries(cookBreakdown.breakdown).map(([cook, count]) => (
                <span key={cook} className="flex items-center gap-1.5">
                  {cookColors[cook] && (
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: cookColors[cook] }}
                    />
                  )}
                  <span>
                    {cook}: {count}
                  </span>
                </span>
              ))}
              {cookBreakdown.unassigned > 0 && (
                <span className="text-muted-foreground/60">
                  +{cookBreakdown.unassigned} unassigned
                </span>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground/60">
              No cooks assigned
            </span>
          )}
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-border" />

        {/* Finalize Button */}
        <Button asChild>
          <Link href={`/app/finalize?week=${weekStartStr}`}>
            <span>Finalize</span>
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
