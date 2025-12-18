"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { UserPreferencesV2 } from "@/types/user-preferences-v2";
import type {
  SidebarPreferencesV2,
  BuiltInSectionConfig,
  CustomSectionConfig,
  CustomSectionItem,
  BuiltInSectionId,
} from "@/types/sidebar-customization";
import {
  DEFAULT_SIDEBAR_PREFERENCES_V2,
  isBuiltInSectionId,
} from "@/types/sidebar-customization";
import { normalizeSidebarPreferences } from "@/lib/sidebar/sidebar-migration";

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Gets current sidebar preferences V2 from database.
 */
async function getSidebarPreferencesV2(
  userId: string
): Promise<{ error: string | null; data: SidebarPreferencesV2 }> {
  const supabase = await createClient();

  const { data: settings, error } = await supabase
    .from("user_settings")
    .select("preferences_v2")
    .eq("user_id", userId)
    .single();

  if (error || !settings?.preferences_v2) {
    return {
      error: null,
      data: structuredClone(DEFAULT_SIDEBAR_PREFERENCES_V2),
    };
  }

  const prefs = settings.preferences_v2 as Partial<UserPreferencesV2>;
  const sidebarPrefs = normalizeSidebarPreferences(prefs.sidebar);

  return { error: null, data: sidebarPrefs };
}

/**
 * Updates sidebar preferences V2 in database.
 */
async function updateSidebarPreferencesV2(
  userId: string,
  sidebarPrefs: SidebarPreferencesV2
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  // Get current full preferences
  const { data: settings } = await supabase
    .from("user_settings")
    .select("preferences_v2")
    .eq("user_id", userId)
    .single();

  const currentPrefs =
    (settings?.preferences_v2 as Partial<UserPreferencesV2>) || {};

  // Cast through unknown to handle backwards compatibility between v1 and v2
  const updatedPreferences = {
    ...currentPrefs,
    sidebar: sidebarPrefs as unknown,
  } as Partial<UserPreferencesV2>;

  const { error } = await supabase
    .from("user_settings")
    .upsert(
      { user_id: userId, preferences_v2: updatedPreferences },
      { onConflict: "user_id" }
    );

  if (error) {
    console.error("Error updating sidebar preferences V2:", error);
    return { error: "Failed to update sidebar preferences" };
  }

  revalidatePath("/app");
  return { error: null };
}

// ============================================================================
// Section Order
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
// Built-in Section Updates
// ============================================================================

export async function updateBuiltInSection(
  userId: string,
  sectionId: BuiltInSectionId,
  updates: Partial<
    Pick<
      BuiltInSectionConfig,
      | "customTitle"
      | "customIcon"
      | "customEmoji"
      | "hidden"
      | "defaultCollapsed"
    >
  >
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

  const updatedSection: BuiltInSectionConfig = {
    ...section,
    ...updates,
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

export async function updateBuiltInSectionAuto(
  sectionId: BuiltInSectionId,
  updates: Partial<
    Pick<
      BuiltInSectionConfig,
      | "customTitle"
      | "customIcon"
      | "customEmoji"
      | "hidden"
      | "defaultCollapsed"
    >
  >
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  return updateBuiltInSection(user.id, sectionId, updates);
}

// ============================================================================
// Custom Section CRUD
// ============================================================================

export async function createCustomSection(
  userId: string,
  section: Omit<CustomSectionConfig, "id" | "createdAt" | "sortOrder">
): Promise<{ error: string | null; sectionId?: string }> {
  const { data: currentPrefs, error: fetchError } =
    await getSidebarPreferencesV2(userId);

  if (fetchError) {
    return { error: fetchError };
  }

  const sectionId = crypto.randomUUID();
  const maxSortOrder = Math.max(
    ...Object.values(currentPrefs.sections).map((s) => s.sortOrder),
    -1
  );

  const newSection: CustomSectionConfig = {
    ...section,
    id: sectionId,
    type: "custom",
    sortOrder: maxSortOrder + 1,
    createdAt: new Date().toISOString(),
  };

  const updatedPrefs: SidebarPreferencesV2 = {
    ...currentPrefs,
    sections: {
      ...currentPrefs.sections,
      [sectionId]: newSection,
    },
    sectionOrder: [...currentPrefs.sectionOrder, sectionId],
  };

  const updateResult = await updateSidebarPreferencesV2(userId, updatedPrefs);

  if (updateResult.error) {
    return { error: updateResult.error };
  }

  return { error: null, sectionId };
}

export async function createCustomSectionAuto(
  section: Omit<CustomSectionConfig, "id" | "createdAt" | "sortOrder">
): Promise<{ error: string | null; sectionId?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  return createCustomSection(user.id, section);
}

export async function updateCustomSection(
  userId: string,
  sectionId: string,
  updates: Partial<
    Pick<
      CustomSectionConfig,
      | "title"
      | "icon"
      | "emoji"
      | "hidden"
      | "defaultCollapsed"
    >
  >
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

  const updatedSection: CustomSectionConfig = {
    ...section,
    ...updates,
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

export async function updateCustomSectionAuto(
  sectionId: string,
  updates: Partial<
    Pick<
      CustomSectionConfig,
      | "title"
      | "icon"
      | "emoji"
      | "hidden"
      | "defaultCollapsed"
    >
  >
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  return updateCustomSection(user.id, sectionId, updates);
}

export async function deleteCustomSection(
  userId: string,
  sectionId: string
): Promise<{ error: string | null }> {
  const { data: currentPrefs, error: fetchError } =
    await getSidebarPreferencesV2(userId);

  if (fetchError) {
    return { error: fetchError };
  }

  const section = currentPrefs.sections[sectionId];

  if (!section) {
    return { error: "Section not found" };
  }

  if (section.type !== "custom") {
    return { error: "Cannot delete built-in sections" };
  }

  // Remove from sections
  const { [sectionId]: removed, ...remainingSections } = currentPrefs.sections;

  // Remove from order
  const newSectionOrder = currentPrefs.sectionOrder.filter(
    (id) => id !== sectionId
  );

  const updatedPrefs: SidebarPreferencesV2 = {
    ...currentPrefs,
    sections: remainingSections,
    sectionOrder: newSectionOrder,
  };

  return updateSidebarPreferencesV2(userId, updatedPrefs);
}

export async function deleteCustomSectionAuto(
  sectionId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  return deleteCustomSection(user.id, sectionId);
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

// ============================================================================
// Bulk Operations
// ============================================================================

export async function resetSectionCustomization(
  userId: string
): Promise<{ error: string | null }> {
  const resetPrefs = structuredClone(DEFAULT_SIDEBAR_PREFERENCES_V2);
  return updateSidebarPreferencesV2(userId, resetPrefs);
}

export async function resetSectionCustomizationAuto(): Promise<{
  error: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  return resetSectionCustomization(user.id);
}
