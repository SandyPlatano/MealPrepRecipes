"use client";

/**
 * Today Hero Card Component
 * Primary "what's remaining" display for today's nutrition
 * Features:
 * - Large calorie remaining number
 * - Compact macro pills for protein/carbs/fat
 * - Single overall progress bar
 * - Integrated Quick Add button placeholder
 */

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Check, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DailyMacroSummary, MacroProgress } from "@/types/nutrition";
import { EmptyState } from "@/components/ui/empty-state";

interface TodayHeroCardProps {
  todaySummary: DailyMacroSummary;
  onQuickAddClick?: () => void;
  className?: string;
}

export function TodayHeroCard({
  todaySummary,
  onQuickAddClick,
  className,
}: TodayHeroCardProps) {
  const { progress } = todaySummary;

  // Calculate overall day completion percentage (average of 4 macros)
  const overallPercentage = useMemo(() => {
    const total =
      progress.calories.percentage +
      progress.protein.percentage +
      progress.carbs.percentage +
      progress.fat.percentage;
    return Math.min(Math.round(total / 4), 100);
  }, [progress]);

  // Format today's date
  const formattedDate = useMemo(() => {
    const date = new Date(todaySummary.date);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }, [todaySummary.date]);

  // Check if all macros are achieved
  const allAchieved = useMemo(() => {
    return (
      progress.calories.status === "achieved" &&
      progress.protein.status === "achieved" &&
      progress.carbs.status === "achieved" &&
      progress.fat.status === "achieved"
    );
  }, [progress]);

  const hasNoMeals = todaySummary.meal_count === 0;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="pt-6">
        {/* Date Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-medium text-muted-foreground">
              {formattedDate}
            </h2>
            {todaySummary.meal_count > 0 && (
              <Badge variant="secondary" className="text-xs">
                {todaySummary.meal_count} meal{todaySummary.meal_count !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
          {allAchieved && (
            <Badge className="bg-brand-sage text-white">
              <Check className="mr-1 h-3 w-3" />
              All Goals Met
            </Badge>
          )}
        </div>

        {hasNoMeals ? (
          <TodayEmptyState onQuickAddClick={onQuickAddClick} />
        ) : (
          <>
            {/* Main Calorie Display */}
            <CalorieHero progress={progress.calories} />

            {/* Macro Pills */}
            <div className="mt-6 flex justify-center gap-3">
              <MacroPill progress={progress.protein} unit="g" />
              <MacroPill progress={progress.carbs} unit="g" />
              <MacroPill progress={progress.fat} unit="g" />
            </div>

            {/* Overall Progress Bar */}
            <div className="mt-6 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Daily Progress</span>
                <span className="tabular-nums">{overallPercentage}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full transition-all duration-500 ease-out",
                    allAchieved ? "bg-brand-sage" : "bg-brand-coral/70"
                  )}
                  style={{ width: `${overallPercentage}%` }}
                />
              </div>
            </div>

            {/* Quick Add Button */}
            {onQuickAddClick && (
              <div className="mt-6 flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onQuickAddClick}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Quick Add
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Main calorie remaining display
 * Shows large number with "remaining" or status text
 */
function CalorieHero({ progress }: { progress: MacroProgress }) {
  const isAchieved = progress.status === "achieved";
  const isExceeded = progress.status === "exceeded";

  // Calculate display value
  const displayValue = isExceeded
    ? Math.abs(progress.remaining > 0 ? 0 : Math.round((progress.actual ?? 0) - progress.target))
    : progress.remaining;

  const statusText = isAchieved
    ? "calories on target"
    : isExceeded
    ? "calories over"
    : "calories remaining";

  const statusColor = isAchieved
    ? "text-brand-sage"
    : isExceeded
    ? "text-brand-coral/80"
    : "text-foreground";

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        {/* Large number display */}
        <div className={cn("text-center", statusColor)}>
          <span className="text-5xl font-bold tabular-nums sm:text-6xl">
            {isAchieved ? (
              <Check className="mx-auto h-14 w-14 text-brand-sage" />
            ) : (
              displayValue
            )}
          </span>
        </div>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{statusText}</p>

      {/* Actual vs target subtext */}
      {progress.actual !== null && (
        <p className="mt-1 text-xs text-muted-foreground/70">
          {Math.round(progress.actual)} / {progress.target} kcal
        </p>
      )}
    </div>
  );
}

/**
 * Compact macro pill showing remaining amount
 */
function MacroPill({
  progress,
  unit,
}: {
  progress: MacroProgress;
  unit: string;
}) {
  const isAchieved = progress.status === "achieved";
  const isExceeded = progress.status === "exceeded";

  const displayValue = isExceeded
    ? `+${Math.round((progress.actual ?? 0) - progress.target)}`
    : isAchieved
    ? "✓"
    : progress.remaining;

  const bgColor = isAchieved
    ? "bg-brand-sage/10 border-brand-sage/30"
    : isExceeded
    ? "bg-brand-coral/10 border-brand-coral/30"
    : "bg-muted border-muted-foreground/20";

  const textColor = isAchieved
    ? "text-brand-sage"
    : isExceeded
    ? "text-brand-coral/80"
    : "text-foreground";

  return (
    <div
      className={cn(
        "flex min-w-[80px] flex-col items-center rounded-lg border px-4 py-2 transition-colors",
        bgColor
      )}
    >
      <span className={cn("text-lg font-semibold tabular-nums", textColor)}>
        {displayValue}
        {typeof displayValue === "number" && (
          <span className="text-sm font-normal">{unit}</span>
        )}
      </span>
      <span className="text-xs text-muted-foreground">{progress.name}</span>
    </div>
  );
}

/**
 * Empty state when no meals are planned
 */
function TodayEmptyState({ onQuickAddClick }: { onQuickAddClick?: () => void }) {
  return (
    <EmptyState
      icon={
        <div className="rounded-full bg-muted p-4">
          <TrendingUp className="h-8 w-8 text-muted-foreground" />
        </div>
      }
      title="No meals planned today"
      description="Add meals to your plan or log macros directly to start tracking."
      size="sm"
      action={
        onQuickAddClick ? (
          <Button onClick={onQuickAddClick} className="gap-2">
            <Plus className="h-4 w-4" />
            Quick Add Macros
          </Button>
        ) : undefined
      }
    />
  );
}

/**
 * Compact version for dashboard embedding
 */
export function TodayHeroCompact({
  todaySummary,
  className,
}: {
  todaySummary: DailyMacroSummary;
  className?: string;
}) {
  const { progress } = todaySummary;
  const hasNoMeals = todaySummary.meal_count === 0;

  if (hasNoMeals) {
    return (
      <div className={cn("rounded-lg border p-4 text-center", className)}>
        <p className="text-sm text-muted-foreground">No meals planned today</p>
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border p-4", className)}>
      <div className="flex items-center justify-between">
        {/* Calorie remaining */}
        <div>
          <span className="text-2xl font-bold tabular-nums">
            {progress.calories.remaining}
          </span>
          <span className="ml-1 text-sm text-muted-foreground">kcal left</span>
        </div>

        {/* Macro badges */}
        <div className="flex gap-2">
          <CompactMacroBadge progress={progress.protein} unit="g" />
          <CompactMacroBadge progress={progress.carbs} unit="g" />
          <CompactMacroBadge progress={progress.fat} unit="g" />
        </div>
      </div>
    </div>
  );
}

/**
 * Super compact macro badge for inline display
 */
function CompactMacroBadge({
  progress,
  unit,
}: {
  progress: MacroProgress;
  unit: string;
}) {
  const isAchieved = progress.status === "achieved";
  const label = progress.name.charAt(0); // P, C, F

  return (
    <Badge
      variant={isAchieved ? "default" : "secondary"}
      className={cn(
        "text-xs",
        isAchieved && "bg-brand-sage hover:bg-brand-sage"
      )}
    >
      {label}: {isAchieved ? "✓" : `${progress.remaining}${unit}`}
    </Badge>
  );
}
