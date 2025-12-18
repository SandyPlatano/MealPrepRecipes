"use client";

import * as React from "react";
import {
  getSidebarState,
  setSidebarWidth as setStorageWidth,
  setSidebarCollapsed as setStorageCollapsed,
  SIDEBAR_DIMENSIONS,
} from "@/lib/sidebar/sidebar-storage";
import type { PinnedItem, SidebarMode, SidebarPreferences } from "@/types/user-preferences-v2";
import { DEFAULT_SIDEBAR_PREFERENCES } from "@/types/user-preferences-v2";
import {
  getSidebarPreferencesAuto,
  updateSidebarPreferencesAuto,
  pinSidebarItemAuto,
  unpinSidebarItemAuto,
  reorderPinnedItemsAuto,
} from "@/app/actions/sidebar-preferences";

// Media query breakpoints
const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

interface SidebarContextValue {
  // Core state
  width: number;
  isCollapsed: boolean;
  isMobileOpen: boolean;
  isMobile: boolean;
  isTablet: boolean;

  // Mode & hover (synced)
  mode: SidebarMode;
  hoverExpand: boolean;
  pinnedItems: PinnedItem[];

  // Hover state (local)
  isHovered: boolean;
  setIsHovered: (hovered: boolean) => void;

  // Derived
  isIconOnly: boolean;
  isExpanded: boolean; // True when showing full sidebar (mode=expanded OR hover-expanded)

  // Core actions
  setWidth: (width: number) => void;
  toggleCollapse: () => void;
  collapse: () => void;
  expand: () => void;
  openMobile: () => void;
  closeMobile: () => void;
  toggleMobile: () => void;

  // Synced actions
  setMode: (mode: SidebarMode) => Promise<void>;
  toggleHoverExpand: () => Promise<void>;
  pinItem: (item: Omit<PinnedItem, "addedAt">) => Promise<void>;
  unpinItem: (itemId: string) => Promise<void>;
  reorderPinned: (itemIds: string[]) => Promise<void>;
  isPinned: (itemId: string) => boolean;

  // Loading state
  isLoading: boolean;
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

interface SidebarProviderProps {
  children: React.ReactNode;
  defaultWidth?: number;
  defaultCollapsed?: boolean;
  initialPreferences?: SidebarPreferences;
}

export function SidebarProvider({
  children,
  defaultWidth = SIDEBAR_DIMENSIONS.DEFAULT_WIDTH,
  defaultCollapsed = false,
  initialPreferences,
}: SidebarProviderProps) {
  // Core state (localStorage-based for responsiveness)
  const [width, setWidthState] = React.useState(defaultWidth);
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [isTablet, setIsTablet] = React.useState(false);
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Synced preferences state
  const [mode, setModeState] = React.useState<SidebarMode>(
    initialPreferences?.mode || DEFAULT_SIDEBAR_PREFERENCES.mode
  );
  const [hoverExpand, setHoverExpandState] = React.useState(
    initialPreferences?.hoverExpand ?? DEFAULT_SIDEBAR_PREFERENCES.hoverExpand
  );
  const [pinnedItems, setPinnedItems] = React.useState<PinnedItem[]>(
    initialPreferences?.pinnedItems || DEFAULT_SIDEBAR_PREFERENCES.pinnedItems
  );

  // Hover state (local only)
  const [isHovered, setIsHovered] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Initialize from localStorage on mount
  React.useEffect(() => {
    const stored = getSidebarState();
    setWidthState(stored.width);
    setIsCollapsed(stored.isCollapsed);
    setIsInitialized(true);
  }, []);

  // Fetch synced preferences on mount (if not provided initially)
  React.useEffect(() => {
    if (!initialPreferences) {
      getSidebarPreferencesAuto().then(({ data }) => {
        setModeState(data.mode);
        setHoverExpandState(data.hoverExpand);
        setPinnedItems(data.pinnedItems);
        if (data.width) {
          setWidthState(data.width);
        }
      });
    }
  }, [initialPreferences]);

  // Media query listeners
  React.useEffect(() => {
    const checkBreakpoints = () => {
      const windowWidth = window.innerWidth;
      setIsMobile(windowWidth < MOBILE_BREAKPOINT);
      setIsTablet(windowWidth >= MOBILE_BREAKPOINT && windowWidth < TABLET_BREAKPOINT);
    };

    // Check immediately
    checkBreakpoints();

    // Listen for resize
    window.addEventListener("resize", checkBreakpoints);
    return () => window.removeEventListener("resize", checkBreakpoints);
  }, []);

  // Auto-collapse on tablet if not explicitly expanded
  React.useEffect(() => {
    if (isTablet && !isCollapsed && isInitialized) {
      // Only auto-collapse if user hasn't explicitly set state
      const stored = getSidebarState();
      if (!stored.isCollapsed && stored.width === SIDEBAR_DIMENSIONS.DEFAULT_WIDTH) {
        setIsCollapsed(true);
        setSidebarCollapsed(true);
      }
    }
  }, [isTablet, isCollapsed, isInitialized]);

  // Close mobile sidebar on route change or resize to desktop
  React.useEffect(() => {
    if (!isMobile && isMobileOpen) {
      setIsMobileOpen(false);
    }
  }, [isMobile, isMobileOpen]);

  // Keyboard shortcut: Cmd/Ctrl + \ to toggle sidebar
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "\\") {
        event.preventDefault();
        if (isMobile) {
          setIsMobileOpen((prev) => !prev);
        } else {
          setIsCollapsed((prev) => {
            const newValue = !prev;
            setSidebarCollapsed(newValue);
            return newValue;
          });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobile]);

  // Actions
  const setWidth = React.useCallback((newWidth: number) => {
    const clampedWidth = Math.max(
      SIDEBAR_DIMENSIONS.MIN_WIDTH,
      Math.min(SIDEBAR_DIMENSIONS.MAX_WIDTH, newWidth)
    );
    setWidthState(clampedWidth);
    setSidebarWidth(clampedWidth);

    // Auto-collapse if width drops below threshold
    if (clampedWidth <= SIDEBAR_DIMENSIONS.COLLAPSE_THRESHOLD) {
      setIsCollapsed(true);
      setSidebarCollapsed(true);
    } else if (clampedWidth > SIDEBAR_DIMENSIONS.COLLAPSE_THRESHOLD && isCollapsed) {
      // Auto-expand if width increases above threshold
      setIsCollapsed(false);
      setSidebarCollapsed(false);
    }
  }, [isCollapsed]);

  const toggleCollapse = React.useCallback(() => {
    setIsCollapsed((prev) => {
      const newValue = !prev;
      setSidebarCollapsed(newValue);
      return newValue;
    });
  }, []);

  const collapse = React.useCallback(() => {
    setIsCollapsed(true);
    setSidebarCollapsed(true);
  }, []);

  const expand = React.useCallback(() => {
    setIsCollapsed(false);
    setSidebarCollapsed(false);
  }, []);

  const openMobile = React.useCallback(() => {
    setIsMobileOpen(true);
  }, []);

  const closeMobile = React.useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  const toggleMobile = React.useCallback(() => {
    setIsMobileOpen((prev) => !prev);
  }, []);

  const toggleHoverExpand = React.useCallback(() => {
    setHoverExpand((prev) => !prev);
  }, []);

  // Pinning actions
  const pinItem = React.useCallback(async (item: Omit<PinnedItem, "addedAt">) => {
    const newItem: PinnedItem = {
      ...item,
      addedAt: new Date().toISOString(),
    };
    setPinnedItems((prev) => [...prev, newItem]);
    // TODO: Persist to database or localStorage
  }, []);

  const unpinItem = React.useCallback(async (id: string) => {
    setPinnedItems((prev) => prev.filter((item) => item.id !== id));
    // TODO: Persist to database or localStorage
  }, []);

  const isPinned = React.useCallback(
    (id: string) => {
      return pinnedItems.some((item) => item.id === id);
    },
    [pinnedItems]
  );

  // Derived state
  const isIconOnly = isCollapsed || width <= SIDEBAR_DIMENSIONS.MIN_WIDTH;

  const value = React.useMemo<SidebarContextValue>(
    () => ({
      width,
      isCollapsed,
      isMobileOpen,
      isMobile,
      isTablet,
      isIconOnly,
      mode,
      hoverExpand,
      isHovered,
      pinnedItems,
      setWidth,
      toggleCollapse,
      collapse,
      expand,
      openMobile,
      closeMobile,
      toggleMobile,
      setMode,
      toggleHoverExpand,
      setIsHovered,
      pinItem,
      unpinItem,
      isPinned,
    }),
    [
      width,
      isCollapsed,
      isMobileOpen,
      isMobile,
      isTablet,
      isIconOnly,
      mode,
      hoverExpand,
      isHovered,
      pinnedItems,
      setWidth,
      toggleCollapse,
      collapse,
      expand,
      openMobile,
      closeMobile,
      toggleMobile,
      toggleHoverExpand,
      pinItem,
      unpinItem,
      isPinned,
    ]
  );

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar(): SidebarContextValue {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

// Export dimensions for use in components
export { SIDEBAR_DIMENSIONS };
