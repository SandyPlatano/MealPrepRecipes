import * as React from "react";
import type {
  SectionConfig,
  BuiltInSectionId,
} from "@/types/sidebar-customization";
import {
  DEFAULT_SECTION_ORDER,
  DEFAULT_BUILTIN_SECTIONS,
  isBuiltInSectionId,
} from "@/types/sidebar-customization";
import {
  reorderSectionsAuto,
  updateBuiltInSectionAuto,
} from "@/app/actions/sidebar-section-actions";
import { updateCustomSectionAuto } from "@/app/actions/sidebar-section-actions";

interface UseSidebarSectionActionsProps {
  sections: Record<string, SectionConfig>;
  setSections: React.Dispatch<React.SetStateAction<Record<string, SectionConfig>>>;
  sectionOrder: string[];
  setSectionOrder: React.Dispatch<React.SetStateAction<string[]>>;
}

interface UseSidebarSectionActionsReturn {
  reorderSections: (sectionIds: string[]) => Promise<void>;
  toggleSectionVisibility: (sectionId: string) => Promise<void>;
  updateSectionLabel: (sectionId: string, label: string) => Promise<void>;
  updateSectionEmoji: (sectionId: string, emoji: string | null) => Promise<void>;
  resetSection: (sectionId: BuiltInSectionId) => Promise<void>;
}

export function useSidebarSectionActions({
  sections,
  setSections,
  sectionOrder,
  setSectionOrder,
}: UseSidebarSectionActionsProps): UseSidebarSectionActionsReturn {
  const reorderSections = React.useCallback(async (newOrder: string[]) => {
    const previousOrder = sectionOrder;
    setSectionOrder(newOrder);

    const { error } = await reorderSectionsAuto(newOrder);
    if (error) {
      setSectionOrder(previousOrder);
      console.error("Failed to reorder sections:", error);
    }
  }, [sectionOrder, setSectionOrder]);

  const toggleSectionVisibility = React.useCallback(async (sectionId: string) => {
    const previousSections = sections;
    const section = sections[sectionId];
    if (!section) return;

    const newHidden = !section.hidden;

    setSections((prev) => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        hidden: newHidden,
      },
    }));

    const { error } = isBuiltInSectionId(sectionId)
      ? await updateBuiltInSectionAuto(sectionId, { hidden: newHidden })
      : await updateCustomSectionAuto(sectionId, { hidden: newHidden });

    if (error) {
      setSections(previousSections);
      console.error("Failed to toggle section visibility:", error);
    }
  }, [sections, setSections]);

  const updateSectionLabel = React.useCallback(async (sectionId: string, label: string) => {
    const previousSections = sections;
    const section = sections[sectionId];
    if (!section) return;

    setSections((prev) => {
      if (section.type === "custom") {
        return {
          ...prev,
          [sectionId]: {
            ...section,
            title: label,
          },
        };
      } else {
        return {
          ...prev,
          [sectionId]: {
            ...section,
            customTitle: label,
          },
        };
      }
    });

    const { error } = isBuiltInSectionId(sectionId)
      ? await updateBuiltInSectionAuto(sectionId, { customTitle: label })
      : await updateCustomSectionAuto(sectionId, { title: label });

    if (error) {
      setSections(previousSections);
      console.error("Failed to update section label:", error);
    }
  }, [sections, setSections]);

  const updateSectionEmoji = React.useCallback(async (sectionId: string, emoji: string | null) => {
    const previousSections = sections;
    const section = sections[sectionId];
    if (!section) return;

    setSections((prev) => {
      if (section.type === "custom") {
        return {
          ...prev,
          [sectionId]: {
            ...section,
            emoji,
          },
        };
      } else {
        return {
          ...prev,
          [sectionId]: {
            ...section,
            customEmoji: emoji,
          },
        };
      }
    });

    const { error } = isBuiltInSectionId(sectionId)
      ? await updateBuiltInSectionAuto(sectionId, { customEmoji: emoji })
      : await updateCustomSectionAuto(sectionId, { emoji });

    if (error) {
      setSections(previousSections);
      console.error("Failed to update section emoji:", error);
    }
  }, [sections, setSections]);

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
  }, [sections, setSections]);

  return {
    reorderSections,
    toggleSectionVisibility,
    updateSectionLabel,
    updateSectionEmoji,
    resetSection,
  };
}

export { DEFAULT_SECTION_ORDER, DEFAULT_BUILTIN_SECTIONS };
