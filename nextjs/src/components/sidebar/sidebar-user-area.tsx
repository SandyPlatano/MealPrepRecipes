"use client";

import * as React from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import {
  ChevronDown,
  LogOut,
  Settings,
  User as UserIcon,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSidebar } from "./sidebar-context";

interface SidebarUserAreaProps {
  user: User | null;
  logoutAction: () => Promise<void>;
}

export function SidebarUserArea({ user, logoutAction }: SidebarUserAreaProps) {
  const { isIconOnly, closeMobile, isMobile, isCollapsed, toggleCollapse } = useSidebar();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  // Get user display info
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const avatarUrl = user?.user_metadata?.avatar_url;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutAction();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleNavigation = () => {
    if (isMobile) {
      closeMobile();
    }
  };

  const avatar = (
    <Avatar className="h-8 w-8 shrink-0">
      <AvatarImage src={avatarUrl} alt={displayName} />
      <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
        {initials}
      </AvatarFallback>
    </Avatar>
  );

  // Collapsed view: avatar with dropdown only (expand toggle is below quick nav)
  if (isIconOnly) {
    return (
      <div className="p-2 border-b flex flex-col items-center gap-2">
        <DropdownMenu>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                  {avatar}
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="right">
              <span>{displayName}</span>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="start" side="right" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/app/settings/profile" onClick={handleNavigation}>
                <UserIcon className="h-4 w-4 mr-2" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/app/settings" onClick={handleNavigation}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {isLoggingOut ? "Logging out..." : "Log out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  // Expanded view: full user area with dropdown + collapse toggle
  return (
    <div className="p-3 border-b">
      <div className="flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex-1 justify-start gap-2 h-10 px-2 hover:bg-accent"
            >
              {avatar}
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium truncate">{displayName}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/app/settings/profile" onClick={handleNavigation}>
                <UserIcon className="h-4 w-4 mr-2" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/app/settings" onClick={handleNavigation}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {isLoggingOut ? "Logging out..." : "Log out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sidebar collapse toggle - only show on desktop */}
        {!isMobile && (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleCollapse}
                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
              >
                {isCollapsed ? (
                  <ChevronsRight className="h-4 w-4" />
                ) : (
                  <ChevronsLeft className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="flex items-center gap-2">
              <span>{isCollapsed ? "Expand" : "Collapse"} sidebar</span>
              <kbd className="text-[10px] font-medium bg-muted px-1.5 py-0.5 rounded">⌘\</kbd>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
