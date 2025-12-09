import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// GET /api/recipes/[id] - Get a single recipe
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { data: recipe, error } = await supabase
      .from("recipes")
      .select("*")
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
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
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

    const { data: recipe, error } = await supabase
      .from("recipes")
      .update(updateData)
      .eq("id", id)
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
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { error } = await supabase
      .from("recipes")
      .delete()
      .eq("id", id);

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

