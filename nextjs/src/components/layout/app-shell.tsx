"use client";

import * as React from "react";
import type { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { AppSidebar, type AppSidebarProps } from "@/components/sidebar-v2";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { TourProvider } from "@/contexts/tour-context";
import { TourSpotlight } from "@/components/tour";
import {
  QuickCartProvider,
  QuickCartHeaderIcon,
} from "@/components/quick-cart";
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
  categories?: FolderCategoryWithFolders[];
  systemSmartFolders?: SystemSmartFolder[];
  totalRecipeCount?: number;
  shoppingListCount?: number;
  favoritesCount?: number;
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
  const { isMobile } = useSidebar();

  // ⌘K / Ctrl+K keyboard shortcut to open search
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("keyboard:openSearch"));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <QuickCartProvider isMobile={isMobile}>
      <SkipLink />

      {/* Sidebar - shadcn handles mobile Sheet automatically */}
      <AppSidebar
        user={user}
        logoutAction={logoutAction}
        categories={categories}
        systemSmartFolders={systemSmartFolders}
        totalRecipeCount={totalRecipeCount}
        shoppingListCount={shoppingListCount}
        favoritesCount={favoritesCount}
      />

      {/* Main Content Area */}
      <SidebarInset className="bg-[#FFFCF6]">
        {/* Mobile Header */}
        {isMobile && (
          <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-between h-14 px-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <h1 className="font-semibold text-lg">MealPrep</h1>
              </div>
              <div className="flex items-center gap-1">
                <QuickCartHeaderIcon />
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
            </div>
          </header>
        )}

        {/* Desktop Header with Trigger */}
        {!isMobile && (
          <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
          </header>
        )}

        {/* Main Content */}
        <main
          id="main-content"
          className={cn(
            "flex-1 flex flex-col min-w-0 overflow-hidden",
            isMobile && "pb-[calc(56px+env(safe-area-inset-bottom,0px))]"
          )}
        >
          <div className="flex-1 flex flex-col w-full px-4 md:px-6 pt-4 pb-4 min-h-0">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        {isMobile && <MobileBottomNav />}

        {/* Onboarding Tour */}
        <TourSpotlight />
      </SidebarInset>
    </QuickCartProvider>
  );
}
