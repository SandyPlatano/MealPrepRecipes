"use client";

import * as React from "react";
import type { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useSidebar, SIDEBAR_DIMENSIONS } from "./sidebar-context";
import { SidebarQuickNav } from "./sidebar-quick-nav";
import { SidebarPinned } from "./sidebar-pinned";
import { SidebarMealPlan } from "./sidebar-meal-plan";
import { SidebarCollections } from "./sidebar-collections";
import { SidebarBottomNav } from "./sidebar-bottom-nav";
import { SidebarResizeHandle } from "./sidebar-resize-handle";
import { Logo } from "@/components/branding/logo";
import { MaterialIcon } from "@/components/ui/material-icon";
import type {
  FolderCategoryWithFolders,
} from "@/types/folder";
import type { SystemSmartFolder } from "@/types/smart-folder";
import type { SectionConfig, CustomSectionConfig } from "@/types/sidebar-customization";
import { SidebarCustomSection } from "./sidebar-custom-section";
import { SidebarDivider } from "./sidebar-section";
import { SidebarProfileAvatar } from "./sidebar-profile-avatar";
import { SidebarSearchBar } from "./sidebar-search-bar";
import { SidebarCollapseTrigger } from "./sidebar-collapse-trigger";

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
          "relative flex flex-col h-screen",
          "shrink-0 overflow-hidden sticky top-0",
          // Always-dark sidebar styling
          "bg-[var(--color-sidebar-bg)]",
          "border-r border-[var(--color-sidebar-border)]"
        )}
        style={{ width: sidebarWidth }}
      >
        {/* Logo Area - Top */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-[var(--color-sidebar-border)]">
          {!isIconOnly ? (
            <Logo size="md" />
          ) : (
            <div className="w-full flex justify-center">
              <SidebarProfileAvatar user={user} isIconOnly />
            </div>
          )}
          {!isIconOnly && (
            <div className="flex items-center gap-2">
              <SidebarProfileAvatar user={user} />
              <SidebarCollapseTrigger />
            </div>
          )}
        </div>

        {/* Search Bar */}
        <SidebarSearchBar isIconOnly={isIconOnly} />

        {/* Section Label - GENERAL */}
        {!isIconOnly && (
          <div className="px-4 pt-4 pb-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[var(--color-sidebar-text-muted)]">
              General
            </span>
          </div>
        )}

        {/* Scrollable Content */}
        <ScrollArea className="flex-1">
          <div className={cn("py-2", isIconOnly && "pt-4")}>
            {visibleSections.map((section, index) => (
              <div key={section.id}>
                {index > 1 && !isIconOnly && <SidebarDivider className="border-[var(--color-sidebar-border)]" />}
                {renderSection(section)}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Section Label - TOOLS */}
        {!isIconOnly && (
          <div className="px-4 pt-2 pb-2 border-t border-[var(--color-sidebar-border)]">
            <span className="text-xs font-mono uppercase tracking-widest text-[var(--color-sidebar-text-muted)]">
              Tools
            </span>
          </div>
        )}

        {/* Bottom Navigation - Settings, Log out */}
        <SidebarBottomNav />

        {/* Resize Handle */}
        <SidebarResizeHandle />
      </aside>
    </TooltipProvider>
  );
}
