import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import { assertValidOrigin } from "@/lib/security/csrf";

export const dynamic = "force-dynamic";

/**
 * Check if user has read access to a recipe
 * User can access: own recipes, household-shared recipes, or public recipes
 */
function canReadRecipe(
  recipe: { user_id: string; household_id: string | null; is_shared_with_household: boolean | null; is_public: boolean | null },
  userId: string,
  householdId: string | null
): boolean {
  // Owner can always read
  if (recipe.user_id === userId) return true;

  // Public recipes are readable by all
  if (recipe.is_public) return true;

  // Household-shared recipes are readable by household members
  if (
    householdId &&
    recipe.household_id === householdId &&
    recipe.is_shared_with_household
  ) {
    return true;
  }

  return false;
}

/**
 * Check if user can modify/delete a recipe
 * Only the owner can modify or delete
 */
function canModifyRecipe(recipe: { user_id: string }, userId: string): boolean {
  return recipe.user_id === userId;
}

// GET /api/recipes/[id] - Get a single recipe
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get user and household context
    const { user, householdId, error: authError } = await getCachedUserWithHousehold();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { data: recipe, error } = await supabase
      .from("recipes")
      .select("id, title, recipe_type, category, protein_type, prep_time, cook_time, servings, base_servings, ingredients, instructions, tags, notes, source_url, image_url, rating, allergen_tags, user_id, household_id, is_shared_with_household, is_public, share_token, view_count, original_recipe_id, original_author_id, avg_rating, review_count, created_at, updated_at")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Recipe not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // SECURITY: Verify user has access to this recipe
    if (!canReadRecipe(recipe, user.id, householdId)) {
      return NextResponse.json(
        { error: "Recipe not found" }, // Don't reveal existence
        { status: 404 }
      );
    }

    return NextResponse.json(recipe);
  } catch (error) {
    console.error("Error fetching recipe:", error);
    return NextResponse.json(
      { error: "Failed to fetch recipe" },
      { status: 500 }
    );
  }
}

// PUT /api/recipes/[id] - Update a recipe
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // SECURITY: Validate request origin to prevent CSRF attacks
  const csrfError = assertValidOrigin(request);
  if (csrfError) return csrfError;

  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get user context
    const { user, error: authError } = await getCachedUserWithHousehold();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // SECURITY: First verify ownership before allowing update
    const { data: existingRecipe, error: fetchError } = await supabase
      .from("recipes")
      .select("id, user_id")
      .eq("id", id)
      .single();

    if (fetchError || !existingRecipe) {
      return NextResponse.json(
        { error: "Recipe not found" },
        { status: 404 }
      );
    }

    if (!canModifyRecipe(existingRecipe, user.id)) {
      return NextResponse.json(
        { error: "Not authorized to modify this recipe" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Map incoming fields to database schema
    const updateData: Record<string, unknown> = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.recipe_type !== undefined || body.recipeType !== undefined) {
      updateData.recipe_type = body.recipe_type || body.recipeType;
    }
    if (body.category !== undefined) updateData.category = body.category;
    if (body.prep_time !== undefined || body.prepTime !== undefined) {
      updateData.prep_time = body.prep_time || body.prepTime;
    }
    if (body.cook_time !== undefined || body.cookTime !== undefined) {
      updateData.cook_time = body.cook_time || body.cookTime;
    }
    if (body.cook_time_minutes !== undefined || body.cookTimeMinutes !== undefined) {
      updateData.cook_time = `${body.cook_time_minutes || body.cookTimeMinutes} minutes`;
    }
    if (body.servings !== undefined) {
      updateData.servings = body.servings.toString();
      updateData.base_servings = typeof body.servings === "number" ? body.servings : parseInt(body.servings) || 4;
    }
    if (body.ingredients !== undefined) {
      updateData.ingredients = Array.isArray(body.ingredients)
        ? body.ingredients.map((i: unknown) => typeof i === "string" ? i : `${(i as Record<string, string>).quantity || ""} ${(i as Record<string, string>).unit || ""} ${(i as Record<string, string>).name}`.trim())
        : [];
    }
    if (body.instructions !== undefined) {
      updateData.instructions = Array.isArray(body.instructions) ? body.instructions : [];
    }
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.source_url !== undefined || body.sourceUrl !== undefined) {
      updateData.source_url = body.source_url || body.sourceUrl;
    }
    if (body.is_favorite !== undefined) updateData.is_favorite = body.is_favorite;
    if (body.rating !== undefined) updateData.rating = body.rating;
    if (body.rating_count !== undefined) updateData.rating_count = body.rating_count;

    // Update with user_id constraint for additional safety
    const { data: recipe, error } = await supabase
      .from("recipes")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id) // Double-check ownership in query
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Recipe not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(recipe);
  } catch (error) {
    console.error("Error updating recipe:", error);
    return NextResponse.json(
      { error: "Failed to update recipe" },
      { status: 500 }
    );
  }
}

// DELETE /api/recipes/[id] - Delete a recipe
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // SECURITY: Validate request origin to prevent CSRF attacks
  const csrfError = assertValidOrigin(request);
  if (csrfError) return csrfError;

  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get user context
    const { user, error: authError } = await getCachedUserWithHousehold();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // SECURITY: First verify ownership before allowing delete
    const { data: existingRecipe, error: fetchError } = await supabase
      .from("recipes")
      .select("id, user_id")
      .eq("id", id)
      .single();

    if (fetchError || !existingRecipe) {
      return NextResponse.json(
        { error: "Recipe not found" },
        { status: 404 }
      );
    }

    if (!canModifyRecipe(existingRecipe, user.id)) {
      return NextResponse.json(
        { error: "Not authorized to delete this recipe" },
        { status: 403 }
      );
    }

    // Delete with user_id constraint for additional safety
    const { error } = await supabase
      .from("recipes")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id); // Double-check ownership in query

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting recipe:", error);
    return NextResponse.json(
      { error: "Failed to delete recipe" },
      { status: 500 }
    );
  }
}

