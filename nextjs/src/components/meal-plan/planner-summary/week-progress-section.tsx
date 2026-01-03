import { CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { DayProgressCircles } from "./day-progress-circles";
import { CookBreakdownChips } from "./cook-breakdown-chips";
import type { WeekProgressSectionProps } from "./types";

export function WeekProgressSection({
  daysWithMeals,
  cookBreakdown,
  cookColors,
  totalMeals,
}: WeekProgressSectionProps) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-mono flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            Week at a Glance
          </CardTitle>
          <Badge variant="secondary" className="font-mono text-xs">
            {totalMeals} meal{totalMeals !== 1 ? "s" : ""}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Day Progress Circles */}
        <DayProgressCircles daysWithMeals={daysWithMeals} />

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Cook Breakdown */}
        <CookBreakdownChips breakdown={cookBreakdown} cookColors={cookColors} />
      </CardContent>
    </Card>
  );
}
