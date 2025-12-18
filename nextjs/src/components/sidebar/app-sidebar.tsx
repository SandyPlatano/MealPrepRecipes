"use client";

import * as React from "react";
import type { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useSidebar, SIDEBAR_DIMENSIONS } from "./sidebar-context";
import { SidebarUserArea } from "./sidebar-user-area";
import { SidebarQuickNav } from "./sidebar-quick-nav";
import { SidebarPinned } from "./sidebar-pinned";
import { SidebarMealPlan } from "./sidebar-meal-plan";
import { SidebarCollections } from "./sidebar-collections";
import { SidebarBottomNav } from "./sidebar-bottom-nav";
import { SidebarDivider } from "./sidebar-section";
import { SidebarResizeHandle } from "./sidebar-resize-handle";
import type {
  FolderWithChildren,
  FolderCategoryWithFolders,
} from "@/types/folder";
import type { SystemSmartFolder } from "@/types/smart-folder";
import type { SectionConfig, CustomSectionConfig } from "@/types/sidebar-customization";
import { SidebarCustomSection } from "./sidebar-custom-section";

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
  const { width, isIconOnly, isCollapsed, getVisibleSections } = useSidebar();
  const visibleSections = getVisibleSections();

  // Calculate display width - simple toggle between collapsed and expanded
  const sidebarWidth = isCollapsed ? SIDEBAR_DIMENSIONS.MIN_WIDTH : width;

  // Helper function to render sections dynamically
  const renderSection = (section: SectionConfig, index: number) => {
    const key = section.id;
    const showDivider = index > 0;

    // Custom sections
    if (section.type === "custom") {
      return (
        <React.Fragment key={key}>
          {showDivider && <SidebarDivider />}
          <SidebarCustomSection section={section as CustomSectionConfig} />
        </React.Fragment>
      );
    }

    // Built-in sections - extract custom props if available
    const customLabel = section.type === "builtin" ? section.customTitle : null;
    const customIcon = section.type === "builtin" ? section.customIcon : null;
    const customEmoji = section.type === "builtin" ? section.customEmoji : null;

    switch (section.id) {
      case "quick-nav":
        return (
          <SidebarQuickNav
            key={key}
            onSearchClick={onSearchClick}
            onNewRecipeClick={onNewRecipeClick}
          />
        );
      case "pinned":
        return (
          <React.Fragment key={key}>
            {showDivider && <SidebarDivider />}
            <SidebarPinned />
          </React.Fragment>
        );
      case "meal-planning":
        return (
          <React.Fragment key={key}>
            {showDivider && <SidebarDivider />}
            <SidebarMealPlan
              shoppingListCount={shoppingListCount}
              favoritesCount={favoritesCount}
              customLabel={customLabel}
              customIcon={customIcon}
              customEmoji={customEmoji}
            />
          </React.Fragment>
        );
      case "collections":
        return (
          <React.Fragment key={key}>
            {showDivider && <SidebarDivider />}
            <SidebarCollections
              categories={categories}
              systemSmartFolders={systemSmartFolders}
              userSmartFolders={userSmartFolders}
              totalRecipeCount={totalRecipeCount}
              customLabel={customLabel}
              customIcon={customIcon}
              customEmoji={customEmoji}
            />
          </React.Fragment>
        );
      default:
        return null;
    }
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        role="navigation"
        aria-label="Main navigation"
        aria-expanded={!isCollapsed}
        className={cn(
          "relative flex flex-col h-screen bg-muted/30 border-r",
          "shrink-0 overflow-hidden sticky top-0"
        )}
        style={{ width: sidebarWidth }}
      >
        {/* User Area - Top */}
        <SidebarUserArea user={user} logoutAction={logoutAction} />

        {/* Scrollable Content */}
        <ScrollArea className="flex-1">
          <div className="py-2">
            {visibleSections.map((section, index) => renderSection(section, index))}
          </div>
        </ScrollArea>

        {/* Bottom Navigation - Settings, Theme, Help */}
        <SidebarBottomNav />

        {/* Resize Handle */}
        <SidebarResizeHandle />
      </aside>
    </TooltipProvider>
  );
}
