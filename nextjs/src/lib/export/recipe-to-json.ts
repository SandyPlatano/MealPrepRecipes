/**
 * Recipe JSON Export Utility
 *
 * Converts recipes to JSON format for export and backup.
 * Includes full recipe data plus nutrition if available.
 */

import type { Recipe, RecipeWithNutrition } from "@/types/recipe";
import type { RecipeNutrition } from "@/types/nutrition";
import type { RecipeExportData } from "@/types/export";

/**
 * Convert a recipe to JSON export format
 */
export function recipeToJson(
  recipe: Recipe | RecipeWithNutrition,
  nutrition?: RecipeNutrition | null
): RecipeExportData {
  // Extract nutrition from RecipeWithNutrition if available
  const nutritionData =
    nutrition ?? ("nutrition" in recipe ? recipe.nutrition : null) ?? null;

  return {
    _export: {
      version: "1.0",
      exported_at: new Date().toISOString(),
      source: "mealpreprecipes",
    },
    recipe: {
      id: recipe.id,
      title: recipe.title,
      recipe_type: recipe.recipe_type,
      category: recipe.category,
      protein_type: recipe.protein_type,
      prep_time: recipe.prep_time,
      cook_time: recipe.cook_time,
      servings: recipe.servings,
      base_servings: recipe.base_servings,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      tags: recipe.tags,
      notes: recipe.notes,
      source_url: recipe.source_url,
      image_url: recipe.image_url,
      rating: recipe.rating,
      allergen_tags: recipe.allergen_tags,
      user_id: recipe.user_id,
      household_id: recipe.household_id,
      is_shared_with_household: recipe.is_shared_with_household,
      is_public: recipe.is_public,
      share_token: recipe.share_token,
      view_count: recipe.view_count,
      original_recipe_id: recipe.original_recipe_id,
      original_author_id: recipe.original_author_id,
      avg_rating: recipe.avg_rating,
      review_count: recipe.review_count,
      created_at: recipe.created_at,
      updated_at: recipe.updated_at,
    },
    nutrition: nutritionData
      ? {
          id: nutritionData.id,
          recipe_id: nutritionData.recipe_id,
          calories: nutritionData.calories,
          protein_g: nutritionData.protein_g,
          carbs_g: nutritionData.carbs_g,
          fat_g: nutritionData.fat_g,
          fiber_g: nutritionData.fiber_g,
          sugar_g: nutritionData.sugar_g,
          sodium_mg: nutritionData.sodium_mg,
          source: nutritionData.source,
          confidence_score: nutritionData.confidence_score,
          input_tokens: nutritionData.input_tokens,
          output_tokens: nutritionData.output_tokens,
          cost_usd: nutritionData.cost_usd,
          created_at: nutritionData.created_at,
          updated_at: nutritionData.updated_at,
        }
      : null,
  };
}

/**
 * Convert multiple recipes to JSON format
 */
export function recipesToJson(
  recipes: Array<Recipe | RecipeWithNutrition>,
  nutritionMap?: Map<string, RecipeNutrition>
): RecipeExportData[] {
  return recipes.map((recipe) => {
    const nutrition = nutritionMap?.get(recipe.id) ?? null;
    return recipeToJson(recipe, nutrition);
  });
}

/**
 * Generate JSON string for a single recipe
 */
export function generateRecipeJson(
  recipe: Recipe | RecipeWithNutrition,
  nutrition?: RecipeNutrition | null
): string {
  const exportData = recipeToJson(recipe, nutrition);
  return JSON.stringify(exportData, null, 2);
}

/**
 * Generate filename for JSON export
 */
export function generateJsonFilename(recipe: Recipe): string {
  const slug = recipe.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
  return `${slug}.json`;
}

/**
 * Download a recipe as JSON file
 */
export function downloadRecipeAsJson(
  recipe: Recipe | RecipeWithNutrition,
  nutrition?: RecipeNutrition | null
): void {
  const jsonContent = generateRecipeJson(recipe, nutrition);
  const blob = new Blob([jsonContent], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = generateJsonFilename(recipe);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Parse JSON import data and validate structure
 */
export function parseRecipeJson(jsonString: string): RecipeExportData | null {
  try {
    const data = JSON.parse(jsonString);

    // Validate it's our export format
    if (
      data._export?.source === "mealpreprecipes" &&
      data._export?.version === "1.0" &&
      data.recipe?.title
    ) {
      return data as RecipeExportData;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Parse multiple recipe JSON files from an array of strings
 */
export function parseRecipeJsonArray(
  jsonStrings: string[]
): RecipeExportData[] {
  const results: RecipeExportData[] = [];

  for (const jsonString of jsonStrings) {
    const parsed = parseRecipeJson(jsonString);
    if (parsed) {
      results.push(parsed);
    }
  }

  return results;
}
