import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit-redis";

export const dynamic = "force-dynamic";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Rate limiting: 20 requests per hour per user
    const rateLimitResult = await rateLimit({
      identifier: `parse-recipe-${user.id}`,
      limit: 20,
      windowMs: 60 * 60 * 1000, // 1 hour
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: "Rate limit exceeded. Try again later.",
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
        },
        { 
          status: 429,
          headers: {
            "X-RateLimit-Limit": rateLimitResult.limit.toString(),
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.reset.toString(),
            "Retry-After": Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    const body = await request.json();
    const { text, url } = body;
    let { htmlContent, sourceUrl } = body;

    // Get API key from environment
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

    if (!anthropicApiKey) {
      return NextResponse.json(
        { error: "Anthropic API key not configured" },
        { status: 500 }
      );
    }

    // If URL is provided, fetch content from it first
    if (url && !text && !htmlContent) {
      try {
        // Validate URL
        const parsedUrl = new URL(url);
        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
          return NextResponse.json(
            { error: "Invalid URL protocol" },
            { status: 400 }
          );
        }

        // Fetch the URL content
        const fetchResponse = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; RecipeParser/1.0)",
          },
        });

        if (!fetchResponse.ok) {
          return NextResponse.json(
            { error: `Failed to fetch URL: ${fetchResponse.status}` },
            { status: 400 }
          );
        }

        htmlContent = await fetchResponse.text();
        sourceUrl = url;
      } catch (urlError) {
        if (urlError instanceof TypeError && urlError.message.includes("Invalid URL")) {
          return NextResponse.json(
            { error: "Invalid URL format" },
            { status: 400 }
          );
        }
        return NextResponse.json(
          { error: "Failed to fetch URL content" },
          { status: 400 }
        );
      }
    }

    if (!text && !htmlContent) {
      return NextResponse.json(
        { error: "Recipe text, HTML content, or URL is required" },
        { status: 400 }
      );
    }

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
    let prompt: string;
    if (htmlContent) {
      prompt = `${skillInstructions}

Extract recipe information from this HTML content. The recipe is from: ${sourceUrl}

HTML content:
${htmlContent.substring(0, 10000)} ${htmlContent.length > 10000 ? "... (truncated)" : ""}

Return a JSON object with this exact structure:
{
  "title": "Recipe name",
  "recipeType": "Dinner|Baking|Breakfast|Dessert|Snack|Side Dish",
  "category": "For Dinner: Chicken|Beef|Pork|Fish|Seafood|Vegetarian|Vegan|Mixed. For Baking: Cookies|Cakes|Bread|Pastries|Pies|Muffins|Other Baked Goods. For Breakfast: Eggs|Pancakes|Oatmeal|Smoothie|Other. For Dessert: Frozen|Chocolate|Fruit|Custard|Other",
  "prepTime": "e.g., 15 minutes",
  "cookTime": "e.g., 30 minutes (or 'bakeTime' for baking)",
  "servings": "e.g., 4 or 'Makes 24 cookies'",
  "baseServings": 4,
  "ingredients": ["2 lbs chicken breast", "1 cup flour", ...],
  "instructions": ["Step 1", "Step 2", ...],
  "tags": ["chicken", "Italian", "meal prep friendly", ...],
  "notes": "Any tips or modifications, or 'None'",
  "sourceUrl": "${sourceUrl || ""}"
}

IMPORTANT:
- Include protein type as the FIRST tag (required)
- Extract ingredients with quantities in format: "[Quantity] [Unit] [Ingredient]"
- Make instructions clear, sequential, and actionable
- Include notes if available, otherwise "None"
- Extract baseServings as a NUMBER (e.g., 4, 6, 12) - extract the numeric value from servings text

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
  "prepTime": "e.g., 15 minutes",
  "cookTime": "e.g., 30 minutes (or 'bakeTime' for baking)",
  "servings": "e.g., 4 or 'Makes 24 cookies'",
  "baseServings": 4,
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
- Extract baseServings as a NUMBER (e.g., 4, 6, 12) - extract the numeric value from servings text

Return ONLY valid JSON, no markdown formatting, no explanation.`;
    }

    // Call Anthropic API
    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicApiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error:
            errorData.error?.message || `Anthropic API error: ${response.status}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.content[0].text;

    // Extract JSON from response
    let jsonText = content.trim();
    if (jsonText.startsWith("```")) {
      jsonText = jsonText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
    }

    const parsed = JSON.parse(jsonText);

    // Format response
    const result = {
      title: parsed.title || "Untitled Recipe",
      recipe_type: parsed.recipeType || "Dinner",
      category: parsed.category || "Other",
      prep_time: parsed.prepTime || "15 minutes",
      cook_time: parsed.cookTime || parsed.bakeTime || "30 minutes",
      servings: parsed.servings || "4",
      base_servings: parsed.baseServings || null,
      ingredients: Array.isArray(parsed.ingredients) ? parsed.ingredients : [],
      instructions: Array.isArray(parsed.instructions)
        ? parsed.instructions
        : [],
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      notes: parsed.notes || "None",
      source_url: sourceUrl || undefined,
    };

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to parse recipe",
      },
      { status: 500 }
    );
  }
}
