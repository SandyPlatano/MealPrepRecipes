"use client";

import * as React from "react";
import type { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import {
  SidebarProvider,
  useSidebar,
  AppSidebar,
  MobileSidebarSheet,
  MobileSidebarTrigger,
  SIDEBAR_DIMENSIONS,
  type AppSidebarProps,
} from "@/components/sidebar";
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

// Default panel sizes (percentages)
const DEFAULT_SIDEBAR_PERCENT = 18;
const MIN_SIDEBAR_PERCENT = 4;
const MAX_SIDEBAR_PERCENT = 28;

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
  const { isMobile, setWidth, isCollapsed } = useSidebar();
  const [mounted, setMounted] = React.useState(false);

  // Handle SSR - mount state
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const sidebarProps: Omit<AppSidebarProps, "user" | "logoutAction"> = {
    categories,
    systemSmartFolders,
    userSmartFolders,
    totalRecipeCount,
    shoppingListCount,
    favoritesCount,
  };

  // Handle resize events
  const handleLayout = React.useCallback((layout: { [panelId: string]: number }) => {
    if (layout["sidebar"] !== undefined && typeof window !== "undefined") {
      const newWidth = (layout["sidebar"] / 100) * window.innerWidth;
      setWidth(newWidth);
    }
  }, [setWidth]);

  // Show loading state during SSR/hydration
  if (!mounted) {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="w-[260px] border-r bg-muted/30 shrink-0" />
        <main className="flex-1">
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
          <div className="flex items-center h-14 px-4 gap-4">
            <MobileSidebarTrigger />
            <h1 className="font-semibold text-lg">MealPrep</h1>
          </div>
        </header>

        {/* Mobile Sheet */}
        <MobileSidebarSheet
          user={user}
          logoutAction={logoutAction}
          {...sidebarProps}
        />

        {/* Main Content */}
        <main className="flex-1">
          <div className="container mx-auto w-full px-4 py-8 pb-24">
            {children}
          </div>
        </main>
      </div>
    );
  }

  // Desktop layout: resizable sidebar + content
  return (
    <div className="flex min-h-screen bg-background">
      <ResizablePanelGroup
        direction="horizontal"
        className="min-h-screen"
        onLayoutChange={handleLayout}
      >
        {/* Sidebar Panel */}
        <ResizablePanel
          id="sidebar"
          defaultSize={isCollapsed ? MIN_SIDEBAR_PERCENT : DEFAULT_SIDEBAR_PERCENT}
          minSize={MIN_SIDEBAR_PERCENT}
          maxSize={MAX_SIDEBAR_PERCENT}
          collapsible
          collapsedSize={MIN_SIDEBAR_PERCENT}
          className="min-w-[60px]"
        >
          <AppSidebar
            user={user}
            logoutAction={logoutAction}
            {...sidebarProps}
          />
        </ResizablePanel>

        {/* Resize Handle */}
        <ResizableHandle
          withHandle
          className="w-1 bg-transparent hover:bg-primary/20 transition-colors"
        />

        {/* Main Content Panel */}
        <ResizablePanel
          id="main"
          defaultSize={100 - (isCollapsed ? MIN_SIDEBAR_PERCENT : DEFAULT_SIDEBAR_PERCENT)}
        >
          <main className="flex-1 h-full overflow-y-auto">
            <div className="container mx-auto w-full px-4 py-8">
              {children}
            </div>
          </main>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
