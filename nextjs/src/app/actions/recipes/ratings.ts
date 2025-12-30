"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedUser } from "@/lib/supabase/cached-queries";
import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Update recipe rating
 */
export async function updateRecipeRating(id: string, rating: number) {
  // Check authentication first - household is optional
  const { user: authUser, error: authError } = await getCachedUser();

  if (authError || !authUser) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("recipes")
    .update({ rating })
    .eq("id", id)
    .eq("user_id", authUser.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/recipes");
  revalidatePath(`/app/recipes/${id}`);
  revalidateTag(`recipes-${authUser.id}`, "default");
  return { error: null };
}
