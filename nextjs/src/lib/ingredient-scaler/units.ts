/**
 * Unit conversion and normalization utilities
 */

import { UNIT_ALIASES, VOLUME_TO_ML, WEIGHT_TO_GRAMS } from "./constants";

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
