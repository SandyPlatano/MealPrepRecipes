"use client";

import * as React from "react";
import {
  getSidebarState,
  setSidebarWidth as setStorageWidth,
  setSidebarCollapsed as setStorageCollapsed,
  SIDEBAR_DIMENSIONS,
} from "@/lib/sidebar/sidebar-storage";

const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

export interface UseSidebarStateOptions {
  defaultWidth?: number;
  defaultCollapsed?: boolean;
}

export interface UseSidebarStateReturn {
  // State
  width: number;
  isCollapsed: boolean;
  isMobileOpen: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isInitialized: boolean;
  userExplicitlyExpandedRef: React.MutableRefObject<boolean>;

  // Actions
  setWidth: (width: number) => void;
  toggleCollapse: () => void;
  collapse: () => void;
  expand: () => void;
  openMobile: () => void;
  closeMobile: () => void;
  toggleMobile: () => void;

  // Derived
  isIconOnly: boolean;
}

/**
 * Hook for core sidebar state (width, collapsed, mobile).
 * Handles localStorage persistence, media queries, and keyboard shortcuts.
 */
export function useSidebarState({
  defaultWidth = SIDEBAR_DIMENSIONS.DEFAULT_WIDTH,
  defaultCollapsed = false,
}: UseSidebarStateOptions = {}): UseSidebarStateReturn {
  // Core state
  const [width, setWidthState] = React.useState(defaultWidth);
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [isTablet, setIsTablet] = React.useState(false);
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Track explicit user interaction to prevent auto-collapse from overriding
  const userExplicitlyExpandedRef = React.useRef(false);

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

    checkBreakpoints();
    window.addEventListener("resize", checkBreakpoints);
    return () => window.removeEventListener("resize", checkBreakpoints);
  }, []);

  // Auto-collapse on tablet if not explicitly expanded
  React.useEffect(() => {
    if (userExplicitlyExpandedRef.current) return;

    if (isTablet && !isCollapsed && isInitialized) {
      const stored = getSidebarState();
      if (!stored.isCollapsed && stored.width === SIDEBAR_DIMENSIONS.DEFAULT_WIDTH) {
        setIsCollapsed(true);
        setStorageCollapsed(true);
      }
    }
  }, [isTablet, isCollapsed, isInitialized]);

  // Close mobile sidebar on resize to desktop
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
            userExplicitlyExpandedRef.current = !newValue;
            setStorageCollapsed(newValue);
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
    setStorageWidth(clampedWidth);

    if (clampedWidth <= SIDEBAR_DIMENSIONS.COLLAPSE_THRESHOLD) {
      setIsCollapsed(true);
      setStorageCollapsed(true);
    } else if (clampedWidth > SIDEBAR_DIMENSIONS.COLLAPSE_THRESHOLD && isCollapsed) {
      setIsCollapsed(false);
      setStorageCollapsed(false);
    }
  }, [isCollapsed]);

  const toggleCollapse = React.useCallback(() => {
    setIsCollapsed((prev) => {
      const newValue = !prev;
      userExplicitlyExpandedRef.current = !newValue;
      setStorageCollapsed(newValue);
      return newValue;
    });
  }, []);

  const collapse = React.useCallback(() => {
    userExplicitlyExpandedRef.current = false;
    setIsCollapsed(true);
    setStorageCollapsed(true);
  }, []);

  const expand = React.useCallback(() => {
    userExplicitlyExpandedRef.current = true;
    setIsCollapsed(false);
    setStorageCollapsed(false);
  }, []);

  const openMobile = React.useCallback(() => setIsMobileOpen(true), []);
  const closeMobile = React.useCallback(() => setIsMobileOpen(false), []);
  const toggleMobile = React.useCallback(() => setIsMobileOpen((prev) => !prev), []);

  // Derived
  const isIconOnly = isCollapsed || width <= SIDEBAR_DIMENSIONS.MIN_WIDTH;

  return {
    width,
    isCollapsed,
    isMobileOpen,
    isMobile,
    isTablet,
    isInitialized,
    userExplicitlyExpandedRef,
    setWidth,
    toggleCollapse,
    collapse,
    expand,
    openMobile,
    closeMobile,
    toggleMobile,
    isIconOnly,
  };
}
