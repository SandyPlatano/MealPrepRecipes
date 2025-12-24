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
  cover_image_url: string | null;
  username: string | null;
  bio: string | null;
  cooking_philosophy: string | null;
  profile_emoji: string | null;
  currently_craving: string | null;
  cook_with_me_status: CookWithMeStatus | null;
  favorite_cuisine: string | null;
  cooking_skill: CookingSkillLevel | null;
  location: string | null;
  website_url: string | null;
  public_profile: boolean;
  show_cooking_stats: boolean;
  show_badges: boolean;
  show_cook_photos: boolean;
  show_reviews: boolean;
  show_saved_recipes: boolean;
  profile_accent_color: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileFormData {
  first_name: string;
  last_name: string;
}

// ============================================================================
// Profile Customization Types
// ============================================================================

export type CookWithMeStatus = "not_set" | "open" | "busy" | "looking";
export type CookingSkillLevel = "beginner" | "home_cook" | "enthusiast" | "semi_pro" | "professional";

export interface ProfileCustomizationSettings {
  bio: string;
  cooking_philosophy: string;
  profile_emoji: string;
  currently_craving: string;
  cook_with_me_status: CookWithMeStatus;
  favorite_cuisine: string;
  cooking_skill: CookingSkillLevel;
  location: string;
  website_url: string;
  profile_accent_color: string;
}

export interface ProfilePrivacySettings {
  public_profile: boolean;
  show_cooking_stats: boolean;
  show_badges: boolean;
  show_cook_photos: boolean;
  show_reviews: boolean;
  show_saved_recipes: boolean;
}

export const DEFAULT_PROFILE_CUSTOMIZATION: ProfileCustomizationSettings = {
  bio: "",
  cooking_philosophy: "",
  profile_emoji: "👨‍🍳",
  currently_craving: "",
  cook_with_me_status: "not_set",
  favorite_cuisine: "",
  cooking_skill: "home_cook",
  location: "",
  website_url: "",
  profile_accent_color: "#f97316",
};

export const DEFAULT_PROFILE_PRIVACY: ProfilePrivacySettings = {
  public_profile: false,
  show_cooking_stats: true,
  show_badges: true,
  show_cook_photos: true,
  show_reviews: true,
  show_saved_recipes: true,
};

export const FOOD_EMOJIS = [
  "👨‍🍳", "👩‍🍳", "🍕", "🍔", "🌮", "🍣",
  "🍜", "🥘", "🍰", "🧁", "🥗", "🍱"
] as const;

export const COOK_WITH_ME_STATUS_LABELS: Record<CookWithMeStatus, string> = {
  not_set: "Not set",
  open: "Open to cook together",
  busy: "Busy cooking",
  looking: "Looking for cooking partner",
};

export const COOKING_SKILL_LABELS: Record<CookingSkillLevel, string> = {
  beginner: "Beginner",
  home_cook: "Home Cook",
  enthusiast: "Enthusiast",
  semi_pro: "Semi-Pro",
  professional: "Professional",
};

// ============================================================================
// Cook Mode Settings Types
// ============================================================================

export type CookModeFontSize = "small" | "medium" | "large" | "extra-large";
export type CookModeTheme = "system" | "light" | "dark";
export type CookModeNavigationMode = "step-by-step" | "scrollable";
export type VoiceReadoutSpeed = "slow" | "normal" | "fast";

// ============================================================================
// Enhanced Cook Mode Types
// ============================================================================

// Voice command action types
export type VoiceCommandAction =
  | "nextStep"
  | "prevStep"
  | "setTimer"
  | "stopTimer"
  | "repeat"
  | "readIngredients"
  | "pause"
  | "resume";

// Voice command customization - maps actions to trigger phrases
export interface VoiceCommandMapping {
  nextStep: string[];
  prevStep: string[];
  setTimer: string[];
  stopTimer: string[];
  repeat: string[];
  readIngredients: string[];
  pause: string[];
  resume: string[];
}

// Audio/TTS settings
export type AcknowledgmentSound = "beep" | "chime" | "ding" | "silent";
export type TimerSoundType = "classic" | "gentle" | "urgent" | "melody";

export interface CookModeAudioSettings {
  ttsVoice: string;
  ttsPitch: number;        // 0.5 - 2.0
  ttsRate: number;         // 0.5 - 2.0
  ttsVolume: number;       // 0 - 1
  acknowledgmentSound: AcknowledgmentSound;
  timerSound: TimerSoundType;
}

// Ingredient highlight styles
export type IngredientHighlightStyle = "bold" | "underline" | "background" | "badge";
export type StepTransition = "none" | "fade" | "slide";

// Gesture action types
export type GestureAction = "none" | "repeat" | "timer" | "ingredients" | "voice" | "fullscreen" | "settings" | "exit";

// Timer settings
export interface CookModeTimerSettings {
  quickTimerPresets: number[];
  autoDetectTimers: boolean;
  showTimerInTitle: boolean;
  vibrationOnComplete: boolean;
  repeatTimerAlert: boolean;
}

// Custom user preset
export interface CustomCookModePreset {
  id: string;
  name: string;
  icon: string;
  settings: CookModeSettings;
  createdAt: string;
  isDefault?: boolean;
}

export interface CookModeDisplaySettings {
  fontSize: CookModeFontSize;
  themeOverride: CookModeTheme;
  highContrast: boolean;
  accentColor: string;
  ingredientHighlightStyle: IngredientHighlightStyle;
  stepTransition: StepTransition;
  showStepNumbers: boolean;
  showEstimatedTime: boolean;
}

export interface CookModeVoiceSettings {
  enabled: boolean;
  wakeWords: string[];              // Changed from single wakeWord
  autoReadSteps: boolean;
  readoutSpeed: VoiceReadoutSpeed;
  commandMappings: VoiceCommandMapping;
  commandTimeout: number;
  confirmCommands: boolean;
}

export interface CookModeGestureSettings {
  swipeEnabled: boolean;
  tapToAdvance: boolean;
  hapticFeedback: boolean;
  doubleTapAction: GestureAction;
  longPressAction: GestureAction;
  swipeUpAction: GestureAction;
  swipeDownAction: GestureAction;
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
  voice: CookModeVoiceSettings;
  gestures: CookModeGestureSettings;
  audio: CookModeAudioSettings;
  timers: CookModeTimerSettings;
}

export const DEFAULT_COOK_MODE_SETTINGS: CookModeSettings = {
  display: {
    fontSize: "medium",
    themeOverride: "system",
    highContrast: false,
    accentColor: "#f97316",
    ingredientHighlightStyle: "bold",
    stepTransition: "fade",
    showStepNumbers: true,
    showEstimatedTime: true,
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
  voice: {
    enabled: false,
    wakeWords: ["hey chef", "okay chef", "yo chef"],
    autoReadSteps: false,
    readoutSpeed: "normal",
    commandMappings: {
      nextStep: ["next", "next step", "continue", "forward", "go", "next one"],
      prevStep: ["back", "previous", "go back", "previous step", "last step", "before"],
      setTimer: ["timer", "set timer", "start timer", "timer for"],
      stopTimer: ["stop timer", "cancel timer", "stop", "clear timer"],
      repeat: ["repeat", "say again", "what", "again", "huh", "pardon", "one more time"],
      readIngredients: ["ingredients", "what do I need", "read ingredients", "list ingredients", "what ingredients"],
      pause: ["pause", "hold", "wait", "hold on", "stop talking"],
      resume: ["resume", "continue", "go ahead", "okay", "keep going", "go on"],
    },
    commandTimeout: 3000,
    confirmCommands: true,
  },
  gestures: {
    swipeEnabled: true,
    tapToAdvance: false,
    hapticFeedback: true,
    doubleTapAction: "repeat",
    longPressAction: "ingredients",
    swipeUpAction: "none",
    swipeDownAction: "none",
  },
  audio: {
    ttsVoice: "",
    ttsPitch: 1.0,
    ttsRate: 1.0,
    ttsVolume: 1.0,
    acknowledgmentSound: "beep",
    timerSound: "classic",
  },
  timers: {
    quickTimerPresets: [1, 3, 5, 10, 15, 20, 30],
    autoDetectTimers: true,
    showTimerInTitle: true,
    vibrationOnComplete: true,
    repeatTimerAlert: false,
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
  emoji: string;           // Emoji to display (e.g., "🌅")
  color: string;           // Hex color (e.g., "#fbbf24")
  calendarTime: string;    // Time in HH:MM format (e.g., "08:00")
  duration: number;        // Duration in minutes (e.g., 60)
  excludedDays: string[];  // Days to skip for this meal type (e.g., ["Saturday", "Sunday"])
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
  breakfast: { emoji: "🌅", color: "#fbbf24", calendarTime: "08:00", duration: 30, excludedDays: [] },
  lunch: { emoji: "🥗", color: "#34d399", calendarTime: "12:00", duration: 60, excludedDays: [] },
  dinner: { emoji: "🍽️", color: "#f97316", calendarTime: "18:00", duration: 60, excludedDays: [] },
  snack: { emoji: "🍿", color: "#a78bfa", calendarTime: "15:00", duration: 15, excludedDays: [] },
  other: { emoji: "📋", color: "#9ca3af", calendarTime: "12:00", duration: 60, excludedDays: [] },
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
// Default Cook by Day Settings Types
// ============================================================================

import type { DayOfWeek } from "./meal-plan";

/**
 * Default cook assignments per day of week
 * Used to pre-select cook when adding meals to the planner
 */
export type DefaultCooksByDay = Partial<Record<DayOfWeek, string | null>>;

export const DEFAULT_COOKS_BY_DAY: DefaultCooksByDay = {};

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

// ============================================================================
// Recipe Preferences Settings Types
// ============================================================================

/**
 * Recipe-related user preferences (default serving size, etc.)
 */
export interface RecipePreferences {
  /** Default serving size when adding recipes to meal plans */
  defaultServingSize: number;
}

export const DEFAULT_RECIPE_PREFERENCES: RecipePreferences = {
  defaultServingSize: 2,
};

// ============================================================================
// Difficulty Thresholds Settings Types
// ============================================================================

/**
 * Configurable thresholds for recipe difficulty calculation
 * Each factor has two breakpoints: Easy < medium, Medium <= hard
 */
export interface DifficultyThresholds {
  /** Time thresholds in minutes */
  time: {
    easyMax: number;   // Below this = Easy (default: 30)
    mediumMax: number; // Below or equal = Medium, above = Hard (default: 60)
  };
  /** Ingredient count thresholds */
  ingredients: {
    easyMax: number;   // Below this = Easy (default: 8)
    mediumMax: number; // Below or equal = Medium, above = Hard (default: 15)
  };
  /** Instruction step count thresholds */
  steps: {
    easyMax: number;   // Below this = Easy (default: 6)
    mediumMax: number; // Below or equal = Medium, above = Hard (default: 12)
  };
}

export const DEFAULT_DIFFICULTY_THRESHOLDS: DifficultyThresholds = {
  time: {
    easyMax: 30,
    mediumMax: 60,
  },
  ingredients: {
    easyMax: 8,
    mediumMax: 15,
  },
  steps: {
    easyMax: 6,
    mediumMax: 12,
  },
};

// ============================================================================
// Calendar Preferences Settings Types
// ============================================================================

/**
 * Calendar-related user preferences (event time, duration, excluded days)
 */
export interface CalendarPreferences {
  /** Default time for calendar events in HH:MM format (e.g., "12:00") */
  eventTime: string;
  /** Default duration for calendar events in minutes */
  eventDurationMinutes: number;
  /** Days of the week to exclude when creating events */
  excludedDays: string[];
}

export const DEFAULT_CALENDAR_PREFERENCES: CalendarPreferences = {
  eventTime: "12:00",
  eventDurationMinutes: 60,
  excludedDays: [],
};

/**
 * Structure for user_settings.preferences JSONB column
 */
export interface UserSettingsPreferences {
  cookMode?: CookModeSettings;
  cookModePresets?: CustomCookModePreset[];
  /** @deprecated Use mealTypeSettings instead */
  mealTypeEmojis?: MealTypeEmojiSettings;
  mealTypeSettings?: MealTypeCustomization;
  plannerView?: PlannerViewSettings;
  recipe?: RecipePreferences;
  recipeExport?: RecipeExportPreferences;
  calendar?: CalendarPreferences;
  /** Customizable thresholds for recipe difficulty calculation */
  difficultyThresholds?: DifficultyThresholds;
  /** Default cook assignment per day of week for faster planning */
  defaultCooksByDay?: DefaultCooksByDay;
}

/**
 * Default recipe export preferences
 */
export const DEFAULT_RECIPE_EXPORT_PREFERENCES: RecipeExportPreferences = {
  include_ingredients: true,
  include_instructions: true,
  include_nutrition: true,
  include_tags: true,
  include_times: true,
  include_notes: true,
  include_servings: true,
};
