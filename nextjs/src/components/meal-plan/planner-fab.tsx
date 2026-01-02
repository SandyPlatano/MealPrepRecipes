"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Plus, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { DAYS_OF_WEEK, type DayOfWeek } from "@/types/meal-plan";

interface PlannerFabProps {
  weekStartDate: Date;
  onSelectDay: (day: DayOfWeek) => void;
}

const DAY_LABELS: Record<DayOfWeek, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

export function PlannerFab({ weekStartDate, onSelectDay }: PlannerFabProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Avoid hydration mismatch for "Today" calculation
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate which day is "today" in the current week view
  const getTodayIndex = (): number | null => {
    if (!isMounted) return null;
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(weekStartDate);
      dayDate.setDate(dayDate.getDate() + i);
      if (dayDate.toDateString() === today.toDateString()) {
        return i;
      }
    }
    return null;
  };

  const todayIndex = getTodayIndex();

  // Check if a day is in the past
  const isPast = (index: number): boolean => {
    if (!isMounted) return false;
    const dayDate = new Date(weekStartDate);
    dayDate.setDate(dayDate.getDate() + index);
    return dayDate < today;
  };

  const handleSelectDay = (day: DayOfWeek) => {
    setIsOpen(false);
    onSelectDay(day);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          size="lg"
          className={cn(
            // Fixed position, only visible on mobile
            "fixed bottom-20 right-4 z-40 md:hidden",
            // Circle shape with shadow
            "h-14 w-14 rounded-full shadow-lg",
            // Animation
            "transition-all duration-200 hover:scale-105 active:scale-95",
            // When open, rotate the plus icon
            isOpen && "rotate-45"
          )}
          aria-label="Add meal to a day"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        side="top"
        sideOffset={8}
        className="w-48 mb-2"
      >
        <DropdownMenuLabel className="flex items-center gap-2 text-xs text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5" />
          Add meal to...
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Today option (if this week includes today) */}
        {todayIndex !== null && (
          <>
            <DropdownMenuItem
              onClick={() => handleSelectDay(DAYS_OF_WEEK[todayIndex])}
              className="font-medium text-primary"
            >
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#D9F99D] animate-pulse" />
                Today ({DAY_LABELS[DAYS_OF_WEEK[todayIndex]]})
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {/* All days */}
        {DAYS_OF_WEEK.map((day, index) => {
          const dayDate = new Date(weekStartDate);
          dayDate.setDate(dayDate.getDate() + index);
          const dateNum = dayDate.getDate();
          const isToday = index === todayIndex;
          const dayIsPast = isPast(index);

          // Skip today since we already showed it above
          if (isToday) return null;

          return (
            <DropdownMenuItem
              key={day}
              onClick={() => handleSelectDay(day)}
              disabled={dayIsPast}
              className={cn(
                "flex items-center justify-between",
                dayIsPast && "text-muted-foreground"
              )}
            >
              <span>{day}</span>
              <span className="text-xs text-muted-foreground">{dateNum}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
