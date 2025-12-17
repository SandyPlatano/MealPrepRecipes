// ============================================================================
// Household Coordination Types
// Types for cooking schedules, dietary profiles, and household activities
// ============================================================================

// ============================================================================
// Day of Week
// ============================================================================

export type DayOfWeekIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const DAY_OF_WEEK_NAMES: Record<DayOfWeekIndex, string> = {
  0: "Monday",
  1: "Tuesday",
  2: "Wednesday",
  3: "Thursday",
  4: "Friday",
  5: "Saturday",
  6: "Sunday",
};

export const DAY_OF_WEEK_SHORT: Record<DayOfWeekIndex, string> = {
  0: "Mon",
  1: "Tue",
  2: "Wed",
  3: "Thu",
  4: "Fri",
  5: "Sat",
  6: "Sun",
};

// ============================================================================
// Cooking Schedule
// ============================================================================

export type ScheduleMealType = "breakfast" | "lunch" | "dinner";

export interface CookingSchedule {
  id: string;
  household_id: string;
  day_of_week: DayOfWeekIndex;
  meal_type: ScheduleMealType;
  assigned_user_id: string | null;
  assigned_cook_name: string | null;
  is_rotating: boolean;
  rotation_order: number | null;
  created_at: string;
  updated_at: string;
}

export interface CookingScheduleWithUser extends CookingSchedule {
  user?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  } | null;
}

export interface CookingScheduleFormData {
  day_of_week: DayOfWeekIndex;
  meal_type: ScheduleMealType;
  assigned_user_id: string | null;
  assigned_cook_name: string | null;
  is_rotating?: boolean;
}

// Helper to get display name for a schedule entry
export function getScheduleDisplayName(schedule: CookingScheduleWithUser): string {
  if (schedule.assigned_cook_name) {
    return schedule.assigned_cook_name;
  }
  if (schedule.user?.first_name) {
    return schedule.user.first_name;
  }
  return "Unassigned";
}

// ============================================================================
// Spice Tolerance
// ============================================================================

export type SpiceTolerance = "none" | "mild" | "medium" | "hot" | "extra-hot";

export const SPICE_TOLERANCE_LABELS: Record<SpiceTolerance, string> = {
  none: "No spice",
  mild: "Mild",
  medium: "Medium",
  hot: "Hot",
  "extra-hot": "Extra Hot",
};

export const SPICE_TOLERANCE_EMOJIS: Record<SpiceTolerance, string> = {
  none: "🧊",
  mild: "🌶️",
  medium: "🌶️🌶️",
  hot: "🌶️🌶️🌶️",
  "extra-hot": "🔥",
};

// ============================================================================
// Member Dietary Profile
// ============================================================================

export interface MemberDietaryProfile {
  id: string;
  user_id: string;
  household_id: string;
  dietary_restrictions: string[];
  allergens: string[];
  dislikes: string[];
  preferences: string[];
  spice_tolerance: SpiceTolerance | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MemberDietaryProfileFormData {
  dietary_restrictions: string[];
  allergens: string[];
  dislikes: string[];
  preferences: string[];
  spice_tolerance: SpiceTolerance | null;
  notes: string | null;
}

// Common dietary restrictions
export const COMMON_DIETARY_RESTRICTIONS = [
  "Vegetarian",
  "Vegan",
  "Pescatarian",
  "Gluten-Free",
  "Dairy-Free",
  "Keto",
  "Paleo",
  "Low-Carb",
  "Low-Sodium",
  "Halal",
  "Kosher",
] as const;

// Common allergens (FDA Big 9)
export const COMMON_ALLERGENS = [
  "Milk/Dairy",
  "Eggs",
  "Fish",
  "Shellfish",
  "Tree Nuts",
  "Peanuts",
  "Wheat",
  "Soybeans",
  "Sesame",
] as const;

// ============================================================================
// Aggregated Dietary Data
// ============================================================================

export interface AggregatedDietaryRestrictions {
  all_restrictions: string[];
  all_allergens: string[];
  all_dislikes: string[];
  member_count: number;
}

// ============================================================================
// Household Activity
// ============================================================================

export type HouseholdActivityType =
  | "meal_planned"
  | "meal_removed"
  | "recipe_added"
  | "recipe_shared"
  | "shopping_item_added"
  | "shopping_item_checked"
  | "shopping_list_generated"
  | "schedule_updated"
  | "member_joined"
  | "member_left"
  | "dietary_updated"
  | "meal_cooked";

export interface HouseholdActivity {
  id: string;
  household_id: string;
  user_id: string;
  activity_type: HouseholdActivityType;
  entity_type: string | null;
  entity_id: string | null;
  entity_title: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface HouseholdActivityWithUser extends HouseholdActivity {
  user?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  } | null;
}

// Activity type display configuration
export const ACTIVITY_TYPE_CONFIG: Record<
  HouseholdActivityType,
  { icon: string; label: string; verb: string }
> = {
  meal_planned: { icon: "📅", label: "Meal Planned", verb: "planned" },
  meal_removed: { icon: "🗑️", label: "Meal Removed", verb: "removed" },
  recipe_added: { icon: "📝", label: "Recipe Added", verb: "added" },
  recipe_shared: { icon: "🔗", label: "Recipe Shared", verb: "shared" },
  shopping_item_added: { icon: "🛒", label: "Item Added", verb: "added to list" },
  shopping_item_checked: { icon: "✅", label: "Item Checked", verb: "checked off" },
  shopping_list_generated: { icon: "📋", label: "List Generated", verb: "generated shopping list" },
  schedule_updated: { icon: "👨‍🍳", label: "Schedule Updated", verb: "updated cooking schedule" },
  member_joined: { icon: "👋", label: "Member Joined", verb: "joined the household" },
  member_left: { icon: "👋", label: "Member Left", verb: "left the household" },
  dietary_updated: { icon: "🥗", label: "Dietary Updated", verb: "updated dietary preferences" },
  meal_cooked: { icon: "🍳", label: "Meal Cooked", verb: "cooked" },
};

// ============================================================================
// Household Member (Extended)
// ============================================================================

export interface HouseholdMember {
  id: string;
  household_id: string;
  user_id: string;
  role: "owner" | "member";
  joined_at: string;
}

export interface HouseholdMemberWithProfile extends HouseholdMember {
  profile: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    avatar_url: string | null;
  };
  dietary_profile: MemberDietaryProfile | null;
}

// ============================================================================
// Household (Extended)
// ============================================================================

export interface Household {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface HouseholdWithMembers extends Household {
  members: HouseholdMemberWithProfile[];
  cooking_schedules: CookingScheduleWithUser[];
  aggregated_dietary: AggregatedDietaryRestrictions;
}

// ============================================================================
// Today's Cook
// ============================================================================

export interface TodaysCook {
  assigned_user_id: string | null;
  assigned_cook_name: string | null;
  user_first_name: string | null;
  user_avatar_url: string | null;
  meal_type: ScheduleMealType;
}

export function getTodaysCookDisplayName(cook: TodaysCook | null): string {
  if (!cook) return "No one assigned";
  if (cook.assigned_cook_name) return cook.assigned_cook_name;
  if (cook.user_first_name) return cook.user_first_name;
  return "No one assigned";
}

// ============================================================================
// Real-time Sync Types
// ============================================================================

export type HouseholdRealtimeEvent =
  | { type: "meal_assignment_change"; payload: unknown }
  | { type: "shopping_list_change"; payload: unknown }
  | { type: "activity_added"; payload: HouseholdActivity }
  | { type: "schedule_change"; payload: unknown }
  | { type: "dietary_change"; payload: unknown };

export interface HouseholdRealtimeState {
  lastUpdate: Date;
  isConnected: boolean;
  pendingChanges: number;
}
