"use client";

import * as React from "react";
import type { User } from "@supabase/supabase-js";
import { Menu, Heart, Search } from "lucide-react";
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
import { SidebarNavItem } from "./sidebar-nav-item";
import { SidebarQuickNav } from "./sidebar-quick-nav";
import { SidebarCollections } from "./sidebar-collections";
import { SidebarBottomNav } from "./sidebar-bottom-nav";
import { RetroLogo } from "@/components/branding/retro-logo";
import type { FolderCategoryWithFolders } from "@/types/folder";
import type { SystemSmartFolder } from "@/types/smart-folder";

interface MobileSidebarSheetProps {
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

export function MobileSidebarSheet({
  user,
  logoutAction,
  categories,
  systemSmartFolders,
  totalRecipeCount,
  shoppingListCount: _shoppingListCount,
  favoritesCount,
  onSearchClick,
  onNewRecipeClick,
}: MobileSidebarSheetProps) {
  const { isMobileOpen, openMobile, closeMobile } = useSidebar();

  return (
    <Sheet open={isMobileOpen} onOpenChange={(open) => (open ? openMobile() : closeMobile())}>
      <SheetContent
        side="left"
        className="w-[85vw] max-w-none p-0 flex flex-col bg-[var(--color-sidebar-bg)] border-r border-[var(--color-sidebar-border)]"
        hideCloseButton
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation Menu</SheetTitle>
        </SheetHeader>

        <TooltipProvider delayDuration={0}>
          {/* Logo Area - Top */}
          <div className="flex items-center justify-between px-4 h-16 border-b border-[var(--color-sidebar-border)]">
            <RetroLogo size="md" />
            <div className="w-3 h-3 bg-[var(--color-brand-primary)] rounded-full border border-[var(--color-sidebar-text)]" />
          </div>

          {/* Search - Prominent standalone button below logo */}
          {onSearchClick && (
            <div className="px-3 py-3 border-b border-[var(--color-sidebar-border)]">
              <Button
                variant="outline"
                onClick={onSearchClick}
                className="w-full justify-start gap-3 h-11 text-[var(--color-sidebar-text-muted)] hover:text-[var(--color-sidebar-text)] bg-[var(--color-sidebar-surface)] hover:bg-[var(--color-sidebar-surface)]/80 border-[var(--color-sidebar-border)]"
              >
                <Search className="size-4" />
                <span className="flex-1 text-left text-sm">Search...</span>
                <kbd className="ml-auto text-[10px] font-medium text-[var(--color-sidebar-text-muted)] bg-[var(--color-sidebar-bg)] px-1.5 py-0.5 rounded border border-[var(--color-sidebar-border)]">
                  /
                </kbd>
              </Button>
            </div>
          )}

          {/* Section Label - GENERAL */}
          <div className="px-4 pt-4 pb-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[var(--color-sidebar-text-muted)]">
              General
            </span>
          </div>

          {/* Scrollable Content - Secondary navigation only */}
          {/* Primary nav (Plan, Recipes, Shop, Stats) is now in bottom tabs */}
          <ScrollArea className="flex-1">
            <div className="py-2 flex flex-col gap-1">
              {/* Quick Nav - Home, New Recipe */}
              <SidebarQuickNav
                onNewRecipeClick={onNewRecipeClick}
              />

              {/* Favorites - quick access to loved recipes */}
              <div className="px-3 py-2">
                <SidebarNavItem
                  href="/app/history"
                  icon={Heart}
                  label="Favorites"
                  badge={favoritesCount}
                />
              </div>

              {/* Collections / Folders - for organization */}
              <SidebarCollections
                categories={categories}
                systemSmartFolders={systemSmartFolders}
                totalRecipeCount={totalRecipeCount}
              />
            </div>
          </ScrollArea>

          {/* Section Label - TOOLS */}
          <div className="px-4 pt-2 pb-2 border-t border-[var(--color-sidebar-border)]">
            <span className="text-xs font-mono uppercase tracking-widest text-[var(--color-sidebar-text-muted)]">
              Tools
            </span>
          </div>

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
