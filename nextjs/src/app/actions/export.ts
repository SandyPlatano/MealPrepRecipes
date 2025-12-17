"use server";

import { createClient } from "@/lib/supabase/server";
import type { Recipe } from "@/types/recipe";
import type {
  ImportValidationResult,
  ImportResult,
  DuplicateHandling,
} from "@/types/export";

/**
 * Import recipes from parsed validation results
 */
export async function importRecipes(
  validationResults: ImportValidationResult[],
  duplicateHandling: DuplicateHandling
): Promise<ImportResult> {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      imported: 0,
      skipped: 0,
      replaced: 0,
      failed: 0,
      errors: [{ title: "Authentication", error: "Not authenticated" }],
    };
  }

  // Get user's household for shared recipes
  const { data: memberData } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single();

  const householdId = memberData?.household_id || null;

  // Get existing recipe titles for duplicate handling
  const { data: existingRecipes } = await supabase
    .from("recipes")
    .select("id, title")
    .eq("user_id", user.id);

  const existingRecipeMap = new Map(
    (existingRecipes || []).map((r) => [r.title.toLowerCase().trim(), r.id])
  );

  let imported = 0;
  let skipped = 0;
  let replaced = 0;
  let failed = 0;
  const errors: ImportResult["errors"] = [];

  for (const result of validationResults) {
    // Skip invalid recipes
    if (!result.isValid || !result.parsedRecipe) {
      failed++;
      errors.push({
        title: result.title,
        error: result.errors.join(", "),
      });
      continue;
    }

    const normalizedTitle = result.title.toLowerCase().trim();
    const existingId = existingRecipeMap.get(normalizedTitle);
    const isDuplicate = !!existingId;

    try {
      if (isDuplicate) {
        switch (duplicateHandling) {
          case "skip":
            skipped++;
            continue;

          case "replace":
            // Delete existing and insert new
            await supabase.from("recipes").delete().eq("id", existingId);

            const { error: replaceError } = await supabase
              .from("recipes")
              .insert({
                ...prepareRecipeForInsert(result.parsedRecipe, user.id, householdId),
                title: result.title,
              });

            if (replaceError) {
              failed++;
              errors.push({ title: result.title, error: replaceError.message });
            } else {
              replaced++;
            }
            break;

          case "keep_both":
            // Insert with modified title
            const { error: keepBothError } = await supabase
              .from("recipes")
              .insert({
                ...prepareRecipeForInsert(result.parsedRecipe, user.id, householdId),
                title: `${result.title} (imported)`,
              });

            if (keepBothError) {
              failed++;
              errors.push({ title: result.title, error: keepBothError.message });
            } else {
              imported++;
            }
            break;
        }
      } else {
        // Insert new recipe
        const { error: insertError } = await supabase.from("recipes").insert({
          ...prepareRecipeForInsert(result.parsedRecipe, user.id, householdId),
          title: result.title,
        });

        if (insertError) {
          failed++;
          errors.push({ title: result.title, error: insertError.message });
        } else {
          imported++;
        }
      }
    } catch (error) {
      failed++;
      errors.push({
        title: result.title,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return {
    success: failed === 0 || imported + replaced > 0,
    imported,
    skipped,
    replaced,
    failed,
    errors,
  };
}

/**
 * Prepare a parsed recipe for database insertion
 */
function prepareRecipeForInsert(
  recipe: Partial<Recipe>,
  userId: string,
  householdId: string | null
): Omit<Recipe, "id" | "created_at" | "updated_at"> {
  return {
    title: recipe.title || "Untitled Recipe",
    recipe_type: recipe.recipe_type || "Dinner",
    category: recipe.category || null,
    protein_type: recipe.protein_type || null,
    prep_time: recipe.prep_time || null,
    cook_time: recipe.cook_time || null,
    servings: recipe.servings || null,
    base_servings: recipe.base_servings || null,
    ingredients: recipe.ingredients || [],
    instructions: recipe.instructions || [],
    tags: recipe.tags || [],
    notes: recipe.notes || null,
    source_url: recipe.source_url || null,
    image_url: recipe.image_url || null,
    rating: recipe.rating || null,
    allergen_tags: recipe.allergen_tags || [],
    user_id: userId,
    household_id: householdId,
    is_shared_with_household: true,
    is_public: false,
    share_token: null,
    view_count: 0,
    original_recipe_id: null,
    original_author_id: null,
    avg_rating: null,
    review_count: 0,
  };
}

/**
 * Get all recipe titles for the current user (for duplicate detection)
 */
export async function getExistingRecipeTitles(): Promise<{
  titles: string[];
  error?: string;
}> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { titles: [], error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("recipes")
    .select("title")
    .eq("user_id", user.id);

  if (error) {
    return { titles: [], error: error.message };
  }

  return {
    titles: (data || []).map((r) => r.title.toLowerCase().trim()),
  };
}

/**
 * Get all recipes with nutrition for bulk export
 */
export async function getRecipesForExport(): Promise<{
  recipes: Recipe[];
  nutritionMap: Record<string, Record<string, unknown>>;
  error?: string;
}> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { recipes: [], nutritionMap: {}, error: "Not authenticated" };
  }

  // Get all user's recipes
  const { data: recipes, error: recipesError } = await supabase
    .from("recipes")
    .select("*")
    .eq("user_id", user.id)
    .order("title", { ascending: true });

  if (recipesError) {
    return { recipes: [], nutritionMap: {}, error: recipesError.message };
  }

  // Get nutrition for all recipes
  const recipeIds = (recipes || []).map((r) => r.id);
  const { data: nutritionData } = await supabase
    .from("recipe_nutrition")
    .select("*")
    .in("recipe_id", recipeIds);

  // Build nutrition map
  const nutritionMap: Record<string, Record<string, unknown>> = {};
  for (const nutrition of nutritionData || []) {
    nutritionMap[nutrition.recipe_id] = nutrition;
  }

  return {
    recipes: recipes || [],
    nutritionMap,
  };
}
