/**
 * Nutrition Calculation Utilities
 * Functions for calculating, aggregating, and comparing nutritional data
 */

import type {
  NutritionData,
  MacroGoals,
  MacroProgress,
  DailyMacroSummary,
  WeeklyMacroDashboard,
} from "@/types/nutrition";

// =====================================================
// AGGREGATION FUNCTIONS
// =====================================================

/**
 * Sum multiple nutrition data objects
 * Handles null/undefined values gracefully
 * Note: Zero values (0) are treated as valid data, not missing data
 */
export function sumNutrition(items: (NutritionData | null | undefined)[]): NutritionData {
  const result: NutritionData = {
    calories: 0,
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0,
    fiber_g: 0,
    sugar_g: 0,
    sodium_mg: 0,
  };

  let hasData = false;

  items.forEach((item) => {
    if (!item) return;

    // Use explicit null/undefined checks (0 is treated as valid data)
    if (item.calories !== null && item.calories !== undefined) {
      result.calories = (result.calories ?? 0) + item.calories;
      hasData = true;
    }
    if (item.protein_g !== null && item.protein_g !== undefined) {
      result.protein_g = (result.protein_g ?? 0) + item.protein_g;
      hasData = true;
    }
    if (item.carbs_g !== null && item.carbs_g !== undefined) {
      result.carbs_g = (result.carbs_g ?? 0) + item.carbs_g;
      hasData = true;
    }
    if (item.fat_g !== null && item.fat_g !== undefined) {
      result.fat_g = (result.fat_g ?? 0) + item.fat_g;
      hasData = true;
    }
    if (item.fiber_g !== null && item.fiber_g !== undefined) {
      result.fiber_g = (result.fiber_g ?? 0) + item.fiber_g;
      hasData = true;
    }
    if (item.sugar_g !== null && item.sugar_g !== undefined) {
      result.sugar_g = (result.sugar_g ?? 0) + item.sugar_g;
      hasData = true;
    }
    if (item.sodium_mg !== null && item.sodium_mg !== undefined) {
      result.sodium_mg = (result.sodium_mg ?? 0) + item.sodium_mg;
      hasData = true;
    }
  });

  // If no data at all, return all nulls
  if (!hasData) {
    return {
      calories: null,
      protein_g: null,
      carbs_g: null,
      fat_g: null,
      fiber_g: null,
      sugar_g: null,
      sodium_mg: null,
    };
  }

  return result;
}

/**
 * Calculate average nutrition from multiple data points
 * Averages are calculated per-field, not per-item
 * (i.e., if 3 items have calories but only 2 have carbs, carbs are averaged over 2 items)
 */
export function averageNutrition(items: (NutritionData | null | undefined)[]): NutritionData {
  if (items.length === 0) {
    return {
      calories: null,
      protein_g: null,
      carbs_g: null,
      fat_g: null,
      fiber_g: null,
      sugar_g: null,
      sodium_mg: null,
    };
  }

  // Count valid (non-null, non-undefined) values per field
  let calorieSum = 0,
    calorieCount = 0;
  let proteinSum = 0,
    proteinCount = 0;
  let carbsSum = 0,
    carbsCount = 0;
  let fatSum = 0,
    fatCount = 0;
  let fiberSum = 0,
    fiberCount = 0;
  let sugarSum = 0,
    sugarCount = 0;
  let sodiumSum = 0,
    sodiumCount = 0;

  items.forEach((item) => {
    if (!item) return;

    if (item.calories !== null && item.calories !== undefined) {
      calorieSum += item.calories;
      calorieCount++;
    }
    if (item.protein_g !== null && item.protein_g !== undefined) {
      proteinSum += item.protein_g;
      proteinCount++;
    }
    if (item.carbs_g !== null && item.carbs_g !== undefined) {
      carbsSum += item.carbs_g;
      carbsCount++;
    }
    if (item.fat_g !== null && item.fat_g !== undefined) {
      fatSum += item.fat_g;
      fatCount++;
    }
    if (item.fiber_g !== null && item.fiber_g !== undefined) {
      fiberSum += item.fiber_g;
      fiberCount++;
    }
    if (item.sugar_g !== null && item.sugar_g !== undefined) {
      sugarSum += item.sugar_g;
      sugarCount++;
    }
    if (item.sodium_mg !== null && item.sodium_mg !== undefined) {
      sodiumSum += item.sodium_mg;
      sodiumCount++;
    }
  });

  return {
    calories: calorieCount > 0 ? Math.round(calorieSum / calorieCount) : null,
    protein_g:
      proteinCount > 0
        ? Math.round((proteinSum / proteinCount) * 10) / 10
        : null,
    carbs_g:
      carbsCount > 0
        ? Math.round((carbsSum / carbsCount) * 10) / 10
        : null,
    fat_g: fatCount > 0 ? Math.round((fatSum / fatCount) * 10) / 10 : null,
    fiber_g:
      fiberCount > 0
        ? Math.round((fiberSum / fiberCount) * 10) / 10
        : null,
    sugar_g:
      sugarCount > 0
        ? Math.round((sugarSum / sugarCount) * 10) / 10
        : null,
    sodium_mg: sodiumCount > 0 ? Math.round(sodiumSum / sodiumCount) : null,
  };
}

// =====================================================
// SCALING FUNCTIONS
// =====================================================

/**
 * Scale nutrition data by servings
 * Used when recipes are scaled up or down
 */
export function scaleNutrition(
  nutrition: NutritionData,
  baseServings: number,
  targetServings: number
): NutritionData {
  if (baseServings === 0) {
    console.warn('Cannot scale nutrition: baseServings is 0');
    return nutrition;
  }

  if (targetServings < 0) {
    console.warn('Cannot scale nutrition: targetServings cannot be negative');
    return nutrition;
  }

  if (targetServings === 0) {
    // Return zero nutrition for 0 servings
    return {
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      sugar_g: 0,
      sodium_mg: 0,
    };
  }

  const scale = targetServings / baseServings;

  return {
    calories: nutrition.calories ? Math.round(nutrition.calories * scale) : null,
    protein_g: nutrition.protein_g ? Math.round(nutrition.protein_g * scale * 10) / 10 : null,
    carbs_g: nutrition.carbs_g ? Math.round(nutrition.carbs_g * scale * 10) / 10 : null,
    fat_g: nutrition.fat_g ? Math.round(nutrition.fat_g * scale * 10) / 10 : null,
    fiber_g: nutrition.fiber_g ? Math.round(nutrition.fiber_g * scale * 10) / 10 : null,
    sugar_g: nutrition.sugar_g ? Math.round(nutrition.sugar_g * scale * 10) / 10 : null,
    sodium_mg: nutrition.sodium_mg ? Math.round(nutrition.sodium_mg * scale) : null,
  };
}

// =====================================================
// PROGRESS CALCULATION FUNCTIONS
// =====================================================

/**
 * Calculate progress for a single macro nutrient
 * Returns percentage, status, and color
 */
export function calculateMacroProgress(
  actual: number | null | undefined,
  target: number,
  name: string
): MacroProgress {
  if (actual === null || actual === undefined) {
    return {
      name,
      actual: null,
      target,
      percentage: 0,
      status: 'under',
      color: 'red',
    };
  }

  const percentage = (actual / target) * 100;
  const diff = Math.abs(percentage - 100);

  let status: 'under' | 'on_target' | 'over';
  let color: 'red' | 'yellow' | 'green';

  // ±10% tolerance for "on target"
  if (diff <= 10) {
    status = 'on_target';
    color = 'green';
  } else if (percentage < 100) {
    status = 'under';
    color = diff <= 20 ? 'yellow' : 'red';
  } else {
    status = 'over';
    color = diff <= 20 ? 'yellow' : 'red';
  }

  return {
    name,
    actual,
    target,
    percentage: Math.round(percentage),
    status,
    color,
  };
}

/**
 * Calculate progress for all macros
 */
export function calculateAllMacroProgress(
  nutrition: NutritionData,
  goals: MacroGoals
): {
  calories: MacroProgress;
  protein: MacroProgress;
  carbs: MacroProgress;
  fat: MacroProgress;
  fiber?: MacroProgress;
} {
  const progress = {
    calories: calculateMacroProgress(nutrition.calories, goals.calories, 'Calories'),
    protein: calculateMacroProgress(nutrition.protein_g, goals.protein_g, 'Protein'),
    carbs: calculateMacroProgress(nutrition.carbs_g, goals.carbs_g, 'Carbs'),
    fat: calculateMacroProgress(nutrition.fat_g, goals.fat_g, 'Fat'),
  };

  if (goals.fiber_g && nutrition.fiber_g !== undefined) {
    return {
      ...progress,
      fiber: calculateMacroProgress(nutrition.fiber_g, goals.fiber_g, 'Fiber'),
    };
  }

  return progress;
}

/**
 * Check if a day is "on target" (all macros within ±10%)
 */
export function isDayOnTarget(nutrition: NutritionData, goals: MacroGoals): boolean {
  const progress = calculateAllMacroProgress(nutrition, goals);

  return (
    progress.calories.status === 'on_target' &&
    progress.protein.status === 'on_target' &&
    progress.carbs.status === 'on_target' &&
    progress.fat.status === 'on_target'
  );
}

// =====================================================
// DAILY & WEEKLY SUMMARY CALCULATIONS
// =====================================================

/**
 * Calculate daily macro summary with goal comparison
 */
export function calculateDailyMacroSummary(
  date: string,
  nutrition: NutritionData,
  goals: MacroGoals,
  meal_count: number = 0,
  data_completeness_pct: number = 0
): DailyMacroSummary {
  const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });

  return {
    date,
    day_of_week: dayOfWeek,
    nutrition,
    goals,
    progress: calculateAllMacroProgress(nutrition, goals),
    meal_count,
    data_completeness_pct,
  };
}

/**
 * Calculate weekly macro dashboard from daily summaries
 */
export function calculateWeeklyMacroDashboard(
  weekStart: string,
  dailySummaries: DailyMacroSummary[],
  goals: MacroGoals
): WeeklyMacroDashboard {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  // Calculate weekly totals
  const weeklyTotals = sumNutrition(dailySummaries.map(day => day.nutrition));

  // Calculate weekly averages
  const weeklyAverages = averageNutrition(dailySummaries.map(day => day.nutrition));

  // Calculate overall progress based on weekly averages
  const overallProgress = calculateAllMacroProgress(weeklyAverages, goals);

  // Count days on target
  const daysOnTarget = dailySummaries.filter(day =>
    isDayOnTarget(day.nutrition, goals)
  ).length;

  return {
    week_start: weekStart,
    week_end: weekEnd.toISOString().split('T')[0],
    days: dailySummaries,
    weekly_totals: weeklyTotals,
    weekly_averages: weeklyAverages,
    goals,
    overall_progress: overallProgress,
    days_on_target: daysOnTarget,
  };
}

// =====================================================
// DATA COMPLETENESS CALCULATIONS
// =====================================================

/**
 * Calculate what percentage of meals have nutrition data
 */
export function calculateDataCompleteness(
  totalMeals: number,
  mealsWithNutrition: number
): number {
  if (totalMeals === 0) return 0;
  return Math.round((mealsWithNutrition / totalMeals) * 100);
}

/**
 * Check if nutrition data is sufficient for tracking
 * Returns true if at least calories and protein are available
 */
export function hasMinimalNutrition(nutrition: NutritionData): boolean {
  return !!(nutrition.calories && nutrition.protein_g);
}

/**
 * Check if nutrition data is complete (all major macros present)
 */
export function isNutritionComplete(nutrition: NutritionData): boolean {
  return !!(
    nutrition.calories &&
    nutrition.protein_g &&
    nutrition.carbs_g &&
    nutrition.fat_g
  );
}

// =====================================================
// FORMATTING UTILITIES
// =====================================================

/**
 * Format nutrition value for display
 */
export function formatNutritionValue(
  value: number | null | undefined,
  unit: string,
  decimals: number = 0
): string {
  if (value === null || value === undefined) return 'N/A';
  return `${value.toFixed(decimals)}${unit}`;
}

/**
 * Format macro progress percentage
 */
export function formatProgressPercentage(percentage: number): string {
  return `${percentage}%`;
}

/**
 * Get user-friendly status text
 */
export function getStatusText(status: MacroProgress['status']): string {
  switch (status) {
    case 'on_target':
      return 'On Target';
    case 'under':
      return 'Under Target';
    case 'over':
      return 'Over Target';
  }
}

// =====================================================
// COLOR HELPERS
// =====================================================

/**
 * Get Tailwind CSS color classes for progress status
 */
export function getProgressColor(status: MacroProgress['status']): string {
  switch (status) {
    case 'on_target':
      return 'text-green-600 dark:text-green-400';
    case 'under':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'over':
      return 'text-red-600 dark:text-red-400';
  }
}

/**
 * Get background color for progress bar
 */
export function getProgressBgColor(color: MacroProgress['color']): string {
  switch (color) {
    case 'green':
      return 'bg-green-500';
    case 'yellow':
      return 'bg-yellow-500';
    case 'red':
      return 'bg-red-500';
  }
}

/**
 * Get background color for progress ring
 */
export function getProgressRingColor(color: MacroProgress['color']): string {
  switch (color) {
    case 'green':
      return 'stroke-green-500';
    case 'yellow':
      return 'stroke-yellow-500';
    case 'red':
      return 'stroke-red-500';
  }
}

// =====================================================
// DAY OF WEEK UTILITIES
// =====================================================

/**
 * Get array of days for a week starting from a date
 */
export function getWeekDays(weekStart: string): string[] {
  const days: string[] = [];
  const start = new Date(weekStart);

  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    days.push(day.toISOString().split('T')[0]);
  }

  return days;
}

/**
 * Get day of week name from ISO date
 */
export function getDayOfWeek(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
}

/**
 * Get short day of week name
 */
export function getShortDayOfWeek(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
}

// =====================================================
// CALORIE DISTRIBUTION ANALYSIS
// =====================================================

/**
 * Calculate percentage of calories from each macro
 */
export function calculateMacroCalorieDistribution(nutrition: NutritionData): {
  protein_pct: number;
  carbs_pct: number;
  fat_pct: number;
} {
  if (!nutrition.calories || nutrition.calories === 0) {
    return { protein_pct: 0, carbs_pct: 0, fat_pct: 0 };
  }

  const proteinCal = (nutrition.protein_g || 0) * 4;
  const carbsCal = (nutrition.carbs_g || 0) * 4;
  const fatCal = (nutrition.fat_g || 0) * 9;

  const totalMacroCal = proteinCal + carbsCal + fatCal;

  if (totalMacroCal === 0) {
    return { protein_pct: 0, carbs_pct: 0, fat_pct: 0 };
  }

  return {
    protein_pct: Math.round((proteinCal / totalMacroCal) * 100),
    carbs_pct: Math.round((carbsCal / totalMacroCal) * 100),
    fat_pct: Math.round((fatCal / totalMacroCal) * 100),
  };
}

/**
 * Check if macro distribution is balanced
 * Typical balanced: 20-35% protein, 45-65% carbs, 20-35% fat
 */
export function isMacroDistributionBalanced(nutrition: NutritionData): boolean {
  const dist = calculateMacroCalorieDistribution(nutrition);

  return (
    dist.protein_pct >= 20 &&
    dist.protein_pct <= 35 &&
    dist.carbs_pct >= 45 &&
    dist.carbs_pct <= 65 &&
    dist.fat_pct >= 20 &&
    dist.fat_pct <= 35
  );
}

// =====================================================
// STREAK CALCULATIONS
// =====================================================

/**
 * Count how many macros are on target (green) for a day
 * Returns 0-4 based on calories, protein, carbs, fat
 */
export function countMacrosOnTarget(
  nutrition: NutritionData,
  goals: MacroGoals
): number {
  const progress = calculateAllMacroProgress(nutrition, goals);
  let count = 0;

  if (progress.calories.color === 'green') count++;
  if (progress.protein.color === 'green') count++;
  if (progress.carbs.color === 'green') count++;
  if (progress.fat.color === 'green') count++;

  return count;
}

/**
 * Check if a day counts toward the streak
 * A day counts if at least 3 of 4 macros are on target (within ±10%)
 */
export function isDayStreakWorthy(
  nutrition: NutritionData,
  goals: MacroGoals,
  hasMeals: boolean = true
): boolean {
  if (!hasMeals) return false;
  return countMacrosOnTarget(nutrition, goals) >= 3;
}

/**
 * Calculate current streak from daily summaries
 * Counts consecutive days (from today backward) where user hit 3+ macros
 * Stops counting when a day is missed or has no meals
 */
export function calculateCurrentStreak(
  dailySummaries: DailyMacroSummary[]
): number {
  // Sort by date descending (most recent first)
  const sorted = [...dailySummaries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;

  for (const day of sorted) {
    const dayDate = new Date(day.date);
    dayDate.setHours(0, 0, 0, 0);

    // Skip future days
    if (dayDate > today) continue;

    // Check if this day counts toward streak
    const hasMeals = day.meal_count > 0;
    const isStreakWorthy = hasMeals && countMacrosOnTargetFromSummary(day) >= 3;

    if (isStreakWorthy) {
      streak++;
    } else {
      // Break the streak at first non-qualifying day
      break;
    }
  }

  return streak;
}

/**
 * Count macros on target from a DailyMacroSummary
 * Uses the pre-calculated progress data
 */
export function countMacrosOnTargetFromSummary(day: DailyMacroSummary): number {
  let count = 0;

  if (day.progress.calories.color === 'green') count++;
  if (day.progress.protein.color === 'green') count++;
  if (day.progress.carbs.color === 'green') count++;
  if (day.progress.fat.color === 'green') count++;

  return count;
}
