"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayColumn } from "./day-column";
import { RecipeSelector } from "./recipe-selector";
import {
  type WeekPlanData,
  type DayOfWeek,
  DAYS_OF_WEEK,
  formatWeekRange,
  getWeekStart,
} from "@/types/meal-plan";

interface Recipe {
  id: string;
  title: string;
  recipe_type: string;
  category?: string | null;
  prep_time?: string | null;
  cook_time?: string | null;
  tags?: string[];
}

interface WeeklyPlanViewProps {
  weekStart: Date;
  weekPlan: WeekPlanData;
  recipes: Recipe[];
  cookNames: string[];
}

export function WeeklyPlanView({
  weekStart,
  weekPlan,
  recipes,
  cookNames,
}: WeeklyPlanViewProps) {
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | null>(null);

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(weekStart);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    const weekStr = newDate.toISOString().split("T")[0];
    router.push(`/app/plan?week=${weekStr}`);
  };

  const goToCurrentWeek = () => {
    const currentWeek = getWeekStart(new Date());
    const weekStr = currentWeek.toISOString().split("T")[0];
    router.push(`/app/plan?week=${weekStr}`);
  };

  // Check if we're viewing the current week
  const currentWeekStart = getWeekStart(new Date());
  const isCurrentWeek =
    weekStart.toISOString().split("T")[0] ===
    currentWeekStart.toISOString().split("T")[0];

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigateWeek("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold min-w-[160px] text-center">
            {formatWeekRange(weekStart)}
          </h2>
          <Button variant="outline" size="icon" onClick={() => navigateWeek("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        {!isCurrentWeek && (
          <Button variant="ghost" size="sm" onClick={goToCurrentWeek}>
            Today
          </Button>
        )}
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
        {DAYS_OF_WEEK.map((day, index) => {
          const dayDate = new Date(weekStart);
          dayDate.setDate(dayDate.getDate() + index);

          return (
            <DayColumn
              key={day}
              day={day}
              date={dayDate}
              assignments={weekPlan.assignments[day]}
              onAddClick={() => setSelectedDay(day)}
            />
          );
        })}
      </div>

      {/* Recipe Selector Dialog */}
      <RecipeSelector
        open={selectedDay !== null}
        onOpenChange={(open) => !open && setSelectedDay(null)}
        recipes={recipes}
        selectedDay={selectedDay}
        weekStart={weekStart.toISOString().split("T")[0]}
        cookNames={cookNames}
      />
    </div>
  );
}
