"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Calendar,
  ShoppingCart,
  BookOpen,
  Heart,
  BarChart3,
  Plus,
} from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  dataTour?: string;
}

interface NavMainProps {
  shoppingListCount?: number;
  favoritesCount?: number;
}

export function NavMain({ shoppingListCount, favoritesCount }: NavMainProps) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      title: "Home",
      href: "/app",
      icon: Home,
    },
    {
      title: "Plan",
      href: "/app/plan",
      icon: Calendar,
      dataTour: "planner-nav",
    },
    {
      title: "Shopping List",
      href: "/app/shop",
      icon: ShoppingCart,
      badge: shoppingListCount,
      dataTour: "shopping-nav",
    },
    {
      title: "Recipes",
      href: "/app/recipes",
      icon: BookOpen,
      dataTour: "recipes-nav",
    },
    {
      title: "Favorites",
      href: "/app/history",
      icon: Heart,
      badge: favoritesCount,
    },
    {
      title: "Stats",
      href: "/app/stats",
      icon: BarChart3,
    },
  ];

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Navigation</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {/* Navigation Items */}
          {navItems.map((item) => {
            const isActive =
              item.href === "/app"
                ? pathname === "/app"
                : pathname.startsWith(item.href);

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.title}
                  data-tour={item.dataTour}
                >
                  <Link href={item.href}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
                {item.badge !== undefined && item.badge > 0 && (
                  <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                )}
              </SidebarMenuItem>
            );
          })}

          {/* New Recipe Action - at the bottom */}
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="New Recipe">
              <Link href="/app/recipes/new">
                <Plus className="h-4 w-4" />
                <span>New Recipe</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
