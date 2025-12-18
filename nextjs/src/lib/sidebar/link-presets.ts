/**
 * Link presets for the Add Link dialog
 * These provide quick-add options for common app pages
 */

export type PresetCategory = "essentials" | "features" | "settings";

export interface LinkPreset {
  id: string;
  label: string;
  href: string;
  emoji: string;
  category: PresetCategory;
}

export const LINK_PRESETS: LinkPreset[] = [
  // Essentials - Core navigation pages
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/app",
    emoji: "🏠",
    category: "essentials",
  },
  {
    id: "recipes",
    label: "Recipes",
    href: "/app/recipes",
    emoji: "📖",
    category: "essentials",
  },
  {
    id: "shopping",
    label: "Shopping List",
    href: "/app/shop",
    emoji: "🛒",
    category: "essentials",
  },
  {
    id: "favorites",
    label: "Favorites",
    href: "/app/history",
    emoji: "❤️",
    category: "essentials",
  },

  // Features - Secondary app features
  {
    id: "stats",
    label: "Stats",
    href: "/app/stats",
    emoji: "📊",
    category: "features",
  },
  {
    id: "pantry",
    label: "Pantry",
    href: "/app/pantry",
    emoji: "🥫",
    category: "features",
  },
  {
    id: "nutrition",
    label: "Nutrition",
    href: "/app/nutrition",
    emoji: "🥗",
    category: "features",
  },
  {
    id: "new-recipe",
    label: "New Recipe",
    href: "/app/recipes/new",
    emoji: "➕",
    category: "features",
  },
  {
    id: "discover",
    label: "Discover",
    href: "/app/recipes/discover",
    emoji: "🔍",
    category: "features",
  },

  // Settings - Preference pages
  {
    id: "settings",
    label: "Settings",
    href: "/app/settings",
    emoji: "⚙️",
    category: "settings",
  },
  {
    id: "appearance",
    label: "Appearance",
    href: "/app/settings/appearance",
    emoji: "🎨",
    category: "settings",
  },
  {
    id: "household",
    label: "Household",
    href: "/app/settings/household",
    emoji: "👨‍👩‍👧",
    category: "settings",
  },
  {
    id: "dietary",
    label: "Dietary",
    href: "/app/settings/dietary",
    emoji: "🥦",
    category: "settings",
  },
];

export const PRESET_CATEGORIES: {
  id: PresetCategory;
  label: string;
}[] = [
  { id: "essentials", label: "Essentials" },
  { id: "features", label: "Features" },
  { id: "settings", label: "Settings" },
];

/**
 * Get presets grouped by category
 */
export function getPresetsByCategory(): Record<PresetCategory, LinkPreset[]> {
  return LINK_PRESETS.reduce(
    (acc, preset) => {
      acc[preset.category].push(preset);
      return acc;
    },
    {
      essentials: [],
      features: [],
      settings: [],
    } as Record<PresetCategory, LinkPreset[]>
  );
}
