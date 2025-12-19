"use client";

import * as React from "react";
import type { User } from "@supabase/supabase-js";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useSidebar } from "./sidebar-context";
import { SidebarUserArea } from "./sidebar-user-area";
import { SidebarQuickNav } from "./sidebar-quick-nav";
import { SidebarMealPlan } from "./sidebar-meal-plan";
import { SidebarCollections } from "./sidebar-collections";
import { SidebarBottomNav } from "./sidebar-bottom-nav";
import type {
  FolderWithChildren,
  FolderCategoryWithFolders,
} from "@/types/folder";
import type { SystemSmartFolder } from "@/types/smart-folder";

interface MobileSidebarSheetProps {
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
  // Optional actions
  onSearchClick?: () => void;
  onNewRecipeClick?: () => void;
}

export function MobileSidebarSheet({
  user,
  logoutAction,
  categories,
  systemSmartFolders,
  userSmartFolders,
  totalRecipeCount,
  shoppingListCount,
  favoritesCount,
  onSearchClick,
  onNewRecipeClick,
}: MobileSidebarSheetProps) {
  const { isMobileOpen, openMobile, closeMobile } = useSidebar();

  return (
    <Sheet open={isMobileOpen} onOpenChange={(open) => (open ? openMobile() : closeMobile())}>
      <SheetContent
        side="left"
        className="w-[85vw] max-w-none p-0 flex flex-col"
        hideCloseButton
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation Menu</SheetTitle>
        </SheetHeader>

        <TooltipProvider delayDuration={0}>
          {/* User Area - Top (includes search icon) */}
          <SidebarUserArea
            user={user}
            logoutAction={logoutAction}
            onSearchClick={onSearchClick}
          />

          {/* Scrollable Content */}
          <ScrollArea className="flex-1">
            <div className="py-2 space-y-1">
              {/* Quick Navigation */}
              <SidebarQuickNav onNewRecipeClick={onNewRecipeClick} />

              {/* Meal Planning */}
              <SidebarMealPlan
                shoppingListCount={shoppingListCount}
                favoritesCount={favoritesCount}
              />

              {/* Collections / Folders */}
              <SidebarCollections
                categories={categories}
                systemSmartFolders={systemSmartFolders}
                userSmartFolders={userSmartFolders}
                totalRecipeCount={totalRecipeCount}
              />
            </div>
          </ScrollArea>

          {/* Bottom Navigation - Settings, Theme, Help */}
          <SidebarBottomNav />
        </TooltipProvider>
      </SheetContent>
    </Sheet>
  );
}

// Standalone trigger button for use in headers
export function MobileSidebarTrigger() {
  const { openMobile, isMobile } = useSidebar();

  if (!isMobile) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={openMobile}
      className="h-10 w-10"
      aria-label="Open navigation menu"
    >
      <Menu className="h-4 w-4" />
    </Button>
  );
}
