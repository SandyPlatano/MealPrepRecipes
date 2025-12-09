"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";

interface RecipeSuggestion {
  id: string;
  title: string;
  recipe_type: string;
  prep_time: string | null;
  cook_time: string | null;
  image_url: string | null;
  category: string | null;
}

// Get recipes recently cooked in the last 2 weeks (Make Again)
export async function getRecentlyCooked(): Promise<{
  error: string | null;
  data: RecipeSuggestion[];
}> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "No household found", data: [] };
  }

  const supabase = await createClient();
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  const { data, error } = await supabase
    .from("cooking_history")
    .select(`
      recipe:recipes(id, title, recipe_type, prep_time, cook_time, image_url, category)
    `)
    .eq("household_id", household.household_id)
    .gte("cooked_at", twoWeeksAgo.toISOString())
    .order("cooked_at", { ascending: false })
    .limit(10);

  if (error) {
    return { error: error.message, data: [] };
  }

  // Deduplicate by recipe id and extract recipe data
  const seen = new Set<string>();
  const recipes: RecipeSuggestion[] = [];
  
  for (const entry of data || []) {
    // Supabase returns nested relations - handle both single object and array
    const recipeData = entry.recipe;
    const recipe = (Array.isArray(recipeData) ? recipeData[0] : recipeData) as RecipeSuggestion | null;
    if (recipe && !seen.has(recipe.id)) {
      seen.add(recipe.id);
      recipes.push(recipe);
    }
  }

  return { error: null, data: recipes.slice(0, 5) };
}

// Get user's favorite recipes
export async function getFavoriteRecipes(): Promise<{
  error: string | null;
  data: RecipeSuggestion[];
}> {
  const { user, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user) {
    return { error: authError?.message || "Not authenticated", data: [] };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("favorites")
    .select(`
      recipe:recipes(id, title, recipe_type, prep_time, cook_time, image_url, category)
    `)
    .eq("user_id", user.id)
    .limit(10);

  if (error) {
    return { error: error.message, data: [] };
  }

  const recipes: RecipeSuggestion[] = (data || [])
    .map((entry) => {
      const recipeData = entry.recipe;
      return (Array.isArray(recipeData) ? recipeData[0] : recipeData) as RecipeSuggestion | null;
    })
    .filter((r): r is RecipeSuggestion => r !== null)
    .slice(0, 5);

  return { error: null, data: recipes };
}

// Get quick recipes (under 30 min total time)
export async function getQuickRecipes(): Promise<{
  error: string | null;
  data: RecipeSuggestion[];
}> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user) {
    return { error: authError?.message || "Not authenticated", data: [] };
  }

  const supabase = await createClient();

  // Get recipes where prep_time contains common quick indicators
  const { data, error } = await supabase
    .from("recipes")
    .select("id, title, recipe_type, prep_time, cook_time, image_url, category")
    .or(
      `user_id.eq.${user.id},and(household_id.eq.${household?.household_id},is_shared_with_household.eq.true)`
    )
    .or(
      `prep_time.ilike.%5 min%,prep_time.ilike.%10 min%,prep_time.ilike.%15 min%,prep_time.ilike.%20 min%,prep_time.ilike.%25 min%`
    )
    .limit(10);

  if (error) {
    return { error: error.message, data: [] };
  }

  return { error: null, data: (data || []).slice(0, 5) };
}

// Get recipes never cooked (Try Something New)
export async function getNeverCookedRecipes(): Promise<{
  error: string | null;
  data: RecipeSuggestion[];
}> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "No household found", data: [] };
  }

  const supabase = await createClient();

  // Get all recipe IDs that have been cooked
  const { data: cookedData } = await supabase
    .from("cooking_history")
    .select("recipe_id")
    .eq("household_id", household.household_id);

  const cookedIds = new Set((cookedData || []).map((c) => c.recipe_id));

  // Get all available recipes
  const { data: allRecipes, error } = await supabase
    .from("recipes")
    .select("id, title, recipe_type, prep_time, cook_time, image_url, category")
    .or(
      `user_id.eq.${user.id},and(household_id.eq.${household.household_id},is_shared_with_household.eq.true)`
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return { error: error.message, data: [] };
  }

  // Filter to recipes never cooked
  const neverCooked = (allRecipes || [])
    .filter((r) => !cookedIds.has(r.id))
    .slice(0, 5);

  return { error: null, data: neverCooked };
}

// Copy previous week's meal plan to current week
export async function copyPreviousWeek(
  fromWeekStart: string,
  toWeekStart: string
): Promise<{ error: string | null; copiedCount: number }> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "No household found", copiedCount: 0 };
  }

  const supabase = await createClient();

  // Get the source week's meal plan
  const { data: sourcePlan } = await supabase
    .from("meal_plans")
    .select("id")
    .eq("household_id", household.household_id)
    .eq("week_start", fromWeekStart)
    .single();

  if (!sourcePlan) {
    return { error: "No meal plan found for previous week", copiedCount: 0 };
  }

  // Get assignments from source week
  const { data: sourceAssignments } = await supabase
    .from("meal_assignments")
    .select("recipe_id, day_of_week, cook")
    .eq("meal_plan_id", sourcePlan.id);

  if (!sourceAssignments || sourceAssignments.length === 0) {
    return { error: "No meals to copy from previous week", copiedCount: 0 };
  }

  // Get or create target meal plan
  let { data: targetPlan } = await supabase
    .from("meal_plans")
    .select("id")
    .eq("household_id", household.household_id)
    .eq("week_start", toWeekStart)
    .single();

  if (!targetPlan) {
    const { data: newPlan, error: createError } = await supabase
      .from("meal_plans")
      .insert({
        household_id: household.household_id,
        week_start: toWeekStart,
      })
      .select("id")
      .single();

    if (createError) {
      return { error: createError.message, copiedCount: 0 };
    }
    targetPlan = newPlan;
  }

  // Insert new assignments (don't clear existing - user might want to add to what's there)
  const newAssignments = sourceAssignments.map((a) => ({
    meal_plan_id: targetPlan!.id,
    recipe_id: a.recipe_id,
    day_of_week: a.day_of_week,
    cook: a.cook,
  }));

  const { error: insertError } = await supabase
    .from("meal_assignments")
    .insert(newAssignments);

  if (insertError) {
    return { error: insertError.message, copiedCount: 0 };
  }

  return { error: null, copiedCount: sourceAssignments.length };
}

// Get the number of meals in the previous week (for copy button UI)
export async function getPreviousWeekMealCount(
  previousWeekStart: string
): Promise<{ error: string | null; count: number }> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "No household found", count: 0 };
  }

  const supabase = await createClient();

  const { data: plan } = await supabase
    .from("meal_plans")
    .select("id")
    .eq("household_id", household.household_id)
    .eq("week_start", previousWeekStart)
    .single();

  if (!plan) {
    return { error: null, count: 0 };
  }

  const { count } = await supabase
    .from("meal_assignments")
    .select("id", { count: "exact", head: true })
    .eq("meal_plan_id", plan.id);

  return { error: null, count: count || 0 };
}

// Get smart recipe suggestions based on:
// 1. Recipes not cooked in 30+ days
// 2. Favorites not used recently
// 3. Recipe types not yet planned for the current week (variety)
export async function getSmartSuggestions(weekStart: string): Promise<{
  error: string | null;
  data: RecipeSuggestion[];
}> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "No household found", data: [] };
  }

  const supabase = await createClient();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Get all recipes user has access to
  const { data: allRecipes } = await supabase
    .from("recipes")
    .select("id, title, recipe_type, prep_time, cook_time, image_url, category")
    .or(
      `user_id.eq.${user.id},and(household_id.eq.${household.household_id},is_shared_with_household.eq.true)`
    )
    .limit(100);

  if (!allRecipes) {
    return { error: null, data: [] };
  }

  // Get cooking history for last 30 days
  const { data: recentHistory } = await supabase
    .from("cooking_history")
    .select("recipe_id")
    .eq("household_id", household.household_id)
    .gte("cooked_at", thirtyDaysAgo.toISOString());

  const recentlyCookedIds = new Set((recentHistory || []).map((h) => h.recipe_id));

  // Get current week's meal plan to check for variety
  const { data: currentPlan } = await supabase
    .from("meal_plans")
    .select(`
      id,
      meal_assignments (
        recipe:recipes (
          recipe_type
        )
      )
    `)
    .eq("household_id", household.household_id)
    .eq("week_start", weekStart)
    .single();

  const plannedTypes = new Set<string>();
  if (currentPlan?.meal_assignments) {
    for (const assignment of currentPlan.meal_assignments) {
      const recipeData = (assignment as Record<string, unknown>).recipe;
      const recipe = Array.isArray(recipeData) ? recipeData[0] : recipeData;
      if (recipe?.recipe_type) {
        plannedTypes.add(recipe.recipe_type);
      }
    }
  }

  // Get user's favorites
  const { data: favoritesData } = await supabase
    .from("favorites")
    .select("recipe_id")
    .eq("user_id", user.id);

  const favoriteIds = new Set((favoritesData || []).map((f) => f.recipe_id));

  // Score recipes
  const scoredRecipes = allRecipes.map((recipe) => {
    let score = 0;

    // Not cooked in 30+ days: +3 points
    if (!recentlyCookedIds.has(recipe.id)) {
      score += 3;
    }

    // Favorite but not cooked recently: +2 points
    if (favoriteIds.has(recipe.id) && !recentlyCookedIds.has(recipe.id)) {
      score += 2;
    }

    // Recipe type not yet planned for this week: +2 points
    if (!plannedTypes.has(recipe.recipe_type)) {
      score += 2;
    }

    // Has prep time info (quality indicator): +1 point
    if (recipe.prep_time) {
      score += 1;
    }

    return { recipe, score };
  });

  // Sort by score descending and take top 10
  const suggestions = scoredRecipes
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((s) => s.recipe);

  return { error: null, data: suggestions };
}

