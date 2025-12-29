/**
 * Unit system conversion (Imperial <-> Metric)
 */

import {
  VOLUME_TO_ML,
  WEIGHT_TO_GRAMS,
  IMPERIAL_VOLUME_UNITS,
  METRIC_VOLUME_UNITS,
  IMPERIAL_WEIGHT_UNITS,
  METRIC_WEIGHT_UNITS,
} from "./constants";
import { normalizeUnit, convertUnit, getPreferredUnit } from "./units";
import { parseIngredient, formatQuantity } from "./parsing";

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
      return 5;
    } else if (value <= 15) {
      return Math.ceil(value / 5) * 5;
    } else if (value <= 100) {
      return Math.round(value / 5) * 5;
    } else if (value <= 500) {
      return Math.round(value / 25) * 25;
    } else {
      return Math.round(value / 50) * 50;
    }
  }

  // For liters
  if (normalizedUnit === "l") {
    return Math.round(value * 4) / 4;
  }

  // For grams
  if (normalizedUnit === "g") {
    if (value < 5) {
      return 5;
    } else if (value <= 25) {
      return Math.ceil(value / 5) * 5;
    } else if (value <= 100) {
      return Math.round(value / 10) * 10;
    } else if (value <= 500) {
      return Math.round(value / 25) * 25;
    } else {
      return Math.round(value / 50) * 50;
    }
  }

  // For kilograms
  if (normalizedUnit === "kg") {
    return Math.round(value * 10) / 10;
  }

  return value;
}

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
    if (targetSystem === "metric") {
      return "ml";
    } else {
      return "cup";
    }
  }

  // Weight units
  if (WEIGHT_TO_GRAMS[normalized]) {
    if (targetSystem === "metric") {
      return "g";
    } else {
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
