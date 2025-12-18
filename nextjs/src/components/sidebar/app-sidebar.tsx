"use client";

import * as React from "react";
import type { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useSidebar, SIDEBAR_DIMENSIONS } from "./sidebar-context";
import { SidebarUserArea } from "./sidebar-user-area";
import { SidebarQuickNav } from "./sidebar-quick-nav";
import { SidebarMealPlan } from "./sidebar-meal-plan";
import { SidebarCollections } from "./sidebar-collections";
import { SidebarBottomNav } from "./sidebar-bottom-nav";
import { SidebarDivider } from "./sidebar-section";
import type {
  FolderWithChildren,
  FolderCategoryWithFolders,
} from "@/types/folder";
import type { SystemSmartFolder } from "@/types/smart-folder";

export interface AppSidebarProps {
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

export function AppSidebar({
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
}: AppSidebarProps) {
  const { width, isIconOnly, isCollapsed } = useSidebar();

  // Calculate actual width
  const sidebarWidth = isCollapsed
    ? SIDEBAR_DIMENSIONS.MIN_WIDTH
    : width;

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        role="navigation"
        aria-label="Main navigation"
        aria-expanded={!isCollapsed}
        className={cn(
          "flex flex-col h-screen bg-muted/30 border-r",
          "transition-[width] duration-200 ease-out",
          "shrink-0 overflow-hidden sticky top-0"
        )}
        style={{ width: sidebarWidth }}
      >
        {/* User Area - Top */}
        <SidebarUserArea user={user} logoutAction={logoutAction} />

        {/* Scrollable Content */}
        <ScrollArea className="flex-1">
          <div className="py-2">
            {/* Quick Navigation */}
            <SidebarQuickNav
              onSearchClick={onSearchClick}
              onNewRecipeClick={onNewRecipeClick}
            />

            <SidebarDivider />

            {/* Meal Planning */}
            <SidebarMealPlan
              shoppingListCount={shoppingListCount}
              favoritesCount={favoritesCount}
            />

            <SidebarDivider />

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
      </aside>
    </TooltipProvider>
  );
}
