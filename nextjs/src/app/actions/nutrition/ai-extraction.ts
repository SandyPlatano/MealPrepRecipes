"use server";

/**
 * AI Nutrition Extraction Actions
 * Handles Claude API calls for automated nutrition extraction
 */

import { createClient } from "@/lib/supabase/server";
import {
  buildNutritionExtractionPrompt,
  parseNutritionResponse,
  validateNutritionRanges,
} from "@/lib/ai/nutrition-extraction-prompt";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

/**
 * Internal function to extract nutrition for a recipe
 * Called directly from server actions (no HTTP overhead, no auth required)
 * This bypasses the API route to avoid authentication issues with server-to-server calls
 */
export async function extractNutritionForRecipeInternal(
  recipeId: string,
  recipeData: {
    title: string;
    ingredients: string[];
    servings: number;
    instructions?: string[];
  }
): Promise<{
  success: boolean;
  error?: string;
  warnings?: string[];
}> {
  try {
    const supabase = await createClient();

    // Get Anthropic API key
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicApiKey) {
      console.error("[Nutrition] Anthropic API key not configured");
      return { success: false, error: "Anthropic API key not configured" };
    }

    // Build prompt
    const prompt = buildNutritionExtractionPrompt(
      recipeData.ingredients,
      recipeData.servings,
      recipeData.title,
      recipeData.instructions
    );

    // Call Claude API
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
      console.error("[Nutrition] Anthropic API error:", errorData);
      return {
        success: false,
        error: errorData.error?.message || `Anthropic API error: ${response.status}`,
      };
    }

    const data = await response.json();
    const content = data.content[0].text;

    // Extract usage and calculate cost
    // Claude Sonnet 4.5 pricing: $3 per 1M input tokens, $15 per 1M output tokens
    const inputTokens = data.usage?.input_tokens || 0;
    const outputTokens = data.usage?.output_tokens || 0;
    const costUsd =
      inputTokens > 0 || outputTokens > 0
        ? (inputTokens * 3) / 1_000_000 + (outputTokens * 15) / 1_000_000
        : null;

    // Parse nutrition response
    const nutritionData = parseNutritionResponse(content);

    if (!nutritionData) {
      console.error("[Nutrition] Failed to parse AI response:", content);
      return {
        success: false,
        error: "Failed to parse nutrition data from AI response",
      };
    }

    // Validate nutrition ranges
    const warnings = validateNutritionRanges(nutritionData);
    if (warnings.length > 0) {
      console.warn(`[Nutrition] Validation warnings for recipe ${recipeId}:`, warnings);
    }

    // Save to database
    const { error: saveError } = await supabase.from("recipe_nutrition").upsert(
      {
        recipe_id: recipeId,
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
    );

    if (saveError) {
      console.error("[Nutrition] Failed to save nutrition data:", saveError);
      return {
        success: false,
        error: "Failed to save nutrition data to database",
      };
    }

    console.log(`[Nutrition] Successfully extracted nutrition for recipe ${recipeId}`);
    return {
      success: true,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error) {
    console.error(`[Nutrition] Error extracting nutrition for recipe ${recipeId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to extract nutrition",
    };
  }
}
