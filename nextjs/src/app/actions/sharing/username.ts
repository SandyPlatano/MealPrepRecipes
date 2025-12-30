"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedUser } from "@/lib/supabase/cached-queries";
import { revalidatePath } from "next/cache";
import type { UserProfile } from "@/types/social";

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
