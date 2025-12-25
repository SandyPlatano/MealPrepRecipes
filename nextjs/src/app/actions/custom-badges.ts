"use server";

/**
 * Server Actions for Custom Nutrition Badges
 * Handles CRUD operations for user-defined nutrition badges
 */

import { createClient } from "@/lib/supabase/server";
import type { BadgeCondition, BadgeColor, CustomBadge } from "@/lib/nutrition/badge-calculator";

/**
 * Get the household ID for the current user
 */
async function getUserHouseholdId(): Promise<string | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single();

  return membership?.household_id || null;
}

// =====================================================
// TYPES
// =====================================================

export interface CreateCustomBadgeInput {
  name: string;
  color: BadgeColor;
  conditions: BadgeCondition[];
}

export interface UpdateCustomBadgeInput {
  id: string;
  name?: string;
  color?: BadgeColor;
  conditions?: BadgeCondition[];
  is_active?: boolean;
}

interface ActionResult<T> {
  data?: T;
  error?: string;
}

// =====================================================
// GET CUSTOM BADGES
// =====================================================

/**
 * Get all custom badges for the current user's household
 */
export async function getCustomBadges(): Promise<ActionResult<CustomBadge[]>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const householdId = await getUserHouseholdId();
  if (!householdId) {
    return { error: "No household found" };
  }

  const { data, error } = await supabase
    .from("custom_nutrition_badges")
    .select("id, household_id, name, color, conditions, is_active, created_at")
    .eq("household_id", householdId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching custom badges:", error);
    return { error: error.message };
  }

  // Transform to match CustomBadge type
  const badges: CustomBadge[] = (data || []).map((row) => ({
    id: row.id,
    household_id: row.household_id,
    name: row.name,
    color: row.color as BadgeColor,
    conditions: row.conditions as BadgeCondition[],
    is_active: row.is_active,
    created_at: row.created_at,
  }));

  return { data: badges };
}

/**
 * Get only active custom badges for the current user's household
 */
export async function getActiveCustomBadges(): Promise<ActionResult<CustomBadge[]>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const householdId = await getUserHouseholdId();
  if (!householdId) {
    return { error: "No household found" };
  }

  const { data, error } = await supabase
    .from("custom_nutrition_badges")
    .select("id, household_id, name, color, conditions, is_active, created_at")
    .eq("household_id", householdId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching active custom badges:", error);
    return { error: error.message };
  }

  const badges: CustomBadge[] = (data || []).map((row) => ({
    id: row.id,
    household_id: row.household_id,
    name: row.name,
    color: row.color as BadgeColor,
    conditions: row.conditions as BadgeCondition[],
    is_active: row.is_active,
    created_at: row.created_at,
  }));

  return { data: badges };
}

// =====================================================
// CREATE CUSTOM BADGE
// =====================================================

/**
 * Create a new custom badge
 */
export async function createCustomBadge(
  input: CreateCustomBadgeInput
): Promise<ActionResult<CustomBadge>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const householdId = await getUserHouseholdId();
  if (!householdId) {
    return { error: "No household found" };
  }

  // Validate input
  if (!input.name || input.name.trim().length === 0) {
    return { error: "Badge name is required" };
  }

  if (input.name.length > 50) {
    return { error: "Badge name must be 50 characters or less" };
  }

  if (!input.conditions || input.conditions.length === 0) {
    return { error: "At least one condition is required" };
  }

  if (input.conditions.length > 4) {
    return { error: "Maximum 4 conditions allowed" };
  }

  // Validate each condition
  for (const condition of input.conditions) {
    if (!isValidCondition(condition)) {
      return { error: `Invalid condition: ${JSON.stringify(condition)}` };
    }
  }

  const { data, error } = await supabase
    .from("custom_nutrition_badges")
    .insert({
      household_id: householdId,
      created_by: user.id,
      name: input.name.trim(),
      color: input.color,
      conditions: input.conditions,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "A badge with this name already exists" };
    }
    console.error("Error creating custom badge:", error);
    return { error: error.message };
  }

  const badge: CustomBadge = {
    id: data.id,
    household_id: data.household_id,
    name: data.name,
    color: data.color as BadgeColor,
    conditions: data.conditions as BadgeCondition[],
    is_active: data.is_active,
    created_at: data.created_at,
  };

  return { data: badge };
}

// =====================================================
// UPDATE CUSTOM BADGE
// =====================================================

/**
 * Update an existing custom badge
 */
export async function updateCustomBadge(
  input: UpdateCustomBadgeInput
): Promise<ActionResult<CustomBadge>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const householdId = await getUserHouseholdId();
  if (!householdId) {
    return { error: "No household found" };
  }

  // Build update object
  const updates: Record<string, unknown> = {};

  if (input.name !== undefined) {
    if (input.name.trim().length === 0) {
      return { error: "Badge name cannot be empty" };
    }
    if (input.name.length > 50) {
      return { error: "Badge name must be 50 characters or less" };
    }
    updates.name = input.name.trim();
  }

  if (input.color !== undefined) {
    updates.color = input.color;
  }

  if (input.conditions !== undefined) {
    if (input.conditions.length === 0) {
      return { error: "At least one condition is required" };
    }
    if (input.conditions.length > 4) {
      return { error: "Maximum 4 conditions allowed" };
    }
    for (const condition of input.conditions) {
      if (!isValidCondition(condition)) {
        return { error: `Invalid condition: ${JSON.stringify(condition)}` };
      }
    }
    updates.conditions = input.conditions;
  }

  if (input.is_active !== undefined) {
    updates.is_active = input.is_active;
  }

  if (Object.keys(updates).length === 0) {
    return { error: "No updates provided" };
  }

  const { data, error } = await supabase
    .from("custom_nutrition_badges")
    .update(updates)
    .eq("id", input.id)
    .eq("household_id", householdId)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "A badge with this name already exists" };
    }
    console.error("Error updating custom badge:", error);
    return { error: error.message };
  }

  if (!data) {
    return { error: "Badge not found" };
  }

  const badge: CustomBadge = {
    id: data.id,
    household_id: data.household_id,
    name: data.name,
    color: data.color as BadgeColor,
    conditions: data.conditions as BadgeCondition[],
    is_active: data.is_active,
    created_at: data.created_at,
  };

  return { data: badge };
}

// =====================================================
// DELETE CUSTOM BADGE
// =====================================================

/**
 * Delete a custom badge
 */
export async function deleteCustomBadge(id: string): Promise<ActionResult<void>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const householdId = await getUserHouseholdId();
  if (!householdId) {
    return { error: "No household found" };
  }

  const { error } = await supabase
    .from("custom_nutrition_badges")
    .delete()
    .eq("id", id)
    .eq("household_id", householdId);

  if (error) {
    console.error("Error deleting custom badge:", error);
    return { error: error.message };
  }

  return {};
}

// =====================================================
// TOGGLE BADGE ACTIVE STATE
// =====================================================

/**
 * Toggle a badge's active state
 */
export async function toggleBadgeActive(
  id: string,
  isActive: boolean
): Promise<ActionResult<CustomBadge>> {
  return updateCustomBadge({ id, is_active: isActive });
}

// =====================================================
// VALIDATION HELPERS
// =====================================================

const VALID_NUTRIENTS = [
  "calories",
  "protein_g",
  "carbs_g",
  "fat_g",
  "fiber_g",
  "sugar_g",
  "sodium_mg",
];

const VALID_OPERATORS = ["gt", "lt", "eq", "gte", "lte", "between"];

/**
 * Validate a badge condition
 */
function isValidCondition(condition: BadgeCondition): boolean {
  if (!condition.nutrient || !VALID_NUTRIENTS.includes(condition.nutrient)) {
    return false;
  }

  if (!condition.operator || !VALID_OPERATORS.includes(condition.operator)) {
    return false;
  }

  if (typeof condition.value !== "number" || condition.value < 0) {
    return false;
  }

  if (condition.operator === "between") {
    if (typeof condition.value2 !== "number" || condition.value2 < 0) {
      return false;
    }
    if (condition.value2 <= condition.value) {
      return false;
    }
  }

  return true;
}
