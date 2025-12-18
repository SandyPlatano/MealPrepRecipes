"use server";

import { createClient } from "@/lib/supabase/server";
import type {
  PublicProfile,
  CookingStreak,
  CookPhoto,
  ProfileReview,
  PublicCollection,
} from "@/types/profile";

// ============================================
// PUBLIC PROFILE
// ============================================

export async function getPublicProfile(
  username: string
): Promise<{ data: PublicProfile | null; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase.rpc("get_public_profile", {
    p_username: username,
  });

  if (error) {
    console.error("Error fetching public profile:", error);
    return { data: null, error: error.message };
  }

  if (!data || data.length === 0) {
    return { data: null, error: "Profile not found or not public" };
  }

  const profileData = data[0];

  // Check if current user is following this profile
  let isFollowing = false;
  if (user && user.id !== profileData.id) {
    const { data: followData } = await supabase
      .from("follows")
      .select("follower_id")
      .eq("follower_id", user.id)
      .eq("following_id", profileData.id)
      .single();

    isFollowing = !!followData;
  }

  const profile: PublicProfile = {
    id: profileData.id,
    username: profileData.username,
    first_name: profileData.first_name,
    last_name: profileData.last_name,
    avatar_url: profileData.avatar_url,
    cover_image_url: profileData.cover_image_url,
    bio: profileData.bio,
    cooking_philosophy: profileData.cooking_philosophy,
    location: profileData.location,
    website: profileData.website,
    favorite_cuisine: profileData.favorite_cuisine,
    cooking_skill: profileData.cooking_skill,
    cook_with_me_status: profileData.cook_with_me_status,
    currently_craving: profileData.currently_craving,
    profile_theme: profileData.profile_theme,
    profile_emoji: profileData.profile_emoji,
    follower_count: profileData.follower_count,
    following_count: profileData.following_count,
    public_recipe_count: profileData.public_recipe_count,
    total_cooks: profileData.total_cooks,
    created_at: profileData.created_at,
    show_cooking_stats: profileData.show_cooking_stats,
    show_badges: profileData.show_badges,
    show_cook_photos: profileData.show_cook_photos,
    show_reviews: profileData.show_reviews,
    show_saved_recipes: profileData.show_saved_recipes,
    is_following: isFollowing,
  };

  return { data: profile, error: null };
}

// ============================================
// COOKING STATS
// ============================================

export async function getProfileStats(
  userId: string
): Promise<{ data: CookingStreak | null; error: string | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cooking_streaks")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No streak data yet
      return {
        data: {
          current_streak_days: 0,
          longest_streak_days: 0,
          total_meals_cooked: 0,
          total_recipes_tried: 0,
          weekly_target: 0,
          current_week_count: 0,
        },
        error: null,
      };
    }
    console.error("Error fetching cooking stats:", error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

// ============================================
// COOK PHOTOS (I Made It Gallery)
// ============================================

export async function getCookPhotos(
  userId: string,
  limit: number = 12
): Promise<{ data: CookPhoto[] | null; error: string | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_profile_cook_photos", {
    p_user_id: userId,
    p_limit: limit,
  });

  if (error) {
    console.error("Error fetching cook photos:", error);
    return { data: null, error: error.message };
  }

  const photos: CookPhoto[] = (data || []).map((photo: {
    id: string;
    photo_url: string;
    caption: string | null;
    recipe_id: string;
    recipe_title: string;
    recipe_image_url: string | null;
    created_at: string;
    rating: number | null;
  }) => ({
    id: photo.id,
    photo_url: photo.photo_url,
    caption: photo.caption,
    recipe_id: photo.recipe_id,
    recipe_title: photo.recipe_title,
    recipe_image_url: photo.recipe_image_url,
    like_count: 0, // Placeholder for future feature
    created_at: photo.created_at,
  }));

  return { data: photos, error: null };
}

// ============================================
// PUBLIC COLLECTIONS
// ============================================

export async function getPublicCollections(
  userId: string
): Promise<{ data: PublicCollection[] | null; error: string | null }> {
  const supabase = await createClient();

  // For now, returning empty array as collections are a future feature
  // This would query recipe_collections table when implemented
  return { data: [], error: null };
}

// ============================================
// PROFILE REVIEWS
// ============================================

export async function getProfileReviews(
  userId: string,
  limit: number = 10
): Promise<{ data: ProfileReview[] | null; error: string | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_profile_reviews", {
    p_user_id: userId,
    p_limit: limit,
  });

  if (error) {
    console.error("Error fetching profile reviews:", error);
    return { data: null, error: error.message };
  }

  const reviews: ProfileReview[] = (data || []).map((review: {
    id: string;
    recipe_id: string;
    recipe_title: string;
    recipe_image_url: string | null;
    rating: number;
    title: string | null;
    content: string | null;
    created_at: string;
    helpful_count: number;
  }) => ({
    id: review.id,
    recipe_id: review.recipe_id,
    recipe_title: review.recipe_title,
    recipe_image_url: review.recipe_image_url,
    rating: review.rating,
    title: review.title,
    content: review.content,
    created_at: review.created_at,
    helpful_count: review.helpful_count,
  }));

  return { data: reviews, error: null };
}

// ============================================
// PUBLIC RECIPES
// ============================================

export async function getPublicRecipes(
  userId: string,
  options?: { limit?: number; offset?: number }
): Promise<{
  data: {
    id: string;
    title: string;
    image_url: string | null;
    recipe_type: string;
    category: string | null;
    avg_rating: number | null;
    review_count: number;
    view_count: number;
    created_at: string;
  }[] | null;
  error: string | null;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "get_user_public_recipes_for_profile",
    {
      p_user_id: userId,
      p_limit: options?.limit ?? 12,
      p_offset: options?.offset ?? 0,
    }
  );

  if (error) {
    console.error("Error fetching public recipes:", error);
    return { data: null, error: error.message };
  }

  return { data: data || [], error: null };
}
