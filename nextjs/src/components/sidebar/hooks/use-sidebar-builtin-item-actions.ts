import * as React from "react";
import type {
  SectionConfig,
  SectionItemConfig,
  BuiltInSectionId,
  CustomSectionItem,
} from "@/types/sidebar-customization";
import { DEFAULT_MEAL_PLANNING_ITEMS } from "@/types/sidebar-customization";
import {
  updateBuiltInItemAuto,
  reorderBuiltInItemsAuto,
  addCustomItemToBuiltInSectionAuto,
  removeCustomItemFromBuiltInSectionAuto,
  resetBuiltInItemAuto,
} from "@/app/actions/sidebar-section-actions";

interface UseSidebarBuiltinItemActionsProps {
  setSections: React.Dispatch<React.SetStateAction<Record<string, SectionConfig>>>;
}

interface UseSidebarBuiltinItemActionsReturn {
  updateBuiltInItem: (
    sectionId: BuiltInSectionId,
    itemId: string,
    updates: Partial<Pick<SectionItemConfig, "customName" | "customIcon" | "customEmoji" | "hidden">>
  ) => Promise<void>;
  reorderBuiltInItems: (sectionId: BuiltInSectionId, itemOrder: string[]) => Promise<void>;
  addCustomItemToBuiltInSection: (
    sectionId: BuiltInSectionId,
    item: Omit<CustomSectionItem, "id" | "sortOrder">
  ) => Promise<void>;
  removeCustomItemFromBuiltInSection: (sectionId: BuiltInSectionId, itemId: string) => Promise<void>;
  resetBuiltInItem: (sectionId: BuiltInSectionId, itemId: string) => Promise<void>;
}

export function useSidebarBuiltinItemActions({
  setSections,
}: UseSidebarBuiltinItemActionsProps): UseSidebarBuiltinItemActionsReturn {
  const updateBuiltInItem = React.useCallback(
    async (
      sectionId: BuiltInSectionId,
      itemId: string,
      updates: Partial<Pick<SectionItemConfig, "customName" | "customIcon" | "customEmoji" | "hidden">>
    ) => {
      let previousSection: SectionConfig | undefined;

      setSections((prev) => {
        const section = prev[sectionId];
        if (!section || section.type !== "builtin") return prev;

        previousSection = section;
        const existingItem = section.items[itemId];
        if (!existingItem) return prev;

        return {
          ...prev,
          [sectionId]: {
            ...section,
            items: {
              ...section.items,
              [itemId]: {
                ...existingItem,
                ...updates,
              },
            },
          },
        };
      });

      const { error } = await updateBuiltInItemAuto(sectionId, itemId, updates);

      if (error) {
        console.error("Failed to update built-in item:", error);
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

  const reorderBuiltInItems = React.useCallback(
    async (sectionId: BuiltInSectionId, itemOrder: string[]) => {
      let previousSection: SectionConfig | undefined;

      setSections((prev) => {
        const section = prev[sectionId];
        if (!section || section.type !== "builtin") return prev;

        previousSection = section;

        return {
          ...prev,
          [sectionId]: {
            ...section,
            itemOrder,
          },
        };
      });

      const { error } = await reorderBuiltInItemsAuto(sectionId, itemOrder);

      if (error) {
        console.error("Failed to reorder built-in items:", error);
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

  const addCustomItemToBuiltInSection = React.useCallback(
    async (sectionId: BuiltInSectionId, item: Omit<CustomSectionItem, "id" | "sortOrder">) => {
      const tempItemId = crypto.randomUUID();
      let previousSection: SectionConfig | undefined;

      setSections((prev) => {
        const section = prev[sectionId];
        if (!section || section.type !== "builtin") return prev;

        previousSection = section;

        const maxSortOrder = Math.max(
          ...section.customItems.map((i) => i.sortOrder),
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
            customItems: [...section.customItems, newItem],
            itemOrder: [...section.itemOrder, tempItemId],
          },
        };
      });

      const { error } = await addCustomItemToBuiltInSectionAuto(sectionId, item);

      if (error) {
        console.error("Failed to add custom item to built-in section:", error);
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

  const removeCustomItemFromBuiltInSection = React.useCallback(
    async (sectionId: BuiltInSectionId, itemId: string) => {
      let previousSection: SectionConfig | undefined;

      setSections((prev) => {
        const section = prev[sectionId];
        if (!section || section.type !== "builtin") return prev;

        previousSection = section;

        return {
          ...prev,
          [sectionId]: {
            ...section,
            customItems: section.customItems.filter((i) => i.id !== itemId),
            itemOrder: section.itemOrder.filter((id) => id !== itemId),
          },
        };
      });

      const { error } = await removeCustomItemFromBuiltInSectionAuto(sectionId, itemId);

      if (error) {
        console.error("Failed to remove custom item from built-in section:", error);
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

  const resetBuiltInItem = React.useCallback(
    async (sectionId: BuiltInSectionId, itemId: string) => {
      let previousSection: SectionConfig | undefined;
      const defaultItem = DEFAULT_MEAL_PLANNING_ITEMS[itemId];

      if (!defaultItem) {
        console.error("Cannot reset: invalid item ID");
        return;
      }

      setSections((prev) => {
        const section = prev[sectionId];
        if (!section || section.type !== "builtin") return prev;

        previousSection = section;

        return {
          ...prev,
          [sectionId]: {
            ...section,
            items: {
              ...section.items,
              [itemId]: structuredClone(defaultItem),
            },
          },
        };
      });

      const { error } = await resetBuiltInItemAuto(sectionId, itemId);

      if (error) {
        console.error("Failed to reset built-in item:", error);
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
    updateBuiltInItem,
    reorderBuiltInItems,
    addCustomItemToBuiltInSection,
    removeCustomItemFromBuiltInSection,
    resetBuiltInItem,
  };
}
