"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import { revalidatePath } from "next/cache";

// Types for substitutions
export interface Substitution {
  id: string;
  original_ingredient: string;
  substitute_ingredient: string;
  notes: string | null;
  is_default: boolean;
}

export interface UserSubstitution {
  id: string;
  user_id: string;
  original_ingredient: string;
  substitute_ingredient: string;
  notes: string | null;
}

/**
 * Built-in common substitutions fallback
 */
const COMMON_SUBSTITUTIONS: Omit<Substitution, "id">[] = [
  { original_ingredient: "butter", substitute_ingredient: "coconut oil", notes: "Use 1:1 ratio. Great for vegan baking.", is_default: true },
  { original_ingredient: "milk", substitute_ingredient: "oat milk", notes: "Use 1:1 ratio. Works well in most recipes.", is_default: true },
  { original_ingredient: "eggs", substitute_ingredient: "flax eggs", notes: "Mix 1 tbsp ground flaxseed with 3 tbsp water per egg.", is_default: true },
  { original_ingredient: "heavy cream", substitute_ingredient: "coconut cream", notes: "Use 1:1 ratio. Great for dairy-free recipes.", is_default: true },
  { original_ingredient: "sour cream", substitute_ingredient: "greek yogurt", notes: "Use 1:1 ratio. Tangy and protein-rich.", is_default: true },
];

/**
 * Get all default substitutions
 */
export async function getDefaultSubstitutions(): Promise<Substitution[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("substitutions")
    .select("*")
    .eq("is_default", true)
    .order("original_ingredient");

  if (error) {
    console.error("Error fetching default substitutions:", error);
  }

  if (data && data.length > 0) {
    return data as Substitution[];
  }

  return COMMON_SUBSTITUTIONS.map((sub, index) => ({
    ...sub,
    id: `common-${index}`,
  }));
}

/**
 * Get user's custom substitutions
 */
export async function getUserSubstitutions(): Promise<UserSubstitution[]> {
  const { user, error: authError } = await getCachedUserWithHousehold();

  if (authError || !user) {
    return [];
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_substitutions")
    .select("*")
    .eq("user_id", user.id)
    .order("original_ingredient");

  if (error) {
    console.error("Error fetching user substitutions:", error);
    return [];
  }

  return (data as UserSubstitution[]) || [];
}

export interface UserSubstitutionFormData {
  original_ingredient: string;
  substitute_ingredient: string;
  notes?: string;
}

// Create a user substitution
export async function createUserSubstitution(formData: UserSubstitutionFormData) {
  const { user } = await getCachedUserWithHousehold();

  // Only check if user exists - error might be from household/subscription lookup, not auth
  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_substitutions")
    .insert({
      user_id: user.id,
      original_ingredient: formData.original_ingredient.trim(),
      substitute_ingredient: formData.substitute_ingredient.trim(),
      notes: formData.notes?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  revalidatePath("/app/settings");
  return { error: null, data };
}

// Update a user substitution
export async function updateUserSubstitution(
  id: string,
  formData: Partial<UserSubstitutionFormData>
) {
  const { user } = await getCachedUserWithHousehold();

  // Only check if user exists - error might be from household/subscription lookup, not auth
  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  const updateData: Record<string, unknown> = {};
  if (formData.original_ingredient !== undefined)
    updateData.original_ingredient = formData.original_ingredient.trim();
  if (formData.substitute_ingredient !== undefined)
    updateData.substitute_ingredient = formData.substitute_ingredient.trim();
  if (formData.notes !== undefined)
    updateData.notes = formData.notes?.trim() || null;

  const { data, error } = await supabase
    .from("user_substitutions")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  revalidatePath("/app/settings");
  return { error: null, data };
}

// Delete a user substitution
export async function deleteUserSubstitution(id: string) {
  const { user } = await getCachedUserWithHousehold();

  // Only check if user exists - error might be from household/subscription lookup, not auth
  if (!user) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("user_substitutions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings");
  return { error: null };
}

/**
 * Normalize ingredient name for comparison
 */
function normalizeIngredientName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/s$/, ""); // Remove trailing 's' for plurals
}

/**
 * Get all substitutions for a user (defaults + user custom)
 */
async function getAllSubstitutions(): Promise<Substitution[]> {
  const [defaults, userSubs] = await Promise.all([
    getDefaultSubstitutions(),
    getUserSubstitutions(),
  ]);

  const userSubMap = new Map<string, UserSubstitution>();
  userSubs.forEach((sub) => {
    const key = normalizeIngredientName(sub.original_ingredient);
    userSubMap.set(key, sub);
  });

  const merged: Substitution[] = [];

  defaults.forEach((sub) => {
    const key = normalizeIngredientName(sub.original_ingredient);
    const userSub = userSubMap.get(key);
    if (userSub) {
      merged.push({
        id: userSub.id,
        original_ingredient: userSub.original_ingredient,
        substitute_ingredient: userSub.substitute_ingredient,
        notes: userSub.notes,
        is_default: false,
      });
    } else {
      merged.push(sub);
    }
  });

  userSubs.forEach((userSub) => {
    const key = normalizeIngredientName(userSub.original_ingredient);
    const hasDefault = defaults.some(
      (d) => normalizeIngredientName(d.original_ingredient) === key
    );
    if (!hasDefault) {
      merged.push({
        id: userSub.id,
        original_ingredient: userSub.original_ingredient,
        substitute_ingredient: userSub.substitute_ingredient,
        notes: userSub.notes,
        is_default: false,
      });
    }
  });

  return merged;
}

/**
 * Find substitutions for all ingredients in a recipe
 */
export async function findSubstitutionsForIngredients(
  ingredients: string[]
): Promise<Map<string, Substitution[]>> {
  const allSubs = await getAllSubstitutions();
  const result = new Map<string, Substitution[]>();

  for (const ingredient of ingredients) {
    const normalized = normalizeIngredientName(ingredient);
    const matches = allSubs.filter(
      (sub) => normalizeIngredientName(sub.original_ingredient) === normalized
    );

    if (matches.length > 0) {
      result.set(ingredient, matches);
    }
  }

  return result;
}

