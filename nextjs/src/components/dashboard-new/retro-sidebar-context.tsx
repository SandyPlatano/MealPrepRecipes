"use client";

import * as React from "react";
import { createContext, useContext, useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "retro-sidebar-collapsed";
const MOBILE_BREAKPOINT = 768;

interface RetroSidebarContextValue {
  isCollapsed: boolean;
  isMobile: boolean;
  isMobileOpen: boolean;
  isIconOnly: boolean;
  toggleCollapse: () => void;
  collapse: () => void;
  expand: () => void;
  openMobile: () => void;
  closeMobile: () => void;
}

const RetroSidebarContext = createContext<RetroSidebarContextValue | null>(null);

export function useRetroSidebar() {
  const context = useContext(RetroSidebarContext);
  if (!context) {
    throw new Error("useRetroSidebar must be used within a RetroSidebarProvider");
  }
  return context;
}

interface RetroSidebarProviderProps {
  children: React.ReactNode;
  defaultCollapsed?: boolean;
}

export function RetroSidebarProvider({
  children,
  defaultCollapsed = false,
}: RetroSidebarProviderProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load saved state from localStorage
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  // Handle responsive breakpoints
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Keyboard shortcut to toggle (Cmd+\)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "\\") {
        e.preventDefault();
        toggleCollapse();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  const collapse = useCallback(() => {
    setIsCollapsed(true);
    localStorage.setItem(STORAGE_KEY, "true");
  }, []);

  const expand = useCallback(() => {
    setIsCollapsed(false);
    localStorage.setItem(STORAGE_KEY, "false");
  }, []);

  const openMobile = useCallback(() => setIsMobileOpen(true), []);
  const closeMobile = useCallback(() => setIsMobileOpen(false), []);

  // isIconOnly is true when collapsed (but not on mobile where we use a sheet)
  const isIconOnly = !isMobile && isCollapsed;

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <RetroSidebarContext.Provider
        value={{
          isCollapsed: defaultCollapsed,
          isMobile: false,
          isMobileOpen: false,
          isIconOnly: defaultCollapsed,
          toggleCollapse: () => {},
          collapse: () => {},
          expand: () => {},
          openMobile: () => {},
          closeMobile: () => {},
        }}
      >
        {children}
      </RetroSidebarContext.Provider>
    );
  }

  return (
    <RetroSidebarContext.Provider
      value={{
        isCollapsed,
        isMobile,
        isMobileOpen,
        isIconOnly,
        toggleCollapse,
        collapse,
        expand,
        openMobile,
        closeMobile,
      }}
    >
      {children}
    </RetroSidebarContext.Provider>
  );
}
