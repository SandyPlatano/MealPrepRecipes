"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { Settings, HelpCircle, Moon, Sun, Monitor, PanelLeft, PanelLeftClose, ExternalLink } from "lucide-react";
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
import { SidebarNavItem } from "./sidebar-nav-item";
import { useSidebar } from "./sidebar-context";

/**
 * Shared styling constants for consistent nav item appearance
 */
const NAV_ITEM_CLASSES = {
  base: "w-full justify-start gap-3 h-10 px-3 transition-all duration-150",
  inactive: "text-muted-foreground hover:text-foreground hover:bg-accent",
  iconOnly: "justify-center px-0",
  icon: "h-4 w-4 shrink-0",
  label: "flex-1 truncate text-sm font-medium",
};

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

  const trigger = (
    <Button
      variant="ghost"
      className={cn(
        NAV_ITEM_CLASSES.base,
        NAV_ITEM_CLASSES.inactive,
        isIconOnly && NAV_ITEM_CLASSES.iconOnly
      )}
    >
      <Icon className={NAV_ITEM_CLASSES.icon} />
      {!isIconOnly && <span className={NAV_ITEM_CLASSES.label}>{label}</span>}
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
  return (
    <div className="mt-auto border-t bg-muted/30 dark:bg-muted/10">
      {/* Settings Group */}
      <div className="p-2 space-y-0.5">
        <SidebarNavItem
          href="/app/settings"
          icon={Settings}
          label="Settings"
          pinnableType="page"
          pinnableId="settings"
        />
        <SidebarModeToggle />
        <ThemeToggle />
      </div>

      {/* Subtle divider */}
      <div className="mx-3 h-px bg-border/50" />

      {/* Help - separated */}
      <div className="p-2">
        <HelpButton />
      </div>
    </div>
  );
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
        NAV_ITEM_CLASSES.base,
        NAV_ITEM_CLASSES.inactive,
        isIconOnly && NAV_ITEM_CLASSES.iconOnly
      )}
      asChild
    >
      <a href={href} target="_blank" rel="noopener noreferrer">
        <Icon className={NAV_ITEM_CLASSES.icon} />
        {!isIconOnly && (
          <>
            <span className={NAV_ITEM_CLASSES.label}>{label}</span>
            <ExternalLink className="h-3 w-3 text-muted-foreground" />
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
