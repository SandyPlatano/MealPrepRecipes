/**
 * AI Nutrition Extraction Prompt Builder
 * Generates prompts for Claude API to extract nutritional information from recipes
 */

import type { NutritionData } from "@/types/nutrition";

/**
 * System prompt for nutrition extraction
 * Sets the context and expertise level for Claude
 */
const NUTRITION_EXTRACTION_SYSTEM_PROMPT = `You are a nutrition analysis expert specializing in recipe nutritional data extraction.

Your expertise includes:
- USDA FoodData Central nutritional database
- Standard serving sizes and portion measurements
- Cooking methods and their impact on nutritional content
- Common ingredient substitutions
- Dietary guidelines and macronutrient calculations

Your role is to analyze recipe ingredients and provide accurate per-serving nutritional estimates.`;

/**
 * Builds a nutrition extraction prompt for Claude API
 *
 * @param ingredients - Array of ingredient strings with quantities
 * @param servings - Number of servings the recipe makes
 * @param title - Recipe title (optional, provides context)
 * @param instructions - Cooking instructions (optional, affects nutrition)
 * @returns Formatted prompt for Claude API
 */
export function buildNutritionExtractionPrompt(
  ingredients: string[],
  servings: number,
  title?: string,
  instructions?: string[]
): string {
  const recipeContext = title ? `\n\nRecipe: "${title}"` : '';

  const cookingContext = instructions && instructions.length > 0
    ? `\n\nCooking Method Summary:\n${instructions.slice(0, 3).join('\n')}`
    : '';

  return `${NUTRITION_EXTRACTION_SYSTEM_PROMPT}

TASK: Extract nutritional information for the following recipe.
${recipeContext}

Servings: ${servings}

Ingredients:
${ingredients.map((ing, idx) => `${idx + 1}. ${ing}`).join('\n')}
${cookingContext}

INSTRUCTIONS:
1. Analyze each ingredient and estimate its nutritional content
2. Consider the cooking method (if provided) as it affects final nutrition:
   - Frying adds fat calories
   - Baking/grilling may reduce fat
   - Boiling may reduce water-soluble vitamins
3. Calculate TOTAL nutrition for the entire recipe
4. Divide by ${servings} to get PER SERVING values
5. If an ingredient quantity is unclear, use standard portions
6. Round values to 1 decimal place (except calories - whole numbers only)

CONFIDENCE SCORING:
- 0.80-1.00: All ingredients clear, standard recipe
- 0.60-0.79: Most ingredients clear, some estimation needed
- 0.40-0.59: Several ingredients unclear or non-standard
- 0.20-0.39: Many estimates required, unusual ingredients
- 0.00-0.19: Very uncertain, insufficient data

OUTPUT FORMAT (JSON only, no explanatory text):
{
  "calories": <integer>,
  "protein_g": <number with 1 decimal>,
  "carbs_g": <number with 1 decimal>,
  "fat_g": <number with 1 decimal>,
  "fiber_g": <number with 1 decimal>,
  "sugar_g": <number with 1 decimal>,
  "sodium_mg": <integer>,
  "confidence_score": <number 0.00-1.00>
}

IMPORTANT NOTES:
- All values are per serving (recipe total divided by ${servings})
- Use USDA FoodData Central as reference when possible
- If a value cannot be estimated, use null
- Confidence score should reflect overall data quality
- Consider that users track these values for health goals - accuracy matters

Analyze the recipe now and return ONLY the JSON object.`;
}

/**
 * Builds a simplified prompt for quick nutrition estimation
 * Uses a faster, less detailed approach for bulk processing
 *
 * @param ingredients - Ingredient list
 * @param servings - Number of servings
 * @returns Simplified prompt
 */
export function buildQuickNutritionPrompt(
  ingredients: string[],
  servings: number
): string {
  return `Extract nutritional data per serving for a recipe.

Servings: ${servings}
Ingredients: ${ingredients.join('; ')}

Return JSON with per-serving nutrition:
{
  "calories": <int>,
  "protein_g": <decimal>,
  "carbs_g": <decimal>,
  "fat_g": <decimal>,
  "fiber_g": <decimal>,
  "sugar_g": <decimal>,
  "sodium_mg": <int>,
  "confidence_score": <0-1>
}

Use USDA estimates. Return only JSON.`;
}

/**
 * Builds a prompt for validating/correcting existing nutrition data
 * Used when user provides manual nutrition or AI needs to verify its own output
 *
 * @param ingredients - Recipe ingredients
 * @param servings - Number of servings
 * @param currentNutrition - Current nutrition data to validate
 * @returns Validation prompt
 */
export function buildNutritionValidationPrompt(
  ingredients: string[],
  servings: number,
  currentNutrition: Partial<NutritionData>
): string {
  return `Validate and correct the following nutritional data for this recipe.

Servings: ${servings}
Ingredients:
${ingredients.join('\n')}

Current Nutrition (per serving):
${JSON.stringify(currentNutrition, null, 2)}

TASK:
1. Check if the current values are reasonable for these ingredients
2. Identify any values that seem incorrect (too high, too low, or missing)
3. Provide corrected values if needed
4. Give a confidence score for the corrected data

Return JSON:
{
  "is_valid": <boolean>,
  "issues": [<array of issues found>],
  "corrected_nutrition": {
    "calories": <int>,
    "protein_g": <decimal>,
    "carbs_g": <decimal>,
    "fat_g": <decimal>,
    "fiber_g": <decimal>,
    "sugar_g": <decimal>,
    "sodium_mg": <int>
  },
  "confidence_score": <0-1>
}`;
}

/**
 * Parse Claude's JSON response for nutrition data
 * Handles common formatting issues and validates the response
 *
 * @param responseText - Raw text response from Claude
 * @returns Parsed nutrition data or null if invalid
 */
export function parseNutritionResponse(
  responseText: string
): (NutritionData & { confidence_score: number }) | null {
  try {
    // Remove markdown code blocks if present
    let jsonText = responseText.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```\n?/g, '');
    }

    const parsed = JSON.parse(jsonText);

    // Validate required fields
    if (typeof parsed.calories !== 'number' && parsed.calories !== null) {
      console.error('Invalid calories value:', parsed.calories);
      return null;
    }

    if (typeof parsed.confidence_score !== 'number') {
      console.error('Missing or invalid confidence_score');
      return null;
    }

    // Ensure confidence is between 0 and 1
    const confidence_score = Math.max(0, Math.min(1, parsed.confidence_score));

    return {
      calories: parsed.calories ? Math.round(parsed.calories) : null,
      protein_g: parsed.protein_g ? Math.round(parsed.protein_g * 10) / 10 : null,
      carbs_g: parsed.carbs_g ? Math.round(parsed.carbs_g * 10) / 10 : null,
      fat_g: parsed.fat_g ? Math.round(parsed.fat_g * 10) / 10 : null,
      fiber_g: parsed.fiber_g ? Math.round(parsed.fiber_g * 10) / 10 : null,
      sugar_g: parsed.sugar_g ? Math.round(parsed.sugar_g * 10) / 10 : null,
      sodium_mg: parsed.sodium_mg ? Math.round(parsed.sodium_mg) : null,
      confidence_score,
    };
  } catch (error) {
    console.error('Failed to parse nutrition response:', error);
    console.error('Response text:', responseText);
    return null;
  }
}

/**
 * Estimates serving size category based on calories
 * Useful for quick validation checks
 */
export function estimateServingSizeCategory(calories: number): string {
  if (calories < 150) return 'Snack/Side';
  if (calories < 300) return 'Light Meal';
  if (calories < 500) return 'Regular Meal';
  if (calories < 700) return 'Large Meal';
  return 'Very Large Meal';
}

/**
 * Checks if nutrition values are within reasonable ranges
 * Returns array of warnings if values seem incorrect
 */
export function validateNutritionRanges(
  nutrition: Partial<NutritionData>
): string[] {
  const warnings: string[] = [];

  // Calorie range validation (per serving)
  if (nutrition.calories) {
    if (nutrition.calories < 10) {
      warnings.push('Calories seem unrealistically low (<10)');
    }
    if (nutrition.calories > 2000) {
      warnings.push('Calories seem very high (>2000 per serving)');
    }
  }

  // Macronutrient validation
  if (nutrition.protein_g && nutrition.protein_g < 0) {
    warnings.push('Protein cannot be negative');
  }
  if (nutrition.protein_g && nutrition.protein_g > 200) {
    warnings.push('Protein seems unusually high (>200g per serving)');
  }

  if (nutrition.carbs_g && nutrition.carbs_g < 0) {
    warnings.push('Carbs cannot be negative');
  }
  if (nutrition.carbs_g && nutrition.carbs_g > 300) {
    warnings.push('Carbs seem unusually high (>300g per serving)');
  }

  if (nutrition.fat_g && nutrition.fat_g < 0) {
    warnings.push('Fat cannot be negative');
  }
  if (nutrition.fat_g && nutrition.fat_g > 150) {
    warnings.push('Fat seems unusually high (>150g per serving)');
  }

  // Calorie calculation check (approximate)
  if (nutrition.calories && nutrition.calories > 0 && nutrition.protein_g !== null && nutrition.protein_g !== undefined && nutrition.carbs_g !== null && nutrition.carbs_g !== undefined && nutrition.fat_g !== null && nutrition.fat_g !== undefined) {
    const estimatedCalories =
      nutrition.protein_g * 4 +
      nutrition.carbs_g * 4 +
      nutrition.fat_g * 9;

    const diff = Math.abs(estimatedCalories - nutrition.calories);
    const diffPercent = (diff / nutrition.calories) * 100;

    if (diffPercent > 20) {
      warnings.push(
        `Calorie calculation mismatch: ${Math.round(diffPercent)}% difference from macros`
      );
    }
  }

  // Fiber validation (explicit null checks to handle 0 values correctly)
  if (nutrition.fiber_g !== null && nutrition.fiber_g !== undefined && nutrition.carbs_g !== null && nutrition.carbs_g !== undefined && nutrition.fiber_g > nutrition.carbs_g) {
    warnings.push('Fiber cannot exceed total carbs');
  }

  // Sugar validation (explicit null checks to handle 0 values correctly)
  if (nutrition.sugar_g !== null && nutrition.sugar_g !== undefined && nutrition.carbs_g !== null && nutrition.carbs_g !== undefined && nutrition.sugar_g > nutrition.carbs_g) {
    warnings.push('Sugar cannot exceed total carbs');
  }

  // Composite carb validation (sugar + fiber cannot exceed total carbs)
  if (nutrition.sugar_g !== null && nutrition.sugar_g !== undefined && nutrition.fiber_g !== null && nutrition.fiber_g !== undefined && nutrition.carbs_g !== null && nutrition.carbs_g !== undefined && (nutrition.sugar_g + nutrition.fiber_g > nutrition.carbs_g)) {
    warnings.push('Sugar and fiber combined cannot exceed total carbs');
  }

  // Sodium validation
  if (nutrition.sodium_mg && nutrition.sodium_mg < 0) {
    warnings.push('Sodium cannot be negative');
  }
  if (nutrition.sodium_mg && nutrition.sodium_mg > 5000) {
    warnings.push('Sodium seems very high (>5000mg per serving)');
  }

  return warnings;
}
