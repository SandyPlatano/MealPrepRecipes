/**
 * AI Nutrition Extraction Prompt Builder
 * Generates prompts for Claude API to extract nutritional information from recipes
 */

import type { NutritionData } from "@/types/nutrition";

/**
 * Common ingredient nutrition reference (per standard unit)
 * Based on USDA FoodData Central values
 */
const INGREDIENT_REFERENCE = `
COMMON INGREDIENT NUTRITION REFERENCE (use these values):

PROTEINS:
- Extra-firm tofu: 70 cal, 8g protein, 2g carbs, 4g fat per 3oz (85g)
- Firm tofu: 60 cal, 7g protein, 2g carbs, 3.5g fat per 3oz (85g)
- Chicken breast (raw): 165 cal, 31g protein, 0g carbs, 3.6g fat per 3oz
- Ground beef (80/20 raw): 210 cal, 17g protein, 0g carbs, 15g fat per 3oz
- Salmon (raw): 175 cal, 19g protein, 0g carbs, 10g fat per 3oz
- Eggs: 72 cal, 6g protein, 0.4g carbs, 5g fat per large egg
- Black beans (cooked): 114 cal, 8g protein, 20g carbs, 0.5g fat per 1/2 cup

OILS & FATS:
- Olive oil: 119 cal, 0g protein, 0g carbs, 13.5g fat per 1 tbsp (14g)
- Vegetable oil: 120 cal, 0g protein, 0g carbs, 14g fat per 1 tbsp
- Butter: 102 cal, 0g protein, 0g carbs, 11.5g fat per 1 tbsp
- Coconut oil: 121 cal, 0g protein, 0g carbs, 13.5g fat per 1 tbsp

GRAINS & STARCHES:
- White rice (cooked): 205 cal, 4g protein, 45g carbs, 0.4g fat per 1 cup
- Brown rice (cooked): 215 cal, 5g protein, 45g carbs, 1.8g fat per 1 cup
- Pasta (cooked): 200 cal, 7g protein, 40g carbs, 1g fat per 1 cup
- Bread: 80 cal, 3g protein, 15g carbs, 1g fat per slice

SAUCES & CONDIMENTS:
- Soy sauce/tamari: 10 cal, 1g protein, 1g carbs, 0g fat, 920mg sodium per 1 tbsp
- Sriracha: 5 cal, 0g protein, 1g carbs, 0g fat, 100mg sodium per 1 tsp
- Rice vinegar: 0 cal per 1 tsp
- Maple syrup: 52 cal, 0g protein, 13g carbs, 0g fat per 1 tbsp (17 cal per 1 tsp)
- Honey: 64 cal, 0g protein, 17g carbs, 0g fat per 1 tbsp

VEGETABLES (raw):
- Broccoli: 31 cal, 2.5g protein, 6g carbs, 0.3g fat per 1 cup
- Spinach: 7 cal, 1g protein, 1g carbs, 0.1g fat per 1 cup
- Bell pepper: 30 cal, 1g protein, 6g carbs, 0.3g fat per 1 cup
- Onion: 46 cal, 1g protein, 11g carbs, 0.1g fat per 1 cup
- Garlic: 4 cal per clove
`;

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

Your role is to analyze recipe ingredients and provide accurate per-serving nutritional estimates.

CRITICAL ACCURACY RULES:
1. ALWAYS calculate each ingredient's contribution individually
2. VERIFY your math: calories ≈ (protein_g × 4) + (carbs_g × 4) + (fat_g × 9)
3. Use the reference values below for common ingredients
4. When in doubt, round UP slightly for calorie estimates (better to overestimate)
${INGREDIENT_REFERENCE}`;

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
1. For EACH ingredient, calculate its individual nutritional contribution:
   - Parse the quantity and unit (e.g., "14 ounces" = 14 oz = ~396g)
   - Look up or estimate the nutrition per unit
   - Multiply by the quantity

2. Example calculation for "14 ounces extra-firm tofu":
   - 14 oz = 396g
   - Per 3oz (85g): 70 cal, 8g protein, 2g carbs, 4g fat
   - 14 oz = 4.67 × 3oz portions
   - Total: 327 cal, 37g protein, 9g carbs, 19g fat

3. SUM all ingredients to get TOTAL recipe nutrition

4. DIVIDE total by ${servings} servings to get PER SERVING values

5. VERIFY: calories should approximately equal (protein×4 + carbs×4 + fat×9)

6. Consider cooking method impact:
   - Frying adds fat calories from oil absorption
   - Baking/grilling may reduce fat slightly
   - Boiling may reduce water-soluble vitamins

7. Round: calories to whole numbers, other values to 1 decimal

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
 * Auto-corrects calories if they don't match macro calculation
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

    // Round values
    const protein_g = parsed.protein_g ? Math.round(parsed.protein_g * 10) / 10 : null;
    const carbs_g = parsed.carbs_g ? Math.round(parsed.carbs_g * 10) / 10 : null;
    const fat_g = parsed.fat_g ? Math.round(parsed.fat_g * 10) / 10 : null;
    const fiber_g = parsed.fiber_g ? Math.round(parsed.fiber_g * 10) / 10 : null;
    const sugar_g = parsed.sugar_g ? Math.round(parsed.sugar_g * 10) / 10 : null;
    const sodium_mg = parsed.sodium_mg ? Math.round(parsed.sodium_mg) : null;

    // Calculate expected calories from macros
    let calories = parsed.calories ? Math.round(parsed.calories) : null;

    if (protein_g !== null && carbs_g !== null && fat_g !== null) {
      const calculatedCalories = Math.round(
        (protein_g * 4) + (carbs_g * 4) + (fat_g * 9)
      );

      // If reported calories differ significantly from calculated, use calculated
      if (calories !== null) {
        const diff = Math.abs(calculatedCalories - calories);
        const diffPercent = (diff / calories) * 100;

        if (diffPercent > 15) {
          console.log(`[Nutrition] Correcting calories: AI said ${calories}, macros calculate to ${calculatedCalories}`);
          calories = calculatedCalories;
        }
      } else {
        // If no calories provided, calculate from macros
        calories = calculatedCalories;
      }
    }

    // Ensure confidence is between 0 and 1
    const confidence_score = Math.max(0, Math.min(1, parsed.confidence_score));

    return {
      calories,
      protein_g,
      carbs_g,
      fat_g,
      fiber_g,
      sugar_g,
      sodium_mg,
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
