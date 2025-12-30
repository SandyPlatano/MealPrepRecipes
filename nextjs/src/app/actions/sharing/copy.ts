"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedUser, getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import { revalidatePath } from "next/cache";

/**
 * Copy a public recipe to user's own collection
 */
export async function copyPublicRecipe(recipeId: string): Promise<{
  error: string | null;
  data: { newRecipeId: string } | null;
}> {
  const { user: authUser, error: authError } = await getCachedUser();

  if (authError || !authUser) {
    return { error: "Not authenticated", data: null };
  }

  const { household } = await getCachedUserWithHousehold();
  const supabase = await createClient();

  // Get the original recipe
  const { data: originalRecipe, error: recipeError } = await supabase
    .from("recipes")
    .select("id, title, recipe_type, category, protein_type, prep_time, cook_time, servings, base_servings, ingredients, instructions, tags, notes, source_url, image_url, allergen_tags, user_id, household_id, is_shared_with_household, is_public")
    .eq("id", recipeId)
    .or("is_public.eq.true,share_token.not.is.null")
    .single();

  if (recipeError || !originalRecipe) {
    return { error: "Recipe not found or is private", data: null };
  }

  // Don't allow copying own recipes
  if (originalRecipe.user_id === authUser.id) {
    return { error: "You already own this recipe", data: null };
  }

  // Create the copy
  const { data: newRecipe, error: insertError } = await supabase
    .from("recipes")
    .insert({
      title: originalRecipe.title,
      recipe_type: originalRecipe.recipe_type,
      category: originalRecipe.category,
      protein_type: originalRecipe.protein_type,
      prep_time: originalRecipe.prep_time,
      cook_time: originalRecipe.cook_time,
      servings: originalRecipe.servings,
      base_servings: originalRecipe.base_servings,
      ingredients: originalRecipe.ingredients,
      instructions: originalRecipe.instructions,
      tags: originalRecipe.tags,
      notes: originalRecipe.notes,
      source_url: originalRecipe.source_url,
      image_url: originalRecipe.image_url,
      allergen_tags: originalRecipe.allergen_tags,
      user_id: authUser.id,
      household_id: household?.household_id || null,
      is_shared_with_household: false,
      is_public: false,
      original_recipe_id: originalRecipe.id,
      original_author_id: originalRecipe.user_id,
    })
    .select("id")
    .single();

  if (insertError || !newRecipe) {
    return { error: insertError?.message || "Failed to copy recipe", data: null };
  }

  // Log the copy event
  await supabase.from("recipe_share_events").insert({
    recipe_id: recipeId,
    event_type: "copy_recipe",
    viewer_id: authUser.id,
  });

  revalidatePath("/app/recipes");
  return { error: null, data: { newRecipeId: newRecipe.id } };
}

/**
 * Get the original author of a copied recipe
 */
export async function getOriginalAuthor(authorId: string): Promise<{
  error: string | null;
  data: { username: string; id: string } | null;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username")
    .eq("id", authorId)
    .single();

  if (error || !data) {
    return { error: null, data: null };
  }

  return {
    error: null,
    data: {
      id: data.id,
      username: data.username || "Anonymous",
    },
  };
}
