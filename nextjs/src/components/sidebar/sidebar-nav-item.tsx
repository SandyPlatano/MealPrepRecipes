"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { Pin, PinOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useSidebar } from "./sidebar-context";
import type { PinnableItemType } from "@/types/user-preferences-v2";

interface SidebarNavItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  badge?: number | string;
  shortcut?: string;
  exactMatch?: boolean;
  onClick?: () => void;
  /** Emoji to display instead of icon (takes precedence) */
  emoji?: string | null;
  // For pinning support
  pinnableType?: PinnableItemType;
  pinnableId?: string;
}

export function SidebarNavItem({
  href,
  icon: Icon,
  label,
  badge,
  shortcut,
  exactMatch = false,
  onClick,
  emoji,
  pinnableType,
  pinnableId,
}: SidebarNavItemProps) {
  const pathname = usePathname();
  const { isIconOnly, closeMobile, isMobile, isPinned, pinItem, unpinItem } = useSidebar();

  // Determine if this item is active
  const isActive = exactMatch
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);

  const handleClick = () => {
    // Close mobile sidebar on navigation
    if (isMobile) {
      closeMobile();
    }
    onClick?.();
  };

  const canPin = pinnableType && pinnableId;
  const itemIsPinned = canPin ? isPinned(pinnableId) : false;

  const handlePin = async () => {
    if (!canPin) return;
    await pinItem({ type: pinnableType, id: pinnableId, name: label });
  };

  const handleUnpin = async () => {
    if (!pinnableId) return;
    await unpinItem(pinnableId);
  };

  const buttonContent = (
    <Button
      variant="ghost"
      asChild
      className={cn(
        "w-full justify-start gap-3 h-11 px-3 relative rounded-lg",
        "transition-all duration-150",
        isIconOnly && "justify-center px-0",
        // Warm sidebar theme with lime accents
        isActive && [
          "bg-[#D9F99D]/20 dark:bg-[#D9F99D]/10",
          "text-[#1A1A1A] dark:text-[#E2E8F0]",
          "font-semibold",
          "border border-transparent",
        ],
        !isActive && [
          "text-[var(--color-sidebar-text-muted)]",
          "hover:text-[var(--color-sidebar-text)]",
          "hover:bg-gray-100 dark:hover:bg-[var(--color-sidebar-surface)]/50",
          "border border-transparent",
        ]
      )}
    >
      <Link href={href} onClick={handleClick}>
        {emoji ? (
          <span className="text-base shrink-0 size-4 flex items-center justify-center">
            {emoji}
          </span>
        ) : (
          <Icon
            className={cn(
              "size-4 shrink-0 transition-colors",
              isActive && "text-[var(--color-sidebar-text)]"
            )}
          />
        )}
        {!isIconOnly && (
          <>
            <span className="flex-1 truncate text-sm font-medium">{label}</span>
            {badge !== undefined && (
              <span
                className={cn(
                  "ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full",
                  "bg-[#D9F99D] text-[#1A1A1A]"
                )}
              >
                {badge}
              </span>
            )}
            {shortcut && (
              <kbd className="ml-auto hidden lg:inline-flex text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {shortcut}
              </kbd>
            )}
          </>
        )}
      </Link>
    </Button>
  );

  // Context menu wrapper
  const contentWithContextMenu = canPin ? (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {buttonContent}
      </ContextMenuTrigger>
      <ContextMenuContent>
        {itemIsPinned ? (
          <ContextMenuItem onClick={handleUnpin}>
            <PinOff className="mr-2 size-4" />
            Unpin from sidebar
          </ContextMenuItem>
        ) : (
          <ContextMenuItem onClick={handlePin}>
            <Pin className="mr-2 size-4" />
            Pin to sidebar
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  ) : (
    buttonContent
  );

  // Wrap with tooltip when collapsed
  if (isIconOnly) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{contentWithContextMenu}</TooltipTrigger>
        <TooltipContent
          side="right"
          className="flex items-center gap-2 bg-[var(--color-sidebar-surface)] text-[var(--color-sidebar-text)] border-[var(--color-sidebar-border)]"
        >
          <span>{label}</span>
          {badge !== undefined && (
            <span className="text-xs font-bold bg-[#D9F99D] text-[#1A1A1A] px-1.5 py-0.5 rounded-full">
              {badge}
            </span>
          )}
          {shortcut && (
            <kbd className="text-[10px] font-medium text-[var(--color-sidebar-text-muted)] bg-[var(--color-sidebar-bg)] px-1.5 py-0.5 rounded border border-[var(--color-sidebar-border)]">
              {shortcut}
            </kbd>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  return contentWithContextMenu;
}

// Action button variant (not a link)
interface SidebarActionItemProps {
  icon: LucideIcon;
  label: string;
  shortcut?: string;
  onClick: () => void;
}

export function SidebarActionItem({
  icon: Icon,
  label,
  shortcut,
  onClick,
}: SidebarActionItemProps) {
  const { isIconOnly } = useSidebar();

  const content = (
    <Button
      variant="ghost"
      onClick={onClick}
      className={cn(
        "w-full justify-start gap-3 h-11 px-3 rounded-lg",
        // Warm sidebar theme
        "text-[var(--color-sidebar-text-muted)]",
        "hover:text-[var(--color-sidebar-text)]",
        "hover:bg-gray-100 dark:hover:bg-[var(--color-sidebar-surface)]/50",
        "border border-transparent",
        "transition-all duration-150",
        isIconOnly && "justify-center px-0"
      )}
    >
      <Icon className="size-4 shrink-0" />
      {!isIconOnly && (
        <>
          <span className="flex-1 truncate text-sm font-medium">{label}</span>
          {shortcut && (
            <kbd className="ml-auto hidden lg:inline-flex text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {shortcut}
            </kbd>
          )}
        </>
      )}
    </Button>
  );

  if (isIconOnly) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent
          side="right"
          className="flex items-center gap-2 bg-[var(--color-sidebar-surface)] text-[var(--color-sidebar-text)] border-[var(--color-sidebar-border)]"
        >
          <span>{label}</span>
          {shortcut && (
            <kbd className="text-[10px] font-medium text-[var(--color-sidebar-text-muted)] bg-[var(--color-sidebar-bg)] px-1.5 py-0.5 rounded border border-[var(--color-sidebar-border)]">
              {shortcut}
            </kbd>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}
