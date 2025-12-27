/**
 * Nutrition Actions Index
 *
 * Re-exports all nutrition actions from modular files.
 * Import from '@/app/actions/nutrition' for all nutrition functionality.
 */

// Recipe nutrition
export {
  getRecipeNutrition,
  updateRecipeNutrition,
  deleteRecipeNutrition,
  getBulkRecipeNutrition,
  getNutritionExtractionCosts,
} from "./recipe-nutrition";

// AI extraction
export { extractNutritionForRecipeInternal } from "./ai-extraction";

// Macro goals
export {
  getMacroGoals,
  updateMacroGoals,
  toggleNutritionTracking,
  isNutritionTrackingEnabled,
} from "./macro-goals";

// Daily logs
export {
  getDailyNutritionSummary,
  saveDailyNutritionLog,
  addQuickMacros,
  getQuickAddsForDate,
  deleteQuickAdd,
} from "./daily-logs";

// Weekly summary
export {
  getWeeklyNutritionDashboard,
  getNutritionHistory,
} from "./weekly-summary";
