/**
 * Meal Plans Actions
 *
 * Barrel export for all meal plan related actions.
 * Modular structure for maintainability (originally 1,512 LOC).
 */

// Core CRUD operations
export {
  getOrCreateMealPlan,
  getWeekPlan,
  clearWeekMealPlan,
  deleteMealPlan,
} from "./core";

// Meal assignment operations
export {
  addMealAssignment,
  removeMealAssignment,
  updateMealAssignment,
  moveAssignment,
  clearDayAssignments,
} from "./assignments";

// Template operations
export {
  getMealPlanTemplates,
  createMealPlanTemplate,
  updateMealPlanTemplate,
  deleteMealPlanTemplate,
  applyMealPlanTemplate,
  createMealPlanTemplateFromPlan,
} from "./templates";

// Query operations
export {
  getRecipesForPlanning,
  getWeekPlanWithFullRecipes,
  getWeekPlanForShoppingList,
  getWeeksMealCounts,
  getRecipeRepetitionWarnings,
} from "./queries";

// Status operations
export {
  markMealPlanAsSent,
  markMealPlanAsSentDuringRender,
  getSentMealPlans,
} from "./status";
