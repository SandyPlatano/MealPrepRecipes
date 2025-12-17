"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useDemo } from "@/lib/demo/demo-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Flame,
  Beef,
  Wheat,
  Droplets,
  Target,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { DAYS_OF_WEEK, type DayOfWeek } from "@/types/meal-plan";
import { cn } from "@/lib/utils";

// Demo macro goals
const DEMO_MACRO_GOALS = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 65,
};

export default function DemoNutritionPage() {
  const { weekPlanData, recipes } = useDemo();

  // Calculate daily nutrition from meal plan
  const dailyNutrition = useMemo(() => {
    const daily: Record<
      DayOfWeek,
      { calories: number; protein: number; carbs: number; fat: number; meals: number }
    > = {} as Record<DayOfWeek, { calories: number; protein: number; carbs: number; fat: number; meals: number }>;

    for (const day of DAYS_OF_WEEK) {
      const meals = weekPlanData.assignments[day] || [];
      let calories = 0;
      let protein = 0;
      let carbs = 0;
      let fat = 0;

      for (const meal of meals) {
        const recipe = recipes.find((r) => r.id === meal.recipe_id);
        if (recipe?.nutrition) {
          // Apply serving size multiplier if available (use base_servings which is numeric)
          const multiplier = meal.serving_size && recipe.base_servings
            ? meal.serving_size / recipe.base_servings
            : 1;
          calories += (recipe.nutrition.calories || 0) * multiplier;
          protein += (recipe.nutrition.protein_g || 0) * multiplier;
          carbs += (recipe.nutrition.carbs_g || 0) * multiplier;
          fat += (recipe.nutrition.fat_g || 0) * multiplier;
        }
      }

      daily[day] = {
        calories: Math.round(calories),
        protein: Math.round(protein),
        carbs: Math.round(carbs),
        fat: Math.round(fat),
        meals: meals.length,
      };
    }

    return daily;
  }, [weekPlanData, recipes]);

  // Calculate weekly totals
  const weeklyTotals = useMemo(() => {
    return Object.values(dailyNutrition).reduce(
      (acc, day) => ({
        calories: acc.calories + day.calories,
        protein: acc.protein + day.protein,
        carbs: acc.carbs + day.carbs,
        fat: acc.fat + day.fat,
        meals: acc.meals + day.meals,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, meals: 0 }
    );
  }, [dailyNutrition]);

  // Calculate daily averages
  const daysWithMeals = Object.values(dailyNutrition).filter((d) => d.meals > 0).length;
  const dailyAverage = daysWithMeals > 0
    ? {
        calories: Math.round(weeklyTotals.calories / daysWithMeals),
        protein: Math.round(weeklyTotals.protein / daysWithMeals),
        carbs: Math.round(weeklyTotals.carbs / daysWithMeals),
        fat: Math.round(weeklyTotals.fat / daysWithMeals),
      }
    : { calories: 0, protein: 0, carbs: 0, fat: 0 };

  // Count days on target (within 10% of goals)
  const daysOnTarget = Object.values(dailyNutrition).filter((day) => {
    if (day.meals === 0) return false;
    const caloriesDiff = Math.abs(day.calories - DEMO_MACRO_GOALS.calories) / DEMO_MACRO_GOALS.calories;
    return caloriesDiff <= 0.15; // Within 15% is "on target"
  }).length;

  // Today's day name
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" }) as DayOfWeek;
  const todayNutrition = dailyNutrition[today];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-mono font-bold">Nutrition</h1>
        <p className="text-muted-foreground mt-1">
          Track your weekly macros and stay on target with your goals
        </p>
      </div>

      {/* Today's Progress */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Today&apos;s Progress</CardTitle>
            <Badge variant="secondary">{today}</Badge>
          </div>
          <CardDescription>
            {todayNutrition.meals} meal{todayNutrition.meals !== 1 ? "s" : ""} planned
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Calories */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Calories</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {todayNutrition.calories} / {DEMO_MACRO_GOALS.calories}
                </span>
              </div>
              <Progress
                value={Math.min((todayNutrition.calories / DEMO_MACRO_GOALS.calories) * 100, 100)}
                className="h-2"
              />
            </div>

            {/* Protein */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Beef className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">Protein</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {todayNutrition.protein}g / {DEMO_MACRO_GOALS.protein}g
                </span>
              </div>
              <Progress
                value={Math.min((todayNutrition.protein / DEMO_MACRO_GOALS.protein) * 100, 100)}
                className="h-2"
              />
            </div>

            {/* Carbs */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wheat className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium">Carbs</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {todayNutrition.carbs}g / {DEMO_MACRO_GOALS.carbs}g
                </span>
              </div>
              <Progress
                value={Math.min((todayNutrition.carbs / DEMO_MACRO_GOALS.carbs) * 100, 100)}
                className="h-2"
              />
            </div>

            {/* Fat */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Fat</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {todayNutrition.fat}g / {DEMO_MACRO_GOALS.fat}g
                </span>
              </div>
              <Progress
                value={Math.min((todayNutrition.fat / DEMO_MACRO_GOALS.fat) * 100, 100)}
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-5 w-5 mx-auto text-green-500 mb-1" />
            <p className="text-2xl font-bold">{daysOnTarget}</p>
            <p className="text-xs text-muted-foreground">Days On Target</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-5 w-5 mx-auto text-blue-500 mb-1" />
            <p className="text-2xl font-bold">{dailyAverage.calories}</p>
            <p className="text-xs text-muted-foreground">Avg Daily Calories</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Beef className="h-5 w-5 mx-auto text-red-500 mb-1" />
            <p className="text-2xl font-bold">{dailyAverage.protein}g</p>
            <p className="text-xs text-muted-foreground">Avg Daily Protein</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-5 w-5 mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold">{weeklyTotals.meals}</p>
            <p className="text-xs text-muted-foreground">Meals This Week</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Breakdown</CardTitle>
          <CardDescription>
            Daily nutrition from your meal plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {DAYS_OF_WEEK.map((day) => {
              const dayData = dailyNutrition[day];
              const isToday = day === today;
              const caloriePercent = Math.min((dayData.calories / DEMO_MACRO_GOALS.calories) * 100, 100);
              const onTarget =
                dayData.meals > 0 &&
                Math.abs(dayData.calories - DEMO_MACRO_GOALS.calories) / DEMO_MACRO_GOALS.calories <= 0.15;

              return (
                <div
                  key={day}
                  className={cn(
                    "p-3 rounded-lg border transition-colors",
                    isToday && "border-primary/50 bg-primary/5"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={cn("font-medium", isToday && "text-primary")}>
                        {day}
                      </span>
                      {isToday && (
                        <Badge variant="default" className="text-xs">Today</Badge>
                      )}
                      {onTarget && (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {dayData.meals > 0 ? (
                        <span>
                          {dayData.calories} cal • {dayData.protein}g P • {dayData.carbs}g C • {dayData.fat}g F
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">No meals planned</span>
                      )}
                    </div>
                  </div>
                  <Progress value={caloriePercent} className="h-1.5" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Macro Goals Card */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Zap className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Your Demo Goals</p>
              <p className="text-sm text-muted-foreground mb-2">
                Customize these when you create an account
              </p>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5 text-orange-500" />
                  {DEMO_MACRO_GOALS.calories} cal
                </span>
                <span className="flex items-center gap-1">
                  <Beef className="h-3.5 w-3.5 text-red-500" />
                  {DEMO_MACRO_GOALS.protein}g protein
                </span>
                <span className="flex items-center gap-1">
                  <Wheat className="h-3.5 w-3.5 text-amber-500" />
                  {DEMO_MACRO_GOALS.carbs}g carbs
                </span>
                <span className="flex items-center gap-1">
                  <Droplets className="h-3.5 w-3.5 text-blue-500" />
                  {DEMO_MACRO_GOALS.fat}g fat
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 border-primary/20">
        <CardContent className="p-6 text-center">
          <h3 className="font-semibold text-lg">Track your nutrition goals</h3>
          <p className="text-muted-foreground mt-1 mb-4">
            Sign up to set custom macro goals and track your progress over time
          </p>
          <Link href="/signup">
            <Button>Get Started Free</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
