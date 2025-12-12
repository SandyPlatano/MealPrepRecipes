import { getWeekPlan, getRecipesForPlanning } from "@/app/actions/meal-plans";
import { getSettings } from "@/app/actions/settings";
import { getFavorites } from "@/app/actions/recipes";
import {
  getRecentlyCooked,
  getPreviousWeekMealCount,
  getSmartSuggestions,
} from "@/app/actions/meal-plan-suggestions";
import { checkAIQuota } from "@/app/actions/ai-meal-suggestions";
import {
  getBulkRecipeNutrition,
  getWeeklyNutritionDashboard,
  getMacroGoals,
  isNutritionTrackingEnabled,
} from "@/app/actions/nutrition";
import type { RecipeNutrition } from "@/types/nutrition";
import { MealPlannerGrid } from "@/components/meal-plan/meal-planner-grid";
import { PlanScrollRestorer } from "@/components/meal-plan/plan-scroll-restorer";
import { getWeekStart } from "@/types/meal-plan";

interface PlanPageProps {
  searchParams: Promise<{ week?: string }>;
}

export default async function PlanPage({ searchParams }: PlanPageProps) {
  const params = await searchParams;

  // Get week start from URL or default to current week
  const weekStartDate = params.week
    ? new Date(params.week)
    : getWeekStart(new Date());

  const weekStartStr = weekStartDate.toISOString().split("T")[0];

  // Calculate previous week for copy feature
  const previousWeekStart = new Date(weekStartDate);
  previousWeekStart.setDate(previousWeekStart.getDate() - 7);
  const previousWeekStr = previousWeekStart.toISOString().split("T")[0];

  // Fetch all data in parallel
  const [
    planResult,
    recipesResult,
    settingsResult,
    favoritesResult,
    recentlyCooked,
    prevWeekCount,
    suggestions,
    aiQuota,
    nutritionTrackingResult,
  ] = await Promise.all([
    getWeekPlan(weekStartStr),
    getRecipesForPlanning(),
    getSettings(),
    getFavorites(),
    getRecentlyCooked(),
    getPreviousWeekMealCount(previousWeekStr),
    getSmartSuggestions(weekStartStr),
    checkAIQuota(),
    isNutritionTrackingEnabled(),
  ]);

  const weekPlan = planResult.data || {
    meal_plan: null,
    assignments: {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: [],
    },
  };

  const recipes = recipesResult.data || [];
  const cookNames = settingsResult.data?.cook_names || [];
  const cookColors = settingsResult.data?.cook_colors || {};
  const userAllergenAlerts = settingsResult.data?.allergen_alerts || [];
  const calendarExcludedDays = settingsResult.data?.calendar_excluded_days || [];
  const googleConnected = !!settingsResult.data?.google_connected_account;
  const favorites = favoritesResult.data || [];
  const recentRecipeIds = (recentlyCooked.data || []).map((r) => r.id);
  const suggestedRecipeIds = (suggestions.data || []).map((r) => r.id);

  // Get existing meal days for AI suggestions
  const existingMealDays = Object.entries(weekPlan.assignments)
    .filter(([, meals]) => meals.length > 0)
    .map(([day]) => day);

  // Fetch nutrition data if tracking is enabled
  const nutritionEnabled = nutritionTrackingResult.enabled || false;
  let nutritionData = null;
  let weeklyNutritionDashboard = null;
  let macroGoals = null;

  if (nutritionEnabled) {
    // Get all unique recipe IDs from assignments
    const allRecipeIds = Object.values(weekPlan.assignments)
      .flat()
      .map((a) => a.recipe_id);
    const uniqueRecipeIds = Array.from(new Set(allRecipeIds));

    // Fetch nutrition data for all recipes in parallel
    const [nutritionResult, dashboardResult, goalsResult] = await Promise.all([
      uniqueRecipeIds.length > 0 ? getBulkRecipeNutrition(uniqueRecipeIds) : Promise.resolve({ data: {} as Record<string, RecipeNutrition>, error: null }),
      getWeeklyNutritionDashboard(weekStartStr),
      getMacroGoals(),
    ]);

    // Create nutrition lookup map from the Record
    if (nutritionResult.data && Object.keys(nutritionResult.data).length > 0) {
      nutritionData = new Map(
        Object.entries(nutritionResult.data).map(([recipeId, nutrition]) => [recipeId, nutrition])
      );
    } else {
      // Create empty Map when nutrition is enabled but no data exists
      nutritionData = new Map();
    }

    weeklyNutritionDashboard = dashboardResult.data;
    macroGoals = goalsResult.data;
  }

  return (
    <div className="space-y-6">
      <PlanScrollRestorer />
      <div>
        <h1 className="text-3xl font-mono font-bold">Meal Plan</h1>
        <p className="text-muted-foreground mt-1">
          Plan your week. Assign cooks. Send the list. Done.
        </p>
      </div>

      <MealPlannerGrid
        weekStart={weekStartDate}
        weekPlan={weekPlan}
        recipes={recipes}
        cookNames={cookNames}
        cookColors={cookColors}
        userAllergenAlerts={userAllergenAlerts}
        calendarExcludedDays={calendarExcludedDays}
        googleConnected={googleConnected}
        favorites={favorites}
        recentRecipeIds={recentRecipeIds}
        suggestedRecipeIds={suggestedRecipeIds}
        previousWeekMealCount={prevWeekCount.count}
        subscriptionTier={aiQuota.data?.tier || 'free'}
        aiQuotaRemaining={aiQuota.data?.remaining || null}
        existingMealDays={existingMealDays}
        nutritionEnabled={nutritionEnabled}
        nutritionData={nutritionData}
        weeklyNutritionDashboard={weeklyNutritionDashboard}
        macroGoals={macroGoals}
      />
    </div>
  );
}
