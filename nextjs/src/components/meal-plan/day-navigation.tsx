"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { type DayOfWeek, DAYS_OF_WEEK, formatWeekRange, getWeekStart } from "@/types/meal-plan";

interface DayNavigationProps {
  weekStartDate: Date;
  weekStartStr: string;
  mealCounts: Record<DayOfWeek, number>;
  onNavigateWeek: (direction: "prev" | "next") => void;
  onGoToCurrentWeek: () => void;
  canNavigateWeeks: boolean;
  isVisible: boolean;
}

export function DayNavigation({
  weekStartDate,
  weekStartStr,
  mealCounts,
  onNavigateWeek,
  onGoToCurrentWeek,
  canNavigateWeeks,
  isVisible,
}: DayNavigationProps) {
  const [activeDay, setActiveDay] = useState<DayOfWeek | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Determine if this is the current week
  const isCurrentWeek = isMounted
    ? weekStartStr === getWeekStart(new Date()).toISOString().split("T")[0]
    : false;

  // Track which day is in view
  useEffect(() => {
    if (!isVisible) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const dayId = entry.target.getAttribute("data-day");
            if (dayId) {
              setActiveDay(dayId as DayOfWeek);
            }
          }
        });
      },
      {
        root: null,
        rootMargin: "-100px 0px -60% 0px",
        threshold: 0,
      }
    );

    // Observe all day rows
    DAYS_OF_WEEK.forEach((day) => {
      const element = document.getElementById(`day-row-${day}`);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [isVisible]);

  // Scroll to a specific day
  const scrollToDay = useCallback((day: DayOfWeek) => {
    const element = document.getElementById(`day-row-${day}`);
    if (element) {
      const offset = 140; // Account for sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  }, []);

  // Get today's day of week
  const today = isMounted ? new Date() : null;

  return (
    <div
      className={cn(
        "fixed left-0 right-0 z-40 transition-all duration-300 ease-out",
        "bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80",
        "border-b shadow-sm",
        isVisible
          ? "translate-y-0 opacity-100 top-16"
          : "-translate-y-full opacity-0 pointer-events-none top-0"
      )}
    >
      <div className="container mx-auto px-2 sm:px-4">
        {/* Main Navigation Row */}
        <div className="flex items-center gap-1 sm:gap-2 py-2">
          {/* Week Nav - Prev */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigateWeek("prev")}
            disabled={!canNavigateWeeks}
            className="h-8 w-8 flex-shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Day Pills */}
          <div className="flex-1 flex items-center justify-center gap-0.5 sm:gap-1 overflow-x-auto scrollbar-hide">
            {DAYS_OF_WEEK.map((day, index) => {
              const dayDate = new Date(weekStartDate);
              dayDate.setDate(dayDate.getDate() + index);
              const dayNum = dayDate.getDate();
              const dayAbbrev = day.slice(0, 1).toUpperCase(); // M, T, W, T, F, S, S
              const mealCount = mealCounts[day] || 0;

              const isToday =
                isMounted &&
                today &&
                dayDate.toDateString() === today.toDateString();
              const isActive = activeDay === day;

              return (
                <button
                  key={day}
                  onClick={() => scrollToDay(day)}
                  className={cn(
                    "flex flex-col items-center justify-center",
                    "min-w-[36px] sm:min-w-[44px] h-12 sm:h-14 px-1 sm:px-2 rounded-lg",
                    "transition-all duration-200 ease-out",
                    "hover:bg-muted/80",
                    isActive && "bg-primary/10 scale-105",
                    isToday && !isActive && "ring-2 ring-primary/50"
                  )}
                >
                  <span
                    className={cn(
                      "text-[10px] sm:text-xs font-medium",
                      isToday ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {dayAbbrev}
                  </span>
                  <span
                    className={cn(
                      "text-base sm:text-lg font-bold leading-none",
                      isToday && "text-primary",
                      isActive && "text-primary"
                    )}
                  >
                    {dayNum}
                  </span>
                  {/* Meal indicator dots */}
                  <div className="flex gap-0.5 mt-0.5 h-1.5">
                    {mealCount > 0 ? (
                      Array.from({ length: Math.min(mealCount, 3) }).map(
                        (_, i) => (
                          <span
                            key={i}
                            className={cn(
                              "w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full",
                              isActive || isToday
                                ? "bg-primary"
                                : "bg-muted-foreground/50"
                            )}
                          />
                        )
                      )
                    ) : (
                      <span className="w-1 h-1 rounded-full bg-transparent" />
                    )}
                    {mealCount > 3 && (
                      <span className="text-[8px] text-muted-foreground leading-none">
                        +
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Week Nav - Next */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigateWeek("next")}
            disabled={!canNavigateWeeks}
            className="h-8 w-8 flex-shrink-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Week Label & Today Button - Collapsed on mobile */}
        <div className="hidden sm:flex items-center justify-between pb-2 pt-0 border-t border-border/50">
          <span className="text-xs text-muted-foreground font-medium">
            {formatWeekRange(weekStartDate)}
          </span>
          {!isCurrentWeek && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onGoToCurrentWeek}
              className="h-6 text-xs"
            >
              Go to Today
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
