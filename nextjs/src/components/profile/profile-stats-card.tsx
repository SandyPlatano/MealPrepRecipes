"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame, Trophy, ChefHat, BookOpen, Target } from "lucide-react";
import type { CookingStreak } from "@/types/profile";

interface ProfileStatsCardProps {
  stats: CookingStreak;
}

export function ProfileStatsCard({ stats }: ProfileStatsCardProps) {
  const weeklyProgress = stats.weekly_target > 0
    ? (stats.current_week_count / stats.weekly_target) * 100
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          Cooking Stats
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Current Streak */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Current Streak</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold">{stats.current_streak_days}</span>
              <span className="text-muted-foreground">days</span>
            </div>
            {stats.current_streak_days > 0 && (
              <p className="text-xs text-muted-foreground">
                Keep it going!
              </p>
            )}
          </div>

          {/* Longest Streak */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Best Streak</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold">{stats.longest_streak_days}</span>
              <span className="text-muted-foreground">days</span>
            </div>
            {stats.longest_streak_days > 0 && (
              <p className="text-xs text-muted-foreground">
                Personal record
              </p>
            )}
          </div>

          {/* Total Meals Cooked */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ChefHat className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Meals Cooked</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold">{stats.total_meals_cooked}</span>
              <span className="text-muted-foreground">total</span>
            </div>
            <p className="text-xs text-muted-foreground">
              All-time count
            </p>
          </div>

          {/* Recipes Tried */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <BookOpen className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Recipes Tried</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold">{stats.total_recipes_tried}</span>
              <span className="text-muted-foreground">unique</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Recipe variety
            </p>
          </div>
        </div>

        {/* Weekly Progress */}
        {stats.weekly_target > 0 && (
          <div className="mt-6 p-4 rounded-lg bg-muted/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Weekly Goal</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {stats.current_week_count} / {stats.weekly_target} meals
              </span>
            </div>
            <Progress value={weeklyProgress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {weeklyProgress >= 100
                ? "Goal achieved this week!"
                : `${stats.weekly_target - stats.current_week_count} more to go`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
