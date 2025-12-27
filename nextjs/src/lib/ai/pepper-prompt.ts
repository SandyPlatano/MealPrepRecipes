import type { PepperContext } from "@/types/pepper";

/**
 * Pepper's system prompt - defines personality and capabilities
 */
export const PEPPER_SYSTEM_PROMPT = `You are Pepper, a playful and friendly kitchen assistant for "Babe, What's for Dinner?"

## PERSONALITY

- Warm, encouraging, never judgmental
- Use food emojis liberally (but not excessively - 1-2 per message)
- Drop cooking puns when natural ("Lettuce help!", "You're on a roll!")
- Keep responses concise (2-4 sentences typical, unless explaining a recipe)
- Celebrate wins ("Nice pick!")
- Stay upbeat even when you can't help

## CAPABILITIES

1. **PANTRY-TO-PLATE**: Match user ingredients to their saved recipes
2. **MEAL PLANNING**: Suggest weekly plans based on preferences and history
3. **COOKING HELP**: Answer cooking questions, times, temperatures, substitutions
4. **RECIPE DISCOVERY**: Recommend recipes from their collection

## RESPONSE GUIDELINES

### When suggesting recipes:
- Mention 2-3 options maximum
- Include prep time and why it's a good match
- Format recipe names in bold: **Recipe Name**

### For cooking tips:
- Be specific with times and temperatures
- Include one helpful "pro tip" when relevant
- Keep explanations simple and actionable

### For meal planning:
- Ask clarifying questions first (busy nights, preferences)
- Consider variety (proteins, cuisines)
- Respect their cooking history (don't repeat recent meals)

### General rules:
- Never suggest recipes containing user's allergens
- Prefer recipes from their collection unless asked for new ideas
- If unsure, ask a clarifying question
- Always offer a natural follow-up or next step

## BOUNDARIES

- Only suggest recipes from their collection unless asked for new ideas
- Respect dietary restrictions absolutely (allergens are CRITICAL)
- If you don't know something, admit it cheerfully
- Don't make up recipe IDs - only reference recipes from the context provided`;

/**
 * Build the context message for Pepper
 */
export function buildPepperContextMessage(context: PepperContext): string {
  const sections: string[] = [];

  // Recipe collection summary
  if (context.recipes.length > 0) {
    const recipeList = context.recipes
      .slice(0, 30) // Limit to avoid token bloat
      .map((r) => {
        const totalTime = r.prep_time + r.cook_time;
        const ratingStr = r.rating ? ` (${r.rating}★)` : "";
        return `- "${r.title}" [ID:${r.id}] - ${totalTime}min${ratingStr}${r.times_cooked > 3 ? " (household favorite!)" : ""}`;
      })
      .join("\n");

    sections.push(`## User's Recipe Collection (${context.recipes.length} total)\n${recipeList}`);
  } else {
    sections.push("## User's Recipe Collection\nNo recipes saved yet.");
  }

  // Pantry items
  if (context.pantry.length > 0) {
    const pantryList = context.pantry
      .slice(0, 20)
      .map((p) => `- ${p.name}${p.quantity ? ` (${p.quantity} ${p.unit || ""})` : ""}`)
      .join("\n");

    sections.push(`## Current Pantry\n${pantryList}`);
  }

  // Preferences
  const prefParts: string[] = [];
  if (context.preferences.dietary_restrictions.length > 0) {
    prefParts.push(`Dietary: ${context.preferences.dietary_restrictions.join(", ")}`);
  }
  if (context.preferences.allergens.length > 0) {
    prefParts.push(`ALLERGENS (CRITICAL - NEVER SUGGEST): ${context.preferences.allergens.join(", ")}`);
  }
  if (context.preferences.favorite_cuisines.length > 0) {
    prefParts.push(`Favorite cuisines: ${context.preferences.favorite_cuisines.join(", ")}`);
  }
  if (context.preferences.disliked_ingredients.length > 0) {
    prefParts.push(`Dislikes: ${context.preferences.disliked_ingredients.join(", ")}`);
  }
  prefParts.push(`Household size: ${context.preferences.household_size}`);
  prefParts.push(`Cooking skill: ${context.preferences.cooking_skill_level}`);

  sections.push(`## Preferences\n${prefParts.join("\n")}`);

  // Recent meal history
  if (context.mealHistory.length > 0) {
    const historyList = context.mealHistory
      .slice(0, 10)
      .map((m) => {
        const daysAgo = Math.floor(
          (Date.now() - new Date(m.cooked_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        return `- "${m.recipe_title}" (${daysAgo} days ago)${m.rating ? ` - rated ${m.rating}★` : ""}`;
      })
      .join("\n");

    sections.push(`## Recently Cooked (avoid repeating)\n${historyList}`);
  }

  // Current meal plan
  if (context.currentMealPlan && context.currentMealPlan.assignments.length > 0) {
    const planList = context.currentMealPlan.assignments
      .map((a) => `- ${a.day} ${a.meal_type}: ${a.recipe_title}`)
      .join("\n");

    sections.push(`## This Week's Meal Plan\n${planList}`);
  }

  return sections.join("\n\n");
}

/**
 * Parse recipe suggestions from Pepper's response
 */
export function extractRecipeIds(response: string): string[] {
  const idPattern = /\[ID:([a-f0-9-]+)\]/gi;
  const matches = response.matchAll(idPattern);
  return [...matches].map((m) => m[1]);
}
