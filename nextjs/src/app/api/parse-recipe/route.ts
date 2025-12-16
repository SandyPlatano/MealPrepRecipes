import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit-redis";
import {
  extractRecipeSchema,
  schemaToRecipeFormat,
  type NormalizedRecipeSchema,
} from "@/lib/recipe-schema-extractor";

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

    // Recipe formatter skill instructions - ENHANCED for accuracy
    const skillInstructions = `You are a professional recipe extraction specialist. Your task is to accurately extract recipe information exactly as presented on the original website/source, preserving all details, quantities, and instructions with precision.

## Critical Extraction Principles

### Accuracy First
- Extract ingredients and instructions EXACTLY as written on the source
- Preserve all quantities, measurements, and ingredient names as provided
- Do NOT simplify, combine, or reinterpret the original recipe
- Do NOT add or remove steps - extract only what is provided
- Maintain the original sequence and grouping of ingredients/steps

### Recipe Name
Extract the exact recipe title as displayed on the website.

### Tags
Extract relevant tags including:
- Protein type (REQUIRED: chicken, beef, pork, fish, seafood, vegetarian, vegan, mixed protein)
- Cuisine type (optional: Italian, Mexican, Asian, etc.)
- Meal prep friendly indicator (if applicable)
- Other descriptors from the source (quick, spicy, comfort food, healthy, etc.)

### Ingredients - PRIORITY ACCURACY
Format each ingredient exactly as presented, including:
- Full quantity with units (e.g., "2 lbs", "1 cup", "1 tbsp", "1/4 tsp", "2-3", "to taste", "1 (15 oz) can")
- Complete ingredient name including all modifiers (e.g., "diced onion", "cooked chicken breast", "fresh cilantro")
- Special instructions on ingredients if provided (e.g., "melted butter", "lightly beaten eggs")

Format: "[Quantity] [Unit] [Ingredient name with all modifiers]"
Examples: "2 lbs boneless, skinless chicken breast", "1 (15 oz) can diced tomatoes", "3/4 cup finely chopped onions", "1 tbsp finely minced garlic", "Salt and black pepper to taste"

CRITICAL: Include every ingredient exactly as listed on the source, even if quantities seem unusual or incomplete.

### Instructions - PRESERVE ORIGINAL FORMAT
Extract each step exactly as written:
- Break apart combined steps only if they describe distinct actions
- Preserve any special instructions or temperature details
- Include all timing information (simmer 5 minutes, bake at 350°F for 30 minutes, etc.)
- Maintain the logical sequence

CRITICAL: Do NOT simplify or merge instructions - keep them as written on the source.

### Notes
Extract any modifications, tips, storage instructions, substitutions, or special observations directly from the source.
Include chef's notes, serving suggestions, or make-ahead instructions if provided.
If none provided, use "None".

### Source
Include the original URL if from a website, or "User provided" if from personal notes.

### Protein Categories
Determine the primary protein type for categorization:
- Chicken
- Beef
- Pork
- Fish
- Seafood
- Vegetarian (no meat, but includes dairy/eggs)
- Vegan (no animal products)
- Mixed Protein (multiple protein sources)

### Recipe Type
Determine recipeType based on content:
- Baking: cookies, cakes, bread, muffins, pastries, pies, brownies, etc.
- Dessert: ice cream, pudding, non-baked sweets
- Breakfast: eggs, pancakes, waffles, oatmeal, smoothies
- Dinner: main courses with proteins or substantial vegetarian dishes
- Side Dish: salads, vegetables, rice, sides
- Snack: appetizers, dips, small bites`;

    // Check for JSON-LD recipe schema (most accurate extraction source)
    let schemaInfo = "";
    let schemaData: NormalizedRecipeSchema | null = null;

    if (htmlContent) {
      const schema = extractRecipeSchema(htmlContent);
      if (schema) {
        schemaData = schemaToRecipeFormat(schema);

        // Check if schema has complete critical data
        const hasCompleteIngredients = schemaData.ingredients.length > 0;
        const hasCompleteInstructions = schemaData.instructions.length > 0;

        if (hasCompleteIngredients && hasCompleteInstructions) {
          schemaInfo = `\n\n**IMPORTANT: STRUCTURED RECIPE DATA FOUND**
This website includes complete JSON-LD recipe data. USE THIS DATA DIRECTLY for ingredients and instructions:
${JSON.stringify(schemaData, null, 2)}

CRITICAL: The ingredients and instructions above come directly from the website's structured data and should be used exactly as provided. Only use the HTML content to extract additional context like notes, tips, or missing metadata.`;
        } else {
          schemaInfo = `\n\nPARTIAL RECIPE SCHEMA FOUND (verify against HTML):
${JSON.stringify(schemaData, null, 2)}`;
        }
      }
    }

    // Determine which prompt to use
    let prompt: string;
    if (htmlContent) {
      prompt = `${skillInstructions}

Extract recipe information from this HTML content. The recipe is from: ${sourceUrl}

IMPORTANT INSTRUCTIONS FOR ACCURACY:
1. Look for ingredient sections (typically labeled "Ingredients", "What You Need", etc.)
2. Extract ALL ingredients exactly as listed - do NOT modify, combine, or simplify
3. Look for instruction sections (typically labeled "Instructions", "Directions", "Steps", etc.)
4. Extract ALL steps exactly as written - preserve all details and measurements
5. Look for timing information (prep time, cook time, bake time)
6. Look for serving size information
7. Look for any notes, tips, or special instructions${schemaInfo}

HTML content:
${htmlContent.substring(0, 12000)} ${htmlContent.length > 12000 ? "... (truncated)" : ""}

Return a JSON object with this exact structure:
{
  "title": "Recipe name - extract exactly as shown on website",
  "recipeType": "Dinner|Baking|Breakfast|Dessert|Snack|Side Dish",
  "category": "For Dinner: Chicken|Beef|Pork|Fish|Seafood|Vegetarian|Vegan|Mixed. For Baking: Cookies|Cakes|Bread|Pastries|Pies|Muffins|Other Baked Goods. For Breakfast: Eggs|Pancakes|Oatmeal|Smoothie|Other. For Dessert: Frozen|Chocolate|Fruit|Custard|Other",
  "prepTime": "e.g., 15 minutes - extract exactly as shown",
  "cookTime": "e.g., 30 minutes - extract exactly as shown",
  "servings": "e.g., 4 or 'Makes 24 cookies' - extract exactly as shown",
  "baseServings": 4,
  "ingredients": ["ingredient with exact quantity from website", "another ingredient exactly as listed", ...],
  "instructions": ["Step 1 - exactly as written on website", "Step 2 - exactly as written on website", ...],
  "tags": ["chicken", "Italian", "meal prep friendly", ...],
  "notes": "Any tips, modifications, or special instructions from the source, or 'None'",
  "sourceUrl": "${sourceUrl || ""}"
}

CRITICAL REQUIREMENTS:
- Ingredients array: MUST include all ingredients exactly as listed on the website with their quantities
- Instructions array: MUST include all steps exactly as written on the website in order
- Include protein type as the FIRST tag (required)
- Extract baseServings as a NUMBER (e.g., 4, 6, 12)
- Preserve all special formatting or grouping from the original (e.g., "For the sauce:" sections)
- If an ingredient or step appears on the website, it MUST appear in your extraction
- Do NOT add, remove, or modify any ingredients or steps

Return ONLY valid JSON, no markdown formatting, no explanation.`;
    } else {
      prompt = `${skillInstructions}

Parse the following recipe text and extract structured information. Preserve all details exactly as written in the source.

IMPORTANT INSTRUCTIONS FOR ACCURACY:
1. Extract ALL ingredients exactly as listed in the text - do NOT modify, combine, or simplify
2. Extract ALL steps exactly as written - preserve all details and measurements
3. Look for timing information (prep time, cook time, bake time)
4. Look for serving size information
5. Look for any notes, tips, or special instructions

Recipe text:
${text}

Return a JSON object with this exact structure:
{
  "title": "Recipe name - extract exactly as shown in source",
  "recipeType": "Dinner|Baking|Breakfast|Dessert|Snack|Side Dish",
  "category": "For Dinner: Chicken|Beef|Pork|Fish|Seafood|Vegetarian|Vegan|Mixed. For Baking: Cookies|Cakes|Bread|Pastries|Pies|Muffins|Other Baked Goods. For Breakfast: Eggs|Pancakes|Oatmeal|Smoothie|Other. For Dessert: Frozen|Chocolate|Fruit|Custard|Other",
  "prepTime": "e.g., 15 minutes - extract exactly as shown",
  "cookTime": "e.g., 30 minutes - extract exactly as shown",
  "servings": "e.g., 4 or 'Makes 24 cookies' - extract exactly as shown",
  "baseServings": 4,
  "ingredients": ["ingredient with exact quantity from source", "another ingredient exactly as listed", ...],
  "instructions": ["Step 1 - exactly as written in source", "Step 2 - exactly as written in source", ...],
  "tags": ["chicken", "Italian", "meal prep friendly", ...],
  "notes": "Any tips, modifications, or special instructions from the source, or 'None'"
}

CRITICAL REQUIREMENTS:
- Ingredients array: MUST include all ingredients exactly as listed with their quantities
- Instructions array: MUST include all steps exactly as written in order
- Include protein type as the FIRST tag (required)
- Extract baseServings as a NUMBER (e.g., 4, 6, 12)
- Preserve all special formatting or grouping from the original
- If an ingredient or step appears in the source text, it MUST appear in your extraction
- Do NOT add, remove, or modify any ingredients or steps

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

    // Format response - prefer schema data when available and complete
    const hasCompleteSchema =
      schemaData &&
      schemaData.ingredients.length > 0 &&
      schemaData.instructions.length > 0;

    const result = {
      title: parsed.title || schemaData?.title || "Untitled Recipe",
      recipe_type: parsed.recipeType || "Dinner",
      category: parsed.category || schemaData?.category || "Other",
      prep_time: parsed.prepTime || schemaData?.prepTime || "15 minutes",
      cook_time:
        parsed.cookTime ||
        parsed.bakeTime ||
        schemaData?.cookTime ||
        "30 minutes",
      servings: parsed.servings || schemaData?.servings || "4",
      base_servings: parsed.baseServings || null,
      // Use schema ingredients/instructions if AI extraction seems incomplete
      ingredients:
        Array.isArray(parsed.ingredients) && parsed.ingredients.length > 0
          ? parsed.ingredients
          : hasCompleteSchema
            ? schemaData!.ingredients
            : [],
      instructions:
        Array.isArray(parsed.instructions) && parsed.instructions.length > 0
          ? parsed.instructions
          : hasCompleteSchema
            ? schemaData!.instructions
            : [],
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      notes: parsed.notes || "None",
      source_url: sourceUrl || undefined,
      // New fields from schema
      image_url: schemaData?.image || undefined,
      cuisine: schemaData?.cuisine || undefined,
      schema_nutrition: schemaData?.nutrition || undefined,
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
