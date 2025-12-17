/**
 * Nutrition Type Definitions
 * Advanced Nutrition Tracking & Macro Planning Feature
 */

// =====================================================
// CORE NUTRITION DATA TYPES
// =====================================================

/**
 * Nutritional data per serving
 * All values are optional as nutrition data may be incomplete
 */
export interface NutritionData {
  calories?: number | null;
  protein_g?: number | null;
  carbs_g?: number | null;
  fat_g?: number | null;
  fiber_g?: number | null;
  sugar_g?: number | null;
  sodium_mg?: number | null;
}

/**
 * Complete nutrition record from database
 * Includes metadata about data source and confidence
 */
export interface RecipeNutrition extends NutritionData {
  id: string;
  recipe_id: string;
  source: NutritionSource;
  confidence_score?: number | null; // 0.00 to 1.00
  input_tokens?: number | null; // API usage tracking
  output_tokens?: number | null; // API usage tracking
  cost_usd?: number | null; // Cost in USD for AI extraction
  created_at: string;
  updated_at: string;
}

/**
 * Source of nutrition data
 * - ai_extracted: Extracted by Claude API from ingredients
 * - manual: Manually entered by user
 * - imported: Imported from external source (e.g., recipe URL)
 * - usda: From USDA FoodData Central (future enhancement)
 */
export type NutritionSource = 'ai_extracted' | 'manual' | 'imported' | 'usda';

/**
 * Confidence level categories
 */
export type ConfidenceLevel = 'low' | 'medium' | 'high' | 'unknown';

/**
 * Helper to categorize confidence score
 */
export function getConfidenceLevel(score?: number | null): ConfidenceLevel {
  if (score === null || score === undefined) return 'unknown';
  if (score < 0.3) return 'low';
  if (score < 0.7) return 'medium';
  return 'high';
}

// =====================================================
// MACRO GOALS TYPES
// =====================================================

/**
 * User's daily macro goals
 */
export interface MacroGoals {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g?: number; // Optional
}

/**
 * Macro goal preset options
 */
export type MacroGoalPreset = 'weight_loss' | 'muscle_building' | 'maintenance' | 'custom';

/**
 * Predefined macro goal presets
 * Used for quick setup in settings
 */
export const MACRO_GOAL_PRESETS: Record<Exclude<MacroGoalPreset, 'custom'>, MacroGoals> = {
  weight_loss: {
    calories: 1800,
    protein_g: 140,
    carbs_g: 150,
    fat_g: 60,
    fiber_g: 25,
  },
  muscle_building: {
    calories: 2500,
    protein_g: 180,
    carbs_g: 250,
    fat_g: 80,
    fiber_g: 30,
  },
  maintenance: {
    calories: 2000,
    protein_g: 150,
    carbs_g: 200,
    fat_g: 65,
    fiber_g: 25,
  },
};

/**
 * User's nutrition tracking settings
 * This extends the existing user_settings table
 */
export interface NutritionSettings {
  macro_goals: MacroGoals;
  macro_tracking_enabled: boolean;
  macro_goal_preset?: MacroGoalPreset | null;
}

// =====================================================
// DAILY & WEEKLY SUMMARY TYPES
// =====================================================

/**
 * Daily nutrition log entry
 * Aggregated totals for a single day
 */
export interface DailyNutritionLog extends NutritionData {
  id: string;
  user_id: string;
  household_id?: string | null;
  date: string; // ISO date string (YYYY-MM-DD)

  // Metadata
  meal_count: number;
  recipes_with_nutrition: number;
  data_completeness_pct: number; // 0-100

  created_at: string;
  updated_at: string;
}

/**
 * Single day breakdown in weekly summary
 */
export interface DayNutritionBreakdown extends NutritionData {
  day: string; // e.g., "Monday", "Tuesday"
  date: string; // ISO date string
}

/**
 * Weekly nutrition summary
 * Pre-aggregated for performance
 */
export interface WeeklyNutritionSummary {
  id: string;
  user_id: string;
  household_id?: string | null;
  week_start: string; // ISO date string (Monday)

  // Weekly totals
  total_calories?: number | null;
  total_protein_g?: number | null;
  total_carbs_g?: number | null;
  total_fat_g?: number | null;
  total_fiber_g?: number | null;

  // Daily averages
  avg_calories?: number | null;
  avg_protein_g?: number | null;
  avg_carbs_g?: number | null;
  avg_fat_g?: number | null;
  avg_fiber_g?: number | null;

  // Daily breakdown (parsed from JSONB)
  daily_breakdown?: Record<string, NutritionData>;

  // Goal tracking
  user_goals_snapshot?: MacroGoals | null;
  days_on_target?: number | null; // 0-7

  created_at: string;
  updated_at: string;
}

// =====================================================
// UI DISPLAY TYPES
// =====================================================

/**
 * Macro progress for a single macro nutrient
 * Used for progress bars and visual indicators
 */
export interface MacroProgress {
  name: string;
  actual: number | null;
  target: number;
  percentage: number; // 0-100+
  remaining: number; // How much left to hit target (0 if achieved/exceeded)
  status: 'remaining' | 'achieved' | 'exceeded'; // Non-judgmental terminology
  color: 'sage' | 'muted' | 'coral'; // Soft brand colors, not traffic lights
}

/**
 * Daily macro summary with goal comparison
 */
export interface DailyMacroSummary {
  date: string;
  day_of_week: string; // e.g., "Monday"
  nutrition: NutritionData;
  goals: MacroGoals;
  progress: {
    calories: MacroProgress;
    protein: MacroProgress;
    carbs: MacroProgress;
    fat: MacroProgress;
    fiber?: MacroProgress;
  };
  meal_count: number;
  data_completeness_pct: number;
}

/**
 * Weekly macro dashboard data
 */
export interface WeeklyMacroDashboard {
  week_start: string;
  week_end: string;
  days: DailyMacroSummary[];
  weekly_totals: NutritionData;
  weekly_averages: NutritionData;
  goals: MacroGoals;
  overall_progress: {
    calories: MacroProgress;
    protein: MacroProgress;
    carbs: MacroProgress;
    fat: MacroProgress;
    fiber?: MacroProgress;
  };
  days_on_target: number; // 0-7
}

// =====================================================
// NUTRITION EXTRACTION TYPES
// =====================================================

/**
 * Request for AI nutrition extraction
 */
export interface NutritionExtractionRequest {
  recipe_id: string;
  ingredients: string[];
  servings: number;
  title?: string; // Optional recipe title for better context
  instructions?: string[]; // Optional instructions for better context
  force_reextract?: boolean; // Override existing nutrition data
}

/**
 * Response from AI nutrition extraction
 */
export interface NutritionExtractionResponse {
  success: boolean;
  nutrition?: RecipeNutrition;
  error?: string;
  confidence_level?: ConfidenceLevel;
}

/**
 * Nutrition extraction queue entry
 */
export interface NutritionExtractionQueueItem {
  id: string;
  recipe_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  priority: number;
  attempts: number;
  last_error?: string | null;
  created_at: string;
  started_at?: string | null;
  completed_at?: string | null;
}

// =====================================================
// RECIPE WITH NUTRITION TYPES
// =====================================================

/**
 * Recipe with nutrition data included
 * Extends base recipe type
 */
export interface RecipeWithNutrition {
  id: string;
  title: string;
  servings: string;
  base_servings: number;
  nutrition?: RecipeNutrition | null;
  // ... other recipe fields
}

// =====================================================
// VALIDATION & CALCULATION HELPERS
// =====================================================

/**
 * Check if nutrition data is complete
 */
export function isNutritionComplete(nutrition: NutritionData): boolean {
  return !!(
    nutrition.calories &&
    nutrition.protein_g &&
    nutrition.carbs_g &&
    nutrition.fat_g
  );
}

/**
 * Check if nutrition data is valid (has at least one value)
 */
export function hasNutritionData(nutrition?: NutritionData | null): boolean {
  if (!nutrition) return false;
  return !!(
    nutrition.calories ||
    nutrition.protein_g ||
    nutrition.carbs_g ||
    nutrition.fat_g ||
    nutrition.fiber_g ||
    nutrition.sugar_g ||
    nutrition.sodium_mg
  );
}

/**
 * Calculate macro progress with non-judgmental soft colors
 * Returns percentage, remaining amount, and soft status
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
      remaining: target,
      status: 'remaining',
      color: 'muted',
    };
  }

  const percentage = (actual / target) * 100;
  const remaining = Math.max(0, target - actual);

  // Non-judgmental status: achieved (within ±10%), exceeded, or remaining
  let status: 'remaining' | 'achieved' | 'exceeded';
  let color: 'sage' | 'muted' | 'coral';

  if (percentage >= 90 && percentage <= 110) {
    // Within ±10% of target = achieved
    status = 'achieved';
    color = 'sage';
  } else if (percentage > 110) {
    // Exceeded target (soft coral, not harsh red)
    status = 'exceeded';
    color = 'coral';
  } else {
    // Still working toward goal
    status = 'remaining';
    color = 'muted';
  }

  return {
    name,
    actual,
    target,
    percentage: Math.round(percentage),
    remaining: Math.round(remaining),
    status,
    color,
  };
}

/**
 * Sum nutrition data from multiple sources
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

  items.forEach((item) => {
    if (!item) return;

    if (item.calories) result.calories = (result.calories || 0) + item.calories;
    if (item.protein_g) result.protein_g = (result.protein_g || 0) + item.protein_g;
    if (item.carbs_g) result.carbs_g = (result.carbs_g || 0) + item.carbs_g;
    if (item.fat_g) result.fat_g = (result.fat_g || 0) + item.fat_g;
    if (item.fiber_g) result.fiber_g = (result.fiber_g || 0) + item.fiber_g;
    if (item.sugar_g) result.sugar_g = (result.sugar_g || 0) + item.sugar_g;
    if (item.sodium_mg) result.sodium_mg = (result.sodium_mg || 0) + item.sodium_mg;
  });

  return result;
}

/**
 * Scale nutrition data by servings
 */
export function scaleNutrition(
  nutrition: NutritionData,
  baseServings: number,
  targetServings: number
): NutritionData {
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
 * Get color for progress status
 * Returns Tailwind CSS color class - soft, non-judgmental colors
 */
export function getProgressColor(status: MacroProgress['status']): string {
  switch (status) {
    case 'achieved':
      return 'text-brand-sage';
    case 'remaining':
      return 'text-muted-foreground';
    case 'exceeded':
      return 'text-brand-coral/80';
  }
}

/**
 * Get background color for progress bar
 * Uses soft brand colors instead of traffic light colors
 */
export function getProgressBgColor(color: MacroProgress['color']): string {
  switch (color) {
    case 'sage':
      return 'bg-brand-sage';
    case 'muted':
      return 'bg-muted-foreground/40';
    case 'coral':
      return 'bg-brand-coral/60';
  }
}
