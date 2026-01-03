import type { DayOfWeek, MealAssignmentWithRecipe } from "@/types/meal-plan";
import type { RecipeNutrition, WeeklyMacroDashboard, MacroGoals } from "@/types/nutrition";
import type { CookBreakdown, LocalMacroProgress, CalculatedNutritionProgress } from "@/hooks/use-planner-summary";

export interface RecipeRepetitionWarning {
  recipeId: string;
  recipeTitle: string;
  count: number;
  weeks: string[];
}

export interface PlannerSummaryProps {
  assignments: MealAssignmentWithRecipe[];
  weekStartStr?: string; // Optional - used for legacy calls
  cookColors?: Record<string, string>;
  nutritionEnabled?: boolean;
  nutritionData?: Map<string, RecipeNutrition> | null;
  weeklyNutritionDashboard?: WeeklyMacroDashboard | null;
  macroGoals?: MacroGoals | null;
  repetitionWarnings?: RecipeRepetitionWarning[];
  isGridCell?: boolean; // When true, renders as compact single card for grid layout
}

export interface DayProgressCirclesProps {
  daysWithMeals: Set<DayOfWeek>;
}

export interface CookBreakdownChipsProps {
  breakdown: CookBreakdown;
  cookColors: Record<string, string>;
}

export interface WeekProgressSectionProps {
  daysWithMeals: Set<DayOfWeek>;
  cookBreakdown: CookBreakdown;
  cookColors: Record<string, string>;
  totalMeals: number;
}

export interface MacroProgressCompactProps {
  label: string;
  actual: number | null;
  target: number;
  progress: LocalMacroProgress;
  unit?: string;
}

export interface NutritionSummarySectionProps {
  dashboard?: WeeklyMacroDashboard | null;
  calculatedProgress?: CalculatedNutritionProgress | null;
  goals: MacroGoals;
}

export interface RepetitionWarningSectionProps {
  warnings: RecipeRepetitionWarning[];
}

export type { CookBreakdown, LocalMacroProgress, CalculatedNutritionProgress };
