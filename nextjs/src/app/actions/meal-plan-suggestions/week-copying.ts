"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";

// Copy previous week's meal plan to current week
export async function copyPreviousWeek(
  fromWeekStart: string,
  toWeekStart: string
): Promise<{ error: string | null; copiedCount: number }> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "No household found", copiedCount: 0 };
  }

  const supabase = await createClient();

  // Get the source week's meal plan
  const { data: sourcePlan } = await supabase
    .from("meal_plans")
    .select("id")
    .eq("household_id", household.household_id)
    .eq("week_start", fromWeekStart)
    .single();

  if (!sourcePlan) {
    return { error: "No meal plan found for previous week", copiedCount: 0 };
  }

  // Get assignments from source week
  const { data: sourceAssignments } = await supabase
    .from("meal_assignments")
    .select("recipe_id, day_of_week, cook")
    .eq("meal_plan_id", sourcePlan.id);

  if (!sourceAssignments || sourceAssignments.length === 0) {
    return { error: "No meals to copy from previous week", copiedCount: 0 };
  }

  // Get or create target meal plan
  let { data: targetPlan } = await supabase
    .from("meal_plans")
    .select("id")
    .eq("household_id", household.household_id)
    .eq("week_start", toWeekStart)
    .single();

  if (!targetPlan) {
    const { data: newPlan, error: createError } = await supabase
      .from("meal_plans")
      .insert({
        household_id: household.household_id,
        week_start: toWeekStart,
      })
      .select("id")
      .single();

    if (createError) {
      return { error: createError.message, copiedCount: 0 };
    }
    targetPlan = newPlan;
  }

  // Insert new assignments (don't clear existing - user might want to add to what's there)
  const newAssignments = sourceAssignments.map((a) => ({
    meal_plan_id: targetPlan!.id,
    recipe_id: a.recipe_id,
    day_of_week: a.day_of_week,
    cook: a.cook,
  }));

  const { error: insertError } = await supabase
    .from("meal_assignments")
    .insert(newAssignments);

  if (insertError) {
    return { error: insertError.message, copiedCount: 0 };
  }

  return { error: null, copiedCount: sourceAssignments.length };
}

// Get the number of meals in the previous week (for copy button UI)
export async function getPreviousWeekMealCount(
  previousWeekStart: string
): Promise<{ error: string | null; count: number }> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "No household found", count: 0 };
  }

  const supabase = await createClient();

  const { data: plan } = await supabase
    .from("meal_plans")
    .select("id")
    .eq("household_id", household.household_id)
    .eq("week_start", previousWeekStart)
    .single();

  if (!plan) {
    return { error: null, count: 0 };
  }

  const { count } = await supabase
    .from("meal_assignments")
    .select("id", { count: "exact", head: true })
    .eq("meal_plan_id", plan.id);

  return { error: null, count: count || 0 };
}

// Copy selected days from current week to next week
export async function copySelectedDaysToNextWeek(
  fromWeekStart: string,
  toWeekStart: string,
  days: string[]
): Promise<{ error: string | null; copiedCount: number }> {
  const { user, household, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household) {
    return { error: authError?.message || "No household found", copiedCount: 0 };
  }

  if (days.length === 0) {
    return { error: "No days selected", copiedCount: 0 };
  }

  const supabase = await createClient();

  // Get the source week's meal plan
  const { data: sourcePlan } = await supabase
    .from("meal_plans")
    .select("id")
    .eq("household_id", household.household_id)
    .eq("week_start", fromWeekStart)
    .single();

  if (!sourcePlan) {
    return { error: "No meal plan found for current week", copiedCount: 0 };
  }

  // Get assignments from source week for selected days only
  const { data: sourceAssignments } = await supabase
    .from("meal_assignments")
    .select("recipe_id, day_of_week, cook, meal_type, serving_size")
    .eq("meal_plan_id", sourcePlan.id)
    .in("day_of_week", days);

  if (!sourceAssignments || sourceAssignments.length === 0) {
    return { error: "No meals to copy from selected days", copiedCount: 0 };
  }

  // Get or create target meal plan
  let { data: targetPlan } = await supabase
    .from("meal_plans")
    .select("id")
    .eq("household_id", household.household_id)
    .eq("week_start", toWeekStart)
    .single();

  if (!targetPlan) {
    const { data: newPlan, error: createError } = await supabase
      .from("meal_plans")
      .insert({
        household_id: household.household_id,
        week_start: toWeekStart,
      })
      .select("id")
      .single();

    if (createError) {
      return { error: createError.message, copiedCount: 0 };
    }
    targetPlan = newPlan;
  }

  // Insert new assignments (keeping same day_of_week)
  const newAssignments = sourceAssignments.map((a) => ({
    meal_plan_id: targetPlan!.id,
    recipe_id: a.recipe_id,
    day_of_week: a.day_of_week,
    cook: a.cook,
    meal_type: a.meal_type,
    serving_size: a.serving_size,
  }));

  const { error: insertError } = await supabase
    .from("meal_assignments")
    .insert(newAssignments);

  if (insertError) {
    return { error: insertError.message, copiedCount: 0 };
  }

  return { error: null, copiedCount: sourceAssignments.length };
}
