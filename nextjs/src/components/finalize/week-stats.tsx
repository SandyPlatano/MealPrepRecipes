"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Clock, Users, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DayOfWeek } from "@/types/meal-plan";

interface Recipe {
  id: string;
  title: string;
  recipe_type: string;
  prep_time: string | null;
  cook_time: string | null;
}

interface Assignment {
  id: string;
  recipe_id: string;
  day_of_week: DayOfWeek;
  cook: string | null;
  recipe: Recipe;
}

interface WeekStatsProps {
  assignments: Assignment[];
  cookColors: Record<string, string>;
}

export function WeekStats({ assignments, cookColors }: WeekStatsProps) {
  // Helper to parse time string (e.g., "30 mins" -> 30)
  const parseTime = (timeStr: string | null): number => {
    if (!timeStr) return 0;
    const match = timeStr.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  // Helper to format total time
  const formatTime = (mins: number): string => {
    if (mins === 0) return "—";
    if (mins < 60) return `${mins} mins`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return remainingMins > 0
      ? `${hours}h ${remainingMins}m`
      : `${hours} hour${hours !== 1 ? "s" : ""}`;
  };

  // Calculate cook distribution
  const cookDistribution: Record<string, number> = {};
  const cookTimes: Record<string, number> = {};
  assignments.forEach((assignment) => {
    if (assignment.cook) {
      cookDistribution[assignment.cook] =
        (cookDistribution[assignment.cook] || 0) + 1;

      const prepTime = parseTime(assignment.recipe.prep_time);
      const cookTime = parseTime(assignment.recipe.cook_time);
      cookTimes[assignment.cook] =
        (cookTimes[assignment.cook] || 0) + prepTime + cookTime;
    }
  });

  const sortedCooks = Object.entries(cookDistribution).sort(
    (a, b) => b[1] - a[1]
  );

  // Calculate total time
  const totalTime = assignments.reduce((sum, assignment) => {
    const prepTime = parseTime(assignment.recipe.prep_time);
    const cookTime = parseTime(assignment.recipe.cook_time);
    return sum + prepTime + cookTime;
  }, 0);

  // Calculate meal type breakdown
  const mealTypes: Record<string, number> = {};
  assignments.forEach((assignment) => {
    const type = assignment.recipe.recipe_type || "Other";
    mealTypes[type] = (mealTypes[type] || 0) + 1;
  });

  const sortedMealTypes = Object.entries(mealTypes).sort((a, b) => b[1] - a[1]);

  const hasCooks = sortedCooks.length > 0;

  return (
    <div className={cn("grid gap-4", hasCooks && "md:grid-cols-2")}>
      {/* Cook Leaderboard */}
      {hasCooks && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Cook Assignments
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {sortedCooks.map(([cook, count], index) => {
              const cookColor = cookColors[cook];
              const cookTimeTotal = cookTimes[cook] || 0;
              const percentage = Math.round(
                (count / assignments.length) * 100
              );

              return (
                <div
                  key={cook}
                  className="flex items-center justify-between p-2 rounded-md bg-muted/30"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white",
                        !cookColor && "bg-muted-foreground"
                      )}
                      style={
                        cookColor
                          ? { backgroundColor: cookColor }
                          : undefined
                      }
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{cook}</p>
                      <p className="text-xs text-muted-foreground">
                        {count} meal{count !== 1 ? "s" : ""} • {formatTime(cookTimeTotal)}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {percentage}%
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Time & Meal Type Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Week Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {/* Total Time */}
          <div className="flex items-center justify-between p-3 rounded-md bg-muted/30">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total Cooking Time</span>
            </div>
            <span className="text-sm font-bold">{formatTime(totalTime)}</span>
          </div>

          {/* Total Meals */}
          <div className="flex items-center justify-between p-3 rounded-md bg-muted/30">
            <div className="flex items-center gap-2">
              <Utensils className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total Meals</span>
            </div>
            <span className="text-sm font-bold">{assignments.length}</span>
          </div>

          {/* Meal Types */}
          {sortedMealTypes.length > 0 && (
            <div className="flex flex-col gap-2 pt-2 border-t">
              <p className="text-xs font-medium text-muted-foreground">
                Meal Types
              </p>
              <div className="flex flex-wrap gap-1.5">
                {sortedMealTypes.map(([type, count]) => (
                  <Badge key={type} variant="outline" className="text-xs">
                    {type} ({count})
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

