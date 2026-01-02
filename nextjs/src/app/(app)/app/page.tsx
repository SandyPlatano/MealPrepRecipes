import { createClient } from "@/lib/supabase/server";
import { getWeekPlan } from "@/app/actions/meal-plans";
import { getSettings } from "@/app/actions/settings";
import { getShoppingListWithItems } from "@/app/actions/shopping-list";
import { getWasteDashboard } from "@/app/actions/waste-tracking";
import { getWeekStart, DAYS_OF_WEEK, type DayOfWeek, type MealAssignmentWithRecipe } from "@/types/meal-plan";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, ShoppingCart, Plus, UtensilsCrossed, ChefHat, Flame, Users } from "lucide-react";
import Link from "next/link";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getTodaysDayOfWeek(): DayOfWeek {
  const dayIndex = new Date().getDay();
  const days: DayOfWeek[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[dayIndex];
}

const defaultAssignments: Record<DayOfWeek, MealAssignmentWithRecipe[]> = {
  Monday: [],
  Tuesday: [],
  Wednesday: [],
  Thursday: [],
  Friday: [],
  Saturday: [],
  Sunday: [],
};

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const weekStartStr = getWeekStart(new Date()).toISOString().split("T")[0];

  const [profileResult, planResult, settingsResult, shoppingResult, wasteResult] = await Promise.all([
    user ? supabase.from("profiles").select("first_name, last_name").eq("id", user.id).single() : Promise.resolve({ data: null }),
    getWeekPlan(weekStartStr),
    getSettings(),
    getShoppingListWithItems(),
    getWasteDashboard(),
  ]);

  const profile = profileResult.data;
  const firstName = profile?.first_name || "there";
  const greeting = getGreeting();

  const assignments = planResult.data?.assignments ?? defaultAssignments;
  const cookNames = (settingsResult.data?.cook_names || []) as string[];
  const cookColors = (settingsResult.data?.cook_colors || {}) as Record<string, string>;

  const todaysDayOfWeek = getTodaysDayOfWeek();
  const todaysMeals = assignments[todaysDayOfWeek] || [];

  const shoppingItems = shoppingResult.data?.items || [];
  const totalItems = shoppingItems.length;
  const checkedItems = shoppingItems.filter(item => item.is_checked).length;

  const mealsByType = {
    breakfast: todaysMeals.find((m: MealAssignmentWithRecipe) => m.meal_type === "breakfast"),
    lunch: todaysMeals.find((m: MealAssignmentWithRecipe) => m.meal_type === "lunch"),
    dinner: todaysMeals.find((m: MealAssignmentWithRecipe) => m.meal_type === "dinner"),
  };

  const weekPeek = DAYS_OF_WEEK.map(day => ({
    day,
    hasPlannedMeals: (assignments[day] || []).length > 0,
    isToday: day === todaysDayOfWeek,
  }));

  // Partner handoff - who's cooking dinner tonight
  const dinnerCook = mealsByType.dinner?.cook;
  const otherCooks = cookNames.filter(name => name !== dinnerCook);
  const hasMultipleCooks = cookNames.length > 1;

  // Motivation stat from waste dashboard
  const streak = wasteResult.data?.streak;
  const aggregate = wasteResult.data?.aggregate;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-4xl mx-auto">
      {/* Hero greeting */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A]">
          {greeting}, {firstName}!
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s cooking today.
        </p>
      </div>

      <Separator />

      {/* Today's Meals */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Today&apos;s Meals</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(["breakfast", "lunch", "dinner"] as const).map((mealType) => {
            const meal = mealsByType[mealType];
            const labels = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner" };
            const emojis = { breakfast: "🌅", lunch: "☀️", dinner: "🌙" };

            return (
              <Card key={mealType} className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="relative h-32 bg-gray-100">
                  <div className="flex items-center justify-center h-full">
                    <UtensilsCrossed className="h-8 w-8 text-gray-300" />
                  </div>
                  <span className="absolute top-2 left-2 px-2 py-1 text-xs font-medium bg-[#D9F99D] text-[#1A1A1A] rounded-full">
                    {emojis[mealType]} {labels[mealType]}
                  </span>
                </div>
                <CardContent className="p-4">
                  {meal ? (
                    <>
                      <h3 className="font-semibold text-[#1A1A1A] truncate">
                        {meal.recipe?.title || "Unknown recipe"}
                      </h3>
                      {meal.cook && (
                        <div className="flex items-center gap-2 mt-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: cookColors[meal.cook] || "#D9F99D" }}
                          />
                          <span className="text-sm text-gray-600">{meal.cook}&apos;s cooking</span>
                        </div>
                      )}
                      <Button asChild className="w-full mt-3 bg-[#1A1A1A] text-white rounded-full">
                        <Link href={`/app/recipes/${meal.recipe_id}`}>
                          <ChefHat className="h-4 w-4 mr-2" />
                          View Recipe
                        </Link>
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-gray-500">No meal planned</p>
                      <Button asChild variant="outline" className="w-full mt-3 rounded-full">
                        <Link href="/app/plan">
                          <Plus className="h-4 w-4 mr-2" />
                          Add meal
                        </Link>
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <div className="grid grid-cols-3 gap-3">
          <Button asChild variant="outline" className="h-16 rounded-xl flex-col gap-1">
            <Link href="/app/plan">
              <Calendar className="h-5 w-5" />
              <span className="text-xs">Plan Week</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-16 rounded-xl flex-col gap-1">
            <Link href="/app/shop">
              <ShoppingCart className="h-5 w-5" />
              <span className="text-xs">Shopping</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-16 rounded-xl flex-col gap-1">
            <Link href="/app/recipes/new">
              <Plus className="h-5 w-5" />
              <span className="text-xs">Add Recipe</span>
            </Link>
          </Button>
        </div>
      </section>

      {/* Secondary Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Partner Handoff */}
        {hasMultipleCooks && (
          <Card className="p-4 bg-gradient-to-br from-purple-50 to-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Tonight&apos;s Chef</h3>
                {dinnerCook ? (
                  <p className="text-lg font-bold text-[#1A1A1A]">
                    {dinnerCook}&apos;s cooking
                    {otherCooks.length > 0 && (
                      <span className="text-sm font-normal text-muted-foreground ml-1">
                        ({otherCooks[0]} is off duty)
                      </span>
                    )}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">No dinner assigned yet</p>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Motivation Stat */}
        {(streak?.current_streak ?? 0) > 0 && (
          <Card className="p-4 bg-gradient-to-br from-orange-50 to-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-full">
                <Flame className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Cooking Streak</h3>
                <p className="text-lg font-bold text-[#1A1A1A]">
                  {streak?.current_streak} week{(streak?.current_streak ?? 0) !== 1 ? "s" : ""}
                  {aggregate && aggregate.total_money_saved_cents > 0 && (
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      (${(aggregate.total_money_saved_cents / 100).toFixed(0)} saved)
                    </span>
                  )}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Shopping Pulse */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm">Shopping List</h3>
              {totalItems > 0 ? (
                <p className="text-2xl font-bold text-[#1A1A1A]">
                  {checkedItems}/{totalItems} <span className="text-sm font-normal text-muted-foreground">items</span>
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">No items yet</p>
              )}
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/app/shop">View</Link>
            </Button>
          </div>
          {totalItems > 0 && (
            <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#D9F99D] transition-all"
                style={{ width: `${(checkedItems / totalItems) * 100}%` }}
              />
            </div>
          )}
        </Card>

        {/* Week Peek */}
        <Card className="p-4">
          <h3 className="font-semibold text-sm mb-3">This Week</h3>
          <div className="flex justify-between">
            {weekPeek.map(({ day, hasPlannedMeals, isToday }) => (
              <div key={day} className="flex flex-col items-center gap-1">
                <span className={`text-xs ${isToday ? "font-bold text-[#1A1A1A]" : "text-muted-foreground"}`}>
                  {day.slice(0, 1)}
                </span>
                <div
                  className={`w-3 h-3 rounded-full ${
                    hasPlannedMeals
                      ? "bg-[#D9F99D]"
                      : "bg-gray-200"
                  } ${isToday ? "ring-2 ring-[#1A1A1A] ring-offset-1" : ""}`}
                />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
