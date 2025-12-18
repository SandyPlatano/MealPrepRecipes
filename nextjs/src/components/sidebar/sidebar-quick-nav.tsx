"use client";

import { Home, Search, Plus } from "lucide-react";
import { SidebarNavItem, SidebarActionItem } from "./sidebar-nav-item";

interface SidebarQuickNavProps {
  onSearchClick?: () => void;
  onNewRecipeClick?: () => void;
}

export function SidebarQuickNav({
  onSearchClick,
  onNewRecipeClick,
}: SidebarQuickNavProps) {
  return (
    <div className="px-2 py-2 space-y-0.5">
      <SidebarNavItem
        href="/app"
        icon={Home}
        label="Home"
        exactMatch
      />
      {onSearchClick && (
        <SidebarActionItem
          icon={Search}
          label="Search"
          shortcut="/"
          onClick={onSearchClick}
        />
      )}
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
