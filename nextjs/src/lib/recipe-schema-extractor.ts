/**
 * Extracts Recipe schema information from HTML using JSON-LD format
 * Many modern recipe websites embed structured data for better SEO
 */

export interface RecipeSchema {
  name?: string;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  recipeYield?: string | string[];
  ingredients?: string[];
  recipeInstructions?: string[] | Array<{ text?: string; name?: string }>;
  description?: string;
  author?: { name?: string };
}

/**
 * Extracts Recipe JSON-LD schema from HTML content
 * Returns the first Recipe schema found, or null if none exists
 */
export function extractRecipeSchema(html: string): RecipeSchema | null {
  try {
    // Find all JSON-LD script tags
    const jsonLdPattern = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
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
            (item: any) => item["@type"] === "Recipe"
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
 */
export function normalizeInstructionsFromSchema(
  instructions: string[] | Array<{ text?: string; name?: string }> | undefined
): string[] {
  if (!instructions) return [];

  if (Array.isArray(instructions)) {
    return instructions.map((instruction) => {
      if (typeof instruction === "string") {
        return instruction;
      }
      // Handle object format with text or name property
      return instruction.text || instruction.name || "";
    }).filter((inst) => inst.length > 0);
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
  recipeYield: string | string[] | undefined
): string {
  if (!recipeYield) return "";

  if (Array.isArray(recipeYield)) {
    return recipeYield[0] || "";
  }

  return recipeYield;
}

/**
 * Main function to convert JSON-LD recipe schema to our recipe format
 */
export function schemaToRecipeFormat(schema: RecipeSchema) {
  return {
    title: schema.name || "Untitled Recipe",
    prepTime: schema.prepTime ? parseDuration(schema.prepTime) : "Not specified",
    cookTime: schema.cookTime ? parseDuration(schema.cookTime) : "Not specified",
    servings: normalizeServings(schema.recipeYield),
    ingredients: normalizeIngredientsFromSchema(schema.ingredients),
    instructions: normalizeInstructionsFromSchema(schema.recipeInstructions),
    description: schema.description,
    author: schema.author?.name,
  };
}
