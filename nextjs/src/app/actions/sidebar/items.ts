"use server";

import { createClient } from "@/lib/supabase/server";
import type {
  SidebarPreferencesV2,
  BuiltInSectionConfig,
  CustomSectionConfig,
  CustomSectionItem,
  BuiltInSectionId,
  SectionItemConfig,
} from "@/types/sidebar-customization";
import { DEFAULT_MEAL_PLANNING_ITEMS } from "@/types/sidebar-customization";
import {
  getSidebarPreferencesV2,
  updateSidebarPreferencesV2,
} from "./helpers";

// ============================================================================
// Built-in Section Item Operations
// ============================================================================

/**
 * Updates a built-in item within a section (rename, icon, emoji, hide).
 */
export async function updateBuiltInItem(
  userId: string,
  sectionId: BuiltInSectionId,
  itemId: string,
  updates: Partial<Pick<SectionItemConfig, "customName" | "customIcon" | "customEmoji" | "hidden">>
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

  // Check if itemId is a valid built-in item for this section
  const existingItem = section.items[itemId];
  if (!existingItem) {
    return { error: "Invalid item ID for this section" };
  }

  const updatedSection: BuiltInSectionConfig = {
    ...section,
    items: {
      ...section.items,
      [itemId]: {
        ...existingItem,
        ...updates,
      },
    },
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

export async function updateBuiltInItemAuto(
  sectionId: BuiltInSectionId,
  itemId: string,
  updates: Partial<Pick<SectionItemConfig, "customName" | "customIcon" | "customEmoji" | "hidden">>
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  return updateBuiltInItem(user.id, sectionId, itemId, updates);
}

/**
 * Adds a custom item (link) to a built-in section.
 * The item will be added to the end of the itemOrder array.
 */
export async function addCustomItemToBuiltInSection(
  userId: string,
  sectionId: BuiltInSectionId,
  item: Omit<CustomSectionItem, "id" | "sortOrder">
): Promise<{ error: string | null; itemId?: string }> {
  const { data: currentPrefs, error: fetchError } =
    await getSidebarPreferencesV2(userId);

  if (fetchError) {
    return { error: fetchError };
  }

  const section = currentPrefs.sections[sectionId];

  if (!section || section.type !== "builtin") {
    return { error: "Invalid built-in section ID" };
  }

  const itemId = crypto.randomUUID();
  const maxSortOrder = Math.max(
    ...section.customItems.map((i) => i.sortOrder),
    -1
  );

  const newItem: CustomSectionItem = {
    ...item,
    id: itemId,
    sortOrder: maxSortOrder + 1,
  } as CustomSectionItem;

  const updatedSection: BuiltInSectionConfig = {
    ...section,
    customItems: [...section.customItems, newItem],
    itemOrder: [...section.itemOrder, itemId],
  };

  const updatedPrefs: SidebarPreferencesV2 = {
    ...currentPrefs,
    sections: {
      ...currentPrefs.sections,
      [sectionId]: updatedSection,
    },
  };

  const updateResult = await updateSidebarPreferencesV2(userId, updatedPrefs);

  if (updateResult.error) {
    return { error: updateResult.error };
  }

  return { error: null, itemId };
}

export async function addCustomItemToBuiltInSectionAuto(
  sectionId: BuiltInSectionId,
  item: Omit<CustomSectionItem, "id" | "sortOrder">
): Promise<{ error: string | null; itemId?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  return addCustomItemToBuiltInSection(user.id, sectionId, item);
}

/**
 * Removes a custom item from a built-in section.
 */
export async function removeCustomItemFromBuiltInSection(
  userId: string,
  sectionId: BuiltInSectionId,
  itemId: string
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

  // Ensure we're only removing custom items, not built-in items
  const itemExists = section.customItems.some((i) => i.id === itemId);
  if (!itemExists) {
    return { error: "Custom item not found in section" };
  }

  const updatedSection: BuiltInSectionConfig = {
    ...section,
    customItems: section.customItems.filter((i) => i.id !== itemId),
    itemOrder: section.itemOrder.filter((id) => id !== itemId),
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

export async function removeCustomItemFromBuiltInSectionAuto(
  sectionId: BuiltInSectionId,
  itemId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  return removeCustomItemFromBuiltInSection(user.id, sectionId, itemId);
}

/**
 * Resets a built-in item to its default configuration.
 */
export async function resetBuiltInItem(
  userId: string,
  sectionId: BuiltInSectionId,
  itemId: string
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

  // Get the default config for this item
  const defaultItem = DEFAULT_MEAL_PLANNING_ITEMS[itemId];
  if (!defaultItem) {
    return { error: "Invalid item ID - cannot reset custom items" };
  }

  const updatedSection: BuiltInSectionConfig = {
    ...section,
    items: {
      ...section.items,
      [itemId]: structuredClone(defaultItem),
    },
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

export async function resetBuiltInItemAuto(
  sectionId: BuiltInSectionId,
  itemId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  return resetBuiltInItem(user.id, sectionId, itemId);
}

// ============================================================================
// Custom Section Items
// ============================================================================

export async function addCustomSectionItem(
  userId: string,
  sectionId: string,
  item: Omit<CustomSectionItem, "id" | "sortOrder">
): Promise<{ error: string | null; itemId?: string }> {
  const { data: currentPrefs, error: fetchError } =
    await getSidebarPreferencesV2(userId);

  if (fetchError) {
    return { error: fetchError };
  }

  const section = currentPrefs.sections[sectionId];

  if (!section || section.type !== "custom") {
    return { error: "Invalid custom section ID" };
  }

  const itemId = crypto.randomUUID();
  const maxSortOrder = Math.max(
    ...section.items.map((i) => i.sortOrder),
    -1
  );

  const newItem: CustomSectionItem = {
    ...item,
    id: itemId,
    sortOrder: maxSortOrder + 1,
  } as CustomSectionItem;

  const updatedSection: CustomSectionConfig = {
    ...section,
    items: [...section.items, newItem],
  };

  const updatedPrefs: SidebarPreferencesV2 = {
    ...currentPrefs,
    sections: {
      ...currentPrefs.sections,
      [sectionId]: updatedSection,
    },
  };

  const updateResult = await updateSidebarPreferencesV2(userId, updatedPrefs);

  if (updateResult.error) {
    return { error: updateResult.error };
  }

  return { error: null, itemId };
}

export async function addCustomSectionItemAuto(
  sectionId: string,
  item: Omit<CustomSectionItem, "id" | "sortOrder">
): Promise<{ error: string | null; itemId?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  return addCustomSectionItem(user.id, sectionId, item);
}

export async function updateCustomSectionItem(
  userId: string,
  sectionId: string,
  itemId: string,
  updates: Partial<Omit<CustomSectionItem, "id" | "type" | "sortOrder">>
): Promise<{ error: string | null }> {
  const { data: currentPrefs, error: fetchError } =
    await getSidebarPreferencesV2(userId);

  if (fetchError) {
    return { error: fetchError };
  }

  const section = currentPrefs.sections[sectionId];

  if (!section || section.type !== "custom") {
    return { error: "Invalid custom section ID" };
  }

  const itemIndex = section.items.findIndex((i) => i.id === itemId);

  if (itemIndex === -1) {
    return { error: "Item not found in section" };
  }

  const updatedItems = [...section.items];
  updatedItems[itemIndex] = {
    ...updatedItems[itemIndex],
    ...updates,
  } as CustomSectionItem;

  const updatedSection: CustomSectionConfig = {
    ...section,
    items: updatedItems,
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

export async function updateCustomSectionItemAuto(
  sectionId: string,
  itemId: string,
  updates: Partial<Omit<CustomSectionItem, "id" | "type" | "sortOrder">>
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  return updateCustomSectionItem(user.id, sectionId, itemId, updates);
}

export async function removeCustomSectionItem(
  userId: string,
  sectionId: string,
  itemId: string
): Promise<{ error: string | null }> {
  const { data: currentPrefs, error: fetchError } =
    await getSidebarPreferencesV2(userId);

  if (fetchError) {
    return { error: fetchError };
  }

  const section = currentPrefs.sections[sectionId];

  if (!section || section.type !== "custom") {
    return { error: "Invalid custom section ID" };
  }

  const updatedItems = section.items.filter((i) => i.id !== itemId);

  const updatedSection: CustomSectionConfig = {
    ...section,
    items: updatedItems,
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

export async function removeCustomSectionItemAuto(
  sectionId: string,
  itemId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  return removeCustomSectionItem(user.id, sectionId, itemId);
}
