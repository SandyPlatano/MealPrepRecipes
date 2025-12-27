"use server";

/**
 * Macro Goals Actions
 * Handles user's macro goal settings and nutrition tracking toggles
 */

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import type { MacroGoals } from "@/types/nutrition";

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
