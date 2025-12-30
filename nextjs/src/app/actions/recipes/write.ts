"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedUser, getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import { revalidatePath, revalidateTag } from "next/cache";
import type { Recipe, RecipeFormData } from "@/types/recipe";
import type { QuickCookSuggestion } from "@/types/quick-cook";
import { isNutritionTrackingEnabled, extractNutritionForRecipeInternal } from "../nutrition";
import { recipeFormSchema, recipeUpdateSchema, validateSchema } from "@/lib/validations/schemas";
import { invalidateCachePattern } from "@/lib/cache/redis";

/**
 * Create a new recipe
 */
export async function createRecipe(formData: RecipeFormData) {
  try {
    // Validate input
    const validation = validateSchema(recipeFormSchema, formData);
    if (!validation.success) {
      return { error: validation.error, data: null };
    }
    const validData = validation.data;

    // Check authentication first - household is optional
    const { user: authUser, error: authError } = await getCachedUser();

    if (authError || !authUser) {
      return { error: "Not authenticated", data: null };
    }

    // Get household separately (optional - user can create recipes without household)
    const { household } = await getCachedUserWithHousehold();

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("recipes")
      .insert({
        title: validData.title,
        recipe_type: validData.recipe_type,
        category: validData.category || null,
        protein_type: validData.protein_type || null,
        prep_time: validData.prep_time || null,
        cook_time: validData.cook_time || null,
        servings: validData.servings || null,
        base_servings: validData.base_servings || null,
        ingredients: validData.ingredients,
        instructions: validData.instructions,
        tags: validData.tags,
        notes: validData.notes || null,
        source_url: validData.source_url || null,
        image_url: validData.image_url || null,
        allergen_tags: validData.allergen_tags,
        user_id: authUser.id,
        household_id: household?.household_id || null,
        is_shared_with_household: validData.is_shared_with_household,
      })
      .select()
      .single();

    if (error) {
      return { error: error.message, data: null };
    }

    // Background task: Auto-extract nutrition if tracking is enabled
    // This runs asynchronously and doesn't block the response
    const nutritionCheck = await isNutritionTrackingEnabled();
    if (nutritionCheck.enabled && data) {
      // Fire and forget - don't await to avoid blocking recipe creation
      extractNutritionForRecipeInternal(data.id, {
        title: data.title,
        ingredients: data.ingredients,
        servings: data.base_servings || 4,
        instructions: data.instructions,
      }).catch((err: Error) => {
        // Log error but don't fail recipe creation
        console.error("Background nutrition extraction failed:", err);
      });
    }

    // Invalidate Redis cache for recipes
    await invalidateCachePattern(`recipes:*`);

    revalidatePath("/app/recipes");
    revalidateTag(`recipes-${authUser.id}`, "default");
    return { error: null, data: data as Recipe };
  } catch (error) {
    console.error("createRecipe error:", error);
    return { error: "Failed to create recipe. Please try again.", data: null };
  }
}

/**
 * Save a Quick Cook AI suggestion as a recipe
 */
export async function saveQuickCookRecipe(suggestion: QuickCookSuggestion) {
  // Convert QuickCookSuggestion to RecipeFormData
  const formData: RecipeFormData = {
    title: suggestion.title,
    recipe_type: "Dinner", // Default type for AI suggestions
    category: suggestion.cuisine || undefined,
    protein_type: suggestion.protein_type || undefined,
    prep_time: suggestion.active_time ? `${suggestion.active_time} min` : undefined,
    cook_time: suggestion.total_time && suggestion.active_time
      ? `${suggestion.total_time - suggestion.active_time} min`
      : undefined,
    servings: `${suggestion.servings}`,
    base_servings: suggestion.servings,
    ingredients: suggestion.ingredients.map(
      (i) => `${i.quantity} ${i.item}${i.notes ? ` (${i.notes})` : ""}`
    ),
    instructions: suggestion.instructions,
    tags: suggestion.tags || [],
    notes: `AI-suggested recipe: "${suggestion.reason}"`,
    allergen_tags: [],
  };

  return createRecipe(formData);
}

/**
 * Update an existing recipe
 */
export async function updateRecipe(id: string, formData: Partial<RecipeFormData>) {
  try {
    // Validate input
    const validation = validateSchema(recipeUpdateSchema, formData);
    if (!validation.success) {
      return { error: validation.error, data: null };
    }
    const validData = validation.data;

    // Check authentication first - household is optional
    const { user: authUser, error: authError } = await getCachedUser();

    if (authError || !authUser) {
      return { error: "Not authenticated", data: null };
    }

    const supabase = await createClient();

    // Build update object, only including fields that are provided
    const updateData: Record<string, unknown> = {};

    if (validData.title !== undefined) updateData.title = validData.title;
    if (validData.recipe_type !== undefined) updateData.recipe_type = validData.recipe_type;
    if (validData.category !== undefined) updateData.category = validData.category || null;
    if (validData.protein_type !== undefined) updateData.protein_type = validData.protein_type || null;
    if (validData.prep_time !== undefined) updateData.prep_time = validData.prep_time || null;
    if (validData.cook_time !== undefined) updateData.cook_time = validData.cook_time || null;
    if (validData.servings !== undefined) updateData.servings = validData.servings || null;
    if (validData.base_servings !== undefined) updateData.base_servings = validData.base_servings || null;
    if (validData.ingredients !== undefined) updateData.ingredients = validData.ingredients;
    if (validData.instructions !== undefined) updateData.instructions = validData.instructions;
    if (validData.tags !== undefined) updateData.tags = validData.tags;
    if (validData.notes !== undefined) updateData.notes = validData.notes || null;
    if (validData.source_url !== undefined) updateData.source_url = validData.source_url || null;
    if (validData.image_url !== undefined) updateData.image_url = validData.image_url || null;
    if (validData.allergen_tags !== undefined) updateData.allergen_tags = validData.allergen_tags;
    if (validData.is_shared_with_household !== undefined) {
      updateData.is_shared_with_household = validData.is_shared_with_household;
    }

    const { data, error } = await supabase
      .from("recipes")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", authUser.id) // Only owner can update
      .select()
      .single();

    if (error) {
      return { error: error.message, data: null };
    }

    // Background task: Re-extract nutrition if ingredients were updated and tracking is enabled
    const ingredientsUpdated = validData.ingredients !== undefined;
    if (ingredientsUpdated && data) {
      const nutritionCheck = await isNutritionTrackingEnabled();
      if (nutritionCheck.enabled) {
        // Fire and forget - don't await to avoid blocking recipe update
        extractNutritionForRecipeInternal(data.id, {
          title: data.title,
          ingredients: data.ingredients,
          servings: data.base_servings || 4,
          instructions: data.instructions,
        }).catch((err: Error) => {
          // Log error but don't fail recipe update
          console.error("Background nutrition re-extraction failed:", err);
        });
      }
    }

    // Invalidate Redis cache for recipes
    await invalidateCachePattern(`recipes:*`);

    revalidatePath("/app/recipes");
    revalidatePath(`/app/recipes/${id}`);
    revalidateTag(`recipes-${authUser.id}`, "default");
    return { error: null, data: data as Recipe };
  } catch (error) {
    console.error("updateRecipe error:", error);
    return { error: "Failed to update recipe. Please try again.", data: null };
  }
}

/**
 * Delete a recipe
 */
export async function deleteRecipe(id: string) {
  try {
    // Check authentication first - household is optional
    const { user: authUser, error: authError } = await getCachedUser();

    if (authError || !authUser) {
      return { error: "Not authenticated" };
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from("recipes")
      .delete()
      .eq("id", id)
      .eq("user_id", authUser.id); // Only owner can delete

    if (error) {
      return { error: error.message };
    }

    // Invalidate Redis cache for recipes
    await invalidateCachePattern(`recipes:*`);

    revalidatePath("/app/recipes");
    revalidateTag(`recipes-${authUser.id}`, "default");
    return { error: null };
  } catch (error) {
    console.error("deleteRecipe error:", error);
    return { error: "Failed to delete recipe. Please try again." };
  }
}
