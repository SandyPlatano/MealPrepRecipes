"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedUser } from "@/lib/supabase/cached-queries";
import type { ShareAnalytics } from "@/types/social";
import { createHash } from "crypto";

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
