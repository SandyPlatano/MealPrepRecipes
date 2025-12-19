// ============================================================================
// Setting Path to Human-Readable Label Mapping
// Used by the Undo feature to display what will be reverted
// ============================================================================

const SETTING_LABELS: Record<string, string> = {
  // Core Settings
  "settings.dark_mode": "Dark Mode",
  "settings.cook_names": "Cook Names",
  "settings.cook_colors": "Cook Colors",
  "settings.email_notifications": "Email Notifications",
  "settings.allergen_alerts": "Allergen Alerts",
  "settings.custom_dietary_restrictions": "Dietary Restrictions",
  "settings.category_order": "Category Order",
  "settings.calendar_event_time": "Calendar Event Time",
  "settings.calendar_event_duration_minutes": "Event Duration",
  "settings.calendar_excluded_days": "Excluded Days",
  "settings.unit_system": "Unit System",
  "settings.macro_tracking_enabled": "Macro Tracking",
  "settings.macro_goals": "Macro Goals",
  "settings.macro_goal_preset": "Macro Preset",

  // Display Preferences
  "preferencesV2.display.theme": "Theme",
  "preferencesV2.display.accentColor": "Accent Color",
  "preferencesV2.display.weekStartDay": "Week Start Day",
  "preferencesV2.display.timeFormat": "Time Format",
  "preferencesV2.display.dateFormat": "Date Format",
  "preferencesV2.display.ratingScale": "Rating Scale",
  "preferencesV2.display.customRatingEmojis": "Custom Rating Emojis",
  "preferencesV2.display.seasonalThemes": "Seasonal Themes",

  // Sound Preferences
  "preferencesV2.sounds.enabled": "Sounds",
  "preferencesV2.sounds.timerComplete": "Timer Sound",
  "preferencesV2.sounds.notification": "Notification Sound",
  "preferencesV2.sounds.achievement": "Achievement Sound",

  // Keyboard Preferences
  "preferencesV2.keyboard.enabled": "Keyboard Shortcuts",
  "preferencesV2.keyboard.shortcuts": "Shortcut Bindings",

  // Privacy Preferences
  "preferencesV2.privacy.analyticsEnabled": "Usage Analytics",
  "preferencesV2.privacy.crashReporting": "Crash Reporting",
  "preferencesV2.privacy.personalizedRecommendations": "Personalized Recommendations",

  // AI Personality
  "preferencesV2.aiPersonality": "AI Personality",
  "preferencesV2.customAiPrompt": "Custom AI Prompt",

  // Serving Presets
  "preferencesV2.servingSizePresets": "Serving Size Presets",

  // Planner Settings
  "plannerViewSettings.density": "Planner Density",
  "plannerViewSettings.showMealTypeHeaders": "Meal Type Headers",
  "plannerViewSettings.showNutritionBadges": "Nutrition Badges",
  "plannerViewSettings.showPrepTime": "Prep Time Display",
};

/**
 * Get a human-readable label for a setting path.
 * Falls back to extracting the last part of the path if not found.
 */
export function getSettingLabel(path: string): string {
  // Check for exact match
  if (SETTING_LABELS[path]) {
    return SETTING_LABELS[path];
  }

  // Try to match partial paths (for nested objects)
  const partialMatch = Object.entries(SETTING_LABELS).find(([key]) =>
    path.startsWith(key)
  );
  if (partialMatch) {
    return partialMatch[1];
  }

  // Fallback: extract the last part of the path and convert to title case
  const lastPart = path.split(".").pop() || path;
  return lastPart
    .replace(/([A-Z])/g, " $1") // Add space before capitals
    .replace(/_/g, " ") // Replace underscores with spaces
    .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
    .trim();
}

/**
 * Format a value for display in the undo tooltip.
 * Handles booleans, arrays, and objects gracefully.
 */
export function formatValueForDisplay(value: unknown): string {
  if (value === null || value === undefined) {
    return "none";
  }
  if (typeof value === "boolean") {
    return value ? "on" : "off";
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return "empty";
    if (value.length <= 3) return value.join(", ");
    return `${value.length} items`;
  }
  if (typeof value === "object") {
    return "custom";
  }
  if (typeof value === "string" && value.length > 20) {
    return value.substring(0, 20) + "...";
  }
  return String(value);
}
