import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// PUT /api/meal-plans/[id]/meal-slot - Assign a recipe to a meal slot
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: mealPlanId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { recipeId, day, meal, assignedCook, servings } = body;

    if (!recipeId || !day || !meal) {
      return NextResponse.json(
        { error: "recipeId, day, and meal are required" },
        { status: 400 }
      );
    }

    // Check if assignment already exists for this slot
    const { data: existingAssignment } = await supabase
      .from("meal_plan_assignments")
      .select("id")
      .eq("meal_plan_id", mealPlanId)
      .eq("day_of_week", day)
      .eq("meal_type", meal)
      .single();

    let assignment;
    
    if (existingAssignment) {
      // Update existing assignment
      const { data, error } = await supabase
        .from("meal_plan_assignments")
        .update({
          recipe_id: recipeId,
          cook: assignedCook || null,
          servings: servings || 4,
        })
        .eq("id", existingAssignment.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }
      assignment = data;
    } else {
      // Create new assignment
      const { data, error } = await supabase
        .from("meal_plan_assignments")
        .insert({
          meal_plan_id: mealPlanId,
          recipe_id: recipeId,
          day_of_week: day,
          meal_type: meal,
          cook: assignedCook || null,
          servings: servings || 4,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }
      assignment = data;
    }

    return NextResponse.json({
      id: assignment.id,
      recipeId: assignment.recipe_id,
      day: assignment.day_of_week,
      meal: assignment.meal_type,
      assignedCook: assignment.cook,
      servings: assignment.servings,
    });
  } catch (error) {
    console.error("Error assigning meal slot:", error);
    return NextResponse.json(
      { error: "Failed to assign meal slot" },
      { status: 500 }
    );
  }
}

