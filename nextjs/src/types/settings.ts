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

// ============================================================================
// Meal Type Emoji Settings Types
// ============================================================================

export type MealTypeKey = "breakfast" | "lunch" | "dinner" | "snack" | "other";

export interface MealTypeEmojiSettings {
  breakfast: string;
  lunch: string;
  dinner: string;
  snack: string;
  other: string;
}

export const DEFAULT_MEAL_TYPE_EMOJIS: MealTypeEmojiSettings = {
  breakfast: "🌅",
  lunch: "🥗",
  dinner: "🍽️",
  snack: "🍿",
  other: "📋",
};

/**
 * Structure for user_settings.preferences JSONB column
 */
export interface UserSettingsPreferences {
  cookMode?: CookModeSettings;
  mealTypeEmojis?: MealTypeEmojiSettings;
}
