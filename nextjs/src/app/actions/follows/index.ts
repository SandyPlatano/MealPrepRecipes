"use server";

import { createClient } from "@/lib/supabase/server";
import type { UserProfile, ActivityFeedItem } from "@/types/social";

export async function followUser(
  userId: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be signed in to follow users" };
  }

  if (user.id === userId) {
    return { success: false, error: "Cannot follow yourself" };
  }

  const { error } = await supabase.from("follows").insert({
    follower_id: user.id,
    following_id: userId,
  });

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "Already following this user" };
    }
    console.error("Error following user:", error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

export async function unfollowUser(
  userId: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be signed in" };
  }

  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", user.id)
    .eq("following_id", userId);

  if (error) {
    console.error("Error unfollowing user:", error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

export async function isFollowingUser(
  userId: string
): Promise<{ isFollowing: boolean; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { isFollowing: false, error: null };
  }

  const { data, error } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("follower_id", user.id)
    .eq("following_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error checking follow status:", error);
    return { isFollowing: false, error: error.message };
  }

  return { isFollowing: !!data, error: null };
}

export async function getFollowers(
  userId: string,
  options?: { limit?: number; offset?: number }
): Promise<{ data: UserProfile[] | null; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const limit = options?.limit ?? 20;
  const offset = options?.offset ?? 0;

  const { data, error } = await supabase
    .from("follows")
    .select(
      `
      follower:profiles!follows_follower_id_fkey (
        id,
        username,
        first_name,
        last_name,
        bio,
        avatar_url,
        public_profile,
        follower_count,
        following_count
      )
    `
    )
    .eq("following_id", userId)
    .range(offset, offset + limit - 1)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching followers:", error);
    return { data: null, error: error.message };
  }

  const followingSet = new Set<string>();

  if (user) {
    const { data: following } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id);

    if (following) {
      following.forEach((f) => followingSet.add(f.following_id));
    }
  }

  const profiles: UserProfile[] = (data || []).map((item) => {
    const f = item.follower as unknown as {
      id: string;
      username: string;
      first_name: string | null;
      last_name: string | null;
      bio: string | null;
      avatar_url: string | null;
      public_profile: boolean;
      follower_count: number;
      following_count: number;
    };
    return {
      id: f.id,
      username: f.username,
      name: [f.first_name, f.last_name].filter(Boolean).join(" ") || null,
      first_name: f.first_name,
      last_name: f.last_name,
      bio: f.bio,
      avatar_url: f.avatar_url,
      public_profile: f.public_profile,
      follower_count: f.follower_count,
      following_count: f.following_count,
      is_following: followingSet.has(f.id),
      created_at: "",
    };
  });

  return { data: profiles, error: null };
}

export async function getFollowing(
  userId: string,
  options?: { limit?: number; offset?: number }
): Promise<{ data: UserProfile[] | null; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const limit = options?.limit ?? 20;
  const offset = options?.offset ?? 0;

  const { data, error } = await supabase
    .from("follows")
    .select(
      `
      following:profiles!follows_following_id_fkey (
        id,
        username,
        first_name,
        last_name,
        bio,
        avatar_url,
        public_profile,
        follower_count,
        following_count
      )
    `
    )
    .eq("follower_id", userId)
    .range(offset, offset + limit - 1)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching following:", error);
    return { data: null, error: error.message };
  }

  const followingSet = new Set<string>();

  if (user) {
    const { data: following } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id);

    if (following) {
      following.forEach((f) => followingSet.add(f.following_id));
    }
  }

  const profiles: UserProfile[] = (data || []).map((item) => {
    const f = item.following as unknown as {
      id: string;
      username: string;
      first_name: string | null;
      last_name: string | null;
      bio: string | null;
      avatar_url: string | null;
      public_profile: boolean;
      follower_count: number;
      following_count: number;
    };
    return {
      id: f.id,
      username: f.username,
      name: [f.first_name, f.last_name].filter(Boolean).join(" ") || null,
      first_name: f.first_name,
      last_name: f.last_name,
      bio: f.bio,
      avatar_url: f.avatar_url,
      public_profile: f.public_profile,
      follower_count: f.follower_count,
      following_count: f.following_count,
      is_following: followingSet.has(f.id),
      created_at: "",
    };
  });

  return { data: profiles, error: null };
}

export async function getActivityFeed(options?: {
  limit?: number;
  offset?: number;
}): Promise<{ data: ActivityFeedItem[] | null; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "You must be signed in to view the feed" };
  }

  const { data, error } = await supabase.rpc("get_activity_feed", {
    p_user_id: user.id,
    p_limit: options?.limit ?? 20,
    p_offset: options?.offset ?? 0,
  });

  if (error) {
    console.error("Error fetching activity feed:", error);
    return { data: null, error: error.message };
  }

  const items: ActivityFeedItem[] = (data || []).map((item: {
    id: string;
    actor_id: string;
    event_type: "new_recipe" | "review" | "cook_logged";
    recipe_id: string | null;
    is_public: boolean;
    created_at: string;
    actor_username: string;
    actor_avatar_url: string | null;
    recipe_title: string | null;
    recipe_image_url: string | null;
  }) => ({
    id: item.id,
    actor_id: item.actor_id,
    event_type: item.event_type,
    recipe_id: item.recipe_id,
    is_public: item.is_public,
    created_at: item.created_at,
    actor: {
      id: item.actor_id,
      username: item.actor_username,
      avatar_url: item.actor_avatar_url,
    },
    recipe: item.recipe_id
      ? {
          id: item.recipe_id,
          title: item.recipe_title || "",
          image_url: item.recipe_image_url,
        }
      : null,
  }));

  return { data: items, error: null };
}

export async function getUserByUsername(
  username: string
): Promise<{ data: UserProfile | null; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      username,
      first_name,
      last_name,
      bio,
      avatar_url,
      public_profile,
      follower_count,
      following_count,
      created_at
    `
    )
    .eq("username", username)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return { data: null, error: "User not found" };
    }
    console.error("Error fetching user:", error);
    return { data: null, error: error.message };
  }

  let isFollowing = false;
  if (user && user.id !== data.id) {
    const { data: follow } = await supabase
      .from("follows")
      .select("follower_id")
      .eq("follower_id", user.id)
      .eq("following_id", data.id)
      .single();

    isFollowing = !!follow;
  }

  const { count } = await supabase
    .from("recipes")
    .select("id", { count: "exact", head: true })
    .eq("user_id", data.id)
    .eq("is_public", true);

  const profile: UserProfile = {
    id: data.id,
    username: data.username,
    first_name: data.first_name,
    last_name: data.last_name,
    bio: data.bio,
    avatar_url: data.avatar_url,
    public_profile: data.public_profile,
    follower_count: data.follower_count,
    following_count: data.following_count,
    public_recipe_count: count || 0,
    is_following: isFollowing,
    created_at: data.created_at,
  };

  return { data: profile, error: null };
}

export async function getUserPublicRecipes(
  userId: string,
  options?: { limit?: number; offset?: number }
): Promise<{
  data: { id: string; title: string; image_url: string | null; view_count: number }[] | null;
  error: string | null;
}> {
  const supabase = await createClient();

  const limit = options?.limit ?? 20;
  const offset = options?.offset ?? 0;

  const { data, error } = await supabase
    .from("recipes")
    .select("id, title, image_url, view_count")
    .eq("user_id", userId)
    .eq("is_public", true)
    .eq("hidden_from_public", false)
    .range(offset, offset + limit - 1)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user recipes:", error);
    return { data: null, error: error.message };
  }

  return { data: data || [], error: null };
}
