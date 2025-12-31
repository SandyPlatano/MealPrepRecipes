import { redirect } from "next/navigation";
import { getWeekPlan, getRecipesForPlanning } from "@/app/actions/meal-plans";
import { getSettings, getMealTypeCustomization, getPlannerViewSettings, getDefaultCooksByDay } from "@/app/actions/settings";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Lightbulb, Keyboard } from "lucide-react";

interface HomePageProps {
  searchParams: Promise<{ week?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get current week for comparison
  const currentWeekStart = getWeekStart(new Date()).toISOString().split("T")[0];

  // Get week start from URL or default to current week
  const weekStartDate = params.week
    ? new Date(params.week)
    : getWeekStart(new Date());

  const weekStartStr = weekStartDate.toISOString().split("T")[0];

  // Calculate previous week for copy feature
  const previousWeekStart = new Date(weekStartDate);
  previousWeekStart.setDate(previousWeekStart.getDate() - 7);
  const previousWeekStr = previousWeekStart.toISOString().split("T")[0];

  // Fetch all data in parallel (including profile and subscription check)
  const [
    profileResult,
    canNavigateWeeksResult,
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
    defaultCooksByDayResult,
    userPreferencesV2Result,
  ] = await Promise.all([
    user ? supabase.from("profiles").select("id, first_name, last_name, email, avatar_url, cover_image_url, username, bio, cooking_philosophy, profile_emoji, currently_craving, cook_with_me_status, favorite_cuisine, cooking_skill, location, website_url, public_profile, show_cooking_stats, show_badges, show_cook_photos, show_reviews, show_saved_recipes, profile_accent_color, created_at, updated_at").eq("id", user.id).single() : Promise.resolve({ data: null }),
    user ? hasActiveSubscription(user.id, 'pro') : Promise.resolve(false),
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
    getDefaultCooksByDay(),
    user ? getUserPreferencesV2(user.id) : Promise.resolve({ error: null, data: null }),
  ]);

  const profile = profileResult.data;
  const canNavigateWeeks = canNavigateWeeksResult;

  // Redirect free users who try to navigate to non-current weeks via URL
  if (!canNavigateWeeks && weekStartStr !== currentWeekStart) {
    redirect(`/app?week=${currentWeekStart}`);
  }

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
  const cookNames = (settingsResult.data?.cook_names || []) as string[];
  const cookColors = (settingsResult.data?.cook_colors || {}) as Record<string, string>;
  const userAllergenAlerts = (settingsResult.data?.allergen_alerts || []) as string[];
  const calendarExcludedDays = (settingsResult.data?.calendar_excluded_days || []) as string[];
  const googleConnected = !!settingsResult.data?.google_connected_account;
  const favorites = favoritesResult.data || [];
  const recentRecipeIds = (recentlyCooked.data || []).map((r) => r.id);
  const suggestedRecipeIds = (suggestions.data || []).map((r) => r.id);
  const mealTypeSettings = mealTypeSettingsResult.data;
  const plannerViewSettings = plannerViewSettingsResult.data;
  const defaultCooksByDay = defaultCooksByDayResult.data;

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

  // Check if the week is completely empty (no meals planned)
  const totalMealsThisWeek = Object.values(weekPlan.assignments).flat().length;
  const isWeekEmpty = totalMealsThisWeek === 0 && !needsOnboarding;

  return (
    <>
      <OnboardingWrapper
        shouldShow={needsOnboarding}
        currentName={[profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || ""}
        currentCookNames={cookNames}
        currentCookColors={cookColors}
      />

      <div className="flex flex-col h-full min-h-0 flex-1">
        <PlanScrollRestorer />
        <div className="flex-shrink-0 mb-3">
          <h1 className="text-2xl md:text-3xl font-mono font-bold">Meal Plan</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Plan your week. Assign cooks. Send the list. Done.
          </p>
        </div>

        <Separator className="mb-4" />

        {/* Empty week tip */}
        {isWeekEmpty && recipes.length > 0 && (
          <Alert className="mb-4 bg-amber-50/50 border-amber-200/50 dark:bg-amber-950/20 dark:border-amber-800/30">
            <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-sm text-amber-800 dark:text-amber-200">
              <span className="font-medium">Tip:</span> Click any row to add a meal, or right-click for more options.
              <span className="hidden md:inline ml-1">
                <Keyboard className="inline h-3 w-3 mx-1" />
                Press <kbd className="px-1 py-0.5 rounded bg-amber-100 dark:bg-amber-900/50 text-xs font-mono">1-7</kbd> to jump to a day.
              </span>
            </AlertDescription>
          </Alert>
        )}

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
          defaultCooksByDay={defaultCooksByDay}
        />
      </div>
    </>
  );
}
