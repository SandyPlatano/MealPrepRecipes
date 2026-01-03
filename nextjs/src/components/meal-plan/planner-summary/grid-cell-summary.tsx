import { CalendarDays, Users, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DayProgressCircles } from "./day-progress-circles";
import { DEFAULT_COOK_COLORS } from "./constants";
import type { DayOfWeek } from "@/types/meal-plan";
import type { CookBreakdown, CalculatedNutritionProgress } from "./types";

interface GridCellSummaryProps {
  daysWithMeals: Set<DayOfWeek>;
  cookBreakdown: CookBreakdown;
  cookColors: Record<string, string>;
  totalMeals: number;
  showNutrition: boolean;
  calculatedProgress: CalculatedNutritionProgress | null;
}

export function GridCellSummary({
  daysWithMeals,
  cookBreakdown,
  cookColors,
  totalMeals,
  showNutrition,
  calculatedProgress,
}: GridCellSummaryProps) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md h-full min-h-0">
      <CardContent className="p-3 flex flex-col gap-2 h-full overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            <span className="text-sm font-mono font-semibold">Week Summary</span>
          </div>
          <Badge variant="secondary" className="font-mono text-xs">
            {totalMeals} meal{totalMeals !== 1 ? "s" : ""}
          </Badge>
        </div>

        {/* Day Progress Circles - compact */}
        <DayProgressCircles daysWithMeals={daysWithMeals} />

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Cook Breakdown - compact */}
        {Object.keys(cookBreakdown.breakdown).length > 0 || cookBreakdown.unassigned > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(cookBreakdown.breakdown).map(([cook, count]) => {
              const cookColor = cookColors[cook] || DEFAULT_COOK_COLORS[Object.keys(cookBreakdown.breakdown).indexOf(cook) % DEFAULT_COOK_COLORS.length];
              return (
                <div
                  key={cook}
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs bg-secondary border border-input"
                  style={{ borderLeft: `3px solid ${cookColor}` }}
                >
                  <span className="truncate max-w-[60px]">{cook}</span>
                  <span className="font-mono text-muted-foreground">{count}</span>
                </div>
              );
            })}
            {cookBreakdown.unassigned > 0 && (
              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs bg-muted text-muted-foreground border border-input">
                <span>Unassigned</span>
                <span className="font-mono">{cookBreakdown.unassigned}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span>No cooks assigned</span>
          </div>
        )}

        {/* Compact nutrition preview (if enabled) */}
        {showNutrition && calculatedProgress && (
          <>
            <div className="h-px bg-border" />
            <div className="flex items-center gap-3 text-xs">
              <Activity className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              <div className="flex gap-3 flex-wrap">
                <span className="font-mono">
                  {calculatedProgress.totals.calories > 0
                    ? `${Math.round(calculatedProgress.totals.calories / 7)}/day cal`
                    : "—"
                  }
                </span>
                <span className="font-mono text-muted-foreground">
                  {calculatedProgress.totals.protein > 0
                    ? `${Math.round(calculatedProgress.totals.protein / 7)}g protein`
                    : ""
                  }
                </span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
