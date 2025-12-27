"use server";

import { createClient } from "@/lib/supabase/server";
import type {
  SidebarPreferencesV2,
  BuiltInSectionId,
  BuiltInSectionConfig,
} from "@/types/sidebar-customization";
import {
  getSidebarPreferencesV2,
  updateSidebarPreferencesV2,
} from "./helpers";

// ============================================================================
// Section Ordering
// ============================================================================

export async function reorderSections(
  userId: string,
  sectionIds: string[]
): Promise<{ error: string | null }> {
  const { data: currentPrefs, error: fetchError } =
    await getSidebarPreferencesV2(userId);

  if (fetchError) {
    return { error: fetchError };
  }

  // Validate that all provided IDs exist
  const validIds = sectionIds.filter((id) => currentPrefs.sections[id]);

  // Ensure all sections are included (add any missing ones at the end)
  const allSectionIds = Object.keys(currentPrefs.sections);
  const missingIds = allSectionIds.filter((id) => !validIds.includes(id));
  const newOrder = [...validIds, ...missingIds];

  const updatedPrefs: SidebarPreferencesV2 = {
    ...currentPrefs,
    sectionOrder: newOrder,
  };

  return updateSidebarPreferencesV2(userId, updatedPrefs);
}

export async function reorderSectionsAuto(
  sectionIds: string[]
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  return reorderSections(user.id, sectionIds);
}

// ============================================================================
// Item Ordering (Built-in Sections)
// ============================================================================

/**
 * Reorders items within a built-in section.
 * The itemOrder array can contain both built-in item IDs and custom item UUIDs.
 */
export async function reorderBuiltInItems(
  userId: string,
  sectionId: BuiltInSectionId,
  itemOrder: string[]
): Promise<{ error: string | null }> {
  const { data: currentPrefs, error: fetchError } =
    await getSidebarPreferencesV2(userId);

  if (fetchError) {
    return { error: fetchError };
  }

  const section = currentPrefs.sections[sectionId];

  if (!section || section.type !== "builtin") {
    return { error: "Invalid built-in section ID" };
  }

  // Validate: ensure all built-in items and custom items are included
  const builtInItemIds = Object.keys(section.items);
  const customItemIds = section.customItems.map((item) => item.id);
  const allValidIds = new Set([...builtInItemIds, ...customItemIds]);

  // Filter to only valid IDs and ensure all are included
  const validOrder = itemOrder.filter((id) => allValidIds.has(id));
  const missingIds = [...builtInItemIds, ...customItemIds].filter(
    (id) => !validOrder.includes(id)
  );
  const finalOrder = [...validOrder, ...missingIds];

  const updatedSection: BuiltInSectionConfig = {
    ...section,
    itemOrder: finalOrder,
  };

  const updatedPrefs: SidebarPreferencesV2 = {
    ...currentPrefs,
    sections: {
      ...currentPrefs.sections,
      [sectionId]: updatedSection,
    },
  };

  return updateSidebarPreferencesV2(userId, updatedPrefs);
}

export async function reorderBuiltInItemsAuto(
  sectionId: BuiltInSectionId,
  itemOrder: string[]
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  return reorderBuiltInItems(user.id, sectionId, itemOrder);
}
