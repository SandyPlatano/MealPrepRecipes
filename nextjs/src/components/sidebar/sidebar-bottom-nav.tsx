"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { Settings, HelpCircle, Moon, Sun, Monitor, PanelLeft, PanelLeftClose, ExternalLink, ChevronUp, ChevronDown } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useSidebar } from "./sidebar-context";

/**
 * Shared styling constants for consistent nav item appearance
 * Compact variant for bottom nav - reduced height for space efficiency
 */
const NAV_ITEM_CLASSES = {
  base: "w-full h-8 px-2.5 transition-all duration-150 flex items-center gap-2.5",
  inactive: "text-muted-foreground hover:text-foreground hover:bg-accent",
  iconOnly: "justify-center px-0",
  icon: "h-3.5 w-3.5 shrink-0",
  label: "flex-1 text-left truncate text-[13px] font-medium",
};

const STORAGE_KEY = "sidebar-bottom-nav-collapsed";

/**
 * Helper component for dropdown menu triggers styled as nav items.
 * Ensures visual consistency with SidebarNavItem.
 */
interface SidebarDropdownItemProps {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
}

function SidebarDropdownItem({
  icon: Icon,
  label,
  children,
  align = "start",
  side = "top",
}: SidebarDropdownItemProps) {
  const { isIconOnly } = useSidebar();

  // Use a div wrapper to ensure consistent left alignment regardless of Button defaults
  const trigger = (
    <Button
      variant="ghost"
      className={cn(
        "w-full h-8 px-2.5",
        NAV_ITEM_CLASSES.inactive,
        isIconOnly && "px-0"
      )}
    >
      <span
        className={cn(
          "flex items-center gap-2.5 w-full",
          isIconOnly && "justify-center"
        )}
      >
        <Icon className={NAV_ITEM_CLASSES.icon} />
        {!isIconOnly && <span className={NAV_ITEM_CLASSES.label}>{label}</span>}
      </span>
    </Button>
  );

  const dropdown = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        align={isIconOnly ? "center" : align}
        side={isIconOnly ? "right" : side}
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (isIconOnly) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{dropdown}</TooltipTrigger>
        <TooltipContent side="right">
          <span>{label}</span>
        </TooltipContent>
      </Tooltip>
    );
  }

  return dropdown;
}

export function SidebarBottomNav() {
  const { isIconOnly } = useSidebar();
  const [isCollapsed, setIsCollapsed] = React.useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY) === "true";
  });

  return (
    <div className="mt-auto border-t bg-muted/30 dark:bg-muted/10">
      <Collapsible open={!isCollapsed} onOpenChange={(open) => {
        setIsCollapsed(!open);
        localStorage.setItem(STORAGE_KEY, String(!open));
      }}>
        {/* Collapse toggle header */}
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "w-full h-7 px-2.5 flex items-center gap-2",
              "hover:bg-transparent",
              isIconOnly && "px-0 justify-center",
              // Orange styling when collapsed, muted when expanded
              isCollapsed
                ? "text-brand-coral hover:text-brand-coral"
                : "text-muted-foreground/60 hover:text-muted-foreground"
            )}
          >
            {/* Gear icon - always visible */}
            <Settings className="h-3 w-3 shrink-0" />

            {!isIconOnly && (
              <span className="text-[11px] uppercase tracking-wider font-medium flex-1 text-left">
                Settings
              </span>
            )}

            {/* Chevron indicator */}
            {isCollapsed ? (
              <ChevronUp className="h-3 w-3 shrink-0" />
            ) : (
              <ChevronDown className="h-3 w-3 shrink-0" />
            )}
          </Button>
        </CollapsibleTrigger>

        {/* Collapsible content - all items merged */}
        <CollapsibleContent>
          <div className="px-1.5 pb-1.5 space-y-0">
            <CompactSidebarNavItem
              href="/app/settings"
              icon={Settings}
              label="Settings"
            />
            <SidebarModeToggle />
            <ThemeToggle />
            <HelpButton />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

/**
 * Compact version of SidebarNavItem for bottom nav
 */
function CompactSidebarNavItem({ href, icon: Icon, label }: { href: string; icon: LucideIcon; label: string }) {
  const { isIconOnly } = useSidebar();

  const content = (
    <Button
      variant="ghost"
      className={cn(
        "w-full h-8 px-2.5",
        NAV_ITEM_CLASSES.inactive,
        isIconOnly && "px-0"
      )}
      asChild
    >
      <a
        href={href}
        className={cn(
          "flex items-center gap-2.5 w-full",
          isIconOnly && "justify-center"
        )}
      >
        <Icon className={NAV_ITEM_CLASSES.icon} />
        {!isIconOnly && <span className={NAV_ITEM_CLASSES.label}>{label}</span>}
      </a>
    </Button>
  );

  if (isIconOnly) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right">
          <span>{label}</span>
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}

function SidebarModeToggle() {
  const { mode, setMode } = useSidebar();
  const Icon = mode === "expanded" ? PanelLeft : PanelLeftClose;

  return (
    <SidebarDropdownItem icon={Icon} label="Sidebar">
      <DropdownMenuLabel>Sidebar Mode</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuRadioGroup value={mode} onValueChange={(v) => setMode(v as "expanded" | "collapsed")}>
        <DropdownMenuRadioItem value="expanded">
          <PanelLeft className="mr-2 h-4 w-4" />
          Expanded
        </DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="collapsed">
          <PanelLeftClose className="mr-2 h-4 w-4" />
          Collapsed
        </DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    </SidebarDropdownItem>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const currentTheme = theme || "system";
  const Icon = currentTheme === "dark" ? Moon : currentTheme === "light" ? Sun : Monitor;

  return (
    <SidebarDropdownItem icon={Icon} label="Theme">
      <DropdownMenuItem onClick={() => setTheme("light")}>
        <Sun className="h-4 w-4 mr-2" />
        Light
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setTheme("dark")}>
        <Moon className="h-4 w-4 mr-2" />
        Dark
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setTheme("system")}>
        <Monitor className="h-4 w-4 mr-2" />
        System
      </DropdownMenuItem>
    </SidebarDropdownItem>
  );
}

/**
 * Helper component for external link buttons styled as nav items.
 * Ensures visual consistency with SidebarNavItem.
 */
interface SidebarExternalLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
}

function SidebarExternalLink({ href, icon: Icon, label }: SidebarExternalLinkProps) {
  const { isIconOnly } = useSidebar();

  const content = (
    <Button
      variant="ghost"
      className={cn(
        "w-full h-8 px-2.5",
        NAV_ITEM_CLASSES.inactive,
        isIconOnly && "px-0"
      )}
      asChild
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "flex items-center gap-2.5 w-full",
          isIconOnly && "justify-center"
        )}
      >
        <Icon className={NAV_ITEM_CLASSES.icon} />
        {!isIconOnly && (
          <>
            <span className={NAV_ITEM_CLASSES.label}>{label}</span>
            <ExternalLink className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
          </>
        )}
      </a>
    </Button>
  );

  if (isIconOnly) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-1.5">
          <span>{label}</span>
          <ExternalLink className="h-3 w-3 text-muted-foreground" />
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}

function HelpButton() {
  return (
    <SidebarExternalLink
      href="https://docs.example.com"
      icon={HelpCircle}
      label="Help & Docs"
    />
  );
}
