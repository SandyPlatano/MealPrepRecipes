"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import { revalidatePath } from "next/cache";
import type { PermissionMode, HouseholdRole, HouseholdSettings } from "@/types/household-permissions";

// ============================================================================
// Get Household Permissions
// ============================================================================

export async function getHouseholdPermissions() {
  const { user, household, householdId, membership, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !household || !householdId || !membership) {
    return { error: authError || "No household found", data: null };
  }

  const supabase = await createClient();

  const { data: householdData, error } = await supabase
    .from("households")
    .select("id, name, permission_mode, household_settings")
    .eq("id", householdId)
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  return {
    error: null,
    data: {
      householdId: householdData.id,
      householdName: householdData.name,
      permissionMode: householdData.permission_mode as PermissionMode,
      settings: householdData.household_settings as HouseholdSettings,
      userRole: membership.role as HouseholdRole,
    },
  };
}

// ============================================================================
// Update Permission Mode
// ============================================================================

export async function updatePermissionMode(mode: PermissionMode) {
  const { user, householdId, membership, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !householdId || !membership) {
    return { error: authError || "Not authenticated" };
  }

  // Only owners can change permission mode
  if (membership.role !== "owner") {
    return { error: "Only the household owner can change permission mode" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("households")
    .update({ permission_mode: mode })
    .eq("id", householdId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings");
  revalidatePath("/app");
  return { error: null };
}

// ============================================================================
// Update Member Role
// ============================================================================

export async function updateMemberRole(memberId: string, role: HouseholdRole) {
  const { user, householdId, membership, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !householdId || !membership) {
    return { error: authError || "Not authenticated" };
  }

  // Only owners can change member roles
  if (membership.role !== "owner") {
    return { error: "Only the household owner can change member roles" };
  }

  // Cannot change the owner's role
  const supabase = await createClient();

  const { data: targetMember } = await supabase
    .from("household_members")
    .select("user_id, role")
    .eq("id", memberId)
    .eq("household_id", householdId)
    .single();

  if (targetMember?.role === "owner") {
    return { error: "Cannot change the owner's role" };
  }

  const { error } = await supabase
    .from("household_members")
    .update({ role })
    .eq("id", memberId)
    .eq("household_id", householdId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings");
  revalidatePath("/app");
  return { error: null };
}

// ============================================================================
// Update Household Settings
// ============================================================================

export async function updateHouseholdSettings(settings: HouseholdSettings) {
  const { user, householdId, membership, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !householdId || !membership) {
    return { error: authError || "Not authenticated" };
  }

  // Only owners can change household settings
  if (membership.role !== "owner") {
    return { error: "Only the household owner can change household settings" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("households")
    .update({ household_settings: settings })
    .eq("id", householdId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings");
  revalidatePath("/app");
  return { error: null };
}

// ============================================================================
// Get Household Contribution Stats
// ============================================================================

export async function getHouseholdContributionStats() {
  const { user, householdId, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user || !householdId) {
    return { error: authError || "No household found", data: null };
  }

  const supabase = await createClient();

  // Get member contributions from various sources
  const { data: members } = await supabase
    .from("household_members")
    .select(`
      user_id,
      role,
      profiles (
        first_name,
        last_name,
        email
      )
    `)
    .eq("household_id", householdId);

  if (!members) {
    return { error: "Failed to fetch members", data: null };
  }

  // Get cooking history counts
  const { data: cookingStats } = await supabase
    .from("cooking_history")
    .select("cooked_by")
    .eq("household_id", householdId);

  // Get recipe creation counts
  const { data: recipeStats } = await supabase
    .from("recipes")
    .select("user_id")
    .eq("household_id", householdId);

  // Get meal plan assignment counts
  const { data: mealPlanStats } = await supabase
    .from("meal_assignments")
    .select(`
      cook,
      meal_plan_id,
      meal_plans!inner (household_id)
    `)
    .eq("meal_plans.household_id", householdId);

  // Aggregate stats by user
  const stats = members.map((member) => {
    const userId = member.user_id;
    const profile = Array.isArray(member.profiles) ? member.profiles[0] : member.profiles;

    return {
      userId,
      firstName: profile?.first_name,
      lastName: profile?.last_name,
      email: profile?.email,
      role: member.role,
      recipesCreated: recipeStats?.filter((r) => r.user_id === userId).length || 0,
      mealsCooked: cookingStats?.filter((c) => c.cooked_by === userId).length || 0,
      mealsPlanned: mealPlanStats?.filter((m) => m.cook === userId).length || 0,
    };
  });

  return {
    error: null,
    data: stats,
  };
}
