"use client";

import * as React from "react";
import type { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
import { Search, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  SidebarProvider,
  useSidebar,
  AppSidebar,
  MobileSidebarSheet,
  MobileSidebarTrigger,
  SIDEBAR_DIMENSIONS,
  type AppSidebarProps,
} from "@/components/sidebar";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { CommandPalette } from "@/components/command-palette";
import { TourProvider } from "@/contexts/tour-context";
import { TourSpotlight } from "@/components/tour";
import type { FolderCategoryWithFolders } from "@/types/folder";
import type { SystemSmartFolder } from "@/types/smart-folder";

// Skip link for keyboard/screen reader users to bypass navigation
function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:border focus:rounded-md focus:shadow-lg"
    >
      Skip to main content
    </a>
  );
}

interface AppShellProps {
  children: React.ReactNode;
  user: User | null;
  logoutAction: () => Promise<void>;
  // Optional data for collections
  categories?: FolderCategoryWithFolders[];
  systemSmartFolders?: SystemSmartFolder[];
  totalRecipeCount?: number;
  // Optional counts
  shoppingListCount?: number;
  favoritesCount?: number;
}

// Floating expand button that appears when sidebar is fully collapsed
function SidebarExpandButton() {
  const { expand } = useSidebar();

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={expand}
            className={cn(
              "fixed top-3 left-3 z-50",
              "h-9 w-9 rounded-lg",
              "bg-background/90 backdrop-blur-sm",
              "border-border shadow-md",
              "hover:bg-accent hover:scale-105",
              "transition-all duration-150",
              "animate-in fade-in-0 slide-in-from-left-2 duration-200"
            )}
            aria-label="Expand sidebar"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-2">
          <span>Expand sidebar</span>
          <kbd className="text-[10px] font-medium bg-muted px-1.5 py-0.5 rounded">⌘\</kbd>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function AppShell(props: AppShellProps) {
  return (
    <TourProvider>
      <SidebarProvider>
        <AppShellContent {...props} />
      </SidebarProvider>
    </TourProvider>
  );
}

function AppShellContent({
  children,
  user,
  logoutAction,
  categories,
  systemSmartFolders,
  totalRecipeCount,
  shoppingListCount,
  favoritesCount,
}: AppShellProps) {
  const { isMobile, isCollapsed, width } = useSidebar();
  const [mounted, setMounted] = React.useState(false);

  // Handle SSR - mount state
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // IMPORTANT: All hooks must be called before any conditional returns
  // Handler to open global search modal (used by desktop layout)
  const handleSearchClick = React.useCallback(() => {
    window.dispatchEvent(new CustomEvent("keyboard:openSearch"));
  }, []);

  // ⌘K / Ctrl+K keyboard shortcut to open command palette
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        handleSearchClick();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSearchClick]);

  const sidebarProps: Omit<AppSidebarProps, "user" | "logoutAction"> = {
    categories,
    systemSmartFolders,
    totalRecipeCount,
    shoppingListCount,
    favoritesCount,
  };

  // Calculate sidebar width
  const sidebarWidth = isCollapsed ? SIDEBAR_DIMENSIONS.MIN_WIDTH : width;

  // Show loading state during SSR/hydration
  if (!mounted) {
    return (
      <div className="flex min-h-screen bg-background">
        <SkipLink />
        <div className="w-[260px] border-r bg-muted/30 shrink-0" />
        <main id="main-content" className="flex-1 min-w-0">
          <div className="container mx-auto w-full px-4 py-8">
            {children}
          </div>
        </main>
      </div>
    );
  }

  // Mobile layout: just content with mobile sheet
  if (isMobile) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <SkipLink />
        {/* Mobile Header */}
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between h-14 px-4">
            <div className="flex items-center gap-4">
              <MobileSidebarTrigger />
              <h1 className="font-semibold text-lg">MealPrep</h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                window.dispatchEvent(new CustomEvent("keyboard:openSearch"));
              }}
              className="h-9 w-9"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Mobile Sheet */}
        <MobileSidebarSheet
          user={user}
          logoutAction={logoutAction}
          onSearchClick={handleSearchClick}
          {...sidebarProps}
        />

        {/* Main Content - padding accounts for bottom nav height + safe area */}
        <main id="main-content" className="flex-1 pb-[calc(56px+env(safe-area-inset-bottom,0px))]">
          <div className="container mx-auto w-full px-4 py-8">
            {children}
          </div>
        </main>

        {/* Bottom Tab Navigation */}
        <MobileBottomNav />

        {/* Command Palette */}
        <CommandPalette />

        {/* Onboarding Tour */}
        <TourSpotlight />
      </div>
    );
  }

  // Desktop layout: sidebar + content (no header - search and profile are in sidebar)
  // When collapsed, fully hide sidebar (width 0) and show floating expand button
  return (
    <div className="flex min-h-screen bg-[#FFFCF6]">
      <SkipLink />
      {/* Sidebar wrapper with collapse animation */}
      <div
        className={cn(
          "shrink-0 overflow-hidden",
          "transition-[width] duration-200 ease-out"
        )}
        style={{ width: isCollapsed ? 0 : sidebarWidth }}
      >
        <AppSidebar
          user={user}
          logoutAction={logoutAction}
          {...sidebarProps}
        />
      </div>

      {/* Floating expand button - appears when sidebar is fully collapsed */}
      {isCollapsed && <SidebarExpandButton />}

      {/* Main content area - no header, search and profile are in sidebar */}
      <main id="main-content" className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 flex flex-col w-full px-4 md:px-6 pt-4 pb-4 min-h-0">
          {children}
        </div>
      </main>

      {/* Command Palette */}
      <CommandPalette />

      {/* Onboarding Tour */}
      <TourSpotlight />
    </div>
  );
}
