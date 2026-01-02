"use server";

/**
 * Household Cooks Actions
 *
 * CRUD operations for custom cooks (non-user family members) with avatar support.
 */

import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import { revalidatePath } from "next/cache";
import type {
  HouseholdCook,
  CreateCookData,
  UpdateCookData,
} from "@/types/household-cooks";

// Helper to extract error message from various error types
function getErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "An unknown error occurred";
}

/**
 * Get all custom cooks for the current household
 */
export async function getHouseholdCooks(): Promise<{
  error: string | null;
  data: HouseholdCook[] | null;
}> {
  const { household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !household) {
    return { error: authError ? getErrorMessage(authError) : "No household found", data: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("household_cooks")
    .select("*")
    .eq("household_id", household.household_id)
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    return { error: error.message, data: null };
  }

  return { error: null, data: data as HouseholdCook[] };
}

/**
 * Create a new custom cook
 */
export async function createCustomCook(
  cookData: CreateCookData
): Promise<{ error: string | null; data: HouseholdCook | null }> {
  const { household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !household) {
    return { error: authError ? getErrorMessage(authError) : "No household found", data: null };
  }

  if (!cookData.name?.trim()) {
    return { error: "Cook name is required", data: null };
  }

  const supabase = await createClient();

  // Get next display order
  const { data: existingCooks } = await supabase
    .from("household_cooks")
    .select("display_order")
    .eq("household_id", household.household_id)
    .order("display_order", { ascending: false })
    .limit(1);

  const nextOrder = (existingCooks?.[0]?.display_order ?? -1) + 1;

  const { data, error } = await supabase
    .from("household_cooks")
    .insert({
      household_id: household.household_id,
      name: cookData.name.trim(),
      color: cookData.color || null,
      display_order: nextOrder,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "A cook with this name already exists", data: null };
    }
    return { error: error.message, data: null };
  }

  revalidatePath("/app");
  revalidatePath("/app/plan");
  revalidatePath("/app/settings/household");
  return { error: null, data: data as HouseholdCook };
}

/**
 * Update a custom cook
 */
export async function updateCustomCook(
  cookId: string,
  updates: UpdateCookData
): Promise<{ error: string | null }> {
  const { household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !household) {
    return { error: authError ? getErrorMessage(authError) : "No household found" };
  }

  const supabase = await createClient();

  // Build update object
  const updateData: Record<string, unknown> = {};
  if (updates.name !== undefined) updateData.name = updates.name.trim();
  if (updates.color !== undefined) updateData.color = updates.color;
  if (updates.avatar_url !== undefined) updateData.avatar_url = updates.avatar_url;
  if (updates.display_order !== undefined) updateData.display_order = updates.display_order;

  const { error } = await supabase
    .from("household_cooks")
    .update(updateData)
    .eq("id", cookId)
    .eq("household_id", household.household_id);

  if (error) {
    if (error.code === "23505") {
      return { error: "A cook with this name already exists" };
    }
    return { error: error.message };
  }

  revalidatePath("/app");
  revalidatePath("/app/plan");
  revalidatePath("/app/settings/household");
  return { error: null };
}

/**
 * Delete a custom cook (soft delete)
 */
export async function deleteCustomCook(
  cookId: string
): Promise<{ error: string | null }> {
  const { household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !household) {
    return { error: authError ? getErrorMessage(authError) : "No household found" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("household_cooks")
    .update({ is_active: false })
    .eq("id", cookId)
    .eq("household_id", household.household_id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app");
  revalidatePath("/app/plan");
  revalidatePath("/app/settings/household");
  return { error: null };
}

/**
 * Upload avatar for a custom cook
 */
export async function uploadCookAvatar(
  cookId: string,
  formData: FormData
): Promise<{ error: string | null; url: string | null }> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError ? getErrorMessage(authError) : "Not authenticated", url: null };
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

  const supabase = await createClient();

  // Verify cook belongs to this household
  const { data: cook } = await supabase
    .from("household_cooks")
    .select("id")
    .eq("id", cookId)
    .eq("household_id", household.household_id)
    .single();

  if (!cook) {
    return { error: "Cook not found", url: null };
  }

  // Generate unique filename
  const fileExt = file.name.split(".").pop();
  const fileName = `cook-${cookId}-${Date.now()}.${fileExt}`;
  const filePath = `cooks/${fileName}`;

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

  // Update cook with new avatar URL
  const { error: updateError } = await supabase
    .from("household_cooks")
    .update({ avatar_url: publicUrl })
    .eq("id", cookId);

  if (updateError) {
    return { error: updateError.message, url: null };
  }

  revalidatePath("/app");
  revalidatePath("/app/plan");
  revalidatePath("/app/settings/household");
  return { error: null, url: publicUrl };
}

/**
 * Reorder cooks
 */
export async function reorderCooks(
  orderedIds: string[]
): Promise<{ error: string | null }> {
  const { household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !household) {
    return { error: authError ? getErrorMessage(authError) : "No household found" };
  }

  const supabase = await createClient();

  // Update each cook's display_order
  const updates = orderedIds.map((id, index) =>
    supabase
      .from("household_cooks")
      .update({ display_order: index })
      .eq("id", id)
      .eq("household_id", household.household_id)
  );

  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);

  if (failed?.error) {
    return { error: failed.error.message };
  }

  revalidatePath("/app");
  revalidatePath("/app/plan");
  revalidatePath("/app/settings/household");
  return { error: null };
}
