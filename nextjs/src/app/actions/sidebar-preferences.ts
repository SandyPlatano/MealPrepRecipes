"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  PinnedItem,
  SidebarMode,
  SidebarPreferences,
  UserPreferencesV2,
} from "@/types/user-preferences-v2";
import {
  DEFAULT_SIDEBAR_PREFERENCES,
  DEFAULT_USER_PREFERENCES_V2,
} from "@/types/user-preferences-v2";

// ============================================================================
// Get Sidebar Preferences
// ============================================================================

export async function getSidebarPreferences(
  userId: string
): Promise<{ error: string | null; data: SidebarPreferences }> {
  const supabase = await createClient();

  const { data: settings, error } = await supabase
    .from("user_settings")
    .select("preferences_v2")
    .eq("user_id", userId)
    .single();

  if (error || !settings?.preferences_v2) {
    return { error: null, data: DEFAULT_SIDEBAR_PREFERENCES };
  }

  const prefs = settings.preferences_v2 as Partial<UserPreferencesV2>;

  return {
    error: null,
    data: {
      ...DEFAULT_SIDEBAR_PREFERENCES,
      ...(prefs.sidebar || {}),
    },
  };
}

// Auto-authenticated version
export async function getSidebarPreferencesAuto(): Promise<{
  error: string | null;
  data: SidebarPreferences;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: DEFAULT_SIDEBAR_PREFERENCES };
  }

  return getSidebarPreferences(user.id);
}

// ============================================================================
// Update Sidebar Preferences
// ============================================================================

export async function updateSidebarPreferences(
  userId: string,
  preferences: Partial<SidebarPreferences>
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  // Get current preferences
  const { data: settings } = await supabase
    .from("user_settings")
    .select("preferences_v2")
    .eq("user_id", userId)
    .single();

  const currentPrefs = (settings?.preferences_v2 as Partial<UserPreferencesV2>) || {};

  const updatedPreferences = {
    ...currentPrefs,
    sidebar: {
      ...DEFAULT_SIDEBAR_PREFERENCES,
      ...(currentPrefs.sidebar || {}),
      ...preferences,
    },
  };

  const { error } = await supabase
    .from("user_settings")
    .upsert(
      { user_id: userId, preferences_v2: updatedPreferences },
      { onConflict: "user_id" }
    );

  if (error) {
    console.error("Error updating sidebar preferences:", error);
    return { error: "Failed to update sidebar preferences" };
  }

  revalidatePath("/app");
  return { error: null };
}

// Auto-authenticated version
export async function updateSidebarPreferencesAuto(
  preferences: Partial<SidebarPreferences>
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  return updateSidebarPreferences(user.id, preferences);
}

// ============================================================================
// Pin/Unpin Items
// ============================================================================

export async function pinSidebarItem(
  userId: string,
  item: Omit<PinnedItem, "addedAt">
): Promise<{ error: string | null }> {
  const { data: currentPrefs } = await getSidebarPreferences(userId);

  // Check if already pinned
  const alreadyPinned = currentPrefs.pinnedItems.some(
    (p) => p.id === item.id && p.type === item.type
  );

  if (alreadyPinned) {
    return { error: null }; // Already pinned, no-op
  }

  const newItem: PinnedItem = {
    ...item,
    addedAt: new Date().toISOString(),
  };

  return updateSidebarPreferences(userId, {
    pinnedItems: [...currentPrefs.pinnedItems, newItem],
  });
}

export async function pinSidebarItemAuto(
  item: Omit<PinnedItem, "addedAt">
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  return pinSidebarItem(user.id, item);
}

export async function unpinSidebarItem(
  userId: string,
  itemId: string
): Promise<{ error: string | null }> {
  const { data: currentPrefs } = await getSidebarPreferences(userId);

  const updatedPinnedItems = currentPrefs.pinnedItems.filter(
    (p) => p.id !== itemId
  );

  return updateSidebarPreferences(userId, {
    pinnedItems: updatedPinnedItems,
  });
}

export async function unpinSidebarItemAuto(
  itemId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  return unpinSidebarItem(user.id, itemId);
}

// ============================================================================
// Reorder Pinned Items
// ============================================================================

export async function reorderPinnedItems(
  userId: string,
  itemIds: string[]
): Promise<{ error: string | null }> {
  const { data: currentPrefs } = await getSidebarPreferences(userId);

  // Create a map for quick lookup
  const itemMap = new Map(currentPrefs.pinnedItems.map((item) => [item.id, item]));

  // Reorder based on new order, keeping only items that exist
  const reorderedItems = itemIds
    .map((id) => itemMap.get(id))
    .filter((item): item is PinnedItem => item !== undefined);

  return updateSidebarPreferences(userId, {
    pinnedItems: reorderedItems,
  });
}

export async function reorderPinnedItemsAuto(
  itemIds: string[]
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  return reorderPinnedItems(user.id, itemIds);
}

// ============================================================================
// Mode & Hover Settings
// ============================================================================

export async function setSidebarMode(
  userId: string,
  mode: SidebarMode
): Promise<{ error: string | null }> {
  return updateSidebarPreferences(userId, { mode });
}

export async function setSidebarModeAuto(
  mode: SidebarMode
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  return setSidebarMode(user.id, mode);
}

export async function setHoverExpand(
  userId: string,
  enabled: boolean
): Promise<{ error: string | null }> {
  return updateSidebarPreferences(userId, { hoverExpand: enabled });
}

export async function setHoverExpandAuto(
  enabled: boolean
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  return setHoverExpand(user.id, enabled);
}

// ============================================================================
// Width Persistence
// ============================================================================

export async function setSidebarWidth(
  userId: string,
  width: number
): Promise<{ error: string | null }> {
  return updateSidebarPreferences(userId, { width });
}

export async function setSidebarWidthAuto(
  width: number
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  return setSidebarWidth(user.id, width);
}
