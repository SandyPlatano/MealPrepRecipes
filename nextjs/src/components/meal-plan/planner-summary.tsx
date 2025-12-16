"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Activity,
  Users,
  CalendarDays,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { MealAssignmentWithRecipe, DayOfWeek } from "@/types/meal-plan";
import { DAYS_OF_WEEK } from "@/types/meal-plan";
import type {
  RecipeNutrition,
  WeeklyMacroDashboard,
  MacroGoals,
} from "@/types/nutrition";

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

// Default colors for cooks (fallback when no custom color assigned)
const DEFAULT_COOK_COLORS = [
  "#3b82f6", // blue
  "#a855f7", // purple
  "#10b981", // green
  "#f59e0b", // amber
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f43f5e", // rose
];

// Sub-component interfaces
interface CookBreakdown {
  breakdown: Record<string, number>;
  unassigned: number;
}

interface MacroProgress {
  actual: number | null;
  percentage: number;
  color: "green" | "yellow" | "red";
}

interface DayProgressCirclesProps {
  daysWithMeals: Set<DayOfWeek>;
}

interface CookBreakdownChipsProps {
  breakdown: CookBreakdown;
  cookColors: Record<string, string>;
}

interface WeekProgressSectionProps {
  daysWithMeals: Set<DayOfWeek>;
  cookBreakdown: CookBreakdown;
  cookColors: Record<string, string>;
  totalMeals: number;
}

interface CalculatedNutritionProgress {
  calories: MacroProgress;
  protein: MacroProgress;
  carbs: MacroProgress;
  fat: MacroProgress;
  recipesWithNutrition: number;
}

interface NutritionSummarySectionProps {
  dashboard?: WeeklyMacroDashboard | null;
  calculatedProgress?: CalculatedNutritionProgress | null;
  goals: MacroGoals;
}

interface MacroProgressCompactProps {
  label: string;
  actual: number | null;
  target: number;
  progress: MacroProgress;
  unit?: string;
}

interface RecipeRepetitionWarning {
  recipeId: string;
  recipeTitle: string;
  count: number;
  weeks: string[];
}

interface RepetitionWarningSectionProps {
  warnings: RecipeRepetitionWarning[];
}

interface PlannerSummaryProps {
  assignments: MealAssignmentWithRecipe[];
  weekStartStr?: string; // Optional - used for legacy calls
  cookColors?: Record<string, string>;
  nutritionEnabled?: boolean;
  nutritionData?: Map<string, RecipeNutrition> | null;
  weeklyNutritionDashboard?: WeeklyMacroDashboard | null;
  macroGoals?: MacroGoals | null;
  repetitionWarnings?: RecipeRepetitionWarning[];
}

// Sub-components

function DayProgressCircles({ daysWithMeals }: DayProgressCirclesProps) {
  // Get current day index (0 = Sunday, 1 = Monday, etc.)
  const today = new Date().getDay();

  return (
    <TooltipProvider>
      <div className="flex items-center justify-between gap-1">
        {DAYS_OF_WEEK.map((day, index) => {
          const hasPlanned = daysWithMeals.has(day);
          // Convert index (0=Monday) to day of week (1=Monday, 0=Sunday)
          const dayOfWeek = index === 6 ? 0 : index + 1;
          const isToday = today === dayOfWeek;

          return (
            <Tooltip key={day}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "relative w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center",
                    "text-xs font-mono font-bold transition-all duration-300 cursor-default",
                    hasPlanned
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted text-muted-foreground",
                    isToday && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                    hasPlanned && "hover:scale-110 hover:shadow-lg"
                  )}
                >
                  {DAY_LETTERS[day]}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {day}: {hasPlanned ? "Meals planned" : "No meals"}
                  {isToday && " (Today)"}
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}

function CookBreakdownChips({
  breakdown,
  cookColors,
}: CookBreakdownChipsProps) {
  const hasCooksAssigned = Object.keys(breakdown.breakdown).length > 0;
  const cookNames = Object.keys(breakdown.breakdown);

  // Get cook color with fallback to default colors
  const getCookColor = (cook: string): string => {
    if (cookColors[cook]) {
      return cookColors[cook];
    }
    // Fallback to default color based on index
    const index = cookNames.indexOf(cook);
    return DEFAULT_COOK_COLORS[index % DEFAULT_COOK_COLORS.length];
  };

  if (!hasCooksAssigned) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="h-4 w-4" />
        <span>No cooks assigned yet</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(breakdown.breakdown).map(([cook, count]) => {
        const cookColor = getCookColor(cook);
        return (
          <div
            key={cook}
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-md",
              "bg-secondary text-secondary-foreground text-sm font-medium",
              "transition-all hover:shadow-sm border border-input"
            )}
            style={{
              borderLeft: `3px solid ${cookColor}`,
            }}
          >
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: cookColor }}
            />
            <span className="truncate max-w-[100px]">{cook}</span>
            <Badge variant="outline" className="h-5 px-1.5 text-xs font-mono">
              {count}
            </Badge>
          </div>
        );
      })}
      {breakdown.unassigned > 0 && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted text-muted-foreground text-sm border border-input">
          <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/40 flex-shrink-0" />
          <span>Unassigned</span>
          <Badge variant="outline" className="h-5 px-1.5 text-xs font-mono">
            {breakdown.unassigned}
          </Badge>
        </div>
      )}
    </div>
  );
}

function WeekProgressSection({
  daysWithMeals,
  cookBreakdown,
  cookColors,
  totalMeals,
}: WeekProgressSectionProps) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-mono flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            Week at a Glance
          </CardTitle>
          <Badge variant="secondary" className="font-mono text-xs">
            {totalMeals} meal{totalMeals !== 1 ? "s" : ""}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Day Progress Circles */}
        <DayProgressCircles daysWithMeals={daysWithMeals} />

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Cook Breakdown */}
        <CookBreakdownChips breakdown={cookBreakdown} cookColors={cookColors} />
      </CardContent>
    </Card>
  );
}

function MacroProgressCompact({
  label,
  actual,
  target,
  progress,
  unit = "",
}: MacroProgressCompactProps) {
  const percentage = Math.min(progress.percentage, 100);

  const barColor = {
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
  }[progress.color];

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="font-mono text-muted-foreground tabular-nums">
          {actual !== null ? Math.round(actual) : "—"}
          <span className="text-xs">
            {" "}
            / {target}
            {unit}
          </span>
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full transition-all duration-500 ease-out", barColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function NutritionSummarySection({
  dashboard,
  calculatedProgress,
  goals,
}: NutritionSummarySectionProps) {
  // Prefer calculated progress (always fresh from client-side) over server dashboard
  const progress = calculatedProgress || dashboard?.overall_progress;

  if (!progress) return null;

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-mono">Nutrition for the Week</CardTitle>
          </div>
          <Link
            href="/app/nutrition"
            className="text-xs text-primary hover:underline font-medium"
          >
            View Details
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Compact macro progress bars */}
        <div className="space-y-3">
          <MacroProgressCompact
            label="Avg Calories"
            actual={progress.calories.actual}
            target={goals.calories}
            progress={progress.calories}
          />
          <MacroProgressCompact
            label="Avg Protein"
            actual={progress.protein.actual}
            target={goals.protein_g}
            progress={progress.protein}
            unit="g"
          />
          <MacroProgressCompact
            label="Avg Carbs"
            actual={progress.carbs.actual}
            target={goals.carbs_g}
            progress={progress.carbs}
            unit="g"
          />
          <MacroProgressCompact
            label="Avg Fat"
            actual={progress.fat.actual}
            target={goals.fat_g}
            progress={progress.fat}
            unit="g"
          />
        </div>
      </CardContent>
    </Card>
  );
}


function RepetitionWarningSection({ warnings }: RepetitionWarningSectionProps) {
  if (warnings.length === 0) return null;

  return (
    <Card className="overflow-hidden border-yellow-500/30 bg-yellow-500/5 transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-mono flex items-center gap-2 text-yellow-600 dark:text-yellow-500">
          <AlertTriangle className="h-4 w-4" />
          Recipe Diversity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground mb-3">
          These recipes appear frequently across your planned weeks:
        </p>
        {warnings.map((warning) => (
          <div
            key={warning.recipeId}
            className="flex items-center justify-between p-2 rounded-md bg-background/50 border border-border/50"
          >
            <Link
              href={`/app/recipes/${warning.recipeId}`}
              className="text-sm font-medium hover:underline truncate max-w-[60%]"
            >
              {warning.recipeTitle}
            </Link>
            <Badge variant="outline" className="text-yellow-600 border-yellow-500/50">
              {warning.count}x planned
            </Badge>
          </div>
        ))}
        <p className="text-xs text-muted-foreground mt-2">
          Consider adding variety to your meal plan for better nutrition balance.
        </p>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="animate-slide-up-fade py-8">
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <CalendarDays className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="font-mono font-semibold text-lg mb-2">
            No meals planned yet
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-4">
            Start adding recipes to your week by clicking on any day above, or
            browse your recipes to add them to your plan.
          </p>
          <Button variant="outline" asChild>
            <Link href="/app/recipes">Browse Recipes</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Main Component

export function PlannerSummary({
  assignments,
  cookColors = {},
  nutritionEnabled = false,
  nutritionData = null,
  weeklyNutritionDashboard = null,
  macroGoals = null,
  repetitionWarnings = [],
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

  // Calculate weekly nutrition from assignments + nutritionData (client-side)
  // This ensures immediate updates when recipes are added/removed
  const calculatedNutritionProgress = useMemo(() => {
    if (!nutritionData || nutritionData.size === 0 || !macroGoals) return null;

    // Sum nutrition for all assigned recipes
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let recipesWithNutrition = 0;

    assignments.forEach((assignment) => {
      const nutrition = nutritionData.get(assignment.recipe_id);
      if (nutrition) {
        totalCalories += nutrition.calories || 0;
        totalProtein += nutrition.protein_g || 0;
        totalCarbs += nutrition.carbs_g || 0;
        totalFat += nutrition.fat_g || 0;
        if (nutrition.calories || nutrition.protein_g) {
          recipesWithNutrition++;
        }
      }
    });

    // Calculate daily averages (total / 7 days)
    const avgCalories = totalCalories / 7;
    const avgProtein = totalProtein / 7;
    const avgCarbs = totalCarbs / 7;
    const avgFat = totalFat / 7;

    // Calculate progress for each macro
    const calcProgress = (actual: number, target: number): MacroProgress => {
      if (actual === 0 && recipesWithNutrition === 0) {
        return { actual: null, percentage: 0, color: "red" };
      }
      const percentage = (actual / target) * 100;
      const diff = Math.abs(percentage - 100);
      let color: "red" | "yellow" | "green";
      if (diff <= 10) {
        color = "green";
      } else if (percentage < 100) {
        color = diff <= 20 ? "yellow" : "red";
      } else {
        color = diff <= 20 ? "yellow" : "red";
      }
      return { actual, percentage, color };
    };

    return {
      calories: calcProgress(avgCalories, macroGoals.calories),
      protein: calcProgress(avgProtein, macroGoals.protein_g),
      carbs: calcProgress(avgCarbs, macroGoals.carbs_g),
      fat: calcProgress(avgFat, macroGoals.fat_g),
      recipesWithNutrition,
    };
  }, [assignments, nutritionData, macroGoals]);

  const totalMeals = assignments.length;

  // Show nutrition if enabled and we have either server data or client-calculated data
  const hasNutritionData = weeklyNutritionDashboard || calculatedNutritionProgress;
  const showNutrition = nutritionEnabled && macroGoals && hasNutritionData;

  // Show empty state if no meals planned
  if (totalMeals === 0) {
    return <EmptyState />;
  }

  return (
    <div className="animate-slide-up-fade space-y-4 py-6">
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
