export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get API key from request body or environment variable
  const { apiKey, text, htmlContent, sourceUrl } = req.body;
  
  // Use API key from request body, or fall back to environment variable
  const anthropicApiKey = apiKey || process.env.ANTHROPIC_API_KEY;

  if (!anthropicApiKey) {
    return res.status(400).json({ error: 'API key is required' });
  }

  if (!text && !htmlContent) {
    return res.status(400).json({ error: 'Recipe text or HTML content is required' });
  }

  try {
    // Recipe formatter skill instructions
    const skillInstructions = `You are a recipe formatter. Format and organize recipes into consistent structure for meal prep collections.

## Extraction Guidelines

### Recipe Name
Extract the recipe title/name clearly.

### Tags
Extract relevant tags including:
- Protein type (REQUIRED: chicken, beef, pork, fish, seafood, vegetarian, vegan, mixed protein)
- Cuisine type (optional: Italian, Mexican, Asian, etc.)
- Meal prep friendly indicator (if applicable)
- Other descriptors (quick, spicy, comfort food, healthy, etc.)

### Ingredients
Extract ingredients with quantities. Format as: "[Quantity] [Unit] [Ingredient name]"
Examples: "2 lbs chicken breast", "1 cup diced onion", "2 tbsp olive oil", "Salt and pepper to taste"
Include quantities whenever provided. Keep ingredient names simple and clear.

### Instructions
Extract clear, sequential, actionable steps. Each instruction should be a complete step.
Preserve measurements as provided (cups, tbsp, lbs, etc.).

### Notes
Extract any modifications, tips, storage instructions, or observations. If none provided, use "None".

### Source
Include the original URL if from a website, or "User provided" if from personal notes.

### Protein Categories
Determine the primary protein type for categorization:
- Chicken
- Beef
- Pork
- Fish
- Seafood
- Vegetarian
- Vegan
- Mixed Protein (for recipes with multiple protein sources)

### Recipe Type
Determine recipeType based on content:
- Baking: cookies, cakes, bread, muffins, pastries, pies, brownies, etc.
- Dessert: ice cream, pudding, non-baked sweets
- Breakfast: eggs, pancakes, waffles, oatmeal, smoothies
- Dinner: main courses with proteins or substantial vegetarian dishes
- Side Dish: salads, vegetables, rice, sides
- Snack: appetizers, dips, small bites`;

    // Determine which prompt to use
    let prompt;
    if (htmlContent) {
      prompt = `${skillInstructions}

Extract recipe information from this HTML content. The recipe is from: ${sourceUrl}

HTML content:
${htmlContent.substring(0, 10000)} ${htmlContent.length > 10000 ? '... (truncated)' : ''}

Return a JSON object with this exact structure:
{
  "title": "Recipe name",
  "recipeType": "Dinner|Baking|Breakfast|Dessert|Snack|Side Dish",
  "category": "For Dinner: Chicken|Beef|Pork|Fish|Seafood|Vegetarian|Vegan|Mixed. For Baking: Cookies|Cakes|Bread|Pastries|Pies|Muffins|Other Baked Goods. For Breakfast: Eggs|Pancakes|Oatmeal|Smoothie|Other. For Dessert: Frozen|Chocolate|Fruit|Custard|Other",
  "proteinType": "Chicken|Beef|Pork|Fish|Seafood|Vegetarian|Vegan|Mixed Protein",
  "prepTime": "e.g., 15 minutes",
  "cookTime": "e.g., 30 minutes (or 'bakeTime' for baking)",
  "servings": "e.g., 4 or 'Makes 24 cookies'",
  "ingredients": ["2 lbs chicken breast", "1 cup flour", ...],
  "instructions": ["Step 1", "Step 2", ...],
  "tags": ["chicken", "Italian", "meal prep friendly", ...],
  "notes": "Any tips or modifications, or 'None'",
  "sourceUrl": "${sourceUrl || ''}"
}

IMPORTANT:
- Include protein type as the FIRST tag (required)
- Extract ingredients with quantities in format: "[Quantity] [Unit] [Ingredient]"
- Make instructions clear, sequential, and actionable
- Include notes if available, otherwise "None"

Return ONLY valid JSON, no markdown formatting, no explanation.`;
    } else {
      prompt = `${skillInstructions}

Parse the following recipe text and extract structured information.

Recipe text:
${text}

Return a JSON object with this exact structure:
{
  "title": "Recipe name",
  "recipeType": "Dinner|Baking|Breakfast|Dessert|Snack|Side Dish",
  "category": "For Dinner: Chicken|Beef|Pork|Fish|Seafood|Vegetarian|Vegan|Mixed. For Baking: Cookies|Cakes|Bread|Pastries|Pies|Muffins|Other Baked Goods. For Breakfast: Eggs|Pancakes|Oatmeal|Smoothie|Other. For Dessert: Frozen|Chocolate|Fruit|Custard|Other",
  "proteinType": "Chicken|Beef|Pork|Fish|Seafood|Vegetarian|Vegan|Mixed Protein",
  "prepTime": "e.g., 15 minutes",
  "cookTime": "e.g., 30 minutes (or 'bakeTime' for baking)",
  "servings": "e.g., 4 or 'Makes 24 cookies'",
  "ingredients": ["2 lbs chicken breast", "1 cup flour", ...],
  "instructions": ["Step 1", "Step 2", ...],
  "tags": ["chicken", "Italian", "meal prep friendly", ...],
  "notes": "Any tips or modifications, or 'None'"
}

IMPORTANT:
- Include protein type as the FIRST tag (required)
- Extract ingredients with quantities in format: "[Quantity] [Unit] [Ingredient]"
- Make instructions clear, sequential, and actionable
- Include notes if available, otherwise "None"

Return ONLY valid JSON, no markdown formatting, no explanation.`;
    }

    // Call Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-latest',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: errorData.error?.message || `API error: ${response.status}`,
      });
    }

    const data = await response.json();
    const content = data.content[0].text;

    // Extract JSON from response
    let jsonText = content.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }

    const parsed = JSON.parse(jsonText);

    // Format response
    const result = {
      title: parsed.title || 'Untitled Recipe',
      recipeType: parsed.recipeType || 'Dinner',
      category: parsed.category || parsed.proteinType || 'Other',
      proteinType: parsed.category || parsed.proteinType || 'Other',
      prepTime: parsed.prepTime || '15 minutes',
      cookTime: parsed.cookTime || parsed.bakeTime || '30 minutes',
      servings: parsed.servings || '4',
      ingredients: Array.isArray(parsed.ingredients) ? parsed.ingredients : [],
      instructions: Array.isArray(parsed.instructions) ? parsed.instructions : [],
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      notes: parsed.notes || 'None',
    };

    if (sourceUrl) {
      result.sourceUrl = sourceUrl;
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error parsing recipe:', error);
    return res.status(500).json({
      error: error.message || 'Failed to parse recipe',
    });
  }
}

