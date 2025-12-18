/**
 * Nutrition Tracking Page
 * Redesigned with cleaner UI, Today Hero Card, and tab navigation
 *
 * Structure:
 * - Today Hero Card (always visible)
 * - Tabs: Today | Week | Trends
 * - Quick Add FAB (mobile)
 */

import { Suspense } from "react";
import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TodayHeroCard } from "@/components/nutrition/today-hero-card";
import { MacroDashboard } from "@/components/nutrition/macro-dashboard";
import { NutritionTipCard } from "@/components/nutrition/nutrition-tip-card";
import { NutritionFab, QuickAddButton } from "@/components/nutrition/nutrition-fab";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar, AlertCircle, HelpCircle, DollarSign, Flame } from "lucide-react";
import {
  getNutritionHistory,
  isNutritionTrackingEnabled,
  getWeeklyNutritionDashboard,
  getDailyNutritionSummary,
} from "@/app/actions/nutrition";
import { formatNutritionValue, calculateCurrentStreak } from "@/lib/nutrition/calculations";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { isCurrentUserAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = {
  title: "Nutrition | Meal Prep OS",
  description: "Track your daily macros and nutrition goals",
};

// Get current week start (Monday)
function getCurrentWeekStart(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split("T")[0];
}

// Get today's date
function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

export default async function NutritionPage() {
  const showCosts = await isCurrentUserAdmin();
  const today = getTodayDate();

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* Simplified Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Nutrition</h1>
        <div className="flex gap-2">
          {showCosts && (
            <Button asChild variant="ghost" size="sm">
              <Link href="/app/stats/nutrition/costs">
                <DollarSign className="h-4 w-4" />
              </Link>
            </Button>
          )}
          <Button asChild variant="ghost" size="sm">
            <Link href="/app/stats/nutrition/help">
              <HelpCircle className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Nutrition Tracking Status Check */}
      <Suspense fallback={<Skeleton className="h-12 w-full" />}>
        <NutritionTrackingCheck />
      </Suspense>

      {/* Today Hero Card - Always Visible */}
      <Suspense fallback={<TodayHeroSkeleton />}>
        <TodayHeroSection date={today} />
      </Suspense>

      {/* Tab Navigation */}
      <Tabs defaultValue="today" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Today Tab */}
        <TabsContent value="today" className="space-y-4">
          <Suspense fallback={<TodayTabSkeleton />}>
            <TodayTabContent date={today} />
          </Suspense>
        </TabsContent>

        {/* Week Tab */}
        <TabsContent value="week" className="space-y-4">
          <Suspense fallback={<WeekTabSkeleton />}>
            <WeekTabContent />
          </Suspense>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Suspense fallback={<TrendsTabSkeleton />}>
            <TrendsTabContent />
          </Suspense>
        </TabsContent>
      </Tabs>

      {/* FAB for mobile - fixed position */}
      <div className="block md:hidden">
        <NutritionFab date={today} />
      </div>
    </div>
  );
}

/**
 * Check if nutrition tracking is enabled
 */
async function NutritionTrackingCheck() {
  const { enabled, error } = await isNutritionTrackingEnabled();

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to check tracking status: {error}</AlertDescription>
      </Alert>
    );
  }

  if (!enabled) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>
            Nutrition tracking is disabled.{" "}
            <Link href="/app/settings/dietary" className="underline hover:no-underline">
              Enable in settings
            </Link>
          </span>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}

/**
 * Today Hero Section - Always visible above tabs
 */
async function TodayHeroSection({ date }: { date: string }) {
  const { data: todaySummary, error } = await getDailyNutritionSummary(date);

  if (error || !todaySummary) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Unable to load today&apos;s nutrition data
          </p>
        </CardContent>
      </Card>
    );
  }

  return <TodayHeroCard todaySummary={todaySummary} />;
}

/**
 * Today Tab - Detailed today view with tips and quick add
 */
async function TodayTabContent({ date }: { date: string }) {
  const { data: todaySummary, error } = await getDailyNutritionSummary(date);

  if (error || !todaySummary) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Unable to load today&apos;s details</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Quick Add Button (Desktop) */}
      <div className="hidden md:block">
        <QuickAddButton date={date} variant="outline" className="w-full" />
      </div>

      {/* Nutrition Tip */}
      <NutritionTipCard todaysSummary={todaySummary} />

      {/* Meal Breakdown - if we have meals */}
      {todaySummary.meal_count > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Today&apos;s Meals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {todaySummary.meal_count} meal{todaySummary.meal_count !== 1 ? "s" : ""} planned
              </span>
              {todaySummary.data_completeness_pct < 100 && (
                <Badge variant="outline" className="text-xs">
                  {todaySummary.data_completeness_pct}% nutrition data
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * Week Tab - Weekly overview
 */
async function WeekTabContent() {
  const weekStart = getCurrentWeekStart();
  const { data: dashboard, error } = await getWeeklyNutritionDashboard(weekStart);

  if (error || !dashboard) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Unable to load weekly data: {error}</AlertDescription>
      </Alert>
    );
  }

  // Calculate the current streak
  const currentStreak = calculateCurrentStreak(dashboard.days);

  return (
    <div className="space-y-4">
      {/* Week Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            {new Date(dashboard.week_start).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}{" "}
            -{" "}
            {new Date(dashboard.week_end).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
        {currentStreak > 0 && (
          <div className="flex items-center gap-1 text-sm">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="font-medium">{currentStreak} day streak</span>
          </div>
        )}
      </div>

      {/* Weekly Dashboard */}
      <MacroDashboard
        dashboard={dashboard}
        variant="full"
        currentStreak={currentStreak}
      />
    </div>
  );
}

/**
 * Trends Tab - Historical data
 */
async function TrendsTabContent() {
  const { data: history, error } = await getNutritionHistory(12);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load history: {error}</AlertDescription>
      </Alert>
    );
  }

  if (!history || history.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <h3 className="mt-4 text-lg font-medium">No Historical Data</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Your nutrition history will appear here as you track meals over time.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate statistics
  const totalWeeks = history.length;
  const avgDaysOnTarget = Math.round(
    history.reduce((sum, week) => sum + (week.days_on_target || 0), 0) / totalWeeks
  );

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Weeks Tracked</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{totalWeeks}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Avg Days On Target</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{avgDaysOnTarget}/7</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Weekly History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Weekly Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {history.map((week, index) => (
            <WeeklySummaryRow key={week.id} week={week} isRecent={index === 0} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Weekly summary row
 */
interface WeeklySummaryRowProps {
  week: {
    id: string;
    week_start: string;
    days_on_target?: number | null;
    avg_calories?: number | null;
    avg_protein_g?: number | null;
    avg_carbs_g?: number | null;
    avg_fat_g?: number | null;
  };
  isRecent: boolean;
}

function WeeklySummaryRow({ week, isRecent }: WeeklySummaryRowProps) {
  const weekDate = new Date(week.week_start);
  const weekLabel = weekDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const daysOnTarget = week.days_on_target || 0;
  const statusColor =
    daysOnTarget >= 5
      ? "text-brand-sage"
      : daysOnTarget >= 3
      ? "text-muted-foreground"
      : "text-brand-coral/80";

  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{weekLabel}</span>
            {isRecent && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                Latest
              </Badge>
            )}
          </div>
          <span className={`text-xs ${statusColor}`}>
            {daysOnTarget}/7 on target
          </span>
        </div>
      </div>

      <div className="flex gap-4 text-right text-xs">
        <div>
          <div className="text-muted-foreground">Cal</div>
          <div className="font-medium tabular-nums">
            {formatNutritionValue(week.avg_calories, "", 0)}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground">P</div>
          <div className="font-medium tabular-nums">
            {formatNutritionValue(week.avg_protein_g, "g", 0)}
          </div>
        </div>
        <div className="hidden sm:block">
          <div className="text-muted-foreground">C</div>
          <div className="font-medium tabular-nums">
            {formatNutritionValue(week.avg_carbs_g, "g", 0)}
          </div>
        </div>
        <div className="hidden sm:block">
          <div className="text-muted-foreground">F</div>
          <div className="font-medium tabular-nums">
            {formatNutritionValue(week.avg_fat_g, "g", 0)}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Loading skeletons
 */
function TodayHeroSkeleton() {
  return (
    <Card>
      <CardContent className="py-8">
        <div className="flex flex-col items-center space-y-4">
          <Skeleton className="h-16 w-32" />
          <div className="flex gap-3">
            <Skeleton className="h-16 w-20" />
            <Skeleton className="h-16 w-20" />
            <Skeleton className="h-16 w-20" />
          </div>
          <Skeleton className="h-2 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

function TodayTabSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

function WeekTabSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-48" />
      <Card>
        <CardContent className="py-6">
          <div className="grid gap-4 sm:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TrendsTabSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
      <Card>
        <CardContent className="py-4 space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
