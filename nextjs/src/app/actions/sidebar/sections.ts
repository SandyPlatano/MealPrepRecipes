"use server";

import { createClient } from "@/lib/supabase/server";
import type {
  SidebarPreferencesV2,
  BuiltInSectionConfig,
  CustomSectionConfig,
  BuiltInSectionId,
} from "@/types/sidebar-customization";
import { DEFAULT_SIDEBAR_PREFERENCES_V2 } from "@/types/sidebar-customization";
import {
  getSidebarPreferencesV2,
  updateSidebarPreferencesV2,
} from "./helpers";

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
// Reset Operations
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
