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
        "w-full justify-start gap-3 h-10 px-3 relative",
        "transition-all duration-150",
        isIconOnly && "justify-center px-0",
        isActive && [
          "bg-primary/10 text-primary",
          "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2",
          "before:h-5 before:w-0.5 before:bg-primary before:rounded-r",
        ],
        !isActive && "text-muted-foreground hover:text-foreground hover:bg-accent"
      )}
    >
      <Link href={href} onClick={handleClick}>
        <Icon
          className={cn(
            "h-4 w-4 shrink-0 transition-colors",
            isActive && "text-primary"
          )}
        />
        {!isIconOnly && (
          <>
            <span className="flex-1 truncate text-sm font-medium">{label}</span>
            {badge !== undefined && (
              <span
                className={cn(
                  "ml-auto text-xs font-medium px-1.5 py-0.5 rounded-full",
                  isActive
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
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
            <PinOff className="mr-2 h-4 w-4" />
            Unpin from sidebar
          </ContextMenuItem>
        ) : (
          <ContextMenuItem onClick={handlePin}>
            <Pin className="mr-2 h-4 w-4" />
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
        <TooltipContent side="right" className="flex items-center gap-2">
          <span>{label}</span>
          {badge !== undefined && (
            <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">
              {badge}
            </span>
          )}
          {shortcut && (
            <kbd className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
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
        "w-full justify-start gap-3 h-10 px-3",
        "text-muted-foreground hover:text-foreground hover:bg-accent",
        "transition-all duration-150",
        isIconOnly && "justify-center px-0"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
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
        <TooltipContent side="right" className="flex items-center gap-2">
          <span>{label}</span>
          {shortcut && (
            <kbd className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {shortcut}
            </kbd>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}
