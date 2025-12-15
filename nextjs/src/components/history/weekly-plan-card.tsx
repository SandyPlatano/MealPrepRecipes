"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ChevronDown, ChevronUp } from "lucide-react";
import { WeeklyPlanActions } from "./weekly-plan-actions";

interface MealAssignment {
  id: string;
  day_of_week: string;
  cook: string | null;
  recipe: {
    id: string;
    title: string;
    recipe_type: string;
  };
}

interface WeeklyPlan {
  id: string;
  week_start: string;
  sent_at: string;
  meal_assignments: MealAssignment[];
}

interface WeeklyPlanCardProps {
  plan: WeeklyPlan;
}

export function WeeklyPlanCard({ plan }: WeeklyPlanCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const weekStart = plan.week_start;
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const assignments = plan.meal_assignments || [];
  const visibleAssignments = isExpanded ? assignments : assignments.slice(0, 3);
  const hiddenCount = assignments.length - 3;
  const hasMore = hiddenCount > 0;

  // Format week range for display
  const weekRange = `${format(new Date(weekStart), "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">Week of {weekRange}</CardTitle>
            <CardDescription className="mt-1">
              Saved on {format(new Date(plan.sent_at), "MMM d, yyyy")}
              <span className="ml-2 text-muted-foreground">
                ({assignments.length} meal{assignments.length !== 1 ? "s" : ""})
              </span>
            </CardDescription>
          </div>
          <WeeklyPlanActions plan={plan} weekRange={weekRange} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {visibleAssignments.map((assignment) => (
            <div
              key={assignment.id}
              className="flex items-center justify-between text-sm border-b pb-2 last:border-b-0"
            >
              <span className="font-medium truncate flex-1 mr-2">
                {assignment.recipe?.title || "Unknown Recipe"}
              </span>
              <div className="flex gap-2 flex-shrink-0">
                {assignment.cook && (
                  <Badge variant="outline" className="text-xs">
                    {assignment.cook}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  {assignment.day_of_week.slice(0, 3)}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {/* Expand/Collapse button */}
        {hasMore && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-3 text-muted-foreground hover:text-foreground"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                View all {assignments.length} meals
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
