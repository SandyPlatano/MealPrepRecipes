"use client";

import * as React from "react";
import {
  getSidebarState,
  setSidebarWidth,
  setSidebarCollapsed,
  SIDEBAR_DIMENSIONS,
} from "@/lib/sidebar/sidebar-storage";

// Media query breakpoints
const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

interface SidebarContextValue {
  // State
  width: number;
  isCollapsed: boolean;
  isMobileOpen: boolean;
  isMobile: boolean;
  isTablet: boolean;

  // Derived
  isIconOnly: boolean;

  // Actions
  setWidth: (width: number) => void;
  toggleCollapse: () => void;
  collapse: () => void;
  expand: () => void;
  openMobile: () => void;
  closeMobile: () => void;
  toggleMobile: () => void;
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

interface SidebarProviderProps {
  children: React.ReactNode;
  defaultWidth?: number;
  defaultCollapsed?: boolean;
}

export function SidebarProvider({
  children,
  defaultWidth = SIDEBAR_DIMENSIONS.DEFAULT_WIDTH,
  defaultCollapsed = false,
}: SidebarProviderProps) {
  // Initialize state from localStorage (client-side only)
  const [width, setWidthState] = React.useState(defaultWidth);
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [isTablet, setIsTablet] = React.useState(false);
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Initialize from localStorage on mount
  React.useEffect(() => {
    const stored = getSidebarState();
    setWidthState(stored.width);
    setIsCollapsed(stored.isCollapsed);
    setIsInitialized(true);
  }, []);

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
      setWidth,
      toggleCollapse,
      collapse,
      expand,
      openMobile,
      closeMobile,
      toggleMobile,
    }),
    [
      width,
      isCollapsed,
      isMobileOpen,
      isMobile,
      isTablet,
      isIconOnly,
      setWidth,
      toggleCollapse,
      collapse,
      expand,
      openMobile,
      closeMobile,
      toggleMobile,
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
