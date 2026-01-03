/**
 * Settings Selectors - Public API
 *
 * Re-exports all selector functions for convenient importing
 * Usage: import { getFullName, isDarkMode } from '@/contexts/settings-selectors.index';
 */

export {
  // Undo selectors
  canUndo,
  getLastChange,

  // Profile selectors
  getFullName,
  getDisplayName,
  hasCompleteProfile,

  // Household selectors
  isInHousehold,
  getHouseholdMemberCount,
  isHouseholdAdmin,

  // Settings selectors
  getCookNames,
  isDarkMode,
  isMacroTrackingEnabled,
  getActiveDietaryRestrictions,
  hasEmailNotificationsEnabled,
  getUnitSystem,
  isGoogleCalendarConnected,

  // Display preferences selectors
  getThemeMode,
  getAccentColor,
  getWeekStartDay,
  getTimeFormat,
  getDateFormat,
  getRatingScale,

  // Sound & keyboard selectors
  areSoundsEnabled,
  areKeyboardShortcutsEnabled,

  // AI selectors
  getAiPersonality,

  // Privacy selectors
  hasAnalyticsEnabled,
  hasCrashReportingEnabled,
  hasPersonalizedRecommendationsEnabled,

  // Serving presets selectors
  getServingSizePresets,

  // Calendar selectors
  getCalendarEventTime,
  getCalendarEventDuration,
  getCalendarExcludedDays,

  // Planner selectors
  getPlannerDensity,

  // Sidebar selectors
  getSidebarMode,
  getSidebarWidth,
  getSidebarPinnedItems,
  getSidebarHiddenItems,
  isSidebarPinnedSectionExpanded,
} from "./settings-selectors";
