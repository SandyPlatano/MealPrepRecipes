/**
 * Ingredient scaling utilities
 * Scale ingredients based on serving size changes
 */

import { parseIngredient, formatQuantity } from "./parsing";

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
