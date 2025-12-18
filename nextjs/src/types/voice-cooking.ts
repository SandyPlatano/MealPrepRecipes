// Voice Cooking Mode types

export type CookingSessionStatus = "active" | "paused" | "completed" | "abandoned";
export type TimerStatus = "active" | "paused" | "completed" | "cancelled";
export type NavigationDirection = "next" | "back" | "repeat";

export interface VoiceCookingSession {
  id: string;
  user_id: string;
  recipe_id: string;
  current_step: number;
  total_steps: number;
  status: CookingSessionStatus;
  servings_multiplier: number;
  started_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface VoiceSessionTimer {
  id: string;
  session_id: string;
  label: string;
  duration_seconds: number;
  remaining_seconds: number;
  status: TimerStatus;
  step_index: number | null;
  alert_message: string | null;
  started_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActiveCookingSession extends VoiceCookingSession {
  recipe_title: string;
  recipe_servings: string | null;
  current_instruction: string;
  instructions: string[];
  ingredients: string[];
}

export interface NavigationResult {
  new_step: number;
  total_steps: number;
  is_complete: boolean;
  instruction: string;
}

export interface CompleteCookingData {
  rating?: number;
  notes?: string;
  photo_url?: string;
}

export interface CreateTimerData {
  label: string;
  durationSeconds: number;
  stepIndex?: number;
  alertMessage?: string;
}
