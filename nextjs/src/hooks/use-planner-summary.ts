import { useMemo } from "react";
import type { MealAssignmentWithRecipe, DayOfWeek } from "@/types/meal-plan";
import type { RecipeNutrition, MacroGoals } from "@/types/nutrition";

interface LocalMacroProgress {
  actual: number | null;
  percentage: number;
  color: "sage" | "muted" | "coral";
}

interface CookBreakdown {
  breakdown: Record<string, number>;
  unassigned: number;
}

interface CalculatedNutritionProgress {
  // Daily averages (total / 7)
  daily: {
    calories: LocalMacroProgress;
    protein: LocalMacroProgress;
    carbs: LocalMacroProgress;
    fat: LocalMacroProgress;
  };
  // Weekly totals
  weekly: {
    calories: LocalMacroProgress;
    protein: LocalMacroProgress;
    carbs: LocalMacroProgress;
    fat: LocalMacroProgress;
  };
  // Raw totals for display
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  recipesWithNutrition: number;
}

interface UsePlannerSummaryParams {
  assignments: MealAssignmentWithRecipe[];
  nutritionData?: Map<string, RecipeNutrition> | null;
  macroGoals?: MacroGoals | null;
}

interface UsePlannerSummaryReturn {
  daysWithMeals: Set<DayOfWeek>;
  cookBreakdown: CookBreakdown;
  calculatedNutritionProgress: CalculatedNutritionProgress | null;
  totalMeals: number;
}

export function usePlannerSummary({
  assignments,
  nutritionData = null,
  macroGoals = null,
}: UsePlannerSummaryParams): UsePlannerSummaryReturn {
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

  // Calculate weekly nutrition from assignments + nutritionData (client-side)
  // This ensures immediate updates when recipes are added/removed
  const calculatedNutritionProgress = useMemo(() => {
    if (!nutritionData || nutritionData.size === 0 || !macroGoals) return null;

    // Sum nutrition for all assigned recipes
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let recipesWithNutrition = 0;

    assignments.forEach((assignment) => {
      const nutrition = nutritionData.get(assignment.recipe_id);
      if (nutrition) {
        totalCalories += nutrition.calories || 0;
        totalProtein += nutrition.protein_g || 0;
        totalCarbs += nutrition.carbs_g || 0;
        totalFat += nutrition.fat_g || 0;
        if (nutrition.calories || nutrition.protein_g) {
          recipesWithNutrition++;
        }
      }
    });

    // Calculate daily averages (total / 7 days)
    const avgCalories = totalCalories / 7;
    const avgProtein = totalProtein / 7;
    const avgCarbs = totalCarbs / 7;
    const avgFat = totalFat / 7;

    // Weekly goals (daily goals * 7)
    const weeklyCaloriesGoal = macroGoals.calories * 7;
    const weeklyProteinGoal = macroGoals.protein_g * 7;
    const weeklyCarbsGoal = macroGoals.carbs_g * 7;
    const weeklyFatGoal = macroGoals.fat_g * 7;

    // Calculate progress for each macro using soft brand colors
    const calcProgress = (actual: number, target: number): LocalMacroProgress => {
      if (actual === 0 && recipesWithNutrition === 0) {
        return { actual: null, percentage: 0, color: "muted" };
      }
      const percentage = (actual / target) * 100;

      // Non-judgmental color scheme:
      // - sage: achieved (within ±10%)
      // - coral: exceeded (>110%)
      // - muted: in progress (<90%)
      let color: "sage" | "muted" | "coral";
      if (percentage >= 90 && percentage <= 110) {
        color = "sage";
      } else if (percentage > 110) {
        color = "coral";
      } else {
        color = "muted";
      }
      return { actual, percentage, color };
    };

    return {
      daily: {
        calories: calcProgress(avgCalories, macroGoals.calories),
        protein: calcProgress(avgProtein, macroGoals.protein_g),
        carbs: calcProgress(avgCarbs, macroGoals.carbs_g),
        fat: calcProgress(avgFat, macroGoals.fat_g),
      },
      weekly: {
        calories: calcProgress(totalCalories, weeklyCaloriesGoal),
        protein: calcProgress(totalProtein, weeklyProteinGoal),
        carbs: calcProgress(totalCarbs, weeklyCarbsGoal),
        fat: calcProgress(totalFat, weeklyFatGoal),
      },
      totals: {
        calories: totalCalories,
        protein: totalProtein,
        carbs: totalCarbs,
        fat: totalFat,
      },
      recipesWithNutrition,
    };
  }, [assignments, nutritionData, macroGoals]);

  const totalMeals = assignments.length;

  return {
    daysWithMeals,
    cookBreakdown,
    calculatedNutritionProgress,
    totalMeals,
  };
}

export type { LocalMacroProgress, CookBreakdown, CalculatedNutritionProgress };
