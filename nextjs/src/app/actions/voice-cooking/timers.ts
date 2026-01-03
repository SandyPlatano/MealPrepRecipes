"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedUser } from "@/lib/supabase/cached-queries";
import { revalidatePath } from "next/cache";
import type { CreateTimerData, VoiceSessionTimer } from "@/types/voice-cooking";

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

  return { error: null, data: data as string };
}

export async function getActiveTimers(sessionId: string) {
  const { user, error: authError } = await getCachedUser();

  if (authError || !user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("voice_session_timers")
    .select("id, session_id, label, duration_seconds, remaining_seconds, status, step_index, alert_message, started_at, completed_at, created_at, updated_at")
    .eq("session_id", sessionId)
    .in("status", ["active", "paused"])
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error getting active timers:", error);
    return { error: error.message, data: null };
  }

  return { error: null, data: data as VoiceSessionTimer[] };
}

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
