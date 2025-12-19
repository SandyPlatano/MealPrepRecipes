import { redirect } from "next/navigation";
import { getWeekPlan, getRecipesForPlanning } from "@/app/actions/meal-plans";
import { getSettings, getMealTypeCustomization, getPlannerViewSettings } from "@/app/actions/settings";
import { getUserPreferencesV2 } from "@/app/actions/user-preferences";
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
import { createClient } from "@/lib/supabase/server";
import { OnboardingWrapper } from "@/components/onboarding/onboarding-wrapper";
import { hasActiveSubscription } from "@/lib/stripe/subscription";
import { ContextualHint } from "@/components/hints/contextual-hint";
import { HINT_IDS, HINT_CONTENT } from "@/lib/hints";
import { DEFAULT_ENERGY_MODE_PREFERENCES, type EnergyModePreferences } from "@/types/energy-mode";
import { PersonalizedGreeting } from "@/components/ui/personalized-greeting";

interface HomePageProps {
  searchParams: Promise<{ week?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get user's profile for onboarding check
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id)
    .single();

  // Get current week for comparison
  const currentWeekStart = getWeekStart(new Date()).toISOString().split("T")[0];

  // Get week start from URL or default to current week
  const weekStartDate = params.week
    ? new Date(params.week)
    : getWeekStart(new Date());

  const weekStartStr = weekStartDate.toISOString().split("T")[0];

  // Check if user can navigate to other weeks (Pro+ feature)
  const canNavigateWeeks = user ? await hasActiveSubscription(user.id, 'pro') : false;

  // Redirect free users who try to navigate to non-current weeks via URL
  if (!canNavigateWeeks && weekStartStr !== currentWeekStart) {
    redirect(`/app?week=${currentWeekStart}`);
  }

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
    mealTypeSettingsResult,
    plannerViewSettingsResult,
    userPreferencesV2Result,
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
    getMealTypeCustomization(),
    getPlannerViewSettings(),
    user ? getUserPreferencesV2(user.id) : Promise.resolve({ error: null, data: null }),
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
  const mealTypeSettings = mealTypeSettingsResult.data;
  const plannerViewSettings = plannerViewSettingsResult.data;
  const energyModePreferences: EnergyModePreferences =
    userPreferencesV2Result.data?.energyMode || DEFAULT_ENERGY_MODE_PREFERENCES;

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

  // Check if user needs onboarding
  // Show onboarding only for truly new users who haven't set up anything yet
  // Note: cook_names defaults to ["Me"], so we check if it's just that default
  const hasCustomCookNames = cookNames.length > 1 || (cookNames.length === 1 && cookNames[0] !== "Me");
  const hasSetName = !!(profile?.first_name || profile?.last_name);
  const hasCompletedOnboarding = hasSetName || hasCustomCookNames;

  const needsOnboarding = !hasCompletedOnboarding && recipes.length === 0;

  return (
    <>
      <OnboardingWrapper
        shouldShow={needsOnboarding}
        currentName={[profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || ""}
        currentCookNames={settingsResult.data?.cook_names || []}
        currentCookColors={settingsResult.data?.cook_colors || {}}
      />
      
      <div className="space-y-6">
        <PlanScrollRestorer />
        <div>
          <PersonalizedGreeting userName={profile?.first_name} />
          <h1 className="text-3xl font-mono font-bold">Meal Plan</h1>
          <p className="text-muted-foreground mt-1">
            Plan your week. Assign cooks. Send the list. Done.
          </p>
        </div>

        <ContextualHint
          hintId={HINT_IDS.MEAL_PLANNER_INTRO}
          title={HINT_CONTENT[HINT_IDS.MEAL_PLANNER_INTRO].title}
          description={HINT_CONTENT[HINT_IDS.MEAL_PLANNER_INTRO].description}
        />

        <MealPlannerGrid
          weekStartStr={weekStartStr}
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
          canNavigateWeeks={canNavigateWeeks}
          mealTypeSettings={mealTypeSettings}
          plannerViewSettings={plannerViewSettings}
          energyModePreferences={energyModePreferences}
        />
      </div>
    </>
  );
}
