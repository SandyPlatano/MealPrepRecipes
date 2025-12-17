"use client";

import { useState } from "react";
import Link from "next/link";
import { useDemo } from "@/lib/demo/demo-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChefHat,
  Plus,
  X,
  Clock,
  Flame,
  Users,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { DAYS_OF_WEEK, type DayOfWeek } from "@/types/meal-plan";
import { cn } from "@/lib/utils";

export function DemoMealPlanner() {
  const { weekPlanData, recipes, settings, removeFromMealPlan } = useDemo();
  const [expandedDay, setExpandedDay] = useState<DayOfWeek | null>(null);

  // Get today's day
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" }) as DayOfWeek;

  // Calculate weekly stats
  const totalMeals = Object.values(weekPlanData.assignments).flat().length;
  const totalCalories = Object.values(weekPlanData.assignments)
    .flat()
    .reduce((sum, meal) => {
      const recipe = recipes.find((r) => r.id === meal.recipe_id);
      return sum + (recipe?.nutrition?.calories || 0);
    }, 0);

  const handleRemoveMeal = (assignmentId: string) => {
    removeFromMealPlan(assignmentId);
    toast.success("Removed from plan");
  };

  return (
    <div className="space-y-6">
      {/* Weekly Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-5 w-5 mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold">{totalMeals}</p>
            <p className="text-xs text-muted-foreground">Meals Planned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Flame className="h-5 w-5 mx-auto text-orange-500 mb-1" />
            <p className="text-2xl font-bold">{totalCalories.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Weekly Calories</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-5 w-5 mx-auto text-blue-500 mb-1" />
            <p className="text-2xl font-bold">{settings.cook_names?.length || 2}</p>
            <p className="text-xs text-muted-foreground">Cooks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <ChefHat className="h-5 w-5 mx-auto text-green-500 mb-1" />
            <p className="text-2xl font-bold">{recipes.length}</p>
            <p className="text-xs text-muted-foreground">Recipes Available</p>
          </CardContent>
        </Card>
      </div>

      {/* Week View */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle>This Week</CardTitle>
            <Link href="/demo/recipes">
              <Button variant="outline" size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                Add Recipe
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {DAYS_OF_WEEK.map((day) => {
              const dayMeals = weekPlanData.assignments[day] || [];
              const isToday = day === today;
              const isExpanded = expandedDay === day;

              return (
                <div
                  key={day}
                  className={cn(
                    "rounded-lg border transition-all",
                    isToday && "border-primary/50 bg-primary/5",
                    !isToday && "hover:border-muted-foreground/30"
                  )}
                >
                  {/* Day Header */}
                  <button
                    className="w-full p-3 flex items-center justify-between"
                    onClick={() => setExpandedDay(isExpanded ? null : day)}
                  >
                    <div className="flex items-center gap-3">
                      <span className={cn("font-medium", isToday && "text-primary")}>
                        {day}
                      </span>
                      {isToday && (
                        <Badge variant="default" className="text-xs">
                          Today
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {dayMeals.length > 0 ? (
                        <span className="text-sm text-muted-foreground">
                          {dayMeals.length} meal{dayMeals.length !== 1 ? "s" : ""}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground/50">No meals</span>
                      )}
                      <ArrowRight
                        className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform",
                          isExpanded && "rotate-90"
                        )}
                      />
                    </div>
                  </button>

                  {/* Expanded Meals */}
                  {(isExpanded || isToday) && dayMeals.length > 0 && (
                    <div className="px-3 pb-3 space-y-2">
                      {dayMeals.map((meal) => {
                        const recipe = recipes.find((r) => r.id === meal.recipe_id);
                        if (!recipe) return null;

                        const cookColor = meal.cook
                          ? settings.cook_colors?.[meal.cook] || "#6366F1"
                          : undefined;

                        return (
                          <div
                            key={meal.id}
                            className="flex items-center justify-between p-3 bg-background rounded-lg border group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {meal.cook && (
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0"
                                  style={{ backgroundColor: cookColor }}
                                >
                                  {meal.cook[0]}
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="font-medium truncate">{recipe.title}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  {meal.cook && <span>{meal.cook}</span>}
                                  {recipe.cook_time && (
                                    <>
                                      {meal.cook && <span>•</span>}
                                      <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {recipe.cook_time}
                                      </span>
                                    </>
                                  )}
                                  {meal.serving_size && (
                                    <>
                                      <span>•</span>
                                      <span>{meal.serving_size} servings</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Link href={`/demo/recipes/${recipe.id}/cook`}>
                                <Button size="sm" className="gap-1">
                                  <ChefHat className="h-4 w-4" />
                                  <span className="hidden sm:inline">Cook</span>
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleRemoveMeal(meal.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Empty state for expanded day */}
                  {isExpanded && dayMeals.length === 0 && (
                    <div className="px-3 pb-3">
                      <Link href="/demo/recipes">
                        <Button variant="outline" className="w-full gap-2">
                          <Plus className="h-4 w-4" />
                          Add a meal for {day}
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Cook Legend */}
      {settings.cook_names && settings.cook_names.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-3">Cooks</p>
            <div className="flex flex-wrap gap-3">
              {settings.cook_names.map((cook) => {
                const color = settings.cook_colors?.[cook] || "#6366F1";
                const mealCount = Object.values(weekPlanData.assignments)
                  .flat()
                  .filter((m) => m.cook === cook).length;

                return (
                  <div key={cook} className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
                      style={{ backgroundColor: color }}
                    >
                      {cook[0]}
                    </div>
                    <span className="text-sm font-medium">{cook}</span>
                    <Badge variant="secondary" className="text-xs">
                      {mealCount} meal{mealCount !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* CTA */}
      <Card className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 border-primary/20">
        <CardContent className="p-6 text-center">
          <h3 className="font-semibold text-lg">Ready to plan your own meals?</h3>
          <p className="text-muted-foreground mt-1 mb-4">
            Sign up to create your meal plan, assign cooks, and generate shopping lists
          </p>
          <Link href="/signup">
            <Button>Start Planning Free</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
