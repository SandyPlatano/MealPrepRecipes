/**
 * Paprika Recipe Parser
 *
 * Parses .paprikarecipes files (gzipped JSON archives) and converts
 * them to our recipe format for import.
 */

import pako from "pako";
import type { Recipe, RecipeType } from "@/types/recipe";
import type { PaprikaRecipe, ImportValidationResult } from "@/types/export";

/**
 * Parse a .paprikarecipes file (gzipped archive containing JSON)
 * Each recipe is stored as a separate gzipped JSON file within the archive
 */
export async function parsePaprikaFile(
  file: File
): Promise<{ recipes: PaprikaRecipe[]; error?: string }> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Paprika files are gzipped - decompress
    let decompressed: Uint8Array;
    try {
      decompressed = pako.ungzip(uint8Array);
    } catch {
      // If ungzip fails, maybe it's not compressed
      decompressed = uint8Array;
    }

    // Convert to string
    const textDecoder = new TextDecoder("utf-8");
    const jsonString = textDecoder.decode(decompressed);

    // Parse JSON - could be single recipe or array
    const parsed = JSON.parse(jsonString);

    if (Array.isArray(parsed)) {
      return { recipes: parsed as PaprikaRecipe[] };
    } else if (parsed.name) {
      // Single recipe
      return { recipes: [parsed as PaprikaRecipe] };
    } else if (parsed.recipes) {
      // Recipes wrapper object
      return { recipes: parsed.recipes as PaprikaRecipe[] };
    }

    return { recipes: [], error: "Unknown Paprika file format" };
  } catch (error) {
    return {
      recipes: [],
      error: `Failed to parse Paprika file: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Map Paprika recipe type to our RecipeType
 */
function mapPaprikaCategory(categories?: string[]): RecipeType {
  if (!categories || categories.length === 0) return "Dinner";

  const category = categories[0].toLowerCase();

  if (
    category.includes("breakfast") ||
    category.includes("brunch") ||
    category.includes("morning")
  ) {
    return "Breakfast";
  }
  if (
    category.includes("dessert") ||
    category.includes("sweet") ||
    category.includes("cake") ||
    category.includes("cookie")
  ) {
    return "Dessert";
  }
  if (
    category.includes("baking") ||
    category.includes("bread") ||
    category.includes("pastry")
  ) {
    return "Baking";
  }
  if (
    category.includes("snack") ||
    category.includes("appetizer") ||
    category.includes("starter")
  ) {
    return "Snack";
  }
  if (
    category.includes("side") ||
    category.includes("salad") ||
    category.includes("vegetable")
  ) {
    return "Side Dish";
  }

  return "Dinner";
}

/**
 * Parse ingredients from Paprika format (newline-separated string)
 */
function parseIngredients(ingredients?: string): string[] {
  if (!ingredients) return [];

  return ingredients
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/**
 * Parse instructions from Paprika format (newline-separated string)
 */
function parseInstructions(directions?: string): string[] {
  if (!directions) return [];

  return directions
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      // Remove leading step numbers like "1.", "1)", "Step 1:"
      return line.replace(/^(\d+[\.\):]?\s*|step\s*\d+[:\s]*)/i, "").trim();
    })
    .filter((line) => line.length > 0);
}

/**
 * Normalize time string to our format
 * Paprika uses formats like "30 min", "1 hr 30 min", "1h30m"
 */
function normalizeTimeString(time?: string): string | null {
  if (!time) return null;

  const trimmed = time.trim();
  if (trimmed.length === 0) return null;

  // Already in a reasonable format, just standardize
  return trimmed
    .replace(/\bhr\b/gi, "hour")
    .replace(/\bhrs\b/gi, "hours")
    .replace(/\bmin\b/gi, "minutes")
    .replace(/\bmins\b/gi, "minutes")
    .replace(/\bsec\b/gi, "seconds")
    .replace(/\bsecs\b/gi, "seconds")
    .replace(/\bh\b/gi, " hour ")
    .replace(/\bm\b/gi, " minutes ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extract tags from Paprika categories
 */
function extractTags(categories?: string[]): string[] {
  if (!categories) return [];
  // Skip the first category as it's used for recipe_type
  return categories.slice(1).filter((cat) => cat && cat.trim().length > 0);
}

/**
 * Convert a Paprika recipe to our Recipe format
 */
export function mapPaprikaToRecipe(
  paprika: PaprikaRecipe,
  userId: string
): Partial<Recipe> {
  const ingredients = parseIngredients(paprika.ingredients);
  const instructions = parseInstructions(paprika.directions);

  return {
    title: paprika.name,
    recipe_type: mapPaprikaCategory(paprika.categories),
    category: paprika.categories?.[0] ?? null,
    protein_type: null,
    prep_time: normalizeTimeString(paprika.prep_time),
    cook_time: normalizeTimeString(paprika.cook_time),
    servings: paprika.servings ?? null,
    base_servings: paprika.servings
      ? parseInt(paprika.servings.replace(/[^\d]/g, ""), 10) || null
      : null,
    ingredients,
    instructions,
    tags: extractTags(paprika.categories),
    notes: paprika.notes ?? null,
    source_url: paprika.source_url ?? paprika.source ?? null,
    image_url: paprika.image_url ?? null,
    rating:
      paprika.rating !== undefined
        ? Math.min(5, Math.max(1, paprika.rating))
        : null,
    allergen_tags: [],
    user_id: userId,
    household_id: null,
    is_shared_with_household: true,
    is_public: false,
    share_token: null,
    view_count: 0,
    original_recipe_id: null,
    original_author_id: null,
    avg_rating: null,
    review_count: 0,
  };
}

/**
 * Validate a Paprika recipe for import
 */
export function validatePaprikaRecipe(
  paprika: PaprikaRecipe,
  index: number,
  existingTitles: Set<string>
): ImportValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required: name
  if (!paprika.name || paprika.name.trim().length === 0) {
    errors.push("Recipe name is required");
  }

  // Check for duplicate
  const normalizedTitle = paprika.name?.toLowerCase().trim() ?? "";
  const isDuplicate = existingTitles.has(normalizedTitle);

  // Warnings for missing optional data
  if (
    !paprika.ingredients ||
    parseIngredients(paprika.ingredients).length === 0
  ) {
    warnings.push("No ingredients found");
  }

  if (
    !paprika.directions ||
    parseInstructions(paprika.directions).length === 0
  ) {
    warnings.push("No instructions found");
  }

  return {
    index,
    title: paprika.name || `Recipe ${index + 1}`,
    isValid: errors.length === 0,
    isDuplicate,
    errors,
    warnings,
    parsedRecipe: null, // Will be populated during actual import
  };
}

/**
 * Batch validate Paprika recipes
 */
export function validatePaprikaRecipes(
  recipes: PaprikaRecipe[],
  existingTitles: Set<string>
): ImportValidationResult[] {
  return recipes.map((recipe, index) =>
    validatePaprikaRecipe(recipe, index, existingTitles)
  );
}
