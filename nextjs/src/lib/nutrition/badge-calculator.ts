/**
 * Nutrition Badge Calculator
 * Calculates which nutrition badges apply to a recipe based on its nutrition data
 */

import type { NutritionData } from "@/types/nutrition";

// =====================================================
// BADGE TYPE DEFINITIONS
// =====================================================

/**
 * A nutrition badge that can be applied to a recipe
 */
export interface NutritionBadge {
  key: string;
  label: string;
  color: BadgeColor;
  description: string;
}

/**
 * Available badge colors
 */
export type BadgeColor = 'green' | 'blue' | 'purple' | 'red' | 'orange' | 'coral';

/**
 * Condition operator for badge matching
 */
export type BadgeOperator = 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'between';

/**
 * A single condition for badge matching
 */
export interface BadgeCondition {
  nutrient: keyof NutritionData;
  operator: BadgeOperator;
  value: number;
  value2?: number; // For 'between' operator
}

/**
 * Complete badge definition with conditions
 */
export interface BadgeDefinition extends NutritionBadge {
  conditions: BadgeCondition[];
  isSystem: boolean;
}

/**
 * Custom badge stored in database
 */
export interface CustomBadge {
  id: string;
  user_id?: string;
  household_id?: string;
  name: string;
  color: BadgeColor;
  conditions: BadgeCondition[];
  is_active: boolean;
  created_at: string;
}

// =====================================================
// EXAMPLE BADGE DEFINITIONS (for documentation)
// =====================================================

/**
 * Example badge definitions to show users how badges work
 * These are NOT automatically applied - users must create their own
 */
export const EXAMPLE_BADGES: BadgeDefinition[] = [
  {
    key: 'example_high_protein',
    label: 'High Protein',
    color: 'blue',
    description: 'Over 30g protein per serving',
    isSystem: false,
    conditions: [
      { nutrient: 'protein_g', operator: 'gt', value: 30 },
    ],
  },
  {
    key: 'example_low_calorie',
    label: 'Light Meal',
    color: 'green',
    description: 'Under 400 calories per serving',
    isSystem: false,
    conditions: [
      { nutrient: 'calories', operator: 'lt', value: 400 },
    ],
  },
  {
    key: 'example_kid_friendly',
    label: 'Kid Friendly',
    color: 'orange',
    description: 'Under 500 calories and under 15g sugar',
    isSystem: false,
    conditions: [
      { nutrient: 'calories', operator: 'lt', value: 500 },
      { nutrient: 'sugar_g', operator: 'lt', value: 15 },
    ],
  },
];

// Keep SYSTEM_BADGES as empty array for backwards compatibility
export const SYSTEM_BADGES: BadgeDefinition[] = [];

// =====================================================
// BADGE CALCULATION LOGIC
// =====================================================

/**
 * Check if a single condition is met
 */
function checkCondition(
  nutrition: NutritionData,
  condition: BadgeCondition
): boolean {
  const value = nutrition[condition.nutrient];

  // If nutrition value is null/undefined, condition is not met
  if (value === null || value === undefined) {
    return false;
  }

  switch (condition.operator) {
    case 'gt':
      return value > condition.value;
    case 'lt':
      return value < condition.value;
    case 'eq':
      return value === condition.value;
    case 'gte':
      return value >= condition.value;
    case 'lte':
      return value <= condition.value;
    case 'between':
      return (
        condition.value2 !== undefined &&
        value >= condition.value &&
        value <= condition.value2
      );
    default:
      return false;
  }
}

/**
 * Check if all conditions for a badge are met (AND logic)
 */
function checkBadgeConditions(
  nutrition: NutritionData,
  conditions: BadgeCondition[]
): boolean {
  if (conditions.length === 0) return false;
  return conditions.every((condition) => checkCondition(nutrition, condition));
}

/**
 * Calculate which system badges apply to nutrition data
 */
export function calculateSystemBadges(
  nutrition: NutritionData | null | undefined
): NutritionBadge[] {
  if (!nutrition) return [];

  return SYSTEM_BADGES.filter((badge) =>
    checkBadgeConditions(nutrition, badge.conditions)
  ).map(({ key, label, color, description }) => ({
    key,
    label,
    color,
    description,
  }));
}

/**
 * Calculate which custom badges apply to nutrition data
 */
export function calculateCustomBadges(
  nutrition: NutritionData | null | undefined,
  customBadges: CustomBadge[]
): NutritionBadge[] {
  if (!nutrition) return [];

  return customBadges
    .filter((badge) => badge.is_active)
    .filter((badge) => checkBadgeConditions(nutrition, badge.conditions))
    .map((badge) => ({
      key: `custom_${badge.id}`,
      label: badge.name,
      color: badge.color,
      description: formatConditionsDescription(badge.conditions),
    }));
}

/**
 * Calculate all badges (system + custom) for nutrition data
 */
export function calculateAllBadges(
  nutrition: NutritionData | null | undefined,
  customBadges: CustomBadge[] = [],
  includeSystemBadges: boolean = true
): NutritionBadge[] {
  const badges: NutritionBadge[] = [];

  if (includeSystemBadges) {
    badges.push(...calculateSystemBadges(nutrition));
  }

  badges.push(...calculateCustomBadges(nutrition, customBadges));

  return badges;
}

/**
 * Count how many recipes match a badge definition
 */
export function countMatchingRecipes(
  recipes: Array<{ nutrition?: NutritionData | null }>,
  conditions: BadgeCondition[]
): number {
  return recipes.filter(
    (recipe) => recipe.nutrition && checkBadgeConditions(recipe.nutrition, conditions)
  ).length;
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Format conditions as human-readable description
 */
export function formatConditionsDescription(conditions: BadgeCondition[]): string {
  return conditions
    .map((c) => {
      const nutrientLabel = getNutrientLabel(c.nutrient);
      const unit = getNutrientUnit(c.nutrient);

      switch (c.operator) {
        case 'gt':
          return `${nutrientLabel} > ${c.value}${unit}`;
        case 'lt':
          return `${nutrientLabel} < ${c.value}${unit}`;
        case 'eq':
          return `${nutrientLabel} = ${c.value}${unit}`;
        case 'gte':
          return `${nutrientLabel} >= ${c.value}${unit}`;
        case 'lte':
          return `${nutrientLabel} <= ${c.value}${unit}`;
        case 'between':
          return `${nutrientLabel} ${c.value}-${c.value2}${unit}`;
        default:
          return '';
      }
    })
    .filter(Boolean)
    .join(' AND ');
}

/**
 * Get human-readable label for nutrient
 */
export function getNutrientLabel(nutrient: keyof NutritionData): string {
  const labels: Record<keyof NutritionData, string> = {
    calories: 'Calories',
    protein_g: 'Protein',
    carbs_g: 'Carbs',
    fat_g: 'Fat',
    fiber_g: 'Fiber',
    sugar_g: 'Sugar',
    sodium_mg: 'Sodium',
  };
  return labels[nutrient] || nutrient;
}

/**
 * Get unit for nutrient display
 */
export function getNutrientUnit(nutrient: keyof NutritionData): string {
  const units: Record<keyof NutritionData, string> = {
    calories: '',
    protein_g: 'g',
    carbs_g: 'g',
    fat_g: 'g',
    fiber_g: 'g',
    sugar_g: 'g',
    sodium_mg: 'mg',
  };
  return units[nutrient] || '';
}

/**
 * Get Tailwind CSS classes for badge color
 */
export function getBadgeColorClasses(color: BadgeColor): {
  bg: string;
  text: string;
  border: string;
} {
  const colors: Record<BadgeColor, { bg: string; text: string; border: string }> = {
    green: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-700 dark:text-green-300',
      border: 'border-green-200 dark:border-green-800',
    },
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-200 dark:border-blue-800',
    },
    purple: {
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      text: 'text-purple-700 dark:text-purple-300',
      border: 'border-purple-200 dark:border-purple-800',
    },
    red: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-700 dark:text-red-300',
      border: 'border-red-200 dark:border-red-800',
    },
    orange: {
      bg: 'bg-orange-100 dark:bg-orange-900/30',
      text: 'text-orange-700 dark:text-orange-300',
      border: 'border-orange-200 dark:border-orange-800',
    },
    coral: {
      bg: 'bg-brand-coral/10',
      text: 'text-brand-coral',
      border: 'border-brand-coral/20',
    },
  };
  return colors[color];
}

/**
 * Get operator label for display
 */
export function getOperatorLabel(operator: BadgeOperator): string {
  const labels: Record<BadgeOperator, string> = {
    gt: 'greater than',
    lt: 'less than',
    eq: 'equals',
    gte: 'at least',
    lte: 'at most',
    between: 'between',
  };
  return labels[operator];
}

/**
 * Available nutrients for badge conditions
 */
export const AVAILABLE_NUTRIENTS: Array<{
  key: keyof NutritionData;
  label: string;
  unit: string;
}> = [
  { key: 'calories', label: 'Calories', unit: '' },
  { key: 'protein_g', label: 'Protein', unit: 'g' },
  { key: 'carbs_g', label: 'Carbs', unit: 'g' },
  { key: 'fat_g', label: 'Fat', unit: 'g' },
  { key: 'fiber_g', label: 'Fiber', unit: 'g' },
  { key: 'sugar_g', label: 'Sugar', unit: 'g' },
  { key: 'sodium_mg', label: 'Sodium', unit: 'mg' },
];

/**
 * Available operators for badge conditions
 */
export const AVAILABLE_OPERATORS: Array<{
  key: BadgeOperator;
  label: string;
}> = [
  { key: 'gt', label: 'greater than' },
  { key: 'lt', label: 'less than' },
  { key: 'gte', label: 'at least' },
  { key: 'lte', label: 'at most' },
  { key: 'between', label: 'between' },
];

/**
 * Available colors for custom badges
 */
export const AVAILABLE_BADGE_COLORS: Array<{
  key: BadgeColor;
  label: string;
}> = [
  { key: 'coral', label: 'Coral' },
  { key: 'blue', label: 'Blue' },
  { key: 'green', label: 'Green' },
  { key: 'purple', label: 'Purple' },
  { key: 'orange', label: 'Orange' },
  { key: 'red', label: 'Red' },
];
