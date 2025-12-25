"use server";

import { createClient } from "@/lib/supabase/server";
import {
  type WasteMetrics,
  type AggregateWasteMetrics,
  type EarnedAchievement,
  type WasteDashboardData,
} from "@/types/waste-tracking";
import {
  enrichMetricsWithRates,
  calculateStreak,
  getNextAchievement,
  getCurrentWeekStart,
} from "@/lib/waste/calculations";

/**
 * Get the full waste dashboard data for the household
 */
export async function getWasteDashboard(): Promise<{
  error: string | null;
  data: WasteDashboardData | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  // Get user's household
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return { error: "No household found", data: null };
  }

  const householdId = membership.household_id;
  const currentWeekStart = getCurrentWeekStart();

  // Fetch all data in parallel
  const [
    currentWeekResult,
    weeklyTrendResult,
    aggregateResult,
    achievementsResult,
  ] = await Promise.all([
    // Current week metrics
    supabase
      .from("waste_metrics")
      .select("id, household_id, week_start, meals_planned, meals_cooked, shopping_items_total, shopping_items_checked, pantry_items_used, estimated_waste_prevented_kg, estimated_money_saved_cents, estimated_co2_saved_kg, created_at, updated_at")
      .eq("household_id", householdId)
      .eq("week_start", currentWeekStart)
      .single(),

    // Last 12 weeks for trend
    supabase
      .from("waste_metrics")
      .select("id, household_id, week_start, meals_planned, meals_cooked, shopping_items_total, shopping_items_checked, pantry_items_used, estimated_waste_prevented_kg, estimated_money_saved_cents, estimated_co2_saved_kg, created_at, updated_at")
      .eq("household_id", householdId)
      .order("week_start", { ascending: false })
      .limit(12),

    // Aggregate metrics
    supabase.rpc("get_aggregate_waste_metrics", {
      p_household_id: householdId,
      p_period: "all_time",
    }),

    // Achievements
    supabase
      .from("waste_achievements")
      .select("id, household_id, achievement_type, achieved_at, metadata")
      .eq("household_id", householdId)
      .order("achieved_at", { ascending: false }),
  ]);

  // Process results
  const currentWeek = currentWeekResult.data
    ? enrichMetricsWithRates(currentWeekResult.data as WasteMetrics)
    : null;

  const weeklyTrend = (weeklyTrendResult.data || []) as WasteMetrics[];

  // Parse aggregate (comes as array from RPC)
  const aggregateArray = aggregateResult.data as Array<{
    total_meals_planned: number;
    total_meals_cooked: number;
    total_waste_prevented_kg: number;
    total_money_saved_cents: number;
    total_co2_saved_kg: number;
    average_utilization_rate: number;
    average_shopping_efficiency: number;
    weeks_tracked: number;
  }> | null;

  const aggregate: AggregateWasteMetrics = aggregateArray?.[0]
    ? {
        period: "all_time",
        total_meals_planned: Number(aggregateArray[0].total_meals_planned) || 0,
        total_meals_cooked: Number(aggregateArray[0].total_meals_cooked) || 0,
        total_waste_prevented_kg:
          Number(aggregateArray[0].total_waste_prevented_kg) || 0,
        total_money_saved_cents:
          Number(aggregateArray[0].total_money_saved_cents) || 0,
        total_co2_saved_kg: Number(aggregateArray[0].total_co2_saved_kg) || 0,
        average_utilization_rate:
          Number(aggregateArray[0].average_utilization_rate) || 0,
        average_shopping_efficiency:
          Number(aggregateArray[0].average_shopping_efficiency) || 0,
        weeks_tracked: Number(aggregateArray[0].weeks_tracked) || 0,
      }
    : {
        period: "all_time",
        total_meals_planned: 0,
        total_meals_cooked: 0,
        total_waste_prevented_kg: 0,
        total_money_saved_cents: 0,
        total_co2_saved_kg: 0,
        average_utilization_rate: 0,
        average_shopping_efficiency: 0,
        weeks_tracked: 0,
      };

  const achievements = (achievementsResult.data || []) as EarnedAchievement[];

  // Calculate streak
  const streak = calculateStreak(weeklyTrend, currentWeekStart);

  // Get next achievable achievement
  const nextAchievement = getNextAchievement(achievements, aggregate, streak);

  return {
    error: null,
    data: {
      current_week: currentWeek,
      weekly_trend: weeklyTrend,
      aggregate,
      streak,
      achievements,
      next_achievement: nextAchievement,
    },
  };
}

/**
 * Recalculate and update waste metrics for a specific week
 * This is called after cooking history or meal plan changes
 */
export async function recalculateWasteMetrics(
  weekStart?: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Get user's household
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return { error: "No household found" };
  }

  const targetWeek = weekStart || getCurrentWeekStart();

  // Call the database function to calculate and upsert metrics
  const { error } = await supabase.rpc("calculate_waste_metrics", {
    p_household_id: membership.household_id,
    p_week_start: targetWeek,
  });

  if (error) {
    console.error("Error recalculating waste metrics:", error);
    return { error: error.message };
  }

  return { error: null };
}

/**
 * Check and award any new achievements
 * Called after metrics are updated
 */
export async function checkAchievements(): Promise<{
  error: string | null;
  newAchievements: EarnedAchievement[];
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", newAchievements: [] };
  }

  // Get user's household
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return { error: "No household found", newAchievements: [] };
  }

  // Call the database function to check achievements
  const { data, error } = await supabase.rpc("check_waste_achievements", {
    p_household_id: membership.household_id,
  });

  if (error) {
    console.error("Error checking achievements:", error);
    return { error: error.message, newAchievements: [] };
  }

  return {
    error: null,
    newAchievements: (data || []) as EarnedAchievement[],
  };
}

/**
 * Get aggregate metrics for a specific period
 */
export async function getAggregateMetrics(
  period: "week" | "month" | "year" | "all_time" = "all_time"
): Promise<{
  error: string | null;
  data: AggregateWasteMetrics | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  // Get user's household
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return { error: "No household found", data: null };
  }

  const { data, error } = await supabase.rpc("get_aggregate_waste_metrics", {
    p_household_id: membership.household_id,
    p_period: period,
  });

  if (error) {
    console.error("Error fetching aggregate metrics:", error);
    return { error: error.message, data: null };
  }

  const result = (data as Array<{
    total_meals_planned: number;
    total_meals_cooked: number;
    total_waste_prevented_kg: number;
    total_money_saved_cents: number;
    total_co2_saved_kg: number;
    average_utilization_rate: number;
    average_shopping_efficiency: number;
    weeks_tracked: number;
  }>)?.[0];

  if (!result) {
    return {
      error: null,
      data: {
        period,
        total_meals_planned: 0,
        total_meals_cooked: 0,
        total_waste_prevented_kg: 0,
        total_money_saved_cents: 0,
        total_co2_saved_kg: 0,
        average_utilization_rate: 0,
        average_shopping_efficiency: 0,
        weeks_tracked: 0,
      },
    };
  }

  return {
    error: null,
    data: {
      period,
      total_meals_planned: Number(result.total_meals_planned) || 0,
      total_meals_cooked: Number(result.total_meals_cooked) || 0,
      total_waste_prevented_kg: Number(result.total_waste_prevented_kg) || 0,
      total_money_saved_cents: Number(result.total_money_saved_cents) || 0,
      total_co2_saved_kg: Number(result.total_co2_saved_kg) || 0,
      average_utilization_rate: Number(result.average_utilization_rate) || 0,
      average_shopping_efficiency:
        Number(result.average_shopping_efficiency) || 0,
      weeks_tracked: Number(result.weeks_tracked) || 0,
    },
  };
}

/**
 * Get weekly metrics for trend analysis
 */
export async function getWeeklyTrend(
  weeksCount = 12
): Promise<{
  error: string | null;
  data: WasteMetrics[] | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  // Get user's household
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return { error: "No household found", data: null };
  }

  const { data, error } = await supabase
    .from("waste_metrics")
    .select("id, household_id, week_start, meals_planned, meals_cooked, shopping_items_total, shopping_items_checked, pantry_items_used, estimated_waste_prevented_kg, estimated_money_saved_cents, estimated_co2_saved_kg, created_at, updated_at")
    .eq("household_id", membership.household_id)
    .order("week_start", { ascending: false })
    .limit(weeksCount);

  if (error) {
    console.error("Error fetching weekly trend:", error);
    return { error: error.message, data: null };
  }

  return { error: null, data: (data || []) as WasteMetrics[] };
}
