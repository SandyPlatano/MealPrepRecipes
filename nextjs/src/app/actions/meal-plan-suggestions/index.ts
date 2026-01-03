/**
 * Meal Plan Suggestions Actions
 *
 * Re-exports all meal plan suggestion actions from modular files.
 * Import from '@/app/actions/meal-plan-suggestions' for all suggestion functionality.
 */

// Recipe suggestion queries
export {
  getRecentlyCooked,
  getFavoriteRecipes,
  getQuickRecipes,
  getNeverCookedRecipes,
  getSmartSuggestions,
} from "./queries";

// Type exports
export type { RecipeSuggestion } from "./queries";

// Week copying utilities
export {
  copyPreviousWeek,
  getPreviousWeekMealCount,
  copySelectedDaysToNextWeek,
} from "./week-copying";
