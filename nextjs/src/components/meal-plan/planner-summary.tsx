"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { MealAssignmentWithRecipe, DayOfWeek } from "@/types/meal-plan";
import { DAYS_OF_WEEK } from "@/types/meal-plan";

interface PlannerSummaryProps {
  assignments: MealAssignmentWithRecipe[];
  weekStartStr: string;
  cookColors?: Record<string, string>;
}

export function PlannerSummary({
  assignments,
  weekStartStr,
  cookColors = {},
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
  const daysPlanned = daysWithMeals.size;
  const hasCooksAssigned = Object.keys(cookBreakdown.breakdown).length > 0;

  // Don't show if no meals planned
  if (totalMeals === 0) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-4 py-8">
      {/* Days Progress */}
      <div className="flex items-center gap-3">
        <div className="flex gap-1.5">
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                daysWithMeals.has(day)
                  ? "bg-primary"
                  : "bg-muted-foreground/20"
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-muted-foreground">
          {daysPlanned} of 7 days planned
          {daysPlanned === 7 && (
            <span className="ml-1 text-primary">✓</span>
          )}
        </span>
      </div>

      {/* Cook Breakdown */}
      <div className="text-sm text-muted-foreground">
        {hasCooksAssigned ? (
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            {Object.entries(cookBreakdown.breakdown).map(([cook, count], index) => (
              <span key={cook} className="flex items-center gap-1.5">
                {index > 0 && <span className="text-muted-foreground/40">·</span>}
                {cookColors[cook] && (
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: cookColors[cook] }}
                  />
                )}
                <span>
                  {cook}: {count} {count === 1 ? "meal" : "meals"}
                </span>
              </span>
            ))}
            {cookBreakdown.unassigned > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="text-muted-foreground/40">·</span>
                <span className="text-muted-foreground/60">
                  {cookBreakdown.unassigned} unassigned
                </span>
              </span>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground/60">
            No cooks assigned yet
          </span>
        )}
      </div>

      {/* Finalize Button */}
      <Button asChild size="lg" className="mt-2">
        <Link href={`/app/finalize?week=${weekStartStr}`}>
          <span>Finalize Your Plan</span>
          <ArrowRight className="h-4 w-4 ml-2" />
        </Link>
      </Button>
    </div>
  );
}
