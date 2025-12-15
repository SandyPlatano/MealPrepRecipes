import {
  getWeekPlanWithFullRecipes,
  markMealPlanAsSent,
} from "@/app/actions/meal-plans";
import { getSettings } from "@/app/actions/settings";
import { getPantryItems } from "@/app/actions/pantry";
import { getWeeklyNutritionDashboard } from "@/app/actions/nutrition";
import { getWeekStart } from "@/types/meal-plan";
import { ConfirmationView } from "@/components/confirmation/confirmation-view";
import { redirect } from "next/navigation";

// Force dynamic rendering to ensure fresh data
export const dynamic = "force-dynamic";

interface ConfirmationPageProps {
  searchParams: Promise<{ week?: string }>;
}

export default async function ConfirmationPage({
  searchParams,
}: ConfirmationPageProps) {
  const params = await searchParams;

  // Use the week param directly if provided (already in YYYY-MM-DD format)
  // Only calculate from current date if no param provided
  const weekStartStr = params.week
    ? params.week
    : getWeekStart(new Date()).toISOString().split("T")[0];

  // Create date for ConfirmationView (used for display only)
  const weekStartDate = new Date(weekStartStr + "T12:00:00Z");

  // Mark the meal plan as sent (saves to history) - do this first
  const markResult = await markMealPlanAsSent(weekStartStr);
  if (markResult.error) {
    console.error("[Confirmation] Error marking plan as sent:", markResult.error);
    // Continue anyway to show the confirmation page - the plan data still exists
  }

  // Fetch all data in parallel
  const [planResult, settingsResult, pantryResult, nutritionResult] = await Promise.all([
    getWeekPlanWithFullRecipes(weekStartStr),
    getSettings(),
    getPantryItems(),
    getWeeklyNutritionDashboard(weekStartStr),
  ]);

  // Handle errors from the plan result
  if (planResult.error) {
    console.error(
      "[Confirmation] Error fetching week plan:",
      planResult.error
    );
    // Redirect to plan page on error instead of showing a broken page
    redirect(`/app?week=${weekStartStr}`);
  }

  const weekPlan = planResult.data || {
    meal_plan: null,
    assignments: {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: [],
    },
  };

  // Check if there are any meals to show
  const allAssignments = Object.values(weekPlan.assignments).flat();
  if (allAssignments.length === 0) {
    // Redirect back to plan page if no meals
    redirect(`/app?week=${weekStartStr}`);
  }

  const settings = settingsResult.data;
  const pantryItems = pantryResult.data || [];

  // Handle nutrition result (graceful - null if error)
  const nutritionDashboard = nutritionResult.data;

  return (
    <div className="space-y-6">
      <ConfirmationView
        weekStart={weekStartDate}
        weekPlan={
          weekPlan as unknown as Parameters<typeof ConfirmationView>[0]["weekPlan"]
        }
        cookColors={settings?.cook_colors || {}}
        pantryItems={pantryItems}
        nutritionDashboard={nutritionDashboard}
      />
    </div>
  );
}
