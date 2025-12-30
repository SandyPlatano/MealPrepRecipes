import * as React from "react";
import type {
  SectionConfig,
  CustomSectionConfig,
  CustomSectionItem,
} from "@/types/sidebar-customization";
import { createCustomSection } from "@/lib/sidebar/sidebar-migration";
import {
  createCustomSectionAuto,
  updateCustomSectionAuto,
  deleteCustomSectionAuto,
  addCustomSectionItemAuto,
  removeCustomSectionItemAuto,
} from "@/app/actions/sidebar-section-actions";

interface UseSidebarCustomSectionActionsProps {
  sections: Record<string, SectionConfig>;
  setSections: React.Dispatch<React.SetStateAction<Record<string, SectionConfig>>>;
  setSectionOrder: React.Dispatch<React.SetStateAction<string[]>>;
}

interface UseSidebarCustomSectionActionsReturn {
  addCustomSection: (title: string) => Promise<string | null>;
  updateCustomSection: (sectionId: string, updates: Partial<CustomSectionConfig>) => Promise<void>;
  removeCustomSection: (sectionId: string) => Promise<void>;
  addCustomSectionItem: (sectionId: string, item: Omit<CustomSectionItem, "id" | "sortOrder">) => Promise<void>;
  removeCustomSectionItem: (sectionId: string, itemId: string) => Promise<void>;
}

export function useSidebarCustomSectionActions({
  sections,
  setSections,
  setSectionOrder,
}: UseSidebarCustomSectionActionsProps): UseSidebarCustomSectionActionsReturn {
  const addCustomSection = React.useCallback(async (title: string): Promise<string | null> => {
    const maxSortOrder = Math.max(
      ...Object.values(sections).map((s) => s.sortOrder),
      0
    );
    const newSection = createCustomSection(title, maxSortOrder + 1);

    // Optimistic update
    setSections((prev) => ({
      ...prev,
      [newSection.id]: newSection,
    }));
    setSectionOrder((prev) => [...prev, newSection.id]);

    // Persist to database
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
      // Rollback optimistic update on error
      setSections((prev) =>
        Object.fromEntries(
          Object.entries(prev).filter(([key]) => key !== newSection.id)
        ) as Record<string, SectionConfig>
      );
      setSectionOrder((prev) => prev.filter((id) => id !== newSection.id));
      return null;
    }

    return sectionId || newSection.id;
  }, [sections, setSections, setSectionOrder]);

  const updateCustomSection = React.useCallback(
    async (sectionId: string, updates: Partial<CustomSectionConfig>) => {
      let previousSection: SectionConfig | undefined;

      setSections((prev) => {
        const section = prev[sectionId];
        if (!section || section.type !== "custom") return prev;

        previousSection = section;

        return {
          ...prev,
          [sectionId]: {
            ...section,
            ...updates,
          },
        };
      });

      const { error } = await updateCustomSectionAuto(sectionId, updates);

      if (error) {
        console.error("Failed to update custom section:", error);
        if (previousSection) {
          setSections((prev) => ({
            ...prev,
            [sectionId]: previousSection!,
          }));
        }
      }
    },
    [setSections]
  );

  const removeCustomSection = React.useCallback(async (sectionId: string) => {
    let previousSection: SectionConfig | undefined;
    let previousOrder: string[] = [];

    setSections((prev) => {
      previousSection = prev[sectionId];
      return Object.fromEntries(
        Object.entries(prev).filter(([key]) => key !== sectionId)
      ) as Record<string, SectionConfig>;
    });
    setSectionOrder((prev) => {
      previousOrder = prev;
      return prev.filter((id) => id !== sectionId);
    });

    const { error } = await deleteCustomSectionAuto(sectionId);

    if (error) {
      console.error("Failed to delete custom section:", error);
      if (previousSection) {
        setSections((prev) => ({
          ...prev,
          [sectionId]: previousSection!,
        }));
        setSectionOrder(previousOrder);
      }
    }
  }, [setSections, setSectionOrder]);

  const addCustomSectionItem = React.useCallback(
    async (sectionId: string, item: Omit<CustomSectionItem, "id" | "sortOrder">) => {
      const tempItemId = crypto.randomUUID();
      let previousSection: SectionConfig | undefined;

      setSections((prev) => {
        const section = prev[sectionId];
        if (!section || section.type !== "custom") return prev;

        previousSection = section;

        const maxSortOrder = Math.max(
          ...section.items.map((i) => i.sortOrder),
          0
        );

        const newItem: CustomSectionItem = {
          ...item,
          id: tempItemId,
          sortOrder: maxSortOrder + 1,
        } as CustomSectionItem;

        return {
          ...prev,
          [sectionId]: {
            ...section,
            items: [...section.items, newItem],
          },
        };
      });

      const { error } = await addCustomSectionItemAuto(sectionId, item);

      if (error) {
        console.error("Failed to add custom section item:", error);
        if (previousSection) {
          setSections((prev) => ({
            ...prev,
            [sectionId]: previousSection!,
          }));
        }
      }
    },
    [setSections]
  );

  const removeCustomSectionItem = React.useCallback(
    async (sectionId: string, itemId: string) => {
      let previousSection: SectionConfig | undefined;

      setSections((prev) => {
        const section = prev[sectionId];
        if (!section || section.type !== "custom") return prev;

        previousSection = section;

        return {
          ...prev,
          [sectionId]: {
            ...section,
            items: section.items.filter((i) => i.id !== itemId),
          },
        };
      });

      const { error } = await removeCustomSectionItemAuto(sectionId, itemId);

      if (error) {
        console.error("Failed to remove custom section item:", error);
        if (previousSection) {
          setSections((prev) => ({
            ...prev,
            [sectionId]: previousSection!,
          }));
        }
      }
    },
    [setSections]
  );

  return {
    addCustomSection,
    updateCustomSection,
    removeCustomSection,
    addCustomSectionItem,
    removeCustomSectionItem,
  };
}
