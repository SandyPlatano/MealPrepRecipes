"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Flame, Trophy, AlertCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  StreakInfo,
  Achievement,
  EarnedAchievement,
} from "@/types/waste-tracking";
import { ACHIEVEMENTS } from "@/types/waste-tracking";
import {
  getAchievementProgress,
  formatPercent,
} from "@/lib/waste/calculations";
import type { AggregateWasteMetrics } from "@/types/waste-tracking";

interface WasteStreakProps {
  streak: StreakInfo;
  aggregate: AggregateWasteMetrics;
  nextAchievement: Achievement | null;
  className?: string;
}

/**
 * Display streak information and next achievement progress
 */
export function WasteStreak({
  streak,
  aggregate,
  nextAchievement,
  className,
}: WasteStreakProps) {
  const progress = nextAchievement
    ? getAchievementProgress(nextAchievement.type, aggregate, streak) * 100
    : 0;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          Your Streak
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Streak */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-4xl font-bold text-orange-500">
              {streak.current_streak}
            </p>
            <p className="text-sm text-muted-foreground">
              week{streak.current_streak !== 1 ? "s" : ""} in a row
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">Best Streak</p>
            <p className="text-2xl font-bold text-muted-foreground">
              {streak.longest_streak}
            </p>
          </div>
        </div>

        {/* At Risk Warning */}
        {streak.is_at_risk && streak.current_streak > 0 && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <p className="text-xs">
              Complete this week&apos;s meals to keep your streak!
            </p>
          </div>
        )}

        {/* Next Achievement */}
        {nextAchievement && (
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Next Achievement</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {formatPercent(progress / 100)}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg">{getAchievementEmoji(nextAchievement.tier)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {nextAchievement.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {nextAchievement.description}
                </p>
              </div>
            </div>
            <Progress value={progress} className="h-2 mt-2" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Display earned achievements
 */
interface EarnedAchievementsProps {
  achievements: EarnedAchievement[];
  className?: string;
}

export function EarnedAchievements({
  achievements,
  className,
}: EarnedAchievementsProps) {
  if (achievements.length === 0) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Start meal planning to earn your first achievement!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          Achievements ({achievements.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {achievements.slice(0, 6).map((earned) => {
            const achievement = ACHIEVEMENTS[earned.achievement_type];
            if (!achievement) return null;

            return (
              <div
                key={earned.id}
                className="flex flex-col items-center p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div
                  className={cn(
                    "h-12 w-12 rounded-full flex items-center justify-center mb-2",
                    getTierBackground(achievement.tier)
                  )}
                >
                  <span className="text-2xl">
                    {getAchievementEmoji(achievement.tier)}
                  </span>
                </div>
                <p className="text-xs font-medium text-center line-clamp-1">
                  {achievement.name}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {new Date(earned.achieved_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            );
          })}
        </div>

        {achievements.length > 6 && (
          <p className="text-xs text-muted-foreground text-center mt-3">
            +{achievements.length - 6} more achievements
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Get emoji for achievement tier
 */
function getAchievementEmoji(tier: Achievement["tier"]): string {
  switch (tier) {
    case "bronze":
      return "🥉";
    case "silver":
      return "🥈";
    case "gold":
      return "🥇";
    case "platinum":
      return "💎";
    default:
      return "🏆";
  }
}

/**
 * Get background color for tier
 */
function getTierBackground(tier: Achievement["tier"]): string {
  switch (tier) {
    case "bronze":
      return "bg-amber-100 dark:bg-amber-900/30";
    case "silver":
      return "bg-gray-200 dark:bg-gray-700/50";
    case "gold":
      return "bg-yellow-100 dark:bg-yellow-900/30";
    case "platinum":
      return "bg-blue-100 dark:bg-blue-900/30";
    default:
      return "bg-muted";
  }
}

/**
 * Skeleton loader for streak
 */
export function WasteStreakSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="h-5 w-24 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-10 w-12 bg-muted animate-pulse rounded" />
            <div className="h-4 w-20 bg-muted animate-pulse rounded" />
          </div>
          <div className="space-y-2 text-right">
            <div className="h-4 w-16 bg-muted animate-pulse rounded ml-auto" />
            <div className="h-8 w-8 bg-muted animate-pulse rounded ml-auto" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
