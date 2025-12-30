"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedUser } from "@/lib/supabase/cached-queries";
import { revalidatePath } from "next/cache";
import type { ShareLinkResponse } from "@/types/social";
import { randomBytes } from "crypto";

/**
 * Generate a secure share token for a recipe
 */
export async function generateShareToken(recipeId: string): Promise<{
  error: string | null;
  data: ShareLinkResponse | null;
}> {
  const { user: authUser, error: authError } = await getCachedUser();

  if (authError || !authUser) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  // Verify ownership
  const { data: recipe, error: recipeError } = await supabase
    .from("recipes")
    .select("id, user_id, share_token")
    .eq("id", recipeId)
    .single();

  if (recipeError || !recipe) {
    return { error: "Recipe not found", data: null };
  }

  if (recipe.user_id !== authUser.id) {
    return { error: "You can only share your own recipes", data: null };
  }

  // If token already exists, return it
  if (recipe.share_token) {
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || ""}/shared/${recipe.share_token}`;
    return {
      error: null,
      data: { share_token: recipe.share_token, share_url: shareUrl },
    };
  }

  // Generate new token
  const shareToken = randomBytes(16).toString("hex");

  const { error: updateError } = await supabase
    .from("recipes")
    .update({ share_token: shareToken })
    .eq("id", recipeId);

  if (updateError) {
    return { error: updateError.message, data: null };
  }

  // Log the share event
  await supabase.from("recipe_share_events").insert({
    recipe_id: recipeId,
    event_type: "share_link_created",
    viewer_id: authUser.id,
  });

  revalidatePath(`/app/recipes/${recipeId}`);

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || ""}/shared/${shareToken}`;
  return {
    error: null,
    data: { share_token: shareToken, share_url: shareUrl },
  };
}

/**
 * Revoke a share token (make recipe private again)
 */
export async function revokeShareToken(recipeId: string): Promise<{
  error: string | null;
  success: boolean;
}> {
  const { user: authUser, error: authError } = await getCachedUser();

  if (authError || !authUser) {
    return { error: "Not authenticated", success: false };
  }

  const supabase = await createClient();

  // Verify ownership
  const { data: recipe, error: recipeError } = await supabase
    .from("recipes")
    .select("id, user_id")
    .eq("id", recipeId)
    .single();

  if (recipeError || !recipe) {
    return { error: "Recipe not found", success: false };
  }

  if (recipe.user_id !== authUser.id) {
    return { error: "You can only manage your own recipes", success: false };
  }

  const { error: updateError } = await supabase
    .from("recipes")
    .update({ share_token: null })
    .eq("id", recipeId);

  if (updateError) {
    return { error: updateError.message, success: false };
  }

  revalidatePath(`/app/recipes/${recipeId}`);
  return { error: null, success: true };
}

/**
 * Toggle recipe public status
 * Requires username to be set before making public
 */
export async function toggleRecipePublic(
  recipeId: string,
  isPublic: boolean
): Promise<{
  error: string | null;
  success: boolean;
  requiresUsername?: boolean;
}> {
  const { user: authUser, error: authError } = await getCachedUser();

  if (authError || !authUser) {
    return { error: "Not authenticated", success: false };
  }

  const supabase = await createClient();

  // Verify ownership
  const { data: recipe, error: recipeError } = await supabase
    .from("recipes")
    .select("id, user_id")
    .eq("id", recipeId)
    .single();

  if (recipeError || !recipe) {
    return { error: "Recipe not found", success: false };
  }

  if (recipe.user_id !== authUser.id) {
    return { error: "You can only manage your own recipes", success: false };
  }

  // If making public, verify user has a username set
  if (isPublic) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", authUser.id)
      .single();

    if (!profile?.username) {
      return {
        error: "You need to set a username before sharing recipes publicly",
        success: false,
        requiresUsername: true,
      };
    }
  }

  const { error: updateError } = await supabase
    .from("recipes")
    .update({ is_public: isPublic })
    .eq("id", recipeId);

  if (updateError) {
    return { error: updateError.message, success: false };
  }

  revalidatePath(`/app/recipes/${recipeId}`);
  revalidatePath("/app/discover");
  return { error: null, success: true };
}
