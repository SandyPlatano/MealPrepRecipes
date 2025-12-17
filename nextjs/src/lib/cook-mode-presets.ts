/**
 * Cook Mode Presets
 * Pre-configured settings profiles for different cooking styles
 */

import type { CookModePreset, CookModeSettings } from "@/types/settings";

/**
 * Smart presets for cook mode customization
 * Each preset optimizes for a different cooking style/scenario
 */
export const COOK_MODE_PRESETS: CookModePreset[] = [
  {
    key: "minimal",
    name: "Minimal",
    description: "Clean view with just instructions. No distractions.",
    icon: "Minus",
    settings: {
      display: { fontSize: "medium", themeOverride: "system" },
      visibility: { showIngredients: false, showTimers: false, showProgress: false },
      behavior: { keepScreenAwake: true, timerSounds: false, autoAdvance: false },
      navigation: { mode: "step-by-step" },
    },
  },
  {
    key: "full",
    name: "Full Featured",
    description: "Everything visible. All the bells and whistles.",
    icon: "Sparkles",
    settings: {
      display: { fontSize: "medium", themeOverride: "system" },
      visibility: { showIngredients: true, showTimers: true, showProgress: true },
      behavior: { keepScreenAwake: true, timerSounds: true, autoAdvance: false },
      navigation: { mode: "step-by-step" },
    },
  },
  {
    key: "hands-free",
    name: "Hands-Free",
    description: "Auto-advance steps when timers end. Perfect for messy hands.",
    icon: "Hand",
    settings: {
      display: { fontSize: "large", themeOverride: "system" },
      visibility: { showIngredients: true, showTimers: true, showProgress: true },
      behavior: { keepScreenAwake: true, timerSounds: true, autoAdvance: true },
      navigation: { mode: "step-by-step" },
    },
  },
  {
    key: "focus",
    name: "Focus",
    description: "Large text, dark theme. Maximum readability in the kitchen.",
    icon: "Focus",
    settings: {
      display: { fontSize: "large", themeOverride: "dark" },
      visibility: { showIngredients: false, showTimers: true, showProgress: true },
      behavior: { keepScreenAwake: true, timerSounds: true, autoAdvance: false },
      navigation: { mode: "step-by-step" },
    },
  },
];

/**
 * Get a preset by its key
 */
export function getPresetByKey(key: string): CookModePreset | undefined {
  return COOK_MODE_PRESETS.find((preset) => preset.key === key);
}

/**
 * Check if current settings match a preset
 * Returns the matching preset key or null
 */
export function getMatchingPreset(settings: CookModeSettings): string | null {
  for (const preset of COOK_MODE_PRESETS) {
    if (settingsMatch(settings, preset.settings)) {
      return preset.key;
    }
  }
  return null;
}

/**
 * Deep compare two CookModeSettings objects
 */
function settingsMatch(a: CookModeSettings, b: CookModeSettings): boolean {
  return (
    a.display.fontSize === b.display.fontSize &&
    a.display.themeOverride === b.display.themeOverride &&
    a.visibility.showIngredients === b.visibility.showIngredients &&
    a.visibility.showTimers === b.visibility.showTimers &&
    a.visibility.showProgress === b.visibility.showProgress &&
    a.behavior.keepScreenAwake === b.behavior.keepScreenAwake &&
    a.behavior.timerSounds === b.behavior.timerSounds &&
    a.behavior.autoAdvance === b.behavior.autoAdvance &&
    a.navigation.mode === b.navigation.mode
  );
}
