"use server";

/**
 * Dietary Restriction Settings Actions
 *
 * Actions for managing custom dietary restrictions.
 */

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Add a custom dietary restriction to the user's settings
 */
export async function addCustomDietaryRestriction(
  restriction: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  const trimmed = restriction.trim();
  if (!trimmed) {
    return { error: "Restriction cannot be empty" };
  }

  const { data: settings } = await supabase
    .from("user_settings")
    .select("custom_dietary_restrictions")
    .eq("user_id", user.id)
    .maybeSingle();

  const current = settings?.custom_dietary_restrictions || [];

  // Check for duplicates (case-insensitive)
  if (current.some((r: string) => r.toLowerCase() === trimmed.toLowerCase())) {
    return { error: "This restriction already exists" };
  }

  const updated = [...current, trimmed];

  const { error } = await supabase
    .from("user_settings")
    .update({ custom_dietary_restrictions: updated })
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings");
  revalidatePath("/app/settings/dietary");
  return { error: null };
}

/**
 * Remove a custom dietary restriction from the user's settings
 */
export async function removeCustomDietaryRestriction(
  restriction: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  const { data: settings } = await supabase
    .from("user_settings")
    .select("custom_dietary_restrictions")
    .eq("user_id", user.id)
    .maybeSingle();

  const current = settings?.custom_dietary_restrictions || [];
  const updated = current.filter((r: string) => r !== restriction);

  const { error } = await supabase
    .from("user_settings")
    .update({ custom_dietary_restrictions: updated })
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings");
  revalidatePath("/app/settings/dietary");
  return { error: null };
}
