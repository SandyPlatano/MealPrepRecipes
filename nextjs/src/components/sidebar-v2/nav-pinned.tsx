"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Pin, X, BookOpen, FolderOpen } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  useSidebar,
} from "@/components/ui/sidebar";

const PINNED_STORAGE_KEY = "sidebar_pinned_items";
const MAX_PINNED_ITEMS = 5;

export interface PinnedItem {
  id: string;
  type: "recipe" | "folder";
  name: string;
  href: string;
}

function getPinnedItems(): PinnedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(PINNED_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function savePinnedItems(items: PinnedItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PINNED_STORAGE_KEY, JSON.stringify(items));
}

export function usePinning() {
  const [pinnedItems, setPinnedItems] = React.useState<PinnedItem[]>([]);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    setPinnedItems(getPinnedItems());
  }, []);

  const pinItem = React.useCallback((item: PinnedItem) => {
    setPinnedItems((prev) => {
      if (prev.some((p) => p.id === item.id)) return prev;
      if (prev.length >= MAX_PINNED_ITEMS) return prev;
      const updated = [...prev, item];
      savePinnedItems(updated);
      return updated;
    });
  }, []);

  const unpinItem = React.useCallback((id: string) => {
    setPinnedItems((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      savePinnedItems(updated);
      return updated;
    });
  }, []);

  const isPinned = React.useCallback(
    (id: string) => pinnedItems.some((p) => p.id === id),
    [pinnedItems]
  );

  const canPin = pinnedItems.length < MAX_PINNED_ITEMS;

  return { pinnedItems, pinItem, unpinItem, isPinned, canPin, mounted };
}

export function NavPinned() {
  const pathname = usePathname();
  const { pinnedItems, unpinItem, mounted } = usePinning();
  const { isMobile, setOpenMobile } = useSidebar();

  const handleClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  if (!mounted || pinnedItems.length === 0) {
    return null;
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>
        <Pin className="h-3 w-3 mr-1" />
        Pinned
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {pinnedItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.type === "recipe" ? BookOpen : FolderOpen;

            return (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.name}
                >
                  <Link href={item.href} onClick={handleClick}>
                    <Icon className="h-4 w-4" />
                    <span className="truncate">{item.name}</span>
                  </Link>
                </SidebarMenuButton>
                <SidebarMenuAction
                  onClick={() => unpinItem(item.id)}
                  showOnHover
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Unpin {item.name}</span>
                </SidebarMenuAction>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
