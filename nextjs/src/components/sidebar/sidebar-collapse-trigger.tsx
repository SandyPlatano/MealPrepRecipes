"use client";

import * as React from "react";
import { ChevronsLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSidebar } from "./sidebar-context";

/**
 * Collapse button that appears in the sidebar header.
 * Allows desktop users to collapse the sidebar to icon-only mode.
 * Keyboard shortcut: ⌘\ (Cmd+Backslash)
 */
export function SidebarCollapseTrigger() {
  const { collapse, isMobile, isCollapsed } = useSidebar();

  // Don't render on mobile or when already collapsed
  if (isMobile || isCollapsed) return null;

  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={collapse}
          className={cn(
            "h-7 w-7 rounded-md",
            "text-[var(--color-sidebar-text-muted)]",
            "hover:text-[var(--color-sidebar-text)]",
            "hover:bg-[var(--color-sidebar-hover)]",
            "transition-all duration-150"
          )}
          aria-label="Collapse sidebar"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="flex items-center gap-2">
        <span>Collapse sidebar</span>
        <kbd className="text-[10px] font-medium bg-muted px-1.5 py-0.5 rounded">
          ⌘\
        </kbd>
      </TooltipContent>
    </Tooltip>
  );
}
