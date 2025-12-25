"use server";

/**
 * Profile Settings Actions
 *
 * Actions for managing user profile data.
 */

import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import { revalidatePath } from "next/cache";

/**
 * Get user profile
 */
export async function getProfile() {
  const { user } = await getCachedUserWithHousehold();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      "id, email, first_name, last_name, avatar_url, cover_image_url, username, bio, cooking_philosophy, profile_emoji, currently_craving, cook_with_me_status, favorite_cuisine, cooking_skill, location, website_url, public_profile, show_cooking_stats, show_badges, show_cook_photos, show_reviews, show_saved_recipes, profile_accent_color, created_at, updated_at"
    )
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return { error: error.message, data: null };
  }

  return { error: null, data: profile };
}

/**
 * Update user profile
 */
export async function updateProfile(firstName: string, lastName: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: firstName,
      last_name: lastName,
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings");
  revalidatePath("/app");
  return { error: null };
}
