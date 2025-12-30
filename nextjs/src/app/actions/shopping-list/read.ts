"use server";

import { createClient } from "@/lib/supabase/server";
import type {
  ShoppingList,
  ShoppingListItem,
  ShoppingListWithItems,
} from "@/types/shopping-list";
import { getWeekStart } from "@/types/meal-plan";

/**
 * Get or create the current shopping list for the household
 * Automatically links to the current week's meal plan
 */
export async function getOrCreateShoppingList() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Not authenticated", data: null };
    }

    // Get user's household
    const { data: membership } = await supabase
      .from("household_members")
      .select("household_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!membership) {
      return { error: "No household found", data: null };
    }

    // Get the current week start
    const weekStart = getWeekStart(new Date());
    const weekStartStr = weekStart.toISOString().split("T")[0];

    // Find or create the current week's meal plan
    let { data: mealPlan } = await supabase
      .from("meal_plans")
      .select("id, household_id, week_start, sent_at, created_at, updated_at")
      .eq("household_id", membership.household_id)
      .eq("week_start", weekStartStr)
      .maybeSingle();

    if (!mealPlan) {
      // Create meal plan for this week
      const { data: newPlan, error: planError } = await supabase
        .from("meal_plans")
        .insert({
          household_id: membership.household_id,
          week_start: weekStartStr,
        })
        .select("id, household_id, week_start, sent_at, created_at, updated_at")
        .single();

      if (planError || !newPlan) {
        return { error: planError?.message || "Failed to create meal plan", data: null };
      }
      mealPlan = newPlan;
    }

    // Try to get existing shopping list linked to this meal plan
    let { data: shoppingList } = await supabase
      .from("shopping_lists")
      .select("id, household_id, meal_plan_id, created_at, updated_at")
      .eq("meal_plan_id", mealPlan.id)
      .maybeSingle();

    // Create if doesn't exist
    if (!shoppingList) {
      const { data: newList, error } = await supabase
        .from("shopping_lists")
        .insert({
          household_id: membership.household_id,
          meal_plan_id: mealPlan.id,
        })
        .select()
        .single();

      if (error) {
        return { error: error.message, data: null };
      }
      shoppingList = newList;
    }

    return { error: null, data: shoppingList as ShoppingList };
  } catch (error) {
    console.error("getOrCreateShoppingList error:", error);
    return { error: "Failed to load shopping list. Please try again.", data: null };
  }
}

/**
 * Get shopping list with all items
 */
export async function getShoppingListWithItems(): Promise<{
  error: string | null;
  data: ShoppingListWithItems | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  // Get user's household
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) {
    return { error: "No household found", data: null };
  }

  // Get or create shopping list
  const listResult = await getOrCreateShoppingList();
  if (listResult.error || !listResult.data) {
    return { error: listResult.error, data: null };
  }

  // Get items
  const { data: items, error } = await supabase
    .from("shopping_list_items")
    .select("id, shopping_list_id, ingredient, quantity, unit, category, is_checked, recipe_id, recipe_title, created_at, substituted_from, substitution_log_id")
    .eq("shopping_list_id", listResult.data.id)
    .order("category")
    .order("ingredient");

  if (error) {
    return { error: error.message, data: null };
  }

  return {
    error: null,
    data: {
      ...listResult.data,
      items: (items || []) as ShoppingListItem[],
    },
  };
}
