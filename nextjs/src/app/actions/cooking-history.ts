"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  CookingHistoryEntry,
  CookingHistoryWithRecipe,
  RecipeStats,
  MarkAsCookedInput,
} from "@/types/cooking-history";

export async function markAsCooked(input: MarkAsCookedInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  // Get user's household
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return { error: "No household found" };
  }

  const { data, error } = await supabase
    .from("cooking_history")
    .insert({
      recipe_id: input.recipe_id,
      household_id: membership.household_id,
      cooked_by: user.id,
      cooked_at: input.cooked_at || new Date().toISOString(),
      rating: input.rating || null,
      notes: input.notes || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error marking as cooked:", error);
    return { error: "Failed to mark recipe as cooked" };
  }

  revalidatePath("/app/recipes");
  revalidatePath("/app/stats");
  return { data: data as CookingHistoryEntry };
}

export async function updateCookingHistoryEntry(
  id: string,
  updates: { rating?: number; notes?: string }
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("cooking_history")
    .update({
      rating: updates.rating,
      notes: updates.notes,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating cooking history:", error);
    return { error: "Failed to update entry" };
  }

  revalidatePath("/app/recipes");
  revalidatePath("/app/stats");
  return { data: data as CookingHistoryEntry };
}

export async function deleteCookingHistoryEntry(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("cooking_history")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting cooking history:", error);
    return { error: "Failed to delete entry" };
  }

  revalidatePath("/app/recipes");
  revalidatePath("/app/stats");
  return { success: true };
}

export async function getCookingHistory(limit?: number) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated", data: [] };
  }

  // Get user's household
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return { error: "No household found", data: [] };
  }

  let query = supabase
    .from("cooking_history")
    .select(
      `
      *,
      recipe:recipes(id, title, recipe_type, category, protein_type),
      cooked_by_profile:profiles!cooking_history_cooked_by_fkey(name)
    `
    )
    .eq("household_id", membership.household_id)
    .order("cooked_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching cooking history:", error);
    return { error: "Failed to fetch cooking history", data: [] };
  }

  return { data: data as CookingHistoryWithRecipe[] };
}

export async function getRecipeHistory(recipeId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated", data: [] };
  }

  const { data, error } = await supabase
    .from("cooking_history")
    .select(
      `
      *,
      cooked_by_profile:profiles!cooking_history_cooked_by_fkey(name)
    `
    )
    .eq("recipe_id", recipeId)
    .order("cooked_at", { ascending: false });

  if (error) {
    console.error("Error fetching recipe history:", error);
    return { error: "Failed to fetch recipe history", data: [] };
  }

  return { data };
}

export async function getRecipeStats(): Promise<{ data: RecipeStats | null; error?: string }> {
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
    .single();

  if (!membership) {
    return { error: "No household found", data: null };
  }

  // Get all cooking history with recipe details
  const { data: history, error } = await supabase
    .from("cooking_history")
    .select(
      `
      *,
      recipe:recipes(id, title, recipe_type, category, protein_type),
      cooked_by_profile:profiles!cooking_history_cooked_by_fkey(name)
    `
    )
    .eq("household_id", membership.household_id)
    .order("cooked_at", { ascending: false });

  if (error) {
    console.error("Error fetching stats:", error);
    return { error: "Failed to fetch stats", data: null };
  }

  const typedHistory = history as CookingHistoryWithRecipe[];

  // Calculate stats
  const totalMealsCooked = typedHistory.length;

  // Meals this month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const mealsThisMonth = typedHistory.filter(
    (h) => new Date(h.cooked_at) >= startOfMonth
  ).length;

  // Average rating
  const ratings = typedHistory
    .filter((h) => h.rating !== null)
    .map((h) => h.rating as number);
  const averageRating =
    ratings.length > 0
      ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
      : null;

  // Top recipe (most cooked)
  const recipeCounts: Record<string, { id: string; title: string; count: number }> = {};
  typedHistory.forEach((h) => {
    if (h.recipe) {
      const key = h.recipe.id;
      if (!recipeCounts[key]) {
        recipeCounts[key] = { id: h.recipe.id, title: h.recipe.title, count: 0 };
      }
      recipeCounts[key].count++;
    }
  });
  const topRecipe =
    Object.values(recipeCounts).sort((a, b) => b.count - a.count)[0] || null;

  // Favorite protein
  const proteinCounts: Record<string, number> = {};
  typedHistory.forEach((h) => {
    const protein = h.recipe?.protein_type || h.recipe?.category;
    if (protein) {
      proteinCounts[protein] = (proteinCounts[protein] || 0) + 1;
    }
  });
  const sortedProteins = Object.entries(proteinCounts).sort(
    ([, a], [, b]) => b - a
  );
  const favoriteProtein = sortedProteins[0]
    ? { type: sortedProteins[0][0], count: sortedProteins[0][1] }
    : null;

  // Recipe type breakdown
  const typeCounts: Record<string, number> = {};
  typedHistory.forEach((h) => {
    const type = h.recipe?.recipe_type || "Unknown";
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });
  const recipeTypeBreakdown = Object.entries(typeCounts)
    .map(([type, count]) => ({
      type,
      count,
      percentage: totalMealsCooked > 0 ? Math.round((count / totalMealsCooked) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Recent history (last 10)
  const recentHistory = typedHistory.slice(0, 10);

  return {
    data: {
      totalMealsCooked,
      mealsThisMonth,
      averageRating,
      topRecipe,
      favoriteProtein,
      recipeTypeBreakdown,
      recentHistory,
    },
  };
}
