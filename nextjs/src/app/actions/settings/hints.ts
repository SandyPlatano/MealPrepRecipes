"use server";

/**
 * Hint Management Actions
 *
 * Actions for dismissing and resetting contextual hints.
 */

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Dismiss a contextual hint
 */
export async function dismissHint(hintId: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  // Get current dismissed hints
  const { data: settings } = await supabase
    .from("user_settings")
    .select("dismissed_hints")
    .eq("user_id", user.id)
    .maybeSingle();

  const currentHints = settings?.dismissed_hints || [];

  // Only add if not already dismissed
  if (!currentHints.includes(hintId)) {
    const { error } = await supabase.from("user_settings").upsert(
      {
        user_id: user.id,
        dismissed_hints: [...currentHints, hintId],
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (error) {
      return { error: error.message };
    }
  }

  revalidatePath("/app");
  revalidatePath("/app/recipes");
  revalidatePath("/app/shop");
  revalidatePath("/app/pantry");
  revalidatePath("/app/recipes/[id]/cook", "page");

  return { error: null };
}

/**
 * Reset all dismissed hints (re-enable all hints)
 */
export async function resetAllHints() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("user_settings")
    .update({ dismissed_hints: [] })
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app");
  revalidatePath("/app/recipes");
  revalidatePath("/app/shop");
  revalidatePath("/app/pantry");
  revalidatePath("/app/settings");

  return { error: null };
}
