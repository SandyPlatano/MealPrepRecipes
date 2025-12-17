// User Settings Types

import type { MacroGoals, MacroGoalPreset } from "./nutrition";

export type UnitSystem = "imperial" | "metric";

/**
 * Recipe export preferences
 * Controls which sections are included in markdown exports
 */
export interface RecipeExportPreferences {
  include_ingredients: boolean;
  include_instructions: boolean;
  include_nutrition: boolean;
  include_tags: boolean;
  include_times: boolean;
  include_notes: boolean;
  include_servings: boolean;
}

export interface UserSettings {
  id: string;
  user_id: string;
  dark_mode: boolean;
  cook_names: string[];
  cook_colors?: Record<string, string>;
  email_notifications: boolean;
  allergen_alerts?: string[];
  custom_dietary_restrictions?: string[];
  category_order?: string[] | null;
  calendar_event_time?: string | null;
  calendar_event_duration_minutes?: number | null;
  calendar_excluded_days?: string[] | null;

  // Onboarding hints
  dismissed_hints?: string[];

  // Nutrition tracking
  macro_goals?: MacroGoals;
  macro_tracking_enabled?: boolean;
  macro_goal_preset?: MacroGoalPreset | null;

  // Unit preferences
  unit_system?: UnitSystem;

  // Export preferences
  recipe_export_preferences?: RecipeExportPreferences;

  created_at: string;
  updated_at: string;
}

export interface UserSettingsFormData {
  dark_mode: boolean;
  cook_names: string[];
  cook_colors?: Record<string, string>;
  email_notifications: boolean;
  allergen_alerts?: string[];
  custom_dietary_restrictions?: string[];
  category_order?: string[] | null;
  calendar_event_time?: string | null;
  calendar_event_duration_minutes?: number | null;
  calendar_excluded_days?: string[] | null;

  // Nutrition tracking (new)
  macro_goals?: MacroGoals;
  macro_tracking_enabled?: boolean;
  macro_goal_preset?: MacroGoalPreset | null;

  // Unit preferences
  unit_system?: UnitSystem;

  // Export preferences
  recipe_export_preferences?: RecipeExportPreferences;
}

export interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileFormData {
  first_name: string;
  last_name: string;
}

// ============================================================================
// Cook Mode Settings Types
// ============================================================================

export type CookModeFontSize = "small" | "medium" | "large";
export type CookModeTheme = "system" | "light" | "dark";
export type CookModeNavigationMode = "step-by-step" | "scrollable";

export interface CookModeDisplaySettings {
  fontSize: CookModeFontSize;
  themeOverride: CookModeTheme;
}

export interface CookModeVisibilitySettings {
  showIngredients: boolean;
  showTimers: boolean;
  showProgress: boolean;
}

export interface CookModeBehaviorSettings {
  keepScreenAwake: boolean;
  timerSounds: boolean;
  autoAdvance: boolean;
}

export interface CookModeNavigationSettings {
  mode: CookModeNavigationMode;
}

export interface CookModeSettings {
  display: CookModeDisplaySettings;
  visibility: CookModeVisibilitySettings;
  behavior: CookModeBehaviorSettings;
  navigation: CookModeNavigationSettings;
}

export const DEFAULT_COOK_MODE_SETTINGS: CookModeSettings = {
  display: {
    fontSize: "medium",
    themeOverride: "system",
  },
  visibility: {
    showIngredients: true,
    showTimers: true,
    showProgress: true,
  },
  behavior: {
    keepScreenAwake: true,
    timerSounds: true,
    autoAdvance: false,
  },
  navigation: {
    mode: "step-by-step",
  },
};

// Cook Mode Preset Types
export type CookModePresetKey = "minimal" | "full" | "hands-free" | "focus";

export interface CookModePreset {
  key: CookModePresetKey;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  settings: CookModeSettings;
}

// ============================================================================
// Meal Type Customization Settings Types
// ============================================================================

export type MealTypeKey = "breakfast" | "lunch" | "dinner" | "snack" | "other";

/**
 * @deprecated Use MealTypeCustomization instead
 * Kept for backward compatibility during migration
 */
export interface MealTypeEmojiSettings {
  breakfast: string;
  lunch: string;
  dinner: string;
  snack: string;
  other: string;
}

/**
 * @deprecated Use DEFAULT_MEAL_TYPE_SETTINGS instead
 */
export const DEFAULT_MEAL_TYPE_EMOJIS: MealTypeEmojiSettings = {
  breakfast: "🌅",
  lunch: "🥗",
  dinner: "🍽️",
  snack: "🍿",
  other: "📋",
};

/**
 * Settings for a single meal type
 */
export interface MealTypeSettings {
  emoji: string;       // Emoji to display (e.g., "🌅")
  color: string;       // Hex color (e.g., "#fbbf24")
  calendarTime: string; // Time in HH:MM format (e.g., "08:00")
}

/**
 * Full customization settings for all meal types
 */
export interface MealTypeCustomization {
  breakfast: MealTypeSettings;
  lunch: MealTypeSettings;
  dinner: MealTypeSettings;
  snack: MealTypeSettings;
  other: MealTypeSettings;
}

/**
 * Default settings for all meal types
 */
export const DEFAULT_MEAL_TYPE_SETTINGS: MealTypeCustomization = {
  breakfast: { emoji: "🌅", color: "#fbbf24", calendarTime: "08:00" },
  lunch: { emoji: "🥗", color: "#34d399", calendarTime: "12:00" },
  dinner: { emoji: "🍽️", color: "#f97316", calendarTime: "18:00" },
  snack: { emoji: "🍿", color: "#a78bfa", calendarTime: "15:00" },
  other: { emoji: "📋", color: "#9ca3af", calendarTime: "12:00" },
};

/**
 * Predefined color palette for meal types
 */
export const MEAL_TYPE_COLOR_PALETTE = [
  { key: "amber", color: "#fbbf24", label: "Amber" },
  { key: "emerald", color: "#34d399", label: "Emerald" },
  { key: "orange", color: "#f97316", label: "Orange" },
  { key: "violet", color: "#a78bfa", label: "Violet" },
  { key: "gray", color: "#9ca3af", label: "Gray" },
  { key: "blue", color: "#3b82f6", label: "Blue" },
  { key: "red", color: "#ef4444", label: "Red" },
  { key: "pink", color: "#ec4899", label: "Pink" },
  { key: "cyan", color: "#06b6d4", label: "Cyan" },
  { key: "lime", color: "#84cc16", label: "Lime" },
  { key: "rose", color: "#f43f5e", label: "Rose" },
  { key: "indigo", color: "#6366f1", label: "Indigo" },
  { key: "teal", color: "#14b8a6", label: "Teal" },
  { key: "yellow", color: "#eab308", label: "Yellow" },
  { key: "sky", color: "#0ea5e9", label: "Sky" },
  { key: "fuchsia", color: "#d946ef", label: "Fuchsia" },
] as const;

// ============================================================================
// Planner View Settings Types
// ============================================================================

export type PlannerViewDensity = "compact" | "comfortable" | "spacious";

/**
 * Settings for controlling the meal planner view display and visibility
 */
export interface PlannerViewSettings {
  /** View density affects spacing and padding throughout the planner */
  density: PlannerViewDensity;
  /** Show meal type section headers (Breakfast, Lunch, etc.) */
  showMealTypeHeaders: boolean;
  /** Show nutrition badges (calories, protein) on recipe cards */
  showNutritionBadges: boolean;
  /** Show prep time on recipe cards */
  showPrepTime: boolean;
}

export const DEFAULT_PLANNER_VIEW_SETTINGS: PlannerViewSettings = {
  density: "comfortable",
  showMealTypeHeaders: true,
  showNutritionBadges: true,
  showPrepTime: true,
};

/**
 * Structure for user_settings.preferences JSONB column
 */
export interface UserSettingsPreferences {
  cookMode?: CookModeSettings;
  /** @deprecated Use mealTypeSettings instead */
  mealTypeEmojis?: MealTypeEmojiSettings;
  mealTypeSettings?: MealTypeCustomization;
  plannerView?: PlannerViewSettings;
}
