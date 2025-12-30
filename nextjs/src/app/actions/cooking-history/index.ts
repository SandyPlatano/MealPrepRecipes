/**
 * Cooking History Server Actions
 *
 * Modular server actions for cooking history management.
 * Re-exports all history operations from organized submodules.
 */

// Read operations
export {
  getCookingHistory,
  getRecipeHistory,
  getUserCookingHistory,
  getRecentlyCookedRecipeIds,
  getMostRecentCookingEntry,
} from "./read";

// Create/Update/Delete operations
export {
  markAsCooked,
  updateCookingHistoryEntry,
  deleteCookingHistoryEntry,
  bulkDeleteCookingHistory,
} from "./write";

// Rating operations
export { quickRate, rateRecipeWithNotes } from "./ratings";
