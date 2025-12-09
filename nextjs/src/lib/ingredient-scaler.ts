/**
 * Utility functions for parsing and scaling recipe ingredients
 */

export interface ParsedIngredient {
  quantity: number | null;
  unit: string;
  ingredient: string;
  original: string;
}

// Unit conversion tables
const VOLUME_TO_ML: Record<string, number> = {
  ml: 1,
  milliliter: 1,
  milliliters: 1,
  l: 1000,
  liter: 1000,
  liters: 1000,
  tsp: 4.929,
  teaspoon: 4.929,
  teaspoons: 4.929,
  tbsp: 14.787,
  tablespoon: 14.787,
  tablespoons: 14.787,
  "fl oz": 29.574,
  "fluid oz": 29.574,
  cup: 236.588,
  cups: 236.588,
  pint: 473.176,
  pints: 473.176,
  quart: 946.353,
  quarts: 946.353,
  gallon: 3785.41,
  gallons: 3785.41,
};

const WEIGHT_TO_GRAMS: Record<string, number> = {
  g: 1,
  gram: 1,
  grams: 1,
  kg: 1000,
  kilogram: 1000,
  kilograms: 1000,
  oz: 28.3495,
  ounce: 28.3495,
  ounces: 28.3495,
  lb: 453.592,
  lbs: 453.592,
  pound: 453.592,
  pounds: 453.592,
};

// Common unit aliases for normalization
const UNIT_ALIASES: Record<string, string> = {
  tsp: "tsp",
  teaspoon: "tsp",
  teaspoons: "tsp",
  "t.": "tsp",
  tbsp: "tbsp",
  tablespoon: "tbsp",
  tablespoons: "tbsp",
  "T.": "tbsp",
  "tbs.": "tbsp",
  cup: "cup",
  cups: "cup",
  c: "cup",
  "c.": "cup",
  oz: "oz",
  ounce: "oz",
  ounces: "oz",
  lb: "lb",
  lbs: "lb",
  pound: "lb",
  pounds: "lb",
  g: "g",
  gram: "g",
  grams: "g",
  kg: "kg",
  kilogram: "kg",
  kilograms: "kg",
  ml: "ml",
  milliliter: "ml",
  milliliters: "ml",
  l: "l",
  liter: "l",
  liters: "l",
  clove: "clove",
  cloves: "clove",
  can: "can",
  cans: "can",
  package: "package",
  packages: "package",
  pkg: "package",
  bunch: "bunch",
  bunches: "bunch",
  head: "head",
  heads: "head",
  large: "large",
  medium: "medium",
  small: "small",
  slice: "slice",
  slices: "slice",
  piece: "piece",
  pieces: "piece",
};

// Common fractions and their decimal equivalents
const FRACTIONS: Record<string, number> = {
  "1/8": 0.125,
  "1/4": 0.25,
  "1/3": 0.333,
  "1/2": 0.5,
  "2/3": 0.667,
  "3/4": 0.75,
};

// Regex patterns for parsing quantities
const FRACTION_PATTERN = /(\d+\/\d+)/;
const MIXED_NUMBER_PATTERN = /(\d+)\s+(\d+\/\d+)/;
const DECIMAL_PATTERN = /(\d+\.?\d*)/;
const RANGE_PATTERN = /(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/;

/**
 * Parse a fraction string to decimal
 */
function parseFraction(fraction: string): number {
  if (FRACTIONS[fraction]) {
    return FRACTIONS[fraction];
  }
  const parts = fraction.split("/");
  if (parts.length === 2) {
    const numerator = parseFloat(parts[0]);
    const denominator = parseFloat(parts[1]);
    return numerator / denominator;
  }
  return 0;
}

/**
 * Parse quantity from ingredient string
 * Handles: "2", "1/2", "1 1/2", "2.5", "2-3"
 */
function parseQuantity(text: string): number | null {
  // Mixed number (e.g., "1 1/2")
  const mixedMatch = text.match(MIXED_NUMBER_PATTERN);
  if (mixedMatch) {
    const whole = parseFloat(mixedMatch[1]);
    const fraction = parseFraction(mixedMatch[2]);
    return whole + fraction;
  }

  // Fraction only (e.g., "1/2")
  const fractionMatch = text.match(FRACTION_PATTERN);
  if (fractionMatch) {
    return parseFraction(fractionMatch[1]);
  }

  // Range (e.g., "2-3") - use midpoint
  const rangeMatch = text.match(RANGE_PATTERN);
  if (rangeMatch) {
    const low = parseFloat(rangeMatch[1]);
    const high = parseFloat(rangeMatch[2]);
    return (low + high) / 2;
  }

  // Decimal or whole number
  const decimalMatch = text.match(DECIMAL_PATTERN);
  if (decimalMatch) {
    return parseFloat(decimalMatch[1]);
  }

  return null;
}

/**
 * Format a decimal number as a fraction when appropriate
 */
function formatQuantity(value: number): string {
  // Check if it's close to a common fraction
  for (const [fraction, decimal] of Object.entries(FRACTIONS)) {
    if (Math.abs(value - decimal) < 0.01) {
      return fraction;
    }
  }

  // Check if it's a whole number
  if (Math.abs(value - Math.round(value)) < 0.01) {
    return Math.round(value).toString();
  }

  // Check if it's a mixed number
  const whole = Math.floor(value);
  const remainder = value - whole;
  for (const [fraction, decimal] of Object.entries(FRACTIONS)) {
    if (Math.abs(remainder - decimal) < 0.01) {
      return whole > 0 ? `${whole} ${fraction}` : fraction;
    }
  }

  // Round to 2 decimal places
  return value.toFixed(2).replace(/\.?0+$/, "");
}

/**
 * Parse an ingredient string into its components
 */
export function parseIngredient(ingredient: string): ParsedIngredient {
  const trimmed = ingredient.trim();
  
  // Try to extract quantity and unit from the beginning
  // Pattern: [quantity] [unit] [ingredient]
  const quantityMatch = trimmed.match(/^([\d\s\/\.-]+)\s+/);
  
  if (!quantityMatch) {
    // No quantity found (e.g., "Salt to taste")
    return {
      quantity: null,
      unit: "",
      ingredient: trimmed,
      original: ingredient,
    };
  }

  const quantityStr = quantityMatch[1].trim();
  const quantity = parseQuantity(quantityStr);
  const afterQuantity = trimmed.slice(quantityMatch[0].length).trim();

  // Try to extract unit (next word after quantity)
  const unitMatch = afterQuantity.match(/^([a-zA-Z]+\.?)\s+/);
  
  if (unitMatch) {
    const unit = unitMatch[1];
    const ingredientName = afterQuantity.slice(unitMatch[0].length).trim();
    return {
      quantity,
      unit,
      ingredient: ingredientName,
      original: ingredient,
    };
  }

  // No unit found
  return {
    quantity,
    unit: "",
    ingredient: afterQuantity,
    original: ingredient,
  };
}

/**
 * Scale an ingredient by a given ratio
 */
export function scaleIngredient(ingredient: string, ratio: number): string {
  const parsed = parseIngredient(ingredient);

  // If no quantity, return original
  if (parsed.quantity === null) {
    return ingredient;
  }

  const scaledQuantity = parsed.quantity * ratio;
  const formattedQuantity = formatQuantity(scaledQuantity);

  // Reconstruct the ingredient string
  if (parsed.unit) {
    return `${formattedQuantity} ${parsed.unit} ${parsed.ingredient}`;
  } else {
    return `${formattedQuantity} ${parsed.ingredient}`;
  }
}

/**
 * Scale all ingredients in a list
 */
export function scaleIngredients(
  ingredients: string[],
  originalServings: number,
  newServings: number
): string[] {
  const ratio = newServings / originalServings;
  return ingredients.map((ing) => scaleIngredient(ing, ratio));
}

/**
 * Normalize a unit to its canonical form
 */
export function normalizeUnit(unit: string): string {
  const lower = unit.toLowerCase().trim().replace(/\.$/, "");
  return UNIT_ALIASES[lower] || lower;
}

/**
 * Check if two units are in the same measurement system and can be converted
 */
export function areUnitsConvertible(unit1: string, unit2: string): boolean {
  const norm1 = normalizeUnit(unit1);
  const norm2 = normalizeUnit(unit2);
  
  // Same unit after normalization
  if (norm1 === norm2) return true;
  
  // Both are volume units
  if (VOLUME_TO_ML[norm1] && VOLUME_TO_ML[norm2]) return true;
  
  // Both are weight units
  if (WEIGHT_TO_GRAMS[norm1] && WEIGHT_TO_GRAMS[norm2]) return true;
  
  return false;
}

/**
 * Convert a quantity from one unit to another
 * Returns null if conversion is not possible
 */
export function convertUnit(
  quantity: number,
  fromUnit: string,
  toUnit: string
): number | null {
  const from = normalizeUnit(fromUnit);
  const to = normalizeUnit(toUnit);
  
  // Same unit
  if (from === to) return quantity;
  
  // Volume conversion
  if (VOLUME_TO_ML[from] && VOLUME_TO_ML[to]) {
    const ml = quantity * VOLUME_TO_ML[from];
    return ml / VOLUME_TO_ML[to];
  }
  
  // Weight conversion
  if (WEIGHT_TO_GRAMS[from] && WEIGHT_TO_GRAMS[to]) {
    const grams = quantity * WEIGHT_TO_GRAMS[from];
    return grams / WEIGHT_TO_GRAMS[to];
  }
  
  return null;
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
    /,.*$/, // Remove everything after comma (e.g., "chicken breast, boneless")
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
 * Get the preferred display unit for a quantity
 * Converts to more readable units (e.g., 48 tsp -> 1 cup)
 */
export function getPreferredUnit(quantity: number, unit: string): { quantity: number; unit: string } {
  const norm = normalizeUnit(unit);
  
  // Volume: convert to cups if >= 1 cup, otherwise tablespoons if >= 1 tbsp
  if (VOLUME_TO_ML[norm]) {
    const ml = quantity * VOLUME_TO_ML[norm];
    
    if (ml >= 236.588) {
      // >= 1 cup
      return { quantity: ml / 236.588, unit: "cup" };
    } else if (ml >= 14.787) {
      // >= 1 tbsp
      return { quantity: ml / 14.787, unit: "tbsp" };
    } else {
      return { quantity: ml / 4.929, unit: "tsp" };
    }
  }
  
  // Weight: convert to lbs if >= 1 lb, otherwise oz if >= 1 oz
  if (WEIGHT_TO_GRAMS[norm]) {
    const grams = quantity * WEIGHT_TO_GRAMS[norm];
    
    if (grams >= 453.592) {
      // >= 1 lb
      return { quantity: grams / 453.592, unit: "lb" };
    } else if (grams >= 28.3495) {
      // >= 1 oz
      return { quantity: grams / 28.3495, unit: "oz" };
    } else {
      return { quantity: grams, unit: "g" };
    }
  }
  
  return { quantity, unit: norm };
}

export interface MergeableItem {
  ingredient: string;
  quantity?: string | null;
  unit?: string | null;
  category?: string | null;
  recipe_id?: string | null;
  recipe_title?: string | null;
}

export interface MergedItem {
  ingredient: string;
  quantity: string | null;
  unit: string | null;
  category: string | null;
  sources: Array<{ recipe_id?: string | null; recipe_title?: string | null }>;
}

/**
 * Merge a list of shopping items, combining duplicates
 */
export function mergeShoppingItems(items: MergeableItem[]): MergedItem[] {
  const merged = new Map<string, MergedItem>();
  
  for (const item of items) {
    const normalizedName = normalizeIngredientName(item.ingredient);
    const existing = merged.get(normalizedName);
    
    if (!existing) {
      // First occurrence
      merged.set(normalizedName, {
        ingredient: item.ingredient, // Keep original casing from first occurrence
        quantity: item.quantity || null,
        unit: item.unit ? normalizeUnit(item.unit) : null,
        category: item.category || null,
        sources: item.recipe_id || item.recipe_title
          ? [{ recipe_id: item.recipe_id, recipe_title: item.recipe_title }]
          : [],
      });
    } else {
      // Merge with existing
      const newQuantity = parseQuantity(item.quantity || "");
      const existingQuantity = parseQuantity(existing.quantity || "");
      
      // Add source
      if (item.recipe_id || item.recipe_title) {
        const alreadyHasSource = existing.sources.some(
          (s) => s.recipe_id === item.recipe_id && s.recipe_title === item.recipe_title
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
          // Same unit, just add
          const total = existingQuantity + newQuantity;
          const preferred = existingUnit 
            ? getPreferredUnit(total, existingUnit)
            : { quantity: total, unit: null };
          existing.quantity = formatQuantity(preferred.quantity);
          existing.unit = preferred.unit;
        } else if (newUnit && existingUnit && areUnitsConvertible(newUnit, existingUnit)) {
          // Convertible units - convert to existing unit then add
          const converted = convertUnit(newQuantity, newUnit, existingUnit);
          if (converted !== null) {
            const total = existingQuantity + converted;
            const preferred = getPreferredUnit(total, existingUnit);
            existing.quantity = formatQuantity(preferred.quantity);
            existing.unit = preferred.unit;
          }
        }
        // If not convertible, we keep the existing quantity (conservative approach)
      } else if (newQuantity !== null && existingQuantity === null) {
        // Existing had no quantity, use new one
        existing.quantity = item.quantity || null;
        existing.unit = item.unit ? normalizeUnit(item.unit) : null;
      }
      // If new has no quantity but existing does, keep existing (do nothing)
    }
  }
  
  return Array.from(merged.values());
}

