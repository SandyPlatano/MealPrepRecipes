"use client";

import { Button } from "@/components/ui/button";
import { SlidersHorizontal, PanelLeftClose, PanelLeft } from "lucide-react";

interface RecipeGridSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  activeFilterCount: number;
  children: React.ReactNode;
}

export function RecipeGridSidebar({
  collapsed,
  onToggleCollapse,
  activeFilterCount,
  children,
}: RecipeGridSidebarProps) {
  return (
    <aside className={`hidden lg:block transition-all duration-300 ${collapsed ? "w-12" : "w-72"} shrink-0`}>
      <div className="sticky top-4">
        {collapsed ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="w-10 h-10"
            title="Expand filters"
          >
            <PanelLeft className="h-5 w-5" />
          </Button>
        ) : (
          <div className="p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                    {activeFilterCount}
                  </span>
                )}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleCollapse}
                className="h-8 w-8"
                title="Collapse filters"
              >
                <PanelLeftClose className="h-4 w-4" />
              </Button>
            </div>
            {children}
          </div>
        )}
      </div>
    </aside>
  );
}
