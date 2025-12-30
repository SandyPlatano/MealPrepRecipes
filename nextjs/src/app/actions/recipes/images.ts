"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import { randomUUID } from "crypto";

/**
 * Upload recipe image to Supabase Storage
 */
export async function uploadRecipeImage(formData: FormData) {
  const { user, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user) {
    return { error: "Not authenticated", data: null };
  }

  const file = formData.get("file") as File;
  if (!file) {
    return { error: "No file provided", data: null };
  }

  // Validate file type
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
  if (!validTypes.includes(file.type)) {
    return { error: "Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.", data: null };
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { error: "File too large. Maximum size is 5MB.", data: null };
  }

  const supabase = await createClient();

  // Generate unique filename
  const fileExt = file.name.split(".").pop();
  const fileName = `${user.id}/${randomUUID()}.${fileExt}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from("recipe-images")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    return { error: error.message, data: null };
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from("recipe-images")
    .getPublicUrl(fileName);

  return { error: null, data: { path: data.path, url: publicUrl } };
}

/**
 * Delete recipe image from Supabase Storage
 */
export async function deleteRecipeImage(imagePath: string) {
  const { user, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

  const { error } = await supabase.storage
    .from("recipe-images")
    .remove([imagePath]);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}
