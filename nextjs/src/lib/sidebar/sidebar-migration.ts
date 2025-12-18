// ============================================================================
// Sidebar Preferences Migration
// Handles backwards compatibility when migrating from v1 to v2 format
// ============================================================================

import type { PinnedItem, SidebarMode } from "@/types/user-preferences-v2";
import type {
  SidebarPreferencesV2,
  SectionConfig,
  BuiltInSectionConfig,
  BuiltInSectionId,
} from "@/types/sidebar-customization";
import {
  DEFAULT_BUILTIN_SECTIONS,
  DEFAULT_SECTION_ORDER,
  CURRENT_SIDEBAR_SCHEMA_VERSION,
  DEFAULT_SIDEBAR_PREFERENCES_V2,
} from "@/types/sidebar-customization";

/**
 * Old v1 SidebarPreferences format (for migration).
 */
interface SidebarPreferencesV1 {
  mode?: SidebarMode;
  hoverExpand?: boolean; // Deprecated - being removed
  width?: number;
  pinnedItems?: PinnedItem[];
  hiddenItems?: string[];
  pinnedSectionExpanded?: boolean;
}

/**
 * Migrates old SidebarPreferences (v1) to SidebarPreferencesV2.
 * Called automatically when loading preferences without schemaVersion.
 */
export function migrateSidebarPreferences(
  oldPrefs: Partial<SidebarPreferencesV1>
): SidebarPreferencesV2 {
  // Start with defaults
  const newPrefs: SidebarPreferencesV2 = {
    mode: oldPrefs.mode ?? "expanded",
    width: oldPrefs.width ?? 260,
    pinnedItems: oldPrefs.pinnedItems ?? [],
    pinnedSectionExpanded: oldPrefs.pinnedSectionExpanded ?? true,
    sections: structuredClone(DEFAULT_BUILTIN_SECTIONS),
    sectionOrder: [...DEFAULT_SECTION_ORDER],
    schemaVersion: CURRENT_SIDEBAR_SCHEMA_VERSION,
    reducedMotion: false,
  };

  // Migrate hiddenItems to section-level hiding if applicable
  if (oldPrefs.hiddenItems && oldPrefs.hiddenItems.length > 0) {
    for (const hiddenId of oldPrefs.hiddenItems) {
      // Check if it's a built-in section
      if (newPrefs.sections[hiddenId]) {
        (newPrefs.sections[hiddenId] as BuiltInSectionConfig).hidden = true;
      }
      // Check if it's a meal-planning item
      const mealPlanningSection = newPrefs.sections[
        "meal-planning"
      ] as BuiltInSectionConfig;
      if (mealPlanningSection.items[hiddenId]) {
        mealPlanningSection.items[hiddenId].hidden = true;
      }
    }
  }

  return newPrefs;
}

/**
 * Normalizes loaded preferences by ensuring all required fields exist.
 * Handles partial data from database or corrupted state.
 */
export function normalizeSidebarPreferences(
  prefs: Partial<SidebarPreferencesV2> | null | undefined
): SidebarPreferencesV2 {
  // If null/undefined, return defaults
  if (!prefs) {
    return structuredClone(DEFAULT_SIDEBAR_PREFERENCES_V2);
  }

  // Check if this is old format (no schemaVersion)
  if (!prefs.schemaVersion) {
    return migrateSidebarPreferences(prefs as Partial<SidebarPreferencesV1>);
  }

  // Ensure all built-in sections exist with proper defaults
  const sections: Record<string, SectionConfig> = {};

  // First, add all default built-in sections
  for (const [id, defaultSection] of Object.entries(DEFAULT_BUILTIN_SECTIONS)) {
    const existingSection = prefs.sections?.[id] as
      | BuiltInSectionConfig
      | undefined;
    if (existingSection) {
      // Merge existing with defaults to fill any missing fields
      sections[id] = {
        ...defaultSection,
        ...existingSection,
        // Ensure nested items are merged properly
        items: {
          ...defaultSection.items,
          ...(existingSection.items || {}),
        },
        itemOrder:
          existingSection.itemOrder?.length > 0
            ? existingSection.itemOrder
            : defaultSection.itemOrder,
      };
    } else {
      sections[id] = structuredClone(defaultSection);
    }
  }

  // Then, add any custom sections that exist
  if (prefs.sections) {
    for (const [id, section] of Object.entries(prefs.sections)) {
      if (section.type === "custom") {
        sections[id] = section;
      }
    }
  }

  // Ensure sectionOrder contains all sections
  const allSectionIds = new Set(Object.keys(sections));
  const sectionOrder = prefs.sectionOrder?.filter((id) =>
    allSectionIds.has(id)
  ) ?? [...DEFAULT_SECTION_ORDER];

  // Add any sections not in the order
  for (const id of allSectionIds) {
    if (!sectionOrder.includes(id)) {
      sectionOrder.push(id);
    }
  }

  return {
    mode: prefs.mode ?? "expanded",
    width: prefs.width ?? 260,
    pinnedItems: prefs.pinnedItems ?? [],
    pinnedSectionExpanded: prefs.pinnedSectionExpanded ?? true,
    sections,
    sectionOrder,
    schemaVersion: CURRENT_SIDEBAR_SCHEMA_VERSION,
    reducedMotion: prefs.reducedMotion ?? false,
  };
}

/**
 * Gets the effective order of sections, accounting for custom sections.
 */
export function getEffectiveSectionOrder(
  prefs: SidebarPreferencesV2
): string[] {
  const orderedIds = new Set(prefs.sectionOrder);
  const allSectionIds = Object.keys(prefs.sections);

  // Start with explicit order
  const result = [...prefs.sectionOrder];

  // Add any sections not in the order (new custom sections)
  for (const id of allSectionIds) {
    if (!orderedIds.has(id)) {
      result.push(id);
    }
  }

  return result;
}

/**
 * Gets visible sections in order.
 */
export function getVisibleSections(
  prefs: SidebarPreferencesV2
): SectionConfig[] {
  const order = getEffectiveSectionOrder(prefs);

  return order
    .map((id) => prefs.sections[id])
    .filter(
      (section): section is SectionConfig =>
        section !== undefined && !section.hidden
    );
}

/**
 * Gets a section's display title (custom or default).
 */
export function getSectionTitle(
  section: SectionConfig
): string {
  if (section.type === "custom") {
    return section.title;
  }

  if (section.customTitle) {
    return section.customTitle;
  }

  // Default titles for built-in sections
  const defaultTitles: Record<BuiltInSectionId, string> = {
    "quick-nav": "Quick Nav",
    pinned: "Pinned",
    "meal-planning": "Meal Planning",
    collections: "Collections",
  };

  return defaultTitles[section.id] || section.id;
}

/**
 * Checks if a section has any customization applied.
 */
export function isSectionCustomized(section: SectionConfig): boolean {
  if (section.type === "custom") {
    return true; // Custom sections are always "customized"
  }

  return (
    section.customTitle !== null ||
    section.customIcon !== null ||
    section.customEmoji !== null ||
    section.hidden ||
    section.defaultCollapsed ||
    Object.values(section.items).some(
      (item) =>
        item.customName !== null ||
        item.customIcon !== null ||
        item.customEmoji !== null ||
        item.hidden
    )
  );
}

/**
 * Resets a built-in section to its default configuration.
 */
export function resetSectionToDefault(
  sectionId: BuiltInSectionId
): BuiltInSectionConfig {
  return structuredClone(DEFAULT_BUILTIN_SECTIONS[sectionId]);
}

/**
 * Creates a new custom section with default values.
 */
export function createCustomSection(
  title: string,
  sortOrder: number
): import("@/types/sidebar-customization").CustomSectionConfig {
  return {
    id: crypto.randomUUID(),
    type: "custom",
    title,
    icon: null,
    emoji: null,
    hidden: false,
    defaultCollapsed: false,
    sortOrder,
    items: [],
    createdAt: new Date().toISOString(),
  };
}
