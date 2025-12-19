"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface BulkTagResult {
  success: boolean;
  updatedCount: number;
  error?: string;
}

/**
 * Add a tag to multiple recipes at once.
 * If a recipe already has the tag, it's skipped (no duplicates).
 */
export async function bulkAddTagToRecipes(
  recipeIds: string[],
  tag: string
): Promise<BulkTagResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, updatedCount: 0, error: "Not authenticated" };
  }

  if (recipeIds.length === 0) {
    return { success: false, updatedCount: 0, error: "No recipes selected" };
  }

  if (!tag.trim()) {
    return { success: false, updatedCount: 0, error: "Tag cannot be empty" };
  }

  const normalizedTag = tag.trim();

  try {
    // Fetch current tags for all selected recipes
    const { data: recipes, error: fetchError } = await supabase
      .from("recipes")
      .select("id, tags")
      .in("id", recipeIds)
      .eq("user_id", user.id);

    if (fetchError) {
      throw fetchError;
    }

    if (!recipes || recipes.length === 0) {
      return { success: false, updatedCount: 0, error: "No recipes found" };
    }

    // Update each recipe that doesn't already have the tag
    let updatedCount = 0;
    const updatePromises = recipes
      .filter((recipe) => {
        const existingTags = (recipe.tags as string[]) || [];
        // Check if tag already exists (case-insensitive)
        return !existingTags.some(
          (t) => t.toLowerCase() === normalizedTag.toLowerCase()
        );
      })
      .map(async (recipe) => {
        const existingTags = (recipe.tags as string[]) || [];
        const newTags = [...existingTags, normalizedTag];

        const { error } = await supabase
          .from("recipes")
          .update({ tags: newTags, updated_at: new Date().toISOString() })
          .eq("id", recipe.id)
          .eq("user_id", user.id);

        if (!error) {
          updatedCount++;
        }
        return error;
      });

    await Promise.all(updatePromises);

    // Revalidate the recipes page
    revalidatePath("/app/recipes");

    return {
      success: true,
      updatedCount,
    };
  } catch (error) {
    console.error("Bulk tag error:", error);
    return {
      success: false,
      updatedCount: 0,
      error: error instanceof Error ? error.message : "Failed to update recipes",
    };
  }
}

/**
 * Remove a tag from multiple recipes at once.
 */
export async function bulkRemoveTagFromRecipes(
  recipeIds: string[],
  tag: string
): Promise<BulkTagResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, updatedCount: 0, error: "Not authenticated" };
  }

  if (recipeIds.length === 0) {
    return { success: false, updatedCount: 0, error: "No recipes selected" };
  }

  const normalizedTag = tag.trim().toLowerCase();

  try {
    // Fetch current tags for all selected recipes
    const { data: recipes, error: fetchError } = await supabase
      .from("recipes")
      .select("id, tags")
      .in("id", recipeIds)
      .eq("user_id", user.id);

    if (fetchError) {
      throw fetchError;
    }

    if (!recipes || recipes.length === 0) {
      return { success: false, updatedCount: 0, error: "No recipes found" };
    }

    // Update each recipe that has the tag
    let updatedCount = 0;
    const updatePromises = recipes
      .filter((recipe) => {
        const existingTags = (recipe.tags as string[]) || [];
        return existingTags.some((t) => t.toLowerCase() === normalizedTag);
      })
      .map(async (recipe) => {
        const existingTags = (recipe.tags as string[]) || [];
        const newTags = existingTags.filter(
          (t) => t.toLowerCase() !== normalizedTag
        );

        const { error } = await supabase
          .from("recipes")
          .update({ tags: newTags, updated_at: new Date().toISOString() })
          .eq("id", recipe.id)
          .eq("user_id", user.id);

        if (!error) {
          updatedCount++;
        }
        return error;
      });

    await Promise.all(updatePromises);

    revalidatePath("/app/recipes");

    return {
      success: true,
      updatedCount,
    };
  } catch (error) {
    console.error("Bulk tag removal error:", error);
    return {
      success: false,
      updatedCount: 0,
      error: error instanceof Error ? error.message : "Failed to update recipes",
    };
  }
}
