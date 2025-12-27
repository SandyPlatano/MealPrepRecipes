"use server";

/**
 * Daily Nutrition Logs Actions
 * Handles daily nutrition summaries and quick add entries
 */

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import type { DailyMacroSummary, NutritionData } from "@/types/nutrition";
import { MACRO_GOAL_PRESETS } from "@/types/nutrition";
import { calculateDailyMacroSummary } from "@/lib/nutrition/calculations";
import { getMacroGoals } from "./macro-goals";

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
