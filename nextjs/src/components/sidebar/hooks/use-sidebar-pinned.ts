"use client";

import * as React from "react";
import type { PinnedItem, SidebarMode, SidebarPreferences } from "@/types/user-preferences-v2";
import { DEFAULT_SIDEBAR_PREFERENCES } from "@/types/user-preferences-v2";
import type { SidebarPreferencesV2 } from "@/types/sidebar-customization";
import { normalizeSidebarPreferences } from "@/lib/sidebar/sidebar-migration";
import {
  getSidebarPreferencesAuto,
  updateSidebarPreferencesAuto,
  pinSidebarItemAuto,
  unpinSidebarItemAuto,
  reorderPinnedItemsAuto,
} from "@/app/actions/sidebar-preferences";
import {
  setSidebarCollapsed as setStorageCollapsed,
} from "@/lib/sidebar/sidebar-storage";

export interface UseSidebarPinnedOptions {
  initialPreferences?: SidebarPreferences;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  onPreferencesLoaded?: (prefs: SidebarPreferencesV2) => void;
}

export interface UseSidebarPinnedReturn {
  mode: SidebarMode;
  pinnedItems: PinnedItem[];
  reducedMotion: boolean;
  isExpanded: boolean;
  setMode: (mode: SidebarMode) => Promise<void>;
  pinItem: (item: Omit<PinnedItem, "addedAt">) => Promise<void>;
  unpinItem: (itemId: string) => Promise<void>;
  reorderPinned: (itemIds: string[]) => Promise<void>;
  isPinned: (itemId: string) => boolean;
}

/**
 * Hook for synced sidebar preferences (mode, pinnedItems).
 * Handles server sync and optimistic updates.
 */
export function useSidebarPinned({
  initialPreferences,
  setIsCollapsed,
  onPreferencesLoaded,
}: UseSidebarPinnedOptions): UseSidebarPinnedReturn {
  const [mode, setModeState] = React.useState<SidebarMode>(
    initialPreferences?.mode || DEFAULT_SIDEBAR_PREFERENCES.mode
  );
  const [pinnedItems, setPinnedItems] = React.useState<PinnedItem[]>(
    initialPreferences?.pinnedItems || DEFAULT_SIDEBAR_PREFERENCES.pinnedItems
  );
  const [reducedMotion, setReducedMotion] = React.useState(false);

  // Fetch synced preferences on mount (if not provided initially)
  React.useEffect(() => {
    if (!initialPreferences) {
      getSidebarPreferencesAuto().then(({ data }) => {
        const normalized = normalizeSidebarPreferences(data as Partial<SidebarPreferencesV2>);

        setModeState(normalized.mode);
        setPinnedItems(normalized.pinnedItems);
        setReducedMotion(normalized.reducedMotion);

        onPreferencesLoaded?.(normalized);
      });
    }
  }, [initialPreferences, onPreferencesLoaded]);

  // Actions
  const setMode = React.useCallback(async (newMode: SidebarMode) => {
    setModeState(newMode);
    const shouldCollapse = newMode === "collapsed";
    setIsCollapsed(shouldCollapse);
    setStorageCollapsed(shouldCollapse);
    await updateSidebarPreferencesAuto({ mode: newMode });
  }, [setIsCollapsed]);

  const pinItem = React.useCallback(async (item: Omit<PinnedItem, "addedAt">) => {
    const newItem: PinnedItem = {
      ...item,
      addedAt: new Date().toISOString(),
    };
    setPinnedItems((prev) => [...prev, newItem]);
    await pinSidebarItemAuto(item);
  }, []);

  const unpinItem = React.useCallback(async (itemId: string) => {
    setPinnedItems((prev) => prev.filter((p) => p.id !== itemId));
    await unpinSidebarItemAuto(itemId);
  }, []);

  const reorderPinned = React.useCallback(async (itemIds: string[]) => {
    setPinnedItems((prev) => {
      const itemMap = new Map(prev.map((item) => [item.id, item]));
      return itemIds
        .map((id) => itemMap.get(id))
        .filter((item): item is PinnedItem => item !== undefined);
    });
    await reorderPinnedItemsAuto(itemIds);
  }, []);

  const isPinned = React.useCallback(
    (itemId: string) => pinnedItems.some((p) => p.id === itemId),
    [pinnedItems]
  );

  // Derived
  const isExpanded = mode === "expanded";

  return {
    mode,
    pinnedItems,
    reducedMotion,
    isExpanded,
    setMode,
    pinItem,
    unpinItem,
    reorderPinned,
    isPinned,
  };
}
