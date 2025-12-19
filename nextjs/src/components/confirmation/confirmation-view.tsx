"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { formatWeekRange, type DayOfWeek, type MealType } from "@/types/meal-plan";
import { WeekSchedule } from "@/components/finalize/week-schedule";
import { CheckoutShoppingList } from "@/components/finalize/checkout-shopping-list";
import { ConfirmationActions } from "./confirmation-actions";
import { Confetti } from "@/components/ui/confetti";
import { MacroDashboard } from "@/components/nutrition/macro-dashboard";
import type { PantryItem } from "@/types/shopping-list";
import type { WeeklyMacroDashboard } from "@/types/nutrition";

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
  meal_type: MealType | null;
  recipe: Recipe;
}

interface WeekPlan {
  meal_plan: Record<string, unknown>;
  assignments: Record<DayOfWeek, Assignment[]>;
}

interface ConfirmationViewProps {
  weekStart: Date;
  weekPlan: WeekPlan;
  cookColors: Record<string, string>;
  pantryItems: PantryItem[];
  nutritionDashboard?: WeeklyMacroDashboard | null;
  saveSuccessful: boolean;
  saveError?: string | null;
}

export function ConfirmationView({
  weekStart,
  weekPlan,
  cookColors,
  pantryItems,
  nutritionDashboard,
  saveSuccessful,
  saveError,
}: ConfirmationViewProps) {
  const weekStartStr = weekStart.toISOString().split("T")[0];

  // Get all assignments as flat array
  const allAssignments = Object.values(weekPlan.assignments).flat();

  // Calculate stats
  const totalMeals = allAssignments.length;

  return (
    <div className="flex flex-col gap-6 pb-24 md:pb-8">
      {/* Confetti celebration - only if save was successful */}
      {saveSuccessful && <Confetti active={true} duration={3000} pieces={80} />}

      {/* Warning if save failed */}
      {!saveSuccessful && saveError && (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-700 dark:text-amber-300">
                  Could not save to History
                </p>
                <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                  {saveError}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Header Card */}
      <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/50">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-3xl font-bold font-mono text-green-700 dark:text-green-300">
                  Plan Confirmed!
                </h2>
                <p className="text-muted-foreground mt-1">
                  {formatWeekRange(weekStart)}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Your meal plan has been saved to History. You can find all your
                  past plans there, or delete them anytime.
                </p>
              </div>
            </div>

            {/* Stats Badge */}
            <div className="flex flex-col items-start md:items-end gap-2">
              <Badge variant="secondary" className="text-sm">
                {totalMeals} meal{totalMeals !== 1 ? "s" : ""} planned
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nutrition Summary */}
      {nutritionDashboard && (
        <MacroDashboard dashboard={nutritionDashboard} variant="full" />
      )}

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
      <ConfirmationActions
        weekStart={weekStart}
        assignments={allAssignments}
        weekStartStr={weekStartStr}
      />
    </div>
  );
}
