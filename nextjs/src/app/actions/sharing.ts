"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedUser, getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import { revalidatePath } from "next/cache";
import type { Recipe } from "@/types/recipe";
import type { ShareLinkResponse, ShareAnalytics, UserProfile } from "@/types/social";
import { randomBytes, createHash } from "crypto";

// ============================================
// SHARE TOKEN MANAGEMENT
// ============================================

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

// ============================================
// PUBLIC TOGGLE
// ============================================

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

// ============================================
// GUEST ACCESS (NO AUTH REQUIRED)
// ============================================

/**
 * Get a recipe by share token (for guest viewing)
 * This can be called without authentication
 */
export async function getRecipeByShareToken(token: string): Promise<{
  error: string | null;
  data: (Recipe & { author?: { username: string; avatar_url: string | null } }) | null;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("recipes")
    .select(`
      *,
      profiles:user_id (
        username,
        avatar_url
      )
    `)
    .eq("share_token", token)
    .single();

  if (error || !data) {
    return { error: "Recipe not found or link has expired", data: null };
  }

  // Transform the data to include author info
  const { profiles, ...recipeData } = data;
  return {
    error: null,
    data: {
      ...recipeData,
      author: profiles
        ? {
            username: profiles.username || "Anonymous",
            avatar_url: profiles.avatar_url,
          }
        : undefined,
    } as Recipe & { author?: { username: string; avatar_url: string | null } },
  };
}

/**
 * Get a public recipe by ID (for guest viewing)
 */
export async function getPublicRecipe(recipeId: string): Promise<{
  error: string | null;
  data: (Recipe & { author?: { username: string; avatar_url: string | null } }) | null;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("recipes")
    .select(`
      *,
      profiles:user_id (
        username,
        avatar_url
      )
    `)
    .eq("id", recipeId)
    .eq("is_public", true)
    .single();

  if (error || !data) {
    return { error: "Recipe not found or is private", data: null };
  }

  const { profiles, ...recipeData } = data;
  return {
    error: null,
    data: {
      ...recipeData,
      author: profiles
        ? {
            username: profiles.username || "Anonymous",
            avatar_url: profiles.avatar_url,
          }
        : undefined,
    } as Recipe & { author?: { username: string; avatar_url: string | null } },
  };
}

// ============================================
// VIEW TRACKING
// ============================================

/**
 * Track a recipe view (rate-limited per IP)
 * Can be called without authentication
 */
export async function trackRecipeView(
  recipeId: string,
  ipAddress?: string,
  referrer?: string,
  userAgent?: string
): Promise<{ error: string | null; counted: boolean }> {
  const supabase = await createClient();

  // Hash the IP address for privacy
  const ipHash = ipAddress
    ? createHash("sha256").update(ipAddress).digest("hex").substring(0, 32)
    : null;

  // Try to get current user (optional)
  let viewerId: string | null = null;
  try {
    const { user } = await getCachedUser();
    viewerId = user?.id || null;
  } catch {
    // Guest user, no viewer ID
  }

  // Call the rate-limited view function
  const { data, error } = await supabase.rpc("increment_recipe_view", {
    p_recipe_id: recipeId,
    p_ip_hash: ipHash,
    p_viewer_id: viewerId,
    p_referrer: referrer?.substring(0, 500) || null,
    p_user_agent: userAgent?.substring(0, 500) || null,
  });

  if (error) {
    console.error("Failed to track view:", error);
    return { error: error.message, counted: false };
  }

  return { error: null, counted: data === true };
}

// ============================================
// SHARE ANALYTICS
// ============================================

/**
 * Get share analytics for a recipe (owner only)
 */
export async function getShareAnalytics(recipeId: string): Promise<{
  error: string | null;
  data: ShareAnalytics | null;
}> {
  const { user: authUser, error: authError } = await getCachedUser();

  if (authError || !authUser) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  // Verify ownership
  const { data: recipe, error: recipeError } = await supabase
    .from("recipes")
    .select("id, user_id, view_count")
    .eq("id", recipeId)
    .single();

  if (recipeError || !recipe) {
    return { error: "Recipe not found", data: null };
  }

  if (recipe.user_id !== authUser.id) {
    return { error: "You can only view analytics for your own recipes", data: null };
  }

  // Get detailed analytics
  const { data: events, error: eventsError } = await supabase
    .from("recipe_share_events")
    .select("event_type, viewer_id")
    .eq("recipe_id", recipeId);

  if (eventsError) {
    return { error: eventsError.message, data: null };
  }

  const analytics: ShareAnalytics = {
    total_views: recipe.view_count || 0,
    unique_views: new Set(
      events?.filter((e) => e.event_type === "view").map((e) => e.viewer_id)
    ).size,
    copies: events?.filter((e) => e.event_type === "copy_recipe").length || 0,
    signups_from_share:
      events?.filter((e) => e.event_type === "signup_from_share").length || 0,
  };

  return { error: null, data: analytics };
}

// ============================================
// USERNAME MANAGEMENT
// ============================================

/**
 * Check if a username is available
 */
export async function checkUsernameAvailable(username: string): Promise<{
  error: string | null;
  available: boolean;
  suggestion?: string;
}> {
  // Validate format
  const usernameRegex = /^[a-z0-9_]{3,30}$/;
  const normalizedUsername = username.toLowerCase();

  if (!usernameRegex.test(normalizedUsername)) {
    return {
      error: "Username must be 3-30 characters, lowercase letters, numbers, and underscores only",
      available: false,
    };
  }

  if (/^[0-9]/.test(normalizedUsername)) {
    return { error: "Username cannot start with a number", available: false };
  }

  const reserved = [
    "admin",
    "moderator",
    "support",
    "help",
    "system",
    "official",
    "staff",
    "null",
    "undefined",
  ];
  if (reserved.includes(normalizedUsername)) {
    return { error: "This username is reserved", available: false };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("username")
    .eq("username", normalizedUsername)
    .maybeSingle();

  if (error) {
    return { error: error.message, available: false };
  }

  if (data) {
    // Suggest alternative
    const suggestion = `${normalizedUsername}${Math.floor(Math.random() * 1000)}`;
    return { error: null, available: false, suggestion };
  }

  return { error: null, available: true };
}

/**
 * Set or update username
 */
export async function setUsername(username: string): Promise<{
  error: string | null;
  success: boolean;
}> {
  const { user: authUser, error: authError } = await getCachedUser();

  if (authError || !authUser) {
    return { error: "Not authenticated", success: false };
  }

  const normalizedUsername = username.toLowerCase();

  // Check availability
  const { available, error: checkError } = await checkUsernameAvailable(
    normalizedUsername
  );
  if (checkError || !available) {
    return { error: checkError || "Username is not available", success: false };
  }

  const supabase = await createClient();

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ username: normalizedUsername })
    .eq("id", authUser.id);

  if (updateError) {
    return { error: updateError.message, success: false };
  }

  revalidatePath("/app/settings");
  return { error: null, success: true };
}

/**
 * Get user's current profile for sharing
 */
export async function getCurrentUserProfile(): Promise<{
  error: string | null;
  data: UserProfile | null;
}> {
  const { user: authUser, error: authError } = await getCachedUser();

  if (authError || !authUser) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, name, first_name, last_name, bio, avatar_url, public_profile, follower_count, following_count, created_at")
    .eq("id", authUser.id)
    .single();

  if (error || !data) {
    return { error: error?.message || "Profile not found", data: null };
  }

  return {
    error: null,
    data: {
      id: data.id,
      username: data.username || "",
      name: data.name,
      first_name: data.first_name,
      last_name: data.last_name,
      bio: data.bio,
      avatar_url: data.avatar_url,
      public_profile: data.public_profile || false,
      follower_count: data.follower_count || 0,
      following_count: data.following_count || 0,
      created_at: data.created_at,
    } as UserProfile,
  };
}

// ============================================
// COPY RECIPE
// ============================================

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
