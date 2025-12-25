"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import { revalidatePath } from "next/cache";
import type { CustomMealType, CustomMealTypeFormData } from "@/types/custom-meal-type";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function mapDbRowToMealType(row: {
  id: string;
  household_id: string;
  name: string;
  slug: string;
  emoji: string;
  color: string;
  default_time: string;
  sort_order: number;
  is_system: boolean;
  created_at: string;
}): CustomMealType {
  return {
    id: row.id,
    householdId: row.household_id,
    name: row.name,
    slug: row.slug,
    emoji: row.emoji,
    color: row.color,
    defaultTime: row.default_time,
    sortOrder: row.sort_order,
    isSystem: row.is_system,
    createdAt: row.created_at,
  };
}

export async function getCustomMealTypes(householdId: string): Promise<{
  error: string | null;
  data: CustomMealType[] | null;
}> {
  const supabase = await createClient();
  const { user } = await getCachedUserWithHousehold();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const { data, error } = await supabase
    .from("custom_meal_types")
    .select("id, household_id, name, slug, emoji, color, default_time, sort_order, is_system, created_at")
    .eq("household_id", householdId)
    .order("sort_order", { ascending: true });

  if (error) {
    return { error: error.message, data: null };
  }

  return { error: null, data: data.map(mapDbRowToMealType) };
}

export async function createCustomMealType(
  householdId: string,
  formData: CustomMealTypeFormData
): Promise<{ error: string | null; data: CustomMealType | null }> {
  const supabase = await createClient();
  const { user } = await getCachedUserWithHousehold();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const slug = slugify(formData.name);

  if (!slug) {
    return { error: "Invalid meal type name", data: null };
  }

  const { data: existing } = await supabase
    .from("custom_meal_types")
    .select("id")
    .eq("household_id", householdId)
    .eq("slug", slug)
    .single();

  if (existing) {
    return { error: "A meal type with this name already exists", data: null };
  }

  const { data: maxSortOrder } = await supabase
    .from("custom_meal_types")
    .select("sort_order")
    .eq("household_id", householdId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();

  const nextSortOrder = (maxSortOrder?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from("custom_meal_types")
    .insert({
      household_id: householdId,
      name: formData.name,
      slug,
      emoji: formData.emoji,
      color: formData.color,
      default_time: formData.defaultTime,
      sort_order: nextSortOrder,
      is_system: false,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  revalidatePath("/app/plan");
  revalidatePath("/app/settings");

  return { error: null, data: mapDbRowToMealType(data) };
}

export async function updateCustomMealType(
  id: string,
  updates: Partial<CustomMealTypeFormData>
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { user } = await getCachedUserWithHousehold();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const updateData: Record<string, unknown> = {};

  if (updates.name !== undefined) {
    updateData.name = updates.name;
    updateData.slug = slugify(updates.name);

    if (!updateData.slug) {
      return { error: "Invalid meal type name" };
    }

    const { data: mealType } = await supabase
      .from("custom_meal_types")
      .select("household_id")
      .eq("id", id)
      .single();

    if (!mealType) {
      return { error: "Meal type not found" };
    }

    const { data: existing } = await supabase
      .from("custom_meal_types")
      .select("id")
      .eq("household_id", mealType.household_id)
      .eq("slug", updateData.slug)
      .neq("id", id)
      .single();

    if (existing) {
      return { error: "A meal type with this name already exists" };
    }
  }

  if (updates.emoji !== undefined) {
    updateData.emoji = updates.emoji;
  }

  if (updates.color !== undefined) {
    updateData.color = updates.color;
  }

  if (updates.defaultTime !== undefined) {
    updateData.default_time = updates.defaultTime;
  }

  const { error } = await supabase
    .from("custom_meal_types")
    .update(updateData)
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/plan");
  revalidatePath("/app/settings");

  return { error: null };
}

export async function deleteCustomMealType(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { user } = await getCachedUserWithHousehold();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: mealType } = await supabase
    .from("custom_meal_types")
    .select("is_system")
    .eq("id", id)
    .single();

  if (!mealType) {
    return { error: "Meal type not found" };
  }

  if (mealType.is_system) {
    return { error: "Cannot delete system meal types" };
  }

  const { error } = await supabase
    .from("custom_meal_types")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/plan");
  revalidatePath("/app/settings");

  return { error: null };
}

export async function reorderCustomMealTypes(
  householdId: string,
  orderedIds: string[]
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { user } = await getCachedUserWithHousehold();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const updates = orderedIds.map((id, index) => ({
    id,
    household_id: householdId,
    sort_order: index,
  }));

  const { error } = await supabase.from("custom_meal_types").upsert(updates, {
    onConflict: "id",
    ignoreDuplicates: false,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/plan");
  revalidatePath("/app/settings");

  return { error: null };
}
