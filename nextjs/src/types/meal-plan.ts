// Meal planning types matching the database schema

export type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export const DAYS_OF_WEEK: DayOfWeek[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export interface MealPlan {
  id: string;
  household_id: string;
  week_start: string; // ISO date string (Monday)
  created_at: string;
  updated_at: string;
}

export interface MealAssignment {
  id: string;
  meal_plan_id: string;
  recipe_id: string;
  day_of_week: DayOfWeek;
  cook: string | null;
  created_at: string;
}

// Extended assignment with recipe details for display
export interface MealAssignmentWithRecipe extends MealAssignment {
  recipe: {
    id: string;
    title: string;
    recipe_type: string;
    prep_time: string | null;
    cook_time: string | null;
  };
}

// Form data for creating/updating assignments
export interface AssignmentFormData {
  recipe_id: string;
  day_of_week: DayOfWeek;
  cook?: string;
}

// Week view data structure
export interface WeekPlanData {
  meal_plan: MealPlan | null;
  assignments: Record<DayOfWeek, MealAssignmentWithRecipe[]>;
}

// Helper to get the Monday of a given week
export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Format date for display
export function formatWeekRange(weekStart: Date): string {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const startMonth = weekStart.toLocaleDateString("en-US", { month: "short" });
  const endMonth = weekEnd.toLocaleDateString("en-US", { month: "short" });
  const startDay = weekStart.getDate();
  const endDay = weekEnd.getDate();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} - ${endDay}`;
  }
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
}
