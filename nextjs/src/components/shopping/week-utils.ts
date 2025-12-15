import { formatWeekRange, getWeekStart } from "@/types/meal-plan";

interface WeekOption {
  weekStart: string;
  label: string;
  mealCount: number;
}

// Helper to get week options for the selector
export function getWeekOptions(
  currentWeekStart: string,
  weeksData: Array<{ weekStart: string; mealCount: number }>
): WeekOption[] {
  return weeksData.map((week) => ({
    weekStart: week.weekStart,
    label: formatWeekRange(new Date(week.weekStart)),
    mealCount: week.mealCount,
  }));
}

// Helper to get upcoming weeks
export function getUpcomingWeeks(count: number = 4): string[] {
  const weeks: string[] = [];
  const today = new Date();

  for (let i = 0; i < count; i++) {
    const weekStart = getWeekStart(today);
    weekStart.setDate(weekStart.getDate() + i * 7);
    weeks.push(weekStart.toISOString().split("T")[0]);
  }

  return weeks;
}
