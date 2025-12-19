"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ChefHat } from "lucide-react";
import { DAYS_OF_WEEK, type DayOfWeek } from "@/types/meal-plan";
import { cn } from "@/lib/utils";

interface Recipe {
  id: string;
  title: string;
  recipe_type: string;
  prep_time: string | null;
  cook_time: string | null;
  ingredients: string[];
  instructions: string[];
}

interface Assignment {
  id: string;
  recipe_id: string;
  day_of_week: DayOfWeek;
  cook: string | null;
  recipe: Recipe;
}

interface WeekScheduleProps {
  weekStart: Date;
  assignments: Record<DayOfWeek, Assignment[]>;
  cookColors: Record<string, string>;
}

export function WeekSchedule({
  weekStart,
  assignments,
  cookColors,
}: WeekScheduleProps) {
  // Helper to parse time string (e.g., "30 mins" -> 30)
  const parseTime = (timeStr: string | null): number => {
    if (!timeStr) return 0;
    const match = timeStr.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  // Helper to format total time
  const formatTime = (mins: number): string => {
    if (mins === 0) return "—";
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChefHat className="h-5 w-5" />
          Week Schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {DAYS_OF_WEEK.map((day, index) => {
          const dayDate = new Date(weekStart);
          dayDate.setDate(dayDate.getDate() + index);
          const dayAssignments = assignments[day] || [];

          if (dayAssignments.length === 0) {
            return null; // Don't show days with no meals
          }

          return (
            <div
              key={day}
              className="border rounded-lg p-4 flex flex-col gap-3 bg-muted/30"
            >
              {/* Day Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-base">{day}</h3>
                  <p className="text-sm text-muted-foreground">
                    {dayDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {dayAssignments.length} meal{dayAssignments.length !== 1 ? "s" : ""}
                </Badge>
              </div>

              {/* Meals for this day */}
              <div className="flex flex-col gap-2">
                {dayAssignments.map((assignment) => {
                  const prepTime = parseTime(assignment.recipe.prep_time);
                  const cookTime = parseTime(assignment.recipe.cook_time);
                  const totalTime = prepTime + cookTime;
                  const cookColor = assignment.cook
                    ? cookColors[assignment.cook]
                    : undefined;

                  return (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between p-3 bg-background rounded-md border"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">
                          {assignment.recipe.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          {assignment.cook && (
                            <div className="flex items-center gap-1.5">
                              <div
                                className={cn(
                                  "w-3 h-3 rounded-full",
                                  cookColor ? "" : "bg-muted-foreground"
                                )}
                                style={
                                  cookColor
                                    ? { backgroundColor: cookColor }
                                    : undefined
                                }
                              />
                              <span>{assignment.cook}</span>
                            </div>
                          )}
                          {totalTime > 0 && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatTime(totalTime)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs ml-2">
                        {assignment.recipe.recipe_type}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

