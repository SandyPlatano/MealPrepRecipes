"use client";

import * as React from "react";
import Link from "next/link";
import { Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSidebar } from "./sidebar-context";

/**
 * Simple bottom nav with Settings and Log out
 * Matches the retro sidebar design
 */
export function SidebarBottomNav() {
  const { isIconOnly, closeMobile, isMobile } = useSidebar();

  const handleLogout = async () => {
    // Close mobile sidebar first if open
    if (isMobile) {
      closeMobile();
    }
    // Navigate to logout - the actual logout is handled by server action
    window.location.href = "/api/auth/logout";
  };

  return (
    <div className="pb-3 px-3 flex flex-col gap-1">
      {/* Settings */}
      <BottomNavItem
        href="/app/settings"
        icon={Settings}
        label="Settings"
        isIconOnly={isIconOnly}
      />

      {/* Log out */}
      <BottomNavAction
        icon={LogOut}
        label="Log out"
        onClick={handleLogout}
        isIconOnly={isIconOnly}
      />
    </div>
  );
}

interface BottomNavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  isIconOnly: boolean;
}

function BottomNavItem({ href, icon: Icon, label, isIconOnly }: BottomNavItemProps) {
  const content = (
    <Button
      variant="ghost"
      asChild
      className={cn(
        "w-full justify-start gap-3 h-10 px-3 rounded-lg",
        "text-[var(--color-sidebar-text-muted)]",
        "hover:text-[var(--color-sidebar-text)]",
        "hover:bg-[var(--color-sidebar-surface)]/50",
        "transition-all duration-150",
        isIconOnly && "justify-center px-0"
      )}
    >
      <Link href={href}>
        <Icon className="size-4 shrink-0" />
        {!isIconOnly && (
          <span className="text-sm font-medium">{label}</span>
        )}
      </Link>
    </Button>
  );

  if (isIconOnly) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent
          side="right"
          className="bg-[var(--color-sidebar-surface)] text-[var(--color-sidebar-text)] border-[var(--color-sidebar-border)]"
        >
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}

interface BottomNavActionProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  isIconOnly: boolean;
}

function BottomNavAction({ icon: Icon, label, onClick, isIconOnly }: BottomNavActionProps) {
  const content = (
    <Button
      variant="ghost"
      onClick={onClick}
      className={cn(
        "w-full justify-start gap-3 h-10 px-3 rounded-lg",
        "text-[var(--color-sidebar-text-muted)]",
        "hover:text-[var(--color-sidebar-text)]",
        "hover:bg-[var(--color-sidebar-surface)]/50",
        "transition-all duration-150",
        isIconOnly && "justify-center px-0"
      )}
    >
      <Icon className="size-4 shrink-0" />
      {!isIconOnly && (
        <span className="text-sm font-medium">{label}</span>
      )}
    </Button>
  );

  if (isIconOnly) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent
          side="right"
          className="bg-[var(--color-sidebar-surface)] text-[var(--color-sidebar-text)] border-[var(--color-sidebar-border)]"
        >
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}
