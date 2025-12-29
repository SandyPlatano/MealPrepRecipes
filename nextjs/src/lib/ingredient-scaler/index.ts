/**
 * Ingredient Scaler Library
 *
 * Utilities for parsing, scaling, and converting recipe ingredients.
 * Import from "@/lib/ingredient-scaler" for all functions.
 */

// Types
export type { ParsedIngredient } from "./parsing";
export type { MergeableItem, MergedItem } from "./merging";
export type { MergedItemWithConfidence } from "./intelligence";
export type { UnitSystem } from "./systems";

// Parsing
export { parseIngredient, parseQuantity, formatQuantity } from "./parsing";

// Scaling
export { scaleIngredient, scaleIngredients } from "./scaling";

// Unit normalization and conversion
export {
  normalizeUnit,
  areUnitsConvertible,
  convertUnit,
  getPreferredUnit,
} from "./units";

// Unit system conversion (Imperial <-> Metric)
export {
  getTargetUnit,
  convertIngredientToSystem,
  convertIngredientsToSystem,
} from "./systems";

// Shopping item merging
export { mergeShoppingItems } from "./merging";

// Ingredient intelligence
export {
  normalizeIngredientName,
  extractCoreIngredient,
  areIngredientsSimilar,
  guessCategory,
  mergeWithConfidence,
  getItemsNeedingReview,
} from "./intelligence";

// Constants (exported for advanced usage)
export {
  VOLUME_TO_ML,
  WEIGHT_TO_GRAMS,
  UNIT_ALIASES,
  FRACTIONS,
  IMPERIAL_VOLUME_UNITS,
  METRIC_VOLUME_UNITS,
  IMPERIAL_WEIGHT_UNITS,
  METRIC_WEIGHT_UNITS,
  PREPARATION_DESCRIPTORS,
  STATE_DESCRIPTORS,
  QUALITY_DESCRIPTORS,
  CATEGORY_KEYWORDS,
} from "./constants";
