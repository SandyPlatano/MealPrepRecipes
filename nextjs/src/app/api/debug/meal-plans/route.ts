import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";

// Debug endpoint to diagnose meal plan history issues
export async function GET(request: Request) {
  try {
    const { user, household, error: authError } = await getCachedUserWithHousehold();

    if (authError || !user || !household) {
      return NextResponse.json({
        success: false,
        error: "Auth failed",
        details: authError?.message || "No user or household",
        user: !!user,
        household: !!household,
      });
    }

    const supabase = await createClient();

    // Get all meal plans for this household
    const { data: mealPlans, error: mealPlanError } = await supabase
      .from("meal_plans")
      .select("id, week_start, sent_at, created_at, updated_at")
      .eq("household_id", household.household_id)
      .order("week_start", { ascending: false })
      .limit(10);

    if (mealPlanError) {
      return NextResponse.json({
        success: false,
        error: "Failed to fetch meal plans",
        details: mealPlanError.message,
        household_id: household.household_id,
      });
    }

    // Get the week parameter if provided
    const url = new URL(request.url);
    const weekParam = url.searchParams.get("week");

    let testUpdate = null;
    if (weekParam) {
      // Try to find and update the specified week
      const targetPlan = mealPlans?.find(p => p.week_start === weekParam);

      if (targetPlan) {
        // Attempt to update the sent_at field
        const { data: updated, error: updateError } = await supabase
          .from("meal_plans")
          .update({ sent_at: new Date().toISOString() })
          .eq("id", targetPlan.id)
          .select();

        testUpdate = {
          attempted: true,
          targetPlanId: targetPlan.id,
          weekStart: weekParam,
          success: !updateError,
          error: updateError?.message || null,
          updatedData: updated,
        };
      } else {
        testUpdate = {
          attempted: false,
          reason: `No meal plan found for week: ${weekParam}`,
          availableWeeks: mealPlans?.map(p => p.week_start) || [],
        };
      }
    }

    return NextResponse.json({
      success: true,
      user_id: user.id,
      household_id: household.household_id,
      mealPlans: mealPlans?.map(p => ({
        id: p.id,
        week_start: p.week_start,
        sent_at: p.sent_at,
        created_at: p.created_at,
      })),
      testUpdate,
      plansWithSentAt: mealPlans?.filter(p => p.sent_at !== null).length || 0,
      totalPlans: mealPlans?.length || 0,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Unexpected error",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
