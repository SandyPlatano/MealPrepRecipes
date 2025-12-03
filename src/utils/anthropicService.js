/**
 * Anthropic Claude API service for recipe parsing
 */

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

/**
 * Parse free-form recipe text using Claude (via API route to avoid CORS)
 */
export async function parseRecipeWithClaude(rawText, apiKey) {
  if (!apiKey) {
    throw new Error('Anthropic API key is required');
  }

  try {
    const response = await fetch('/api/parse-recipe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey,
        text: rawText,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    const parsed = await response.json();
    
    // Ensure all required fields exist with defaults
    return {
      title: parsed.title || 'Untitled Recipe',
      recipeType: parsed.recipeType || 'Dinner',
      category: parsed.category || parsed.proteinType || 'Other',
      proteinType: parsed.proteinType || parsed.category || 'Other', // Keep for backwards compatibility
      prepTime: parsed.prepTime || '15 minutes',
      cookTime: parsed.cookTime || parsed.bakeTime || '30 minutes',
      servings: parsed.servings || '4',
      ingredients: Array.isArray(parsed.ingredients) ? parsed.ingredients : [],
      instructions: Array.isArray(parsed.instructions) ? parsed.instructions : [],
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
    };
  } catch (error) {
    console.error('Error parsing recipe with Claude:', error);
    throw error;
  }
}

/**
 * Parse recipe from HTML content (scraped from URL) - via API route to avoid CORS
 */
export async function parseRecipeFromHTML(htmlContent, sourceUrl, apiKey) {
  if (!apiKey) {
    throw new Error('Anthropic API key is required');
  }

  try {
    const response = await fetch('/api/parse-recipe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey,
        htmlContent: htmlContent.substring(0, 10000),
        sourceUrl,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    const parsed = await response.json();
    
    return {
      title: parsed.title || 'Untitled Recipe',
      recipeType: parsed.recipeType || 'Dinner',
      category: parsed.category || parsed.proteinType || 'Other',
      proteinType: parsed.proteinType || parsed.category || 'Other', // Keep for backwards compatibility
      prepTime: parsed.prepTime || '15 minutes',
      cookTime: parsed.cookTime || parsed.bakeTime || '30 minutes',
      servings: parsed.servings || '4',
      ingredients: Array.isArray(parsed.ingredients) ? parsed.ingredients : [],
      instructions: Array.isArray(parsed.instructions) ? parsed.instructions : [],
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      sourceUrl: parsed.sourceUrl || sourceUrl,
    };
  } catch (error) {
    console.error('Error parsing recipe from HTML:', error);
    throw error;
  }
}

/**
 * Categorize ingredients into groups (Proteins, Produce, Dairy, Pantry)
 */
export async function categorizeIngredients(ingredients, apiKey) {
  if (!apiKey || !ingredients.length) {
    // Fallback: return uncategorized
    return { 'Other': ingredients };
  }

  const prompt = `Categorize these ingredients into groups: Proteins, Produce, Dairy, Pantry, Other.

Ingredients:
${ingredients.map((ing, i) => `${i + 1}. ${ing}`).join('\n')}

Return a JSON object with categories as keys and arrays of ingredient strings as values:
{
  "Proteins": ["ingredient1", "ingredient2"],
  "Produce": ["ingredient3"],
  "Dairy": [],
  "Pantry": ["ingredient4"],
  "Other": []
}

Return ONLY valid JSON, no markdown formatting.`;

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-latest',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      // Fallback on error
      return { 'All Ingredients': ingredients };
    }

    const data = await response.json();
    const content = data.content[0].text;
    
    let jsonText = content.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }
    
    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Error categorizing ingredients:', error);
    // Fallback
    return { 'All Ingredients': ingredients };
  }
}

