/**
 * Smart Folder Filter Evaluator
 *
 * Evaluates recipes against smart folder filter criteria.
 * Follows the condition-based pattern from badge-calculator.ts
 */

import type {
  SmartFilterCondition,
  SmartFilterCriteria,
  SmartFilterField,
  SmartFilterOperator,
} from "@/types/smart-folder";
import type { RecipeWithFavoriteAndNutrition } from "@/types/recipe";
import type { RecipeNutrition } from "@/types/nutrition";

// ============================================
// CONTEXT FOR EVALUATION
// ============================================

/**
 * Additional context needed for evaluating certain fields
 * that aren't directly on the recipe object
 */
export interface EvaluationContext {
  cookCounts: Record<string, number>; // recipeId -> count
  lastCookedDates: Record<string, string | null>; // recipeId -> ISO date
}

// ============================================
// TIME PARSING
// ============================================

/**
 * Parse time string to minutes
 * Handles formats like "30 min", "1h 15m", "1 hour 30 minutes", "45"
 */
export function parseTimeToMinutes(timeStr: string | null | undefined): number | null {
  if (!timeStr) return null;

  const str = timeStr.toLowerCase().trim();

  // Try pure number first (assume minutes)
  const pureNumber = parseFloat(str);
  if (!isNaN(pureNumber) && str === String(pureNumber)) {
    return Math.round(pureNumber);
  }

  let totalMinutes = 0;

  // Match hours (e.g., "1h", "2 hours", "1 hour")
  const hourMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)/);
  if (hourMatch) {
    totalMinutes += parseFloat(hourMatch[1]) * 60;
  }

  // Match minutes (e.g., "30m", "15 min", "45 minutes")
  const minMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:m|min|mins|minute|minutes)/);
  if (minMatch) {
    totalMinutes += parseFloat(minMatch[1]);
  }

  // If nothing matched but there's a number, treat as minutes
  if (totalMinutes === 0) {
    const numMatch = str.match(/(\d+(?:\.\d+)?)/);
    if (numMatch) {
      totalMinutes = parseFloat(numMatch[1]);
    }
  }

  return totalMinutes > 0 ? Math.round(totalMinutes) : null;
}

/**
 * Calculate total time from prep + cook
 */
export function calculateTotalTime(
  prepTime: string | null | undefined,
  cookTime: string | null | undefined
): number | null {
  const prep = parseTimeToMinutes(prepTime);
  const cook = parseTimeToMinutes(cookTime);

  if (prep === null && cook === null) return null;
  return (prep || 0) + (cook || 0);
}

// ============================================
// FIELD VALUE EXTRACTION
// ============================================

/**
 * Extract field value from recipe and context
 */
export function getFieldValue(
  field: SmartFilterField,
  recipe: RecipeWithFavoriteAndNutrition,
  context: EvaluationContext
): string | number | boolean | string[] | null {
  const nutrition = recipe.nutrition;

  switch (field) {
    // Recipe metadata
    case "recipe_type":
      return recipe.recipe_type?.toLowerCase() || null;

    case "protein_type":
      return recipe.protein_type?.toLowerCase() || null;

    case "tags":
      return recipe.tags || [];

    case "rating":
      return recipe.rating;

    case "is_favorite":
      return recipe.is_favorite;

    // Time-based
    case "created_at":
      return recipe.created_at;

    case "prep_time":
      return parseTimeToMinutes(recipe.prep_time);

    case "cook_time":
      return parseTimeToMinutes(recipe.cook_time);

    case "total_time":
      return calculateTotalTime(recipe.prep_time, recipe.cook_time);

    // Cooking history
    case "cook_count":
      return context.cookCounts[recipe.id] ?? 0;

    case "last_cooked_at":
      return context.lastCookedDates[recipe.id] ?? null;

    // Dietary/allergens
    case "allergen_tags":
      return recipe.allergen_tags || [];

    // Nutrition
    case "has_nutrition":
      return hasNutritionData(nutrition);

    case "calories":
      return nutrition?.calories ?? null;

    case "protein_g":
      return nutrition?.protein_g ?? null;

    case "carbs_g":
      return nutrition?.carbs_g ?? null;

    case "fat_g":
      return nutrition?.fat_g ?? null;

    case "fiber_g":
      return nutrition?.fiber_g ?? null;

    case "sugar_g":
      return nutrition?.sugar_g ?? null;

    case "sodium_mg":
      return nutrition?.sodium_mg ?? null;

    default:
      return null;
  }
}

/**
 * Check if nutrition data exists
 */
function hasNutritionData(nutrition?: RecipeNutrition | null): boolean {
  if (!nutrition) return false;
  return !!(
    nutrition.calories ||
    nutrition.protein_g ||
    nutrition.carbs_g ||
    nutrition.fat_g
  );
}

// ============================================
// CONDITION EVALUATION
// ============================================

/**
 * Evaluate a single condition against a value
 */
export function evaluateCondition(
  value: string | number | boolean | string[] | null,
  operator: SmartFilterOperator,
  conditionValue: SmartFilterCondition["value"]
): boolean {
  // Handle null checks first
  if (operator === "is_null") {
    return value === null || value === undefined ||
           (Array.isArray(value) && value.length === 0);
  }

  if (operator === "is_not_null") {
    return value !== null && value !== undefined &&
           !(Array.isArray(value) && value.length === 0);
  }

  // If value is null for other operators, condition fails
  if (value === null || value === undefined) {
    return false;
  }

  // Handle array-based operators
  if (operator === "contains") {
    if (!Array.isArray(value)) return false;
    const searchValue = String(conditionValue).toLowerCase();
    return value.some((v) => String(v).toLowerCase() === searchValue);
  }

  if (operator === "not_contains") {
    if (!Array.isArray(value)) return true;
    const searchValue = String(conditionValue).toLowerCase();
    return !value.some((v) => String(v).toLowerCase() === searchValue);
  }

  // Handle "in" operator (value is one of multiple options)
  if (operator === "in") {
    if (!Array.isArray(conditionValue)) return false;
    const normalizedValue = String(value).toLowerCase();
    return conditionValue.some(
      (cv) => String(cv).toLowerCase() === normalizedValue
    );
  }

  if (operator === "not_in") {
    if (!Array.isArray(conditionValue)) return true;
    const normalizedValue = String(value).toLowerCase();
    return !conditionValue.some(
      (cv) => String(cv).toLowerCase() === normalizedValue
    );
  }

  // Handle date-based operators
  if (operator === "within_days") {
    if (typeof value !== "string") return false;
    const days = Number(conditionValue);
    if (isNaN(days)) return false;

    const valueDate = new Date(value);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    cutoffDate.setHours(0, 0, 0, 0);

    return valueDate >= cutoffDate;
  }

  // Handle numeric comparisons
  if (typeof value === "number" || typeof conditionValue === "number") {
    const numValue = Number(value);
    const numCondition = Number(conditionValue);

    if (isNaN(numValue) || isNaN(numCondition)) return false;

    switch (operator) {
      case "eq":
        return numValue === numCondition;
      case "neq":
        return numValue !== numCondition;
      case "gt":
        return numValue > numCondition;
      case "gte":
        return numValue >= numCondition;
      case "lt":
        return numValue < numCondition;
      case "lte":
        return numValue <= numCondition;
      default:
        return false;
    }
  }

  // Handle boolean comparisons
  if (typeof value === "boolean") {
    const boolCondition = conditionValue === true || conditionValue === "true";
    switch (operator) {
      case "eq":
        return value === boolCondition;
      case "neq":
        return value !== boolCondition;
      default:
        return false;
    }
  }

  // Handle string comparisons (case-insensitive)
  const strValue = String(value).toLowerCase();
  const strCondition = String(conditionValue).toLowerCase();

  switch (operator) {
    case "eq":
      return strValue === strCondition;
    case "neq":
      return strValue !== strCondition;
    default:
      return false;
  }
}

// ============================================
// RECIPE EVALUATION
// ============================================

/**
 * Evaluate a recipe against smart folder filter criteria
 * All conditions must pass (AND logic)
 */
export function evaluateRecipe(
  recipe: RecipeWithFavoriteAndNutrition,
  criteria: SmartFilterCriteria,
  context: EvaluationContext
): boolean {
  // Empty criteria matches all recipes
  if (!criteria.conditions || criteria.conditions.length === 0) {
    return true;
  }

  // All conditions must pass (AND logic)
  return criteria.conditions.every((condition) => {
    const value = getFieldValue(condition.field, recipe, context);
    return evaluateCondition(value, condition.operator, condition.value);
  });
}

/**
 * Filter recipes by smart folder criteria
 * Returns array of matching recipe IDs
 */
export function filterRecipesBySmartFolder(
  recipes: RecipeWithFavoriteAndNutrition[],
  criteria: SmartFilterCriteria,
  context: EvaluationContext
): string[] {
  return recipes
    .filter((recipe) => evaluateRecipe(recipe, criteria, context))
    .map((recipe) => recipe.id);
}

/**
 * Count recipes matching smart folder criteria
 * More efficient than filtering when you only need the count
 */
export function countMatchingRecipes(
  recipes: RecipeWithFavoriteAndNutrition[],
  criteria: SmartFilterCriteria,
  context: EvaluationContext
): number {
  return recipes.filter((recipe) => evaluateRecipe(recipe, criteria, context))
    .length;
}

// ============================================
// SYSTEM SMART FOLDER EVALUATION
// ============================================

/**
 * Built-in system smart folder filter evaluators
 * These match the system_smart_folders table entries
 */
export const SYSTEM_FOLDER_CRITERIA: Record<string, SmartFilterCriteria> = {
  quick_meals: {
    conditions: [{ field: "total_time", operator: "lt", value: 30 }],
  },
  highly_rated: {
    conditions: [{ field: "rating", operator: "gte", value: 4 }],
  },
  recently_added: {
    conditions: [{ field: "created_at", operator: "within_days", value: 30 }],
  },
  never_cooked: {
    conditions: [{ field: "cook_count", operator: "eq", value: 0 }],
  },
  frequently_cooked: {
    conditions: [{ field: "cook_count", operator: "gte", value: 3 }],
  },
};

/**
 * Evaluate recipes against a system smart folder
 */
export function filterBySystemFolder(
  folderId: string,
  recipes: RecipeWithFavoriteAndNutrition[],
  context: EvaluationContext
): string[] {
  const criteria = SYSTEM_FOLDER_CRITERIA[folderId];
  if (!criteria) return [];
  return filterRecipesBySmartFolder(recipes, criteria, context);
}
