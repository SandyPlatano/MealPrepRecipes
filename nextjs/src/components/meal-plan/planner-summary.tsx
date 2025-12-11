"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { MealAssignmentWithRecipe, DayOfWeek } from "@/types/meal-plan";
import { DAYS_OF_WEEK } from "@/types/meal-plan";

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
  const hasCooksAssigned = Object.keys(cookBreakdown.breakdown).length > 0;

  // Don't show if no meals planned
  if (totalMeals === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-6 py-6 flex-wrap">
      {/* Day Letters Progress */}
      <div className="flex items-center gap-1">
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
              daysWithMeals.has(day)
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {DAY_LETTERS[day]}
          </div>
        ))}
      </div>

      {/* Separator */}
      <div className="h-6 w-px bg-border" />

      {/* Cook Breakdown */}
      <div className="text-sm text-muted-foreground">
        {hasCooksAssigned ? (
          <div className="flex items-center gap-3">
            {Object.entries(cookBreakdown.breakdown).map(([cook, count]) => (
              <span key={cook} className="flex items-center gap-1.5">
                {cookColors[cook] && (
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: cookColors[cook] }}
                  />
                )}
                <span>
                  {cook}: {count}
                </span>
              </span>
            ))}
            {cookBreakdown.unassigned > 0 && (
              <span className="text-muted-foreground/60">
                +{cookBreakdown.unassigned} unassigned
              </span>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground/60">
            No cooks assigned
          </span>
        )}
      </div>

      {/* Separator */}
      <div className="h-6 w-px bg-border" />

      {/* Finalize Button */}
      <Button asChild>
        <Link href={`/app/finalize?week=${weekStartStr}`}>
          <span>Finalize</span>
          <ArrowRight className="h-4 w-4 ml-1.5" />
        </Link>
      </Button>
    </div>
  );
}
