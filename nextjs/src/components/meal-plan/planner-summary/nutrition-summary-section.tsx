"use client";

import { useState } from "react";
import Link from "next/link";
import { Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MacroProgressCompact } from "./macro-progress-compact";
import type { NutritionSummarySectionProps } from "./types";

export function NutritionSummarySection({
  dashboard,
  calculatedProgress,
  goals,
}: NutritionSummarySectionProps) {
  const [viewMode, setViewMode] = useState<"daily" | "weekly">("daily");

  // Use calculated progress if available, otherwise fall back to dashboard
  const hasCalculatedProgress = calculatedProgress !== null && calculatedProgress !== undefined;
  const hasDashboard = dashboard?.overall_progress !== null && dashboard?.overall_progress !== undefined;

  if (!hasCalculatedProgress && !hasDashboard) return null;

  // Get the appropriate progress based on view mode
  const progress = hasCalculatedProgress
    ? (viewMode === "daily" ? calculatedProgress.daily : calculatedProgress.weekly)
    : dashboard?.overall_progress;

  if (!progress) return null;

  // Calculate targets based on view mode
  const targets = viewMode === "daily"
    ? {
        calories: goals.calories,
        protein: goals.protein_g,
        carbs: goals.carbs_g,
        fat: goals.fat_g,
      }
    : {
        calories: goals.calories * 7,
        protein: goals.protein_g * 7,
        carbs: goals.carbs_g * 7,
        fat: goals.fat_g * 7,
      };

  // Labels based on view mode
  const labels = viewMode === "daily"
    ? { calories: "Calories/Day", protein: "Protein/Day", carbs: "Carbs/Day", fat: "Fat/Day" }
    : { calories: "Weekly Calories", protein: "Weekly Protein", carbs: "Weekly Carbs", fat: "Weekly Fat" };

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-mono">Nutrition</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {/* Daily/Weekly Toggle */}
            <div className="flex rounded-md border border-input bg-muted p-0.5">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-6 px-2 text-xs font-medium rounded-sm",
                  viewMode === "daily"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setViewMode("daily")}
              >
                Daily
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-6 px-2 text-xs font-medium rounded-sm",
                  viewMode === "weekly"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setViewMode("weekly")}
              >
                Weekly
              </Button>
            </div>
            <Link
              href="/app/nutrition"
              className="text-xs text-primary hover:underline font-medium"
            >
              Details
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Compact macro progress bars */}
        <div className="flex flex-col gap-3">
          <MacroProgressCompact
            label={labels.calories}
            actual={progress.calories.actual}
            target={targets.calories}
            progress={progress.calories}
          />
          <MacroProgressCompact
            label={labels.protein}
            actual={progress.protein.actual}
            target={targets.protein}
            progress={progress.protein}
            unit="g"
          />
          <MacroProgressCompact
            label={labels.carbs}
            actual={progress.carbs.actual}
            target={targets.carbs}
            progress={progress.carbs}
            unit="g"
          />
          <MacroProgressCompact
            label={labels.fat}
            actual={progress.fat.actual}
            target={targets.fat}
            progress={progress.fat}
            unit="g"
          />
        </div>
      </CardContent>
    </Card>
  );
}
