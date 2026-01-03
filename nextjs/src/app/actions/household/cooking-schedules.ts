"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import { revalidatePath } from "next/cache";
import type {
  CookingSchedule,
  CookingScheduleFormData,
  CookingScheduleWithUser,
  TodaysCook,
  ScheduleMealType,
} from "@/types/household";
import { logHouseholdActivity } from "./activities";

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

export async function getTodaysCook(
  mealType: ScheduleMealType = "dinner"
): Promise<{ error: string | null; data: TodaysCook | null }> {
  const { user, householdId } = await getCachedUserWithHousehold();

  if (!user || !householdId) {
    return { error: "Not authenticated or no household", data: null };
  }

  const supabase = await createClient();

  const today = new Date();
  const dayOfWeek = (today.getDay() + 6) % 7;

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
    console.error("Error fetching today's cook:", error);
    return { error: error.message, data: null };
  }

  if (!data) {
    return { error: null, data: null };
  }

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
