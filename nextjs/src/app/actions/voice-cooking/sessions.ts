"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedUser } from "@/lib/supabase/cached-queries";
import { revalidatePath } from "next/cache";
import type {
  ActiveCookingSession,
  CompleteCookingData,
} from "@/types/voice-cooking";

export async function startCookingSession(
  recipeId: string,
  servingsMultiplier: number = 1
) {
  const { user, error: authError } = await getCachedUser();

  if (authError || !user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("start_cooking_session", {
    p_recipe_id: recipeId,
    p_servings_multiplier: servingsMultiplier,
    p_platform: "web",
    p_device_type: "desktop",
  });

  if (error) {
    console.error("Error starting cooking session:", error);

    if (error.message.includes("function") && error.message.includes("does not exist")) {
      return {
        error: "Cooking mode database setup incomplete. Please contact support.",
        data: null
      };
    }

    if (error.message.includes("Recipe has no instructions")) {
      return { error: "This recipe has no instructions to cook.", data: null };
    }

    return { error: `Failed to start cooking: ${error.message}`, data: null };
  }

  revalidatePath("/app/recipes/[id]/cook", "page");

  return { error: null, data: data as string };
}

export async function getActiveSession() {
  const { user, error: authError } = await getCachedUser();

  if (authError || !user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_active_cooking_session");

  if (error) {
    console.error("Error getting active session:", error);

    if (error.message.includes("function") && error.message.includes("does not exist")) {
      return {
        error: "Cooking mode database setup incomplete. Please contact support.",
        data: null
      };
    }

    return { error: `Failed to load session: ${error.message}`, data: null };
  }

  if (!data || data.length === 0) {
    return { error: null, data: null };
  }

  const sessionData = data[0];
  const { data: recipe, error: recipeError } = await supabase
    .from("recipes")
    .select("title, servings, instructions, ingredients")
    .eq("id", sessionData.recipe_id)
    .single();

  if (recipeError || !recipe) {
    return { error: "Recipe not found", data: null };
  }

  const activeSession: ActiveCookingSession = {
    ...sessionData,
    recipe_title: recipe.title,
    recipe_servings: recipe.servings,
    current_instruction: recipe.instructions[sessionData.current_step - 1] || "",
    instructions: recipe.instructions,
    ingredients: recipe.ingredients,
  };

  return { error: null, data: activeSession };
}

export async function completeCookingSession(
  sessionId: string,
  data?: CompleteCookingData
) {
  const { user, error: authError } = await getCachedUser();

  if (authError || !user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  const { error } = await supabase.rpc("complete_cooking_session", {
    p_session_id: sessionId,
    p_rating: data?.rating || null,
    p_notes: data?.notes || null,
    p_photo_url: data?.photo_url || null,
  });

  if (error) {
    console.error("Error completing cooking session:", error);

    if (error.message.includes("function") && error.message.includes("does not exist")) {
      return {
        error: "Cooking mode database setup incomplete. Please contact support.",
        data: null
      };
    }

    if (error.message.includes("Session not found")) {
      return { error: "Cooking session not found.", data: null };
    }

    if (error.message.includes("Unauthorized")) {
      return { error: "You don't have permission to complete this session.", data: null };
    }

    return { error: `Failed to complete session: ${error.message}`, data: null };
  }

  revalidatePath("/app/recipes");
  revalidatePath("/app/recipes/[id]", "page");

  return { error: null, data: true };
}

export async function abandonSession(sessionId: string) {
  const { user, error: authError } = await getCachedUser();

  if (authError || !user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("voice_cooking_sessions")
    .update({ status: "abandoned", updated_at: new Date().toISOString() })
    .eq("id", sessionId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error abandoning session:", error);

    if (error.message.includes("relation") && error.message.includes("does not exist")) {
      return {
        error: "Cooking mode database setup incomplete. Please contact support.",
        data: null
      };
    }

    if (error.code === "PGRST116") {
      return { error: "Session not found or already ended.", data: null };
    }

    return { error: `Failed to exit session: ${error.message}`, data: null };
  }

  revalidatePath("/app/recipes");

  return { error: null, data: true };
}
