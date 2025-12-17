import type { MealType } from "@/types/meal-plan";

/**
 * Recipe types that can be mapped to meal types.
 * These match the recipe_type values in the recipes table.
 */
type RecipeType = "Dinner" | "Breakfast" | "Snack" | "Baking" | "Dessert" | "Side Dish" | string;

/**
 * Infer meal type from a recipe's recipe_type field.
 *
 * Mapping:
 * - Breakfast → breakfast
 * - Dinner → dinner
 * - Snack → snack
 * - Baking, Dessert, Side Dish → null (user picks)
 *
 * @param recipeType - The recipe_type from the recipe
 * @returns The inferred meal type or null if ambiguous
 */
export function inferMealType(recipeType: RecipeType | null | undefined): MealType | null {
  if (!recipeType) return null;

  switch (recipeType) {
    case "Breakfast":
      return "breakfast";
    case "Dinner":
      return "dinner";
    case "Snack":
      return "snack";
    // Ambiguous types — let user decide
    case "Baking":
    case "Dessert":
    case "Side Dish":
    default:
      return null;
  }
}

/**
 * Get a friendly display name for the meal type inference result.
 * Useful for showing users why a certain meal type was auto-selected.
 */
export function getInferenceReason(recipeType: RecipeType | null | undefined): string | null {
  if (!recipeType) return null;

  switch (recipeType) {
    case "Breakfast":
      return "Auto-selected based on recipe type";
    case "Dinner":
      return "Auto-selected based on recipe type";
    case "Snack":
      return "Auto-selected based on recipe type";
    default:
      return null;
  }
}
