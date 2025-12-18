"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedUser } from "@/lib/supabase/cached-queries";
import { revalidatePath } from "next/cache";
import type {
  ActiveCookingSession,
  NavigationResult,
  VoiceCookingSession,
  VoiceSessionTimer,
  CompleteCookingData,
  CreateTimerData,
  NavigationDirection,
} from "@/types/voice-cooking";

/**
 * Start a new cooking session for a recipe
 */
export async function startCookingSession(
  recipeId: string,
  servingsMultiplier: number = 1
) {
  const { user, error: authError } = await getCachedUser();

  if (authError || !user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  // Call the database function to start the session
  const { data, error } = await supabase.rpc("start_cooking_session", {
    p_recipe_id: recipeId,
    p_servings_multiplier: servingsMultiplier,
    p_platform: "web",
    p_device_type: "desktop",
  });

  if (error) {
    console.error("Error starting cooking session:", error);

    // Provide more descriptive error messages
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

  return { error: null, data: data as string }; // Returns session_id
}

/**
 * Get the current active cooking session for the user
 */
export async function getActiveSession() {
  const { user, error: authError } = await getCachedUser();

  if (authError || !user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  // Call the database function to get active session
  const { data, error } = await supabase.rpc("get_active_cooking_session");

  if (error) {
    console.error("Error getting active session:", error);

    // Provide more descriptive error messages
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

  // Get the recipe details for the session
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

/**
 * Navigate to next, previous, or repeat current step
 */
export async function navigateStep(
  sessionId: string,
  direction: NavigationDirection
) {
  const { user, error: authError } = await getCachedUser();

  if (authError || !user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  // Map direction to the database function parameter
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

    // Provide more descriptive error messages
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

  // Get the updated instruction
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

/**
 * Jump directly to a specific step
 */
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

    // Provide more descriptive error messages
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

  // Get the updated instruction
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

/**
 * Complete the cooking session and log to history
 */
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

    // Provide more descriptive error messages
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

/**
 * Abandon the cooking session without logging to history
 */
export async function abandonSession(sessionId: string) {
  const { user, error: authError } = await getCachedUser();

  if (authError || !user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  // Update the session status to abandoned
  const { error } = await supabase
    .from("voice_cooking_sessions")
    .update({ status: "abandoned", updated_at: new Date().toISOString() })
    .eq("id", sessionId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error abandoning session:", error);

    // Provide more descriptive error messages
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

/**
 * Create a new timer for the current session
 */
export async function createTimer(sessionId: string, timerData: CreateTimerData) {
  const { user, error: authError } = await getCachedUser();

  if (authError || !user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("create_session_timer", {
    p_session_id: sessionId,
    p_label: timerData.label,
    p_duration_seconds: timerData.durationSeconds,
    p_step_index: timerData.stepIndex || null,
    p_alert_message: timerData.alertMessage || null,
  });

  if (error) {
    console.error("Error creating timer:", error);

    // Provide more descriptive error messages
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
      return { error: "You don't have permission to create timers for this session.", data: null };
    }

    return { error: `Failed to create timer: ${error.message}`, data: null };
  }

  revalidatePath("/app/recipes/[id]/cook", "page");

  return { error: null, data: data as string }; // Returns timer_id
}

/**
 * Get all active timers for a session
 */
export async function getActiveTimers(sessionId: string) {
  const { user, error: authError } = await getCachedUser();

  if (authError || !user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("voice_session_timers")
    .select("*")
    .eq("session_id", sessionId)
    .in("status", ["active", "paused"])
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error getting active timers:", error);
    return { error: error.message, data: null };
  }

  return { error: null, data: data as VoiceSessionTimer[] };
}

/**
 * Cancel a timer
 */
export async function cancelTimer(timerId: string) {
  const { user, error: authError } = await getCachedUser();

  if (authError || !user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("voice_session_timers")
    .update({
      status: "cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", timerId);

  if (error) {
    console.error("Error cancelling timer:", error);
    return { error: error.message, data: null };
  }

  revalidatePath("/app/recipes/[id]/cook", "page");

  return { error: null, data: true };
}

/**
 * Update timer remaining seconds (for client-side countdown sync)
 */
export async function updateTimerRemaining(timerId: string, remainingSeconds: number) {
  const { user, error: authError } = await getCachedUser();

  if (authError || !user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("voice_session_timers")
    .update({
      remaining_seconds: remainingSeconds,
      updated_at: new Date().toISOString(),
    })
    .eq("id", timerId);

  if (error) {
    console.error("Error updating timer:", error);
    return { error: error.message, data: null };
  }

  return { error: null, data: true };
}

/**
 * Complete a timer
 */
export async function completeTimer(timerId: string) {
  const { user, error: authError } = await getCachedUser();

  if (authError || !user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("voice_session_timers")
    .update({
      status: "completed",
      remaining_seconds: 0,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", timerId);

  if (error) {
    console.error("Error completing timer:", error);
    return { error: error.message, data: null };
  }

  revalidatePath("/app/recipes/[id]/cook", "page");

  return { error: null, data: true };
}
