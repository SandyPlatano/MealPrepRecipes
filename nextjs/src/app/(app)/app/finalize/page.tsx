import { getWeekPlanWithFullRecipes } from "@/app/actions/meal-plans";
import { getSettings } from "@/app/actions/settings";
import { getPantryItems } from "@/app/actions/pantry";
import { getWeeklyNutritionDashboard } from "@/app/actions/nutrition";
import { getWeekStart } from "@/types/meal-plan";
import { FinalizeView } from "@/components/finalize/finalize-view";
import { redirect } from "next/navigation";

interface FinalizePageProps {
  searchParams: Promise<{ week?: string }>;
}

export default async function FinalizePage({ searchParams }: FinalizePageProps) {
  const params = await searchParams;

  // Use the week param directly if provided (already in YYYY-MM-DD format)
  // Only calculate from current date if no param provided
  const weekStartStr = params.week
    ? params.week
    : getWeekStart(new Date()).toISOString().split("T")[0];

  // Create date for FinalizeView (used for display only)
  const weekStartDate = new Date(weekStartStr + "T12:00:00Z");

  // Fetch all data in parallel
  const [planResult, settingsResult, pantryResult, nutritionResult] = await Promise.all([
    getWeekPlanWithFullRecipes(weekStartStr),
    getSettings(),
    getPantryItems(),
    getWeeklyNutritionDashboard(weekStartStr),
  ]);

  // Handle errors from the plan result
  if (planResult.error) {
    console.error("[Finalize] Error fetching week plan:", planResult.error);
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

  // Check if there are any meals to finalize
  const allAssignments = Object.values(weekPlan.assignments).flat();
  if (allAssignments.length === 0) {
    // Redirect back to plan page if no meals
    redirect(`/app?week=${weekStartStr}`);
  }

  const settings = settingsResult.data;
  const pantryItems = pantryResult.data || [];

  // Handle nutrition result (graceful - null if error or goals not set)
  const nutritionDashboard = nutritionResult.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-mono font-bold">Finalize Your Plan</h1>
        <p className="text-muted-foreground mt-1">
          Review your week, send the list, and get cooking.
        </p>
      </div>

      <FinalizeView
        weekStart={weekStartDate}
        weekPlan={weekPlan as unknown as Parameters<typeof FinalizeView>[0]["weekPlan"]}
        cookNames={settings?.cook_names || []}
        cookColors={settings?.cook_colors || {}}
        pantryItems={pantryItems}
        nutritionDashboard={nutritionDashboard}
      />
    </div>
  );
}

