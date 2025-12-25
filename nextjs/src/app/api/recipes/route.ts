import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// GET /api/recipes - List all recipes for the authenticated user
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { data: recipes, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(recipes);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch recipes" },
      { status: 500 }
    );
  }
}

// POST /api/recipes - Create a new recipe
export async function POST(request: NextRequest) {
  try {
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
    const recipeData = {
      user_id: user.id,
      title: body.title,
      description: body.description || null,
      recipe_type: body.recipe_type || body.recipeType || "Dinner",
      category: body.category || "Other",
      prep_time: body.prep_time || body.prepTime || null,
      cook_time: body.cook_time || body.cookTime || `${body.cook_time_minutes || body.cookTimeMinutes || 30} minutes`,
      servings: body.servings?.toString() || "4",
      base_servings: typeof body.servings === "number" ? body.servings : parseInt(body.servings) || 4,
      ingredients: Array.isArray(body.ingredients) 
        ? body.ingredients.map((i: unknown) => typeof i === "string" ? i : `${(i as Record<string, string>).quantity || ""} ${(i as Record<string, string>).unit || ""} ${(i as Record<string, string>).name}`.trim())
        : [],
      instructions: Array.isArray(body.instructions) ? body.instructions : [],
      tags: body.tags || [],
      notes: body.notes || null,
      source_url: body.source_url || body.sourceUrl || null,
      is_favorite: body.is_favorite || false,
      is_shared_with_household: body.is_shared_with_household ?? true,
      rating: body.rating || null,
      rating_count: body.rating_count || 0,
    };

    const { data: recipe, error } = await supabase
      .from("recipes")
      .insert(recipeData)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(recipe, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create recipe" },
      { status: 500 }
    );
  }
}

