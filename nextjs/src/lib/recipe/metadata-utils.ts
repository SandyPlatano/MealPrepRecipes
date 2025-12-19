/**
 * Recipe Metadata Utilities
 *
 * Utilities for calculating and formatting recipe metadata for card display.
 * Includes total time formatting, difficulty calculation, and nutrition display.
 * Supports configurable difficulty thresholds via user settings.
 */

import type { RecipeWithFavoriteAndNutrition } from "@/types/recipe";
import type { DifficultyThresholds } from "@/types/settings";
import { DEFAULT_DIFFICULTY_THRESHOLDS } from "@/types/settings";
import {
  calculateTotalTime,
} from "@/lib/smart-folders/filter-evaluator";

// ============================================
// TYPES
// ============================================

export type DifficultyLevel = "Easy" | "Medium" | "Hard";

export interface DifficultyBreakdown {
  time: { score: DifficultyLevel; minutes: number | null };
  ingredients: { score: DifficultyLevel; count: number };
  steps: { score: DifficultyLevel; count: number };
}

export interface RecipeMetadata {
  totalTime: string;
  calories: string;
  protein: string;
  difficulty: DifficultyLevel;
  difficultyBreakdown: DifficultyBreakdown;
}

// ============================================
// TIME FORMATTING
// ============================================

/**
 * Format total time from prep_time and cook_time for display
 * Returns formatted string like "45 min" or "1h 30m"
 * Falls back to prep_time only if no cook_time
 * Returns "-- min" if no time data
 */
export function formatTotalTime(
  prepTime: string | null | undefined,
  cookTime: string | null | undefined
): string {
  const totalMinutes = calculateTotalTime(prepTime, cookTime);

  if (totalMinutes === null || totalMinutes === 0) {
    return "-- min";
  }

  // Format: under 60 min = "45 min", over 60 = "1h 30m"
  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  if (mins === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}m`;
}

// ============================================
// DIFFICULTY CALCULATION
// ============================================

/**
 * Calculate time-based difficulty score using configurable thresholds
 */
function calculateTimeScore(
  prepTime: string | null | undefined,
  cookTime: string | null | undefined,
  thresholds: DifficultyThresholds["time"]
): number {
  const totalMinutes = calculateTotalTime(prepTime, cookTime);

  // Default to Medium if no time data
  if (totalMinutes === null) {
    return 2;
  }

  if (totalMinutes < thresholds.easyMax) return 1; // Easy
  if (totalMinutes <= thresholds.mediumMax) return 2; // Medium
  return 3; // Hard
}

/**
 * Calculate ingredient-based difficulty score using configurable thresholds
 */
function calculateIngredientScore(
  ingredients: string[],
  thresholds: DifficultyThresholds["ingredients"]
): number {
  const count = ingredients.length;

  if (count < thresholds.easyMax) return 1; // Easy
  if (count <= thresholds.mediumMax) return 2; // Medium
  return 3; // Hard
}

/**
 * Calculate instruction-based difficulty score using configurable thresholds
 */
function calculateInstructionScore(
  instructions: string[],
  thresholds: DifficultyThresholds["steps"]
): number {
  const count = instructions.length;

  if (count < thresholds.easyMax) return 1; // Easy
  if (count <= thresholds.mediumMax) return 2; // Medium
  return 3; // Hard
}

/**
 * Convert numeric score to DifficultyLevel
 */
function scoreToLevel(score: number): DifficultyLevel {
  switch (score) {
    case 1:
      return "Easy";
    case 2:
      return "Medium";
    case 3:
    default:
      return "Hard";
  }
}

/**
 * Calculate overall difficulty level for a recipe
 * Uses the HIGHEST score from time, ingredients, and instructions
 * @param recipe - Recipe data
 * @param thresholds - Optional custom thresholds (uses defaults if not provided)
 */
export function calculateDifficulty(
  recipe: Pick<
    RecipeWithFavoriteAndNutrition,
    "prep_time" | "cook_time" | "ingredients" | "instructions"
  >,
  thresholds: DifficultyThresholds = DEFAULT_DIFFICULTY_THRESHOLDS
): DifficultyLevel {
  const timeScore = calculateTimeScore(
    recipe.prep_time,
    recipe.cook_time,
    thresholds.time
  );
  const ingredientScore = calculateIngredientScore(
    recipe.ingredients || [],
    thresholds.ingredients
  );
  const instructionScore = calculateInstructionScore(
    recipe.instructions || [],
    thresholds.steps
  );

  // Use the highest (hardest) score
  const maxScore = Math.max(timeScore, ingredientScore, instructionScore);

  return scoreToLevel(maxScore);
}

/**
 * Get detailed difficulty breakdown for tooltip display
 * Shows individual scores for time, ingredients, and steps
 * @param recipe - Recipe data
 * @param thresholds - Optional custom thresholds (uses defaults if not provided)
 */
export function getDifficultyBreakdown(
  recipe: Pick<
    RecipeWithFavoriteAndNutrition,
    "prep_time" | "cook_time" | "ingredients" | "instructions"
  >,
  thresholds: DifficultyThresholds = DEFAULT_DIFFICULTY_THRESHOLDS
): DifficultyBreakdown {
  const totalMinutes = calculateTotalTime(recipe.prep_time, recipe.cook_time);
  const ingredientCount = (recipe.ingredients || []).length;
  const stepCount = (recipe.instructions || []).length;

  return {
    time: {
      score: scoreToLevel(
        calculateTimeScore(recipe.prep_time, recipe.cook_time, thresholds.time)
      ),
      minutes: totalMinutes,
    },
    ingredients: {
      score: scoreToLevel(
        calculateIngredientScore(recipe.ingredients || [], thresholds.ingredients)
      ),
      count: ingredientCount,
    },
    steps: {
      score: scoreToLevel(
        calculateInstructionScore(recipe.instructions || [], thresholds.steps)
      ),
      count: stepCount,
    },
  };
}

// ============================================
// NUTRITION FORMATTING
// ============================================

/**
 * Format calories for display
 * Returns "420 cal" or "-- cal" if missing
 */
export function formatCalories(calories: number | null | undefined): string {
  if (calories === null || calories === undefined) {
    return "-- cal";
  }
  return `${Math.round(calories)} cal`;
}

/**
 * Format protein for display
 * Returns "32g" or "-- g" if missing
 */
export function formatProtein(proteinG: number | null | undefined): string {
  if (proteinG === null || proteinG === undefined) {
    return "-- g";
  }
  return `${Math.round(proteinG)}g`;
}

// ============================================
// METADATA BUILDER
// ============================================

/**
 * Build complete metadata object for recipe card display
 * @param recipe - Recipe data
 * @param thresholds - Optional custom difficulty thresholds (uses defaults if not provided)
 */
export function buildRecipeMetadata(
  recipe: RecipeWithFavoriteAndNutrition,
  thresholds?: DifficultyThresholds
): RecipeMetadata {
  const effectiveThresholds = thresholds || DEFAULT_DIFFICULTY_THRESHOLDS;

  return {
    totalTime: formatTotalTime(recipe.prep_time, recipe.cook_time),
    calories: formatCalories(recipe.nutrition?.calories),
    protein: formatProtein(recipe.nutrition?.protein_g),
    difficulty: calculateDifficulty(recipe, effectiveThresholds),
    difficultyBreakdown: getDifficultyBreakdown(recipe, effectiveThresholds),
  };
}
