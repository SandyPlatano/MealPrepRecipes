"use server";

/**
 * Server Actions for Nutrition Tracking
 * Handles CRUD operations for recipe nutrition data, daily logs, and weekly summaries
 */

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import type {
  RecipeNutrition,
  NutritionData,
  MacroGoals,
  WeeklyNutritionSummary,
  DailyMacroSummary,
  WeeklyMacroDashboard,
} from "@/types/nutrition";
import {
  calculateDailyMacroSummary,
  calculateWeeklyMacroDashboard,
  getWeekDays,
} from "@/lib/nutrition/calculations";

// =====================================================
// RECIPE NUTRITION ACTIONS
// =====================================================

/**
 * Get nutrition data for a specific recipe
 */
export async function getRecipeNutrition(recipeId: string): Promise<{
  data: RecipeNutrition | null;
  error: string | null;
}> {
  try {
    const { user, error: authError } = await getCachedUserWithHousehold();
    // Only check for actual auth errors, not household/subscription errors
    if (!user) {
      return { data: null, error: "Not authenticated" };
    }
    // authError might be from household/subscription lookup, which is OK for nutrition tracking

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("recipe_nutrition")
      .select("*")
      .eq("recipe_id", recipeId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No nutrition data found - not an error, just return null
        return { data: null, error: null };
      }
      console.error("Error fetching recipe nutrition:", error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Error in getRecipeNutrition:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch nutrition",
    };
  }
}

/**
 * Manually update or create nutrition data for a recipe
 * Used when user wants to override AI-extracted data or add manual data
 */
export async function updateRecipeNutrition(
  recipeId: string,
  nutrition: NutritionData
): Promise<{
  data: RecipeNutrition | null;
  error: string | null;
}> {
  try {
    const { user, error: authError } = await getCachedUserWithHousehold();
    // Only check for actual auth errors, not household/subscription errors
    if (!user) {
      return { data: null, error: "Not authenticated" };
    }
    // authError might be from household/subscription lookup, which is OK for nutrition tracking

    const supabase = await createClient();

    // Verify user owns the recipe
    const { data: recipe, error: recipeError } = await supabase
      .from("recipes")
      .select("id, user_id")
      .eq("id", recipeId)
      .single();

    if (recipeError || !recipe) {
      return { data: null, error: "Recipe not found" };
    }

    if (recipe.user_id !== user.id) {
      return { data: null, error: "You don't have permission to modify this recipe" };
    }

    // Upsert nutrition data (marked as manual source)
    const { data, error } = await supabase
      .from("recipe_nutrition")
      .upsert(
        {
          recipe_id: recipeId,
          ...nutrition,
          source: "manual",
          confidence_score: 1.0, // Manual entries are 100% confident
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "recipe_id",
        }
      )
      .select()
      .single();

    if (error) {
      console.error("Error updating recipe nutrition:", error);
      return { data: null, error: error.message };
    }

    // Revalidate relevant paths
    revalidatePath(`/app/recipes/${recipeId}`);
    revalidatePath("/app/recipes");
    revalidateTag(`recipes-${user.id}`);

    // Also revalidate meal plans that might use this recipe
    revalidatePath("/app/plan");

    return { data, error: null };
  } catch (error) {
    console.error("Error in updateRecipeNutrition:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to update nutrition",
    };
  }
}

/**
 * Delete nutrition data for a recipe
 */
export async function deleteRecipeNutrition(recipeId: string): Promise<{
  success: boolean;
  error: string | null;
}> {
  try {
    const { user, error: authError } = await getCachedUserWithHousehold();
    // Only check for actual auth errors, not household/subscription errors
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }
    // authError might be from household/subscription lookup, which is OK for nutrition tracking

    const supabase = await createClient();

    // Verify user owns the recipe
    const { data: recipe, error: recipeError } = await supabase
      .from("recipes")
      .select("id, user_id")
      .eq("id", recipeId)
      .single();

    if (recipeError || !recipe) {
      return { success: false, error: "Recipe not found" };
    }

    if (recipe.user_id !== user.id) {
      return { success: false, error: "You don't have permission to modify this recipe" };
    }

    const { error } = await supabase
      .from("recipe_nutrition")
      .delete()
      .eq("recipe_id", recipeId);

    if (error) {
      console.error("Error deleting recipe nutrition:", error);
      return { success: false, error: error.message };
    }

    // Revalidate relevant paths
    revalidatePath(`/app/recipes/${recipeId}`);
    revalidatePath("/app/recipes");
    revalidateTag(`recipes-${user.id}`);
    revalidatePath("/app/plan");

    return { success: true, error: null };
  } catch (error) {
    console.error("Error in deleteRecipeNutrition:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete nutrition",
    };
  }
}

/**
 * Bulk fetch nutrition data for multiple recipes
 * Useful for meal plan page where we need nutrition for many recipes at once
 */
export async function getBulkRecipeNutrition(recipeIds: string[]): Promise<{
  data: Record<string, RecipeNutrition>;
  error: string | null;
}> {
  try {
    const { user, error: authError } = await getCachedUserWithHousehold();
    // Only check for actual auth errors, not household/subscription errors
    if (!user) {
      return { data: {}, error: "Not authenticated" };
    }
    // authError might be from household/subscription lookup, which is OK for nutrition tracking

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("recipe_nutrition")
      .select("*")
      .in("recipe_id", recipeIds);

    if (error) {
      console.error("Error fetching bulk recipe nutrition:", error);
      return { data: {}, error: error.message };
    }

    // Convert array to record keyed by recipe_id
    const nutritionMap: Record<string, RecipeNutrition> = {};
    data.forEach((nutrition) => {
      nutritionMap[nutrition.recipe_id] = nutrition;
    });

    return { data: nutritionMap, error: null };
  } catch (error) {
    console.error("Error in getBulkRecipeNutrition:", error);
    return {
      data: {},
      error: error instanceof Error ? error.message : "Failed to fetch nutrition",
    };
  }
}

// =====================================================
// MACRO GOALS ACTIONS
// =====================================================

/**
 * Get user's macro goals from settings
 */
export async function getMacroGoals(): Promise<{
  data: MacroGoals | null;
  error: string | null;
}> {
  try {
    const { user, error: authError } = await getCachedUserWithHousehold();
    // Only check for actual auth errors, not household/subscription errors
    if (!user) {
      return { data: null, error: "Not authenticated" };
    }
    // authError might be from household/subscription lookup, which is OK for nutrition tracking

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("user_settings")
      .select("macro_goals")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Error fetching macro goals:", error);
      return { data: null, error: error.message };
    }

    return { data: data.macro_goals || null, error: null };
  } catch (error) {
    console.error("Error in getMacroGoals:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch macro goals",
    };
  }
}

/**
 * Update user's macro goals
 */
export async function updateMacroGoals(goals: MacroGoals): Promise<{
  success: boolean;
  error: string | null;
}> {
  try {
    const { user, error: authError } = await getCachedUserWithHousehold();
    // Only check for actual auth errors, not household/subscription errors
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }
    // authError might be from household/subscription lookup, which is OK for nutrition tracking

    const supabase = await createClient();

    const { error } = await supabase
      .from("user_settings")
      .update({
        macro_goals: goals,
        macro_goal_preset: "custom", // Mark as custom when manually set
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating macro goals:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/app/settings");
    revalidatePath("/app/plan");
    revalidatePath("/app/nutrition");

    return { success: true, error: null };
  } catch (error) {
    console.error("Error in updateMacroGoals:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update macro goals",
    };
  }
}

/**
 * Toggle nutrition tracking on/off
 */
export async function toggleNutritionTracking(enabled: boolean): Promise<{
  success: boolean;
  error: string | null;
}> {
  try {
    const { user, error: authError } = await getCachedUserWithHousehold();
    // Only check for actual auth errors, not household/subscription errors
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }
    // authError might be from household/subscription lookup, which is OK for nutrition tracking

    const supabase = await createClient();

    const { error } = await supabase
      .from("user_settings")
      .update({
        macro_tracking_enabled: enabled,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (error) {
      console.error("Error toggling nutrition tracking:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/app/settings");
    revalidatePath("/app/plan");

    return { success: true, error: null };
  } catch (error) {
    console.error("Error in toggleNutritionTracking:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to toggle nutrition tracking",
    };
  }
}

// =====================================================
// DAILY & WEEKLY SUMMARY ACTIONS
// =====================================================

/**
 * Get daily nutrition summary for a specific date
 * Calculates from meal plan assignments
 */
export async function getDailyNutritionSummary(date: string): Promise<{
  data: DailyMacroSummary | null;
  error: string | null;
}> {
  try {
    const { user, error: authError } = await getCachedUserWithHousehold();
    // Only check for actual auth errors, not household/subscription errors
    if (!user) {
      return { data: null, error: "Not authenticated" };
    }
    // authError might be from household/subscription lookup, which is OK for nutrition tracking

    const supabase = await createClient();

    // Get macro goals
    const { data: goals } = await getMacroGoals();
    if (!goals) {
      return {
        data: null,
        error: "Macro goals not set. Please set your goals in settings.",
      };
    }

    // Call database function to calculate daily nutrition
    const { data, error } = await supabase.rpc("calculate_daily_nutrition", {
      p_user_id: user.id,
      p_date: date,
    });

    if (error) {
      console.error("Error calculating daily nutrition:", error);
      return { data: null, error: error.message };
    }

    const nutritionData: NutritionData = {
      calories: data[0]?.total_calories || null,
      protein_g: data[0]?.total_protein_g || null,
      carbs_g: data[0]?.total_carbs_g || null,
      fat_g: data[0]?.total_fat_g || null,
      fiber_g: data[0]?.total_fiber_g || null,
      sugar_g: data[0]?.total_sugar_g || null,
      sodium_mg: data[0]?.total_sodium_mg || null,
    };

    const mealCount = data[0]?.meal_count || 0;
    const recipesWithNutrition = data[0]?.recipes_with_nutrition || 0;
    const dataCompletenessPct =
      mealCount > 0 ? Math.round((recipesWithNutrition / mealCount) * 100) : 0;

    const summary = calculateDailyMacroSummary(
      date,
      nutritionData,
      goals,
      mealCount,
      dataCompletenessPct
    );

    return { data: summary, error: null };
  } catch (error) {
    console.error("Error in getDailyNutritionSummary:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to get daily summary",
    };
  }
}

/**
 * Get weekly nutrition dashboard
 * Aggregates all 7 days of the week
 */
export async function getWeeklyNutritionDashboard(weekStart: string): Promise<{
  data: WeeklyMacroDashboard | null;
  error: string | null;
}> {
  try {
    const { user, error: authError } = await getCachedUserWithHousehold();
    // Only check for actual auth errors, not household/subscription errors
    if (!user) {
      return { data: null, error: "Not authenticated" };
    }
    // authError might be from household/subscription lookup, which is OK for nutrition tracking

    // Get macro goals
    const { data: goals } = await getMacroGoals();
    if (!goals) {
      return {
        data: null,
        error: "Macro goals not set. Please set your goals in settings.",
      };
    }

    // Get all 7 days of the week
    const weekDays = getWeekDays(weekStart);

    // Fetch daily summaries for each day
    const dailySummaries: DailyMacroSummary[] = [];
    for (const day of weekDays) {
      const { data: summary, error } = await getDailyNutritionSummary(day);
      if (error) {
        console.error(`Error fetching summary for ${day}:`, error);
        // Continue with other days even if one fails
        continue;
      }
      if (summary) {
        dailySummaries.push(summary);
      }
    }

    // Calculate weekly dashboard
    const dashboard = calculateWeeklyMacroDashboard(weekStart, dailySummaries, goals);

    return { data: dashboard, error: null };
  } catch (error) {
    console.error("Error in getWeeklyNutritionDashboard:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to get weekly dashboard",
    };
  }
}

/**
 * Save/update daily nutrition log
 * Called after meal plan changes to persist the snapshot
 */
export async function saveDailyNutritionLog(date: string): Promise<{
  success: boolean;
  error: string | null;
}> {
  try {
    const { user, error: authError } = await getCachedUserWithHousehold();
    // Only check for actual auth errors, not household/subscription errors
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }
    // authError might be from household/subscription lookup, which is OK for nutrition tracking

    const supabase = await createClient();

    // Call database function to upsert daily log
    const { error } = await supabase.rpc("upsert_daily_nutrition_log", {
      p_user_id: user.id,
      p_date: date,
    });

    if (error) {
      console.error("Error saving daily nutrition log:", error);
      return { success: false, error: error.message };
    }

    // Revalidate nutrition pages
    revalidatePath("/app/nutrition");
    revalidatePath("/app/plan");

    return { success: true, error: null };
  } catch (error) {
    console.error("Error in saveDailyNutritionLog:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save daily log",
    };
  }
}

/**
 * Get nutrition history (past weeks)
 * Used for trends and historical analysis
 */
export async function getNutritionHistory(weeks: number = 4): Promise<{
  data: WeeklyNutritionSummary[];
  error: string | null;
}> {
  try {
    const { user, error: authError } = await getCachedUserWithHousehold();
    // Only check for actual auth errors, not household/subscription errors
    if (!user) {
      return { data: [], error: "Not authenticated" };
    }
    // authError might be from household/subscription lookup, which is OK for nutrition tracking

    const supabase = await createClient();

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - weeks * 7);

    const { data, error } = await supabase
      .from("weekly_nutrition_summary")
      .select("*")
      .eq("user_id", user.id)
      .gte("week_start", startDate.toISOString().split("T")[0])
      .order("week_start", { ascending: false });

    if (error) {
      console.error("Error fetching nutrition history:", error);
      return { data: [], error: error.message };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error("Error in getNutritionHistory:", error);
    return {
      data: [],
      error: error instanceof Error ? error.message : "Failed to fetch history",
    };
  }
}

/**
 * Check if user has nutrition tracking enabled
 */
export async function isNutritionTrackingEnabled(): Promise<{
  enabled: boolean;
  error: string | null;
}> {
  try {
    const { user, error: authError } = await getCachedUserWithHousehold();
    // Only check for actual auth errors, not household/subscription errors
    if (!user) {
      return { enabled: false, error: "Not authenticated" };
    }
    // authError might be from household/subscription lookup, which is OK for nutrition tracking

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("user_settings")
      .select("macro_tracking_enabled")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Error checking nutrition tracking status:", error);
      return { enabled: false, error: error.message };
    }

    return { enabled: data.macro_tracking_enabled || false, error: null };
  } catch (error) {
    console.error("Error in isNutritionTrackingEnabled:", error);
    return {
      enabled: false,
      error: error instanceof Error ? error.message : "Failed to check tracking status",
    };
  }
}
