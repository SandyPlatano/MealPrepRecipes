// ============================================================================
// Sidebar Icon Mapping
// Maps icon name strings to Lucide React components for rendering
// ============================================================================

import {
  Home,
  Calendar,
  CalendarDays,
  Search,
  Plus,
  UtensilsCrossed,
  CookingPot,
  Soup,
  Pizza,
  Apple,
  Beef,
  Coffee,
  Salad,
  Cherry,
  Egg,
  Fish,
  IceCreamCone,
  Sandwich,
  Folder,
  FolderOpen,
  Folders,
  BookOpen,
  Archive,
  Library,
  Tag,
  Tags,
  Bookmark,
  FileText,
  ShoppingCart,
  ShoppingBag,
  ListTodo,
  ListChecks,
  ClipboardList,
  Receipt,
  BarChart3,
  TrendingUp,
  Activity,
  PieChart,
  Target,
  Heart,
  Star,
  Users,
  User,
  Sparkles,
  Crown,
  Award,
  Trophy,
  Settings,
  Link,
  ExternalLink,
  Pin,
  Clock,
  History,
  Zap,
  Flame,
  Leaf,
  Sun,
  Moon,
  Lightbulb,
  Compass,
  Map,
  Globe,
  type LucideIcon,
} from "lucide-react";
import type { SidebarIconName } from "@/types/sidebar-customization";

/**
 * Maps icon name strings to Lucide icon components.
 * Used for rendering icons from serialized preferences.
 */
export const SIDEBAR_ICON_MAP: Record<SidebarIconName, LucideIcon> = {
  // Navigation
  Home,
  Calendar,
  CalendarDays,
  Search,
  Plus,
  // Food & Cooking
  UtensilsCrossed,
  CookingPot,
  Soup,
  Pizza,
  Apple,
  Beef,
  Coffee,
  Salad,
  Cherry,
  Egg,
  Fish,
  IceCream: IceCreamCone,
  Sandwich,
  // Organization
  Folder,
  FolderOpen,
  Folders,
  BookOpen,
  Archive,
  Library,
  Tag,
  Tags,
  Bookmark,
  FileText,
  // Shopping & Lists
  ShoppingCart,
  ShoppingBag,
  ListTodo,
  ListChecks,
  ClipboardList,
  Receipt,
  // Stats & Analytics
  BarChart3,
  TrendingUp,
  Activity,
  PieChart,
  Target,
  // User & Social
  Heart,
  Star,
  Users,
  User,
  Sparkles,
  Crown,
  Award,
  Trophy,
  // Misc
  Settings,
  Link,
  ExternalLink,
  Pin,
  Clock,
  History,
  Zap,
  Flame,
  Leaf,
  Sun,
  Moon,
  Lightbulb,
  Compass,
  Map,
  Globe,
};

/**
 * Gets a Lucide icon component from an icon name.
 * Returns fallback if icon name is invalid or null.
 */
export function getIconComponent(
  iconName: SidebarIconName | null | undefined,
  fallback?: LucideIcon
): LucideIcon | null {
  if (!iconName) return fallback ?? null;
  return SIDEBAR_ICON_MAP[iconName] ?? fallback ?? null;
}

/**
 * Checks if a string is a valid sidebar icon name.
 */
export function isValidIconName(name: string): name is SidebarIconName {
  return name in SIDEBAR_ICON_MAP;
}

/**
 * Icon picker categories for the settings UI.
 * Organized to help users find relevant icons quickly.
 */
export const ICON_PICKER_CATEGORIES = [
  {
    name: "Navigation",
    icons: [
      "Home",
      "Calendar",
      "CalendarDays",
      "Search",
      "Plus",
      "Compass",
      "Map",
      "Globe",
    ] as SidebarIconName[],
  },
  {
    name: "Food & Cooking",
    icons: [
      "UtensilsCrossed",
      "CookingPot",
      "Soup",
      "Pizza",
      "Apple",
      "Beef",
      "Coffee",
      "Salad",
      "Cherry",
      "Egg",
      "Fish",
      "IceCream",
      "Sandwich",
    ] as SidebarIconName[],
  },
  {
    name: "Organization",
    icons: [
      "Folder",
      "FolderOpen",
      "Folders",
      "BookOpen",
      "Archive",
      "Library",
      "Tag",
      "Tags",
      "Bookmark",
      "FileText",
    ] as SidebarIconName[],
  },
  {
    name: "Shopping & Lists",
    icons: [
      "ShoppingCart",
      "ShoppingBag",
      "ListTodo",
      "ListChecks",
      "ClipboardList",
      "Receipt",
    ] as SidebarIconName[],
  },
  {
    name: "Stats & Analytics",
    icons: [
      "BarChart3",
      "TrendingUp",
      "Activity",
      "PieChart",
      "Target",
    ] as SidebarIconName[],
  },
  {
    name: "Favorites & People",
    icons: [
      "Heart",
      "Star",
      "Users",
      "User",
      "Sparkles",
      "Crown",
      "Award",
      "Trophy",
    ] as SidebarIconName[],
  },
  {
    name: "Miscellaneous",
    icons: [
      "Settings",
      "Link",
      "ExternalLink",
      "Pin",
      "Clock",
      "History",
      "Zap",
      "Flame",
      "Leaf",
      "Sun",
      "Moon",
      "Lightbulb",
    ] as SidebarIconName[],
  },
] as const;

/**
 * Gets all available icon names as a flat array.
 */
export function getAllIconNames(): SidebarIconName[] {
  return Object.keys(SIDEBAR_ICON_MAP) as SidebarIconName[];
}

/**
 * Default icons for built-in sections.
 */
export const DEFAULT_SECTION_ICONS: Record<string, LucideIcon> = {
  "quick-nav": Home,
  pinned: Pin,
  "meal-planning": Calendar,
  collections: Folders,
};

/**
 * Default icons for meal planning items.
 */
export const DEFAULT_MEAL_PLANNING_ICONS: Record<string, LucideIcon> = {
  plan: Calendar,
  "shopping-list": ShoppingCart,
  recipes: BookOpen,
  favorites: Heart,
  stats: BarChart3,
};
