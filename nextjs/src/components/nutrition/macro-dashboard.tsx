"use client";

/**
 * Macro Dashboard Component
 * Weekly nutrition overview with daily breakdown and progress tracking
 */

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MacroProgressRing, MacroProgressBar } from "./macro-progress-ring";
import type { WeeklyMacroDashboard, DailyMacroSummary } from "@/types/nutrition";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react";

interface MacroDashboardProps {
  dashboard: WeeklyMacroDashboard;
  variant?: "full" | "compact";
  className?: string;
}

export function MacroDashboard({
  dashboard,
  variant = "full",
  className,
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
