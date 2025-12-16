"use client";

/**
 * Nutrition Tip Card / "What's Missing Today" Widget
 * Provides actionable insights about today's nutrition gaps
 * and suggests ways to meet macro goals
 */

import { useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Sparkles, ArrowRight, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DailyMacroSummary, MacroGoals, MacroProgress } from "@/types/nutrition";

interface NutritionTipCardProps {
  todaysSummary: DailyMacroSummary;
  className?: string;
}

type GapType = "under_protein" | "under_calories" | "over_carbs" | "over_calories" | "over_fat" | "all_good" | "no_meals";

interface TipConfig {
  icon: React.ReactNode;
  title: string;
  message: string;
  suggestions?: string[];
  filterLink?: string;
  filterLabel?: string;
  variant: "success" | "warning" | "info";
}

export function NutritionTipCard({ todaysSummary, className }: NutritionTipCardProps) {
  const tipConfig = useMemo(() => {
    return analyzeTodaysNutrition(todaysSummary);
  }, [todaysSummary]);

  const variantStyles = {
    success: "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/30",
    warning: "border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/30",
    info: "border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/30",
  };

  const iconStyles = {
    success: "text-green-600 dark:text-green-400",
    warning: "text-amber-600 dark:text-amber-400",
    info: "text-blue-600 dark:text-blue-400",
  };

  return (
    <Card className={cn("overflow-hidden", variantStyles[tipConfig.variant], className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className={iconStyles[tipConfig.variant]}>
            {tipConfig.icon}
          </span>
          {tipConfig.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {tipConfig.message}
        </p>

        {tipConfig.suggestions && tipConfig.suggestions.length > 0 && (
          <div className="space-y-1.5">
            {tipConfig.suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="flex items-start gap-2 text-sm"
              >
                <span className="mt-1 text-muted-foreground">•</span>
                <span>{suggestion}</span>
              </div>
            ))}
          </div>
        )}

        {tipConfig.filterLink && (
          <Button asChild variant="outline" size="sm" className="mt-2">
            <Link href={tipConfig.filterLink}>
              {tipConfig.filterLabel}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Analyze today's nutrition and generate appropriate tip
 */
function analyzeTodaysNutrition(summary: DailyMacroSummary): TipConfig {
  // No meals planned
  if (summary.meal_count === 0) {
    return {
      icon: <Target className="h-5 w-5" />,
      title: "No Meals Planned",
      message: "Add meals to your plan today to start tracking your nutrition.",
      variant: "info",
      filterLink: "/app/recipes",
      filterLabel: "Browse Recipes",
    };
  }

  const progress = summary.progress;
  const gaps = findNutritionGaps(progress, summary.goals);

  // All macros on target - celebrate!
  if (gaps.type === "all_good") {
    return {
      icon: <Sparkles className="h-5 w-5" />,
      title: "Looking Great!",
      message: "Today's meal plan hits all your macro goals. Nice planning!",
      suggestions: [
        "Tip: Save this meal combo for future weeks!",
      ],
      variant: "success",
    };
  }

  // Under on protein (most common for health-focused users)
  if (gaps.type === "under_protein") {
    const shortfall = Math.round(gaps.amount);
    return {
      icon: <Lightbulb className="h-5 w-5" />,
      title: "Today's Tip",
      message: `You're ${shortfall}g short on protein for today!`,
      suggestions: [
        "Add Greek yogurt as a snack (+15g)",
        "Swap your side for edamame (+11g)",
        "Add a hard-boiled egg (+6g)",
      ],
      variant: "warning",
      filterLink: "/app/recipes?nutrition=high_protein",
      filterLabel: "Browse High-Protein Recipes",
    };
  }

  // Under on calories (need more energy)
  if (gaps.type === "under_calories") {
    const shortfall = Math.round(gaps.amount);
    return {
      icon: <Lightbulb className="h-5 w-5" />,
      title: "Today's Tip",
      message: `You're ${shortfall} calories under your goal for today.`,
      suggestions: [
        "Add a healthy snack between meals",
        "Increase your portion sizes slightly",
        "Add nutrient-dense foods like nuts or avocado",
      ],
      variant: "info",
    };
  }

  // Over on carbs
  if (gaps.type === "over_carbs") {
    const excess = Math.round(gaps.amount);
    return {
      icon: <Lightbulb className="h-5 w-5" />,
      title: "Today's Tip",
      message: `Today's plan is ${excess}g over your carb goal.`,
      suggestions: [
        "Swap pasta for zucchini noodles (-35g)",
        "Use lettuce wraps instead of tortillas",
        "Skip the bread with dinner",
      ],
      variant: "warning",
      filterLink: "/app/recipes?nutrition=low_carb",
      filterLabel: "Browse Low-Carb Alternatives",
    };
  }

  // Over on calories
  if (gaps.type === "over_calories") {
    const excess = Math.round(gaps.amount);
    return {
      icon: <Lightbulb className="h-5 w-5" />,
      title: "Today's Tip",
      message: `Today's plan is ${excess} calories over your goal.`,
      suggestions: [
        "Consider a lighter lunch option",
        "Skip the dessert or have fresh fruit",
        "Reduce portion sizes slightly",
      ],
      variant: "warning",
      filterLink: "/app/recipes?nutrition=light",
      filterLabel: "Browse Light Recipes",
    };
  }

  // Over on fat
  if (gaps.type === "over_fat") {
    const excess = Math.round(gaps.amount);
    return {
      icon: <Lightbulb className="h-5 w-5" />,
      title: "Today's Tip",
      message: `Today's plan is ${excess}g over your fat goal.`,
      suggestions: [
        "Choose leaner protein sources",
        "Use cooking spray instead of oil",
        "Opt for baked instead of fried options",
      ],
      variant: "warning",
    };
  }

  // Default fallback
  return {
    icon: <Lightbulb className="h-5 w-5" />,
    title: "Nutrition Insight",
    message: "Keep tracking your meals to stay on top of your nutrition goals.",
    variant: "info",
  };
}

/**
 * Find the most significant nutrition gap
 */
function findNutritionGaps(
  progress: {
    calories: MacroProgress;
    protein: MacroProgress;
    carbs: MacroProgress;
    fat: MacroProgress;
  },
  goals: MacroGoals
): { type: GapType; amount: number } {
  // Check if all macros are on target (green)
  const allOnTarget =
    progress.calories.color === "green" &&
    progress.protein.color === "green" &&
    progress.carbs.color === "green" &&
    progress.fat.color === "green";

  if (allOnTarget) {
    return { type: "all_good", amount: 0 };
  }

  // Calculate actual gaps
  const gaps: Array<{ type: GapType; amount: number; priority: number }> = [];

  // Under protein is highest priority (health impact)
  if (progress.protein.status === "under" && progress.protein.actual !== null) {
    const shortfall = goals.protein_g - progress.protein.actual;
    if (shortfall > 10) {
      gaps.push({ type: "under_protein", amount: shortfall, priority: 1 });
    }
  }

  // Over carbs (common diet concern)
  if (progress.carbs.status === "over" && progress.carbs.actual !== null) {
    const excess = progress.carbs.actual - goals.carbs_g;
    if (excess > 20) {
      gaps.push({ type: "over_carbs", amount: excess, priority: 2 });
    }
  }

  // Over calories
  if (progress.calories.status === "over" && progress.calories.actual !== null) {
    const excess = progress.calories.actual - goals.calories;
    if (excess > 100) {
      gaps.push({ type: "over_calories", amount: excess, priority: 3 });
    }
  }

  // Under calories
  if (progress.calories.status === "under" && progress.calories.actual !== null) {
    const shortfall = goals.calories - progress.calories.actual;
    if (shortfall > 200) {
      gaps.push({ type: "under_calories", amount: shortfall, priority: 4 });
    }
  }

  // Over fat
  if (progress.fat.status === "over" && progress.fat.actual !== null) {
    const excess = progress.fat.actual - goals.fat_g;
    if (excess > 10) {
      gaps.push({ type: "over_fat", amount: excess, priority: 5 });
    }
  }

  // Return highest priority gap
  gaps.sort((a, b) => a.priority - b.priority);

  return gaps[0] || { type: "all_good", amount: 0 };
}

/**
 * Compact version of the tip card for smaller spaces
 */
export function NutritionTipCompact({
  todaysSummary,
  className,
}: NutritionTipCardProps) {
  const tipConfig = useMemo(() => {
    return analyzeTodaysNutrition(todaysSummary);
  }, [todaysSummary]);

  const iconStyles = {
    success: "text-green-600 dark:text-green-400",
    warning: "text-amber-600 dark:text-amber-400",
    info: "text-blue-600 dark:text-blue-400",
  };

  return (
    <div className={cn("flex items-center gap-3 rounded-lg border p-3", className)}>
      <span className={iconStyles[tipConfig.variant]}>
        {tipConfig.icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{tipConfig.title}</p>
        <p className="text-xs text-muted-foreground truncate">{tipConfig.message}</p>
      </div>
      {tipConfig.filterLink && (
        <Button asChild variant="ghost" size="sm">
          <Link href={tipConfig.filterLink}>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      )}
    </div>
  );
}
