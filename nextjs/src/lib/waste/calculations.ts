/**
 * Food Waste Tracking Calculations
 *
 * These calculations estimate waste reduction based on meal planning behavior.
 * We can't measure actual waste, but research shows meal planning reduces
 * household food waste by ~25-40% (USDA, 2021).
 *
 * Our approach: Track proxy metrics (meals planned vs cooked, shopping efficiency)
 * and apply conservative industry-average multipliers.
 */

import {
  type WasteMetrics,
  type WasteMetricsWithRates,
  type WasteRates,
  type AggregateWasteMetrics,
  type StreakInfo,
  type Achievement,
  type AchievementType,
  type EarnedAchievement,
  WASTE_CONSTANTS,
  ACHIEVEMENTS,
} from '@/types/waste-tracking';

/**
 * Calculate waste rates from raw metrics
 */
export function calculateWasteRates(metrics: WasteMetrics): WasteRates {
  const utilization_rate =
    metrics.meals_planned > 0
      ? metrics.meals_cooked / metrics.meals_planned
      : 0;

  const shopping_efficiency =
    metrics.shopping_items_total > 0
      ? metrics.shopping_items_checked / metrics.shopping_items_total
      : 0;

  const pantry_usage_rate =
    metrics.shopping_items_total > 0
      ? metrics.pantry_items_used / metrics.shopping_items_total
      : 0;

  return {
    utilization_rate: Math.min(utilization_rate, 1),
    shopping_efficiency: Math.min(shopping_efficiency, 1),
    pantry_usage_rate: Math.min(pantry_usage_rate, 1),
  };
}

/**
 * Combine metrics with calculated rates
 */
export function enrichMetricsWithRates(
  metrics: WasteMetrics
): WasteMetricsWithRates {
  const rates = calculateWasteRates(metrics);
  return { ...metrics, ...rates };
}

/**
 * Calculate estimated waste prevented from raw counts
 *
 * Formula based on research:
 * - Average household wastes ~150g per unplanned meal
 * - Meal planning reduces waste by ~65% (PLANNING_WASTE_REDUCTION_FACTOR)
 * - Utilization rate scales the benefit (cooking what you planned)
 */
export function calculateWastePrevented(
  mealsCookedCount: number,
  utilizationRate: number
): number {
  const {
    AVG_WASTE_PER_UNPLANNED_MEAL_KG,
    PLANNING_WASTE_REDUCTION_FACTOR,
  } = WASTE_CONSTANTS;

  // Base calculation: meals cooked * avg waste per meal * planning factor
  // Then scale by utilization rate (higher utilization = more waste prevented)
  const wastePrevented =
    mealsCookedCount *
    AVG_WASTE_PER_UNPLANNED_MEAL_KG *
    utilizationRate *
    PLANNING_WASTE_REDUCTION_FACTOR;

  return Math.round(wastePrevented * 1000) / 1000; // Round to 3 decimals
}

/**
 * Calculate money saved from waste prevented
 */
export function calculateMoneySaved(wastePreventedKg: number): number {
  const { AVG_COST_PER_KG_WASTE } = WASTE_CONSTANTS;
  // Return in cents for precision
  return Math.round(wastePreventedKg * AVG_COST_PER_KG_WASTE * 100);
}

/**
 * Calculate CO2 emissions prevented
 */
export function calculateCO2Saved(wastePreventedKg: number): number {
  const { CO2_PER_KG_FOOD_WASTE } = WASTE_CONSTANTS;
  return Math.round(wastePreventedKg * CO2_PER_KG_FOOD_WASTE * 1000) / 1000;
}

/**
 * Calculate all derived metrics from raw counts
 */
export function calculateAllMetrics(input: {
  mealsPlanned: number;
  mealsCooked: number;
  itemsTotal: number;
  itemsChecked: number;
  pantryItemsUsed: number;
}): {
  wastePrevented: number;
  moneySavedCents: number;
  co2Saved: number;
  utilizationRate: number;
  shoppingEfficiency: number;
} {
  const utilizationRate =
    input.mealsPlanned > 0 ? input.mealsCooked / input.mealsPlanned : 0;

  const shoppingEfficiency =
    input.itemsTotal > 0 ? input.itemsChecked / input.itemsTotal : 0;

  const wastePrevented = calculateWastePrevented(
    input.mealsCooked,
    utilizationRate
  );
  const moneySavedCents = calculateMoneySaved(wastePrevented);
  const co2Saved = calculateCO2Saved(wastePrevented);

  return {
    wastePrevented,
    moneySavedCents,
    co2Saved,
    utilizationRate,
    shoppingEfficiency,
  };
}

/**
 * Format money for display (cents to dollars)
 */
export function formatMoneySaved(cents: number): string {
  const dollars = cents / 100;
  if (dollars >= 1000) {
    return `$${(dollars / 1000).toFixed(1)}k`;
  }
  return `$${dollars.toFixed(2)}`;
}

/**
 * Format weight for display
 */
export function formatWeight(kg: number): string {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(1)} tonnes`;
  }
  if (kg >= 1) {
    return `${kg.toFixed(1)} kg`;
  }
  return `${Math.round(kg * 1000)} g`;
}

/**
 * Format percentage for display
 */
export function formatPercent(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

/**
 * Calculate streak information from weekly metrics
 */
export function calculateStreak(
  weeklyMetrics: WasteMetrics[],
  currentWeekStart: string
): StreakInfo {
  if (weeklyMetrics.length === 0) {
    return {
      current_streak: 0,
      longest_streak: 0,
      streak_start_date: null,
      last_completed_week: null,
      is_at_risk: true,
    };
  }

  // Sort by week_start descending (most recent first)
  const sorted = [...weeklyMetrics].sort(
    (a, b) => new Date(b.week_start).getTime() - new Date(a.week_start).getTime()
  );

  // A week is "completed" if utilization rate >= 80%
  const isWeekCompleted = (m: WasteMetrics) => {
    const rate = m.meals_planned > 0 ? m.meals_cooked / m.meals_planned : 0;
    return rate >= 0.8;
  };

  // Calculate current streak (consecutive weeks from most recent)
  let currentStreak = 0;
  let streakStartDate: string | null = null;
  let lastCompletedWeek: string | null = null;

  for (let i = 0; i < sorted.length; i++) {
    if (isWeekCompleted(sorted[i])) {
      currentStreak++;
      streakStartDate = sorted[i].week_start;
      if (lastCompletedWeek === null) {
        lastCompletedWeek = sorted[i].week_start;
      }
    } else {
      break; // Streak broken
    }
  }

  // Calculate longest streak ever
  let longestStreak = 0;
  let tempStreak = 0;

  for (let i = 0; i < sorted.length; i++) {
    if (isWeekCompleted(sorted[i])) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  // Check if current week is at risk (not yet completed)
  const currentWeekMetric = sorted.find(
    (m) => m.week_start === currentWeekStart
  );
  const isAtRisk = !currentWeekMetric || !isWeekCompleted(currentWeekMetric);

  return {
    current_streak: currentStreak,
    longest_streak: longestStreak,
    streak_start_date: streakStartDate,
    last_completed_week: lastCompletedWeek,
    is_at_risk: isAtRisk && currentStreak > 0,
  };
}

/**
 * Get the next achievable achievement based on current progress
 */
export function getNextAchievement(
  earned: EarnedAchievement[],
  aggregate: AggregateWasteMetrics,
  streak: StreakInfo
): Achievement | null {
  const earnedTypes = new Set(earned.map((e) => e.achievement_type));

  // Define achievement requirements
  const requirements: Array<{
    type: AchievementType;
    check: () => boolean;
    progress: () => number; // 0-1 progress toward achievement
  }> = [
    // Waste prevention milestones
    {
      type: 'first_kg',
      check: () => aggregate.total_waste_prevented_kg >= 1,
      progress: () => Math.min(aggregate.total_waste_prevented_kg / 1, 1),
    },
    {
      type: 'five_kg',
      check: () => aggregate.total_waste_prevented_kg >= 5,
      progress: () => Math.min(aggregate.total_waste_prevented_kg / 5, 1),
    },
    {
      type: 'ten_kg',
      check: () => aggregate.total_waste_prevented_kg >= 10,
      progress: () => Math.min(aggregate.total_waste_prevented_kg / 10, 1),
    },
    {
      type: 'fifty_kg',
      check: () => aggregate.total_waste_prevented_kg >= 50,
      progress: () => Math.min(aggregate.total_waste_prevented_kg / 50, 1),
    },

    // Money saved milestones
    {
      type: 'first_ten_dollars',
      check: () => aggregate.total_money_saved_cents >= 1000,
      progress: () => Math.min(aggregate.total_money_saved_cents / 1000, 1),
    },
    {
      type: 'fifty_dollars',
      check: () => aggregate.total_money_saved_cents >= 5000,
      progress: () => Math.min(aggregate.total_money_saved_cents / 5000, 1),
    },
    {
      type: 'hundred_dollars',
      check: () => aggregate.total_money_saved_cents >= 10000,
      progress: () => Math.min(aggregate.total_money_saved_cents / 10000, 1),
    },

    // Streak achievements
    {
      type: 'week_warrior',
      check: () => aggregate.average_utilization_rate >= 1 && aggregate.weeks_tracked >= 1,
      progress: () => Math.min(aggregate.average_utilization_rate, 1),
    },
    {
      type: 'month_master',
      check: () => streak.current_streak >= 4,
      progress: () => Math.min(streak.current_streak / 4, 1),
    },
    {
      type: 'quarter_champion',
      check: () => streak.current_streak >= 12,
      progress: () => Math.min(streak.current_streak / 12, 1),
    },

    // Consistency milestones
    {
      type: 'first_plan',
      check: () => aggregate.weeks_tracked >= 1,
      progress: () => Math.min(aggregate.weeks_tracked / 1, 1),
    },
    {
      type: 'ten_weeks',
      check: () => aggregate.weeks_tracked >= 10,
      progress: () => Math.min(aggregate.weeks_tracked / 10, 1),
    },
    {
      type: 'six_months',
      check: () => aggregate.weeks_tracked >= 26,
      progress: () => Math.min(aggregate.weeks_tracked / 26, 1),
    },
  ];

  // Find the first unearned achievement with highest progress
  const unearned = requirements
    .filter((r) => !earnedTypes.has(r.type))
    .map((r) => ({
      achievement: ACHIEVEMENTS[r.type],
      progress: r.progress(),
      met: r.check(),
    }))
    .sort((a, b) => b.progress - a.progress);

  if (unearned.length === 0) {
    return null;
  }

  return unearned[0].achievement;
}

/**
 * Get achievement progress (0-1) for a specific type
 */
export function getAchievementProgress(
  type: AchievementType,
  aggregate: AggregateWasteMetrics,
  streak: StreakInfo
): number {
  const progressMap: Partial<Record<AchievementType, number>> = {
    first_kg: Math.min(aggregate.total_waste_prevented_kg / 1, 1),
    five_kg: Math.min(aggregate.total_waste_prevented_kg / 5, 1),
    ten_kg: Math.min(aggregate.total_waste_prevented_kg / 10, 1),
    fifty_kg: Math.min(aggregate.total_waste_prevented_kg / 50, 1),
    first_ten_dollars: Math.min(aggregate.total_money_saved_cents / 1000, 1),
    fifty_dollars: Math.min(aggregate.total_money_saved_cents / 5000, 1),
    hundred_dollars: Math.min(aggregate.total_money_saved_cents / 10000, 1),
    week_warrior: Math.min(aggregate.average_utilization_rate, 1),
    month_master: Math.min(streak.current_streak / 4, 1),
    quarter_champion: Math.min(streak.current_streak / 12, 1),
    first_plan: Math.min(aggregate.weeks_tracked / 1, 1),
    ten_weeks: Math.min(aggregate.weeks_tracked / 10, 1),
    six_months: Math.min(aggregate.weeks_tracked / 26, 1),
  };

  return progressMap[type] ?? 0;
}

/**
 * Get the Monday of the current week
 */
export function getCurrentWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split('T')[0];
}

/**
 * Get the Monday of a specific date's week
 */
export function getWeekStartForDate(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split('T')[0];
}

/**
 * Generate a simple text summary of waste metrics
 */
export function generateImpactSummary(aggregate: AggregateWasteMetrics): string {
  const lines: string[] = [];

  if (aggregate.total_waste_prevented_kg > 0) {
    lines.push(
      `You've prevented ${formatWeight(aggregate.total_waste_prevented_kg)} of food waste!`
    );
  }

  if (aggregate.total_money_saved_cents > 0) {
    lines.push(`Saved ${formatMoneySaved(aggregate.total_money_saved_cents)} on groceries.`);
  }

  if (aggregate.total_co2_saved_kg > 0) {
    lines.push(`Reduced ${formatWeight(aggregate.total_co2_saved_kg)} of CO2 emissions.`);
  }

  if (aggregate.weeks_tracked > 0) {
    lines.push(
      `${aggregate.weeks_tracked} week${aggregate.weeks_tracked !== 1 ? 's' : ''} of meal planning!`
    );
  }

  return lines.join(' ');
}

/**
 * Get a motivational message based on current progress
 */
export function getMotivationalMessage(
  streak: StreakInfo,
  aggregate: AggregateWasteMetrics
): string {
  if (streak.is_at_risk && streak.current_streak > 0) {
    return `Keep your ${streak.current_streak}-week streak alive! Plan and cook this week.`;
  }

  if (streak.current_streak >= 4) {
    return `Amazing! ${streak.current_streak} weeks strong. You're a meal planning pro!`;
  }

  if (aggregate.total_waste_prevented_kg >= 5) {
    return `You've saved ${formatWeight(aggregate.total_waste_prevented_kg)} of food from the landfill!`;
  }

  if (aggregate.weeks_tracked === 0) {
    return "Start your meal planning journey today and track your impact!";
  }

  return "Every meal planned is a step toward less waste. Keep it up!";
}
