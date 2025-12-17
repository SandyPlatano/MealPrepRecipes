"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import { revalidatePath } from "next/cache";
import type {
  CookingSchedule,
  CookingScheduleFormData,
  CookingScheduleWithUser,
  MemberDietaryProfile,
  MemberDietaryProfileFormData,
  HouseholdActivity,
  HouseholdActivityWithUser,
  HouseholdActivityType,
  AggregatedDietaryRestrictions,
  HouseholdMemberWithProfile,
  TodaysCook,
  ScheduleMealType,
} from "@/types/household";

// ============================================================================
// COOKING SCHEDULES
// ============================================================================

/**
 * Get all cooking schedules for the user's household
 */
export async function getCookingSchedules(): Promise<{
  error: string | null;
  data: CookingScheduleWithUser[] | null;
}> {
  const { user, householdId } = await getCachedUserWithHousehold();

  if (!user || !householdId) {
    return { error: "Not authenticated or no household", data: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cooking_schedules")
    .select(`
      *,
      user:assigned_user_id(
        id,
        first_name,
        last_name,
        avatar_url
      )
    `)
    .eq("household_id", householdId)
    .order("day_of_week")
    .order("meal_type");

  if (error) {
    console.error("Error fetching cooking schedules:", error);
    return { error: error.message, data: null };
  }

  return { error: null, data: data as CookingScheduleWithUser[] };
}

/**
 * Update or create a cooking schedule entry
 */
export async function upsertCookingSchedule(
  formData: CookingScheduleFormData
): Promise<{ error: string | null; data: CookingSchedule | null }> {
  const { user, householdId } = await getCachedUserWithHousehold();

  if (!user || !householdId) {
    return { error: "Not authenticated or no household", data: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cooking_schedules")
    .upsert(
      {
        household_id: householdId,
        day_of_week: formData.day_of_week,
        meal_type: formData.meal_type,
        assigned_user_id: formData.assigned_user_id,
        assigned_cook_name: formData.assigned_cook_name,
        is_rotating: formData.is_rotating ?? false,
      },
      {
        onConflict: "household_id,day_of_week,meal_type",
      }
    )
    .select()
    .single();

  if (error) {
    console.error("Error upserting cooking schedule:", error);
    return { error: error.message, data: null };
  }

  // Log activity
  await logHouseholdActivity({
    activity_type: "schedule_updated",
    entity_type: "cooking_schedule",
    entity_id: data.id,
    metadata: {
      day_of_week: formData.day_of_week,
      meal_type: formData.meal_type,
    },
  });

  revalidatePath("/app/settings/household");
  revalidatePath("/app/plan");
  revalidatePath("/app");

  return { error: null, data };
}

/**
 * Delete a cooking schedule entry
 */
export async function deleteCookingSchedule(
  dayOfWeek: number,
  mealType: ScheduleMealType
): Promise<{ error: string | null }> {
  const { user, householdId } = await getCachedUserWithHousehold();

  if (!user || !householdId) {
    return { error: "Not authenticated or no household" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("cooking_schedules")
    .delete()
    .eq("household_id", householdId)
    .eq("day_of_week", dayOfWeek)
    .eq("meal_type", mealType);

  if (error) {
    console.error("Error deleting cooking schedule:", error);
    return { error: error.message };
  }

  revalidatePath("/app/settings/household");
  revalidatePath("/app/plan");

  return { error: null };
}

/**
 * Get today's cook for the household
 */
export async function getTodaysCook(
  mealType: ScheduleMealType = "dinner"
): Promise<{ error: string | null; data: TodaysCook | null }> {
  const { user, householdId } = await getCachedUserWithHousehold();

  if (!user || !householdId) {
    return { error: "Not authenticated or no household", data: null };
  }

  const supabase = await createClient();

  // Calculate today's day of week (0 = Monday)
  const today = new Date();
  const dayOfWeek = (today.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0

  const { data, error } = await supabase
    .from("cooking_schedules")
    .select(`
      assigned_user_id,
      assigned_cook_name,
      meal_type,
      user:assigned_user_id(
        first_name,
        avatar_url
      )
    `)
    .eq("household_id", householdId)
    .eq("day_of_week", dayOfWeek)
    .eq("meal_type", mealType)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows found, which is fine
    console.error("Error fetching today's cook:", error);
    return { error: error.message, data: null };
  }

  if (!data) {
    return { error: null, data: null };
  }

  // Supabase joins can return arrays - handle both cases
  const rawUser = data.user;
  const userData = Array.isArray(rawUser) ? rawUser[0] : rawUser;

  return {
    error: null,
    data: {
      assigned_user_id: data.assigned_user_id,
      assigned_cook_name: data.assigned_cook_name,
      user_first_name: userData?.first_name ?? null,
      user_avatar_url: userData?.avatar_url ?? null,
      meal_type: data.meal_type as ScheduleMealType,
    },
  };
}

// ============================================================================
// MEMBER DIETARY PROFILES
// ============================================================================

/**
 * Get the current user's dietary profile
 */
export async function getMyDietaryProfile(): Promise<{
  error: string | null;
  data: MemberDietaryProfile | null;
}> {
  const { user, householdId } = await getCachedUserWithHousehold();

  if (!user || !householdId) {
    return { error: "Not authenticated or no household", data: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("member_dietary_profiles")
    .select("*")
    .eq("user_id", user.id)
    .eq("household_id", householdId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching dietary profile:", error);
    return { error: error.message, data: null };
  }

  return { error: null, data };
}

/**
 * Update or create the current user's dietary profile
 */
export async function upsertMyDietaryProfile(
  formData: MemberDietaryProfileFormData
): Promise<{ error: string | null; data: MemberDietaryProfile | null }> {
  const { user, householdId } = await getCachedUserWithHousehold();

  if (!user || !householdId) {
    return { error: "Not authenticated or no household", data: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("member_dietary_profiles")
    .upsert(
      {
        user_id: user.id,
        household_id: householdId,
        dietary_restrictions: formData.dietary_restrictions,
        allergens: formData.allergens,
        dislikes: formData.dislikes,
        preferences: formData.preferences,
        spice_tolerance: formData.spice_tolerance,
        notes: formData.notes,
      },
      {
        onConflict: "user_id,household_id",
      }
    )
    .select()
    .single();

  if (error) {
    console.error("Error upserting dietary profile:", error);
    return { error: error.message, data: null };
  }

  // Log activity
  await logHouseholdActivity({
    activity_type: "dietary_updated",
    entity_type: "dietary_profile",
    entity_id: data.id,
  });

  revalidatePath("/app/settings/dietary");
  revalidatePath("/app/settings/household");

  return { error: null, data };
}

/**
 * Get aggregated dietary restrictions for the household
 */
export async function getHouseholdDietaryAggregate(): Promise<{
  error: string | null;
  data: AggregatedDietaryRestrictions | null;
}> {
  const { user, householdId } = await getCachedUserWithHousehold();

  if (!user || !householdId) {
    return { error: "Not authenticated or no household", data: null };
  }

  const supabase = await createClient();

  // Get all dietary profiles for the household
  const { data: profiles, error } = await supabase
    .from("member_dietary_profiles")
    .select("*")
    .eq("household_id", householdId);

  if (error) {
    console.error("Error fetching dietary profiles:", error);
    return { error: error.message, data: null };
  }

  // Aggregate
  const allRestrictions = new Set<string>();
  const allAllergens = new Set<string>();
  const allDislikes = new Set<string>();

  profiles?.forEach((profile) => {
    profile.dietary_restrictions?.forEach((r: string) => allRestrictions.add(r));
    profile.allergens?.forEach((a: string) => allAllergens.add(a));
    profile.dislikes?.forEach((d: string) => allDislikes.add(d));
  });

  return {
    error: null,
    data: {
      all_restrictions: Array.from(allRestrictions),
      all_allergens: Array.from(allAllergens),
      all_dislikes: Array.from(allDislikes),
      member_count: profiles?.length ?? 0,
    },
  };
}

// ============================================================================
// HOUSEHOLD ACTIVITIES
// ============================================================================

/**
 * Log a household activity
 */
export async function logHouseholdActivity(params: {
  activity_type: HouseholdActivityType;
  entity_type?: string;
  entity_id?: string;
  entity_title?: string;
  metadata?: Record<string, unknown>;
}): Promise<{ error: string | null }> {
  const { user, householdId } = await getCachedUserWithHousehold();

  if (!user || !householdId) {
    return { error: "Not authenticated or no household" };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("household_activities").insert({
    household_id: householdId,
    user_id: user.id,
    activity_type: params.activity_type,
    entity_type: params.entity_type ?? null,
    entity_id: params.entity_id ?? null,
    entity_title: params.entity_title ?? null,
    metadata: params.metadata ?? {},
  });

  if (error) {
    console.error("Error logging household activity:", error);
    return { error: error.message };
  }

  return { error: null };
}

/**
 * Get recent household activities
 */
export async function getHouseholdActivities(
  limit: number = 20
): Promise<{ error: string | null; data: HouseholdActivityWithUser[] | null }> {
  const { user, householdId } = await getCachedUserWithHousehold();

  if (!user || !householdId) {
    return { error: "Not authenticated or no household", data: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("household_activities")
    .select(`
      *,
      user:user_id(
        id,
        first_name,
        last_name,
        avatar_url
      )
    `)
    .eq("household_id", householdId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching household activities:", error);
    return { error: error.message, data: null };
  }

  return { error: null, data: data as HouseholdActivityWithUser[] };
}

// ============================================================================
// HOUSEHOLD MEMBERS
// ============================================================================

/**
 * Get all members of the user's household with their profiles and dietary info
 */
export async function getHouseholdMembers(): Promise<{
  error: string | null;
  data: HouseholdMemberWithProfile[] | null;
}> {
  const { user, householdId } = await getCachedUserWithHousehold();

  if (!user || !householdId) {
    return { error: "Not authenticated or no household", data: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("household_members")
    .select(`
      *,
      profile:user_id(
        id,
        first_name,
        last_name,
        email,
        avatar_url
      )
    `)
    .eq("household_id", householdId);

  if (error) {
    console.error("Error fetching household members:", error);
    return { error: error.message, data: null };
  }

  // Get dietary profiles separately to avoid complex join
  const { data: dietaryProfiles } = await supabase
    .from("member_dietary_profiles")
    .select("*")
    .eq("household_id", householdId);

  // Map dietary profiles to members
  const membersWithDietary = data?.map((member) => {
    const dietaryProfile = dietaryProfiles?.find(
      (dp) => dp.user_id === member.user_id
    );
    return {
      ...member,
      profile: member.profile as HouseholdMemberWithProfile["profile"],
      dietary_profile: dietaryProfile ?? null,
    };
  });

  return { error: null, data: membersWithDietary as HouseholdMemberWithProfile[] };
}

/**
 * Get full household data including members, schedules, and dietary aggregate
 */
export async function getHouseholdFull(): Promise<{
  error: string | null;
  data: {
    household: { id: string; name: string; owner_id: string };
    members: HouseholdMemberWithProfile[];
    schedules: CookingScheduleWithUser[];
    dietaryAggregate: AggregatedDietaryRestrictions;
  } | null;
}> {
  const { user, householdId, household } = await getCachedUserWithHousehold();

  if (!user || !householdId || !household) {
    return { error: "Not authenticated or no household", data: null };
  }

  // Fetch all data in parallel
  const [membersResult, schedulesResult, dietaryResult] = await Promise.all([
    getHouseholdMembers(),
    getCookingSchedules(),
    getHouseholdDietaryAggregate(),
  ]);

  if (membersResult.error || schedulesResult.error || dietaryResult.error) {
    return {
      error: membersResult.error || schedulesResult.error || dietaryResult.error,
      data: null,
    };
  }

  return {
    error: null,
    data: {
      household: {
        id: household.id,
        name: household.name,
        owner_id: household.owner_id,
      },
      members: membersResult.data ?? [],
      schedules: schedulesResult.data ?? [],
      dietaryAggregate: dietaryResult.data ?? {
        all_restrictions: [],
        all_allergens: [],
        all_dislikes: [],
        member_count: 0,
      },
    },
  };
}
