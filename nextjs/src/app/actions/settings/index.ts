/**
 * Settings Actions Index
 *
 * Re-exports all settings actions from modular files.
 * Import from '@/app/actions/settings' for all settings functionality.
 */

// Profile
export { getProfile, updateProfile } from "./profile";

// Core settings
export { getSettings, updateSettings } from "./core";

// Household
export { getHouseholdInfo, updateHouseholdName } from "./household";

// Account
export { deleteAccount } from "./account";

// Hints
export { dismissHint, resetAllHints } from "./hints";

// Cook mode
export {
  getCookModeSettings,
  updateCookModeSettings,
  getCustomCookModePresets,
  saveCustomCookModePreset,
  updateCustomCookModePreset,
  deleteCustomCookModePreset,
  setDefaultCookModePreset,
  duplicateCookModePreset,
} from "./cook-mode";

// Meal types
export {
  getMealTypeEmojiSettings,
  updateMealTypeEmojiSettings,
  getMealTypeCustomization,
  updateMealTypeSetting,
  updateMealTypeCustomization,
  resetMealTypeCustomization,
} from "./meal-types";

// Planner view
export {
  getPlannerViewSettings,
  updatePlannerViewSettings,
  resetPlannerViewSettings,
} from "./planner";

// Recipe preferences
export {
  getRecipePreferences,
  updateRecipePreferences,
  getRecipeExportPreferences,
  updateRecipeExportPreferences,
  updateShowRecipeSources,
} from "./recipes";

// Calendar
export { getCalendarPreferences, updateCalendarPreferences } from "./calendar";

// Dietary restrictions
export {
  addCustomDietaryRestriction,
  removeCustomDietaryRestriction,
} from "./dietary";

// Difficulty thresholds
export {
  getDifficultyThresholds,
  updateDifficultyThresholds,
  resetDifficultyThresholds,
} from "./difficulty";

// Default cooks by day
export {
  getDefaultCooksByDay,
  updateDefaultCooksByDay,
  setDefaultCookForDay,
  resetDefaultCooksByDay,
} from "./cooks";
