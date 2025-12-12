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
  ArrowRight,
  Activity,
  CheckCircle2,
  Users,
  CalendarDays,
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

interface NutritionSummarySectionProps {
  dashboard: WeeklyMacroDashboard;
  goals: MacroGoals;
}

interface MacroProgressCompactProps {
  label: string;
  actual: number | null;
  target: number;
  progress: MacroProgress;
  unit?: string;
}

interface PlannerSummaryProps {
  assignments: MealAssignmentWithRecipe[];
  weekStartStr: string;
  cookColors?: Record<string, string>;
  nutritionEnabled?: boolean;
  nutritionData?: Map<string, RecipeNutrition> | null;
  weeklyNutritionDashboard?: WeeklyMacroDashboard | null;
  macroGoals?: MacroGoals | null;
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
      {Object.entries(breakdown.breakdown).map(([cook, count]) => (
        <div
          key={cook}
          className={cn(
            "inline-flex items-center gap-2 px-3 py-1.5 rounded-full",
            "bg-secondary text-secondary-foreground text-sm font-medium",
            "transition-all hover:shadow-sm"
          )}
        >
          {cookColors[cook] && (
            <span
              className="w-3 h-3 rounded-full ring-2 ring-white shadow-sm flex-shrink-0"
              style={{ backgroundColor: cookColors[cook] }}
            />
          )}
          <span className="truncate max-w-[100px]">{cook}</span>
          <Badge variant="outline" className="h-5 px-1.5 text-xs font-mono">
            {count}
          </Badge>
        </div>
      ))}
      {breakdown.unassigned > 0 && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-sm">
          <span className="w-3 h-3 rounded-full bg-muted-foreground/30 flex-shrink-0" />
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
  goals,
}: NutritionSummarySectionProps) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-mono">Nutrition</CardTitle>
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
            actual={dashboard.overall_progress.calories.actual}
            target={goals.calories}
            progress={dashboard.overall_progress.calories}
          />
          <MacroProgressCompact
            label="Avg Protein"
            actual={dashboard.overall_progress.protein.actual}
            target={goals.protein_g}
            progress={dashboard.overall_progress.protein}
            unit="g"
          />
        </div>

        {/* Days on target indicator */}
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm text-muted-foreground">Days on Target</span>
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-2 h-4 rounded-sm transition-colors",
                    i < dashboard.days_on_target ? "bg-green-500" : "bg-muted"
                  )}
                />
              ))}
            </div>
            <Badge
              variant={dashboard.days_on_target >= 5 ? "default" : "secondary"}
              className="font-mono"
            >
              {dashboard.days_on_target}/7
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FinalizeCTA({ weekStartStr }: { weekStartStr: string }) {
  return (
    <div className="flex items-center justify-center md:justify-end lg:items-center">
      <Button
        asChild
        size="lg"
        className={cn(
          "w-full md:w-auto",
          "flex items-center gap-2",
          "shadow-lg hover:shadow-xl hover:scale-105",
          "transition-all duration-300"
        )}
      >
        <Link href={`/app/finalize?week=${weekStartStr}`}>
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-semibold">Finalize Plan</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
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
  const showNutrition =
    nutritionEnabled && weeklyNutritionDashboard && macroGoals;

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
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]"
            : "grid-cols-1 md:grid-cols-[1fr_auto]"
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
        {showNutrition && (
          <NutritionSummarySection
            dashboard={weeklyNutritionDashboard}
            goals={macroGoals}
          />
        )}

        {/* Section 3: CTA */}
        <FinalizeCTA weekStartStr={weekStartStr} />
      </div>
    </div>
  );
}
