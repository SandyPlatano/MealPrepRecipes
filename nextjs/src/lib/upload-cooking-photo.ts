import { createClient } from "@/lib/supabase/client";

/**
 * Upload a cooking history photo to Supabase storage (client-side).
 * Returns the public URL of the uploaded photo.
 */
export async function uploadCookingPhoto(file: File): Promise<string | null> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${user.id}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("cooking-history-photos")
    .upload(fileName, file);

  if (uploadError) {
    console.error("Error uploading photo:", uploadError);
    throw new Error("Failed to upload photo");
  }

  const { data: urlData } = supabase.storage
    .from("cooking-history-photos")
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

/**
 * Delete a cooking history photo from Supabase storage (client-side).
 */
export async function deleteCookingPhoto(photoUrl: string): Promise<void> {
  const supabase = createClient();

  const urlParts = photoUrl.split("/cooking-history-photos/");
  if (!urlParts[1]) return;

  const { error } = await supabase.storage
    .from("cooking-history-photos")
    .remove([urlParts[1]]);

  if (error) {
    console.error("Error deleting photo:", error);
  }
}
