"use client";

import * as React from "react";
import type { User } from "@supabase/supabase-js";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useSidebar, SIDEBAR_DIMENSIONS } from "./sidebar-context";
import { SidebarUserArea } from "./sidebar-user-area";
import { SidebarQuickNav } from "./sidebar-quick-nav";
import { SidebarPinned } from "./sidebar-pinned";
import { SidebarMealPlan } from "./sidebar-meal-plan";
import { SidebarCollections } from "./sidebar-collections";
import { SidebarBottomNav } from "./sidebar-bottom-nav";
import { SidebarResizeHandle } from "./sidebar-resize-handle";
import type {
  FolderWithChildren,
  FolderCategoryWithFolders,
} from "@/types/folder";
import type { SystemSmartFolder } from "@/types/smart-folder";
import type { SectionConfig, CustomSectionConfig } from "@/types/sidebar-customization";
import { SidebarCustomSection } from "./sidebar-custom-section";
import { SidebarDivider } from "./sidebar-section";

export interface AppSidebarProps {
  user: User | null;
  logoutAction: () => Promise<void>;
  // Optional data for collections
  categories?: FolderCategoryWithFolders[];
  systemSmartFolders?: SystemSmartFolder[];
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
  const renderSection = (section: SectionConfig) => {
    const key = section.id;

    // Custom sections
    if (section.type === "custom") {
      return (
        <SidebarCustomSection key={key} section={section as CustomSectionConfig} />
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
            onNewRecipeClick={onNewRecipeClick}
          />
        );
      case "pinned":
        return <SidebarPinned key={key} />;
      case "meal-planning":
        return (
          <SidebarMealPlan
            key={key}
            shoppingListCount={shoppingListCount}
            favoritesCount={favoritesCount}
          />
        );
      case "collections":
        return (
          <SidebarCollections
            key={key}
            categories={categories}
            systemSmartFolders={systemSmartFolders}
            totalRecipeCount={totalRecipeCount}
          />
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
        {/* User Area - Top (includes collapse toggle) */}
        <SidebarUserArea
          user={user}
          logoutAction={logoutAction}
        />

        {/* Search - Prominent standalone button below user area */}
        {onSearchClick && (
          <div className="px-2 py-2 border-b">
            {isIconOnly ? (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onSearchClick}
                    className="w-full h-10 text-muted-foreground hover:text-foreground hover:bg-accent"
                  >
                    <Search className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="flex items-center gap-2">
                  <span>Search</span>
                  <kbd className="text-[10px] font-medium bg-muted px-1.5 py-0.5 rounded">/</kbd>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Button
                variant="outline"
                onClick={onSearchClick}
                className={cn(
                  "w-full justify-start gap-3 h-10",
                  "text-muted-foreground hover:text-foreground",
                  "bg-muted/50 hover:bg-muted border-border/50"
                )}
              >
                <Search className="size-4 shrink-0" />
                <span className="flex-1 text-left text-sm">Search...</span>
                <kbd className="ml-auto text-[10px] font-medium text-muted-foreground bg-background px-1.5 py-0.5 rounded border border-border/50">
                  /
                </kbd>
              </Button>
            )}
          </div>
        )}

        {/* Scrollable Content */}
        <ScrollArea className="flex-1">
          <div className="py-2">
            {visibleSections.map((section, index) => (
              <div key={section.id}>
                {/* Skip first divider - user area border-b provides separation */}
                {index > 1 && <SidebarDivider />}
                {renderSection(section)}
              </div>
            ))}
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
