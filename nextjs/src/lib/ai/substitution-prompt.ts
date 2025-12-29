/**
 * AI-Powered Ingredient Substitution Prompt Builder
 *
 * Generates contextual ingredient substitutions based on:
 * - User's dietary restrictions and allergens
 * - Pantry inventory (prefer items user already has)
 * - Recipe context (what role the ingredient plays)
 * - Budget preferences
 *
 * @security All user inputs are sanitized before prompt inclusion
 * to prevent prompt injection attacks.
 */

import type {
  SubstitutionContext,
  SubstitutionSuggestion,
  SubstitutionReason,
} from '@/types/substitution';
import {
  sanitizePromptInput,
  sanitizeArrayInput,
  escapeForPrompt,
  SANITIZE_LIMITS,
} from './sanitize';

/**
 * Reason descriptions for Claude to understand intent
 */
const REASON_CONTEXT: Record<SubstitutionReason, string> = {
  unavailable: 'The ingredient is not available at the store. Suggest alternatives that would be commonly found.',
  dietary: 'The ingredient conflicts with dietary restrictions. Suggest alternatives that meet all dietary requirements.',
  budget: 'The user is looking for a more affordable option. Prioritize cost-effective alternatives.',
  pantry_first: 'The user prefers using ingredients they already have. Strongly prioritize pantry items.',
  preference: 'The user simply wants to try something different. Suggest interesting alternatives.',
};

/**
 * Build the system prompt for Claude to generate substitution suggestions
 */
export function buildSubstitutionPrompt(context: SubstitutionContext): string {
  // SECURITY: Sanitize all user inputs before prompt inclusion
  const safeIngredient = escapeForPrompt(context.original_ingredient);
  const safeQuantity = sanitizePromptInput(context.quantity, SANITIZE_LIMITS.short);
  const safeUnit = sanitizePromptInput(context.unit, SANITIZE_LIMITS.short);
  const safeRecipeTitle = sanitizePromptInput(context.recipe_title, SANITIZE_LIMITS.medium);
  const safeRecipeRole = sanitizePromptInput(context.recipe_role, SANITIZE_LIMITS.medium);
  const safeDietaryRestrictions = sanitizeArrayInput(context.dietary_restrictions, SANITIZE_LIMITS.list_item);
  const safeAllergens = sanitizeArrayInput(context.allergens, SANITIZE_LIMITS.list_item);
  const safeDislikes = sanitizeArrayInput(context.dislikes, SANITIZE_LIMITS.list_item);
  const safePantryItems = sanitizeArrayInput(context.pantry_items, SANITIZE_LIMITS.list_item, 100);
  const reason = context.reason;

  const systemPrompt = `You are an expert culinary advisor helping a home cook find ingredient substitutions.

## CONTEXT

**Original Ingredient:** ${safeIngredient}${safeQuantity ? ` (${safeQuantity}${safeUnit ? ' ' + safeUnit : ''})` : ''}
${safeRecipeTitle ? `**Recipe:** ${safeRecipeTitle}` : ''}
${safeRecipeRole ? `**Role in Recipe:** ${safeRecipeRole}` : ''}

**Why Substituting:** ${REASON_CONTEXT[reason]}

## DIETARY CONSTRAINTS (CRITICAL - NEVER VIOLATE)

${safeAllergens.length > 0
  ? `**ALLERGENS TO AVOID (CRITICAL):**
${safeAllergens.map(a => `- ❌ ${a} - NEVER suggest anything containing this`).join('\n')}`
  : '**Allergens:** None specified'}

${safeDietaryRestrictions.length > 0
  ? `**Dietary Restrictions:**
${safeDietaryRestrictions.map(r => `- ${r}`).join('\n')}`
  : '**Dietary Restrictions:** None specified'}

${safeDislikes.length > 0
  ? `**User Dislikes (avoid if possible):**
${safeDislikes.map(d => `- ${d}`).join('\n')}`
  : ''}

## USER'S PANTRY (PREFER THESE)

${safePantryItems.length > 0
  ? `The user already has these items in their pantry:
${safePantryItems.map(p => `- ✓ ${p}`).join('\n')}

**PRIORITIZE suggestions from this list when possible!**`
  : 'Pantry inventory not available.'}

## YOUR TASK

Suggest 3-5 substitutes for "${safeIngredient}" ranked by how well they would work.

## SUBSTITUTION GUIDELINES

1. **Match the Function:**
   - If it's a binding agent → suggest other binders
   - If it's for flavor → suggest similar flavor profiles
   - If it's for texture → suggest similar textures
   - If it's for acidity → suggest other acids

2. **Quantity Conversions:**
   - Adjust quantities appropriately for each substitute
   - Example: 1 tbsp butter → 1 tbsp olive oil (for cooking)

3. **Preparation Notes:**
   - Include any special preparation needed
   - Example: "Soak for 10 minutes first"

4. **Budget Awareness:**
   ${reason === 'budget'
    ? '- STRONGLY prioritize cheaper alternatives\n   - Indicate budget tier (cheaper/same/pricier)'
    : '- Indicate if substitute is cheaper, same price, or pricier'}

5. **Pantry Priority:**
   ${reason === 'pantry_first' || safePantryItems.length > 0
    ? '- STRONGLY prefer items from user\'s pantry\n   - Set in_pantry: true for pantry items'
    : '- Note if substitute is commonly found in pantries'}

6. **Dietary Flags:**
   - Include relevant dietary info (vegan, dairy-free, gluten-free, etc.)
   - This helps users with restrictions quickly identify valid options

7. **Match Scoring:**
   - 90-100: Nearly identical result
   - 70-89: Very good substitute, minor differences
   - 50-69: Acceptable substitute, noticeable differences
   - Below 50: Emergency substitute only

## OUTPUT FORMAT

Return a JSON array of substitutions, ranked from best to worst.

\`\`\`json
[
  {
    "substitute": "ingredient name",
    "quantity": "adjusted amount",
    "unit": "unit or null",
    "match_score": 85,
    "reason": "Why this works well as a substitute",
    "preparation_note": "Any special prep needed or null",
    "dietary_flags": ["vegan", "gluten-free"],
    "in_pantry": false,
    "budget_tier": "same",
    "nutritional_note": "Brief nutrition comparison or null"
  }
]
\`\`\`

**Field Requirements:**
- substitute: Name of the substitute ingredient (required)
- quantity: Adjusted quantity for equivalence (required)
- unit: Unit of measurement or null if unitless
- match_score: 0-100, higher is better match (required)
- reason: One sentence explaining why this works (required)
- preparation_note: Special prep instructions or null
- dietary_flags: Array of dietary labels (empty array if none)
- in_pantry: true if this item is in user's pantry list
- budget_tier: "cheaper" | "same" | "pricier"
- nutritional_note: Brief comparison or null

**CRITICAL:**
- NEVER suggest anything containing allergens: ${safeAllergens.length > 0 ? safeAllergens.join(', ') : 'N/A'}
- Return 3-5 suggestions, no more, no less
- Highest match_score items first
- Be practical - suggest commonly available ingredients

Now suggest substitutes for "${safeIngredient}"!`;

  return systemPrompt;
}

/**
 * Build a minimal prompt for low-token situations
 */
export function buildMinimalSubstitutionPrompt(
  ingredient: string,
  allergens: string[],
  pantryItems: string[]
): string {
  // SECURITY: Sanitize inputs even in minimal prompt
  const safeIngredient = escapeForPrompt(ingredient);
  const safeAllergens = sanitizeArrayInput(allergens, SANITIZE_LIMITS.short, 10);
  const safePantryItems = sanitizeArrayInput(pantryItems, SANITIZE_LIMITS.short, 10);

  return `Suggest 3 substitutes for "${safeIngredient}".
${safeAllergens.length > 0 ? `AVOID allergens: ${safeAllergens.join(', ')}` : ''}
${safePantryItems.length > 0 ? `Prefer pantry items: ${safePantryItems.join(', ')}` : ''}
Return JSON: [{"substitute":"","quantity":"","match_score":0,"reason":"","in_pantry":false,"budget_tier":"same","dietary_flags":[]}]`;
}

/**
 * Parse Claude's response into structured suggestions
 */
export function parseSubstitutionResponse(response: string): SubstitutionSuggestion[] {
  try {
    // Extract JSON from markdown code block if present
    const jsonMatch = response.match(/```json\n?([\s\S]*?)\n?```/);
    const jsonString = jsonMatch ? jsonMatch[1] : response;

    const suggestions: SubstitutionSuggestion[] = JSON.parse(jsonString.trim());

    // Validate response is an array
    if (!Array.isArray(suggestions)) {
      throw new Error('Response is not an array');
    }

    // Validate count
    if (suggestions.length < 1 || suggestions.length > 10) {
      throw new Error(`Invalid number of suggestions: ${suggestions.length}`);
    }

    // Validate and sanitize each suggestion
    const validated: SubstitutionSuggestion[] = [];

    for (const suggestion of suggestions) {
      // Required fields
      if (!suggestion.substitute || typeof suggestion.substitute !== 'string') {
        throw new Error('Missing or invalid substitute field');
      }
      if (!suggestion.quantity || typeof suggestion.quantity !== 'string') {
        throw new Error('Missing or invalid quantity field');
      }
      if (typeof suggestion.match_score !== 'number' || suggestion.match_score < 0 || suggestion.match_score > 100) {
        throw new Error(`Invalid match_score: ${suggestion.match_score}`);
      }
      if (!suggestion.reason || typeof suggestion.reason !== 'string') {
        throw new Error('Missing or invalid reason field');
      }

      // Sanitize and default optional fields
      validated.push({
        substitute: suggestion.substitute.trim(),
        quantity: suggestion.quantity.trim(),
        unit: suggestion.unit?.trim() || undefined,
        match_score: Math.round(suggestion.match_score),
        reason: suggestion.reason.trim(),
        preparation_note: suggestion.preparation_note?.trim() || undefined,
        dietary_flags: Array.isArray(suggestion.dietary_flags)
          ? suggestion.dietary_flags.filter((f): f is string => typeof f === 'string')
          : [],
        in_pantry: Boolean(suggestion.in_pantry),
        budget_tier: ['cheaper', 'same', 'pricier'].includes(suggestion.budget_tier)
          ? suggestion.budget_tier
          : 'same',
        nutritional_note: suggestion.nutritional_note?.trim() || undefined,
      });
    }

    // Sort by match_score descending
    validated.sort((a, b) => b.match_score - a.match_score);

    return validated;
  } catch (error) {
    console.error('Failed to parse substitution response:', error);
    console.error('Response:', response);
    throw new Error(`Invalid AI response format: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate that no suggestions contain allergens
 * Call this as a safety check after parsing
 */
export function filterAllergenSuggestions(
  suggestions: SubstitutionSuggestion[],
  allergens: string[]
): SubstitutionSuggestion[] {
  if (allergens.length === 0) return suggestions;

  const lowerAllergens = allergens.map(a => a.toLowerCase());

  return suggestions.filter(suggestion => {
    const substituteLower = suggestion.substitute.toLowerCase();

    // Check if substitute name contains any allergen
    for (const allergen of lowerAllergens) {
      if (substituteLower.includes(allergen)) {
        console.warn(`Filtered out suggestion "${suggestion.substitute}" due to allergen: ${allergen}`);
        return false;
      }
    }

    return true;
  });
}

/**
 * Common ingredient role detection
 * Helps provide better substitution context
 */
export function detectIngredientRole(ingredient: string, recipeTitle?: string): string | undefined {
  const lowerIngredient = ingredient.toLowerCase();
  const lowerTitle = recipeTitle?.toLowerCase() || '';

  // Binding agents
  if (['egg', 'eggs', 'flax egg', 'chia egg', 'aquafaba'].some(b => lowerIngredient.includes(b))) {
    return 'binding agent / structure';
  }

  // Fats
  if (['butter', 'oil', 'lard', 'shortening', 'ghee'].some(f => lowerIngredient.includes(f))) {
    return 'fat / moisture / richness';
  }

  // Acids
  if (['lemon', 'lime', 'vinegar', 'wine'].some(a => lowerIngredient.includes(a))) {
    return 'acid / brightness';
  }

  // Sweeteners
  if (['sugar', 'honey', 'maple', 'agave', 'stevia'].some(s => lowerIngredient.includes(s))) {
    return 'sweetener';
  }

  // Dairy
  if (['milk', 'cream', 'yogurt', 'sour cream'].some(d => lowerIngredient.includes(d))) {
    return 'dairy / creaminess';
  }

  // Thickeners
  if (['flour', 'cornstarch', 'arrowroot', 'tapioca'].some(t => lowerIngredient.includes(t))) {
    if (lowerTitle.includes('cake') || lowerTitle.includes('bread') || lowerTitle.includes('cookie')) {
      return 'structure / base';
    }
    return 'thickener';
  }

  // Proteins
  if (['chicken', 'beef', 'pork', 'fish', 'tofu', 'tempeh', 'seitan'].some(p => lowerIngredient.includes(p))) {
    return 'primary protein';
  }

  return undefined;
}
