"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import type {
  HouseholdActivityType,
  HouseholdActivityWithUser,
} from "@/types/household";

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
