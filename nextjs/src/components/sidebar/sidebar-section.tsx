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

type SectionAccentColor = "coral" | "green" | "blue" | "purple" | "amber";

interface SidebarSectionProps {
  title: string;
  icon?: LucideIcon;
  emoji?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  action?: React.ReactNode;
  className?: string;
  /** Accent color for visual grouping (neurodivergent-friendly) */
  accentColor?: SectionAccentColor;
}

const accentColorClasses: Record<SectionAccentColor, { header: string; border: string }> = {
  coral: { header: "text-orange-500 dark:text-orange-400", border: "border-l-orange-500/50" },
  green: { header: "text-emerald-600 dark:text-emerald-400", border: "border-l-emerald-500/50" },
  blue: { header: "text-blue-600 dark:text-blue-400", border: "border-l-blue-500/50" },
  purple: { header: "text-purple-600 dark:text-purple-400", border: "border-l-purple-500/50" },
  amber: { header: "text-amber-600 dark:text-amber-400", border: "border-l-amber-500/50" },
};

export function SidebarSection({
  title,
  icon: Icon,
  emoji,
  children,
  defaultOpen = true,
  action,
  className,
  accentColor,
}: SidebarSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const { isIconOnly } = useSidebar();

  const accentClasses = accentColor ? accentColorClasses[accentColor] : null;

  // When collapsed to icon-only, show a tooltip with section title
  if (isIconOnly) {
    return (
      <div className={cn("flex flex-col gap-1", className)}>
        {(emoji || Icon) && (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <div className={cn(
                "flex items-center justify-center h-8",
                accentClasses?.header || "text-muted-foreground"
              )}>
                {emoji ? (
                  <span className="text-base">{emoji}</span>
                ) : Icon ? (
                  <Icon className="size-4" />
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
      className={cn(
        "flex flex-col gap-1",
        accentClasses && "border-l-2 ml-1",
        accentClasses?.border,
        className
      )}
    >
      <div className="flex items-center justify-between px-3 py-1">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 px-1.5 gap-1.5 text-xs font-semibold hover:text-foreground",
              accentClasses?.header || "text-muted-foreground"
            )}
          >
            <ChevronRight
              className={cn(
                "size-3.5 transition-transform duration-200",
                isOpen && "rotate-90"
              )}
            />
            {emoji ? (
              <span className="text-sm">{emoji}</span>
            ) : Icon ? (
              <Icon className="size-3.5" />
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
      <CollapsibleContent className="flex flex-col gap-0.5">
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
