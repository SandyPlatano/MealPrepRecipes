import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// POST /api/recipes/[id]/rate - Rate a recipe
export async function POST(
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
    const newRating = body.rating;

    if (typeof newRating !== "number" || newRating < 1 || newRating > 5) {
      return NextResponse.json(
        { error: "Rating must be a number between 1 and 5" },
        { status: 400 }
      );
    }

    // Get current recipe rating
    const { data: recipe, error: recipeError } = await supabase
      .from("recipes")
      .select("rating, rating_count")
      .eq("id", id)
      .single();

    if (recipeError || !recipe) {
      return NextResponse.json(
        { error: "Recipe not found" },
        { status: 404 }
      );
    }

    // Calculate new average rating
    const currentRating = recipe.rating || 0;
    const currentCount = recipe.rating_count || 0;
    const newCount = currentCount + 1;
    const newAverageRating = ((currentRating * currentCount) + newRating) / newCount;

    // Update recipe with new rating
    const { data: updatedRecipe, error: updateError } = await supabase
      .from("recipes")
      .update({
        rating: Math.round(newAverageRating * 100) / 100, // Round to 2 decimal places
        rating_count: newCount,
      })
      .eq("id", id)
      .select("rating, rating_count")
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      rating: updatedRecipe.rating,
      rating_count: updatedRecipe.rating_count,
      message: "Rating submitted successfully",
    });
  } catch (error) {
    console.error("Error rating recipe:", error);
    return NextResponse.json(
      { error: "Failed to rate recipe" },
      { status: 500 }
    );
  }
}

