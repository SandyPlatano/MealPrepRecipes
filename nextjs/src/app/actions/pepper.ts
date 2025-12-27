"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { PepperRecipeSuggestion } from "@/types/pepper";

/**
 * Search user's recipes by ingredients or tags
 */
export async function searchRecipes(params: {
  ingredients?: string[];
  tags?: string[];
  query?: string;
  limit?: number;
}): Promise<{ data: PepperRecipeSuggestion[]; error?: string }> {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [], error: "Unauthorized" };

    // Get household
    const { data: membership } = await supabase
      .from("household_members")
      .select("household_id")
      .eq("user_id", user.id)
      .single();

    if (!membership) return { data: [], error: "Household not found" };

    // Query recipes
    let query = supabase
      .from("recipes")
      .select("id, title, ingredients, tags, prep_time, cook_time, rating")
      .eq("household_id", membership.household_id);

    // Apply text search if query provided
    if (params.query) {
      query = query.ilike("title", `%${params.query}%`);
    }

    const { data: recipes, error } = await query
      .order("rating", { ascending: false, nullsFirst: false })
      .limit(params.limit || 10);

    if (error) {
      console.error("Recipe search error:", error);
      return { data: [], error: "Failed to search recipes" };
    }

    // Filter by ingredients if provided
    let filteredRecipes = recipes || [];

    if (params.ingredients && params.ingredients.length > 0) {
      const searchIngredients = params.ingredients.map((i) => i.toLowerCase());

      filteredRecipes = filteredRecipes.filter((recipe) => {
        const recipeIngredients = (recipe.ingredients || []).map((i: { name?: string }) =>
          (i.name || "").toLowerCase()
        );

        // Check if any search ingredient matches
        return searchIngredients.some((searchIng) =>
          recipeIngredients.some((recipeIng: string) => recipeIng.includes(searchIng))
        );
      });
    }

    // Filter by tags if provided
    if (params.tags && params.tags.length > 0) {
      const searchTags = params.tags.map((t) => t.toLowerCase());

      filteredRecipes = filteredRecipes.filter((recipe) => {
        const recipeTags = (recipe.tags || []).map((t: string) => t.toLowerCase());
        return searchTags.some((searchTag) => recipeTags.includes(searchTag));
      });
    }

    // Calculate pantry match percentage (simplified - would need pantry data)
    const suggestions: PepperRecipeSuggestion[] = filteredRecipes.map((r) => ({
      id: r.id,
      title: r.title,
      match_reason: r.rating && r.rating >= 4 ? "Highly rated favorite" : "Matches your search",
      prep_time: r.prep_time || 15,
      cook_time: r.cook_time || 0,
      pantry_match_percentage: 75, // Placeholder
      missing_ingredients: [], // Would calculate from pantry
    }));

    return { data: suggestions };
  } catch (error) {
    console.error("Search recipes error:", error);
    return { data: [], error: "Failed to search recipes" };
  }
}

/**
 * Add a recipe to the user's meal plan
 */
export async function addToMealPlan(params: {
  recipe_id: string;
  day: string;
  meal_type: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    // Get household
    const { data: membership } = await supabase
      .from("household_members")
      .select("household_id")
      .eq("user_id", user.id)
      .single();

    if (!membership) return { success: false, error: "Household not found" };

    // Get or create meal plan for current week
    const weekStart = getWeekStart();

    let { data: mealPlan } = await supabase
      .from("meal_plans")
      .select("id")
      .eq("household_id", membership.household_id)
      .eq("week_start", weekStart)
      .single();

    if (!mealPlan) {
      const { data: newPlan, error: planError } = await supabase
        .from("meal_plans")
        .insert({
          household_id: membership.household_id,
          user_id: user.id,
          week_start: weekStart,
        })
        .select()
        .single();

      if (planError || !newPlan) {
        console.error("Create meal plan error:", planError);
        return { success: false, error: "Failed to create meal plan" };
      }

      mealPlan = newPlan;
    }

    // Safety check - should never happen after the logic above
    if (!mealPlan) {
      return { success: false, error: "Failed to get or create meal plan" };
    }

    // Add or update meal assignment
    const { error: assignError } = await supabase
      .from("meal_assignments")
      .upsert(
        {
          meal_plan_id: mealPlan.id,
          recipe_id: params.recipe_id,
          day: params.day,
          meal_type: params.meal_type,
          household_id: membership.household_id,
        },
        { onConflict: "meal_plan_id,day,meal_type" }
      );

    if (assignError) {
      console.error("Meal assignment error:", assignError);
      return { success: false, error: "Failed to add to meal plan" };
    }

    revalidatePath("/app/plan");
    return { success: true };
  } catch (error) {
    console.error("Add to meal plan error:", error);
    return { success: false, error: "Failed to add to meal plan" };
  }
}

/**
 * Add items to the shopping list
 */
export async function addToShoppingList(params: {
  items: string[];
}): Promise<{ success: boolean; added_count: number; error?: string }> {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, added_count: 0, error: "Unauthorized" };

    // Get household
    const { data: membership } = await supabase
      .from("household_members")
      .select("household_id")
      .eq("user_id", user.id)
      .single();

    if (!membership) return { success: false, added_count: 0, error: "Household not found" };

    // Get or create active shopping list
    let { data: shoppingList } = await supabase
      .from("shopping_lists")
      .select("id")
      .eq("household_id", membership.household_id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!shoppingList) {
      const { data: newList, error: listError } = await supabase
        .from("shopping_lists")
        .insert({
          household_id: membership.household_id,
          user_id: user.id,
          name: `Shopping List - ${new Date().toLocaleDateString()}`,
          status: "active",
        })
        .select()
        .single();

      if (listError) {
        console.error("Create shopping list error:", listError);
        return { success: false, added_count: 0, error: "Failed to create shopping list" };
      }

      shoppingList = newList;
    }

    // Add items
    const itemsToInsert = params.items.map((item) => ({
      shopping_list_id: shoppingList!.id,
      name: item,
      quantity: 1,
      is_checked: false,
      category: "Other", // Could improve with ingredient categorization
    }));

    const { error: insertError } = await supabase
      .from("shopping_list_items")
      .insert(itemsToInsert);

    if (insertError) {
      console.error("Insert shopping items error:", insertError);
      return { success: false, added_count: 0, error: "Failed to add items" };
    }

    revalidatePath("/app/shop");
    return { success: true, added_count: params.items.length };
  } catch (error) {
    console.error("Add to shopping list error:", error);
    return { success: false, added_count: 0, error: "Failed to add to shopping list" };
  }
}

/**
 * Get recipe details by ID
 */
export async function getRecipeDetails(recipeId: string): Promise<{
  data: {
    id: string;
    title: string;
    ingredients: { name: string; amount: string; unit: string }[];
    instructions: string[];
    prep_time: number;
    cook_time: number;
    servings: number;
  } | null;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: "Unauthorized" };

    const { data: recipe, error } = await supabase
      .from("recipes")
      .select("id, title, ingredients, instructions, prep_time, cook_time, servings")
      .eq("id", recipeId)
      .single();

    if (error) {
      console.error("Get recipe error:", error);
      return { data: null, error: "Recipe not found" };
    }

    return {
      data: {
        id: recipe.id,
        title: recipe.title,
        ingredients: recipe.ingredients || [],
        instructions: recipe.instructions || [],
        prep_time: recipe.prep_time || 15,
        cook_time: recipe.cook_time || 0,
        servings: recipe.servings || 4,
      },
    };
  } catch (error) {
    console.error("Get recipe details error:", error);
    return { data: null, error: "Failed to get recipe details" };
  }
}

/**
 * Get Monday of current week
 */
function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split("T")[0];
}
