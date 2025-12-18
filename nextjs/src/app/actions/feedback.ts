"use server";

import { createClient } from "@/lib/supabase/server";

export interface SubmitFeedbackData {
  content: string;
}

export interface FeedbackResult {
  data: { id: string } | null;
  error: string | null;
}

/**
 * Submit user feedback
 * Simple, low-friction submission with minimal fields
 */
export async function submitFeedback(
  data: SubmitFeedbackData
): Promise<FeedbackResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "You must be signed in to submit feedback" };
  }

  // Validate content length
  const content = data.content.trim();
  if (content.length < 10) {
    return { data: null, error: "Feedback must be at least 10 characters" };
  }
  if (content.length > 2000) {
    return { data: null, error: "Feedback must be less than 2000 characters" };
  }

  const { data: feedback, error } = await supabase
    .from("user_feedback")
    .insert({
      user_id: user.id,
      content,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Error submitting feedback:", error);
    return { data: null, error: "Failed to submit feedback. Please try again." };
  }

  return { data: { id: feedback.id }, error: null };
}
