// ============================================================================
// Expanded User Preferences (V2)
// Comprehensive display settings, sounds, keyboard shortcuts, AI personality
// ============================================================================

import {
  EnergyModePreferences,
  DEFAULT_ENERGY_MODE_PREFERENCES,
} from "./energy-mode";

// Display Preferences
export type WeekStartDay = "monday" | "sunday" | "saturday";
export type TimeFormat = "12h" | "24h";
export type DateFormat = "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
export type RatingScale = "5-star" | "10-star" | "thumbs" | "letter" | "emoji";
export type ThemeMode = "system" | "light" | "dark" | "custom";

export interface DisplayPreferences {
  weekStartDay: WeekStartDay;
  timeFormat: TimeFormat;
  dateFormat: DateFormat;
  ratingScale: RatingScale;
  customRatingEmojis: string[]; // 5 emojis when ratingScale is "emoji"
  theme: ThemeMode;
  accentColor: string; // hex color
  seasonalThemes: boolean;
}

// Sound Preferences
export type SoundPreset =
  | "chime"
  | "bell"
  | "ding"
  | "ping"
  | "pop"
  | "whoosh"
  | "fanfare"
  | "success"
  | "tada"
  | "click"
  | "tick"
  | "none";

export interface SoundPreferences {
  enabled: boolean;
  timerComplete: SoundPreset;
  notification: SoundPreset;
  achievement: SoundPreset;
}

// Serving Size Presets
export interface ServingSizePreset {
  name: string;
  size: number;
}

// Keyboard Shortcuts
export interface KeyboardPreferences {
  enabled: boolean;
  shortcuts: Record<string, string>; // action -> key mapping
}

// AI Personality
export type AiPersonalityType = "friendly" | "professional" | "grandma" | "gordon" | "custom";

// Privacy Preferences (all OFF by default - opt-in model per research findings)
export interface PrivacyPreferences {
  analyticsEnabled: boolean;          // Share anonymous usage data
  crashReporting: boolean;            // Send crash reports to help fix bugs
  personalizedRecommendations: boolean; // AI-powered recipe suggestions based on history
  consentTimestamp: string | null;    // ISO timestamp when user explicitly opted in
}

// Full V2 Preferences Structure
export interface UserPreferencesV2 {
  display: DisplayPreferences;
  sounds: SoundPreferences;
  servingSizePresets: ServingSizePreset[];
  keyboard: KeyboardPreferences;
  aiPersonality: AiPersonalityType;
  customAiPrompt: string | null;
  energyMode: EnergyModePreferences;
  privacy: PrivacyPreferences;
  sidebar: SidebarPreferences;
}

// ============================================================================
// Defaults
// ============================================================================

export const DEFAULT_DISPLAY_PREFERENCES: DisplayPreferences = {
  weekStartDay: "monday",
  timeFormat: "12h",
  dateFormat: "MM/DD/YYYY",
  ratingScale: "5-star",
  customRatingEmojis: ["🤮", "😕", "😐", "😊", "🤩"],
  theme: "system",
  accentColor: "#6366f1",
  seasonalThemes: false,
};

export const DEFAULT_SOUND_PREFERENCES: SoundPreferences = {
  enabled: true,
  timerComplete: "chime",
  notification: "ping",
  achievement: "fanfare",
};

export const DEFAULT_SERVING_SIZE_PRESETS: ServingSizePreset[] = [
  { name: "Just Me", size: 1 },
  { name: "Date Night", size: 2 },
  { name: "Family", size: 4 },
  { name: "Meal Prep", size: 8 },
];

export const DEFAULT_KEYBOARD_SHORTCUTS: Record<string, string> = {
  newRecipe: "n",
  search: "/",
  nextWeek: "ArrowRight",
  prevWeek: "ArrowLeft",
  toggleDarkMode: "d",
  openSettings: ",",
  goToPlanner: "p",
  goToRecipes: "r",
  goToShopping: "s",
};

export const DEFAULT_KEYBOARD_PREFERENCES: KeyboardPreferences = {
  enabled: true,
  shortcuts: DEFAULT_KEYBOARD_SHORTCUTS,
};

// Privacy defaults: ALL OFF by default (opt-in model)
export const DEFAULT_PRIVACY_PREFERENCES: PrivacyPreferences = {
  analyticsEnabled: false,           // OFF by default
  crashReporting: false,             // OFF by default
  personalizedRecommendations: false, // OFF by default
  consentTimestamp: null,
};

// Sidebar Preferences
export type SidebarMode = "expanded" | "collapsed";

export const DEFAULT_SIDEBAR_PREFERENCES: SidebarPreferences = {
  mode: "expanded",
  hoverExpand: true,
  width: 260,
  pinnedItems: [],
  hiddenItems: [],
  pinnedSectionExpanded: true,
};

export const DEFAULT_USER_PREFERENCES_V2: UserPreferencesV2 = {
  display: DEFAULT_DISPLAY_PREFERENCES,
  sounds: DEFAULT_SOUND_PREFERENCES,
  servingSizePresets: DEFAULT_SERVING_SIZE_PRESETS,
  keyboard: DEFAULT_KEYBOARD_PREFERENCES,
  aiPersonality: "friendly",
  customAiPrompt: null,
  energyMode: DEFAULT_ENERGY_MODE_PREFERENCES,
  privacy: DEFAULT_PRIVACY_PREFERENCES,
  sidebar: DEFAULT_SIDEBAR_PREFERENCES,
};

// ============================================================================
// Helper Types for Component Props
// ============================================================================

export interface AiPersonalityPreset {
  id: AiPersonalityType;
  name: string;
  description: string;
  prompt: string;
}

export const AI_PERSONALITY_PRESETS: AiPersonalityPreset[] = [
  {
    id: "friendly",
    name: "Friendly Assistant",
    description: "Casual, encouraging, and supportive",
    prompt:
      "You are a friendly and encouraging cooking assistant. Be supportive, positive, and casual in your tone.",
  },
  {
    id: "professional",
    name: "Professional Chef",
    description: "Formal, efficient, and precise",
    prompt:
      "You are a professional chef. Be precise, use proper culinary terminology, and provide expert guidance with a formal tone.",
  },
  {
    id: "grandma",
    name: "Grandma",
    description: "Warm, nurturing, with family wisdom",
    prompt:
      "You are like a loving grandmother sharing family recipes and cooking wisdom. Be warm, nostalgic, and nurturing.",
  },
  {
    id: "gordon",
    name: "Gordon Ramsay",
    description: "Critical, demanding, passionate",
    prompt:
      "You are passionate about cooking with high standards. Be direct, demanding of quality, and occasionally critical, but ultimately supportive.",
  },
  {
    id: "custom",
    name: "Custom",
    description: "Define your own AI personality",
    prompt: "",
  },
];

export interface SoundOption {
  id: SoundPreset;
  name: string;
  category: "timer" | "notification" | "achievement" | "ui" | "all";
}

export const SOUND_OPTIONS: SoundOption[] = [
  { id: "chime", name: "Chime", category: "timer" },
  { id: "bell", name: "Bell", category: "timer" },
  { id: "ding", name: "Ding", category: "timer" },
  { id: "ping", name: "Ping", category: "notification" },
  { id: "pop", name: "Pop", category: "notification" },
  { id: "whoosh", name: "Whoosh", category: "notification" },
  { id: "fanfare", name: "Fanfare", category: "achievement" },
  { id: "success", name: "Success", category: "achievement" },
  { id: "tada", name: "Tada", category: "achievement" },
  { id: "click", name: "Click", category: "ui" },
  { id: "tick", name: "Tick", category: "ui" },
  { id: "none", name: "None (Silent)", category: "all" },
];

export const DATE_FORMAT_OPTIONS = [
  { value: "MM/DD/YYYY" as DateFormat, label: "MM/DD/YYYY", example: "12/31/2025" },
  { value: "DD/MM/YYYY" as DateFormat, label: "DD/MM/YYYY", example: "31/12/2025" },
  { value: "YYYY-MM-DD" as DateFormat, label: "YYYY-MM-DD", example: "2025-12-31" },
];

export const ACCENT_COLOR_PALETTE = [
  { key: "indigo", color: "#6366f1", label: "Indigo" },
  { key: "blue", color: "#3b82f6", label: "Blue" },
  { key: "sky", color: "#0ea5e9", label: "Sky" },
  { key: "cyan", color: "#06b6d4", label: "Cyan" },
  { key: "teal", color: "#14b8a6", label: "Teal" },
  { key: "emerald", color: "#10b981", label: "Emerald" },
  { key: "green", color: "#22c55e", label: "Green" },
  { key: "lime", color: "#84cc16", label: "Lime" },
  { key: "yellow", color: "#eab308", label: "Yellow" },
  { key: "amber", color: "#f59e0b", label: "Amber" },
  { key: "orange", color: "#f97316", label: "Orange" },
  { key: "red", color: "#ef4444", label: "Red" },
  { key: "rose", color: "#f43f5e", label: "Rose" },
  { key: "pink", color: "#ec4899", label: "Pink" },
  { key: "fuchsia", color: "#d946ef", label: "Fuchsia" },
  { key: "purple", color: "#a855f7", label: "Purple" },
  { key: "violet", color: "#8b5cf6", label: "Violet" },
] as const;

// ============================================================================
// Sidebar Preferences (Phase 6 Enhancement)
// ============================================================================

export type PinnableItemType =
  | "page"
  | "recipe"
  | "folder"
  | "smart_folder"
  | "category"
  | "custom_link";

export interface PinnedItem {
  type: PinnableItemType;
  id: string;
  name?: string;        // For recipes, custom links
  emoji?: string;       // For folders
  url?: string;         // For custom links
  icon?: string;        // Custom icon name
  addedAt: string;      // ISO timestamp
}

export interface SidebarPreferences {
  mode: SidebarMode;
  hoverExpand: boolean;
  width: number;
  pinnedItems: PinnedItem[];
  hiddenItems: string[];
  pinnedSectionExpanded: boolean;
}

// Re-export energy mode types for convenience
export type { EnergyModePreferences } from "./energy-mode";
export { DEFAULT_ENERGY_MODE_PREFERENCES } from "./energy-mode";
