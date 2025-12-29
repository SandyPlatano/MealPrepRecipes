/**
 * Ingredient parsing utilities
 * Functions for extracting and formatting quantities, units, and ingredient names
 */

import {
  FRACTIONS,
  FRACTION_PATTERN,
  MIXED_NUMBER_PATTERN,
  DECIMAL_PATTERN,
  RANGE_PATTERN,
} from "./constants";

export interface ParsedIngredient {
  quantity: number | null;
  unit: string;
  ingredient: string;
  original: string;
}

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
export function parseQuantity(text: string): number | null {
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
export function formatQuantity(value: number): string {
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
