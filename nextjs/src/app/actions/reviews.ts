"use server";

import { createClient } from "@/lib/supabase/server";
import type { Review, ReviewFormData } from "@/types/social";

// Create a review
export async function createReview(
  recipeId: string,
  data: ReviewFormData
): Promise<{ data: Review | null; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "You must be signed in to leave a review" };
  }

  // Check that recipe exists and is public
  const { data: recipe } = await supabase
    .from("recipes")
    .select("id, user_id, is_public")
    .eq("id", recipeId)
    .single();

  if (!recipe) {
    return { data: null, error: "Recipe not found" };
  }

  if (!recipe.is_public) {
    return { data: null, error: "Can only review public recipes" };
  }

  if (recipe.user_id === user.id) {
    return { data: null, error: "Cannot review your own recipe" };
  }

  // Handle photo upload if provided
  let photoUrl: string | null = null;
  if (data.photo) {
    const fileExt = data.photo.name.split(".").pop();
    const fileName = `${user.id}/${recipeId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("review-photos")
      .upload(fileName, data.photo);

    if (uploadError) {
      console.error("Failed to upload review photo:", uploadError);
    } else {
      const { data: urlData } = supabase.storage
        .from("review-photos")
        .getPublicUrl(fileName);
      photoUrl = urlData.publicUrl;
    }
  }

  const { data: review, error } = await supabase
    .from("reviews")
    .insert({
      recipe_id: recipeId,
      user_id: user.id,
      rating: data.rating,
      title: data.title || null,
      content: data.content || null,
      photo_url: photoUrl,
    })
    .select(
      `
      *,
      author:profiles!reviews_user_id_fkey (
        id,
        username,
        avatar_url
      )
    `
    )
    .single();

  if (error) {
    if (error.code === "23505") {
      return { data: null, error: "You have already reviewed this recipe" };
    }
    console.error("Error creating review:", error);
    return { data: null, error: error.message };
  }

  // Create activity feed event
  await supabase.from("activity_feed_events").insert({
    actor_id: user.id,
    event_type: "review",
    recipe_id: recipeId,
    is_public: true,
  });

  return {
    data: {
      ...review,
      author: review.author as Review["author"],
      is_helpful: false,
    },
    error: null,
  };
}

// Update a review
export async function updateReview(
  reviewId: string,
  data: Partial<ReviewFormData>
): Promise<{ data: Review | null; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "You must be signed in" };
  }

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (data.rating !== undefined) updateData.rating = data.rating;
  if (data.title !== undefined) updateData.title = data.title || null;
  if (data.content !== undefined) updateData.content = data.content || null;

  const { data: review, error } = await supabase
    .from("reviews")
    .update(updateData)
    .eq("id", reviewId)
    .eq("user_id", user.id)
    .select(
      `
      *,
      author:profiles!reviews_user_id_fkey (
        id,
        username,
        avatar_url
      )
    `
    )
    .single();

  if (error) {
    console.error("Error updating review:", error);
    return { data: null, error: error.message };
  }

  return {
    data: {
      ...review,
      author: review.author as Review["author"],
      is_helpful: false,
    },
    error: null,
  };
}

// Delete a review
export async function deleteReview(
  reviewId: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be signed in" };
  }

  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", reviewId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting review:", error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

// Get reviews for a recipe
export async function getRecipeReviews(
  recipeId: string,
  options?: { limit?: number; offset?: number }
): Promise<{ data: Review[] | null; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase.rpc("get_recipe_reviews", {
    p_recipe_id: recipeId,
    p_limit: options?.limit ?? 10,
    p_offset: options?.offset ?? 0,
    p_user_id: user?.id ?? null,
  });

  if (error) {
    console.error("Error fetching reviews:", error);
    return { data: null, error: error.message };
  }

  // Transform to Review type
  const reviews: Review[] = (data || []).map((r: {
    id: string;
    recipe_id: string;
    user_id: string;
    rating: number;
    title: string | null;
    content: string | null;
    photo_url: string | null;
    helpful_count: number;
    is_helpful: boolean;
    created_at: string;
    updated_at: string;
    author_id: string;
    author_username: string;
    author_avatar_url: string | null;
    response_content: string | null;
    response_created_at: string | null;
  }) => ({
    id: r.id,
    recipe_id: r.recipe_id,
    user_id: r.user_id,
    rating: r.rating,
    title: r.title,
    content: r.content,
    photo_url: r.photo_url,
    helpful_count: r.helpful_count,
    is_helpful: r.is_helpful,
    created_at: r.created_at,
    updated_at: r.updated_at,
    author: {
      id: r.author_id,
      username: r.author_username,
      avatar_url: r.author_avatar_url,
    },
    response: r.response_content
      ? {
          id: "", // Not returned by function
          review_id: r.id,
          user_id: "", // Not returned by function
          content: r.response_content,
          created_at: r.response_created_at || "",
        }
      : null,
  }));

  return { data: reviews, error: null };
}

// Mark a review as helpful
export async function markReviewHelpful(
  reviewId: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be signed in" };
  }

  const { error } = await supabase.from("review_helpful_votes").insert({
    review_id: reviewId,
    user_id: user.id,
  });

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "Already marked as helpful" };
    }
    console.error("Error marking review helpful:", error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

// Unmark a review as helpful
export async function unmarkReviewHelpful(
  reviewId: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be signed in" };
  }

  const { error } = await supabase
    .from("review_helpful_votes")
    .delete()
    .eq("review_id", reviewId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error unmarking review helpful:", error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

// Respond to a review (recipe owner only)
export async function respondToReview(
  reviewId: string,
  content: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be signed in" };
  }

  // Verify user owns the recipe
  const { data: review } = await supabase
    .from("reviews")
    .select(
      `
      id,
      recipe:recipes!inner (
        user_id
      )
    `
    )
    .eq("id", reviewId)
    .single();

  if (!review) {
    return { success: false, error: "Review not found" };
  }

  const recipeUserId = (review.recipe as unknown as { user_id: string }).user_id;
  if (recipeUserId !== user.id) {
    return { success: false, error: "Only the recipe owner can respond" };
  }

  const { error } = await supabase.from("review_responses").upsert(
    {
      review_id: reviewId,
      user_id: user.id,
      content,
    },
    {
      onConflict: "review_id",
    }
  );

  if (error) {
    console.error("Error responding to review:", error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

// Delete a review response
export async function deleteReviewResponse(
  reviewId: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be signed in" };
  }

  const { error } = await supabase
    .from("review_responses")
    .delete()
    .eq("review_id", reviewId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting review response:", error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}
