"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { formatWeekRange, type DayOfWeek } from "@/types/meal-plan";
import { WeekSchedule } from "./week-schedule";
import { CheckoutShoppingList } from "./checkout-shopping-list";
import { WeekStats } from "./week-stats";
import { FinalizeActions } from "./finalize-actions";
import type { PantryItem } from "@/types/shopping-list";

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

interface WeekPlan {
  meal_plan: Record<string, unknown>;
  assignments: Record<DayOfWeek, Assignment[]>;
}

interface FinalizeViewProps {
  weekStart: Date;
  weekPlan: WeekPlan;
  cookNames: string[];
  cookColors: Record<string, string>;
  pantryItems: PantryItem[];
}

export function FinalizeView({
  weekStart,
  weekPlan,
  cookColors,
  pantryItems,
}: FinalizeViewProps) {
  const weekStartStr = weekStart.toISOString().split("T")[0];

  // Get all assignments as flat array
  const allAssignments = Object.values(weekPlan.assignments).flat();

  // Calculate stats
  const totalMeals = allAssignments.length;
  const assignedWithCook = allAssignments.filter((a) => a.cook).length;
  const allCooksAssigned = totalMeals === assignedWithCook;

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* Header Card with Week Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold font-mono">
                {formatWeekRange(weekStart)}
              </h2>
              <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                <span>
                  {totalMeals} meal{totalMeals !== 1 ? "s" : ""} planned
                </span>
                <span>•</span>
                <span>
                  {assignedWithCook} cook{assignedWithCook !== 1 ? "s" : ""}{" "}
                  assigned
                </span>
              </div>
            </div>

            {/* Status Badge */}
            {allCooksAssigned ? (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Ready to send!</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">
                  {totalMeals - assignedWithCook} meal
                  {totalMeals - assignedWithCook !== 1 ? "s" : ""} need a cook
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Section */}
      <WeekStats assignments={allAssignments} cookColors={cookColors} />

      {/* Schedule Section */}
      <WeekSchedule
        weekStart={weekStart}
        assignments={weekPlan.assignments}
        cookColors={cookColors}
      />

      {/* Shopping List Section */}
      <CheckoutShoppingList
        assignments={allAssignments}
        pantryItems={pantryItems}
      />

      {/* Actions - Sticky at bottom */}
      <FinalizeActions
        weekStart={weekStart}
        assignments={allAssignments}
        weekStartStr={weekStartStr}
      />
    </div>
  );
}

