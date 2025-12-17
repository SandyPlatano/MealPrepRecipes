/**
 * Recipe Markdown Generator
 *
 * Generates GitHub Flavored Markdown exports for individual recipes
 * with customizable sections based on user preferences.
 */

import type { Recipe } from "@/types/recipe";
import type { RecipeNutrition, NutritionData } from "@/types/nutrition";
import type { RecipeExportPreferences } from "@/types/settings";
import {
  createMarkdownHeading,
  createMarkdownList,
  createMarkdownTable,
  bold,
  italic,
  joinSections,
  createMarkdownHorizontalRule,
  downloadMarkdownFile,
} from "./markdown-generator";

export interface RecipeMarkdownOptions {
  recipe: Recipe;
  nutrition?: RecipeNutrition | NutritionData | null;
  preferences: RecipeExportPreferences;
}

/**
 * Default export preferences when user hasn't configured any
 */
export const DEFAULT_RECIPE_EXPORT_PREFERENCES: RecipeExportPreferences = {
  include_ingredients: true,
  include_instructions: true,
  include_nutrition: true,
  include_tags: false,
  include_times: true,
  include_notes: false,
  include_servings: true,
};

/**
 * Generate complete markdown document for a recipe
 */
export function generateRecipeMarkdown(options: RecipeMarkdownOptions): string {
  const { recipe, nutrition, preferences } = options;
  const sections: string[] = [];

  // Title is always included
  sections.push(createMarkdownHeading(recipe.title, 1));

  // Meta line (prep time, cook time, servings)
  const metaLine = buildMetaLine(recipe, preferences);
  if (metaLine) {
    sections.push(metaLine);
  }

  // Ingredients section
  if (preferences.include_ingredients && recipe.ingredients.length > 0) {
    sections.push(formatIngredientsSection(recipe.ingredients));
  }

  // Instructions section
  if (preferences.include_instructions && recipe.instructions.length > 0) {
    sections.push(formatInstructionsSection(recipe.instructions));
  }

  // Nutrition section
  if (preferences.include_nutrition && nutrition) {
    const nutritionSection = formatNutritionSection(nutrition, recipe.servings);
    if (nutritionSection) {
      sections.push(nutritionSection);
    }
  }

  // Notes section
  if (preferences.include_notes && recipe.notes) {
    sections.push(formatNotesSection(recipe.notes));
  }

  // Tags section
  if (preferences.include_tags && recipe.tags.length > 0) {
    sections.push(formatTagsSection(recipe.tags, recipe.recipe_type, recipe.category));
  }

  // Source URL (if available)
  if (recipe.source_url) {
    sections.push(formatSourceSection(recipe.source_url));
  }

  return joinSections(...sections);
}

/**
 * Build the meta line with prep time, cook time, servings
 */
function buildMetaLine(recipe: Recipe, preferences: RecipeExportPreferences): string | null {
  const parts: string[] = [];

  if (preferences.include_times) {
    if (recipe.prep_time) {
      parts.push(`${bold("Prep Time:")} ${recipe.prep_time}`);
    }
    if (recipe.cook_time) {
      parts.push(`${bold("Cook Time:")} ${recipe.cook_time}`);
    }
  }

  if (preferences.include_servings && recipe.servings) {
    parts.push(`${bold("Servings:")} ${recipe.servings}`);
  }

  if (parts.length === 0) return null;

  return parts.join(" | ");
}

/**
 * Format ingredients as a bulleted list
 */
export function formatIngredientsSection(ingredients: string[]): string {
  const heading = createMarkdownHeading("Ingredients", 2);
  const list = createMarkdownList(ingredients);
  return joinSections(heading, list);
}

/**
 * Format instructions as a numbered list
 */
export function formatInstructionsSection(instructions: string[]): string {
  const heading = createMarkdownHeading("Instructions", 2);
  const list = createMarkdownList(instructions, true);
  return joinSections(heading, list);
}

/**
 * Format nutrition data as a GFM table
 */
export function formatNutritionSection(
  nutrition: RecipeNutrition | NutritionData,
  servings?: string | null
): string | null {
  // Check if we have any nutrition data
  const hasData =
    nutrition.calories ||
    nutrition.protein_g ||
    nutrition.carbs_g ||
    nutrition.fat_g ||
    nutrition.fiber_g ||
    nutrition.sugar_g ||
    nutrition.sodium_mg;

  if (!hasData) return null;

  const heading = createMarkdownHeading(
    servings ? `Nutrition Facts (per serving)` : "Nutrition Facts",
    2
  );

  const rows: { Nutrient: string; Amount: string }[] = [];

  if (nutrition.calories !== null && nutrition.calories !== undefined) {
    rows.push({ Nutrient: "Calories", Amount: String(Math.round(nutrition.calories)) });
  }
  if (nutrition.protein_g !== null && nutrition.protein_g !== undefined) {
    rows.push({ Nutrient: "Protein", Amount: `${nutrition.protein_g}g` });
  }
  if (nutrition.carbs_g !== null && nutrition.carbs_g !== undefined) {
    rows.push({ Nutrient: "Carbs", Amount: `${nutrition.carbs_g}g` });
  }
  if (nutrition.fat_g !== null && nutrition.fat_g !== undefined) {
    rows.push({ Nutrient: "Fat", Amount: `${nutrition.fat_g}g` });
  }
  if (nutrition.fiber_g !== null && nutrition.fiber_g !== undefined) {
    rows.push({ Nutrient: "Fiber", Amount: `${nutrition.fiber_g}g` });
  }
  if (nutrition.sugar_g !== null && nutrition.sugar_g !== undefined) {
    rows.push({ Nutrient: "Sugar", Amount: `${nutrition.sugar_g}g` });
  }
  if (nutrition.sodium_mg !== null && nutrition.sodium_mg !== undefined) {
    rows.push({ Nutrient: "Sodium", Amount: `${nutrition.sodium_mg}mg` });
  }

  const table = createMarkdownTable(["Nutrient", "Amount"], rows);
  return joinSections(heading, table);
}

/**
 * Format notes section
 */
function formatNotesSection(notes: string): string {
  const heading = createMarkdownHeading("Notes", 2);
  return joinSections(heading, notes);
}

/**
 * Format tags section including recipe type and category
 */
function formatTagsSection(
  tags: string[],
  recipeType?: string,
  category?: string | null
): string {
  const allTags: string[] = [];

  if (recipeType) {
    allTags.push(recipeType);
  }
  if (category) {
    allTags.push(category);
  }
  allTags.push(...tags);

  const tagLine = italic(`Tags: ${allTags.join(", ")}`);
  return joinSections(createMarkdownHorizontalRule(), tagLine);
}

/**
 * Format source URL section
 */
function formatSourceSection(sourceUrl: string): string {
  return italic(`Source: ${sourceUrl}`);
}

/**
 * Generate filename for recipe export
 */
export function generateRecipeFilename(recipe: Recipe): string {
  const slug = recipe.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${slug}.md`;
}

/**
 * Export and download a recipe as markdown
 */
export function downloadRecipeAsMarkdown(options: RecipeMarkdownOptions): void {
  const content = generateRecipeMarkdown(options);
  const filename = generateRecipeFilename(options.recipe);
  downloadMarkdownFile(content, filename);
}
