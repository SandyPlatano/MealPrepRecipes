/**
 * Enhanced ingredient intelligence
 * Advanced ingredient name matching, normalization, and categorization
 */

import type { IngredientCategory } from "@/types/shopping-list";
import {
  PREPARATION_DESCRIPTORS,
  STATE_DESCRIPTORS,
  QUALITY_DESCRIPTORS,
  CATEGORY_KEYWORDS,
} from "./constants";
import { parseQuantity, formatQuantity } from "./parsing";
import { normalizeUnit, areUnitsConvertible, convertUnit, getPreferredUnit } from "./units";

export interface MergedItemWithConfidence {
  ingredient: string;
  quantity: string | null;
  unit: string | null;
  category: IngredientCategory | string | null;
  sources: Array<{ recipe_id?: string | null; recipe_title?: string | null }>;
  confidence: number;
  needs_review: boolean;
}

export interface MergeableItem {
  ingredient: string;
  quantity?: string | null;
  unit?: string | null;
  category?: string | null;
  recipe_id?: string | null;
  recipe_title?: string | null;
}

/**
 * Normalize an ingredient name for comparison
 * - Lowercase
 * - Trim whitespace
 * - Remove common descriptors
 * - Singularize basic plurals
 */
export function normalizeIngredientName(name: string): string {
  let normalized = name.toLowerCase().trim();

  // Remove common descriptors that don't affect the core ingredient
  const descriptorsToRemove = [
    /\bfresh\b/gi,
    /\bfrozen\b/gi,
    /\bdried\b/gi,
    /\bchopped\b/gi,
    /\bdiced\b/gi,
    /\bsliced\b/gi,
    /\bminced\b/gi,
    /\bcrushed\b/gi,
    /\bground\b/gi,
    /\bshredded\b/gi,
    /\bgrated\b/gi,
    /\bpeeled\b/gi,
    /\bboneless\b/gi,
    /\bskinless\b/gi,
    /\braw\b/gi,
    /\bcooked\b/gi,
    /\buncooked\b/gi,
    /\borganic\b/gi,
    /\b(finely|roughly|coarsely)\b/gi,
    /,.*$/, // Remove everything after comma
    /\(.*?\)/g, // Remove parenthetical notes
  ];

  for (const pattern of descriptorsToRemove) {
    normalized = normalized.replace(pattern, "");
  }

  // Basic singularization (handles common cases)
  const pluralRules: Array<[RegExp, string]> = [
    [/ies$/, "y"],      // berries -> berry
    [/ves$/, "f"],      // leaves -> leaf
    [/oes$/, "o"],      // tomatoes -> tomato
    [/ses$/, "s"],      // molasses -> molasses (no change needed)
    [/([^s])s$/, "$1"], // apples -> apple
  ];

  for (const [pattern, replacement] of pluralRules) {
    if (pattern.test(normalized)) {
      normalized = normalized.replace(pattern, replacement);
      break;
    }
  }

  // Clean up extra whitespace
  normalized = normalized.replace(/\s+/g, " ").trim();

  return normalized;
}

/**
 * Extract the core ingredient name, removing all modifiers
 * More aggressive than normalizeIngredientName - for comparison purposes
 */
export function extractCoreIngredient(name: string): string {
  let core = name.toLowerCase().trim();

  // Remove all preparation descriptors
  for (const desc of PREPARATION_DESCRIPTORS) {
    core = core.replace(new RegExp(`\\b${desc}\\b`, "gi"), "");
  }

  // Remove all state descriptors
  for (const desc of STATE_DESCRIPTORS) {
    core = core.replace(new RegExp(`\\b${desc}\\b`, "gi"), "");
  }

  // Remove all quality descriptors
  for (const desc of QUALITY_DESCRIPTORS) {
    core = core.replace(new RegExp(`\\b${desc}\\b`, "gi"), "");
  }

  // Remove common phrases
  core = core.replace(/,.*$/, "");           // After comma
  core = core.replace(/\(.*?\)/g, "");       // Parenthetical
  core = core.replace(/for .*$/i, "");       // "for garnish"
  core = core.replace(/to taste/i, "");      // "to taste"
  core = core.replace(/as needed/i, "");     // "as needed"
  core = core.replace(/optional/i, "");      // "optional"

  // Clean up whitespace
  core = core.replace(/\s+/g, " ").trim();

  return core;
}

/**
 * Calculate similarity between two ingredient names (0-1)
 * Uses Levenshtein distance ratio
 */
function calculateSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length === 0 || b.length === 0) return 0;

  // Simple Levenshtein distance implementation
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  const distance = matrix[b.length][a.length];
  const maxLength = Math.max(a.length, b.length);
  return 1 - distance / maxLength;
}

/**
 * Check if two ingredients are similar enough to merge
 * Returns true if they should be considered the same ingredient
 */
export function areIngredientsSimilar(
  a: string,
  b: string,
  threshold: number = 0.85
): boolean {
  // First, try exact match on core ingredients
  const coreA = extractCoreIngredient(a);
  const coreB = extractCoreIngredient(b);

  if (coreA === coreB) return true;

  // Check if one contains the other (after normalization)
  if (coreA.includes(coreB) || coreB.includes(coreA)) {
    // But avoid matching things like "chicken" with "chicken broth"
    const shorter = coreA.length < coreB.length ? coreA : coreB;
    const longer = coreA.length < coreB.length ? coreB : coreA;

    // If the longer one has significantly more words, don't match
    const shorterWords = shorter.split(/\s+/).length;
    const longerWords = longer.split(/\s+/).length;

    if (longerWords > shorterWords + 1) {
      return false;
    }

    return true;
  }

  // Calculate similarity score
  const similarity = calculateSimilarity(coreA, coreB);
  return similarity >= threshold;
}

/**
 * Guess the category of an ingredient based on keyword matching
 */
export function guessCategory(ingredient: string): IngredientCategory {
  const lower = ingredient.toLowerCase();
  const core = extractCoreIngredient(lower);

  // Check each category's keywords
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (core.includes(keyword) || lower.includes(keyword)) {
        return category as IngredientCategory;
      }
    }
  }

  return "Other";
}

/**
 * Merge shopping items with confidence scoring
 * Groups items that are likely the same ingredient
 */
export function mergeWithConfidence(
  items: MergeableItem[],
  similarityThreshold: number = 0.85
): MergedItemWithConfidence[] {
  const merged = new Map<string, MergedItemWithConfidence>();
  const processedIndices = new Set<number>();

  for (let i = 0; i < items.length; i++) {
    if (processedIndices.has(i)) continue;

    const item = items[i];
    const normalizedName = normalizeIngredientName(item.ingredient);
    const coreName = extractCoreIngredient(item.ingredient);

    // Check if this matches any existing merged item
    let foundMatch = false;
    for (const [, existing] of Array.from(merged.entries())) {
      const existingCore = extractCoreIngredient(existing.ingredient);

      if (areIngredientsSimilar(coreName, existingCore, similarityThreshold)) {
        // Merge with existing
        foundMatch = true;

        const newQuantity = parseQuantity(item.quantity || "");
        const existingQuantity = parseQuantity(existing.quantity || "");

        // Track confidence based on how similar the names are
        const similarity = calculateSimilarity(coreName, existingCore);
        existing.confidence = Math.min(existing.confidence, similarity);
        existing.needs_review = existing.confidence < 0.9;

        // Add source
        if (item.recipe_id || item.recipe_title) {
          const alreadyHasSource = existing.sources.some(
            (s: { recipe_id?: string | null; recipe_title?: string | null }) =>
              s.recipe_id === item.recipe_id && s.recipe_title === item.recipe_title
          );
          if (!alreadyHasSource) {
            existing.sources.push({
              recipe_id: item.recipe_id,
              recipe_title: item.recipe_title,
            });
          }
        }

        // Try to merge quantities
        if (newQuantity !== null && existingQuantity !== null) {
          const newUnit = item.unit ? normalizeUnit(item.unit) : null;
          const existingUnit = existing.unit;

          if (newUnit === existingUnit || (!newUnit && !existingUnit)) {
            const total = existingQuantity + newQuantity;
            const preferred = existingUnit
              ? getPreferredUnit(total, existingUnit)
              : { quantity: total, unit: null };
            existing.quantity = formatQuantity(preferred.quantity);
            existing.unit = preferred.unit;
          } else if (newUnit && existingUnit && areUnitsConvertible(newUnit, existingUnit)) {
            const converted = convertUnit(newQuantity, newUnit, existingUnit);
            if (converted !== null) {
              const total = existingQuantity + converted;
              const preferred = getPreferredUnit(total, existingUnit);
              existing.quantity = formatQuantity(preferred.quantity);
              existing.unit = preferred.unit;
            }
          } else {
            // Units not compatible - lower confidence
            existing.confidence *= 0.8;
            existing.needs_review = true;
          }
        }

        processedIndices.add(i);
        break;
      }
    }

    if (!foundMatch) {
      // Create new entry
      const category = item.category || guessCategory(item.ingredient);

      merged.set(normalizedName, {
        ingredient: item.ingredient,
        quantity: item.quantity || null,
        unit: item.unit ? normalizeUnit(item.unit) : null,
        category,
        sources: item.recipe_id || item.recipe_title
          ? [{ recipe_id: item.recipe_id, recipe_title: item.recipe_title }]
          : [],
        confidence: 1.0,
        needs_review: false,
      });

      processedIndices.add(i);
    }
  }

  // Find any items that weren't processed (shouldn't happen, but safety check)
  for (let i = 0; i < items.length; i++) {
    if (!processedIndices.has(i)) {
      const item = items[i];
      const normalizedName = normalizeIngredientName(item.ingredient);
      const category = item.category || guessCategory(item.ingredient);

      merged.set(`${normalizedName}_${i}`, {
        ingredient: item.ingredient,
        quantity: item.quantity || null,
        unit: item.unit ? normalizeUnit(item.unit) : null,
        category,
        sources: item.recipe_id || item.recipe_title
          ? [{ recipe_id: item.recipe_id, recipe_title: item.recipe_title }]
          : [],
        confidence: 1.0,
        needs_review: false,
      });
    }
  }

  return Array.from(merged.values());
}

/**
 * Get a list of items that need user review (low confidence merges)
 */
export function getItemsNeedingReview(
  items: MergedItemWithConfidence[]
): MergedItemWithConfidence[] {
  return items.filter((item) => item.needs_review);
}
