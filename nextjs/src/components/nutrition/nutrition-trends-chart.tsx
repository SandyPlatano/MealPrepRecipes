"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeeklyHistory {
  id: string;
  week_start: string;
  days_on_target?: number | null;
  avg_calories?: number | null;
  avg_protein_g?: number | null;
  avg_carbs_g?: number | null;
  avg_fat_g?: number | null;
}

interface NutritionTrendsChartProps {
  history: WeeklyHistory[];
  className?: string;
}

const chartConfig: ChartConfig = {
  calories: { label: "Calories", color: "#D9F99D" },
  protein: { label: "Protein", color: "#FDE047" },
  carbs: { label: "Carbs", color: "#EDE9FE" },
  fat: { label: "Fat", color: "#FED7AA" },
  daysOnTarget: { label: "Days on Target", color: "#D9F99D" },
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
  const diff = ((recentAvg - earlierAvg) / earlierAvg) * 100;
  if (diff > 5) return "up";
  if (diff < -5) return "down";
  return "flat";
}

export function NutritionTrendsChart({ history, className }: NutritionTrendsChartProps) {
  const chartData = history
    .slice()
    .reverse()
    .map((week) => ({
      week: formatWeekLabel(week.week_start),
      fullDate: week.week_start,
      calories: Math.round(week.avg_calories || 0),
      protein: Math.round(week.avg_protein_g || 0),
      carbs: Math.round(week.avg_carbs_g || 0),
      fat: Math.round(week.avg_fat_g || 0),
      daysOnTarget: week.days_on_target || 0,
    }));

  const calorieTrend = calculateTrend(chartData.map((d) => d.calories));
  const proteinTrend = calculateTrend(chartData.map((d) => d.protein));

  const TrendIcon = ({ trend }: { trend: "up" | "down" | "flat" }) => {
    if (trend === "up") return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === "down") return <TrendingDown className="h-4 w-4 text-amber-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  if (chartData.length < 2) {
    return null;
  }

  return (
    <div className={cn("grid gap-4 md:grid-cols-2", className)}>
      {/* Calories Trend */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Calorie Trend</CardTitle>
              <CardDescription>Weekly average calories</CardDescription>
            </div>
            <TrendIcon trend={calorieTrend} />
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <AreaChart data={chartData} margin={{ left: 0, right: 0 }}>
              <defs>
                <linearGradient id="calorieGradient" x1="0" y1="0" x2="0" y2="1">
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
                width={45}
                tickFormatter={(value) => `${value}`}
              />
              <ChartTooltip
                content={<ChartTooltipContent indicator="line" />}
              />
              <Area
                type="monotone"
                dataKey="calories"
                stroke="#D9F99D"
                strokeWidth={2}
                fill="url(#calorieGradient)"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Protein Trend */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Protein Trend</CardTitle>
              <CardDescription>Weekly average grams</CardDescription>
            </div>
            <TrendIcon trend={proteinTrend} />
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <AreaChart data={chartData} margin={{ left: 0, right: 0 }}>
              <defs>
                <linearGradient id="proteinGradient" x1="0" y1="0" x2="0" y2="1">
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
                width={35}
                tickFormatter={(value) => `${value}g`}
              />
              <ChartTooltip
                content={<ChartTooltipContent indicator="line" />}
              />
              <Area
                type="monotone"
                dataKey="protein"
                stroke="#FDE047"
                strokeWidth={2}
                fill="url(#proteinGradient)"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Days on Target - Bar Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Days On Target</CardTitle>
          <CardDescription>How many days you hit your goals each week</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
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
                width={25}
                domain={[0, 7]}
                ticks={[0, 2, 4, 6]}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
              />
              <Bar
                dataKey="daysOnTarget"
                fill="#D9F99D"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Macro Distribution - Line Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Macro Balance</CardTitle>
          <CardDescription>Protein, carbs, and fat trends</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <LineChart data={chartData} margin={{ left: 0, right: 0 }}>
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
                tickFormatter={(value) => `${value}g`}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
              />
              <Line
                type="monotone"
                dataKey="protein"
                stroke="#FDE047"
                strokeWidth={2}
                dot={{ fill: "#FDE047", r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="carbs"
                stroke="#EDE9FE"
                strokeWidth={2}
                dot={{ fill: "#EDE9FE", r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="fat"
                stroke="#FED7AA"
                strokeWidth={2}
                dot={{ fill: "#FED7AA", r: 3 }}
              />
            </LineChart>
          </ChartContainer>
          <div className="flex justify-center gap-6 mt-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#FDE047]" />
              <span className="text-xs text-muted-foreground">Protein</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#EDE9FE]" />
              <span className="text-xs text-muted-foreground">Carbs</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#FED7AA]" />
              <span className="text-xs text-muted-foreground">Fat</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
