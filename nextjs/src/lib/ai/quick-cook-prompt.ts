import type {
  QuickCookRequest,
  QuickCookSuggestion,
  EnergyLevel,
  ENERGY_LEVEL_CONFIG,
} from '@/types/quick-cook';

interface QuickCookContext {
  request: QuickCookRequest;
  userRecipes: Array<{
    id: string;
    title: string;
    cuisine: string;
    protein_type: string;
    prep_time: number;
    cook_time: number;
    rating: number | null;
    tags: string[];
  }>;
  recentHistory: Array<{
    recipe_title: string;
    cooked_at: string;
  }>;
  favorites: string[];
  allergenAlerts: string[];
  dietaryRestrictions: string[];
  householdSize: number;
}

/**
 * Energy level constraints for the AI
 */
const ENERGY_CONSTRAINTS: Record<EnergyLevel, string> = {
  zombie: `## ZOMBIE MODE CONSTRAINTS (CRITICAL)
The user is barely functioning. This is NOT the time for ambitious cooking.

MANDATORY REQUIREMENTS:
- Maximum 5 ingredients (pantry staples like salt/pepper don't count)
- Maximum 10 minutes of ACTIVE cooking time (standing/stirring/chopping)
- Total passive time can be longer (oven/microwave doing the work)
- ONE-POT, ONE-PAN, or NO-COOK only
- NO complex knife work (pre-cut veggies, canned goods, frozen items preferred)
- NO multiple burners or simultaneous tasks
- NO precise timing required

PERFECT ZOMBIE MEALS:
- Sheet pan dinners (dump and bake)
- Quesadillas, grilled cheese, sandwiches
- Microwave meals (baked potato + toppings)
- Scrambled eggs + toast
- Pasta with jarred sauce
- Frozen pizza with added toppings
- Cereal (yes, this is valid)

TONE: Gentle, understanding. "I see you're running on empty. Here's something you can actually manage."`,

  meh: `## MEH MODE CONSTRAINTS
The user has some energy but doesn't want anything complicated.

REQUIREMENTS:
- Maximum 8 ingredients
- Maximum 20 minutes of active cooking time
- Some chopping is okay, but nothing tedious
- Can handle 2 components (main + simple side)
- Standard weeknight cooking difficulty

GOOD MEH MEALS:
- Stir-fries with pre-cut veggies
- Tacos with simple fillings
- Pasta with quick homemade sauce
- Rice bowls
- Simple soups
- Baked chicken with roasted veggies

TONE: Encouraging but realistic. "You've got this - nothing crazy, just good food."`,

  got_this: `## GOT THIS MODE
The user is feeling capable and wants a real recipe.

REQUIREMENTS:
- No strict ingredient limits
- Can handle complexity and multiple steps
- Precise timing is okay
- Can suggest impressive dishes

GOOD GOT THIS MEALS:
- Full recipes with multiple components
- Dishes that require technique
- Meals that might impress someone
- Cuisines that take more effort (Thai, Indian, etc.)

TONE: Confident and engaging. "Let's make something great."`,
};

/**
 * Build the prompt for quick cook suggestions
 */
export function buildQuickCookPrompt(context: QuickCookContext): string {
  const {
    request,
    userRecipes,
    recentHistory,
    favorites,
    allergenAlerts,
    dietaryRestrictions,
    householdSize,
  } = context;

  const servings = request.servings || householdSize || 2;
  const energyConfig = ENERGY_CONSTRAINTS[request.energyLevel];

  // Filter user recipes that match time/energy constraints
  const eligibleRecipes = userRecipes.filter((recipe) => {
    const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);
    return totalTime <= request.timeAvailable + 15; // Allow 15 min buffer
  });

  // Get recently cooked titles to avoid
  const recentTitles = recentHistory.slice(0, 7).map((h) => h.recipe_title);

  const prompt = `You are a helpful, empathetic meal suggestion assistant. The user needs help deciding what to cook RIGHT NOW.

## THE SITUATION
- **Time available:** ${request.timeAvailable} minutes total
- **Energy level:** ${request.energyLevel.toUpperCase()}
- **Servings needed:** ${servings}
${request.ingredientsOnHand?.length ? `- **Ingredients they have:** ${request.ingredientsOnHand.join(', ')}` : ''}

${energyConfig}

## USER CONTEXT

**Allergens/Restrictions (NEVER include these):**
${allergenAlerts.length > 0 ? allergenAlerts.map((a) => `- AVOID: ${a}`).join('\n') : '- No allergens specified'}
${dietaryRestrictions.length > 0 ? dietaryRestrictions.map((r) => `- ${r}`).join('\n') : ''}

**Recently Cooked (avoid repeating):**
${recentTitles.length > 0 ? recentTitles.map((t) => `- ${t}`).join('\n') : '- No recent history'}

**User's Favorite Recipes:**
${favorites.length > 0 ? favorites.slice(0, 5).join(', ') : 'No favorites yet'}

${eligibleRecipes.length > 0 ? `**Recipes from their library that might work:**
${eligibleRecipes
  .slice(0, 10)
  .map((r) => `- "${r.title}" (ID: ${r.id}, ${r.prep_time + r.cook_time}min, ${r.cuisine}${r.rating ? `, ${r.rating}★` : ''})`)
  .join('\n')}

If you use a recipe from their library, set recipe_id to the ID shown. Otherwise, set recipe_id to null and provide a complete recipe.` : '**No matching recipes in their library - generate a new recipe.**'}

## YOUR TASK

Suggest ONE perfect meal for this moment. Consider:
1. Their energy level (this is the MOST important factor)
2. Time constraints
3. Any ingredients they mentioned having
4. Variety from recent meals
5. Their favorites as inspiration (but don't repeat recent)

## RESPONSE FORMAT

Return ONLY valid JSON (no markdown code blocks, no explanation):

{
  "recipe_id": "uuid-from-library-or-null",
  "title": "Recipe Name",
  "cuisine": "Italian",
  "total_time": 25,
  "active_time": 15,
  "reason": "A warm, understanding explanation of why this recipe. Speak directly to their energy level. Be kind.",
  "ingredients": [
    { "item": "chicken breast", "quantity": "1 lb", "notes": "or use thighs", "affiliate_search_term": "boneless chicken breast" },
    { "item": "olive oil", "quantity": "2 tbsp", "affiliate_search_term": "olive oil cooking" }
  ],
  "instructions": [
    "Step 1 - keep instructions SHORT and clear",
    "Step 2 - no walls of text",
    "Step 3"
  ],
  "estimated_cost": "~$12 for ${servings} servings",
  "difficulty": "brain-dead-simple",
  "servings": ${servings},
  "protein_type": "Chicken",
  "tags": ["quick", "comfort-food"]
}

DIFFICULTY must be one of: "brain-dead-simple", "doable", "ambitious"
- zombie mode = ALWAYS "brain-dead-simple"
- meh mode = "brain-dead-simple" or "doable"
- got_this mode = any difficulty

REASON should:
- Acknowledge their energy level with empathy
- Explain why THIS recipe for THIS moment
- Be 1-2 sentences, warm and human
- Examples:
  - "You're running on fumes, and that's okay. This takes 5 minutes of actual effort, then the oven does the rest."
  - "A classic comfort meal that won't ask too much of you tonight."
  - "You've got the energy for something good - this Thai basil chicken is worth the 20 minutes."

Now suggest one meal:`;

  return prompt;
}

/**
 * Parse Claude's response into a structured suggestion
 */
export function parseQuickCookResponse(response: string): QuickCookSuggestion {
  try {
    // Try to extract JSON if wrapped in markdown code blocks
    let jsonString = response.trim();

    // Remove markdown code blocks if present
    const jsonMatch = response.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      jsonString = jsonMatch[1].trim();
    }

    const suggestion: QuickCookSuggestion = JSON.parse(jsonString);

    // Validate required fields
    if (!suggestion.title) {
      throw new Error('Missing required field: title');
    }
    if (!suggestion.reason) {
      throw new Error('Missing required field: reason');
    }
    if (!suggestion.ingredients || suggestion.ingredients.length === 0) {
      throw new Error('Missing required field: ingredients');
    }
    if (!suggestion.instructions || suggestion.instructions.length === 0) {
      throw new Error('Missing required field: instructions');
    }

    // Validate difficulty
    const validDifficulties = ['brain-dead-simple', 'doable', 'ambitious'];
    if (!validDifficulties.includes(suggestion.difficulty)) {
      suggestion.difficulty = 'doable'; // Default fallback
    }

    // Ensure numeric fields
    suggestion.total_time = Number(suggestion.total_time) || 30;
    suggestion.active_time = Number(suggestion.active_time) || 15;
    suggestion.servings = Number(suggestion.servings) || 2;

    return suggestion;
  } catch (error) {
    console.error('Failed to parse quick cook response:', error);
    console.error('Response:', response);
    throw new Error(
      `Invalid AI response format: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
