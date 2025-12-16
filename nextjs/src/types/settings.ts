// User Settings Types

import type { MacroGoals, MacroGoalPreset } from "./nutrition";

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

  // Nutrition tracking (new)
  macro_goals?: MacroGoals;
  macro_tracking_enabled?: boolean;
  macro_goal_preset?: MacroGoalPreset | null;

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
