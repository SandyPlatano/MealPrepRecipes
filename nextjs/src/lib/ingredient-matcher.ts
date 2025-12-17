/**
 * Ingredient Matcher Utility
 * Matches ingredients mentioned in recipe step text to highlight relevant ingredients
 */

/**
 * Common cooking verbs that often precede ingredients
 */
const COOKING_VERBS = [
  "add",
  "mix",
  "stir",
  "pour",
  "combine",
  "fold",
  "whisk",
  "blend",
  "toss",
  "sprinkle",
  "drizzle",
  "season",
  "coat",
  "dip",
  "marinate",
  "rub",
  "brush",
  "spread",
  "top",
  "garnish",
];

/**
 * Words to ignore when matching (common filler words)
 */
const IGNORE_WORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "in",
  "on",
  "to",
  "with",
  "for",
  "of",
  "some",
  "more",
  "remaining",
  "rest",
  "half",
  "other",
  "additional",
  "extra",
]);

/**
 * Parse an ingredient string to extract the main ingredient name
 * e.g., "2 cups all-purpose flour" → "flour"
 * e.g., "1 lb chicken breast, cubed" → "chicken breast"
 */
export function extractIngredientName(ingredientString: string): string {
  // Remove quantity (numbers, fractions, ranges)
  let cleaned = ingredientString
    .toLowerCase()
    // Remove fractions like "1/2", "3/4"
    .replace(/\d+\/\d+/g, "")
    // Remove numbers and decimals
    .replace(/\d+\.?\d*/g, "")
    // Remove common units
    .replace(
      /\b(cups?|tbsp|tsp|tablespoons?|teaspoons?|oz|ounces?|lbs?|pounds?|g|grams?|kg|kilograms?|ml|milliliters?|l|liters?|pinch|dash|bunch|cloves?|cans?|packages?|sticks?|slices?|pieces?)\b/gi,
      ""
    )
    // Remove preparation instructions in parentheses
    .replace(/\([^)]*\)/g, "")
    // Remove preparation instructions after comma
    .replace(/,.*$/, "")
    // Remove common descriptors
    .replace(
      /\b(fresh|dried|ground|minced|chopped|diced|sliced|crushed|whole|large|medium|small|thin|thick|boneless|skinless|raw|cooked|melted|softened|room temperature|cold|warm|hot|optional)\b/gi,
      ""
    )
    // Clean up whitespace
    .replace(/\s+/g, " ")
    .trim();

  return cleaned;
}

/**
 * Tokenize text into words for matching
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ") // Keep hyphens for compound words
    .split(/\s+/)
    .filter((word) => word.length > 1 && !IGNORE_WORDS.has(word));
}

/**
 * Calculate similarity between two strings using word overlap
 */
function calculateSimilarity(str1: string, str2: string): number {
  const tokens1 = new Set(tokenize(str1));
  const tokens2 = new Set(tokenize(str2));

  if (tokens1.size === 0 || tokens2.size === 0) return 0;

  let matches = 0;
  for (const token of tokens1) {
    if (tokens2.has(token)) {
      matches++;
    }
    // Also check for partial matches (e.g., "garlic" matches "garlicky")
    for (const token2 of tokens2) {
      if (token !== token2 && (token.includes(token2) || token2.includes(token))) {
        matches += 0.5;
      }
    }
  }

  return matches / Math.max(tokens1.size, tokens2.size);
}

/**
 * Check if a step mentions an ingredient
 */
function stepMentionsIngredient(stepText: string, ingredientName: string): boolean {
  const stepLower = stepText.toLowerCase();
  const ingredientLower = ingredientName.toLowerCase();

  // Direct substring match
  if (stepLower.includes(ingredientLower)) {
    return true;
  }

  // Check individual words from ingredient name
  const ingredientWords = tokenize(ingredientName);
  const stepWords = tokenize(stepText);

  // If any significant ingredient word appears in the step
  for (const word of ingredientWords) {
    if (word.length > 3 && stepWords.includes(word)) {
      return true;
    }
  }

  // Check similarity score
  const similarity = calculateSimilarity(stepText, ingredientName);
  return similarity > 0.3;
}

export interface IngredientMatch {
  index: number;
  ingredient: string;
  relevance: "high" | "medium" | "low";
}

/**
 * Find ingredients that are relevant to a specific recipe step
 *
 * @param stepText - The text of the current recipe step
 * @param ingredients - Array of ingredient strings
 * @returns Array of ingredient indices and their relevance level
 */
export function matchIngredientsToStep(
  stepText: string,
  ingredients: string[]
): IngredientMatch[] {
  const matches: IngredientMatch[] = [];
  const stepLower = stepText.toLowerCase();

  ingredients.forEach((ingredient, index) => {
    const ingredientName = extractIngredientName(ingredient);

    if (!ingredientName) return;

    // Check for direct mention (high relevance)
    if (stepLower.includes(ingredientName)) {
      matches.push({ index, ingredient, relevance: "high" });
      return;
    }

    // Check if step mentions the ingredient using broader matching
    if (stepMentionsIngredient(stepText, ingredientName)) {
      matches.push({ index, ingredient, relevance: "medium" });
      return;
    }

    // Check for partial word matches (e.g., "onion" in "onions")
    const ingredientWords = tokenize(ingredientName);
    for (const word of ingredientWords) {
      if (word.length > 3 && stepLower.includes(word)) {
        matches.push({ index, ingredient, relevance: "low" });
        return;
      }
    }
  });

  // Sort by relevance (high first)
  const relevanceOrder = { high: 0, medium: 1, low: 2 };
  matches.sort((a, b) => relevanceOrder[a.relevance] - relevanceOrder[b.relevance]);

  return matches;
}

/**
 * Get ingredient indices that should be highlighted for a step
 *
 * @param stepText - The text of the current recipe step
 * @param ingredients - Array of ingredient strings
 * @returns Set of ingredient indices to highlight
 */
export function getHighlightedIngredientIndices(
  stepText: string,
  ingredients: string[]
): Set<number> {
  const matches = matchIngredientsToStep(stepText, ingredients);
  return new Set(matches.map((m) => m.index));
}

/**
 * Check if an ingredient is needed for the current step
 */
export function isIngredientNeededForStep(
  stepText: string,
  ingredient: string
): boolean {
  const ingredientName = extractIngredientName(ingredient);
  return stepMentionsIngredient(stepText, ingredientName);
}
