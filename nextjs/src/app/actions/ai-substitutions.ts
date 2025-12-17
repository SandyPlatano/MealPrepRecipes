"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  SubstitutionSuggestion,
  SubstitutionReason,
  SubstitutionFeedback,
  AcceptSubstitutionInput,
} from "@/types/substitution";

/**
 * Accept a substitution suggestion and update the shopping list
 */
export async function acceptSubstitution(
  input: AcceptSubstitutionInput
): Promise<{ error: string | null; newItemId?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Get user's household
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return { error: "No household found" };
  }

  const { item_id, original_ingredient, substitute, action } = input;

  // First, log the substitution
  const { data: log, error: logError } = await supabase
    .from("substitution_logs")
    .insert({
      household_id: membership.household_id,
      user_id: user.id,
      original_ingredient,
      original_quantity: null, // Could be added to input
      original_unit: null,
      chosen_substitute: substitute.substitute,
      substitute_quantity: substitute.quantity,
      substitute_unit: substitute.unit || null,
      reason: "unavailable" as SubstitutionReason, // Default, could be passed
      match_score: substitute.match_score,
      ai_suggestions: substitute as unknown as Record<string, unknown>,
    })
    .select("id")
    .single();

  if (logError) {
    console.error("Error logging substitution:", logError);
    // Continue anyway - logging shouldn't block the action
  }

  // Now handle the shopping list based on action type
  switch (action) {
    case "replace": {
      // Replace the original item with the substitute
      const { error } = await supabase
        .from("shopping_list_items")
        .update({
          ingredient: substitute.substitute,
          quantity: substitute.quantity,
          unit: substitute.unit || null,
          substituted_from: original_ingredient,
          substitution_log_id: log?.id || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item_id);

      if (error) {
        return { error: error.message };
      }
      break;
    }

    case "add_new": {
      // Keep original, add substitute as new item
      // First get the original item's shopping list
      const { data: originalItem } = await supabase
        .from("shopping_list_items")
        .select("shopping_list_id, category")
        .eq("id", item_id)
        .single();

      if (!originalItem) {
        return { error: "Original item not found" };
      }

      const { data: newItem, error } = await supabase
        .from("shopping_list_items")
        .insert({
          shopping_list_id: originalItem.shopping_list_id,
          ingredient: substitute.substitute,
          quantity: substitute.quantity,
          unit: substitute.unit || null,
          category: originalItem.category,
          substituted_from: original_ingredient,
          substitution_log_id: log?.id || null,
          is_checked: false,
        })
        .select("id")
        .single();

      if (error) {
        return { error: error.message };
      }

      revalidatePath("/app/shopping-list");
      return { error: null, newItemId: newItem?.id };
    }

    case "mark_unavailable": {
      // Mark original as unavailable (checked with note)
      const { error } = await supabase
        .from("shopping_list_items")
        .update({
          is_checked: true,
          notes: `Unavailable - substitute: ${substitute.substitute}`,
          substituted_from: original_ingredient,
          substitution_log_id: log?.id || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item_id);

      if (error) {
        return { error: error.message };
      }
      break;
    }
  }

  revalidatePath("/app/shopping-list");
  return { error: null };
}

/**
 * Submit feedback for a substitution
 */
export async function submitSubstitutionFeedback(
  logId: string,
  feedback: SubstitutionFeedback
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("substitution_logs")
    .update({ feedback })
    .eq("id", logId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

/**
 * Get substitution history for the household
 */
export async function getSubstitutionHistory(
  limit = 20
): Promise<{
  error: string | null;
  data: Array<{
    id: string;
    original_ingredient: string;
    chosen_substitute: string;
    reason: SubstitutionReason;
    match_score: number | null;
    feedback: SubstitutionFeedback | null;
    created_at: string;
  }> | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  // Get user's household
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return { error: "No household found", data: null };
  }

  const { data, error } = await supabase
    .from("substitution_logs")
    .select(
      "id, original_ingredient, chosen_substitute, reason, match_score, feedback, created_at"
    )
    .eq("household_id", membership.household_id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { error: error.message, data: null };
  }

  return { error: null, data: data as Array<{
    id: string;
    original_ingredient: string;
    chosen_substitute: string;
    reason: SubstitutionReason;
    match_score: number | null;
    feedback: SubstitutionFeedback | null;
    created_at: string;
  }> };
}

/**
 * Get common substitutions (most frequently used)
 */
export async function getCommonSubstitutions(): Promise<{
  error: string | null;
  data: Array<{
    original_ingredient: string;
    chosen_substitute: string;
    count: number;
    avg_score: number;
  }> | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  // Get user's household
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return { error: "No household found", data: null };
  }

  // This would ideally be a database view/function for efficiency
  const { data, error } = await supabase
    .from("substitution_logs")
    .select("original_ingredient, chosen_substitute, match_score")
    .eq("household_id", membership.household_id);

  if (error) {
    return { error: error.message, data: null };
  }

  // Aggregate in JS (in production, this should be a DB function)
  const aggregated = new Map<
    string,
    { count: number; totalScore: number }
  >();

  for (const log of data || []) {
    const key = `${log.original_ingredient}|${log.chosen_substitute}`;
    const existing = aggregated.get(key) || { count: 0, totalScore: 0 };
    aggregated.set(key, {
      count: existing.count + 1,
      totalScore: existing.totalScore + (log.match_score || 0),
    });
  }

  const result = Array.from(aggregated.entries())
    .map(([key, value]) => {
      const [original, substitute] = key.split("|");
      return {
        original_ingredient: original,
        chosen_substitute: substitute,
        count: value.count,
        avg_score: Math.round(value.totalScore / value.count),
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return { error: null, data: result };
}
