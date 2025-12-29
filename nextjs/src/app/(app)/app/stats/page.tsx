import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconBadge } from "@/components/ui/icon-badge";
import { Apple, ArrowRight, TrendingUp, DollarSign, Flame } from "lucide-react";
import { STATS_CATEGORIES } from "@/lib/stats/stats-categories";
import { getWasteDashboard } from "@/app/actions/waste-tracking";
import { getWeeksMealCounts } from "@/app/actions/meal-plans";
import { getWeekStart } from "@/types/meal-plan";

export const metadata: Metadata = {
  title: "Stats | Meal Prep OS",
  description: "View your meal planning statistics, nutrition tracking, and sustainability impact",
};

export default async function StatsOverviewPage() {
  // Get current week start for meal count query
  const currentWeekStart = getWeekStart(new Date()).toISOString().split("T")[0];

  // Fetch real data in parallel
  const [wasteDashboard, mealCounts] = await Promise.all([
    getWasteDashboard(),
    getWeeksMealCounts([currentWeekStart]),
  ]);

  // Extract stats from fetched data
  const mealsPlanned = mealCounts.data?.[0]?.mealCount || 0;
  const utilizationRate = wasteDashboard.data?.aggregate?.average_utilization_rate || 0;
  const totalSavedCents = wasteDashboard.data?.aggregate?.total_money_saved_cents || 0;
  const totalSavedDollars = Math.round(totalSavedCents / 100);
  const currentStreak = wasteDashboard.data?.streak?.current_streak || 0;

  // Get non-overview categories for the cards
  const featureCategories = STATS_CATEGORIES.filter((cat) => cat.id !== "overview");

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight font-mono">Stats Overview</h1>
        <p className="text-muted-foreground">
          Track your progress, nutrition goals, and environmental impact.
        </p>
      </div>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickStatCard
          label="Streak"
          value={currentStreak > 0 ? `${currentStreak} week${currentStreak !== 1 ? "s" : ""}` : "Start now!"}
          icon={TrendingUp}
          iconColor="text-primary"
        />
        <QuickStatCard
          label="This Week"
          value={mealsPlanned > 0 ? `${mealsPlanned} meals` : "No meals"}
          icon={Flame}
          iconColor="text-primary"
        />
        <QuickStatCard
          label="Utilization"
          value={utilizationRate > 0 ? `${Math.round(utilizationRate)}%` : "—"}
          icon={Apple}
          iconColor="text-sage-500"
        />
        <QuickStatCard
          label="Total Saved"
          value={totalSavedDollars > 0 ? `$${totalSavedDollars}` : "$0"}
          icon={DollarSign}
          iconColor="text-primary"
        />
      </div>

      {/* Feature Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {featureCategories.map((category) => {
          const Icon = category.icon;
          return (
            <Card key={category.id} className="group hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <IconBadge icon={Icon} color="primary" size="lg" />
                    <div>
                      <CardTitle className="text-lg">{category.label}</CardTitle>
                      <CardDescription className="text-sm">
                        {category.description}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full group-hover:bg-accent">
                  <Link href={category.path}>
                    View {category.label}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tips Section */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="py-6">
          <div className="flex items-start gap-4">
            <IconBadge icon={TrendingUp} color="primary" size="lg" className="rounded-full" />
            <div>
              <h3 className="font-semibold">Pro Tip</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Plan your meals consistently to build streaks and maximize your sustainability impact.
                Every meal planned is a step toward reducing food waste!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface QuickStatCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  iconColor: string;
}

function QuickStatCard({ label, value, icon: Icon, iconColor }: QuickStatCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Icon className={`h-5 w-5 ${iconColor}`} />
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-lg font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
