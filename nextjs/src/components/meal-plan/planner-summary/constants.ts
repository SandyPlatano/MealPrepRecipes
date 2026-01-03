import type { DayOfWeek } from "@/types/meal-plan";

// Day letter abbreviations
export const DAY_LETTERS: Record<DayOfWeek, string> = {
  Monday: "M",
  Tuesday: "T",
  Wednesday: "W",
  Thursday: "T",
  Friday: "F",
  Saturday: "S",
  Sunday: "S",
};

// Default colors for cooks (fallback when no custom color assigned)
export const DEFAULT_COOK_COLORS = [
  "#3b82f6", // blue
  "#a855f7", // purple
  "#10b981", // green
  "#f59e0b", // amber
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f43f5e", // rose
];
