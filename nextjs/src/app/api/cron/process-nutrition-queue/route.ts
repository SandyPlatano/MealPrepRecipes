import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  buildNutritionExtractionPrompt,
  parseNutritionResponse,
  validateNutritionRanges,
} from "@/lib/ai/nutrition-extraction-prompt";

export const dynamic = "force-dynamic";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const BATCH_SIZE = 3; // Process 3 recipes per cron run to stay under rate limits
const MAX_ATTEMPTS = 3;

// Create admin client with service role (bypasses RLS)
function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

/**
 * Cron job to process nutrition extraction queue
 * Runs every 2 minutes, processes up to 3 recipes per run
 * Configure in vercel.json with schedule: "*/2 * * * *"
 */
export async function GET(req: Request) {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getAdminClient();

    // Fetch pending items from queue
    const { data: queueItems, error: fetchError } = await supabase
      .from("nutrition_extraction_queue")
      .select("id, recipe_id, attempts")
      .eq("status", "pending")
      .lt("attempts", MAX_ATTEMPTS)
      .order("priority", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(BATCH_SIZE);

    if (fetchError) {
      console.error("[Nutrition Cron] Error fetching queue:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch queue", details: fetchError.message },
        { status: 500 }
      );
    }

    if (!queueItems || queueItems.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        message: "Queue is empty",
      });
    }

    console.log(`[Nutrition Cron] Processing ${queueItems.length} recipes`);

    const results = { processed: 0, failed: 0, errors: [] as string[] };

    for (const item of queueItems) {
      // Mark as processing
      await supabase
        .from("nutrition_extraction_queue")
        .update({
          status: "processing",
          started_at: new Date().toISOString(),
        })
        .eq("id", item.id);

      try {
        // Fetch recipe data
        const { data: recipe, error: recipeError } = await supabase
          .from("recipes")
          .select("id, title, ingredients, base_servings, instructions")
          .eq("id", item.recipe_id)
          .single();

        if (recipeError || !recipe) {
          throw new Error(recipeError?.message || "Recipe not found");
        }

        // Skip if recipe has no ingredients
        if (!recipe.ingredients || recipe.ingredients.length === 0) {
          throw new Error("Recipe has no ingredients");
        }

        // Use base_servings or default to 4
        const servings = recipe.base_servings || 4;

        // Extract nutrition
        await extractNutritionForRecipe(supabase, {
          id: recipe.id,
          title: recipe.title,
          ingredients: recipe.ingredients,
          servings,
          instructions: recipe.instructions,
        });

        // Mark as completed
        await supabase
          .from("nutrition_extraction_queue")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
          })
          .eq("id", item.id);

        results.processed++;
        console.log(`[Nutrition Cron] Processed recipe: ${recipe.title}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        results.errors.push(`Recipe ${item.recipe_id}: ${errorMessage}`);

        // Update queue with failure
        const newAttempts = item.attempts + 1;
        await supabase
          .from("nutrition_extraction_queue")
          .update({
            status: newAttempts >= MAX_ATTEMPTS ? "failed" : "pending",
            attempts: newAttempts,
            last_error: errorMessage,
          })
          .eq("id", item.id);

        results.failed++;
        console.error(`[Nutrition Cron] Failed recipe ${item.recipe_id}:`, errorMessage);
      }
    }

    console.log(
      `[Nutrition Cron] Completed: ${results.processed} processed, ${results.failed} failed`
    );

    return NextResponse.json({
      success: true,
      processed: results.processed,
      failed: results.failed,
      errors: results.errors.length > 0 ? results.errors : undefined,
    });
  } catch (error) {
    console.error("[Nutrition Cron] Error:", error);
    return NextResponse.json(
      { error: "Failed to process nutrition queue" },
      { status: 500 }
    );
  }
}

/**
 * Extract nutrition for a single recipe using Anthropic API
 */
async function extractNutritionForRecipe(
  supabase: ReturnType<typeof getAdminClient>,
  recipe: {
    id: string;
    title: string;
    ingredients: string[];
    servings: number;
    instructions: string[] | null;
  }
): Promise<void> {
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicApiKey) {
    throw new Error("Anthropic API key not configured");
  }

  // Build prompt
  const prompt = buildNutritionExtractionPrompt(
    recipe.ingredients,
    recipe.servings,
    recipe.title,
    recipe.instructions || undefined
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
    throw new Error(
      errorData.error?.message || `Anthropic API error: ${response.status}`
    );
  }

  const data = await response.json();
  const content = data.content[0].text;

  // Parse nutrition response
  const nutritionData = parseNutritionResponse(content);
  if (!nutritionData) {
    throw new Error("Failed to parse nutrition data from AI response");
  }

  // Validate ranges (log warnings but don't fail)
  const warnings = validateNutritionRanges(nutritionData);
  if (warnings.length > 0) {
    console.warn(`[Nutrition Cron] Warnings for ${recipe.title}:`, warnings);
  }

  // Save to database
  const { error: saveError } = await supabase.from("recipe_nutrition").upsert(
    {
      recipe_id: recipe.id,
      calories: nutritionData.calories,
      protein_g: nutritionData.protein_g,
      carbs_g: nutritionData.carbs_g,
      fat_g: nutritionData.fat_g,
      fiber_g: nutritionData.fiber_g,
      sugar_g: nutritionData.sugar_g,
      sodium_mg: nutritionData.sodium_mg,
      source: "ai_extracted" as const,
      confidence_score: nutritionData.confidence_score,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "recipe_id",
    }
  );

  if (saveError) {
    throw new Error(`Failed to save nutrition: ${saveError.message}`);
  }
}
