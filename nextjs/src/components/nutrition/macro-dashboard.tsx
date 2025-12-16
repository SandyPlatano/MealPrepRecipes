"use client";

/**
 * Macro Dashboard Component
 * Weekly nutrition overview with daily breakdown and progress tracking
 * Includes weekly progress indicator (dots) and streak counter
 */

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MacroProgressRing, MacroProgressBar } from "./macro-progress-ring";
import type { WeeklyMacroDashboard, DailyMacroSummary, MacroGoals } from "@/types/nutrition";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, AlertCircle, Flame } from "lucide-react";

interface MacroDashboardProps {
  dashboard: WeeklyMacroDashboard;
  variant?: "full" | "compact";
  className?: string;
  currentStreak?: number;
}

export function MacroDashboard({
  dashboard,
  variant = "full",
  className,
  currentStreak = 0,
}: MacroDashboardProps) {
  // Calculate average data completeness
  const avgCompleteness = useMemo(() => {
    const total = dashboard.days.reduce(
      (sum, day) => sum + day.data_completeness_pct,
      0
    );
    return Math.round(total / dashboard.days.length);
  }, [dashboard.days]);

  if (variant === "compact") {
    return <MacroDashboardCompact dashboard={dashboard} className={className} />;
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Data completeness alert */}
      {avgCompleteness < 70 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Only {avgCompleteness}% of your meals have nutrition data. For more accurate
            tracking, add nutrition info to your recipes.
          </AlertDescription>
        </Alert>
      )}

      {/* Weekly Progress Indicator + Streak */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <WeeklyProgressIndicator days={dashboard.days} />
        {currentStreak > 0 && <StreakCounter streak={currentStreak} />}
      </div>

      {/* Overall Weekly Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Weekly Overview</CardTitle>
            <Badge variant="secondary">
              {dashboard.days_on_target} of 7 days on target
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <MacroProgressRing
              progress={dashboard.overall_progress.calories}
              size="lg"
              showLabel
              showPercentage={false}
            />
            <MacroProgressRing
              progress={dashboard.overall_progress.protein}
              size="lg"
              showLabel
              showPercentage={false}
            />
            <MacroProgressRing
              progress={dashboard.overall_progress.carbs}
              size="lg"
              showLabel
              showPercentage={false}
            />
            <MacroProgressRing
              progress={dashboard.overall_progress.fat}
              size="lg"
              showLabel
              showPercentage={false}
            />
          </div>

          {/* Weekly totals */}
          <div className="mt-6 grid grid-cols-2 gap-4 border-t pt-4 sm:grid-cols-4">
            <WeeklyStat
              label="Total Calories"
              value={dashboard.weekly_totals.calories}
              unit="kcal"
            />
            <WeeklyStat
              label="Total Protein"
              value={dashboard.weekly_totals.protein_g}
              unit="g"
            />
            <WeeklyStat
              label="Total Carbs"
              value={dashboard.weekly_totals.carbs_g}
              unit="g"
            />
            <WeeklyStat
              label="Total Fat"
              value={dashboard.weekly_totals.fat_g}
              unit="g"
            />
          </div>
        </CardContent>
      </Card>

      {/* Daily Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboard.days.map((day) => (
              <DayRow key={day.date} day={day} goals={dashboard.goals} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Compact version for embedding in other pages
 */
function MacroDashboardCompact({
  dashboard,
  className,
}: {
  dashboard: WeeklyMacroDashboard;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Weekly Nutrition</CardTitle>
          <Badge variant="outline" className="text-xs">
            {dashboard.days_on_target}/7 on target
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Compact progress bars */}
        <MacroProgressBar progress={dashboard.overall_progress.calories} showValue={false} />
        <MacroProgressBar progress={dashboard.overall_progress.protein} showValue={false} />
        <MacroProgressBar progress={dashboard.overall_progress.carbs} showValue={false} />
        <MacroProgressBar progress={dashboard.overall_progress.fat} showValue={false} />
      </CardContent>
    </Card>
  );
}

/**
 * Single day row in the breakdown
 */
function DayRow({
  day,
  goals
}: {
  day: DailyMacroSummary;
  goals: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  };
}) {
  const isToday = new Date(day.date).toDateString() === new Date().toDateString();

  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        isToday && "border-primary bg-primary/5"
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{day.day_of_week}</span>
          {isToday && (
            <Badge variant="default" className="text-xs">
              Today
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {day.meal_count > 0 ? (
            <>
              <span>{day.meal_count} meals</span>
              {day.data_completeness_pct < 100 && (
                <Badge variant="outline" className="text-xs">
                  {day.data_completeness_pct}% data
                </Badge>
              )}
            </>
          ) : (
            <span className="italic">No meals planned</span>
          )}
        </div>
      </div>

      {day.meal_count > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MacroStat
            label="Calories"
            actual={day.nutrition.calories}
            target={goals.calories}
            progress={day.progress.calories}
          />
          <MacroStat
            label="Protein"
            actual={day.nutrition.protein_g}
            target={goals.protein_g}
            progress={day.progress.protein}
            unit="g"
          />
          <MacroStat
            label="Carbs"
            actual={day.nutrition.carbs_g}
            target={goals.carbs_g}
            progress={day.progress.carbs}
            unit="g"
          />
          <MacroStat
            label="Fat"
            actual={day.nutrition.fat_g}
            target={goals.fat_g}
            progress={day.progress.fat}
            unit="g"
          />
        </div>
      ) : (
        <div className="py-4 text-center text-sm text-muted-foreground">
          Add meals to your plan to track nutrition for this day
        </div>
      )}
    </div>
  );
}

/**
 * Single macro stat display
 */
interface MacroStatProps {
  label: string;
  actual: number | null | undefined;
  target: number;
  progress: {
    percentage: number;
    color: "green" | "yellow" | "red";
  };
  unit?: string;
}

function MacroStat({ label, actual, target, progress, unit = "kcal" }: MacroStatProps) {
  const trend =
    actual && actual > target * 1.1
      ? "over"
      : actual && actual < target * 0.9
      ? "under"
      : "on-target";

  const TrendIcon =
    trend === "over" ? TrendingUp : trend === "under" ? TrendingDown : Minus;

  const trendColor =
    trend === "over"
      ? "text-red-500"
      : trend === "under"
      ? "text-yellow-500"
      : "text-green-500";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <TrendIcon className={cn("h-3 w-3", trendColor)} />
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-bold tabular-nums">
          {actual !== null && actual !== undefined ? Math.round(actual) : "—"}
        </span>
        <span className="text-xs text-muted-foreground">
          / {target}
          {unit}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full transition-all",
            progress.color === "green" && "bg-green-500",
            progress.color === "yellow" && "bg-yellow-500",
            progress.color === "red" && "bg-red-500"
          )}
          style={{ width: `${Math.min(progress.percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Weekly stat display
 */
function WeeklyStat({
  label,
  value,
  unit,
}: {
  label: string;
  value: number | null | undefined;
  unit: string;
}) {
  return (
    <div className="space-y-1">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold tabular-nums">
        {value !== null && value !== undefined ? Math.round(value).toLocaleString() : "—"}
      </div>
      <div className="text-xs text-muted-foreground">{unit}</div>
    </div>
  );
}

// =====================================================
// WEEKLY PROGRESS INDICATOR
// =====================================================

type DayStatus = "all-target" | "most-target" | "few-target" | "future" | "no-meals";

/**
 * Calculate how many macros are on target for a day
 * Returns 0-4 based on calories, protein, carbs, fat being within ±10%
 */
function countMacrosOnTarget(day: DailyMacroSummary): number {
  if (day.meal_count === 0) return 0;

  let count = 0;
  const progress = day.progress;

  if (progress.calories.color === "green") count++;
  if (progress.protein.color === "green") count++;
  if (progress.carbs.color === "green") count++;
  if (progress.fat.color === "green") count++;

  return count;
}

/**
 * Determine the status of a day for the progress indicator
 */
function getDayStatus(day: DailyMacroSummary): DayStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayDate = new Date(day.date);
  dayDate.setHours(0, 0, 0, 0);

  // Future day
  if (dayDate > today) {
    return "future";
  }

  // No meals planned
  if (day.meal_count === 0) {
    return "no-meals";
  }

  const onTarget = countMacrosOnTarget(day);

  if (onTarget === 4) return "all-target";
  if (onTarget === 3) return "most-target";
  return "few-target";
}

/**
 * Weekly Progress Indicator
 * Clean dot-based visualization showing daily macro adherence
 * ● All on target | ◐ 3 of 4 | ○ 2 or fewer | · Future/No meals
 */
function WeeklyProgressIndicator({ days }: { days: DailyMacroSummary[] }) {
  const daysOnTarget = days.filter(
    (day) => getDayStatus(day) === "all-target" || getDayStatus(day) === "most-target"
  ).length;

  const trackedDays = days.filter(
    (day) => getDayStatus(day) !== "future" && getDayStatus(day) !== "no-meals"
  ).length;

  return (
    <div className="space-y-2">
      <div className="text-sm text-muted-foreground">
        This Week:{" "}
        <span className="font-medium text-foreground">
          {daysOnTarget} of {trackedDays} days on target
        </span>
      </div>
      <div className="flex items-center gap-1">
        {days.map((day) => {
          const status = getDayStatus(day);
          return (
            <TooltipProvider key={day.date}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[10px] text-muted-foreground">
                      {day.day_of_week.slice(0, 3)}
                    </span>
                    <DayDot status={status} />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <DayTooltipContent day={day} status={status} />
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Individual day dot in the progress indicator
 */
function DayDot({ status }: { status: DayStatus }) {
  switch (status) {
    case "all-target":
      // Filled circle - brand coral
      return (
        <div className="h-4 w-4 rounded-full bg-brand-coral" />
      );
    case "most-target":
      // Half-filled circle
      return (
        <div className="relative h-4 w-4 rounded-full border-2 border-brand-coral overflow-hidden">
          <div className="absolute inset-0 w-1/2 bg-brand-coral" />
        </div>
      );
    case "few-target":
      // Hollow circle
      return (
        <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/50" />
      );
    case "future":
    case "no-meals":
    default:
      // Dim dot
      return (
        <div className="h-4 w-4 rounded-full bg-muted" />
      );
  }
}

/**
 * Tooltip content for day dots
 */
function DayTooltipContent({
  day,
  status,
}: {
  day: DailyMacroSummary;
  status: DayStatus;
}) {
  const macrosOnTarget = countMacrosOnTarget(day);

  if (status === "future") {
    return <p className="text-sm">Not yet tracked</p>;
  }

  if (status === "no-meals") {
    return <p className="text-sm">No meals planned</p>;
  }

  return (
    <div className="space-y-1 text-sm">
      <p className="font-medium">{day.day_of_week}</p>
      <p className="text-muted-foreground">
        {macrosOnTarget} of 4 macros on target
      </p>
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs">
        <MacroStatusLine
          label="Calories"
          isOnTarget={day.progress.calories.color === "green"}
        />
        <MacroStatusLine
          label="Protein"
          isOnTarget={day.progress.protein.color === "green"}
        />
        <MacroStatusLine
          label="Carbs"
          isOnTarget={day.progress.carbs.color === "green"}
        />
        <MacroStatusLine
          label="Fat"
          isOnTarget={day.progress.fat.color === "green"}
        />
      </div>
    </div>
  );
}

/**
 * Single macro status line in tooltip
 */
function MacroStatusLine({
  label,
  isOnTarget,
}: {
  label: string;
  isOnTarget: boolean;
}) {
  return (
    <span className={cn(isOnTarget ? "text-green-600" : "text-muted-foreground")}>
      {isOnTarget ? "✓" : "○"} {label}
    </span>
  );
}

// =====================================================
// STREAK COUNTER
// =====================================================

/**
 * Streak Counter Component
 * Shows consecutive days hitting nutrition goals
 */
function StreakCounter({ streak }: { streak: number }) {
  const getMessage = () => {
    if (streak >= 14) return "You're unstoppable!";
    if (streak >= 7) return "Perfect week achieved!";
    if (streak >= 5) return "Keep it up!";
    if (streak >= 3) return "Nice momentum!";
    return "Building your streak!";
  };

  const isMilestone = streak === 7 || streak === 14 || streak === 21 || streak === 30;

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border px-3 py-2",
        isMilestone
          ? "border-brand-coral/50 bg-brand-coral/10"
          : "border-border bg-muted/30"
      )}
    >
      <Flame
        className={cn(
          "h-5 w-5",
          streak >= 7 ? "text-brand-coral" : "text-orange-500"
        )}
      />
      <div>
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold tabular-nums">{streak}</span>
          <span className="text-sm text-muted-foreground">Day Streak</span>
        </div>
        <p className="text-xs text-muted-foreground">{getMessage()}</p>
      </div>
    </div>
  );
}
