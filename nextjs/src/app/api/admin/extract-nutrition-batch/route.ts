import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import { isNutritionTrackingEnabled } from "@/app/actions/nutrition";

/**
 * Background nutrition extraction endpoint for existing recipes.
 * Finds recipes without nutrition data and extracts nutrition in batches.
 *
 * Query params:
 * - limit: Maximum number of recipes to process (default: 10)
 * - dryRun: If true, only counts recipes without returning extractions (default: false)
 */
export async function POST(request: NextRequest) {
  try {
    const { user, household, error: authError } = await getCachedUserWithHousehold();

    // Only check for actual auth errors, not household/subscription errors
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    // authError might be from household/subscription lookup, which is OK for nutrition tracking

    // Check if nutrition tracking is enabled
    const nutritionCheck = await isNutritionTrackingEnabled();
    if (!nutritionCheck.enabled) {
      return NextResponse.json(
        { error: "Nutrition tracking is not enabled" },
        { status: 400 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10");
    const dryRun = searchParams.get("dryRun") === "true";

    const supabase = await createClient();

    // Find recipes without nutrition data
    // Get user's recipes (own + shared household recipes)
    const { data: recipes, error: recipesError } = await supabase
      .from("recipes")
      .select("id, title, ingredients, base_servings")
      .or(
        `user_id.eq.${user.id},and(household_id.eq.${household?.household_id},is_shared_with_household.eq.true)`
      )
      .order("created_at", { ascending: false })
      .limit(limit * 2); // Fetch more to account for filtering

    if (recipesError) {
      return NextResponse.json(
        { error: recipesError.message },
        { status: 500 }
      );
    }

    if (!recipes || recipes.length === 0) {
      return NextResponse.json({
        message: "No recipes found",
        processed: 0,
        skipped: 0,
        total: 0,
      });
    }

    // Check which recipes already have nutrition data
    const recipeIds = recipes.map((r) => r.id);
    const { data: existingNutrition } = await supabase
      .from("recipe_nutrition")
      .select("recipe_id")
      .in("recipe_id", recipeIds);

    const existingNutritionIds = new Set(
      existingNutrition?.map((n) => n.recipe_id) || []
    );

    // Filter to recipes without nutrition
    const recipesWithoutNutrition = recipes
      .filter((r) => !existingNutritionIds.has(r.id))
      .slice(0, limit);

    if (dryRun) {
      return NextResponse.json({
        message: `Found ${recipesWithoutNutrition.length} recipes without nutrition data`,
        total: recipesWithoutNutrition.length,
        recipeIds: recipesWithoutNutrition.map((r) => r.id),
      });
    }

    // Process recipes in background
    const results = {
      processed: 0,
      failed: 0,
      skipped: 0,
      total: recipesWithoutNutrition.length,
      errors: [] as string[],
      processedRecipes: [] as Array<{ id: string; title: string }>,
    };

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Get cookies from the original request to forward to internal API calls
    const cookieHeader = request.headers.get("cookie") || "";

    // Process recipes sequentially to avoid rate limits
    for (const recipe of recipesWithoutNutrition) {
      try {
        const response = await fetch(`${baseUrl}/api/ai/extract-nutrition`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Cookie": cookieHeader, // Forward authentication cookies
          },
          body: JSON.stringify({
            recipe_id: recipe.id, // Fixed: API expects recipe_id, not recipeId
            title: recipe.title,
            ingredients: recipe.ingredients,
            servings: recipe.base_servings || 4,
          }),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: "Unknown error" }));
          throw new Error(error.error || "Extraction failed");
        }

        results.processed++;
        results.processedRecipes.push({ id: recipe.id, title: recipe.title });
        console.log(`[Nutrition Batch] Extracted for recipe ${recipe.id}: ${recipe.title}`);
      } catch (error) {
        results.failed++;
        const errorMsg = `Recipe ${recipe.id} (${recipe.title}): ${error instanceof Error ? error.message : "Unknown error"}`;
        results.errors.push(errorMsg);
        console.error(`[Nutrition Batch] Failed:`, errorMsg);
      }
    }

    return NextResponse.json({
      message: `Processed ${results.processed} recipes, ${results.failed} failed`,
      ...results,
    });
  } catch (error) {
    console.error("Batch nutrition extraction error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to process batch",
      },
      { status: 500 }
    );
  }
}
