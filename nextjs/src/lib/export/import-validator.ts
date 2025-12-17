/**
 * Import Validator
 *
 * Validates imported recipe data and detects duplicates
 * before inserting into the database.
 */

import type { Recipe, RecipeType } from "@/types/recipe";
import type {
  ImportValidationResult,
  ImportParseResult,
  RecipeExportData,
  PaprikaRecipe,
  ImportFormat,
} from "@/types/export";
import { parseRecipeJson } from "./recipe-to-json";
import {
  parsePaprikaFile,
  mapPaprikaToRecipe,
  validatePaprikaRecipe,
} from "./paprika-parser";

const VALID_RECIPE_TYPES: RecipeType[] = [
  "Dinner",
  "Baking",
  "Breakfast",
  "Dessert",
  "Snack",
  "Side Dish",
];

/**
 * Detect the format of an import file
 */
export function detectImportFormat(file: File): ImportFormat | null {
  const extension = file.name.toLowerCase().split(".").pop();

  if (extension === "json") {
    return "json";
  }
  if (extension === "paprikarecipes" || extension === "paprika") {
    return "paprika";
  }

  return null;
}

/**
 * Validate a single recipe from our JSON export format
 */
function validateJsonRecipe(
  data: RecipeExportData,
  index: number,
  existingTitles: Set<string>
): ImportValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const recipe = data.recipe;

  // Required fields
  if (!recipe.title || recipe.title.trim().length === 0) {
    errors.push("Recipe title is required");
  }

  if (!recipe.recipe_type) {
    errors.push("Recipe type is required");
  } else if (!VALID_RECIPE_TYPES.includes(recipe.recipe_type)) {
    errors.push(`Invalid recipe type: ${recipe.recipe_type}`);
  }

  if (!Array.isArray(recipe.ingredients)) {
    errors.push("Ingredients must be an array");
  } else if (recipe.ingredients.length === 0) {
    warnings.push("No ingredients provided");
  }

  if (!Array.isArray(recipe.instructions)) {
    errors.push("Instructions must be an array");
  } else if (recipe.instructions.length === 0) {
    warnings.push("No instructions provided");
  }

  // Check for duplicate
  const normalizedTitle = recipe.title?.toLowerCase().trim() ?? "";
  const isDuplicate = existingTitles.has(normalizedTitle);

  // Warnings for optional but recommended fields
  if (!recipe.servings && !recipe.base_servings) {
    warnings.push("No servings information");
  }

  return {
    index,
    title: recipe.title || `Recipe ${index + 1}`,
    isValid: errors.length === 0,
    isDuplicate,
    errors,
    warnings,
    parsedRecipe: errors.length === 0 ? recipe : null,
  };
}

/**
 * Parse and validate a JSON import file
 */
async function parseJsonImportFile(
  file: File,
  existingTitles: Set<string>,
  userId: string
): Promise<ImportParseResult> {
  try {
    const text = await file.text();

    // Try to parse as array or single recipe
    let jsonData: unknown;
    try {
      jsonData = JSON.parse(text);
    } catch {
      return {
        success: false,
        format: "json",
        recipes: [],
        totalCount: 0,
        validCount: 0,
        duplicateCount: 0,
        invalidCount: 0,
        error: "Invalid JSON format",
      };
    }

    // Handle different JSON structures
    let exportDataArray: RecipeExportData[] = [];

    if (Array.isArray(jsonData)) {
      // Array of exports
      exportDataArray = jsonData.filter(
        (item) =>
          item._export?.source === "mealpreprecipes" ||
          (item.recipe && item.recipe.title)
      ) as RecipeExportData[];
    } else if (
      typeof jsonData === "object" &&
      jsonData !== null &&
      "_export" in jsonData
    ) {
      // Single export
      exportDataArray = [jsonData as RecipeExportData];
    } else if (
      typeof jsonData === "object" &&
      jsonData !== null &&
      "recipes" in jsonData
    ) {
      // Wrapped array
      const wrapped = jsonData as { recipes: RecipeExportData[] };
      exportDataArray = wrapped.recipes;
    }

    if (exportDataArray.length === 0) {
      return {
        success: false,
        format: "json",
        recipes: [],
        totalCount: 0,
        validCount: 0,
        duplicateCount: 0,
        invalidCount: 0,
        error: "No valid recipes found in file",
      };
    }

    // Validate each recipe
    const validationResults = exportDataArray.map((data, index) => {
      const result = validateJsonRecipe(data, index, existingTitles);
      // Inject user_id into parsed recipe
      if (result.parsedRecipe) {
        result.parsedRecipe = {
          ...result.parsedRecipe,
          user_id: userId,
          // Reset social/ownership fields for imported recipes
          id: undefined as unknown as string, // Will be generated
          household_id: null,
          is_public: false,
          share_token: null,
          view_count: 0,
          original_recipe_id: null,
          original_author_id: null,
          avg_rating: null,
          review_count: 0,
        };
      }
      return result;
    });

    return {
      success: true,
      format: "json",
      recipes: validationResults,
      totalCount: validationResults.length,
      validCount: validationResults.filter((r) => r.isValid).length,
      duplicateCount: validationResults.filter((r) => r.isDuplicate).length,
      invalidCount: validationResults.filter((r) => !r.isValid).length,
    };
  } catch (error) {
    return {
      success: false,
      format: "json",
      recipes: [],
      totalCount: 0,
      validCount: 0,
      duplicateCount: 0,
      invalidCount: 0,
      error: `Failed to parse JSON file: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Parse and validate a Paprika import file
 */
async function parsePaprikaImportFile(
  file: File,
  existingTitles: Set<string>,
  userId: string
): Promise<ImportParseResult> {
  const { recipes: paprikaRecipes, error } = await parsePaprikaFile(file);

  if (error || paprikaRecipes.length === 0) {
    return {
      success: false,
      format: "paprika",
      recipes: [],
      totalCount: 0,
      validCount: 0,
      duplicateCount: 0,
      invalidCount: 0,
      error: error || "No recipes found in Paprika file",
    };
  }

  // Validate each recipe
  const validationResults: ImportValidationResult[] = paprikaRecipes.map(
    (paprika, index) => {
      const basicValidation = validatePaprikaRecipe(
        paprika,
        index,
        existingTitles
      );

      // Convert to our format if valid
      if (basicValidation.isValid) {
        basicValidation.parsedRecipe = mapPaprikaToRecipe(
          paprika,
          userId
        ) as Partial<Recipe>;
      }

      return basicValidation;
    }
  );

  return {
    success: true,
    format: "paprika",
    recipes: validationResults,
    totalCount: validationResults.length,
    validCount: validationResults.filter((r) => r.isValid).length,
    duplicateCount: validationResults.filter((r) => r.isDuplicate).length,
    invalidCount: validationResults.filter((r) => !r.isValid).length,
  };
}

/**
 * Main entry point for parsing import files
 */
export async function parseImportFile(
  file: File,
  existingTitles: Set<string>,
  userId: string
): Promise<ImportParseResult> {
  const format = detectImportFormat(file);

  if (!format) {
    return {
      success: false,
      format: "json",
      recipes: [],
      totalCount: 0,
      validCount: 0,
      duplicateCount: 0,
      invalidCount: 0,
      error: `Unsupported file format. Please use .json or .paprikarecipes files.`,
    };
  }

  if (format === "json") {
    return parseJsonImportFile(file, existingTitles, userId);
  }

  return parsePaprikaImportFile(file, existingTitles, userId);
}

/**
 * Prepare recipes for database insertion
 * Handles duplicate resolution based on user choice
 */
export function prepareRecipesForImport(
  validationResults: ImportValidationResult[],
  duplicateHandling: "skip" | "replace" | "keep_both",
  existingRecipeMap: Map<string, string> // normalizedTitle -> recipeId
): {
  toInsert: Partial<Recipe>[];
  toReplace: Array<{ id: string; recipe: Partial<Recipe> }>;
  skipped: number;
} {
  const toInsert: Partial<Recipe>[] = [];
  const toReplace: Array<{ id: string; recipe: Partial<Recipe> }> = [];
  let skipped = 0;

  for (const result of validationResults) {
    if (!result.isValid || !result.parsedRecipe) {
      skipped++;
      continue;
    }

    const normalizedTitle = result.title.toLowerCase().trim();
    const existingId = existingRecipeMap.get(normalizedTitle);

    if (result.isDuplicate && existingId) {
      switch (duplicateHandling) {
        case "skip":
          skipped++;
          break;
        case "replace":
          toReplace.push({
            id: existingId,
            recipe: result.parsedRecipe,
          });
          break;
        case "keep_both":
          // Append "(imported)" to title
          toInsert.push({
            ...result.parsedRecipe,
            title: `${result.title} (imported)`,
          });
          break;
      }
    } else {
      toInsert.push(result.parsedRecipe);
    }
  }

  return { toInsert, toReplace, skipped };
}
