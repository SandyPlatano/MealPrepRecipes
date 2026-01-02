"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Calendar,
  BookOpen,
  Heart,
  Settings,
  ShoppingCart,
  Package,
  Activity,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

export type IconKey = "plan" | "recipes" | "shop" | "pantry" | "favorites" | "settings" | "nutrition" | "stats";

const iconMap: Record<IconKey, LucideIcon> = {
  plan: Calendar,
  recipes: BookOpen,
  shop: ShoppingCart,
  pantry: Package,
  favorites: Heart,
  settings: Settings,
  nutrition: Activity,
  stats: BarChart3,
};

export type NavItem = {
  href: string;
  label: string;
  iconKey: IconKey;
};

interface AppNavProps {
  items: NavItem[];
  variant?: "desktop" | "mobile";
  includeSettings?: boolean;
  settingsItem?: NavItem;
}

export function AppNav({
  items,
  variant = "desktop",
  includeSettings,
  settingsItem,
}: AppNavProps) {
  const pathname = usePathname();

  // Get all hrefs to check for more specific routes
  const allHrefs = includeSettings && settingsItem
    ? [...items.map(item => item.href), settingsItem.href]
    : items.map(item => item.href);

  const isActive = (href: string) => {
    // Exact match always wins
    if (pathname === href) return true;
    
    // Special case: Plan link (/app) should also be active when on /app/plan (for backward compatibility)
    if (href === "/app" && pathname === "/app/plan") return true;
    
    // Special case: Plan link (/app) should NOT be active for other /app/* routes like /app/settings, /app/shop, etc.
    if (href === "/app") {
      // Only active if pathname is exactly /app or /app/plan
      if (pathname === "/app" || pathname === "/app/plan") return true;
      
      // Explicitly exclude known /app/* routes that should not make Plan active
      const excludedRoutes = [
        "/app/settings",
        "/app/shop",
        "/app/recipes",
        "/app/history",
        "/app/pantry",
        "/app/nutrition",
        "/app/stats",
      ];
      if (excludedRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))) {
        return false;
      }
      
      // Check if there's a more specific route that should be active instead
      const isMoreSpecificRoute = allHrefs.some(otherHref => {
        if (otherHref === href) return false;
        // Check if otherHref is a child of /app AND pathname matches otherHref
        return otherHref.startsWith("/app/") && 
               (pathname === otherHref || pathname.startsWith(`${otherHref}/`));
      });
      return !isMoreSpecificRoute;
    }
    
    // Check if pathname starts with this href (for nested routes)
    if (!pathname.startsWith(`${href}/`)) return false;
    
    // If it's a parent route, check if there's a more specific route that should be active
    // If a more specific route exists, this parent route should not be active
    const isMoreSpecificRoute = allHrefs.some(otherHref => {
      if (otherHref === href) return false;
      // Check if otherHref is a child of href AND pathname matches otherHref
      return otherHref.startsWith(`${href}/`) && 
             (pathname === otherHref || pathname.startsWith(`${otherHref}/`));
    });
    
    // Only active if no more specific route is active
    return !isMoreSpecificRoute;
  };

  if (variant === "mobile") {
    const mobileItems = includeSettings && settingsItem
      ? [...items, settingsItem]
      : items;
    return (
      <nav className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 z-50 md:hidden shadow-sm pb-safe transition-all duration-200">
        <div className="flex items-center justify-around py-1 px-2">
          {mobileItems.map((item) => {
            const active = isActive(item.href);
            const Icon = iconMap[item.iconKey];
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-2 min-h-[48px] min-w-[48px] transition-all rounded-lg active:scale-95",
                  active
                    ? "text-[#1A1A1A] bg-gray-50"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                )}
              >
                <Icon
                  className={cn(
                    "h-6 w-6 transition-all",
                    active && "stroke-[2.5]"
                  )}
                />
                <span className="text-[10px] font-medium leading-tight text-center">{item.label}</span>
                {active && (
                  <span className="h-0.5 w-5 rounded-full bg-[#D9F99D] mt-0.5" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <nav className="hidden md:flex items-center gap-2 h-10">
      {items.map((item) => {
        const active = isActive(item.href);
        const Icon = iconMap[item.iconKey];
        return (
          <Link key={item.href} href={item.href}>
            <span
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium border transition-all duration-200",
                "hover:bg-gray-50 hover:border-gray-300 active:scale-95",
                active
                  ? "border-[#D9F99D] bg-[#D9F99D]/10 text-[#1A1A1A]"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 transition-all",
                  active && "stroke-[2.5]"
                )}
              />
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

