// ============================================================================
// Settings History Types for Undo Functionality
// ============================================================================

export type SettingsChangeCategory =
  | "settings"
  | "displayPrefs"
  | "soundPrefs"
  | "keyboardPrefs"
  | "privacyPrefs"
  | "energyModePrefs"
  | "aiPersonality"
  | "servingPresets"
  | "plannerSettings";

export interface SettingsChange {
  id: string;
  timestamp: Date;
  settingPath: string;       // e.g., "settings.dark_mode" or "preferencesV2.privacy.analyticsEnabled"
  settingLabel: string;      // Human-readable: "Dark Mode" or "Usage Analytics"
  oldValue: unknown;
  newValue: unknown;
  category: SettingsChangeCategory;
}

export interface SettingsHistoryState {
  changes: SettingsChange[];  // Most recent first
  maxChanges: number;         // Default: 10
}

export const DEFAULT_SETTINGS_HISTORY: SettingsHistoryState = {
  changes: [],
  maxChanges: 10,
};
