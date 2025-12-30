import * as React from "react";
import type { PinnedItem, SidebarMode } from "@/types/user-preferences-v2";
import { DEFAULT_SIDEBAR_PREFERENCES } from "@/types/user-preferences-v2";
import {
  updateSidebarPreferencesAuto,
  pinSidebarItemAuto,
  unpinSidebarItemAuto,
  reorderPinnedItemsAuto,
} from "@/app/actions/sidebar-preferences";
import { setSidebarCollapsed as setStorageCollapsed } from "@/lib/sidebar/sidebar-storage";

interface UseSidebarPinActionsProps {
  initialMode?: SidebarMode;
  initialPinnedItems?: PinnedItem[];
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

interface UseSidebarPinActionsReturn {
  mode: SidebarMode;
  pinnedItems: PinnedItem[];
  setModeState: React.Dispatch<React.SetStateAction<SidebarMode>>;
  setPinnedItems: React.Dispatch<React.SetStateAction<PinnedItem[]>>;
  setMode: (mode: SidebarMode) => Promise<void>;
  pinItem: (item: Omit<PinnedItem, "addedAt">) => Promise<void>;
  unpinItem: (itemId: string) => Promise<void>;
  reorderPinned: (itemIds: string[]) => Promise<void>;
  isPinned: (itemId: string) => boolean;
}

export function useSidebarPinActions({
  initialMode,
  initialPinnedItems,
  setIsCollapsed,
}: UseSidebarPinActionsProps): UseSidebarPinActionsReturn {
  const [mode, setModeState] = React.useState<SidebarMode>(
    initialMode || DEFAULT_SIDEBAR_PREFERENCES.mode
  );
  const [pinnedItems, setPinnedItems] = React.useState<PinnedItem[]>(
    initialPinnedItems || DEFAULT_SIDEBAR_PREFERENCES.pinnedItems
  );

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

  return {
    mode,
    pinnedItems,
    setModeState,
    setPinnedItems,
    setMode,
    pinItem,
    unpinItem,
    reorderPinned,
    isPinned,
  };
}
