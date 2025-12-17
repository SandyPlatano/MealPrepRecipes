/**
 * Export Utilities
 *
 * Centralized exports for markdown generation, file downloads,
 * JSON export/import, bulk operations, and Paprika format support.
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

// JSON export
export {
  recipeToJson,
  recipesToJson,
  generateRecipeJson,
  generateJsonFilename,
  downloadRecipeAsJson,
  parseRecipeJson,
  parseRecipeJsonArray,
} from "./recipe-to-json";

// Bulk export (ZIP)
export {
  createExportZip,
  downloadZipBlob,
  downloadBulkExport,
  estimateExportSize,
  formatBytes,
  type BulkExportOptions,
} from "./bulk-export";

// Paprika import
export {
  parsePaprikaFile,
  mapPaprikaToRecipe,
  validatePaprikaRecipe,
  validatePaprikaRecipes,
} from "./paprika-parser";

// Import validation
export {
  detectImportFormat,
  parseImportFile,
  prepareRecipesForImport,
} from "./import-validator";
