/**
 * Settings Actions
 *
 * This file re-exports all settings actions from modular files.
 * The implementation has been split into focused modules under ./settings/
 *
 * @see ./settings/profile.ts - Profile actions
 * @see ./settings/core.ts - Core settings (getSettings, updateSettings)
 * @see ./settings/household.ts - Household management
 * @see ./settings/account.ts - Account deletion
 * @see ./settings/hints.ts - Hint management
 * @see ./settings/cook-mode.ts - Cook mode settings and presets
 * @see ./settings/meal-types.ts - Meal type customization
 * @see ./settings/planner.ts - Planner view settings
 * @see ./settings/recipes.ts - Recipe preferences and export
 * @see ./settings/calendar.ts - Calendar preferences
 * @see ./settings/dietary.ts - Dietary restrictions
 * @see ./settings/difficulty.ts - Difficulty thresholds
 * @see ./settings/cooks.ts - Default cooks by day
 */

export * from "./settings/index";
