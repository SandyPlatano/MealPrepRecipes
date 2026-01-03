"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import { revalidatePath } from "next/cache";
import type {
  MemberDietaryProfile,
  MemberDietaryProfileFormData,
  AggregatedDietaryRestrictions,
} from "@/types/household";
import { logHouseholdActivity } from "./activities";

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
    .select("id, user_id, household_id, dietary_restrictions, allergens, dislikes, preferences, spice_tolerance, notes, created_at, updated_at")
    .eq("user_id", user.id)
    .eq("household_id", householdId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching dietary profile:", error);
    return { error: error.message, data: null };
  }

  return { error: null, data };
}

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

  await logHouseholdActivity({
    activity_type: "dietary_updated",
    entity_type: "dietary_profile",
    entity_id: data.id,
  });

  revalidatePath("/app/settings/dietary");
  revalidatePath("/app/settings/household");

  return { error: null, data };
}

export async function getHouseholdDietaryAggregate(): Promise<{
  error: string | null;
  data: AggregatedDietaryRestrictions | null;
}> {
  const { user, householdId } = await getCachedUserWithHousehold();

  if (!user || !householdId) {
    return { error: "Not authenticated or no household", data: null };
  }

  const supabase = await createClient();

  const { data: profiles, error } = await supabase
    .from("member_dietary_profiles")
    .select("id, user_id, household_id, dietary_restrictions, allergens, dislikes, preferences, spice_tolerance, notes, created_at, updated_at")
    .eq("household_id", householdId);

  if (error) {
    console.error("Error fetching dietary profiles:", error);
    return { error: error.message, data: null };
  }

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
