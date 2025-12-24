"use client";

import { Home, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarNavItem, SidebarActionItem } from "./sidebar-nav-item";
import { useSidebar } from "./sidebar-context";

interface SidebarQuickNavProps {
  onSearchClick?: () => void;
  onNewRecipeClick?: () => void;
}

export function SidebarQuickNav({
  onSearchClick,
  onNewRecipeClick,
}: SidebarQuickNavProps) {
  const { isIconOnly } = useSidebar();

  return (
    <div className="px-2 flex flex-col gap-2">
      {/* Home & Search grouped together */}
      <div
        className={cn(
          "rounded-xl border border-primary/20 bg-primary/5",
          "flex flex-col gap-0.5 p-1.5",
          isIconOnly && "items-center p-2"
        )}
      >
        <SidebarNavItem
          href="/app"
          icon={Home}
          label="Home"
          exactMatch
          pinnableType="page"
          pinnableId="page-home"
        />
        {onSearchClick && (
          <SidebarActionItem
            icon={Search}
            label="Search"
            shortcut="/"
            onClick={onSearchClick}
          />
        )}
      </div>

      {/* New Recipe button - outside the grouped box */}
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
