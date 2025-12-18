// ============================================================================
// Sidebar Customization Types
// Full customization for sidebar sections, items, and custom sections
// ============================================================================

import type { PinnedItem, SidebarMode } from "./user-preferences-v2";

// ============================================================================
// Icon System - Using Lucide icon names as strings for JSON serialization
// ============================================================================

/**
 * Available icon names from Lucide React.
 * Using string literals for JSON serialization in JSONB column.
 */
export type SidebarIconName =
  // Navigation
  | "Home"
  | "Calendar"
  | "CalendarDays"
  | "Search"
  | "Plus"
  // Food & Cooking
  | "UtensilsCrossed"
  | "CookingPot"
  | "Soup"
  | "Pizza"
  | "Apple"
  | "Beef"
  | "Coffee"
  | "Salad"
  | "Cherry"
  | "Egg"
  | "Fish"
  | "IceCream"
  | "Sandwich"
  // Organization
  | "Folder"
  | "FolderOpen"
  | "Folders"
  | "BookOpen"
  | "Archive"
  | "Library"
  | "Tag"
  | "Tags"
  | "Bookmark"
  | "FileText"
  // Shopping & Lists
  | "ShoppingCart"
  | "ShoppingBag"
  | "ListTodo"
  | "ListChecks"
  | "ClipboardList"
  | "Receipt"
  // Stats & Analytics
  | "BarChart3"
  | "TrendingUp"
  | "Activity"
  | "PieChart"
  | "Target"
  // User & Social
  | "Heart"
  | "Star"
  | "Users"
  | "User"
  | "Sparkles"
  | "Crown"
  | "Award"
  | "Trophy"
  // Misc
  | "Settings"
  | "Link"
  | "ExternalLink"
  | "Pin"
  | "Clock"
  | "History"
  | "Zap"
  | "Flame"
  | "Leaf"
  | "Sun"
  | "Moon"
  | "Lightbulb"
  | "Compass"
  | "Map"
  | "Globe";

// ============================================================================
// Section Identifiers
// ============================================================================

/**
 * Built-in section IDs that cannot be deleted (only hidden/reordered/customized).
 */
export type BuiltInSectionId =
  | "quick-nav"
  | "pinned"
  | "meal-planning"
  | "collections";

/**
 * Section types for distinguishing built-in vs custom sections.
 */
export type SectionType = "builtin" | "custom";

/**
 * Built-in item IDs within the Meal Planning section.
 */
export type MealPlanningItemId =
  | "plan"
  | "shopping-list"
  | "recipes"
  | "favorites"
  | "stats";

// ============================================================================
// Section Item Configuration (for built-in sections)
// ============================================================================

/**
 * Configuration for a single item within a built-in section.
 * Allows hiding, renaming, and changing icons for built-in items.
 */
export interface SectionItemConfig {
  /** The built-in item ID (e.g., "plan", "recipes") */
  id: string;

  /** Custom display name. null = use default name */
  customName: string | null;

  /** Custom icon name. null = use default icon */
  customIcon: SidebarIconName | null;

  /** Custom emoji to use instead of icon. Takes precedence over customIcon */
  customEmoji: string | null;

  /** Whether this item is hidden */
  hidden: boolean;
}

// ============================================================================
// Custom Section Items (for custom sections)
// ============================================================================

/**
 * Type of item that can be added to a custom section.
 */
export type CustomItemType =
  | "internal-link"
  | "external-link"
  | "recipe-link"
  | "folder-link"
  | "divider";

/**
 * Base interface for all custom section items.
 */
interface CustomItemBase {
  /** Unique identifier for this item (UUID) */
  id: string;

  /** Type of the custom item */
  type: CustomItemType;

  /** Display order within the section */
  sortOrder: number;
}

/**
 * Internal link item - links to an app page.
 */
export interface InternalLinkItem extends CustomItemBase {
  type: "internal-link";

  /** Display label */
  label: string;

  /** App-relative path (e.g., "/app/recipes") */
  href: string;

  /** Icon name from Lucide */
  icon: SidebarIconName | null;

  /** Emoji to display (takes precedence over icon) */
  emoji: string | null;
}

/**
 * External link item - links to external URL.
 */
export interface ExternalLinkItem extends CustomItemBase {
  type: "external-link";

  /** Display label */
  label: string;

  /** Full external URL */
  url: string;

  /** Icon name from Lucide */
  icon: SidebarIconName | null;

  /** Emoji to display (takes precedence over icon) */
  emoji: string | null;

  /** Whether to open in new tab (default: true for external) */
  openInNewTab: boolean;
}

/**
 * Recipe link item - direct link to a specific recipe.
 */
export interface RecipeLinkItem extends CustomItemBase {
  type: "recipe-link";

  /** Recipe ID (UUID) */
  recipeId: string;

  /** Custom display name (null = use recipe name) */
  customLabel: string | null;

  /** Custom emoji (null = use recipe emoji or default) */
  customEmoji: string | null;
}

/**
 * Folder link item - links to a folder filter.
 */
export interface FolderLinkItem extends CustomItemBase {
  type: "folder-link";

  /** Folder ID (UUID) */
  folderId: string;

  /** Is this a smart folder? */
  isSmartFolder: boolean;

  /** Custom display name (null = use folder name) */
  customLabel: string | null;

  /** Custom emoji (null = use folder emoji) */
  customEmoji: string | null;
}

/**
 * Divider item - visual separator.
 */
export interface DividerItem extends CustomItemBase {
  type: "divider";

  /** Optional label for the divider */
  label: string | null;
}

/**
 * Union type for all custom section items.
 */
export type CustomSectionItem =
  | InternalLinkItem
  | ExternalLinkItem
  | RecipeLinkItem
  | FolderLinkItem
  | DividerItem;

// ============================================================================
// Section Configuration
// ============================================================================

/**
 * Configuration for a built-in section.
 */
export interface BuiltInSectionConfig {
  /** Section ID */
  id: BuiltInSectionId;

  /** Section type marker */
  type: "builtin";

  /** Custom display title (null = use default) */
  customTitle: string | null;

  /** Custom icon (null = use default) */
  customIcon: SidebarIconName | null;

  /** Custom emoji (takes precedence over customIcon) */
  customEmoji: string | null;

  /** Whether section is hidden entirely */
  hidden: boolean;

  /** Whether section is collapsed by default */
  defaultCollapsed: boolean;

  /** Display order (lower = higher position) */
  sortOrder: number;

  /**
   * Item configurations within this section.
   * Only applicable for sections with customizable items (meal-planning).
   */
  items: Record<string, SectionItemConfig>;

  /**
   * Order of items within the section.
   * Array of item IDs in display order.
   */
  itemOrder: string[];
}

/**
 * Configuration for a custom user-created section.
 */
export interface CustomSectionConfig {
  /** Unique section ID (UUID) */
  id: string;

  /** Section type marker */
  type: "custom";

  /** Section title */
  title: string;

  /** Icon for the section header */
  icon: SidebarIconName | null;

  /** Emoji for the section header (takes precedence over icon) */
  emoji: string | null;

  /** Whether section is hidden */
  hidden: boolean;

  /** Whether section is collapsed by default */
  defaultCollapsed: boolean;

  /** Display order (lower = higher position) */
  sortOrder: number;

  /** Items within this custom section */
  items: CustomSectionItem[];

  /** When this section was created */
  createdAt: string;
}

/**
 * Union type for all section configurations.
 */
export type SectionConfig = BuiltInSectionConfig | CustomSectionConfig;

// ============================================================================
// Sidebar Preferences V2 (Enhanced)
// ============================================================================

/**
 * Enhanced sidebar preferences with section customization.
 * Backwards compatible with existing SidebarPreferences.
 */
export interface SidebarPreferencesV2 {
  /** Sidebar display mode */
  mode: SidebarMode;

  /** Sidebar width in pixels */
  width: number;

  /** Pinned items (existing functionality) */
  pinnedItems: PinnedItem[];

  /** Whether pinned section is expanded */
  pinnedSectionExpanded: boolean;

  /**
   * Section configurations indexed by section ID.
   * Includes both built-in and custom sections.
   */
  sections: Record<string, SectionConfig>;

  /**
   * Global section order.
   * Array of section IDs in display order.
   */
  sectionOrder: string[];

  /**
   * Schema version for migration support.
   * Increment when making breaking changes.
   */
  schemaVersion: number;

  /**
   * Reduce motion for neurodivergent-friendly UX.
   * When true, disables transitions and animations.
   */
  reducedMotion: boolean;
}

// ============================================================================
// Type Guards
// ============================================================================

export function isBuiltInSection(
  section: SectionConfig
): section is BuiltInSectionConfig {
  return section.type === "builtin";
}

export function isCustomSection(
  section: SectionConfig
): section is CustomSectionConfig {
  return section.type === "custom";
}

export function isBuiltInSectionId(id: string): id is BuiltInSectionId {
  return ["quick-nav", "pinned", "meal-planning", "collections"].includes(id);
}

export function isInternalLinkItem(
  item: CustomSectionItem
): item is InternalLinkItem {
  return item.type === "internal-link";
}

export function isExternalLinkItem(
  item: CustomSectionItem
): item is ExternalLinkItem {
  return item.type === "external-link";
}

export function isRecipeLinkItem(
  item: CustomSectionItem
): item is RecipeLinkItem {
  return item.type === "recipe-link";
}

export function isFolderLinkItem(
  item: CustomSectionItem
): item is FolderLinkItem {
  return item.type === "folder-link";
}

export function isDividerItem(item: CustomSectionItem): item is DividerItem {
  return item.type === "divider";
}

// ============================================================================
// Default Configurations
// ============================================================================

export const DEFAULT_MEAL_PLANNING_ITEM_ORDER: MealPlanningItemId[] = [
  "plan",
  "shopping-list",
  "recipes",
  "favorites",
  "stats",
];

export const DEFAULT_MEAL_PLANNING_ITEMS: Record<string, SectionItemConfig> = {
  plan: {
    id: "plan",
    customName: null,
    customIcon: null,
    customEmoji: null,
    hidden: false,
  },
  "shopping-list": {
    id: "shopping-list",
    customName: null,
    customIcon: null,
    customEmoji: null,
    hidden: false,
  },
  recipes: {
    id: "recipes",
    customName: null,
    customIcon: null,
    customEmoji: null,
    hidden: false,
  },
  favorites: {
    id: "favorites",
    customName: null,
    customIcon: null,
    customEmoji: null,
    hidden: false,
  },
  stats: {
    id: "stats",
    customName: null,
    customIcon: null,
    customEmoji: null,
    hidden: false,
  },
};

export const DEFAULT_BUILTIN_SECTIONS: Record<
  BuiltInSectionId,
  BuiltInSectionConfig
> = {
  "quick-nav": {
    id: "quick-nav",
    type: "builtin",
    customTitle: null,
    customIcon: null,
    customEmoji: null,
    hidden: false,
    defaultCollapsed: false,
    sortOrder: 0,
    items: {},
    itemOrder: [],
  },
  pinned: {
    id: "pinned",
    type: "builtin",
    customTitle: null,
    customIcon: null,
    customEmoji: null,
    hidden: false,
    defaultCollapsed: false,
    sortOrder: 1,
    items: {},
    itemOrder: [],
  },
  "meal-planning": {
    id: "meal-planning",
    type: "builtin",
    customTitle: null,
    customIcon: null,
    customEmoji: null,
    hidden: false,
    defaultCollapsed: false,
    sortOrder: 2,
    items: DEFAULT_MEAL_PLANNING_ITEMS,
    itemOrder: [...DEFAULT_MEAL_PLANNING_ITEM_ORDER],
  },
  collections: {
    id: "collections",
    type: "builtin",
    customTitle: null,
    customIcon: null,
    customEmoji: null,
    hidden: false,
    defaultCollapsed: false,
    sortOrder: 3,
    items: {},
    itemOrder: [],
  },
};

export const DEFAULT_SECTION_ORDER: string[] = [
  "quick-nav",
  "pinned",
  "meal-planning",
  "collections",
];

export const CURRENT_SIDEBAR_SCHEMA_VERSION = 2;

export const DEFAULT_SIDEBAR_PREFERENCES_V2: SidebarPreferencesV2 = {
  mode: "expanded",
  width: 260,
  pinnedItems: [],
  pinnedSectionExpanded: true,
  sections: { ...DEFAULT_BUILTIN_SECTIONS },
  sectionOrder: [...DEFAULT_SECTION_ORDER],
  schemaVersion: CURRENT_SIDEBAR_SCHEMA_VERSION,
  reducedMotion: false,
};
