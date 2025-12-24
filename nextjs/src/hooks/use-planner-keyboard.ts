"use client";

import { useEffect, useCallback, useState } from "react";
import { DAYS_OF_WEEK, type DayOfWeek } from "@/types/meal-plan";

interface UsePlannerKeyboardOptions {
  enabled?: boolean;
  onAddMeal?: (day: DayOfWeek) => void;
  onNavigateWeek?: (direction: "prev" | "next") => void;
}

interface UsePlannerKeyboardReturn {
  focusedDayIndex: number | null;
  focusedDay: DayOfWeek | null;
  setFocusedDayIndex: (index: number | null) => void;
  clearFocus: () => void;
}

/**
 * Hook for planner-specific keyboard shortcuts:
 * - 1-7: Focus day (Mon=1, Sun=7)
 * - A: Add meal to focused day
 * - Escape: Clear focus
 * - Arrow keys: Navigate between days
 */
export function usePlannerKeyboard({
  enabled = true,
  onAddMeal,
  onNavigateWeek,
}: UsePlannerKeyboardOptions = {}): UsePlannerKeyboardReturn {
  const [focusedDayIndex, setFocusedDayIndex] = useState<number | null>(null);

  const focusedDay = focusedDayIndex !== null ? DAYS_OF_WEEK[focusedDayIndex] : null;

  const clearFocus = useCallback(() => {
    setFocusedDayIndex(null);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing
      const target = event.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      const isEditable =
        tagName === "input" ||
        tagName === "textarea" ||
        target.isContentEditable ||
        target.closest('[role="textbox"]');

      if (isEditable) return;

      // Ignore if modal is open (check for dialog)
      const hasOpenDialog = document.querySelector('[role="dialog"]');
      if (hasOpenDialog) return;

      const key = event.key;

      // Number keys 1-7 to focus days
      if (/^[1-7]$/.test(key)) {
        event.preventDefault();
        const dayIndex = parseInt(key, 10) - 1;
        setFocusedDayIndex(dayIndex);
        return;
      }

      // 'A' to add meal to focused day
      if (key.toLowerCase() === "a" && focusedDayIndex !== null && onAddMeal) {
        event.preventDefault();
        onAddMeal(DAYS_OF_WEEK[focusedDayIndex]);
        return;
      }

      // Escape to clear focus
      if (key === "Escape" && focusedDayIndex !== null) {
        event.preventDefault();
        clearFocus();
        return;
      }

      // Arrow keys to navigate days
      if (key === "ArrowDown" || key === "ArrowRight") {
        event.preventDefault();
        if (focusedDayIndex === null) {
          setFocusedDayIndex(0);
        } else if (focusedDayIndex < 6) {
          setFocusedDayIndex(focusedDayIndex + 1);
        }
        return;
      }

      if (key === "ArrowUp" || key === "ArrowLeft") {
        event.preventDefault();
        if (focusedDayIndex === null) {
          setFocusedDayIndex(6);
        } else if (focusedDayIndex > 0) {
          setFocusedDayIndex(focusedDayIndex - 1);
        }
        return;
      }

      // '[' and ']' for week navigation
      if (key === "[" && onNavigateWeek) {
        event.preventDefault();
        onNavigateWeek("prev");
        return;
      }

      if (key === "]" && onNavigateWeek) {
        event.preventDefault();
        onNavigateWeek("next");
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, focusedDayIndex, onAddMeal, onNavigateWeek, clearFocus]);

  // Also listen for custom events from global shortcuts
  useEffect(() => {
    const handleNextWeek = () => onNavigateWeek?.("next");
    const handlePrevWeek = () => onNavigateWeek?.("prev");

    window.addEventListener("keyboard:nextWeek", handleNextWeek);
    window.addEventListener("keyboard:prevWeek", handlePrevWeek);

    return () => {
      window.removeEventListener("keyboard:nextWeek", handleNextWeek);
      window.removeEventListener("keyboard:prevWeek", handlePrevWeek);
    };
  }, [onNavigateWeek]);

  return {
    focusedDayIndex,
    focusedDay,
    setFocusedDayIndex,
    clearFocus,
  };
}
