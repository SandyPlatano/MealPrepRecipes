/**
 * Extracts Recipe schema information from HTML using JSON-LD format
 * Many modern recipe websites embed structured data for better SEO
 */

// HowToStep or HowToSection from schema.org
export interface RecipeInstructionItem {
  "@type"?: "HowToStep" | "HowToSection";
  text?: string;
  name?: string;
  itemListElement?: RecipeInstructionItem[]; // For HowToSection
}

// Nutrition from JSON-LD (maps to schema.org/NutritionInformation)
export interface SchemaNutrition {
  "@type"?: "NutritionInformation";
  calories?: string;
  proteinContent?: string;
  carbohydrateContent?: string;
  fatContent?: string;
  fiberContent?: string;
  sugarContent?: string;
  sodiumContent?: string;
  servingSize?: string;
}

export interface RecipeSchema {
  // Core identification
  name?: string;
  description?: string;
  author?: { name?: string } | string;

  // Timing (ISO 8601 duration format)
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;

  // Servings
  recipeYield?: string | string[] | number;

  // CRITICAL: Use correct field name from JSON-LD spec (not "ingredients")
  recipeIngredient?: string[];

  // Instructions - can be strings, HowToStep objects, or HowToSection
  recipeInstructions?: RecipeInstructionItem[] | string | string[];

  // Categorization
  recipeCategory?: string | string[];
  recipeCuisine?: string | string[];
  keywords?: string;

  // Media
  image?: string | string[] | { url?: string }[];

  // Nutrition (optional but valuable)
  nutrition?: SchemaNutrition;

  // Metadata
  datePublished?: string;
  aggregateRating?: {
    ratingValue?: string | number;
    ratingCount?: string | number;
    reviewCount?: string | number;
  };
}

/**
 * Extracts Recipe JSON-LD schema from HTML content
 * Returns the first Recipe schema found, or null if none exists
 */
export function extractRecipeSchema(html: string): RecipeSchema | null {
  try {
    // Find all JSON-LD script tags
    const jsonLdPattern = /<script[^>]*type=["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script>/gi;
    let match;

    while ((match = jsonLdPattern.exec(html)) !== null) {
      try {
        const jsonData = JSON.parse(match[1]);

        // Check if this is a Recipe schema or has Recipe in @graph
        if (jsonData["@type"] === "Recipe") {
          return jsonData as RecipeSchema;
        }

        // Check for @graph format (sometimes recipes are nested)
        if (jsonData["@graph"] && Array.isArray(jsonData["@graph"])) {
          const recipe = jsonData["@graph"].find(
            (item: Record<string, unknown>) => item["@type"] === "Recipe"
          );
          if (recipe) {
            return recipe as RecipeSchema;
          }
        }

        // Check if it's wrapped in another type but has Recipe info
        if (jsonData["@type"] === "WebPage" && jsonData.mainEntity?.["@type"] === "Recipe") {
          return jsonData.mainEntity as RecipeSchema;
        }
      } catch {
        // Continue searching if JSON parsing fails
        continue;
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Normalizes recipe schema ingredients to a consistent format
 */
export function normalizeIngredientsFromSchema(
  ingredients: string[] | undefined
): string[] {
  if (!ingredients) return [];
  return Array.isArray(ingredients) ? ingredients : [ingredients];
}

/**
 * Normalizes recipe schema instructions to a consistent format
 * Handles: string[], string, HowToStep[], HowToSection[]
 */
export function normalizeInstructionsFromSchema(
  instructions: RecipeSchema["recipeInstructions"]
): string[] {
  if (!instructions) return [];

  // Single string
  if (typeof instructions === "string") {
    return [instructions];
  }

  // Array of items
  if (Array.isArray(instructions)) {
    const result: string[] = [];

    for (const item of instructions) {
      if (typeof item === "string") {
        result.push(item);
      } else if (item && typeof item === "object") {
        // HowToSection with nested steps
        if (item["@type"] === "HowToSection" && item.itemListElement) {
          // Optionally prefix with section name
          if (item.name) {
            result.push(`**${item.name}**`);
          }
          // Recursively extract nested steps
          const nestedSteps = normalizeInstructionsFromSchema(item.itemListElement);
          result.push(...nestedSteps);
        } else {
          // HowToStep - prefer 'text' over 'name' (text is usually more detailed)
          const stepText = item.text || item.name;
          if (stepText) {
            result.push(stepText);
          }
        }
      }
    }

    return result.filter((inst) => inst.length > 0);
  }

  return [];
}

/**
 * Extracts timing information from ISO 8601 duration format
 * PT30M -> "30 minutes"
 * PT2H30M -> "2 hours 30 minutes"
 */
export function parseDuration(iso8601Duration: string): string {
  if (!iso8601Duration) return "";

  const regex = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
  const match = iso8601Duration.match(regex);

  if (!match) return iso8601Duration;

  const hours = match[1];
  const minutes = match[2];
  const seconds = match[3];

  const parts: string[] = [];

  if (hours) parts.push(`${hours} hour${hours !== "1" ? "s" : ""}`);
  if (minutes) parts.push(`${minutes} minute${minutes !== "1" ? "s" : ""}`);
  if (seconds) parts.push(`${seconds} second${seconds !== "1" ? "s" : ""}`);

  return parts.join(" ");
}

/**
 * Converts recipe yield/servings to a readable format
 */
export function normalizeServings(
  recipeYield: string | string[] | number | undefined
): string {
  if (!recipeYield) return "";

  if (typeof recipeYield === "number") {
    return `${recipeYield} servings`;
  }

  if (Array.isArray(recipeYield)) {
    return recipeYield[0] || "";
  }

  return recipeYield;
}

/**
 * Normalizes author field which can be string or object
 */
export function normalizeAuthor(
  author: RecipeSchema["author"]
): string | undefined {
  if (!author) return undefined;
  if (typeof author === "string") return author;
  return author.name;
}

/**
 * Normalizes category which can be string or array
 */
export function normalizeCategory(
  category: string | string[] | undefined
): string | undefined {
  if (!category) return undefined;
  return Array.isArray(category) ? category[0] : category;
}

/**
 * Normalizes cuisine which can be string or array
 */
export function normalizeCuisine(
  cuisine: string | string[] | undefined
): string | undefined {
  if (!cuisine) return undefined;
  return Array.isArray(cuisine) ? cuisine[0] : cuisine;
}

/**
 * Normalizes keywords from comma-separated string
 */
export function normalizeKeywords(keywords: string | undefined): string[] {
  if (!keywords) return [];
  return keywords
    .split(",")
    .map((k) => k.trim())
    .filter((k) => k.length > 0);
}

/**
 * Normalizes image to single URL string
 */
export function normalizeImage(
  image: RecipeSchema["image"]
): string | undefined {
  if (!image) return undefined;
  if (typeof image === "string") return image;
  if (Array.isArray(image)) {
    const first = image[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object" && first.url) return first.url;
  }
  return undefined;
}

/**
 * Parses nutrition string values to numbers
 * Handles formats like "350 calories", "25g", "100mg"
 */
function parseNutritionValue(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const match = value.match(/^([\d.]+)/);
  return match ? parseFloat(match[1]) : undefined;
}

/**
 * Normalizes schema.org NutritionInformation to our format
 */
export function normalizeNutrition(
  nutrition: SchemaNutrition | undefined
): {
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  fiber_g?: number;
  sugar_g?: number;
  sodium_mg?: number;
} | undefined {
  if (!nutrition) return undefined;

  const result = {
    calories: parseNutritionValue(nutrition.calories),
    protein_g: parseNutritionValue(nutrition.proteinContent),
    carbs_g: parseNutritionValue(nutrition.carbohydrateContent),
    fat_g: parseNutritionValue(nutrition.fatContent),
    fiber_g: parseNutritionValue(nutrition.fiberContent),
    sugar_g: parseNutritionValue(nutrition.sugarContent),
    sodium_mg: parseNutritionValue(nutrition.sodiumContent),
  };

  // Only return if at least one value exists
  const hasData = Object.values(result).some((v) => v !== undefined);
  return hasData ? result : undefined;
}

/**
 * Main function to convert JSON-LD recipe schema to our recipe format
 */
export function schemaToRecipeFormat(schema: RecipeSchema) {
  return {
    title: schema.name || "Untitled Recipe",
    description: schema.description,
    prepTime: schema.prepTime ? parseDuration(schema.prepTime) : undefined,
    cookTime: schema.cookTime ? parseDuration(schema.cookTime) : undefined,
    totalTime: schema.totalTime ? parseDuration(schema.totalTime) : undefined,
    servings: normalizeServings(schema.recipeYield),
    // CRITICAL FIX: Use recipeIngredient (correct JSON-LD field name)
    ingredients: normalizeIngredientsFromSchema(schema.recipeIngredient),
    instructions: normalizeInstructionsFromSchema(schema.recipeInstructions),
    author: normalizeAuthor(schema.author),
    // Additional fields
    category: normalizeCategory(schema.recipeCategory),
    cuisine: normalizeCuisine(schema.recipeCuisine),
    keywords: normalizeKeywords(schema.keywords),
    image: normalizeImage(schema.image),
    nutrition: normalizeNutrition(schema.nutrition),
    rating: schema.aggregateRating
      ? {
          value:
            parseFloat(String(schema.aggregateRating.ratingValue)) || undefined,
          count:
            parseInt(String(schema.aggregateRating.ratingCount)) || undefined,
        }
      : undefined,
  };
}

/**
 * Type for the normalized recipe format
 */
export type NormalizedRecipeSchema = ReturnType<typeof schemaToRecipeFormat>;
