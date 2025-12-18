"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedUser } from "@/lib/supabase/cached-queries";
import { revalidatePath } from "next/cache";
import type {
  ProfileCustomizationSettings,
  ProfilePrivacySettings,
  CookWithMeStatus,
  CookingSkillLevel,
} from "@/types/settings";

// Get profile customization settings
export async function getProfileCustomization() {
  const { user, error: authError } = await getCachedUser();

  if (authError || !user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      `
      bio,
      cooking_philosophy,
      profile_emoji,
      currently_craving,
      cook_with_me_status,
      favorite_cuisine,
      cooking_skill_level,
      location,
      website_url,
      profile_accent_color,
      avatar_url,
      cover_image_url
    `
    )
    .eq("id", user.id)
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  return { error: null, data: profile };
}

// Update profile customization settings
export async function updateProfileCustomization(
  settings: Partial<ProfileCustomizationSettings>
) {
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
      bio: settings.bio,
      cooking_philosophy: settings.cooking_philosophy,
      profile_emoji: settings.profile_emoji,
      currently_craving: settings.currently_craving,
      cook_with_me_status: settings.cook_with_me_status as CookWithMeStatus,
      favorite_cuisine: settings.favorite_cuisine,
      cooking_skill_level: settings.cooking_skill_level as CookingSkillLevel,
      location: settings.location,
      website_url: settings.website_url,
      profile_accent_color: settings.profile_accent_color,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings/profile");
  revalidatePath("/app");
  return { error: null };
}

// Get privacy settings
export async function getProfilePrivacy() {
  const { user, error: authError } = await getCachedUser();

  if (authError || !user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      `
      public_profile,
      show_cooking_stats,
      show_badges,
      show_cook_photos,
      show_reviews,
      show_saved_recipes
    `
    )
    .eq("id", user.id)
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  return { error: null, data: profile };
}

// Update privacy settings
export async function updateProfilePrivacy(settings: Partial<ProfilePrivacySettings>) {
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
      public_profile: settings.public_profile,
      show_cooking_stats: settings.show_cooking_stats,
      show_badges: settings.show_badges,
      show_cook_photos: settings.show_cook_photos,
      show_reviews: settings.show_reviews,
      show_saved_recipes: settings.show_saved_recipes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings/profile");
  revalidatePath("/app");
  return { error: null };
}

// Upload avatar image
export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated", url: null };
  }

  const file = formData.get("avatar") as File;
  if (!file) {
    return { error: "No file provided", url: null };
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    return { error: "File must be an image", url: null };
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { error: "File size must be less than 5MB", url: null };
  }

  // Generate unique filename
  const fileExt = file.name.split(".").pop();
  const fileName = `${user.id}-${Date.now()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from("profile-images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    return { error: uploadError.message, url: null };
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("profile-images").getPublicUrl(filePath);

  // Update profile with new avatar URL
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      avatar_url: publicUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (updateError) {
    return { error: updateError.message, url: null };
  }

  revalidatePath("/app/settings/profile");
  revalidatePath("/app");
  return { error: null, url: publicUrl };
}

// Upload cover image
export async function uploadCoverImage(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated", url: null };
  }

  const file = formData.get("cover") as File;
  if (!file) {
    return { error: "No file provided", url: null };
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    return { error: "File must be an image", url: null };
  }

  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return { error: "File size must be less than 10MB", url: null };
  }

  // Generate unique filename
  const fileExt = file.name.split(".").pop();
  const fileName = `${user.id}-cover-${Date.now()}.${fileExt}`;
  const filePath = `covers/${fileName}`;

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from("profile-images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    return { error: uploadError.message, url: null };
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("profile-images").getPublicUrl(filePath);

  // Update profile with new cover image URL
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      cover_image_url: publicUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (updateError) {
    return { error: updateError.message, url: null };
  }

  revalidatePath("/app/settings/profile");
  revalidatePath("/app");
  return { error: null, url: publicUrl };
}
