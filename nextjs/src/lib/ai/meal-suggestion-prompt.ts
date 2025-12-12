import type { AISuggestionContext, AISuggestionRecipe } from '@/types/ai-suggestion';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/**
 * Build the system prompt for Claude to generate meal suggestions
 */
export function buildMealSuggestionPrompt(
  context: AISuggestionContext,
  mode: 'library_only' | 'mixed' = 'mixed'
): string {
  const {
    user_recipes,
    recent_history,
    favorites,
    allergen_alerts,
    dietary_restrictions,
    household_size,
    locked_days,
  } = context;

  // Calculate days that need suggestions
  const daysNeedingSuggestions = DAYS_OF_WEEK.filter(day => !locked_days.includes(day));

  const systemPrompt = `You are an expert meal planning assistant helping a household plan their weekly dinners.

## CONTEXT

**Household Size:** ${household_size} ${household_size === 1 ? 'person' : 'people'}

**Dietary Restrictions:**
${allergen_alerts.length > 0 ? `- Allergens to AVOID: ${allergen_alerts.join(', ')}` : '- No allergens'}
${dietary_restrictions.length > 0 ? `- Custom restrictions: ${dietary_restrictions.join(', ')}` : ''}

**User's Recipe Library:** ${user_recipes.length} recipes
${user_recipes.length > 0 ? formatRecipeLibrary(user_recipes) : 'User has no saved recipes yet.'}

**Recently Cooked (Last 14 Days):**
${recent_history.length > 0 ? formatRecentHistory(recent_history) : 'No recent cooking history.'}

**Favorite Recipes:** ${favorites.length > 0 ? favorites.join(', ') : 'No favorites yet'}

**Days to Plan:** ${daysNeedingSuggestions.join(', ')}
${locked_days.length > 0 ? `**Already Planned:** ${locked_days.join(', ')}` : ''}

## YOUR TASK

Suggest ${daysNeedingSuggestions.length} delicious, balanced dinner recipes for: ${daysNeedingSuggestions.join(', ')}.

## RULES

1. **CRITICAL: ALLERGEN SAFETY**
   ${allergen_alerts.length > 0 ? `NEVER suggest recipes containing: ${allergen_alerts.join(', ')}. This is a HARD CONSTRAINT.` : ''}

2. **Recipe Source Strategy (${mode === 'library_only' ? 'LIBRARY ONLY MODE' : 'MIXED MODE'}):**
   ${mode === 'library_only'
     ? '- ONLY use recipes from the user\'s library (set recipe_id field)'
     : `- Prefer recipes from user's library when appropriate
   - Generate NEW recipes when:
     * User's library is too small (< 10 recipes)
     * Need variety/diversity
     * Want to introduce new cuisines or flavors
   - For existing recipes: Set recipe_id field
   - For new recipes: Set recipe_id to null and provide COMPLETE recipe details`}

3. **Protein Variety:**
   - Maximum 2 meals with the same protein type per week
   - Distribute proteins: chicken, beef, pork, seafood, vegetarian

4. **Complexity Balance:**
   - Maximum 2 "complex" recipes (prep_time > 45 min) per week
   - Include mostly quick/medium recipes (prep_time 20-45 min)
   - At least 2 quick recipes (< 30 min) for busy weeknights

5. **Avoid Repetition:**
   - DO NOT suggest recipes cooked in the last 14 days
   - Ensure cuisine variety (Italian, Mexican, Asian, American, etc.)

6. **Reasoning:**
   - Explain WHY each recipe was chosen
   - Examples: "Your 5-star favorite", "Quick weeknight meal", "New Italian for variety", "Based on your love of Thai food"

${mode === 'mixed' ? `
7. **New Recipe Requirements (when recipe_id is null):**
   - Provide COMPLETE recipe with:
     * Full ingredient list with quantities
     * Step-by-step instructions
     * Realistic prep and cook times
     * Appropriate servings for household size (${household_size})
   - Match user's cuisine preferences based on favorites
   - Keep instructions clear and concise
   - Include common pantry staples (oil, salt, pepper) in ingredients` : ''}

## OUTPUT FORMAT

Return a JSON array of exactly ${daysNeedingSuggestions.length} suggestions, one for each day.

\`\`\`json
[
  {
    "day": "Monday",
    "recipe_id": "uuid-or-null",
    "title": "Recipe Name",
    "cuisine": "Italian",
    "protein_type": "Chicken",
    "prep_time": 25,
    "cook_time": 30,
    "servings": ${household_size},
    "ingredients": [
      { "item": "chicken breast", "quantity": "1 lb", "notes": "boneless, skinless" },
      { "item": "olive oil", "quantity": "2 tbsp" }
    ],
    "instructions": [
      "Step 1",
      "Step 2"
    ],
    "reason": "Your 5-star favorite - always a hit!",
    "tags": ["quick", "healthy"],
    "allergen_tags": []
  }
]
\`\`\`

**IMPORTANT:**
- For recipes from user's library: Set recipe_id (from context) and you can omit ingredients/instructions
- For NEW recipes: Set recipe_id to null and MUST provide complete ingredients and instructions
- Ensure all allergens are avoided
- Balance protein types and complexity
- Make reasoning personal and specific

Now suggest ${daysNeedingSuggestions.length} meals!`;

  return systemPrompt;
}

/**
 * Format recipe library for prompt
 */
function formatRecipeLibrary(recipes: AISuggestionContext['user_recipes']): string {
  return recipes
    .slice(0, 50) // Limit to 50 recipes to avoid token bloat
    .map((recipe) => {
      return `- "${recipe.title}" (ID: ${recipe.id}, ${recipe.cuisine}, ${recipe.protein_type}, ${recipe.prep_time}min${
        recipe.rating ? `, ⭐${recipe.rating}/5` : ''
      })`;
    })
    .join('\n');
}

/**
 * Format recent cooking history for prompt
 */
function formatRecentHistory(history: AISuggestionContext['recent_history']): string {
  return history
    .map((entry) => {
      const daysAgo = Math.floor(
        (Date.now() - new Date(entry.cooked_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      return `- "${entry.recipe_title}" (${daysAgo} days ago${entry.rating ? `, rated ${entry.rating}/5` : ''})`;
    })
    .join('\n');
}

/**
 * Parse Claude's response into structured suggestions
 */
export function parseAISuggestionResponse(response: string): AISuggestionRecipe[] {
  try {
    // Extract JSON from markdown code block if present
    const jsonMatch = response.match(/```json\n?([\s\S]*?)\n?```/);
    const jsonString = jsonMatch ? jsonMatch[1] : response;

    const suggestions: AISuggestionRecipe[] = JSON.parse(jsonString.trim());

    // Validate suggestions
    if (!Array.isArray(suggestions)) {
      throw new Error('Response is not an array');
    }

    if (suggestions.length === 0 || suggestions.length > 7) {
      throw new Error(`Invalid number of suggestions: ${suggestions.length}`);
    }

    // Validate each suggestion
    for (const suggestion of suggestions) {
      if (!suggestion.day || !DAYS_OF_WEEK.includes(suggestion.day)) {
        throw new Error(`Invalid day: ${suggestion.day}`);
      }

      if (!suggestion.title || !suggestion.reason) {
        throw new Error('Missing required fields: title or reason');
      }

      // New recipes must have ingredients and instructions
      if (suggestion.recipe_id === null) {
        if (!suggestion.ingredients || suggestion.ingredients.length === 0) {
          throw new Error(`New recipe "${suggestion.title}" missing ingredients`);
        }
        if (!suggestion.instructions || suggestion.instructions.length === 0) {
          throw new Error(`New recipe "${suggestion.title}" missing instructions`);
        }
      }
    }

    return suggestions;
  } catch (error) {
    console.error('Failed to parse AI suggestion response:', error);
    console.error('Response:', response);
    throw new Error(`Invalid AI response format: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get the Monday of the current or next week
 */
export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split('T')[0];
}
