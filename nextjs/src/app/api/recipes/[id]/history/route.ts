import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// GET /api/recipes/[id]/history - Get cooking history for a recipe
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

    // Verify recipe exists
    const { data: recipe, error: recipeError } = await supabase
      .from("recipes")
      .select("id, title")
      .eq("id", id)
      .single();

    if (recipeError || !recipe) {
      return NextResponse.json(
        { error: "Recipe not found" },
        { status: 404 }
      );
    }

    // Get cooking history
    const { data: history, error: historyError } = await supabase
      .from("cooking_history")
      .select("id, recipe_id, household_id, cooked_by, cooked_at, rating, notes, modifications, photo_url, created_at")
      .eq("recipe_id", id)
      .order("cooked_at", { ascending: false });

    if (historyError) {
      return NextResponse.json(
        { error: historyError.message },
        { status: 500 }
      );
    }

    // Map history entries to include event type
    const events = (history || []).map((entry) => ({
      id: entry.id,
      event: entry.notes?.includes("start") ? "start" : "stop",
      timestamp: entry.cooked_at,
      notes: entry.notes,
      rating: entry.rating,
    }));

    return NextResponse.json({
      recipe_id: id,
      recipe_title: recipe.title,
      events,
      total_cooks: Math.ceil(events.length / 2), // Approximate number of cooking sessions
    });
  } catch (error) {
    console.error("Error fetching cooking history:", error);
    return NextResponse.json(
      { error: "Failed to fetch cooking history" },
      { status: 500 }
    );
  }
}

