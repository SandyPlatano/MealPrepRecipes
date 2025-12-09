import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// GET /api/meal-plans/[id] - Get a single meal plan
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

    const { data: mealPlan, error } = await supabase
      .from("meal_plans")
      .select(`
        *,
        meal_plan_assignments(
          *,
          recipe:recipes(*)
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Meal plan not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Transform to expected format
    const mealSlots = (mealPlan.meal_plan_assignments || []).map((assignment: any) => ({
      id: assignment.id,
      recipeId: assignment.recipe_id,
      recipe: assignment.recipe,
      day: assignment.day_of_week,
      meal: assignment.meal_type,
      assignedCook: assignment.cook,
      servings: assignment.servings,
    }));

    return NextResponse.json({
      ...mealPlan,
      mealSlots,
    });
  } catch (error) {
    console.error("Error fetching meal plan:", error);
    return NextResponse.json(
      { error: "Failed to fetch meal plan" },
      { status: 500 }
    );
  }
}

// DELETE /api/meal-plans/[id] - Delete a meal plan
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

    // Delete assignments first (foreign key constraint)
    await supabase
      .from("meal_plan_assignments")
      .delete()
      .eq("meal_plan_id", id);

    // Delete the meal plan
    const { error } = await supabase
      .from("meal_plans")
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
    console.error("Error deleting meal plan:", error);
    return NextResponse.json(
      { error: "Failed to delete meal plan" },
      { status: 500 }
    );
  }
}

