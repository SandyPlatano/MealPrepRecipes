import { useState, useTransition, useEffect, useMemo } from "react";
import type { DayOfWeek, MealAssignmentWithRecipe, MealType } from "@/types/meal-plan";
import { groupMealsByType } from "@/types/meal-plan";

interface UsePlannerDayStateProps {
  day: DayOfWeek;
  date: Date;
  assignments: MealAssignmentWithRecipe[];
  keyboardModalOpen?: boolean;
  onKeyboardModalClose?: () => void;
  onAddMeal: (recipeId: string, day: DayOfWeek, cook?: string, mealType?: MealType | null, servingSize?: number | null) => Promise<void>;
}

interface UsePlannerDayStateReturn {
  state: {
    isPending: boolean;
    modalOpen: boolean;
    isMounted: boolean;
    groupedAssignments: Map<MealType | null, MealAssignmentWithRecipe[]>;
    today: Date;
    isToday: boolean;
    isPast: boolean;
    dayNumber: number;
    dayAbbrev: string;
    monthAbbrev: string;
    keyboardNumber: number;
  };
  actions: {
    startTransition: (callback: () => void) => void;
    handleModalClose: (open: boolean) => void;
    handleAddMeal: (recipeId: string, cook?: string, mealType?: MealType | null) => Promise<void>;
  };
  dialogs: {
    modalOpen: boolean;
    setModalOpen: (open: boolean) => void;
  };
}

export function usePlannerDayState({
  day,
  date,
  assignments,
  keyboardModalOpen = false,
  onKeyboardModalClose,
  onAddMeal,
}: UsePlannerDayStateProps): UsePlannerDayStateReturn {
  const [isPending, startTransition] = useTransition();
  const [modalOpen, setModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Handle keyboard-triggered modal
  useEffect(() => {
    if (keyboardModalOpen && !modalOpen) {
      setModalOpen(true);
    }
  }, [keyboardModalOpen, modalOpen]);

  // Track when component is mounted (client-side only) to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Group assignments by meal type for organized display
  const groupedAssignments = useMemo(() => {
    return groupMealsByType(assignments);
  }, [assignments]);

  // Only compute "today" on client to avoid server/client mismatch
  const today = isMounted ? new Date() : new Date(date);
  today.setHours(0, 0, 0, 0);
  const isToday = isMounted && date.toDateString() === today.toDateString();
  const isPast = isMounted && date < today;

  const dayNumber = date.getDate();
  const dayAbbrev = day.slice(0, 3).toUpperCase();
  // Use a consistent format that doesn't depend on locale
  const monthAbbrev = date.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
  // Keyboard shortcut number (1-7 for Mon-Sun)
  const keyboardNumber = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].indexOf(day) + 1;

  // Handle modal close (including keyboard-triggered)
  const handleModalClose = (open: boolean) => {
    setModalOpen(open);
    if (!open && onKeyboardModalClose) {
      onKeyboardModalClose();
    }
  };

  // Wrapper for adding meals that uses the day from props
  const handleAddMeal = async (recipeId: string, cook?: string, mealType?: MealType | null) => {
    await onAddMeal(recipeId, day, cook, mealType);
  };

  return {
    state: {
      isPending,
      modalOpen,
      isMounted,
      groupedAssignments,
      today,
      isToday,
      isPast,
      dayNumber,
      dayAbbrev,
      monthAbbrev,
      keyboardNumber,
    },
    actions: {
      startTransition,
      handleModalClose,
      handleAddMeal,
    },
    dialogs: {
      modalOpen,
      setModalOpen,
    },
  };
}
