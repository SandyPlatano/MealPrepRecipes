/**
 * Nutrition History Page
 * View weekly nutrition trends, historical data, and progress over time
 */

import { Suspense } from "react";
import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MacroDashboard } from "@/components/nutrition/macro-dashboard";
import { NutritionTipCard } from "@/components/nutrition/nutrition-tip-card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar, AlertCircle, HelpCircle, DollarSign } from "lucide-react";
import {
  getNutritionHistory,
  getMacroGoals,
  isNutritionTrackingEnabled,
  getWeeklyNutritionDashboard,
} from "@/app/actions/nutrition";
import { formatNutritionValue, calculateCurrentStreak } from "@/lib/nutrition/calculations";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { isCurrentUserAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = {
  title: "Nutrition History | Meal Planner",
  description: "View your nutrition trends and historical macro data",
};

// Get current week start (Monday)
function getCurrentWeekStart(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split("T")[0];
}

export default async function NutritionPage() {
  const showCosts = await isCurrentUserAdmin();

  return (
    <div className="container max-w-7xl space-y-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Nutrition Tracking</h1>
          <p className="text-muted-foreground">
            Track your macro goals, view trends, and analyze your nutrition over time
          </p>
        </div>
        <div className="flex gap-2">
          {showCosts && (
            <Button asChild variant="outline">
              <Link href="/app/nutrition/costs">
                <DollarSign className="mr-2 h-4 w-4" />
                Costs
              </Link>
            </Button>
          )}
          <Button asChild variant="outline">
            <Link href="/app/nutrition/help">
              <HelpCircle className="mr-2 h-4 w-4" />
              Help
            </Link>
          </Button>
        </div>
      </div>

      {/* Check if nutrition tracking is enabled */}
      <Suspense fallback={<NutritionTrackingCheckSkeleton />}>
        <NutritionTrackingCheck />
      </Suspense>

      {/* Current Week Dashboard */}
      <Suspense fallback={<CurrentWeekSkeleton />}>
        <CurrentWeekDashboard />
      </Suspense>

      {/* Historical Trends */}
      <Suspense fallback={<HistoricalTrendsSkeleton />}>
        <HistoricalTrends />
      </Suspense>
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
        <AlertDescription>Failed to check nutrition tracking status: {error}</AlertDescription>
      </Alert>
    );
  }

  if (!enabled) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>
            Nutrition tracking is disabled. Enable it in settings to start tracking your macros.
          </span>
          <Button asChild size="sm">
            <Link href="/app/settings">Go to Settings</Link>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}

/**
 * Current week dashboard
 */
async function CurrentWeekDashboard() {
  const weekStart = getCurrentWeekStart();

  const [dashboardResult, goalsResult] = await Promise.all([
    getWeeklyNutritionDashboard(weekStart),
    getMacroGoals(),
  ]);

  if (dashboardResult.error || !dashboardResult.data) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load weekly dashboard: {dashboardResult.error}
        </AlertDescription>
      </Alert>
    );
  }

  if (goalsResult.error || !goalsResult.data) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Set your macro goals to start tracking your progress.</span>
          <Button asChild size="sm" variant="outline">
            <Link href="/app/settings">Set Goals</Link>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Calculate the current streak from the dashboard data
  const currentStreak = calculateCurrentStreak(dashboardResult.data.days);

  // Find today's summary for the tip card
  const today = new Date().toISOString().split("T")[0];
  const todaysSummary = dashboardResult.data.days.find(
    (day) => day.date === today
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-2xl font-semibold">This Week</h2>
        <Badge variant="outline">
          {new Date(dashboardResult.data.week_start).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}{" "}
          -{" "}
          {new Date(dashboardResult.data.week_end).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </Badge>
      </div>

      {/* Today's Nutrition Tip */}
      {todaysSummary && (
        <NutritionTipCard todaysSummary={todaysSummary} />
      )}

      <MacroDashboard
        dashboard={dashboardResult.data}
        variant="full"
        currentStreak={currentStreak}
      />
    </div>
  );
}

/**
 * Historical trends and summary
 */
async function HistoricalTrends() {
  const { data: history, error } = await getNutritionHistory(12); // Last 12 weeks

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load nutrition history: {error}</AlertDescription>
      </Alert>
    );
  }

  if (!history || history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Historical Trends
          </CardTitle>
          <CardDescription>No historical data available yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your nutrition history will appear here as you track meals over time.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate overall statistics
  const totalWeeks = history.length;
  const avgWeeksOnTarget = Math.round(
    history.reduce((sum, week) => sum + (week.days_on_target || 0), 0) / totalWeeks
  );

  // Get most recent week for trend
  const recentWeek = history[0];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-2xl font-semibold">Historical Trends</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Tracking Period</CardDescription>
            <CardTitle className="text-3xl">{totalWeeks}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">weeks of nutrition data</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Average Days On Target</CardDescription>
            <CardTitle className="text-3xl">{avgWeeksOnTarget}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">days per week on average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Current Streak</CardDescription>
            <CardTitle className="text-3xl">
              {recentWeek?.days_on_target || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">days on target this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Summary</CardTitle>
          <CardDescription>Last {totalWeeks} weeks of nutrition data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {history.map((week, index) => (
              <WeeklySummaryRow
                key={week.id}
                week={week}
                isRecent={index === 0}
                goals={week.user_goals_snapshot}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Single week summary row
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
    user_goals_snapshot?: unknown;
  };
  isRecent: boolean;
  goals?: unknown;
}

function WeeklySummaryRow({ week, isRecent }: WeeklySummaryRowProps) {
  const weekDate = new Date(week.week_start);
  const weekLabel = weekDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const daysOnTarget = week.days_on_target || 0;
  const targetColor =
    daysOnTarget >= 5
      ? "text-green-600 dark:text-green-400"
      : daysOnTarget >= 3
      ? "text-yellow-600 dark:text-yellow-400"
      : "text-red-600 dark:text-red-400";

  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{weekLabel}</span>
          {isRecent && (
            <Badge variant="default" className="text-xs">
              Latest
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className={targetColor}>
            {daysOnTarget}/7 days on target
          </span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 text-right">
        <div>
          <div className="text-xs text-muted-foreground">Avg Cal</div>
          <div className="font-mono text-sm font-semibold">
            {formatNutritionValue(week.avg_calories, "", 0)}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Avg Protein</div>
          <div className="font-mono text-sm font-semibold">
            {formatNutritionValue(week.avg_protein_g, "g", 0)}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Avg Carbs</div>
          <div className="font-mono text-sm font-semibold">
            {formatNutritionValue(week.avg_carbs_g, "g", 0)}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Avg Fat</div>
          <div className="font-mono text-sm font-semibold">
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
function NutritionTrackingCheckSkeleton() {
  return <Skeleton className="h-12 w-full" />;
}

function CurrentWeekSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function HistoricalTrendsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
