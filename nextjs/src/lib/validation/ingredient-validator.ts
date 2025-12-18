/**
 * Ingredient Validation and Normalization Utility
 *
 * Validates and normalizes ingredient strings to catch and fix common data quality issues:
 * - Typo correction (e.g., "arge" -> "large")
 * - Unit normalization
 * - Suspicious quantity validation (e.g., "4.23 cups eggs" should be counted)
 * - Whitespace cleanup
 * - Unit-ingredient compatibility checks
 *
 * Non-blocking: Returns warnings instead of throwing errors to maintain data flow.
 */

export interface IngredientValidationWarning {
  type:
    | "typo_correction"
    | "suspicious_quantity"
    | "unit_normalization"
    | "unit_mismatch"
    | "whitespace_cleanup";
  message: string;
  original: string;
  corrected?: string;
}

export interface ValidatedIngredient {
  original: string;
  normalized: string;
  warnings: IngredientValidationWarning[];
}

export interface IngredientArrayValidationResult {
  ingredients: ValidatedIngredient[];
  hasWarnings: boolean;
  warningCount: number;
}

// Common typo mappings
const TYPO_CORRECTIONS: Record<string, string> = {
  arge: "large",
  lage: "large",
  medum: "medium",
  medim: "medium",
  smal: "small",
  smll: "small",
  tblsp: "tablespoon",
  tbps: "tablespoon",
  teaspn: "teaspoon",
  tspn: "teaspoon",
  cupps: "cups",
  cupp: "cup",
  onon: "onion",
  galic: "garlic",
  garlc: "garlic",
  peppr: "pepper",
  tomto: "tomato",
  chiken: "chicken",
  chickn: "chicken",
  buttr: "butter",
  suger: "sugar",
  sugr: "sugar",
  flor: "flour",
  olve: "olive",
  oliv: "olive",
};

// Units that should be used for counting (not volume/weight)
const COUNTING_UNITS = new Set([
  "large",
  "medium",
  "small",
  "whole",
  "clove",
  "cloves",
  "piece",
  "pieces",
  "item",
  "items",
]);

// Volume/weight units
const VOLUME_WEIGHT_UNITS = new Set([
  "cup",
  "cups",
  "tablespoon",
  "tablespoons",
  "tbsp",
  "teaspoon",
  "teaspoons",
  "tsp",
  "oz",
  "ounce",
  "ounces",
  "lb",
  "lbs",
  "pound",
  "pounds",
  "g",
  "gram",
  "grams",
  "kg",
  "kilogram",
  "kilograms",
  "ml",
  "milliliter",
  "milliliters",
  "l",
  "liter",
  "liters",
]);

// Ingredients that should typically be counted, not measured by volume
const COUNTED_INGREDIENTS = new Set([
  "egg",
  "eggs",
  "onion",
  "onions",
  "potato",
  "potatoes",
  "apple",
  "apples",
  "orange",
  "oranges",
  "lemon",
  "lemons",
  "lime",
  "limes",
  "banana",
  "bananas",
  "avocado",
  "avocados",
  "tomato",
  "tomatoes",
  "pepper",
  "peppers",
  "bell pepper",
  "bell peppers",
  "clove",
  "cloves",
  "garlic clove",
  "garlic cloves",
]);

/**
 * Check if a quantity seems suspicious (e.g., decimal cups for eggs)
 */
function isSuspiciousQuantity(
  quantity: string | undefined,
  unit: string | undefined,
  ingredient: string
): boolean {
  if (!quantity || !unit) return false;

  // Check if ingredient should be counted
  const lowerIngredient = ingredient.toLowerCase();
  const shouldBeCounted = Array.from(COUNTED_INGREDIENTS).some((item) =>
    lowerIngredient.includes(item)
  );

  if (!shouldBeCounted) return false;

  // Check if using volume/weight unit
  const lowerUnit = unit.toLowerCase();
  const isVolumeOrWeight = Array.from(VOLUME_WEIGHT_UNITS).some((u) =>
    lowerUnit.includes(u)
  );

  if (!isVolumeOrWeight) return false;

  // If using volume/weight for counted ingredient, it's suspicious
  return true;
}

/**
 * Detect and correct common typos in a string
 */
function correctTypos(text: string): {
  corrected: string;
  corrections: Array<{ original: string; corrected: string }>;
} {
  const words = text.split(/\s+/);
  const corrections: Array<{ original: string; corrected: string }> = [];
  let corrected = text;

  for (const word of words) {
    const lowerWord = word.toLowerCase();
    if (TYPO_CORRECTIONS[lowerWord]) {
      const correctedWord = TYPO_CORRECTIONS[lowerWord];
      corrections.push({ original: word, corrected: correctedWord });

      // Replace the word while preserving case pattern
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      corrected = corrected.replace(regex, correctedWord);
    }
  }

  return { corrected, corrections };
}

/**
 * Normalize excessive whitespace
 */
function normalizeWhitespace(text: string): string {
  return text
    .replace(/\s+/g, " ") // Multiple spaces to single space
    .replace(/\s*\(\s*/g, " (") // Space before parenthesis
    .replace(/\s*\)\s*/g, ") ") // Space after parenthesis
    .replace(/\s*,\s*/g, ", ") // Space after comma
    .trim();
}

/**
 * Parse ingredient string to extract components
 * Similar to parseIngredient in meal-plans.ts but focused on validation
 */
function parseIngredientComponents(ingredient: string): {
  quantity?: string;
  unit?: string;
  ingredient: string;
} {
  // Pattern matches: "2 cups flour" or "1/2 lb chicken" or "3 large eggs"
  const quantityMatch = ingredient.match(
    /^([\d\/\.\s]+)?\s*(cups?|tbsp?|tsp?|tablespoons?|teaspoons?|oz|ounces?|lb|lbs?|pounds?|g|grams?|kg|kilograms?|ml|milliliters?|l|liters?|large|medium|small|cloves?|cans?|packages?|bunche?s?|heads?|whole|pieces?|items?)?\s*(.+)$/i
  );

  if (quantityMatch) {
    return {
      quantity: quantityMatch[1]?.trim(),
      unit: quantityMatch[2]?.trim(),
      ingredient: quantityMatch[3]?.trim() || ingredient,
    };
  }

  return {
    ingredient: ingredient.trim(),
  };
}

/**
 * Validate and normalize a single ingredient string
 */
export function validateIngredient(
  ingredient: string
): ValidatedIngredient {
  const warnings: IngredientValidationWarning[] = [];
  let normalized = ingredient;

  // Step 1: Normalize whitespace
  const cleanedWhitespace = normalizeWhitespace(ingredient);
  if (cleanedWhitespace !== ingredient) {
    warnings.push({
      type: "whitespace_cleanup",
      message: "Cleaned up excessive whitespace",
      original: ingredient,
      corrected: cleanedWhitespace,
    });
    normalized = cleanedWhitespace;
  }

  // Step 2: Correct typos
  const { corrected: typosCorrected, corrections } = correctTypos(normalized);
  if (corrections.length > 0) {
    for (const correction of corrections) {
      warnings.push({
        type: "typo_correction",
        message: `Fixed typo: "${correction.original}" -> "${correction.corrected}"`,
        original: normalized,
        corrected: typosCorrected,
      });
    }
    normalized = typosCorrected;
  }

  // Step 3: Parse components and check for issues
  const parsed = parseIngredientComponents(normalized);

  // Check for suspicious quantities (e.g., "4.23 cups eggs")
  if (
    isSuspiciousQuantity(parsed.quantity, parsed.unit, parsed.ingredient)
  ) {
    warnings.push({
      type: "suspicious_quantity",
      message: `Suspicious: Using volume/weight unit "${parsed.unit}" for "${parsed.ingredient}" which is typically counted`,
      original: ingredient,
    });
  }

  // Check for unit-ingredient mismatch
  if (parsed.unit && parsed.quantity) {
    const lowerUnit = parsed.unit.toLowerCase();
    const lowerIngredient = parsed.ingredient.toLowerCase();

    // Check if using counting unit with non-countable ingredient
    if (
      COUNTING_UNITS.has(lowerUnit) &&
      !Array.from(COUNTED_INGREDIENTS).some((item) =>
        lowerIngredient.includes(item)
      ) &&
      !lowerIngredient.includes("piece") &&
      !lowerIngredient.includes("item")
    ) {
      warnings.push({
        type: "unit_mismatch",
        message: `Unusual: Using counting unit "${parsed.unit}" with "${parsed.ingredient}"`,
        original: ingredient,
      });
    }
  }

  return {
    original: ingredient,
    normalized,
    warnings,
  };
}

/**
 * Validate an array of ingredients and return cleaned versions with warnings
 */
export function validateIngredients(
  ingredients: string[]
): IngredientArrayValidationResult {
  const validatedIngredients = ingredients.map((ing) =>
    validateIngredient(ing)
  );

  const warningCount = validatedIngredients.reduce(
    (count, ing) => count + ing.warnings.length,
    0
  );

  return {
    ingredients: validatedIngredients,
    hasWarnings: warningCount > 0,
    warningCount,
  };
}

/**
 * Get normalized ingredient strings from validation result
 */
export function getNormalizedIngredients(
  validationResult: IngredientArrayValidationResult
): string[] {
  return validationResult.ingredients.map((ing) => ing.normalized);
}

/**
 * Get all warnings from validation result
 */
export function getAllWarnings(
  validationResult: IngredientArrayValidationResult
): IngredientValidationWarning[] {
  return validationResult.ingredients.flatMap((ing) => ing.warnings);
}

/**
 * Get warnings grouped by type
 */
export function getWarningsByType(
  validationResult: IngredientArrayValidationResult
): Record<string, IngredientValidationWarning[]> {
  const warnings = getAllWarnings(validationResult);
  const grouped: Record<string, IngredientValidationWarning[]> = {};

  for (const warning of warnings) {
    if (!grouped[warning.type]) {
      grouped[warning.type] = [];
    }
    grouped[warning.type].push(warning);
  }

  return grouped;
}
