"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StarRating } from "@/components/ui/star-rating";
import { Progress } from "@/components/ui/progress";
import { ChefHat, Flame, Star, Trophy, UtensilsCrossed } from "lucide-react";
import type { RecipeStats } from "@/types/cooking-history";
import Link from "next/link";

interface StatsViewProps {
  stats: RecipeStats;
}

export function StatsView({ stats }: StatsViewProps) {
  const {
    totalMealsCooked,
    mealsThisMonth,
    averageRating,
    topRecipe,
    favoriteProtein,
    recipeTypeBreakdown,
    recentHistory,
  } = stats;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meals Crushed</CardTitle>
            <ChefHat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMealsCooked}</div>
            <p className="text-xs text-muted-foreground">
              {mealsThisMonth} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Go-To Recipe</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {topRecipe ? (
              <>
                <div className="text-lg font-bold truncate" title={topRecipe.title}>
                  {topRecipe.title}
                </div>
                <p className="text-xs text-muted-foreground">
                  Made {topRecipe.count} time{topRecipe.count !== 1 ? "s" : ""}
                </p>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">No recipes yet</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {averageRating !== null ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{averageRating}</span>
                  <StarRating rating={averageRating} readonly size="sm" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Based on your ratings
                </p>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">No ratings yet</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favorite Protein</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {favoriteProtein ? (
              <>
                <div className="text-lg font-bold">{favoriteProtein.type}</div>
                <p className="text-xs text-muted-foreground">
                  {favoriteProtein.count} meal{favoriteProtein.count !== 1 ? "s" : ""}
                </p>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">Not enough data</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recipe Type Breakdown */}
      {recipeTypeBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5" />
              What You&apos;ve Been Making
            </CardTitle>
            <CardDescription>
              Breakdown by recipe type
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recipeTypeBreakdown.map((item) => (
              <div key={item.type} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{item.type}</span>
                  <span className="text-muted-foreground">
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
                <Progress value={item.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent Wins */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Wins</CardTitle>
          <CardDescription>
            Your latest cooking victories
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ChefHat className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No cooking history yet.</p>
              <p className="text-sm mt-1">
                Start by marking recipes as cooked!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentHistory.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/app/recipes/${entry.recipe_id}`}
                      className="font-medium hover:underline truncate block"
                    >
                      {entry.recipe?.title || "Unknown Recipe"}
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>
                        {new Date(entry.cooked_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      {entry.cooked_by_profile?.name && (
                        <>
                          <span>•</span>
                          <span>{entry.cooked_by_profile.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {entry.rating && (
                      <StarRating rating={entry.rating} readonly size="sm" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
