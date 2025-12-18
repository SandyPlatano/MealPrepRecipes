import type { SettingsCategoryId } from "./settings-categories";

export interface SearchableSetting {
  id: string;
  label: string;
  description: string;
  keywords: string[];
  category: SettingsCategoryId;
  path: string;
  componentId: string;
  isAdvanced: boolean;
}

export const SETTINGS_SEARCH_INDEX: SearchableSetting[] = [
  // ═══════════════════════════════════════════════════════════════════
  // PROFILE & ACCOUNT
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "first-name",
    label: "First Name",
    description: "Your first name for your profile",
    keywords: ["name", "profile", "user", "identity"],
    category: "profile",
    path: "/app/settings/profile",
    componentId: "setting-first-name",
    isAdvanced: false,
  },
  {
    id: "last-name",
    label: "Last Name",
    description: "Your last name for your profile",
    keywords: ["name", "profile", "user", "identity", "surname"],
    category: "profile",
    path: "/app/settings/profile",
    componentId: "setting-last-name",
    isAdvanced: false,
  },
  {
    id: "email",
    label: "Email Address",
    description: "Your account email (read-only)",
    keywords: ["email", "account", "contact", "address"],
    category: "profile",
    path: "/app/settings/profile",
    componentId: "setting-email",
    isAdvanced: false,
  },
  {
    id: "username",
    label: "Public Username",
    description: "Your @username for sharing recipes",
    keywords: ["handle", "@", "social", "share", "public", "profile"],
    category: "profile",
    path: "/app/settings/profile",
    componentId: "setting-username",
    isAdvanced: false,
  },
  {
    id: "sign-out",
    label: "Sign Out",
    description: "Sign out of your account",
    keywords: ["logout", "exit", "leave", "session"],
    category: "profile",
    path: "/app/settings/profile",
    componentId: "setting-sign-out",
    isAdvanced: false,
  },
  {
    id: "delete-account",
    label: "Delete Account",
    description: "Permanently delete your account and all data",
    keywords: ["remove", "delete", "destroy", "close", "terminate"],
    category: "profile",
    path: "/app/settings/profile",
    componentId: "setting-delete-account",
    isAdvanced: false,
  },

  // ═══════════════════════════════════════════════════════════════════
  // APPEARANCE
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "dark-mode",
    label: "Dark Mode",
    description: "Toggle dark theme",
    keywords: ["theme", "light", "night", "appearance", "color", "display"],
    category: "appearance",
    path: "/app/settings/appearance",
    componentId: "setting-dark-mode",
    isAdvanced: false,
  },
  {
    id: "theme-mode",
    label: "Theme Mode",
    description: "Choose system, light, or dark theme",
    keywords: ["theme", "system", "auto", "appearance", "color scheme"],
    category: "appearance",
    path: "/app/settings/appearance",
    componentId: "setting-theme-mode",
    isAdvanced: false,
  },
  {
    id: "accent-color",
    label: "Accent Color",
    description: "Customize the app's accent color",
    keywords: ["color", "theme", "brand", "primary", "highlight", "tint"],
    category: "appearance",
    path: "/app/settings/appearance",
    componentId: "setting-accent-color",
    isAdvanced: false,
  },
  {
    id: "rating-scale",
    label: "Rating Scale",
    description: "Choose how recipes are rated (stars, thumbs, etc.)",
    keywords: ["stars", "rating", "score", "review", "thumbs", "emoji"],
    category: "appearance",
    path: "/app/settings/appearance",
    componentId: "setting-rating-scale",
    isAdvanced: false,
  },
  {
    id: "custom-rating-emojis",
    label: "Custom Rating Emojis",
    description: "Customize the emojis used for ratings",
    keywords: ["emoji", "rating", "custom", "personalize"],
    category: "appearance",
    path: "/app/settings/appearance",
    componentId: "setting-custom-rating-emojis",
    isAdvanced: true,
  },
  {
    id: "date-format",
    label: "Date Format",
    description: "How dates are displayed throughout the app",
    keywords: ["date", "format", "display", "calendar", "day", "month", "year"],
    category: "appearance",
    path: "/app/settings/appearance",
    componentId: "setting-date-format",
    isAdvanced: false,
  },
  {
    id: "time-format",
    label: "Time Format",
    description: "12-hour or 24-hour time display",
    keywords: ["time", "clock", "12h", "24h", "am", "pm", "hour"],
    category: "appearance",
    path: "/app/settings/appearance",
    componentId: "setting-time-format",
    isAdvanced: false,
  },
  {
    id: "week-start",
    label: "Week Start Day",
    description: "Which day the week starts on",
    keywords: ["week", "monday", "sunday", "saturday", "calendar", "start"],
    category: "appearance",
    path: "/app/settings/appearance",
    componentId: "setting-week-start",
    isAdvanced: false,
  },
  {
    id: "seasonal-themes",
    label: "Seasonal Themes",
    description: "Enable holiday and seasonal theme variations",
    keywords: ["seasonal", "holiday", "christmas", "halloween", "theme"],
    category: "appearance",
    path: "/app/settings/appearance",
    componentId: "setting-seasonal-themes",
    isAdvanced: true,
  },

  // ═══════════════════════════════════════════════════════════════════
  // MEAL PLANNING
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "meal-type-emojis",
    label: "Meal Type Emojis",
    description: "Customize emojis for breakfast, lunch, dinner, etc.",
    keywords: ["emoji", "meal", "breakfast", "lunch", "dinner", "snack", "icon"],
    category: "meal-planning",
    path: "/app/settings/meal-planning",
    componentId: "setting-meal-type-emojis",
    isAdvanced: false,
  },
  {
    id: "meal-type-colors",
    label: "Meal Type Colors",
    description: "Customize colors for each meal type",
    keywords: ["color", "meal", "breakfast", "lunch", "dinner", "theme"],
    category: "meal-planning",
    path: "/app/settings/meal-planning",
    componentId: "setting-meal-type-colors",
    isAdvanced: false,
  },
  {
    id: "meal-type-times",
    label: "Meal Type Times",
    description: "Default times for meals in calendar",
    keywords: ["time", "schedule", "calendar", "when", "hour"],
    category: "meal-planning",
    path: "/app/settings/meal-planning",
    componentId: "setting-meal-type-times",
    isAdvanced: false,
  },
  {
    id: "planner-view-density",
    label: "Planner View Density",
    description: "How compact the meal planner appears",
    keywords: ["density", "compact", "spacious", "comfortable", "view", "layout"],
    category: "meal-planning",
    path: "/app/settings/meal-planning",
    componentId: "setting-planner-view-density",
    isAdvanced: false,
  },
  {
    id: "show-meal-headers",
    label: "Show Meal Type Headers",
    description: "Display headers for each meal type in planner",
    keywords: ["headers", "labels", "meal", "show", "display"],
    category: "meal-planning",
    path: "/app/settings/meal-planning",
    componentId: "setting-show-meal-headers",
    isAdvanced: false,
  },
  {
    id: "show-nutrition-badges",
    label: "Show Nutrition Badges",
    description: "Display nutrition info badges on recipes",
    keywords: ["nutrition", "badges", "calories", "macros", "display"],
    category: "meal-planning",
    path: "/app/settings/meal-planning",
    componentId: "setting-show-nutrition-badges",
    isAdvanced: false,
  },
  {
    id: "show-prep-time",
    label: "Show Prep Time",
    description: "Display preparation time on recipes",
    keywords: ["prep", "time", "cooking", "duration", "display"],
    category: "meal-planning",
    path: "/app/settings/meal-planning",
    componentId: "setting-show-prep-time",
    isAdvanced: false,
  },
  {
    id: "default-serving-size",
    label: "Default Serving Size",
    description: "Default number of servings for new recipes",
    keywords: ["serving", "portion", "default", "amount", "servings"],
    category: "meal-planning",
    path: "/app/settings/meal-planning",
    componentId: "setting-default-serving-size",
    isAdvanced: false,
  },
  {
    id: "serving-presets",
    label: "Serving Size Presets",
    description: "Quick-select serving sizes",
    keywords: ["serving", "preset", "quick", "portion"],
    category: "meal-planning",
    path: "/app/settings/meal-planning",
    componentId: "setting-serving-presets",
    isAdvanced: true,
  },
  {
    id: "custom-meal-types",
    label: "Custom Meal Types",
    description: "Create your own meal type categories",
    keywords: ["custom", "meal", "type", "category", "create", "add"],
    category: "meal-planning",
    path: "/app/settings/meal-planning",
    componentId: "setting-custom-meal-types",
    isAdvanced: true,
  },
  {
    id: "custom-recipe-types",
    label: "Custom Recipe Types",
    description: "Create custom recipe categories",
    keywords: ["custom", "recipe", "type", "category", "create", "tag"],
    category: "meal-planning",
    path: "/app/settings/meal-planning",
    componentId: "setting-custom-recipe-types",
    isAdvanced: true,
  },
  {
    id: "google-calendar",
    label: "Google Calendar",
    description: "Connect Google Calendar for meal syncing",
    keywords: ["google", "calendar", "sync", "connect", "integration"],
    category: "meal-planning",
    path: "/app/settings/meal-planning",
    componentId: "setting-google-calendar",
    isAdvanced: false,
  },
  {
    id: "calendar-event-time",
    label: "Calendar Event Time",
    description: "Default time for calendar events",
    keywords: ["calendar", "event", "time", "default", "schedule"],
    category: "meal-planning",
    path: "/app/settings/meal-planning",
    componentId: "setting-calendar-event-time",
    isAdvanced: true,
  },
  {
    id: "calendar-event-duration",
    label: "Calendar Event Duration",
    description: "How long calendar events last",
    keywords: ["calendar", "duration", "length", "event", "time"],
    category: "meal-planning",
    path: "/app/settings/meal-planning",
    componentId: "setting-calendar-event-duration",
    isAdvanced: true,
  },
  {
    id: "calendar-excluded-days",
    label: "Calendar Excluded Days",
    description: "Days to skip when creating calendar events",
    keywords: ["calendar", "exclude", "skip", "days", "weekend"],
    category: "meal-planning",
    path: "/app/settings/meal-planning",
    componentId: "setting-calendar-excluded-days",
    isAdvanced: true,
  },

  // ═══════════════════════════════════════════════════════════════════
  // DIETARY & NUTRITION
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "allergen-alerts",
    label: "Allergen Alerts",
    description: "Get warnings for allergens in recipes",
    keywords: ["allergen", "allergy", "warning", "alert", "nuts", "dairy", "gluten"],
    category: "dietary",
    path: "/app/settings/dietary",
    componentId: "setting-allergen-alerts",
    isAdvanced: false,
  },
  {
    id: "dietary-restrictions",
    label: "Dietary Restrictions",
    description: "Custom dietary restrictions to track",
    keywords: ["diet", "restriction", "vegan", "vegetarian", "keto", "paleo"],
    category: "dietary",
    path: "/app/settings/dietary",
    componentId: "setting-dietary-restrictions",
    isAdvanced: false,
  },
  {
    id: "macro-tracking",
    label: "Macro Tracking",
    description: "Enable macronutrient tracking",
    keywords: ["macro", "tracking", "nutrition", "protein", "carbs", "fats"],
    category: "dietary",
    path: "/app/settings/dietary",
    componentId: "setting-macro-tracking",
    isAdvanced: false,
  },
  {
    id: "macro-goals",
    label: "Macro Goals",
    description: "Set daily targets for protein, carbs, and fats",
    keywords: ["macro", "goals", "target", "protein", "carbs", "fats", "daily"],
    category: "dietary",
    path: "/app/settings/dietary",
    componentId: "setting-macro-goals",
    isAdvanced: false,
  },
  {
    id: "macro-preset",
    label: "Macro Goal Preset",
    description: "Quick presets for bulking, cutting, maintenance",
    keywords: ["macro", "preset", "bulking", "cutting", "maintenance", "goal"],
    category: "dietary",
    path: "/app/settings/dietary",
    componentId: "setting-macro-preset",
    isAdvanced: false,
  },
  {
    id: "unit-system",
    label: "Unit System",
    description: "Imperial or metric measurements",
    keywords: ["unit", "imperial", "metric", "measurement", "cups", "grams"],
    category: "dietary",
    path: "/app/settings/dietary",
    componentId: "setting-unit-system",
    isAdvanced: false,
  },
  {
    id: "custom-badges",
    label: "Custom Nutrition Badges",
    description: "Create custom nutrition indicator badges",
    keywords: ["badge", "nutrition", "custom", "indicator", "label"],
    category: "dietary",
    path: "/app/settings/dietary",
    componentId: "setting-custom-badges",
    isAdvanced: true,
  },
  {
    id: "substitutions",
    label: "Ingredient Substitutions",
    description: "Set up automatic ingredient substitutions",
    keywords: ["substitute", "swap", "replace", "ingredient", "alternative"],
    category: "dietary",
    path: "/app/settings/dietary",
    componentId: "setting-substitutions",
    isAdvanced: false,
  },

  // ═══════════════════════════════════════════════════════════════════
  // SOUNDS & SHORTCUTS
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "sounds-enabled",
    label: "Sounds Enabled",
    description: "Enable or disable all sound effects",
    keywords: ["sound", "audio", "mute", "volume", "effects"],
    category: "shortcuts",
    path: "/app/settings/shortcuts",
    componentId: "setting-sounds-enabled",
    isAdvanced: false,
  },
  {
    id: "timer-sound",
    label: "Timer Sound",
    description: "Sound when cooking timer completes",
    keywords: ["timer", "sound", "alarm", "alert", "cooking", "done"],
    category: "shortcuts",
    path: "/app/settings/shortcuts",
    componentId: "setting-timer-sound",
    isAdvanced: false,
  },
  {
    id: "notification-sound",
    label: "Notification Sound",
    description: "Sound for app notifications",
    keywords: ["notification", "sound", "alert", "ping", "message"],
    category: "shortcuts",
    path: "/app/settings/shortcuts",
    componentId: "setting-notification-sound",
    isAdvanced: false,
  },
  {
    id: "achievement-sound",
    label: "Achievement Sound",
    description: "Sound when earning achievements",
    keywords: ["achievement", "sound", "reward", "celebration", "unlock"],
    category: "shortcuts",
    path: "/app/settings/shortcuts",
    componentId: "setting-achievement-sound",
    isAdvanced: false,
  },
  {
    id: "keyboard-shortcuts",
    label: "Keyboard Shortcuts",
    description: "Enable keyboard shortcuts",
    keywords: ["keyboard", "shortcut", "hotkey", "key", "binding"],
    category: "shortcuts",
    path: "/app/settings/shortcuts",
    componentId: "setting-keyboard-shortcuts",
    isAdvanced: true,
  },
  {
    id: "custom-hotkeys",
    label: "Custom Hotkeys",
    description: "Customize keyboard shortcut bindings",
    keywords: ["hotkey", "keyboard", "custom", "binding", "shortcut"],
    category: "shortcuts",
    path: "/app/settings/shortcuts",
    componentId: "setting-custom-hotkeys",
    isAdvanced: true,
  },
  {
    id: "reset-hints",
    label: "Reset Hints",
    description: "Show all dismissed help hints again",
    keywords: ["hint", "help", "tip", "reset", "tutorial", "onboarding"],
    category: "shortcuts",
    path: "/app/settings/shortcuts",
    componentId: "setting-reset-hints",
    isAdvanced: false,
  },

  // ═══════════════════════════════════════════════════════════════════
  // DATA & EXPORT
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "analytics",
    label: "Usage Analytics",
    description: "Share anonymous usage data to help improve the app",
    keywords: ["analytics", "tracking", "privacy", "data", "usage", "telemetry", "anonymous"],
    category: "data",
    path: "/app/settings/data",
    componentId: "setting-analytics",
    isAdvanced: false,
  },
  {
    id: "crash-reporting",
    label: "Crash Reporting",
    description: "Send crash reports to help fix bugs",
    keywords: ["crash", "error", "bug", "report", "privacy", "debug"],
    category: "data",
    path: "/app/settings/data",
    componentId: "setting-crash-reporting",
    isAdvanced: false,
  },
  {
    id: "personalized-recommendations",
    label: "Personalized Recommendations",
    description: "AI-powered recipe suggestions based on your cooking history",
    keywords: ["recommendations", "ai", "suggestions", "personalized", "privacy", "machine learning"],
    category: "data",
    path: "/app/settings/data",
    componentId: "setting-personalized-recommendations",
    isAdvanced: false,
  },
  {
    id: "export-preferences",
    label: "Export Preferences",
    description: "What to include when exporting recipes",
    keywords: ["export", "include", "recipe", "data", "download"],
    category: "data",
    path: "/app/settings/data",
    componentId: "setting-export-preferences",
    isAdvanced: true,
  },
  {
    id: "bulk-export",
    label: "Export Recipes",
    description: "Download all your recipes",
    keywords: ["export", "download", "backup", "recipes", "bulk"],
    category: "data",
    path: "/app/settings/data",
    componentId: "setting-bulk-export",
    isAdvanced: false,
  },
  {
    id: "import-recipes",
    label: "Import Recipes",
    description: "Import recipes from file or other apps",
    keywords: ["import", "upload", "paprika", "recipes", "add"],
    category: "data",
    path: "/app/settings/data",
    componentId: "setting-import-recipes",
    isAdvanced: false,
  },
  {
    id: "custom-fields",
    label: "Custom Fields",
    description: "Add custom metadata fields to recipes",
    keywords: ["custom", "field", "metadata", "property", "attribute"],
    category: "data",
    path: "/app/settings/data",
    componentId: "setting-custom-fields",
    isAdvanced: true,
  },
  {
    id: "ingredient-categories",
    label: "Ingredient Categories",
    description: "Organize shopping list by ingredient category",
    keywords: ["ingredient", "category", "shopping", "list", "organize", "group"],
    category: "data",
    path: "/app/settings/data",
    componentId: "setting-ingredient-categories",
    isAdvanced: true,
  },
  {
    id: "category-order",
    label: "Category Order",
    description: "Reorder shopping list categories",
    keywords: ["category", "order", "sort", "arrange", "shopping"],
    category: "data",
    path: "/app/settings/data",
    componentId: "setting-category-order",
    isAdvanced: true,
  },
  {
    id: "api-costs",
    label: "API Costs",
    description: "View API usage costs (admin only)",
    keywords: ["api", "cost", "usage", "billing", "admin"],
    category: "data",
    path: "/app/settings/data",
    componentId: "setting-api-costs",
    isAdvanced: true,
  },

  // ═══════════════════════════════════════════════════════════════════
  // HOUSEHOLD
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "household-name",
    label: "Household Name",
    description: "Name of your household",
    keywords: ["household", "name", "family", "group"],
    category: "household",
    path: "/app/settings/household",
    componentId: "setting-household-name",
    isAdvanced: false,
  },
  {
    id: "household-members",
    label: "Household Members",
    description: "People in your household",
    keywords: ["members", "people", "family", "household", "invite"],
    category: "household",
    path: "/app/settings/household",
    componentId: "setting-household-members",
    isAdvanced: false,
  },
  {
    id: "cook-names",
    label: "Cook Names",
    description: "Names of people who cook meals",
    keywords: ["cook", "name", "chef", "person", "who"],
    category: "household",
    path: "/app/settings/household",
    componentId: "setting-cook-names",
    isAdvanced: false,
  },
  {
    id: "cook-colors",
    label: "Cook Colors",
    description: "Color coding for each cook",
    keywords: ["cook", "color", "coding", "identify", "person"],
    category: "household",
    path: "/app/settings/household",
    componentId: "setting-cook-colors",
    isAdvanced: false,
  },
];

// Search function with fuzzy matching
export function searchSettings(query: string): SearchableSetting[] {
  if (!query.trim()) return [];

  const q = query.toLowerCase().trim();
  const words = q.split(/\s+/);

  return SETTINGS_SEARCH_INDEX.filter((setting) => {
    const searchableText = [
      setting.label,
      setting.description,
      ...setting.keywords,
    ]
      .join(" ")
      .toLowerCase();

    // All words must match somewhere
    return words.every((word) => searchableText.includes(word));
  }).sort((a, b) => {
    // Prioritize exact label matches
    const aLabelMatch = a.label.toLowerCase().includes(q);
    const bLabelMatch = b.label.toLowerCase().includes(q);
    if (aLabelMatch && !bLabelMatch) return -1;
    if (bLabelMatch && !aLabelMatch) return 1;

    // Then by non-advanced settings
    if (!a.isAdvanced && b.isAdvanced) return -1;
    if (a.isAdvanced && !b.isAdvanced) return 1;

    return 0;
  });
}

// Get settings by category
export function getSettingsByCategory(
  categoryId: SettingsCategoryId
): SearchableSetting[] {
  return SETTINGS_SEARCH_INDEX.filter((s) => s.category === categoryId);
}

// Get advanced settings by category
export function getAdvancedSettings(
  categoryId: SettingsCategoryId
): SearchableSetting[] {
  return SETTINGS_SEARCH_INDEX.filter(
    (s) => s.category === categoryId && s.isAdvanced
  );
}
