import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";

export const dynamic = "force-dynamic";

// GET /api/meal-plans - List all meal plans for user's household
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get user and household context
    const { user, householdId, error: authError } = await getCachedUserWithHousehold();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // SECURITY: Require household membership for meal plans
    if (!householdId) {
      return NextResponse.json(
        { error: "Household membership required for meal plans" },
        { status: 400 }
      );
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const weekStart = searchParams.get("week_start");

    // SECURITY: Always filter by household_id to prevent cross-tenant data access
    let query = supabase
      .from("meal_plans")
      .select(`
        *,
        meal_plan_assignments(
          *,
          recipe:recipes(*)
        )
      `)
      .eq("household_id", householdId) // CRITICAL: Household isolation
      .order("week_start", { ascending: false });

    if (weekStart) {
      query = query.eq("week_start", weekStart);
    }

    const { data: mealPlans, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(mealPlans);
  } catch (error) {
    console.error("Error fetching meal plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch meal plans" },
      { status: 500 }
    );
  }
}

// POST /api/meal-plans - Create a new meal plan
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
    const weekStartDate = body.weekStartDate || body.week_start_date || body.week_start;

    if (!weekStartDate) {
      return NextResponse.json(
        { error: "week_start_date is required" },
        { status: 400 }
      );
    }

    // Get user's household
    const { data: userData } = await supabase
      .from("users")
      .select("household_id")
      .eq("id", user.id)
      .single();

    // Check if meal plan already exists for this week
    const { data: existingPlan } = await supabase
      .from("meal_plans")
      .select("id")
      .eq("week_start", weekStartDate)
      .eq("household_id", userData?.household_id || user.id)
      .single();

    if (existingPlan) {
      return NextResponse.json(
        { id: existingPlan.id, message: "Meal plan already exists for this week" },
        { status: 200 }
      );
    }

    // Create the meal plan
    const { data: mealPlan, error: planError } = await supabase
      .from("meal_plans")
      .insert({
        week_start: weekStartDate,
        household_id: userData?.household_id || user.id,
        status: "draft",
      })
      .select()
      .single();

    if (planError) {
      return NextResponse.json(
        { error: planError.message },
        { status: 500 }
      );
    }

    // If meals are provided, create assignments
    if (body.meals && Array.isArray(body.meals)) {
      const assignments = body.meals.map((meal: Record<string, unknown>) => ({
        meal_plan_id: mealPlan.id,
        recipe_id: meal.recipe_id || meal.recipeId,
        day_of_week: meal.day,
        meal_type: meal.meal_time || meal.meal_type || "Dinner",
        cook: meal.assigned_cook || meal.assignedCook || null,
        servings: meal.servings || 4,
      }));

      const { error: assignError } = await supabase
        .from("meal_plan_assignments")
        .insert(assignments);

      if (assignError) {
        console.error("Error creating assignments:", assignError);
      }
    }

    return NextResponse.json(mealPlan, { status: 201 });
  } catch (error) {
    console.error("Error creating meal plan:", error);
    return NextResponse.json(
      { error: "Failed to create meal plan" },
      { status: 500 }
    );
  }
}

