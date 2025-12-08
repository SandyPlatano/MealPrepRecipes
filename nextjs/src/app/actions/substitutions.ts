"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import { revalidatePath } from "next/cache";

export interface UserSubstitutionFormData {
  original_ingredient: string;
  substitute_ingredient: string;
  notes?: string;
}

// Create a user substitution
export async function createUserSubstitution(formData: UserSubstitutionFormData) {
  const { user, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_substitutions")
    .insert({
      user_id: user.id,
      original_ingredient: formData.original_ingredient.trim(),
      substitute_ingredient: formData.substitute_ingredient.trim(),
      notes: formData.notes?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  revalidatePath("/app/settings");
  return { error: null, data };
}

// Update a user substitution
export async function updateUserSubstitution(
  id: string,
  formData: Partial<UserSubstitutionFormData>
) {
  const { user, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  const updateData: Record<string, unknown> = {};
  if (formData.original_ingredient !== undefined)
    updateData.original_ingredient = formData.original_ingredient.trim();
  if (formData.substitute_ingredient !== undefined)
    updateData.substitute_ingredient = formData.substitute_ingredient.trim();
  if (formData.notes !== undefined)
    updateData.notes = formData.notes?.trim() || null;

  const { data, error } = await supabase
    .from("user_substitutions")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  revalidatePath("/app/settings");
  return { error: null, data };
}

// Delete a user substitution
export async function deleteUserSubstitution(id: string) {
  const { user, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("user_substitutions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings");
  return { error: null };
}

