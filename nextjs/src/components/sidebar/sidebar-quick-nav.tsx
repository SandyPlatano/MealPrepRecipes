"use client";

import { Home, Plus } from "lucide-react";
import { SidebarNavItem, SidebarActionItem } from "./sidebar-nav-item";

interface SidebarQuickNavProps {
  onSearchClick?: () => void; // Kept for backwards compatibility, but search is now in header
  onNewRecipeClick?: () => void;
}

export function SidebarQuickNav({
  onNewRecipeClick,
}: SidebarQuickNavProps) {
  return (
    <div className="px-2 flex flex-col gap-0.5">
      <SidebarNavItem
        href="/app"
        icon={Home}
        label="Home"
        exactMatch
        pinnableType="page"
        pinnableId="page-home"
      />
      {onNewRecipeClick && (
        <SidebarActionItem
          icon={Plus}
          label="New Recipe"
          shortcut="⌘N"
          onClick={onNewRecipeClick}
        />
      )}
    </div>
  );
}
