/**
 * Settings Context Selectors
 *
 * Helper functions for derived state and computed values
 */

import type { SettingsState } from "./settings-context";
import type { SettingsChange } from "@/types/settings-history";

// ============================================================================
// Undo Functionality Selectors
// ============================================================================

/**
 * Check if undo is available
 */
export function canUndo(settingsHistory: SettingsChange[]): boolean {
  return settingsHistory.length > 0;
}

/**
 * Get the most recent change for display
 */
export function getLastChange(settingsHistory: SettingsChange[]): SettingsChange | null {
  return settingsHistory[0] ?? null;
}

// ============================================================================
// Settings State Selectors
// ============================================================================

/**
 * Get user's full name from profile
 */
export function getFullName(state: SettingsState): string | null {
  const { first_name, last_name } = state.profile;

  if (!first_name && !last_name) return null;

  return [first_name, last_name].filter(Boolean).join(" ");
}

/**
 * Get user's display name (full name or email fallback)
 */
export function getDisplayName(state: SettingsState): string {
  const fullName = getFullName(state);
  if (fullName) return fullName;

  return state.profile.email ?? "User";
}

/**
 * Check if user has a complete profile
 */
export function hasCompleteProfile(state: SettingsState): boolean {
  const { first_name, last_name, avatar_url } = state.profile;
  return Boolean(first_name && last_name && avatar_url);
}

/**
 * Check if user is in a household
 */
export function isInHousehold(state: SettingsState): boolean {
  return state.household !== null && state.household.household !== null;
}

/**
 * Get household member count
 */
export function getHouseholdMemberCount(state: SettingsState): number {
  if (!state.household) return 0;
  return state.household.members.length;
}

/**
 * Check if user is household admin
 */
export function isHouseholdAdmin(state: SettingsState): boolean {
  if (!state.household) return false;
  return state.household.role === "admin";
}

/**
 * Get cook names list
 */
export function getCookNames(state: SettingsState): string[] {
  return state.settings.cook_names || ["Me"];
}

/**
 * Check if dark mode is enabled
 */
export function isDarkMode(state: SettingsState): boolean {
  return state.settings.dark_mode;
}

/**
 * Check if macro tracking is enabled
 */
export function isMacroTrackingEnabled(state: SettingsState): boolean {
  return state.settings.macro_tracking_enabled ?? false;
}

/**
 * Get active dietary restrictions (combined standard + custom)
 */
export function getActiveDietaryRestrictions(state: SettingsState): string[] {
  const allergenAlerts = state.settings.allergen_alerts || [];
  const customRestrictions = state.settings.custom_dietary_restrictions || [];

  return [...allergenAlerts, ...customRestrictions];
}

/**
 * Check if email notifications are enabled
 */
export function hasEmailNotificationsEnabled(state: SettingsState): boolean {
  return state.settings.email_notifications;
}

/**
 * Get active theme mode from preferences
 */
export function getThemeMode(state: SettingsState): "system" | "light" | "dark" | "custom" {
  return state.preferencesV2.display.theme;
}

/**
 * Get accent color from preferences
 */
export function getAccentColor(state: SettingsState): string {
  return state.preferencesV2.display.accentColor;
}

/**
 * Check if sounds are enabled
 */
export function areSoundsEnabled(state: SettingsState): boolean {
  return state.preferencesV2.sounds.enabled;
}

/**
 * Check if keyboard shortcuts are enabled
 */
export function areKeyboardShortcutsEnabled(state: SettingsState): boolean {
  return state.preferencesV2.keyboard.enabled;
}

/**
 * Get AI personality type
 */
export function getAiPersonality(state: SettingsState): "friendly" | "professional" | "grandma" | "gordon" | "custom" {
  return state.preferencesV2.aiPersonality;
}

/**
 * Check if privacy analytics are enabled
 */
export function hasAnalyticsEnabled(state: SettingsState): boolean {
  return state.preferencesV2.privacy.analyticsEnabled;
}

/**
 * Check if crash reporting is enabled
 */
export function hasCrashReportingEnabled(state: SettingsState): boolean {
  return state.preferencesV2.privacy.crashReporting;
}

/**
 * Check if personalized recommendations are enabled
 */
export function hasPersonalizedRecommendationsEnabled(state: SettingsState): boolean {
  return state.preferencesV2.privacy.personalizedRecommendations;
}

/**
 * Get serving size presets
 */
export function getServingSizePresets(state: SettingsState): Array<{ name: string; size: number }> {
  return state.preferencesV2.servingSizePresets || [];
}

/**
 * Get week start day preference
 */
export function getWeekStartDay(state: SettingsState): "monday" | "sunday" | "saturday" {
  return state.preferencesV2.display.weekStartDay;
}

/**
 * Get time format preference (12h or 24h)
 */
export function getTimeFormat(state: SettingsState): "12h" | "24h" {
  return state.preferencesV2.display.timeFormat;
}

/**
 * Get date format preference
 */
export function getDateFormat(state: SettingsState): "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD" {
  return state.preferencesV2.display.dateFormat;
}

/**
 * Get rating scale preference
 */
export function getRatingScale(state: SettingsState): "5-star" | "10-star" | "thumbs" | "letter" | "emoji" {
  return state.preferencesV2.display.ratingScale;
}

/**
 * Get unit system preference
 */
export function getUnitSystem(state: SettingsState): "imperial" | "metric" {
  return state.settings.unit_system ?? "imperial";
}

/**
 * Check if Google Calendar is connected
 */
export function isGoogleCalendarConnected(state: SettingsState): boolean {
  return Boolean(state.settings.google_connected_account);
}

/**
 * Get calendar event default time
 */
export function getCalendarEventTime(state: SettingsState): string {
  return state.calendarPreferences?.eventTime ?? "12:00";
}

/**
 * Get calendar event default duration in minutes
 */
export function getCalendarEventDuration(state: SettingsState): number {
  return state.calendarPreferences?.eventDurationMinutes ?? 60;
}

/**
 * Get excluded calendar days
 */
export function getCalendarExcludedDays(state: SettingsState): string[] {
  return state.calendarPreferences?.excludedDays ?? [];
}

/**
 * Get planner density setting
 */
export function getPlannerDensity(state: SettingsState): "compact" | "comfortable" | "spacious" {
  return state.plannerViewSettings?.density ?? "comfortable";
}

/**
 * Get sidebar mode (expanded or collapsed)
 */
export function getSidebarMode(state: SettingsState): "expanded" | "collapsed" {
  return state.preferencesV2.sidebar.mode;
}

/**
 * Get sidebar width in pixels
 */
export function getSidebarWidth(state: SettingsState): number {
  return state.preferencesV2.sidebar.width;
}

/**
 * Get pinned items from sidebar
 */
export function getSidebarPinnedItems(state: SettingsState): Array<{ type: string; id: string; name?: string; emoji?: string; url?: string; icon?: string; addedAt: string }> {
  return state.preferencesV2.sidebar.pinnedItems;
}

/**
 * Get hidden sidebar items
 */
export function getSidebarHiddenItems(state: SettingsState): string[] {
  return state.preferencesV2.sidebar.hiddenItems;
}

/**
 * Check if pinned section is expanded
 */
export function isSidebarPinnedSectionExpanded(state: SettingsState): boolean {
  return state.preferencesV2.sidebar.pinnedSectionExpanded;
}
