"use client";

import * as React from "react";
import type { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SidebarProvider,
  useSidebar,
  AppSidebar,
  MobileSidebarSheet,
  MobileSidebarTrigger,
  SidebarExpandTrigger,
  SIDEBAR_DIMENSIONS,
  type AppSidebarProps,
} from "@/components/sidebar";
import { MobileBottomNav } from "./mobile-bottom-nav";
import type {
  FolderWithChildren,
  FolderCategoryWithFolders,
} from "@/types/folder";
import type { SystemSmartFolder } from "@/types/smart-folder";

interface AppShellProps {
  children: React.ReactNode;
  user: User | null;
  logoutAction: () => Promise<void>;
  // Optional data for collections
  categories?: FolderCategoryWithFolders[];
  systemSmartFolders?: SystemSmartFolder[];
  userSmartFolders?: FolderWithChildren[];
  totalRecipeCount?: number;
  // Optional counts
  shoppingListCount?: number;
  favoritesCount?: number;
}

export function AppShell(props: AppShellProps) {
  return (
    <SidebarProvider>
      <AppShellContent {...props} />
    </SidebarProvider>
  );
}

function AppShellContent({
  children,
  user,
  logoutAction,
  categories,
  systemSmartFolders,
  userSmartFolders,
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

  const sidebarProps: Omit<AppSidebarProps, "user" | "logoutAction"> = {
    categories,
    systemSmartFolders,
    userSmartFolders,
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
        <div className="w-[260px] border-r bg-muted/30 shrink-0" />
        <main className="flex-1 min-w-0">
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
          {...sidebarProps}
        />

        {/* Main Content - padding accounts for bottom nav height */}
        <main className="flex-1">
          <div className="container mx-auto w-full px-4 py-8 pb-20">
            {children}
          </div>
        </main>

        {/* Bottom Tab Navigation */}
        <MobileBottomNav />
      </div>
    );
  }

  // Desktop layout: sidebar + content (simple flex layout)
  return (
    <div className="flex min-h-screen bg-background">
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
          onSearchClick={handleSearchClick}
          {...sidebarProps}
        />
      </div>

      {/* Floating expand button - appears when sidebar is collapsed */}
      <SidebarExpandTrigger />

      {/* Main Content - takes remaining space */}
      <main className="flex-1 min-w-0 h-screen overflow-y-auto">
        <div className="container mx-auto w-full px-4 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
