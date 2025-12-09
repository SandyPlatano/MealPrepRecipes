import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// PUT /api/meal-plans/[id]/status - Update meal plan status (finalize)
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
    const status = body.status || "finalized";

    const { data: mealPlan, error } = await supabase
      .from("meal_plans")
      .update({ status })
      .eq("id", id)
      .select()
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

    return NextResponse.json({
      id: mealPlan.id,
      status: mealPlan.status,
      message: `Meal plan ${status}`,
    });
  } catch (error) {
    console.error("Error updating meal plan status:", error);
    return NextResponse.json(
      { error: "Failed to update meal plan status" },
      { status: 500 }
    );
  }
}

