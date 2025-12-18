"use client";

import * as React from "react";
import { Settings, HelpCircle, Moon, Sun, Monitor, PanelLeft, PanelLeftClose } from "lucide-react";
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

export function SidebarBottomNav() {
  const { isIconOnly } = useSidebar();

  return (
    <div className="mt-auto border-t p-2 space-y-0.5">
      <SidebarNavItem
        href="/app/settings"
        icon={Settings}
        label="Settings"
        pinnableType="page"
        pinnableId="settings"
      />
      <SidebarModeToggle />
      <ThemeToggle />
      {!isIconOnly && (
        <HelpButton />
      )}
    </div>
  );
}

function SidebarModeToggle() {
  const { mode, setMode, isIconOnly } = useSidebar();
  const Icon = mode === "expanded" ? PanelLeft : PanelLeftClose;

  const content = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 h-10 px-3",
            "text-muted-foreground hover:text-foreground hover:bg-accent",
            isIconOnly && "justify-center px-0"
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          {!isIconOnly && (
            <span className="flex-1 truncate text-sm font-medium">Sidebar</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isIconOnly ? "center" : "start"} side={isIconOnly ? "right" : "top"} className="w-56">
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
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (isIconOnly) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right">
          <span>Sidebar: {mode}</span>
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { isIconOnly } = useSidebar();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const currentTheme = theme || "system";
  const Icon = currentTheme === "dark" ? Moon : currentTheme === "light" ? Sun : Monitor;

  const content = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 h-10 px-3",
            "text-muted-foreground hover:text-foreground hover:bg-accent",
            "transition-all duration-150",
            isIconOnly && "justify-center px-0"
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          {!isIconOnly && (
            <span className="flex-1 truncate text-sm font-medium">Theme</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isIconOnly ? "center" : "start"} side={isIconOnly ? "right" : "top"}>
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
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (isIconOnly) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right">
          <span>Theme: {currentTheme}</span>
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}

function HelpButton() {
  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-3 h-10 px-3",
        "text-muted-foreground hover:text-foreground hover:bg-accent",
        "transition-all duration-150"
      )}
      asChild
    >
      <a
        href="https://docs.example.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        <HelpCircle className="h-4 w-4 shrink-0" />
        <span className="flex-1 truncate text-sm font-medium">Help & Docs</span>
      </a>
    </Button>
  );
}
