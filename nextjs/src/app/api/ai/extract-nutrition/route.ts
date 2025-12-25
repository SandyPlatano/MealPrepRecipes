import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit-redis";
import {
  buildNutritionExtractionPrompt,
  parseNutritionResponse,
  validateNutritionRanges,
} from "@/lib/ai/nutrition-extraction-prompt";
import type { NutritionExtractionRequest } from "@/types/nutrition";

export const dynamic = "force-dynamic";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

/**
 * POST /api/ai/extract-nutrition
 *
 * Extract nutritional information from a recipe using Claude API
 *
 * Request body:
 * {
 *   recipe_id: string,
 *   ingredients: string[],
 *   servings: number,
 *   title?: string,
 *   instructions?: string[],
 *   force_reextract?: boolean
 * }
 *
 * Returns:
 * {
 *   success: boolean,
 *   nutrition?: RecipeNutrition,
 *   warnings?: string[],
 *   error?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. AUTHENTICATION
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // 2. RATE LIMITING (30 requests per hour per user)
    const rateLimitResult = await rateLimit({
      identifier: `extract-nutrition-${user.id}`,
      limit: 30,
      windowMs: 60 * 60 * 1000, // 1 hour
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded. Try again later.",
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": rateLimitResult.limit.toString(),
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.reset.toString(),
            "Retry-After": Math.ceil(
              (rateLimitResult.reset - Date.now()) / 1000
            ).toString(),
          },
        }
      );
    }

    // 3. PARSE REQUEST BODY
    const body: NutritionExtractionRequest = await request.json();
    const {
      recipe_id,
      ingredients,
      servings,
      force_reextract = false,
    } = body;

    // Validate required fields
    if (!recipe_id) {
      return NextResponse.json(
        { success: false, error: "recipe_id is required" },
        { status: 400 }
      );
    }

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        { success: false, error: "ingredients array is required and must not be empty" },
        { status: 400 }
      );
    }

    if (!servings || servings <= 0) {
      return NextResponse.json(
        { success: false, error: "servings must be a positive number" },
        { status: 400 }
      );
    }

    // 4. CHECK IF USER OWNS THE RECIPE
    const { data: recipe, error: recipeError } = await supabase
      .from("recipes")
      .select("id, title, user_id, instructions")
      .eq("id", recipe_id)
      .single();

    if (recipeError || !recipe) {
      return NextResponse.json(
        { success: false, error: "Recipe not found" },
        { status: 404 }
      );
    }

    if (recipe.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: "You don't have permission to modify this recipe" },
        { status: 403 }
      );
    }

    // 5. CHECK IF NUTRITION ALREADY EXISTS
    if (!force_reextract) {
      const { data: existingNutrition } = await supabase
        .from("recipe_nutrition")
        .select("id, confidence_score")
        .eq("recipe_id", recipe_id)
        .single();

      if (existingNutrition) {
        return NextResponse.json(
          {
            success: false,
            error: "Nutrition data already exists. Use force_reextract=true to override.",
            existing_confidence: existingNutrition.confidence_score,
          },
          { status: 409 }
        );
      }
    }

    // 6. GET ANTHROPIC API KEY
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicApiKey) {
      return NextResponse.json(
        { success: false, error: "Anthropic API key not configured" },
        { status: 500 }
      );
    }

    // 7. BUILD PROMPT
    const prompt = buildNutritionExtractionPrompt(
      ingredients,
      servings,
      recipe.title || body.title,
      recipe.instructions || body.instructions
    );

    // 8. CALL CLAUDE API
    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicApiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 1000,
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
      console.error("Anthropic API error:", errorData);
      return NextResponse.json(
        {
          success: false,
          error: errorData.error?.message || `Anthropic API error: ${response.status}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.content[0].text;

    // 9. EXTRACT USAGE AND CALCULATE COST
    // Claude Sonnet 4.5 pricing: $3 per 1M input tokens, $15 per 1M output tokens
    const inputTokens = data.usage?.input_tokens || 0;
    const outputTokens = data.usage?.output_tokens || 0;
    const costUsd = inputTokens > 0 || outputTokens > 0
      ? (inputTokens * 3 / 1_000_000) + (outputTokens * 15 / 1_000_000)
      : null;

    // 10. PARSE NUTRITION RESPONSE
    const nutritionData = parseNutritionResponse(content);

    if (!nutritionData) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to parse nutrition data from AI response",
          raw_response: content,
        },
        { status: 500 }
      );
    }

    // 11. VALIDATE NUTRITION RANGES
    const warnings = validateNutritionRanges(nutritionData);

    // 12. SAVE TO DATABASE
    const { data: savedNutrition, error: saveError } = await supabase
      .from("recipe_nutrition")
      .upsert(
        {
          recipe_id,
          calories: nutritionData.calories,
          protein_g: nutritionData.protein_g,
          carbs_g: nutritionData.carbs_g,
          fat_g: nutritionData.fat_g,
          fiber_g: nutritionData.fiber_g,
          sugar_g: nutritionData.sugar_g,
          sodium_mg: nutritionData.sodium_mg,
          source: "ai_extracted" as const,
          confidence_score: nutritionData.confidence_score,
          input_tokens: inputTokens > 0 ? inputTokens : null,
          output_tokens: outputTokens > 0 ? outputTokens : null,
          cost_usd: costUsd,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "recipe_id",
        }
      )
      .select()
      .single();

    if (saveError) {
      console.error("Failed to save nutrition data:", saveError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to save nutrition data to database",
          details: saveError.message,
        },
        { status: 500 }
      );
    }

    // 13. RETURN SUCCESS RESPONSE
    return NextResponse.json({
      success: true,
      nutrition: savedNutrition,
      warnings: warnings.length > 0 ? warnings : undefined,
      confidence_level:
        nutritionData.confidence_score >= 0.7
          ? "high"
          : nutritionData.confidence_score >= 0.4
          ? "medium"
          : "low",
      cost: costUsd ? {
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        cost_usd: costUsd,
      } : undefined,
    });
  } catch (error) {
    console.error("Error extracting nutrition:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to extract nutrition",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/extract-nutrition?recipe_id=xxx
 *
 * Get existing nutrition data for a recipe
 */
export async function GET(request: NextRequest) {
  try {
    // 1. AUTHENTICATION
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // 2. GET RECIPE ID FROM QUERY PARAMS
    const searchParams = request.nextUrl.searchParams;
    const recipe_id = searchParams.get("recipe_id");

    if (!recipe_id) {
      return NextResponse.json(
        { success: false, error: "recipe_id query parameter is required" },
        { status: 400 }
      );
    }

    // 3. FETCH NUTRITION DATA
    const { data: nutrition, error } = await supabase
      .from("recipe_nutrition")
      .select("id, recipe_id, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, source, confidence_score, input_tokens, output_tokens, cost_usd, created_at, updated_at")
      .eq("recipe_id", recipe_id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No nutrition data found
        return NextResponse.json({
          success: true,
          nutrition: null,
          message: "No nutrition data found for this recipe",
        });
      }

      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch nutrition data",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      nutrition,
    });
  } catch (error) {
    console.error("Error fetching nutrition:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch nutrition",
      },
      { status: 500 }
    );
  }
}
