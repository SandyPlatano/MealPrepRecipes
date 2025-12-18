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
import { MACRO_GOAL_PRESETS } from "@/types/nutrition";
import {
  calculateDailyMacroSummary,
  calculateWeeklyMacroDashboard,
  getWeekDays,
} from "@/lib/nutrition/calculations";
import {
  buildNutritionExtractionPrompt,
  parseNutritionResponse,
  validateNutritionRanges,
} from "@/lib/ai/nutrition-extraction-prompt";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

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
    const { user } = await getCachedUserWithHousehold();
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
      .maybeSingle();

    if (error) {
      console.error("Error fetching recipe nutrition:", error);
      return { data: null, error: error.message };
    }

    // maybeSingle returns null if not found, which is expected
    if (!data) {
      return { data: null, error: null };
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
    const { user } = await getCachedUserWithHousehold();
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
    const { user } = await getCachedUserWithHousehold();
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
    const { user } = await getCachedUserWithHousehold();
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
    const { user } = await getCachedUserWithHousehold();
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
    const { user } = await getCachedUserWithHousehold();
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
 * When enabled, automatically queues all recipes without nutrition for extraction
 */
export async function toggleNutritionTracking(enabled: boolean): Promise<{
  success: boolean;
  error: string | null;
  queuedRecipes?: number;
}> {
  try {
    const { user } = await getCachedUserWithHousehold();
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

    let queuedRecipes = 0;

    // When enabling, queue all recipes without nutrition for background extraction
    if (enabled) {
      queuedRecipes = await queueRecipesForNutritionExtraction(user.id);
    }

    revalidatePath("/app/settings");
    revalidatePath("/app/plan");

    return { success: true, error: null, queuedRecipes };
  } catch (error) {
    console.error("Error in toggleNutritionTracking:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to toggle nutrition tracking",
    };
  }
}

/**
 * Queue all user's recipes without nutrition data for background extraction
 * Called when user enables nutrition tracking
 */
async function queueRecipesForNutritionExtraction(userId: string): Promise<number> {
  try {
    const supabase = await createClient();

    // Get all user's recipes
    const { data: recipes, error: recipesError } = await supabase
      .from("recipes")
      .select("id")
      .eq("user_id", userId);

    if (recipesError || !recipes || recipes.length === 0) {
      return 0;
    }

    const recipeIds = recipes.map((r) => r.id);

    // Get recipes that already have nutrition data
    const { data: existingNutrition } = await supabase
      .from("recipe_nutrition")
      .select("recipe_id")
      .in("recipe_id", recipeIds);

    const existingIds = new Set(existingNutrition?.map((n) => n.recipe_id) || []);

    // Filter to recipes without nutrition
    const recipesToQueue = recipeIds.filter((id) => !existingIds.has(id));

    if (recipesToQueue.length === 0) {
      return 0;
    }

    // Insert into queue (upsert to avoid duplicates)
    const { error: queueError } = await supabase.from("nutrition_extraction_queue").upsert(
      recipesToQueue.map((recipeId) => ({
        recipe_id: recipeId,
        status: "pending",
        priority: 0,
        attempts: 0,
      })),
      { onConflict: "recipe_id" }
    );

    if (queueError) {
      console.error("Error queueing recipes for extraction:", queueError);
      return 0;
    }

    console.log(`[Nutrition] Queued ${recipesToQueue.length} recipes for extraction`);
    return recipesToQueue.length;
  } catch (error) {
    console.error("Error in queueRecipesForNutritionExtraction:", error);
    return 0;
  }
}

/**
 * Internal function to extract nutrition for a recipe
 * Called directly from server actions (no HTTP overhead, no auth required)
 * This bypasses the API route to avoid authentication issues with server-to-server calls
 */
export async function extractNutritionForRecipeInternal(
  recipeId: string,
  recipeData: {
    title: string;
    ingredients: string[];
    servings: number;
    instructions?: string[];
  }
): Promise<{
  success: boolean;
  error?: string;
  warnings?: string[];
}> {
  try {
    const supabase = await createClient();

    // Get Anthropic API key
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicApiKey) {
      console.error("[Nutrition] Anthropic API key not configured");
      return { success: false, error: "Anthropic API key not configured" };
    }

    // Build prompt
    const prompt = buildNutritionExtractionPrompt(
      recipeData.ingredients,
      recipeData.servings,
      recipeData.title,
      recipeData.instructions
    );

    // Call Claude API
    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicApiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[Nutrition] Anthropic API error:", errorData);
      return {
        success: false,
        error: errorData.error?.message || `Anthropic API error: ${response.status}`,
      };
    }

    const data = await response.json();
    const content = data.content[0].text;

    // Extract usage and calculate cost
    // Claude Sonnet 4.5 pricing: $3 per 1M input tokens, $15 per 1M output tokens
    const inputTokens = data.usage?.input_tokens || 0;
    const outputTokens = data.usage?.output_tokens || 0;
    const costUsd =
      inputTokens > 0 || outputTokens > 0
        ? (inputTokens * 3) / 1_000_000 + (outputTokens * 15) / 1_000_000
        : null;

    // Parse nutrition response
    const nutritionData = parseNutritionResponse(content);

    if (!nutritionData) {
      console.error("[Nutrition] Failed to parse AI response:", content);
      return {
        success: false,
        error: "Failed to parse nutrition data from AI response",
      };
    }

    // Validate nutrition ranges
    const warnings = validateNutritionRanges(nutritionData);
    if (warnings.length > 0) {
      console.warn(`[Nutrition] Validation warnings for recipe ${recipeId}:`, warnings);
    }

    // Save to database
    const { error: saveError } = await supabase.from("recipe_nutrition").upsert(
      {
        recipe_id: recipeId,
        calories: nutritionData.calories,
        protein_g: nutritionData.protein_g,
        carbs_g: nutritionData.carbs_g,
        fat_g: nutritionData.fat_g,
        fiber_g: nutritionData.fiber_g,
        sugar_g: nutritionData.sugar_g,
        sodium_mg: nutritionData.sodium_mg,
        source: "ai_extracted" as const,
        confidence_score: nutritionData.confidence_score,
        input_tokens: inputTokens > 0 ? inputTokens : null,
        output_tokens: outputTokens > 0 ? outputTokens : null,
        cost_usd: costUsd,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "recipe_id",
      }
    );

    if (saveError) {
      console.error("[Nutrition] Failed to save nutrition data:", saveError);
      return {
        success: false,
        error: "Failed to save nutrition data to database",
      };
    }

    console.log(`[Nutrition] Successfully extracted nutrition for recipe ${recipeId}`);
    return {
      success: true,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error) {
    console.error(`[Nutrition] Error extracting nutrition for recipe ${recipeId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to extract nutrition",
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
    const { user } = await getCachedUserWithHousehold();
    // Only check for actual auth errors, not household/subscription errors
    if (!user) {
      return { data: null, error: "Not authenticated" };
    }
    // authError might be from household/subscription lookup, which is OK for nutrition tracking

    const supabase = await createClient();

    // Get macro goals (use maintenance preset as fallback if not set)
    const { data: userGoals } = await getMacroGoals();
    const goals = userGoals || MACRO_GOAL_PRESETS.maintenance;

    // Call database function to calculate daily nutrition
    const { data, error } = await supabase.rpc("calculate_daily_nutrition", {
      p_user_id: user.id,
      p_date: date,
    });

    if (error) {
      console.error("Error calculating daily nutrition:", error);
      return { data: null, error: error.message };
    }

    // Use ?? instead of || to preserve 0 values (0 is valid data, not missing)
    const nutritionData: NutritionData = {
      calories: data[0]?.total_calories ?? null,
      protein_g: data[0]?.total_protein_g ?? null,
      carbs_g: data[0]?.total_carbs_g ?? null,
      fat_g: data[0]?.total_fat_g ?? null,
      fiber_g: data[0]?.total_fiber_g ?? null,
      sugar_g: data[0]?.total_sugar_g ?? null,
      sodium_mg: data[0]?.total_sodium_mg ?? null,
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
    const { user } = await getCachedUserWithHousehold();
    // Only check for actual auth errors, not household/subscription errors
    if (!user) {
      return { data: null, error: "Not authenticated" };
    }
    // authError might be from household/subscription lookup, which is OK for nutrition tracking

    // Get macro goals (use maintenance preset as fallback if not set)
    const { data: userGoals } = await getMacroGoals();
    const goals = userGoals || MACRO_GOAL_PRESETS.maintenance;

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
    const { user } = await getCachedUserWithHousehold();
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
    const { user } = await getCachedUserWithHousehold();
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
    const { user } = await getCachedUserWithHousehold();
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

// =====================================================
// QUICK ADD MACROS ACTIONS
// =====================================================

/**
 * Quick add nutrition entry (without a recipe)
 * Stores as a standalone entry for the day
 */
export async function addQuickMacros(data: {
  date: string;
  nutrition: {
    calories?: number | null;
    protein_g?: number | null;
    carbs_g?: number | null;
    fat_g?: number | null;
  };
  note?: string;
  preset?: string;
}): Promise<{
  success: boolean;
  error: string | null;
}> {
  try {
    const { user } = await getCachedUserWithHousehold();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const supabase = await createClient();

    // Insert into nutrition_quick_adds table
    const { error } = await supabase.from("nutrition_quick_adds").insert({
      user_id: user.id,
      date: data.date,
      calories: data.nutrition.calories,
      protein_g: data.nutrition.protein_g,
      carbs_g: data.nutrition.carbs_g,
      fat_g: data.nutrition.fat_g,
      note: data.note,
      preset: data.preset,
    });

    if (error) {
      console.error("Error adding quick macros:", error);
      return { success: false, error: error.message };
    }

    // Revalidate nutrition pages
    revalidatePath("/app/nutrition");
    revalidatePath("/app/plan");

    return { success: true, error: null };
  } catch (error) {
    console.error("Error in addQuickMacros:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add quick macros",
    };
  }
}

/**
 * Get quick add entries for a date
 */
export async function getQuickAddsForDate(date: string): Promise<{
  data: Array<{
    id: string;
    calories: number | null;
    protein_g: number | null;
    carbs_g: number | null;
    fat_g: number | null;
    note: string | null;
    preset: string | null;
    created_at: string;
  }>;
  error: string | null;
}> {
  try {
    const { user } = await getCachedUserWithHousehold();
    if (!user) {
      return { data: [], error: "Not authenticated" };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("nutrition_quick_adds")
      .select("id, calories, protein_g, carbs_g, fat_g, note, preset, created_at")
      .eq("user_id", user.id)
      .eq("date", date)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching quick adds:", error);
      return { data: [], error: error.message };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error("Error in getQuickAddsForDate:", error);
    return {
      data: [],
      error: error instanceof Error ? error.message : "Failed to fetch quick adds",
    };
  }
}

/**
 * Delete a quick add entry
 */
export async function deleteQuickAdd(id: string): Promise<{
  success: boolean;
  error: string | null;
}> {
  try {
    const { user } = await getCachedUserWithHousehold();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from("nutrition_quick_adds")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting quick add:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/app/nutrition");
    revalidatePath("/app/plan");

    return { success: true, error: null };
  } catch (error) {
    console.error("Error in deleteQuickAdd:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete quick add",
    };
  }
}

// =====================================================
// NUTRITION EXTRACTION COSTS
// =====================================================

/**
 * Get nutrition extraction cost summary
 * Returns total cost and cost breakdown by recipe
 */
export async function getNutritionExtractionCosts(): Promise<{
  data: {
    totalCost: number;
    totalRecipes: number;
    averageCostPerRecipe: number;
    recipes: Array<{
      recipe_id: string;
      recipe_title: string;
      cost_usd: number;
      input_tokens: number;
      output_tokens: number;
      extracted_at: string;
    }>;
  } | null;
  error: string | null;
}> {
  try {
    const { user } = await getCachedUserWithHousehold();
    if (!user) {
      return { data: null, error: "Not authenticated" };
    }

    const supabase = await createClient();

    // Get all nutrition extractions with costs for user's recipes
    const { data, error } = await supabase
      .from("recipe_nutrition")
      .select(`
        recipe_id,
        cost_usd,
        input_tokens,
        output_tokens,
        created_at,
        recipes!inner (
          id,
          title,
          user_id
        )
      `)
      .eq("recipes.user_id", user.id)
      .not("cost_usd", "is", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching nutrition costs:", error);
      return { data: null, error: error.message };
    }

    if (!data || data.length === 0) {
      return {
        data: {
          totalCost: 0,
          totalRecipes: 0,
          averageCostPerRecipe: 0,
          recipes: [],
        },
        error: null,
      };
    }

    const recipes = data.map((item) => ({
      recipe_id: item.recipe_id,
      recipe_title: (item.recipes as { title?: string } | null)?.title || "Unknown Recipe",
      cost_usd: Number(item.cost_usd),
      input_tokens: item.input_tokens || 0,
      output_tokens: item.output_tokens || 0,
      extracted_at: item.created_at,
    }));

    const totalCost = recipes.reduce((sum, r) => sum + r.cost_usd, 0);
    const totalRecipes = recipes.length;
    const averageCostPerRecipe = totalRecipes > 0 ? totalCost / totalRecipes : 0;

    return {
      data: {
        totalCost,
        totalRecipes,
        averageCostPerRecipe,
        recipes,
      },
      error: null,
    };
  } catch (error) {
    console.error("Error in getNutritionExtractionCosts:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch costs",
    };
  }
}
