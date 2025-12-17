/**
 * Export Utilities
 *
 * Centralized exports for markdown generation and file downloads.
 */

// Core markdown utilities
export {
  escapeMarkdown,
  createMarkdownHeading,
  createMarkdownList,
  createMarkdownCheckboxList,
  createMarkdownTable,
  createMarkdownHorizontalRule,
  bold,
  italic,
  joinSections,
  downloadMarkdownFile,
  formatDateRangeForFilename,
  type MarkdownTableRow,
} from "./markdown-generator";

// Recipe markdown
export {
  generateRecipeMarkdown,
  downloadRecipeAsMarkdown,
  generateRecipeFilename,
  formatIngredientsSection,
  formatInstructionsSection,
  formatNutritionSection,
  DEFAULT_RECIPE_EXPORT_PREFERENCES,
  type RecipeMarkdownOptions,
} from "./recipe-markdown";

// Meal plan markdown
export {
  generateMealPlanMarkdown,
  downloadMealPlanAsMarkdown,
  generateMealPlanFilename,
  formatWeekScheduleTable,
  type MealPlanMarkdownOptions,
  type MealPlanAssignment,
  type MealPlanRecipe,
} from "./meal-plan-markdown";

// Shopping list markdown
export {
  generateShoppingListMarkdown,
  generateSimpleShoppingListMarkdown,
  downloadShoppingListAsMarkdown,
  generateShoppingListFilename,
  type ShoppingListMarkdownOptions,
  type ShoppingListItem,
} from "./shopping-list-markdown";
