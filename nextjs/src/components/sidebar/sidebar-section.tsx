"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSidebar } from "./sidebar-context";

interface SidebarSectionProps {
  title: string;
  icon?: LucideIcon;
  emoji?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  action?: React.ReactNode;
  className?: string;
}

export function SidebarSection({
  title,
  icon: Icon,
  emoji,
  children,
  defaultOpen = true,
  action,
  className,
}: SidebarSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const { isIconOnly } = useSidebar();

  // When collapsed to icon-only, show a tooltip with section title
  if (isIconOnly) {
    return (
      <div className={cn("space-y-1", className)}>
        {(emoji || Icon) && (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <div className="flex items-center justify-center h-8 text-muted-foreground">
                {emoji ? (
                  <span className="text-base">{emoji}</span>
                ) : Icon ? (
                  <Icon className="h-4 w-4" />
                ) : null}
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <span>{title}</span>
            </TooltipContent>
          </Tooltip>
        )}
        {children}
      </div>
    );
  }

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn("space-y-1", className)}
    >
      <div className="flex items-center justify-between px-3 py-1">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-1 gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground uppercase tracking-wider"
          >
            <ChevronRight
              className={cn(
                "h-3 w-3 transition-transform duration-200",
                isOpen && "rotate-90"
              )}
            />
            {emoji ? (
              <span className="text-xs">{emoji}</span>
            ) : Icon ? (
              <Icon className="h-3 w-3" />
            ) : null}
            <span>{title}</span>
          </Button>
        </CollapsibleTrigger>
        {action && (
          <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
            {action}
          </div>
        )}
      </div>
      <CollapsibleContent className="space-y-0.5">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

// Simple divider section (no collapsible, just a label)
interface SidebarDividerProps {
  label?: string;
  className?: string;
}

export function SidebarDivider({ label, className }: SidebarDividerProps) {
  const { isIconOnly } = useSidebar();

  if (isIconOnly) {
    return <div className={cn("h-px bg-border my-2 mx-2", className)} />;
  }

  if (!label) {
    return <div className={cn("h-px bg-border my-2 mx-3", className)} />;
  }

  return (
    <div className={cn("flex items-center gap-2 px-3 py-2", className)}>
      <div className="h-px flex-1 bg-border" />
      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}
