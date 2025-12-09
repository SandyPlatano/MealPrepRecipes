import { getWeekPlanWithFullRecipes } from "@/app/actions/meal-plans";
import { getSettings } from "@/app/actions/settings";
import { getPantryItems } from "@/app/actions/pantry";
import { getWeekStart } from "@/types/meal-plan";
import { FinalizeView } from "@/components/finalize/finalize-view";
import { redirect } from "next/navigation";

interface FinalizePageProps {
  searchParams: Promise<{ week?: string }>;
}

export default async function FinalizePage({ searchParams }: FinalizePageProps) {
  const params = await searchParams;

  // Get week start from URL or default to current week
  const weekStartDate = params.week
    ? new Date(params.week)
    : getWeekStart(new Date());

  const weekStartStr = weekStartDate.toISOString().split("T")[0];

  // Fetch all data in parallel
  const [planResult, settingsResult, pantryResult] = await Promise.all([
    getWeekPlanWithFullRecipes(weekStartStr),
    getSettings(),
    getPantryItems(),
  ]);

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
    redirect(`/app/plan?week=${weekStartStr}`);
  }

  const settings = settingsResult.data;
  const pantryItems = pantryResult.data || [];

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
      />
    </div>
  );
}

