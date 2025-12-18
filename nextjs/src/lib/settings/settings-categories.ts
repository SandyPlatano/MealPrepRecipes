import {
  User,
  Palette,
  CalendarDays,
  Apple,
  Keyboard,
  Database,
  Users,
  MessageSquareHeart,
  PanelLeft,
  LayoutGrid,
  type LucideIcon,
} from "lucide-react";

export type SettingsCategoryId =
  | "profile"
  | "appearance"
  | "recipe-layout"
  | "sidebar"
  | "meal-planning"
  | "dietary"
  | "shortcuts"
  | "data"
  | "household"
  | "feedback";

/**
 * Sub-section for jump-link navigation within a settings page.
 * When clicked in the sidebar, scrolls to the target section.
 */
export interface SettingsSubSection {
  id: string;
  label: string;
  scrollTarget: string; // ID of the element to scroll to
}

export interface SettingsCategory {
  id: SettingsCategoryId;
  label: string;
  shortLabel: string;
  description: string;
  icon: LucideIcon;
  path: string;
  /** Optional sub-sections for jump-link navigation within the page */
  subSections?: SettingsSubSection[];
}

export const SETTINGS_CATEGORIES: SettingsCategory[] = [
  {
    id: "profile",
    label: "Profile & Account",
    shortLabel: "Profile",
    description: "Your personal information and account settings",
    icon: User,
    path: "/app/settings/profile",
  },
  {
    id: "appearance",
    label: "Appearance",
    shortLabel: "Appearance",
    description: "Theme, colors, and display preferences",
    icon: Palette,
    path: "/app/settings/appearance",
  },
  {
    id: "recipe-layout",
    label: "Recipe Layout",
    shortLabel: "Recipe",
    description: "Customize recipe page sections, order, and visibility",
    icon: LayoutGrid,
    path: "/app/settings/recipe-layout",
  },
  {
    id: "sidebar",
    label: "Sidebar",
    shortLabel: "Sidebar",
    description: "Customize sidebar sections, order, and appearance",
    icon: PanelLeft,
    path: "/app/settings/sidebar",
  },
  {
    id: "meal-planning",
    label: "Meal Planning",
    shortLabel: "Meals",
    description: "Planner view, meal types, and calendar settings",
    icon: CalendarDays,
    path: "/app/settings/meal-planning",
  },
  {
    id: "dietary",
    label: "Dietary & Nutrition",
    shortLabel: "Dietary",
    description: "Allergens, macro goals, and nutritional preferences",
    icon: Apple,
    path: "/app/settings/dietary",
    subSections: [
      { id: "allergens", label: "Allergens", scrollTarget: "section-allergens" },
      { id: "nutrition", label: "Nutrition", scrollTarget: "section-nutrition" },
      { id: "measurements", label: "Measurements", scrollTarget: "section-measurements" },
      { id: "badges", label: "Badges", scrollTarget: "section-badges" },
      { id: "substitutions", label: "Substitutions", scrollTarget: "section-substitutions" },
    ],
  },
  {
    id: "shortcuts",
    label: "Sounds & Shortcuts",
    shortLabel: "Shortcuts",
    description: "Audio feedback and keyboard shortcuts",
    icon: Keyboard,
    path: "/app/settings/shortcuts",
  },
  {
    id: "data",
    label: "Data & Export",
    shortLabel: "Data",
    description: "Import, export, and manage your data",
    icon: Database,
    path: "/app/settings/data",
  },
  {
    id: "household",
    label: "Household",
    shortLabel: "Household",
    description: "Household members and shared settings",
    icon: Users,
    path: "/app/settings/household",
  },
  {
    id: "feedback",
    label: "Feedback",
    shortLabel: "Feedback",
    description: "Share your thoughts and help improve the app",
    icon: MessageSquareHeart,
    path: "/app/settings/feedback",
  },
];

export const SETTINGS_CATEGORY_MAP = new Map(
  SETTINGS_CATEGORIES.map((cat) => [cat.id, cat])
);

export function getCategoryById(id: SettingsCategoryId): SettingsCategory | undefined {
  return SETTINGS_CATEGORY_MAP.get(id);
}

export function getCategoryByPath(path: string): SettingsCategory | undefined {
  return SETTINGS_CATEGORIES.find((cat) => cat.path === path);
}
