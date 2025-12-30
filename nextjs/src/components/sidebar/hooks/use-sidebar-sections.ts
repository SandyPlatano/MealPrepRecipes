"use client";

import * as React from "react";
import type {
  SectionConfig,
  BuiltInSectionId,
  CustomSectionConfig,
  CustomSectionItem,
} from "@/types/sidebar-customization";
import {
  DEFAULT_SECTION_ORDER,
  DEFAULT_BUILTIN_SECTIONS,
  isBuiltInSectionId,
} from "@/types/sidebar-customization";
import { createCustomSection } from "@/lib/sidebar/sidebar-migration";
import {
  createCustomSectionAuto,
  updateCustomSectionAuto,
  deleteCustomSectionAuto,
  addCustomSectionItemAuto,
  removeCustomSectionItemAuto,
  reorderSectionsAuto,
  updateBuiltInSectionAuto,
} from "@/app/actions/sidebar-section-actions";

export interface UseSidebarSectionsOptions {
  initialSections?: Record<string, SectionConfig>;
  initialSectionOrder?: string[];
}

export interface UseSidebarSectionsReturn {
  sections: Record<string, SectionConfig>;
  sectionOrder: string[];
  setSections: React.Dispatch<React.SetStateAction<Record<string, SectionConfig>>>;
  setSectionOrder: React.Dispatch<React.SetStateAction<string[]>>;
  reorderSections: (sectionIds: string[]) => Promise<void>;
  toggleSectionVisibility: (sectionId: string) => Promise<void>;
  updateSectionLabel: (sectionId: string, label: string) => Promise<void>;
  updateSectionEmoji: (sectionId: string, emoji: string | null) => Promise<void>;
  resetSection: (sectionId: BuiltInSectionId) => Promise<void>;
  addCustomSection: (title: string) => Promise<string | null>;
  updateCustomSection: (sectionId: string, updates: Partial<CustomSectionConfig>) => Promise<void>;
  removeCustomSection: (sectionId: string) => Promise<void>;
  addCustomSectionItem: (sectionId: string, item: Omit<CustomSectionItem, "id" | "sortOrder">) => Promise<void>;
  removeCustomSectionItem: (sectionId: string, itemId: string) => Promise<void>;
}

/**
 * Hook for sidebar section customization.
 * Handles section ordering, visibility, custom sections.
 */
export function useSidebarSections({
  initialSections,
  initialSectionOrder,
}: UseSidebarSectionsOptions = {}): UseSidebarSectionsReturn {
  const [sections, setSections] = React.useState<Record<string, SectionConfig>>(
    () => initialSections ?? structuredClone(DEFAULT_BUILTIN_SECTIONS)
  );
  const [sectionOrder, setSectionOrder] = React.useState<string[]>(
    () => initialSectionOrder ?? [...DEFAULT_SECTION_ORDER]
  );

  const reorderSections = React.useCallback(async (newOrder: string[]) => {
    const previousOrder = sectionOrder;
    setSectionOrder(newOrder);

    const { error } = await reorderSectionsAuto(newOrder);
    if (error) {
      setSectionOrder(previousOrder);
      console.error("Failed to reorder sections:", error);
    }
  }, [sectionOrder]);

  const toggleSectionVisibility = React.useCallback(async (sectionId: string) => {
    const previousSections = sections;
    const section = sections[sectionId];
    if (!section) return;

    const newHidden = !section.hidden;

    setSections((prev) => ({
      ...prev,
      [sectionId]: { ...prev[sectionId], hidden: newHidden },
    }));

    const { error } = isBuiltInSectionId(sectionId)
      ? await updateBuiltInSectionAuto(sectionId, { hidden: newHidden })
      : await updateCustomSectionAuto(sectionId, { hidden: newHidden });

    if (error) {
      setSections(previousSections);
      console.error("Failed to toggle section visibility:", error);
    }
  }, [sections]);

  const updateSectionLabel = React.useCallback(async (sectionId: string, label: string) => {
    const previousSections = sections;
    const section = sections[sectionId];
    if (!section) return;

    setSections((prev) => {
      if (section.type === "custom") {
        return { ...prev, [sectionId]: { ...section, title: label } };
      }
      return { ...prev, [sectionId]: { ...section, customTitle: label } };
    });

    const { error } = isBuiltInSectionId(sectionId)
      ? await updateBuiltInSectionAuto(sectionId, { customTitle: label })
      : await updateCustomSectionAuto(sectionId, { title: label });

    if (error) {
      setSections(previousSections);
      console.error("Failed to update section label:", error);
    }
  }, [sections]);

  const updateSectionEmoji = React.useCallback(async (sectionId: string, emoji: string | null) => {
    const previousSections = sections;
    const section = sections[sectionId];
    if (!section) return;

    setSections((prev) => {
      if (section.type === "custom") {
        return { ...prev, [sectionId]: { ...section, emoji } };
      }
      return { ...prev, [sectionId]: { ...section, customEmoji: emoji } };
    });

    const { error } = isBuiltInSectionId(sectionId)
      ? await updateBuiltInSectionAuto(sectionId, { customEmoji: emoji })
      : await updateCustomSectionAuto(sectionId, { emoji });

    if (error) {
      setSections(previousSections);
      console.error("Failed to update section emoji:", error);
    }
  }, [sections]);

  const resetSection = React.useCallback(async (sectionId: BuiltInSectionId) => {
    const previousSections = sections;
    const defaultSection = DEFAULT_BUILTIN_SECTIONS[sectionId];

    setSections((prev) => ({
      ...prev,
      [sectionId]: structuredClone(defaultSection),
    }));

    const { error } = await updateBuiltInSectionAuto(sectionId, {
      customTitle: null,
      customIcon: null,
      customEmoji: null,
      hidden: defaultSection.hidden,
      defaultCollapsed: defaultSection.defaultCollapsed,
    });

    if (error) {
      setSections(previousSections);
      console.error("Failed to reset section:", error);
    }
  }, [sections]);

  const addCustomSection = React.useCallback(async (title: string): Promise<string | null> => {
    const maxSortOrder = Math.max(...Object.values(sections).map((s) => s.sortOrder), 0);
    const newSection = createCustomSection(title, maxSortOrder + 1);

    setSections((prev) => ({ ...prev, [newSection.id]: newSection }));
    setSectionOrder((prev) => [...prev, newSection.id]);

    const { error, sectionId } = await createCustomSectionAuto({
      type: "custom",
      title: newSection.title,
      emoji: newSection.emoji,
      icon: newSection.icon,
      items: newSection.items,
      hidden: newSection.hidden,
      defaultCollapsed: newSection.defaultCollapsed,
    });

    if (error) {
      console.error("Failed to create custom section:", error);
      setSections((prev) =>
        Object.fromEntries(Object.entries(prev).filter(([key]) => key !== newSection.id)) as Record<string, SectionConfig>
      );
      setSectionOrder((prev) => prev.filter((id) => id !== newSection.id));
      return null;
    }

    return sectionId || newSection.id;
  }, [sections]);

  const updateCustomSection = React.useCallback(async (sectionId: string, updates: Partial<CustomSectionConfig>) => {
    let previousSection: SectionConfig | undefined;

    setSections((prev) => {
      const section = prev[sectionId];
      if (!section || section.type !== "custom") return prev;
      previousSection = section;
      return { ...prev, [sectionId]: { ...section, ...updates } };
    });

    const { error } = await updateCustomSectionAuto(sectionId, updates);

    if (error) {
      console.error("Failed to update custom section:", error);
      if (previousSection) {
        setSections((prev) => ({ ...prev, [sectionId]: previousSection! }));
      }
    }
  }, []);

  const removeCustomSection = React.useCallback(async (sectionId: string) => {
    let previousSection: SectionConfig | undefined;
    let previousOrder: string[] = [];

    setSections((prev) => {
      previousSection = prev[sectionId];
      return Object.fromEntries(Object.entries(prev).filter(([key]) => key !== sectionId)) as Record<string, SectionConfig>;
    });
    setSectionOrder((prev) => {
      previousOrder = prev;
      return prev.filter((id) => id !== sectionId);
    });

    const { error } = await deleteCustomSectionAuto(sectionId);

    if (error) {
      console.error("Failed to delete custom section:", error);
      if (previousSection) {
        setSections((prev) => ({ ...prev, [sectionId]: previousSection! }));
        setSectionOrder(previousOrder);
      }
    }
  }, []);

  const addCustomSectionItem = React.useCallback(async (sectionId: string, item: Omit<CustomSectionItem, "id" | "sortOrder">) => {
    const tempItemId = crypto.randomUUID();
    let previousSection: SectionConfig | undefined;

    setSections((prev) => {
      const section = prev[sectionId];
      if (!section || section.type !== "custom") return prev;
      previousSection = section;
      const maxSortOrder = Math.max(...section.items.map((i) => i.sortOrder), 0);
      const newItem: CustomSectionItem = { ...item, id: tempItemId, sortOrder: maxSortOrder + 1 } as CustomSectionItem;
      return { ...prev, [sectionId]: { ...section, items: [...section.items, newItem] } };
    });

    const { error } = await addCustomSectionItemAuto(sectionId, item);

    if (error) {
      console.error("Failed to add custom section item:", error);
      if (previousSection) {
        setSections((prev) => ({ ...prev, [sectionId]: previousSection! }));
      }
    }
  }, []);

  const removeCustomSectionItem = React.useCallback(async (sectionId: string, itemId: string) => {
    let previousSection: SectionConfig | undefined;

    setSections((prev) => {
      const section = prev[sectionId];
      if (!section || section.type !== "custom") return prev;
      previousSection = section;
      return { ...prev, [sectionId]: { ...section, items: section.items.filter((i) => i.id !== itemId) } };
    });

    const { error } = await removeCustomSectionItemAuto(sectionId, itemId);

    if (error) {
      console.error("Failed to remove custom section item:", error);
      if (previousSection) {
        setSections((prev) => ({ ...prev, [sectionId]: previousSection! }));
      }
    }
  }, []);

  return {
    sections,
    sectionOrder,
    setSections,
    setSectionOrder,
    reorderSections,
    toggleSectionVisibility,
    updateSectionLabel,
    updateSectionEmoji,
    resetSection,
    addCustomSection,
    updateCustomSection,
    removeCustomSection,
    addCustomSectionItem,
    removeCustomSectionItem,
  };
}
