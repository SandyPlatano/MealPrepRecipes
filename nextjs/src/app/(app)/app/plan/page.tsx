import { getWeekPlan, getRecipesForPlanning } from "@/app/actions/meal-plans";
import { getSettings } from "@/app/actions/settings";
import { WeeklyPlanView } from "@/components/meal-plan/weekly-plan-view";
import { getWeekStart } from "@/types/meal-plan";

interface PlanPageProps {
  searchParams: Promise<{ week?: string }>;
}

export default async function PlanPage({ searchParams }: PlanPageProps) {
  const params = await searchParams;

  // Get week start from URL or default to current week
  const weekStartDate = params.week
    ? new Date(params.week)
    : getWeekStart(new Date());

  const weekStartStr = weekStartDate.toISOString().split("T")[0];

  const [planResult, recipesResult, settingsResult] = await Promise.all([
    getWeekPlan(weekStartStr),
    getRecipesForPlanning(),
    getSettings(),
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

  const recipes = recipesResult.data || [];
  const cookNames = settingsResult.data?.cook_names || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-mono font-bold">Meal Plan</h1>
        <p className="text-muted-foreground mt-1">
          Plan your week. Less &quot;what&apos;s for dinner?&quot; more &quot;dinner&apos;s handled.&quot;
        </p>
      </div>

      <WeeklyPlanView
        weekStart={weekStartDate}
        weekPlan={weekPlan}
        recipes={recipes}
        cookNames={cookNames}
      />
    </div>
  );
}
