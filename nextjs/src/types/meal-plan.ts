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

// Meal type for organizing meals by time of day
export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

// Display order for meal types (breakfast → lunch → dinner → snack → other)
export const MEAL_TYPE_ORDER: (MealType | null)[] = [
  "breakfast",
  "lunch",
  "dinner",
  "snack",
  null, // "Other" at the end
];

// Configuration for each meal type (colors, labels, emojis)
export const MEAL_TYPE_CONFIG: Record<
  MealType | "other",
  {
    label: string;
    emoji: string;
    borderColor: string; // Tailwind border color class
    bgColor: string; // Tailwind background tint class
    accentColor: string; // Raw color for inline styles
  }
> = {
  breakfast: {
    label: "Breakfast",
    emoji: "🌅",
    borderColor: "border-l-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/20",
    accentColor: "#fbbf24", // amber-400
  },
  lunch: {
    label: "Lunch",
    emoji: "🥗",
    borderColor: "border-l-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
    accentColor: "#34d399", // emerald-400
  },
  dinner: {
    label: "Dinner",
    emoji: "🍽️",
    borderColor: "border-l-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-950/20",
    accentColor: "#f97316", // orange-500 (brand coral)
  },
  snack: {
    label: "Snack",
    emoji: "🍿",
    borderColor: "border-l-violet-400",
    bgColor: "bg-violet-50 dark:bg-violet-950/20",
    accentColor: "#a78bfa", // violet-400
  },
  other: {
    label: "Other",
    emoji: "📋",
    borderColor: "border-l-gray-300 dark:border-l-gray-600",
    bgColor: "bg-gray-50 dark:bg-gray-800/50",
    accentColor: "#9ca3af", // gray-400
  },
};

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
  meal_type: MealType | null;
  serving_size: number | null;
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

// Meal plan template types
export interface MealPlanTemplate {
  id: string;
  household_id: string;
  name: string;
  assignments: TemplateAssignment[];
  created_at: string;
}

export interface TemplateAssignment {
  recipe_id: string;
  day_of_week: DayOfWeek;
  cook: string | null;
  meal_type: MealType | null;
  serving_size: number | null;
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

// Group meals by type and sort within each group by created_at
export function groupMealsByType<T extends { meal_type: MealType | null; created_at: string }>(
  meals: T[]
): Map<MealType | null, T[]> {
  const grouped = new Map<MealType | null, T[]>();

  // Initialize in display order
  for (const type of MEAL_TYPE_ORDER) {
    grouped.set(type, []);
  }

  // Group meals by type
  for (const meal of meals) {
    const type = meal.meal_type;
    const group = grouped.get(type);
    if (group) {
      group.push(meal);
    } else {
      // Handle unexpected type by putting in "other" (null)
      grouped.get(null)?.push(meal);
    }
  }

  // Sort within each group by created_at (oldest first)
  grouped.forEach((typeMeals) => {
    typeMeals.sort(
      (a: T, b: T) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  });

  return grouped;
}

// Get meal type config, defaulting to "other" for null
export function getMealTypeConfig(mealType: MealType | null) {
  return MEAL_TYPE_CONFIG[mealType ?? "other"];
}
