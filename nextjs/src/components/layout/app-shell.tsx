"use client";

import * as React from "react";
import type { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
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

  // Desktop layout: sidebar + content (simple flex layout)
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar - fixed width, doesn't shrink */}
      <AppSidebar
        user={user}
        logoutAction={logoutAction}
        {...sidebarProps}
      />

      {/* Main Content - takes remaining space */}
      <main className="flex-1 min-w-0 h-screen overflow-y-auto">
        <div className="container mx-auto w-full px-4 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
