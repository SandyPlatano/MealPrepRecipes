"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import type {
  HouseholdMemberWithProfile,
  CookingScheduleWithUser,
  AggregatedDietaryRestrictions,
} from "@/types/household";
import { getCookingSchedules } from "./cooking-schedules";
import { getHouseholdDietaryAggregate } from "./dietary-profiles";

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

  const { data: dietaryProfiles } = await supabase
    .from("member_dietary_profiles")
    .select("id, user_id, household_id, dietary_restrictions, allergens, dislikes, preferences, spice_tolerance, notes, created_at, updated_at")
    .eq("household_id", householdId);

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
