/**
 * Recipe Detail Hooks
 *
 * Extracted from recipe-detail.tsx for better organization.
 */

export {
  useRecipeScaling,
  type UseRecipeScalingOptions,
  type UseRecipeScalingReturn,
} from "./use-recipe-scaling";

export {
  useRecipeHistory,
  type UseRecipeHistoryOptions,
  type UseRecipeHistoryReturn,
  type CookingHistoryEntry,
} from "./use-recipe-history";

export {
  useRecipeActions,
  type UseRecipeActionsOptions,
  type UseRecipeActionsReturn,
} from "./use-recipe-actions";

export {
  useRecipeNutrition,
  type UseRecipeNutritionOptions,
  type UseRecipeNutritionReturn,
} from "./use-recipe-nutrition";
