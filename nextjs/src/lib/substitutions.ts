/**
 * Ingredient substitution utilities
 * Provides built-in substitutions and user-defined preferences
 */

import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import { normalizeIngredientName } from "./ingredient-scaler";

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
    return [];
  }

  return (data as Substitution[]) || [];
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

/**
 * Get all substitutions for a user (defaults + user custom)
 * User substitutions take precedence over defaults
 */
export async function getAllSubstitutions(): Promise<Substitution[]> {
  const [defaults, userSubs] = await Promise.all([
    getDefaultSubstitutions(),
    getUserSubstitutions(),
  ]);

  const userSubMap = new Map<string, UserSubstitution>();
  userSubs.forEach((sub) => {
    const key = normalizeIngredientName(sub.original_ingredient);
    userSubMap.set(key, sub);
  });

  // Merge: use user substitutions if they exist, otherwise use defaults
  const merged: Substitution[] = [];

  // Add all defaults
  defaults.forEach((sub) => {
    const key = normalizeIngredientName(sub.original_ingredient);
    const userSub = userSubMap.get(key);
    if (userSub) {
      // User has a custom substitution for this ingredient
      merged.push({
        id: userSub.id,
        original_ingredient: userSub.original_ingredient,
        substitute_ingredient: userSub.substitute_ingredient,
        notes: userSub.notes,
        is_default: false,
      });
    } else {
      // Use default
      merged.push(sub);
    }
  });

  // Add user substitutions that don't have defaults
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
 * Find substitutions for a specific ingredient
 */
export async function findSubstitutionsForIngredient(
  ingredient: string
): Promise<Substitution[]> {
  const allSubs = await getAllSubstitutions();
  const normalized = normalizeIngredientName(ingredient);

  return allSubs.filter(
    (sub) => normalizeIngredientName(sub.original_ingredient) === normalized
  );
}

/**
 * Find substitutions for all ingredients in a recipe
 * Returns a map of ingredient -> substitutions[]
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

/**
 * Extract base ingredient name from ingredient string
 * Similar to allergen detector but focused on substitution matching
 */
function extractIngredientForSubstitution(ingredient: string): string {
  const normalized = normalizeIngredientName(ingredient);

  // Remove quantity and unit patterns
  const withoutQuantity = normalized.replace(
    /^[\d\s\/\.-]+\s+(cup|cups|tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons|oz|ounce|ounces|lb|lbs|pound|pounds|g|gram|grams|kg|kilogram|kilograms|ml|milliliter|milliliters|l|liter|liters|can|cans|package|packages|pkg|bunch|bunches|head|heads|large|medium|small|slice|slices|piece|pieces|clove|cloves)\s+/i,
    ""
  );

  // Get the first meaningful word (usually the ingredient name)
  const words = withoutQuantity.split(/[\s,]+/);
  return words.find((w) => w.length > 2) || words[0] || normalized;
}

/**
 * Check if an ingredient has substitutions available
 */
export async function hasSubstitutions(ingredient: string): Promise<boolean> {
  const subs = await findSubstitutionsForIngredient(ingredient);
  return subs.length > 0;
}

