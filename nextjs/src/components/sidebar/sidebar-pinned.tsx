"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  CalendarDays,
  UtensilsCrossed,
  ShoppingCart,
  Heart,
  Folder,
  Sparkles,
  Link as LinkIcon,
  PinOff,
} from "lucide-react";
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
import { SidebarSection } from "./sidebar-section";
import { useSidebar } from "./sidebar-context";
import type { PinnedItem, PinnableItemType } from "@/types/user-preferences-v2";

// Icon mapping for pinned items
const PINNED_ICONS: Record<PinnableItemType, React.ComponentType<{ className?: string }>> = {
  page: Home,
  recipe: UtensilsCrossed,
  folder: Folder,
  smart_folder: Sparkles,
  category: Folder,
  custom_link: LinkIcon,
};

// Page ID to href mapping
const PAGE_HREFS: Record<string, string> = {
  home: "/app",
  planner: "/app/planner",
  recipes: "/app/recipes",
  "shopping-list": "/app/shopping-list",
  favorites: "/app/favorites",
  stats: "/app/stats",
};

// Page ID to icon mapping
const PAGE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  home: Home,
  planner: CalendarDays,
  recipes: UtensilsCrossed,
  "shopping-list": ShoppingCart,
  favorites: Heart,
};

function getItemHref(item: PinnedItem): string {
  switch (item.type) {
    case "page":
      return PAGE_HREFS[item.id] || "/app";
    case "recipe":
      return `/app/recipes/${item.id}`;
    case "folder":
    case "smart_folder":
      return `/app/recipes?folder=${item.id}`;
    case "category":
      return `/app/recipes?category=${item.id}`;
    case "custom_link":
      return item.url || "#";
    default:
      return "/app";
  }
}

function getItemIcon(item: PinnedItem): React.ComponentType<{ className?: string }> {
  if (item.type === "page" && PAGE_ICONS[item.id]) {
    return PAGE_ICONS[item.id];
  }
  return PINNED_ICONS[item.type] || Home;
}

function getItemLabel(item: PinnedItem): string {
  if (item.name) return item.name;

  // Default labels for pages
  const pageLabels: Record<string, string> = {
    home: "Home",
    planner: "Planner",
    recipes: "Recipes",
    "shopping-list": "Shopping List",
    favorites: "Favorites",
    stats: "Stats",
  };

  if (item.type === "page" && pageLabels[item.id]) {
    return pageLabels[item.id];
  }

  return item.id;
}

interface PinnedItemRowProps {
  item: PinnedItem;
  onUnpin: () => void;
}

function PinnedItemRow({ item, onUnpin }: PinnedItemRowProps) {
  const pathname = usePathname();
  const { isIconOnly, closeMobile, isMobile } = useSidebar();

  const href = getItemHref(item);
  const Icon = getItemIcon(item);
  const label = getItemLabel(item);

  const isActive = pathname === href || pathname.startsWith(`${href}/`);
  const isExternalLink = item.type === "custom_link" && item.url?.startsWith("http");

  const handleClick = () => {
    if (isMobile) {
      closeMobile();
    }
  };

  const buttonContent = (
    <Button
      variant="ghost"
      asChild
      className={cn(
        "w-full justify-start gap-3 h-9 px-3 relative group",
        "transition-all duration-150",
        isIconOnly && "justify-center px-0",
        isActive && [
          "bg-primary/10 text-primary",
          "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2",
          "before:h-4 before:w-0.5 before:bg-primary before:rounded-r",
        ],
        !isActive && "text-muted-foreground hover:text-foreground hover:bg-accent"
      )}
    >
      <Link
        href={href}
        onClick={handleClick}
        target={isExternalLink ? "_blank" : undefined}
        rel={isExternalLink ? "noopener noreferrer" : undefined}
      >
        {item.emoji ? (
          <span className="text-sm shrink-0">{item.emoji}</span>
        ) : (
          <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-primary")} />
        )}
        {!isIconOnly && (
          <span className="flex-1 truncate text-sm font-medium">{label}</span>
        )}
      </Link>
    </Button>
  );

  const content = (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {buttonContent}
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={onUnpin}>
          <PinOff className="mr-2 h-4 w-4" />
          Unpin
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
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

export function SidebarPinned() {
  const { pinnedItems, unpinItem, isIconOnly } = useSidebar();

  if (pinnedItems.length === 0) {
    return null;
  }

  return (
    <SidebarSection
      title="Pinned"
      defaultExpanded
      collapsible={!isIconOnly}
    >
      <div className="space-y-0.5">
        {pinnedItems.map((item) => (
          <PinnedItemRow
            key={`${item.type}-${item.id}`}
            item={item}
            onUnpin={() => unpinItem(item.id)}
          />
        ))}
      </div>
    </SidebarSection>
  );
}
