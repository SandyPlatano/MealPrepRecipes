"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis } from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { WasteMetrics } from "@/types/waste-tracking";
import { cn } from "@/lib/utils";

interface WasteTrendsChartProps {
  weeklyTrend: WasteMetrics[];
  className?: string;
}

const chartConfig: ChartConfig = {
  wasteKg: { label: "Waste Prevented", color: "#D9F99D" },
  moneySaved: { label: "Money Saved", color: "#FDE047" },
  utilization: { label: "Utilization", color: "#EDE9FE" },
  co2: { label: "CO2 Saved", color: "#93C5FD" },
};

function formatWeekLabel(weekStart: string): string {
  const date = new Date(weekStart);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function calculateTrend(data: number[]): "up" | "down" | "flat" {
  if (data.length < 2) return "flat";
  const recent = data.slice(-3);
  const earlier = data.slice(0, 3);
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;
  if (earlierAvg === 0) return recentAvg > 0 ? "up" : "flat";
  const diff = ((recentAvg - earlierAvg) / earlierAvg) * 100;
  if (diff > 5) return "up";
  if (diff < -5) return "down";
  return "flat";
}

export function WasteTrendsChart({ weeklyTrend, className }: WasteTrendsChartProps) {
  // Transform data for charts (oldest first for left-to-right progression)
  const chartData = weeklyTrend
    .slice()
    .reverse()
    .map((week) => ({
      week: formatWeekLabel(week.week_start),
      fullDate: week.week_start,
      wasteKg: Number(week.estimated_waste_prevented_kg?.toFixed(2)) || 0,
      moneySaved: Math.round((week.estimated_money_saved_cents || 0) / 100),
      utilization: Math.round(((week.meals_cooked / Math.max(week.meals_planned, 1)) * 100)),
      co2: Number(week.estimated_co2_saved_kg?.toFixed(2)) || 0,
    }));

  const wasteTrend = calculateTrend(chartData.map((d) => d.wasteKg));
  const moneyTrend = calculateTrend(chartData.map((d) => d.moneySaved));

  const TrendIcon = ({ trend, positive = true }: { trend: "up" | "down" | "flat"; positive?: boolean }) => {
    // For metrics where up is good (waste prevented, money saved)
    const isPositive = positive ? trend === "up" : trend === "down";
    const isNegative = positive ? trend === "down" : trend === "up";

    if (isPositive) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (isNegative) return <TrendingDown className="h-4 w-4 text-amber-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  if (chartData.length < 2) {
    return null;
  }

  return (
    <div className={cn("grid gap-4 md:grid-cols-2", className)}>
      {/* Waste Prevented Trend */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Food Waste Prevented</CardTitle>
              <CardDescription>Weekly kg of food saved</CardDescription>
            </div>
            <TrendIcon trend={wasteTrend} />
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[180px] w-full">
            <AreaChart data={chartData} margin={{ left: 0, right: 0 }}>
              <defs>
                <linearGradient id="wasteGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D9F99D" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#D9F99D" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="week"
                tickLine={false}
                axisLine={false}
                fontSize={11}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={11}
                width={35}
                tickFormatter={(value) => `${value}kg`}
              />
              <ChartTooltip
                content={<ChartTooltipContent indicator="line" />}
              />
              <Area
                type="monotone"
                dataKey="wasteKg"
                stroke="#D9F99D"
                strokeWidth={2}
                fill="url(#wasteGradient)"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Money Saved Trend */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Money Saved</CardTitle>
              <CardDescription>Weekly savings from planning</CardDescription>
            </div>
            <TrendIcon trend={moneyTrend} />
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[180px] w-full">
            <AreaChart data={chartData} margin={{ left: 0, right: 0 }}>
              <defs>
                <linearGradient id="moneyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FDE047" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#FDE047" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="week"
                tickLine={false}
                axisLine={false}
                fontSize={11}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={11}
                width={30}
                tickFormatter={(value) => `$${value}`}
              />
              <ChartTooltip
                content={<ChartTooltipContent indicator="line" />}
              />
              <Area
                type="monotone"
                dataKey="moneySaved"
                stroke="#FDE047"
                strokeWidth={2}
                fill="url(#moneyGradient)"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Utilization Rate - Bar Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Meal Utilization</CardTitle>
          <CardDescription>% of planned meals cooked each week</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[180px] w-full">
            <BarChart data={chartData} margin={{ left: 0, right: 0 }}>
              <XAxis
                dataKey="week"
                tickLine={false}
                axisLine={false}
                fontSize={11}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={11}
                width={35}
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
              />
              <Bar
                dataKey="utilization"
                fill="#EDE9FE"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* CO2 Saved Trend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Carbon Impact</CardTitle>
          <CardDescription>Weekly CO2 emissions prevented</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[180px] w-full">
            <AreaChart data={chartData} margin={{ left: 0, right: 0 }}>
              <defs>
                <linearGradient id="co2Gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#93C5FD" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#93C5FD" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="week"
                tickLine={false}
                axisLine={false}
                fontSize={11}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={11}
                width={35}
                tickFormatter={(value) => `${value}kg`}
              />
              <ChartTooltip
                content={<ChartTooltipContent indicator="line" />}
              />
              <Area
                type="monotone"
                dataKey="co2"
                stroke="#93C5FD"
                strokeWidth={2}
                fill="url(#co2Gradient)"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
