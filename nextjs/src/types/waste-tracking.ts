// Food Waste Tracking Types

/**
 * Weekly waste metrics (computed from existing data)
 */
export interface WasteMetrics {
  id: string;
  household_id: string;
  week_start: string;  // ISO date (Monday)

  // Raw counts
  meals_planned: number;
  meals_cooked: number;
  shopping_items_total: number;
  shopping_items_checked: number;
  pantry_items_used: number;

  // Computed metrics
  estimated_waste_prevented_kg: number;
  estimated_money_saved_cents: number;
  estimated_co2_saved_kg: number;

  created_at: string;
  updated_at: string;
}

/**
 * Calculated rates from waste metrics
 */
export interface WasteRates {
  utilization_rate: number;       // meals_cooked / meals_planned (0-1)
  shopping_efficiency: number;    // items_checked / items_total (0-1)
  pantry_usage_rate: number;      // pantry_items_used / items_total (0-1)
}

/**
 * Combined metrics with rates for display
 */
export interface WasteMetricsWithRates extends WasteMetrics, WasteRates {}

/**
 * Aggregate metrics over time period
 */
export interface AggregateWasteMetrics {
  period: 'week' | 'month' | 'year' | 'all_time';
  total_meals_planned: number;
  total_meals_cooked: number;
  total_waste_prevented_kg: number;
  total_money_saved_cents: number;
  total_co2_saved_kg: number;
  average_utilization_rate: number;
  average_shopping_efficiency: number;
  weeks_tracked: number;
}

/**
 * Achievement types for gamification
 */
export type AchievementType =
  // Streaks
  | 'week_warrior'        // Cooked all planned meals for a week
  | 'month_master'        // 4-week cooking streak
  | 'quarter_champion'    // 12-week cooking streak

  // Milestones - Waste Prevention
  | 'first_kg'            // Prevented 1kg of food waste
  | 'five_kg'             // Prevented 5kg of food waste
  | 'ten_kg'              // Prevented 10kg of food waste
  | 'fifty_kg'            // Prevented 50kg of food waste

  // Milestones - Money Saved
  | 'first_ten_dollars'   // Saved $10
  | 'fifty_dollars'       // Saved $50
  | 'hundred_dollars'     // Saved $100

  // Efficiency
  | 'perfect_list'        // Checked off 100% of shopping list
  | 'pantry_pro'          // Used 5+ pantry items in one week
  | 'zero_waste_week'     // 100% meal utilization for a week

  // Consistency
  | 'first_plan'          // Created first meal plan
  | 'ten_weeks'           // 10 weeks of meal planning
  | 'six_months'          // 6 months of meal planning;

/**
 * Achievement definition
 */
export interface Achievement {
  type: AchievementType;
  name: string;
  description: string;
  icon: string;  // Lucide icon name or emoji
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

/**
 * Earned achievement record
 */
export interface EarnedAchievement {
  id: string;
  household_id: string;
  achievement_type: AchievementType;
  achieved_at: string;
  metadata: Record<string, unknown>;  // e.g., { week_count: 4 }
}

/**
 * Streak information
 */
export interface StreakInfo {
  current_streak: number;          // weeks
  longest_streak: number;          // weeks
  streak_start_date: string | null;
  last_completed_week: string | null;
  is_at_risk: boolean;             // Current week not yet completed
}

/**
 * Input for calculating waste metrics
 */
export interface WeekDataInput {
  household_id: string;
  week_start: string;  // ISO date
  meals_planned: number;
  meals_cooked: number;
  items_total: number;
  items_checked: number;
  pantry_items_used: number;
}

/**
 * Dashboard data structure
 */
export interface WasteDashboardData {
  current_week: WasteMetricsWithRates | null;
  weekly_trend: WasteMetrics[];     // Last 12 weeks
  aggregate: AggregateWasteMetrics;
  streak: StreakInfo;
  achievements: EarnedAchievement[];
  next_achievement: Achievement | null;  // Next achievable
}

// Achievement definitions
export const ACHIEVEMENTS: Record<AchievementType, Achievement> = {
  // Streaks
  week_warrior: {
    type: 'week_warrior',
    name: 'Week Warrior',
    description: 'Cooked all planned meals for a week',
    icon: 'Flame',
    tier: 'bronze',
  },
  month_master: {
    type: 'month_master',
    name: 'Month Master',
    description: '4-week cooking streak',
    icon: 'Calendar',
    tier: 'silver',
  },
  quarter_champion: {
    type: 'quarter_champion',
    name: 'Quarter Champion',
    description: '12-week cooking streak',
    icon: 'Trophy',
    tier: 'gold',
  },

  // Waste Prevention Milestones
  first_kg: {
    type: 'first_kg',
    name: 'First Kilo',
    description: 'Prevented 1kg of food waste',
    icon: 'Leaf',
    tier: 'bronze',
  },
  five_kg: {
    type: 'five_kg',
    name: 'Eco Starter',
    description: 'Prevented 5kg of food waste',
    icon: 'Sprout',
    tier: 'silver',
  },
  ten_kg: {
    type: 'ten_kg',
    name: 'Waste Warrior',
    description: 'Prevented 10kg of food waste',
    icon: 'TreeDeciduous',
    tier: 'gold',
  },
  fifty_kg: {
    type: 'fifty_kg',
    name: 'Eco Champion',
    description: 'Prevented 50kg of food waste',
    icon: 'Trees',
    tier: 'platinum',
  },

  // Money Saved Milestones
  first_ten_dollars: {
    type: 'first_ten_dollars',
    name: 'Smart Saver',
    description: 'Saved $10 through meal planning',
    icon: 'PiggyBank',
    tier: 'bronze',
  },
  fifty_dollars: {
    type: 'fifty_dollars',
    name: 'Budget Boss',
    description: 'Saved $50 through meal planning',
    icon: 'Wallet',
    tier: 'silver',
  },
  hundred_dollars: {
    type: 'hundred_dollars',
    name: 'Savings Pro',
    description: 'Saved $100 through meal planning',
    icon: 'BadgeDollarSign',
    tier: 'gold',
  },

  // Efficiency
  perfect_list: {
    type: 'perfect_list',
    name: 'Perfect List',
    description: 'Checked off 100% of shopping list',
    icon: 'CheckCheck',
    tier: 'bronze',
  },
  pantry_pro: {
    type: 'pantry_pro',
    name: 'Pantry Pro',
    description: 'Used 5+ pantry items in one week',
    icon: 'UtensilsCrossed',
    tier: 'silver',
  },
  zero_waste_week: {
    type: 'zero_waste_week',
    name: 'Zero Waste Week',
    description: '100% meal utilization for a week',
    icon: 'Recycle',
    tier: 'gold',
  },

  // Consistency
  first_plan: {
    type: 'first_plan',
    name: 'First Steps',
    description: 'Created your first meal plan',
    icon: 'ClipboardList',
    tier: 'bronze',
  },
  ten_weeks: {
    type: 'ten_weeks',
    name: 'Dedicated Planner',
    description: '10 weeks of meal planning',
    icon: 'CalendarDays',
    tier: 'silver',
  },
  six_months: {
    type: 'six_months',
    name: 'Half Year Hero',
    description: '6 months of consistent meal planning',
    icon: 'Award',
    tier: 'gold',
  },
};

// Industry average constants for calculations
export const WASTE_CONSTANTS = {
  // Average food waste per meal without planning (kg)
  AVG_WASTE_PER_UNPLANNED_MEAL_KG: 0.15,

  // Average cost per kg of food waste (USD)
  AVG_COST_PER_KG_WASTE: 5.00,

  // CO2 emissions per kg of food waste (kg CO2)
  CO2_PER_KG_FOOD_WASTE: 2.5,

  // Baseline waste reduction from meal planning (multiplier)
  PLANNING_WASTE_REDUCTION_FACTOR: 0.65,  // 65% reduction vs unplanned
} as const;
