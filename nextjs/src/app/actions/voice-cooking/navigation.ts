"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedUser } from "@/lib/supabase/cached-queries";
import { revalidatePath } from "next/cache";
import type { NavigationResult, NavigationDirection } from "@/types/voice-cooking";

export async function navigateStep(
  sessionId: string,
  direction: NavigationDirection
) {
  const { user, error: authError } = await getCachedUser();

  if (authError || !user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  const directionMap: Record<NavigationDirection, string> = {
    next: "next",
    back: "back",
    repeat: "repeat",
  };

  const { data, error } = await supabase.rpc("navigate_cooking_step", {
    p_session_id: sessionId,
    p_direction: directionMap[direction],
    p_target_step: null,
  });

  if (error) {
    console.error("Error navigating step:", error);

    if (error.message.includes("function") && error.message.includes("does not exist")) {
      return {
        error: "Cooking mode database setup incomplete. Please contact support.",
        data: null
      };
    }

    if (error.message.includes("Session not found")) {
      return { error: "Cooking session not found. Please restart.", data: null };
    }

    if (error.message.includes("Unauthorized")) {
      return { error: "You don't have permission to access this session.", data: null };
    }

    return { error: `Navigation failed: ${error.message}`, data: null };
  }

  const { data: session, error: sessionError } = await supabase
    .from("voice_cooking_sessions")
    .select("recipe_id, current_step")
    .eq("id", sessionId)
    .single();

  if (sessionError || !session) {
    return { error: "Session not found", data: null };
  }

  const { data: recipe, error: recipeError } = await supabase
    .from("recipes")
    .select("instructions")
    .eq("id", session.recipe_id)
    .single();

  if (recipeError || !recipe) {
    return { error: "Recipe not found", data: null };
  }

  const navigationResult: NavigationResult = {
    new_step: data[0]?.new_step || session.current_step,
    total_steps: data[0]?.total_steps || recipe.instructions.length,
    is_complete: data[0]?.is_complete || false,
    instruction: recipe.instructions[session.current_step - 1] || "",
  };

  revalidatePath("/app/recipes/[id]/cook", "page");

  return { error: null, data: navigationResult };
}

export async function jumpToStep(sessionId: string, stepIndex: number) {
  const { user, error: authError } = await getCachedUser();

  if (authError || !user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("navigate_cooking_step", {
    p_session_id: sessionId,
    p_direction: "jump",
    p_target_step: stepIndex,
  });

  if (error) {
    console.error("Error jumping to step:", error);

    if (error.message.includes("function") && error.message.includes("does not exist")) {
      return {
        error: "Cooking mode database setup incomplete. Please contact support.",
        data: null
      };
    }

    if (error.message.includes("Session not found")) {
      return { error: "Cooking session not found. Please restart.", data: null };
    }

    if (error.message.includes("Unauthorized")) {
      return { error: "You don't have permission to access this session.", data: null };
    }

    return { error: `Failed to jump to step: ${error.message}`, data: null };
  }

  const { data: session, error: sessionError } = await supabase
    .from("voice_cooking_sessions")
    .select("recipe_id, current_step")
    .eq("id", sessionId)
    .single();

  if (sessionError || !session) {
    return { error: "Session not found", data: null };
  }

  const { data: recipe, error: recipeError } = await supabase
    .from("recipes")
    .select("instructions")
    .eq("id", session.recipe_id)
    .single();

  if (recipeError || !recipe) {
    return { error: "Recipe not found", data: null };
  }

  const navigationResult: NavigationResult = {
    new_step: data[0]?.new_step || session.current_step,
    total_steps: data[0]?.total_steps || recipe.instructions.length,
    is_complete: data[0]?.is_complete || false,
    instruction: recipe.instructions[session.current_step - 1] || "",
  };

  revalidatePath("/app/recipes/[id]/cook", "page");

  return { error: null, data: navigationResult };
}
