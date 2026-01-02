"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  WasteMetricCard,
  WasteMetricCardSkeleton,
} from "./waste-metric-card";
import {
  WasteStreak,
  EarnedAchievements,
  WasteStreakSkeleton,
} from "./waste-streak";
import {
  Leaf,
  DollarSign,
  CloudOff,
  TrendingUp,
  Utensils,
  ShoppingCart,
} from "lucide-react";
import { getWasteDashboard } from "@/app/actions/waste-tracking";
import type { WasteDashboardData } from "@/types/waste-tracking";
import {
  formatMoneySaved,
  formatWeight,
  formatPercent,
  getMotivationalMessage,
} from "@/lib/waste/calculations";

interface WasteDashboardProps {
  className?: string;
}

/**
 * Full waste tracking dashboard
 */
export function WasteDashboard({ className }: WasteDashboardProps) {
  const [data, setData] = useState<WasteDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      setIsLoading(true);
      const result = await getWasteDashboard();
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.data);
      }
      setIsLoading(false);
    }

    loadDashboard();
  }, []);

  if (isLoading) {
    return <WasteDashboardSkeleton className={className} />;
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center">
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  const { aggregate, streak, achievements, next_achievement, current_week } =
    data;

  const motivationalMessage = getMotivationalMessage(streak, aggregate);

  return (
    <div className={className}>
      {/* Motivational Header */}
      <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-[#D9F99D]/10 to-green-100/10 border border-[#D9F99D]/30">
        <p className="text-sm font-medium text-green-700">
          {motivationalMessage}
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <WasteMetricCard
          title="Food Saved"
          value={formatWeight(aggregate.total_waste_prevented_kg)}
          subtitle="Total waste prevented"
          icon={Leaf}
          iconColor="text-green-500"
        />
        <WasteMetricCard
          title="Money Saved"
          value={formatMoneySaved(aggregate.total_money_saved_cents)}
          subtitle="Through meal planning"
          icon={DollarSign}
          iconColor="text-amber-500"
        />
        <WasteMetricCard
          title="CO2 Reduced"
          value={formatWeight(aggregate.total_co2_saved_kg)}
          subtitle="Carbon footprint impact"
          icon={CloudOff}
          iconColor="text-blue-500"
        />
        <WasteMetricCard
          title="Utilization"
          value={formatPercent(aggregate.average_utilization_rate)}
          subtitle="Meals cooked vs planned"
          icon={TrendingUp}
          iconColor="text-purple-500"
        />
      </div>

      {/* Streak and Achievements */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <WasteStreak
          streak={streak}
          aggregate={aggregate}
          nextAchievement={next_achievement}
        />
        <EarnedAchievements achievements={achievements} />
      </div>

      {/* This Week's Progress */}
      {current_week && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">This Week&apos;s Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Utensils className="h-4 w-4" />
                  <span className="text-xs">Meals</span>
                </div>
                <p className="text-lg font-semibold">
                  {current_week.meals_cooked}/{current_week.meals_planned}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatPercent(current_week.utilization_rate)} cooked
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ShoppingCart className="h-4 w-4" />
                  <span className="text-xs">Shopping</span>
                </div>
                <p className="text-lg font-semibold">
                  {current_week.shopping_items_checked}/
                  {current_week.shopping_items_total}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatPercent(current_week.shopping_efficiency)} checked
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Leaf className="h-4 w-4" />
                  <span className="text-xs">Waste Saved</span>
                </div>
                <p className="text-lg font-semibold">
                  {formatWeight(current_week.estimated_waste_prevented_kg)}
                </p>
                <p className="text-xs text-muted-foreground">this week</p>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-xs">Money Saved</span>
                </div>
                <p className="text-lg font-semibold">
                  {formatMoneySaved(current_week.estimated_money_saved_cents)}
                </p>
                <p className="text-xs text-muted-foreground">this week</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State for First-Time Users */}
      {aggregate.weeks_tracked === 0 && (
        <Card className="mt-6">
          <CardContent className="py-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <Leaf className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="font-semibold text-lg mb-2">
              Start Tracking Your Impact
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Create a meal plan and cook your meals to see your food waste
              reduction impact. Every meal planned is a step toward a more
              sustainable kitchen!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * Skeleton loader for the full dashboard
 */
function WasteDashboardSkeleton({ className }: { className?: string }) {
  return (
    <div className={className}>
      {/* Motivational Header Skeleton */}
      <div className="mb-6 p-4 rounded-lg bg-muted/50">
        <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
      </div>

      {/* Metrics Grid Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <WasteMetricCardSkeleton key={i} />
        ))}
      </div>

      {/* Streak and Achievements Skeleton */}
      <div className="grid md:grid-cols-2 gap-6">
        <WasteStreakSkeleton />
        <WasteStreakSkeleton />
      </div>
    </div>
  );
}
