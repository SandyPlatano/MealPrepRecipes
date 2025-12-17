/**
 * Utility functions for parsing and scaling recipe ingredients
 */

import type { IngredientCategory } from "@/types/shopping-list";

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

// ============================================================================
// Unit System Conversion (Metric <-> Imperial)
// ============================================================================

export type UnitSystem = "imperial" | "metric";

/**
 * Round metric values to kitchen-friendly numbers
 * Makes measurements practical for actual cooking (e.g., 29.57ml → 30ml)
 */
function roundMetricValue(value: number, unit: string): number {
  const normalizedUnit = normalizeUnit(unit);

  // For milliliters
  if (normalizedUnit === "ml") {
    if (value < 5) {
      // Very small amounts: round up to 5ml minimum
      return 5;
    } else if (value <= 15) {
      // Small amounts: round to nearest 5
      return Math.ceil(value / 5) * 5;
    } else if (value <= 100) {
      // Medium amounts: round to nearest 5
      return Math.round(value / 5) * 5;
    } else if (value <= 500) {
      // Larger amounts: round to nearest 25
      return Math.round(value / 25) * 25;
    } else {
      // Very large amounts: round to nearest 50
      return Math.round(value / 50) * 50;
    }
  }

  // For liters
  if (normalizedUnit === "l") {
    // Round to nearest 0.25L (250ml increments)
    return Math.round(value * 4) / 4;
  }

  // For grams
  if (normalizedUnit === "g") {
    if (value < 5) {
      // Very small amounts: round up to 5g minimum
      return 5;
    } else if (value <= 25) {
      // Small amounts: round to nearest 5
      return Math.ceil(value / 5) * 5;
    } else if (value <= 100) {
      // Medium amounts: round to nearest 10
      return Math.round(value / 10) * 10;
    } else if (value <= 500) {
      // Larger amounts: round to nearest 25
      return Math.round(value / 25) * 25;
    } else {
      // Very large amounts: round to nearest 50
      return Math.round(value / 50) * 50;
    }
  }

  // For kilograms
  if (normalizedUnit === "kg") {
    // Round to nearest 0.1kg (100g increments)
    return Math.round(value * 10) / 10;
  }

  return value;
}

// Define which units belong to which system
const IMPERIAL_VOLUME_UNITS = ["tsp", "tbsp", "cup", "fl oz", "pint", "quart", "gallon"];
const METRIC_VOLUME_UNITS = ["ml", "l"];
const IMPERIAL_WEIGHT_UNITS = ["oz", "lb"];
const METRIC_WEIGHT_UNITS = ["g", "kg"];

/**
 * Check if a unit belongs to a specific system
 */
function isUnitInSystem(unit: string, system: UnitSystem): boolean {
  const normalized = normalizeUnit(unit);

  if (system === "imperial") {
    return IMPERIAL_VOLUME_UNITS.includes(normalized) || IMPERIAL_WEIGHT_UNITS.includes(normalized);
  } else {
    return METRIC_VOLUME_UNITS.includes(normalized) || METRIC_WEIGHT_UNITS.includes(normalized);
  }
}

/**
 * Get the target unit for conversion based on system preference
 * Returns null if unit is already in the target system or can't be converted
 */
export function getTargetUnit(unit: string, targetSystem: UnitSystem): string | null {
  const normalized = normalizeUnit(unit);

  // Check if already in target system
  if (isUnitInSystem(normalized, targetSystem)) {
    return null;
  }

  // Volume units
  if (VOLUME_TO_ML[normalized]) {
    // Converting to metric: use ml as base target
    if (targetSystem === "metric") {
      return "ml";
    } else {
      // Converting to imperial: use cup as base target
      return "cup";
    }
  }

  // Weight units
  if (WEIGHT_TO_GRAMS[normalized]) {
    // Converting to metric: use g as base target
    if (targetSystem === "metric") {
      return "g";
    } else {
      // Converting to imperial: use oz as base target
      return "oz";
    }
  }

  // Unit is not convertible (count units like "clove", "can")
  return null;
}

/**
 * Get preferred display unit within a system based on quantity
 * For metric: uses ml/l for volume, g/kg for weight based on magnitude
 *             and rounds to kitchen-friendly numbers
 * For imperial: uses existing getPreferredUnit logic
 */
function getPreferredUnitForSystem(
  quantity: number,
  unit: string,
  system: UnitSystem
): { quantity: number; unit: string } {
  const normalized = normalizeUnit(unit);

  if (system === "metric") {
    // Volume: use ml for small amounts, l for large
    if (VOLUME_TO_ML[normalized]) {
      const ml = quantity * VOLUME_TO_ML[normalized];
      if (ml >= 1000) {
        const liters = ml / 1000;
        return { quantity: roundMetricValue(liters, "l"), unit: "l" };
      }
      return { quantity: roundMetricValue(ml, "ml"), unit: "ml" };
    }

    // Weight: use g for small amounts, kg for large
    if (WEIGHT_TO_GRAMS[normalized]) {
      const g = quantity * WEIGHT_TO_GRAMS[normalized];
      if (g >= 1000) {
        const kg = g / 1000;
        return { quantity: roundMetricValue(kg, "kg"), unit: "kg" };
      }
      return { quantity: roundMetricValue(g, "g"), unit: "g" };
    }
  } else {
    // Imperial: use existing getPreferredUnit logic
    return getPreferredUnit(quantity, unit);
  }

  return { quantity, unit: normalized };
}

/**
 * Convert an ingredient string to the preferred unit system
 * Returns the original string if conversion is not possible
 */
export function convertIngredientToSystem(
  ingredient: string,
  targetSystem: UnitSystem
): string {
  const parsed = parseIngredient(ingredient);

  // No quantity found (e.g., "Salt to taste") - return original
  if (parsed.quantity === null) {
    return ingredient;
  }

  // No unit found (e.g., "3 eggs") - return original
  if (!parsed.unit) {
    return ingredient;
  }

  // Determine target unit for conversion
  const targetUnit = getTargetUnit(parsed.unit, targetSystem);

  // Already in correct system or unconvertible - return original
  if (!targetUnit) {
    return ingredient;
  }

  // Perform the conversion
  const convertedQty = convertUnit(parsed.quantity, parsed.unit, targetUnit);

  // Conversion failed - return original
  if (convertedQty === null) {
    return ingredient;
  }

  // Get the preferred display unit (e.g., 1000ml → 1l, or 48tsp → 1cup)
  const preferred = getPreferredUnitForSystem(convertedQty, targetUnit, targetSystem);

  // Format the quantity (handles fractions for imperial)
  const formattedQty = formatQuantity(preferred.quantity);

  // Reconstruct the ingredient string
  return `${formattedQty} ${preferred.unit} ${parsed.ingredient}`;
}

/**
 * Convert all ingredients in a list to the preferred unit system
 */
export function convertIngredientsToSystem(
  ingredients: string[],
  targetSystem: UnitSystem
): string[] {
  return ingredients.map((ing) => convertIngredientToSystem(ing, targetSystem));
}

// ============================================================================
// Enhanced Ingredient Intelligence
// ============================================================================


/**
 * Expanded descriptor lists for ingredient normalization
 */
const PREPARATION_DESCRIPTORS = [
  "chopped", "diced", "sliced", "minced", "crushed", "ground",
  "shredded", "grated", "peeled", "julienned", "cubed", "quartered",
  "halved", "torn", "crumbled", "mashed", "pureed", "zested",
  "trimmed", "deveined", "pitted", "seeded", "cored", "deboned",
  "butterflied", "thinly", "thickly", "roughly", "finely", "coarsely",
];

const STATE_DESCRIPTORS = [
  "fresh", "frozen", "dried", "canned", "raw", "cooked",
  "softened", "melted", "room temperature", "cold", "warm", "hot",
  "chilled", "thawed", "refrigerated", "ripe", "unripe", "rinsed",
  "drained", "packed", "loosely packed", "firmly packed",
];

const QUALITY_DESCRIPTORS = [
  "organic", "free-range", "grass-fed", "low-sodium", "reduced-fat",
  "extra-virgin", "virgin", "light", "dark", "unsalted", "salted",
  "sweetened", "unsweetened", "plain", "vanilla", "whole", "skim",
  "fat-free", "low-fat", "nonfat", "2%", "1%", "boneless", "skinless",
  "bone-in", "skin-on", "lean", "extra-lean", "kosher", "gluten-free",
];

/**
 * Category keyword map for intelligent categorization
 */
const CATEGORY_KEYWORDS: Record<IngredientCategory | string, string[]> = {
  "Produce": [
    // Vegetables
    "lettuce", "tomato", "onion", "garlic", "pepper", "carrot", "celery",
    "potato", "spinach", "kale", "broccoli", "cauliflower", "zucchini",
    "squash", "mushroom", "cucumber", "cabbage", "asparagus", "artichoke",
    "eggplant", "beet", "radish", "turnip", "parsnip", "leek", "shallot",
    "scallion", "green onion", "chive", "corn", "pea", "bean sprout",
    "bok choy", "brussels sprout", "fennel", "arugula", "watercress",
    "endive", "radicchio", "swiss chard", "collard", "mustard green",
    // Fruits
    "apple", "banana", "orange", "lemon", "lime", "grapefruit", "avocado",
    "grape", "strawberry", "blueberry", "raspberry", "blackberry", "cherry",
    "peach", "plum", "nectarine", "apricot", "mango", "pineapple", "papaya",
    "kiwi", "melon", "watermelon", "cantaloupe", "honeydew", "pomegranate",
    "fig", "date", "pear", "coconut", "passion fruit", "dragon fruit",
    // Herbs
    "basil", "cilantro", "parsley", "mint", "thyme", "rosemary", "oregano",
    "dill", "sage", "tarragon", "chervil", "marjoram", "bay leaf", "lemongrass",
  ],
  "Meat & Seafood": [
    // Meat
    "chicken", "beef", "pork", "lamb", "turkey", "duck", "veal", "venison",
    "bison", "rabbit", "goat", "bacon", "sausage", "ham", "prosciutto",
    "pancetta", "chorizo", "salami", "pepperoni", "hot dog", "bratwurst",
    "steak", "ground beef", "ground turkey", "ground pork", "ground chicken",
    "roast", "chop", "rib", "tenderloin", "sirloin", "filet", "brisket",
    "flank", "skirt", "breast", "thigh", "drumstick", "wing", "liver",
    // Seafood
    "salmon", "tuna", "cod", "tilapia", "halibut", "trout", "bass",
    "snapper", "mahi", "swordfish", "mackerel", "sardine", "anchovy",
    "shrimp", "prawn", "crab", "lobster", "scallop", "mussel", "clam",
    "oyster", "squid", "calamari", "octopus", "fish", "seafood",
  ],
  "Dairy & Eggs": [
    "milk", "cream", "half-and-half", "buttermilk", "evaporated milk",
    "condensed milk", "heavy cream", "whipping cream", "sour cream",
    "creme fraiche", "yogurt", "greek yogurt", "kefir",
    "butter", "margarine", "ghee",
    "cheese", "cheddar", "mozzarella", "parmesan", "feta", "gouda",
    "swiss", "provolone", "brie", "camembert", "blue cheese", "gorgonzola",
    "ricotta", "cottage cheese", "cream cheese", "mascarpone", "goat cheese",
    "gruyere", "manchego", "pecorino", "asiago", "havarti", "monterey jack",
    "colby", "american cheese", "velveeta", "queso",
    "egg", "eggs", "egg white", "egg yolk",
  ],
  "Pantry": [
    // Grains & Starches
    "flour", "bread flour", "cake flour", "whole wheat flour", "almond flour",
    "rice", "white rice", "brown rice", "jasmine rice", "basmati rice",
    "arborio rice", "wild rice", "quinoa", "couscous", "bulgur", "farro",
    "barley", "oat", "oats", "oatmeal", "cornmeal", "polenta", "grits",
    "pasta", "spaghetti", "penne", "rigatoni", "fettuccine", "linguine",
    "macaroni", "lasagna", "orzo", "noodle", "ramen", "udon", "soba",
    "bread crumb", "panko", "crouton",
    // Legumes
    "bean", "black bean", "kidney bean", "pinto bean", "navy bean",
    "cannellini", "chickpea", "garbanzo", "lentil", "split pea",
    // Oils & Vinegars
    "oil", "olive oil", "vegetable oil", "canola oil", "coconut oil",
    "sesame oil", "peanut oil", "avocado oil", "grapeseed oil",
    "vinegar", "balsamic", "red wine vinegar", "white wine vinegar",
    "apple cider vinegar", "rice vinegar", "sherry vinegar",
    // Sauces & Stocks
    "soy sauce", "tamari", "fish sauce", "worcestershire", "oyster sauce",
    "hoisin", "teriyaki", "broth", "stock", "bouillon", "tomato paste",
    "tomato sauce", "marinara", "alfredo",
    // Baking
    "sugar", "brown sugar", "powdered sugar", "confectioners sugar",
    "honey", "maple syrup", "molasses", "corn syrup", "agave",
    "baking powder", "baking soda", "yeast", "cornstarch", "arrowroot",
    "gelatin", "vanilla extract", "almond extract", "cocoa powder",
    "chocolate chip", "chocolate", "nut", "almond", "walnut", "pecan",
    "cashew", "peanut", "pistachio", "hazelnut", "macadamia", "pine nut",
    "seed", "sesame seed", "sunflower seed", "pumpkin seed", "flax seed",
    "chia seed", "poppy seed",
  ],
  "Spices": [
    "salt", "pepper", "black pepper", "white pepper", "sea salt", "kosher salt",
    "cumin", "paprika", "smoked paprika", "cayenne", "chili powder",
    "cinnamon", "nutmeg", "allspice", "clove", "cardamom", "coriander",
    "turmeric", "ginger", "curry powder", "garam masala", "five spice",
    "oregano", "thyme", "rosemary", "sage", "basil", "bay leaf", "dill",
    "tarragon", "marjoram", "parsley flakes", "chives",
    "garlic powder", "onion powder", "mustard powder", "celery salt",
    "red pepper flake", "crushed red pepper", "chili flake",
    "saffron", "sumac", "za'atar", "ras el hanout", "herbes de provence",
    "italian seasoning", "poultry seasoning", "old bay", "taco seasoning",
    "everything bagel seasoning",
  ],
  "Condiments": [
    "ketchup", "mustard", "yellow mustard", "dijon", "whole grain mustard",
    "mayonnaise", "mayo", "aioli", "hot sauce", "sriracha", "tabasco",
    "bbq sauce", "barbecue sauce", "ranch", "blue cheese dressing",
    "salsa", "pico de gallo", "guacamole", "hummus", "tahini",
    "pesto", "chimichurri", "tzatziki", "harissa", "gochujang",
    "relish", "pickle", "olive", "caper", "sun-dried tomato",
    "jam", "jelly", "preserves", "marmalade", "peanut butter", "almond butter",
    "nutella", "chutney", "horseradish", "wasabi",
  ],
  "Frozen": [
    "frozen", "ice cream", "gelato", "sorbet", "frozen yogurt",
    "frozen vegetable", "frozen fruit", "frozen pizza", "frozen dinner",
    "frozen waffle", "frozen pie", "frozen dough",
  ],
  "Beverages": [
    "water", "sparkling water", "soda", "cola", "sprite", "ginger ale",
    "juice", "orange juice", "apple juice", "grape juice", "cranberry juice",
    "lemonade", "iced tea", "sweet tea",
    "coffee", "espresso", "cold brew", "tea", "green tea", "black tea",
    "herbal tea", "chamomile", "matcha",
    "milk", "oat milk", "almond milk", "soy milk", "coconut milk",
    "wine", "red wine", "white wine", "rose", "champagne", "prosecco",
    "beer", "ale", "lager", "stout", "cider",
    "vodka", "rum", "tequila", "whiskey", "bourbon", "gin", "brandy",
  ],
  "Bakery": [
    "bread", "white bread", "wheat bread", "sourdough", "rye bread",
    "baguette", "ciabatta", "focaccia", "brioche", "challah",
    "bagel", "english muffin", "croissant", "danish", "muffin", "scone",
    "roll", "dinner roll", "hamburger bun", "hot dog bun", "slider bun",
    "tortilla", "flour tortilla", "corn tortilla", "wrap", "pita", "naan",
    "flatbread", "lavash", "cracker", "breadstick",
    "cake", "cupcake", "brownie", "cookie", "pie", "tart", "pastry",
    "donut", "doughnut", "cinnamon roll",
  ],
  "Snacks": [
    "chip", "potato chip", "tortilla chip", "corn chip", "pita chip",
    "cracker", "pretzel", "popcorn", "nut", "trail mix",
    "granola bar", "protein bar", "energy bar", "fruit snack",
    "beef jerky", "cheese puff", "cheeto", "dorito",
  ],
};

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
 * Merged item with confidence scoring
 */
export interface MergedItemWithConfidence extends MergedItem {
  confidence: number;  // 0-1, how confident we are in the merge
  needs_review: boolean;  // Flag for user to review
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
    for (const [key, existing] of Array.from(merged.entries())) {
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

