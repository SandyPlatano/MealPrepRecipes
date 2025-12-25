"use server";

/**
 * Household Settings Actions
 *
 * Actions for managing household information and members.
 */

import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import { revalidatePath } from "next/cache";

/**
 * Get household info including members
 */
export async function getHouseholdInfo() {
  const {
    user,
    household,
    membership,
    error: authError,
  } = await getCachedUserWithHousehold();

  if (authError || !user || !household || !membership) {
    return { error: authError || "No household found", data: null };
  }

  const supabase = await createClient();

  // Get full household details
  const { data: householdDetails } = await supabase
    .from("households")
    .select("id, name, created_at")
    .eq("id", household.household_id)
    .maybeSingle();

  // Get household members
  const { data: members } = await supabase
    .from("household_members")
    .select(
      `
      user_id,
      role,
      profiles (
        first_name,
        last_name,
        email
      )
    `
    )
    .eq("household_id", household.household_id);

  return {
    error: null,
    data: {
      household: householdDetails,
      role: membership.role,
      members: members || [],
    },
  };
}

/**
 * Update household name (owner only)
 */
export async function updateHouseholdName(name: string) {
  const {
    user,
    household,
    membership,
    error: authError,
  } = await getCachedUserWithHousehold();

  if (authError || !user || !household || !membership) {
    return { error: authError || "No household found" };
  }

  if (membership.role !== "owner") {
    return { error: "Only the household owner can update the name" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("households")
    .update({ name })
    .eq("id", household.household_id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings");
  revalidatePath("/app");
  return { error: null };
}
