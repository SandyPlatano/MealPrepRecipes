"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import { revalidatePath } from "next/cache";
import type {
  PrepSession,
  PrepSessionFormData,
  PrepSessionWithRecipes,
  PrepSessionRecipe,
  PrepSessionRecipeFormData,
  PrepSessionRecipeWithDetails,
  ContainerInventory,
  ContainerFormData,
  WeekVarietyScore,
  IngredientOverlap,
  PrepSessionOverlapAnalysis,
  RecipePrepData,
  PrepSessionStatus,
  PrepRecipeStatus,
} from "@/types/meal-prep";

// ============================================================================
// PREP SESSIONS
// ============================================================================

/**
 * Get all prep sessions for the user's household
 */
export async function getPrepSessions(options?: {
  status?: PrepSessionStatus;
  limit?: number;
}): Promise<{ error: string | null; data: PrepSession[] | null }> {
  const { user, householdId } = await getCachedUserWithHousehold();

  if (!user || !householdId) {
    return { error: "Not authenticated or no household", data: null };
  }

  const supabase = await createClient();

  let query = supabase
    .from("prep_sessions")
    .select("*")
    .eq("household_id", householdId)
    .order("scheduled_date", { ascending: false });

  if (options?.status) {
    query = query.eq("status", options.status);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching prep sessions:", error);
    return { error: error.message, data: null };
  }

  return { error: null, data: data as PrepSession[] };
}

/**
 * Get a single prep session with its recipes
 */
export async function getPrepSessionWithRecipes(
  sessionId: string
): Promise<{ error: string | null; data: PrepSessionWithRecipes | null }> {
  const { user, householdId } = await getCachedUserWithHousehold();

  if (!user || !householdId) {
    return { error: "Not authenticated or no household", data: null };
  }

  const supabase = await createClient();

  // Get the session
  const { data: session, error: sessionError } = await supabase
    .from("prep_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("household_id", householdId)
    .single();

  if (sessionError) {
    console.error("Error fetching prep session:", sessionError);
    return { error: sessionError.message, data: null };
  }

  // Get the recipes in this session
  const { data: sessionRecipes, error: recipesError } = await supabase
    .from("prep_session_recipes")
    .select(`
      *,
      recipe:recipe_id(
        id,
        title,
        image_url,
        prep_time,
        cook_time,
        ingredients
      )
    `)
    .eq("prep_session_id", sessionId)
    .order("prep_order");

  if (recipesError) {
    console.error("Error fetching session recipes:", recipesError);
    return { error: recipesError.message, data: null };
  }

  return {
    error: null,
    data: {
      ...session,
      recipes: sessionRecipes as PrepSessionRecipeWithDetails[],
    } as PrepSessionWithRecipes,
  };
}

/**
 * Create a new prep session
 */
export async function createPrepSession(
  formData: PrepSessionFormData
): Promise<{ error: string | null; data: PrepSession | null }> {
  const { user, householdId } = await getCachedUserWithHousehold();

  if (!user || !householdId) {
    return { error: "Not authenticated or no household", data: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("prep_sessions")
    .insert({
      household_id: householdId,
      user_id: user.id,
      name: formData.name,
      scheduled_date: formData.scheduled_date,
      estimated_total_time_minutes: formData.estimated_total_time_minutes ?? null,
      notes: formData.notes ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating prep session:", error);
    return { error: error.message, data: null };
  }

  revalidatePath("/app/prep");
  revalidatePath("/app/plan");

  return { error: null, data: data as PrepSession };
}

/**
 * Update a prep session
 */
export async function updatePrepSession(
  sessionId: string,
  updates: Partial<PrepSessionFormData> & { status?: PrepSessionStatus }
): Promise<{ error: string | null; data: PrepSession | null }> {
  const { user, householdId } = await getCachedUserWithHousehold();

  if (!user || !householdId) {
    return { error: "Not authenticated or no household", data: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("prep_sessions")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId)
    .eq("household_id", householdId)
    .select()
    .single();

  if (error) {
    console.error("Error updating prep session:", error);
    return { error: error.message, data: null };
  }

  revalidatePath("/app/prep");
  revalidatePath("/app/plan");

  return { error: null, data: data as PrepSession };
}

/**
 * Start a prep session (set status to in_progress)
 */
export async function startPrepSession(
  sessionId: string
): Promise<{ error: string | null; data: PrepSession | null }> {
  const { user, householdId } = await getCachedUserWithHousehold();

  if (!user || !householdId) {
    return { error: "Not authenticated or no household", data: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("prep_sessions")
    .update({
      status: "in_progress",
      actual_start_time: new Date().toISOString(),
    })
    .eq("id", sessionId)
    .eq("household_id", householdId)
    .select()
    .single();

  if (error) {
    console.error("Error starting prep session:", error);
    return { error: error.message, data: null };
  }

  revalidatePath("/app/prep");

  return { error: null, data: data as PrepSession };
}

/**
 * Complete a prep session
 */
export async function completePrepSession(
  sessionId: string
): Promise<{ error: string | null; data: PrepSession | null }> {
  const { user, householdId } = await getCachedUserWithHousehold();

  if (!user || !householdId) {
    return { error: "Not authenticated or no household", data: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("prep_sessions")
    .update({
      status: "completed",
      actual_end_time: new Date().toISOString(),
    })
    .eq("id", sessionId)
    .eq("household_id", householdId)
    .select()
    .single();

  if (error) {
    console.error("Error completing prep session:", error);
    return { error: error.message, data: null };
  }

  revalidatePath("/app/prep");

  return { error: null, data: data as PrepSession };
}

/**
 * Delete a prep session
 */
export async function deletePrepSession(
  sessionId: string
): Promise<{ error: string | null }> {
  const { user, householdId } = await getCachedUserWithHousehold();

  if (!user || !householdId) {
    return { error: "Not authenticated or no household" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("prep_sessions")
    .delete()
    .eq("id", sessionId)
    .eq("household_id", householdId);

  if (error) {
    console.error("Error deleting prep session:", error);
    return { error: error.message };
  }

  revalidatePath("/app/prep");

  return { error: null };
}

// ============================================================================
// PREP SESSION RECIPES
// ============================================================================

/**
 * Add a recipe to a prep session
 */
export async function addRecipeToPrepSession(
  sessionId: string,
  formData: PrepSessionRecipeFormData
): Promise<{ error: string | null; data: PrepSessionRecipe | null }> {
  const { user, householdId } = await getCachedUserWithHousehold();

  if (!user || !householdId) {
    return { error: "Not authenticated or no household", data: null };
  }

  const supabase = await createClient();

  // Get the highest prep_order in the session
  const { data: existingRecipes } = await supabase
    .from("prep_session_recipes")
    .select("prep_order")
    .eq("prep_session_id", sessionId)
    .order("prep_order", { ascending: false })
    .limit(1);

  const nextOrder = (existingRecipes?.[0]?.prep_order ?? -1) + 1;

  const { data, error } = await supabase
    .from("prep_session_recipes")
    .insert({
      prep_session_id: sessionId,
      recipe_id: formData.recipe_id,
      household_id: householdId,
      batch_multiplier: formData.batch_multiplier ?? 1,
      servings_to_prep: formData.servings_to_prep,
      prep_order: formData.prep_order ?? nextOrder,
      containers_needed: formData.containers_needed ?? 1,
      container_type: formData.container_type ?? null,
      notes: formData.notes ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding recipe to prep session:", error);
    return { error: error.message, data: null };
  }

  revalidatePath("/app/prep");

  return { error: null, data: data as PrepSessionRecipe };
}

/**
 * Update a recipe in a prep session
 */
export async function updatePrepSessionRecipe(
  sessionRecipeId: string,
  updates: Partial<PrepSessionRecipeFormData> & { status?: PrepRecipeStatus }
): Promise<{ error: string | null; data: PrepSessionRecipe | null }> {
  const { user, householdId } = await getCachedUserWithHousehold();

  if (!user || !householdId) {
    return { error: "Not authenticated or no household", data: null };
  }

  const supabase = await createClient();

  const updateData: Record<string, unknown> = { ...updates };

  // If marking as done, set completed_at
  if (updates.status === "done") {
    updateData.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("prep_session_recipes")
    .update(updateData)
    .eq("id", sessionRecipeId)
    .eq("household_id", householdId)
    .select()
    .single();

  if (error) {
    console.error("Error updating prep session recipe:", error);
    return { error: error.message, data: null };
  }

  revalidatePath("/app/prep");

  return { error: null, data: data as PrepSessionRecipe };
}

/**
 * Remove a recipe from a prep session
 */
export async function removeRecipeFromPrepSession(
  sessionRecipeId: string
): Promise<{ error: string | null }> {
  const { user, householdId } = await getCachedUserWithHousehold();

  if (!user || !householdId) {
    return { error: "Not authenticated or no household" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("prep_session_recipes")
    .delete()
    .eq("id", sessionRecipeId)
    .eq("household_id", householdId);

  if (error) {
    console.error("Error removing recipe from prep session:", error);
    return { error: error.message };
  }

  revalidatePath("/app/prep");

  return { error: null };
}

/**
 * Reorder recipes in a prep session
 */
export async function reorderPrepSessionRecipes(
  sessionId: string,
  orderedIds: string[]
): Promise<{ error: string | null }> {
  const { user, householdId } = await getCachedUserWithHousehold();

  if (!user || !householdId) {
    return { error: "Not authenticated or no household" };
  }

  const supabase = await createClient();

  // Update each recipe's prep_order
  const updates = orderedIds.map((id, index) =>
    supabase
      .from("prep_session_recipes")
      .update({ prep_order: index })
      .eq("id", id)
      .eq("household_id", householdId)
  );

  const results = await Promise.all(updates);

  const firstError = results.find((r) => r.error);
  if (firstError?.error) {
    console.error("Error reordering recipes:", firstError.error);
    return { error: firstError.error.message };
  }

  revalidatePath("/app/prep");

  return { error: null };
}

// ============================================================================
// CONTAINER INVENTORY
// ============================================================================

/**
 * Get all containers for the household
 */
export async function getContainerInventory(): Promise<{
  error: string | null;
  data: ContainerInventory[] | null;
}> {
  const { user, householdId } = await getCachedUserWithHousehold();

  if (!user || !householdId) {
    return { error: "Not authenticated or no household", data: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("container_inventory")
    .select("*")
    .eq("household_id", householdId)
    .order("container_type")
    .order("name");

  if (error) {
    console.error("Error fetching container inventory:", error);
    return { error: error.message, data: null };
  }

  return { error: null, data: data as ContainerInventory[] };
}

/**
 * Add a container to the inventory
 */
export async function addContainer(
  formData: ContainerFormData
): Promise<{ error: string | null; data: ContainerInventory | null }> {
  const { user, householdId } = await getCachedUserWithHousehold();

  if (!user || !householdId) {
    return { error: "Not authenticated or no household", data: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("container_inventory")
    .insert({
      household_id: householdId,
      name: formData.name,
      container_type: formData.container_type,
      size_oz: formData.size_oz ?? null,
      size_ml: formData.size_ml ?? null,
      size_label: formData.size_label ?? null,
      total_count: formData.total_count,
      available_count: formData.total_count, // Initially all available
      is_microwave_safe: formData.is_microwave_safe ?? true,
      is_freezer_safe: formData.is_freezer_safe ?? true,
      is_dishwasher_safe: formData.is_dishwasher_safe ?? true,
      has_dividers: formData.has_dividers ?? false,
      color: formData.color ?? null,
      brand: formData.brand ?? null,
      notes: formData.notes ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding container:", error);
    return { error: error.message, data: null };
  }

  revalidatePath("/app/prep");
  revalidatePath("/app/settings/household");

  return { error: null, data: data as ContainerInventory };
}

/**
 * Update a container
 */
export async function updateContainer(
  containerId: string,
  updates: Partial<ContainerFormData>
): Promise<{ error: string | null; data: ContainerInventory | null }> {
  const { user, householdId } = await getCachedUserWithHousehold();

  if (!user || !householdId) {
    return { error: "Not authenticated or no household", data: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("container_inventory")
    .update(updates)
    .eq("id", containerId)
    .eq("household_id", householdId)
    .select()
    .single();

  if (error) {
    console.error("Error updating container:", error);
    return { error: error.message, data: null };
  }

  revalidatePath("/app/prep");
  revalidatePath("/app/settings/household");

  return { error: null, data: data as ContainerInventory };
}

/**
 * Delete a container
 */
export async function deleteContainer(
  containerId: string
): Promise<{ error: string | null }> {
  const { user, householdId } = await getCachedUserWithHousehold();

  if (!user || !householdId) {
    return { error: "Not authenticated or no household" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("container_inventory")
    .delete()
    .eq("id", containerId)
    .eq("household_id", householdId);

  if (error) {
    console.error("Error deleting container:", error);
    return { error: error.message };
  }

  revalidatePath("/app/prep");
  revalidatePath("/app/settings/household");

  return { error: null };
}

// ============================================================================
// RECIPE PREP DATA
// ============================================================================

/**
 * Update prep data for a recipe
 */
export async function updateRecipePrepData(
  recipeId: string,
  prepData: RecipePrepData
): Promise<{ error: string | null }> {
  const { user, householdId } = await getCachedUserWithHousehold();

  if (!user || !householdId) {
    return { error: "Not authenticated or no household" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("recipes")
    .update({ prep_data: prepData })
    .eq("id", recipeId)
    .eq("household_id", householdId);

  if (error) {
    console.error("Error updating recipe prep data:", error);
    return { error: error.message };
  }

  revalidatePath("/app/recipes");
  revalidatePath(`/app/recipes/${recipeId}`);

  return { error: null };
}

// ============================================================================
// INGREDIENT OVERLAP ANALYSIS
// ============================================================================

/**
 * Analyze ingredient overlap for a prep session
 */
export async function analyzeIngredientOverlap(
  sessionId: string
): Promise<{ error: string | null; data: PrepSessionOverlapAnalysis | null }> {
  const { user, householdId } = await getCachedUserWithHousehold();

  if (!user || !householdId) {
    return { error: "Not authenticated or no household", data: null };
  }

  const supabase = await createClient();

  // Get all recipes in the session with their ingredients
  const { data: sessionRecipes, error } = await supabase
    .from("prep_session_recipes")
    .select(`
      id,
      recipe_id,
      batch_multiplier,
      recipe:recipe_id(
        id,
        title,
        ingredients
      )
    `)
    .eq("prep_session_id", sessionId);

  if (error) {
    console.error("Error fetching session recipes for overlap:", error);
    return { error: error.message, data: null };
  }

  // Build ingredient map
  const ingredientMap = new Map<string, IngredientOverlap>();

  for (const sessionRecipe of sessionRecipes || []) {
    // Supabase joins can return arrays - handle both cases
    const rawRecipe = sessionRecipe.recipe;
    const recipe = (Array.isArray(rawRecipe) ? rawRecipe[0] : rawRecipe) as
      | { id: string; title: string; ingredients: string[] }
      | null;
    if (!recipe?.ingredients) continue;

    for (const ingredient of recipe.ingredients) {
      // Normalize ingredient (lowercase, trim, remove quantities)
      const normalized = normalizeIngredient(ingredient);

      if (!ingredientMap.has(normalized)) {
        ingredientMap.set(normalized, {
          ingredient: ingredient,
          normalized,
          recipes: [],
          total_quantity_hint: null,
        });
      }

      ingredientMap.get(normalized)!.recipes.push({
        recipe_id: recipe.id,
        recipe_title: recipe.title,
        quantity: ingredient,
      });
    }
  }

  // Filter to only overlapping ingredients (used in 2+ recipes)
  const overlappingIngredients = Array.from(ingredientMap.values()).filter(
    (overlap) => overlap.recipes.length > 1
  );

  // Calculate unique ingredients count
  const uniqueIngredientsCount = ingredientMap.size;

  // Calculate overlap savings estimate
  const overlapCount = overlappingIngredients.reduce(
    (sum, overlap) => sum + overlap.recipes.length - 1,
    0
  );
  const totalIngredientUses = sessionRecipes?.reduce(
    (sum, sr) => {
      const rawRecipe = sr.recipe;
      const recipe = (Array.isArray(rawRecipe) ? rawRecipe[0] : rawRecipe) as
        | { ingredients: string[] }
        | null;
      return sum + (recipe?.ingredients?.length || 0);
    },
    0
  ) || 0;

  const overlapPercentage =
    totalIngredientUses > 0
      ? Math.round((overlapCount / totalIngredientUses) * 100)
      : 0;

  return {
    error: null,
    data: {
      session_id: sessionId,
      overlapping_ingredients: overlappingIngredients,
      unique_ingredients_count: uniqueIngredientsCount,
      overlap_savings_estimate: `~${overlapPercentage}% ingredient overlap`,
    },
  };
}

/**
 * Normalize an ingredient for comparison
 */
function normalizeIngredient(ingredient: string): string {
  return ingredient
    .toLowerCase()
    .replace(/^\d+[\s\/\d]*(?:cup|tbsp|tsp|oz|lb|g|kg|ml|l|piece|slice|clove|can|bunch|package|pkg)?\s*/i, "")
    .replace(/,.*$/, "") // Remove anything after comma
    .replace(/\(.*\)/, "") // Remove parenthetical notes
    .trim();
}

// ============================================================================
// WEEK VARIETY SCORE
// ============================================================================

/**
 * Calculate variety score for a week
 */
export async function calculateWeekVarietyScore(
  weekStart: string
): Promise<{ error: string | null; data: WeekVarietyScore | null }> {
  const { user, householdId } = await getCachedUserWithHousehold();

  if (!user || !householdId) {
    return { error: "Not authenticated or no household", data: null };
  }

  const supabase = await createClient();

  // Get all meal assignments for the week
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const { data: assignments, error } = await supabase
    .from("meal_assignments")
    .select(`
      recipe_id,
      recipe:recipe_id(
        protein_type,
        category,
        tags
      )
    `)
    .gte("date", weekStart)
    .lte("date", weekEnd.toISOString().split("T")[0]);

  if (error) {
    console.error("Error fetching meal assignments:", error);
    return { error: error.message, data: null };
  }

  // Extract unique values
  const proteins = new Set<string>();
  const categories = new Set<string>();
  const cuisines = new Set<string>();

  for (const assignment of assignments || []) {
    // Supabase joins can return arrays - handle both cases
    const rawRecipe = assignment.recipe;
    const recipe = (Array.isArray(rawRecipe) ? rawRecipe[0] : rawRecipe) as {
      protein_type: string | null;
      category: string | null;
      tags: string[];
    } | null;

    if (recipe?.protein_type) proteins.add(recipe.protein_type);
    if (recipe?.category) categories.add(recipe.category);

    // Extract cuisine from tags
    const cuisineTags = (recipe?.tags || []).filter((tag) =>
      ["italian", "mexican", "asian", "indian", "mediterranean", "american", "french", "thai", "japanese", "chinese", "korean", "greek"].includes(
        tag.toLowerCase()
      )
    );
    cuisineTags.forEach((c) => cuisines.add(c));
  }

  // Calculate scores (simple: more variety = higher score)
  const proteinScore = Math.min(100, proteins.size * 20); // 5 proteins = 100
  const categoryScore = Math.min(100, categories.size * 15); // ~7 categories = 100
  const cuisineScore = Math.min(100, cuisines.size * 25); // 4 cuisines = 100
  const overallScore = Math.round((proteinScore + categoryScore + cuisineScore) / 3);

  // Generate suggestions
  const suggestions: WeekVarietyScore["suggestions"] = [];

  if (proteins.size < 3) {
    suggestions.push({
      type: "protein",
      message: "Try adding more protein variety. Consider fish, tofu, or legumes.",
      priority: "medium",
    });
  }

  if (cuisines.size < 2) {
    suggestions.push({
      type: "cuisine",
      message: "Mix up your cuisines! Try a recipe from a different culture.",
      priority: "low",
    });
  }

  // Upsert the score
  const { data: scoreData, error: upsertError } = await supabase
    .from("week_variety_scores")
    .upsert(
      {
        household_id: householdId,
        week_start: weekStart,
        protein_variety_score: proteinScore,
        cuisine_variety_score: cuisineScore,
        category_variety_score: categoryScore,
        overall_score: overallScore,
        proteins_used: Array.from(proteins),
        cuisines_used: Array.from(cuisines),
        categories_used: Array.from(categories),
        suggestions: suggestions,
        calculated_at: new Date().toISOString(),
      },
      {
        onConflict: "household_id,week_start",
      }
    )
    .select()
    .single();

  if (upsertError) {
    console.error("Error upserting variety score:", upsertError);
    return { error: upsertError.message, data: null };
  }

  return { error: null, data: scoreData as WeekVarietyScore };
}

/**
 * Get cached variety score for a week
 */
export async function getWeekVarietyScore(
  weekStart: string
): Promise<{ error: string | null; data: WeekVarietyScore | null }> {
  const { user, householdId } = await getCachedUserWithHousehold();

  if (!user || !householdId) {
    return { error: "Not authenticated or no household", data: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("week_variety_scores")
    .select("*")
    .eq("household_id", householdId)
    .eq("week_start", weekStart)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows found
    console.error("Error fetching variety score:", error);
    return { error: error.message, data: null };
  }

  return { error: null, data: (data as WeekVarietyScore) ?? null };
}
