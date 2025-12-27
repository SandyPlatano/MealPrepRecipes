"use server";

/**
 * Weekly Nutrition Summary Actions
 * Handles weekly aggregations and nutrition history
 */

import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import type {
  WeeklyMacroDashboard,
  WeeklyNutritionSummary,
  DailyMacroSummary,
} from "@/types/nutrition";
import { MACRO_GOAL_PRESETS } from "@/types/nutrition";
import { calculateWeeklyMacroDashboard, getWeekDays } from "@/lib/nutrition/calculations";
import { getMacroGoals } from "./macro-goals";
import { getDailyNutritionSummary } from "./daily-logs";

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
      .select("id, user_id, week_start, avg_calories, avg_protein_g, avg_carbs_g, avg_fat_g, total_days_tracked, avg_data_completeness_pct, created_at, updated_at")
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
