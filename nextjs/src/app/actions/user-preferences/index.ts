/**
 * User Preferences Actions Index
 *
 * Re-exports all user preference actions from modular files.
 * Import from '@/app/actions/user-preferences' for all preference functionality.
 */

// Core
export { getCurrentUserId, getUserPreferencesV2, resetPreferencesToDefaults } from "./core";

// Display
export { updateDisplayPreferences, updateDisplayPreferencesAuto } from "./display";

// Sounds
export { updateSoundPreferences, updateSoundPreferencesAuto } from "./sounds";

// Keyboard
export {
  updateKeyboardShortcuts,
  toggleKeyboardShortcuts,
  updateKeyboardPreferencesAuto,
} from "./keyboard";

// AI Personality
export { updateAiPersonality, updateAiPersonalityAuto } from "./ai-personality";

// Serving Size
export { updateServingSizePresets, updateServingSizePresetsAuto } from "./serving-size";

// Privacy
export { updatePrivacyPreferences, updatePrivacyPreferencesAuto } from "./privacy";

// Custom CSS
export { getCustomCss, setCustomCss, getCustomCssAuto, setCustomCssAuto } from "./custom-css";

// Recipe Layout
export {
  updateRecipeLayoutPreferences,
  updateRecipeLayoutPreferencesAuto,
} from "./recipe-layout";
