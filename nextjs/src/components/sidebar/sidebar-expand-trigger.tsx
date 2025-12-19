"use client";

import * as React from "react";
import { ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSidebar } from "./sidebar-context";

/**
 * Floating expand button that appears when sidebar is collapsed.
 * Inspired by Tally.so's sidebar UX - minimal, unobtrusive trigger
 * positioned at the top-left edge of the viewport.
 */
export function SidebarExpandTrigger() {
  const { isCollapsed, expand, isMobile } = useSidebar();

  // Don't render on mobile (uses sheet) or when sidebar is expanded
  if (isMobile || !isCollapsed) return null;

  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          onClick={expand}
          className={cn(
            "fixed top-3 left-3 z-50",
            "h-8 w-8 rounded-md",
            "bg-background/80 backdrop-blur-sm",
            "border-border/50 shadow-sm",
            "hover:bg-accent hover:scale-105",
            "transition-all duration-150",
            "animate-in fade-in-0 slide-in-from-left-2 duration-200"
          )}
          aria-label="Open sidebar"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right" className="flex items-center gap-2">
        <span>Open sidebar</span>
        <kbd className="text-[10px] font-medium bg-muted px-1.5 py-0.5 rounded">
          ⌘\
        </kbd>
      </TooltipContent>
    </Tooltip>
  );
}
