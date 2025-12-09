"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Calendar,
  BookOpen,
  Sparkles,
  History,
  Settings,
  ShoppingCart,
  Package,
  type LucideIcon,
} from "lucide-react";

type IconKey = "plan" | "recipes" | "discover" | "shop" | "pantry" | "history" | "settings";

const iconMap: Record<IconKey, LucideIcon> = {
  plan: Calendar,
  recipes: BookOpen,
  discover: Sparkles,
  shop: ShoppingCart,
  pantry: Package,
  history: History,
  settings: Settings,
};

type NavItem = {
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
      <nav className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 md:hidden pb-safe">
        <div className="flex items-center justify-around py-1">
          {mobileItems.map((item) => {
            const active = isActive(item.href);
            const Icon = iconMap[item.iconKey];
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 min-h-[44px] min-w-[44px] transition-all rounded-lg active:scale-95 active:bg-primary/10",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "h-6 w-6",
                    active && "drop-shadow-[0_4px_16px_rgba(99,102,241,0.45)]"
                  )}
                />
                <span className="text-[10px] font-medium leading-tight">{item.label}</span>
                {active && (
                  <span className="h-1 w-6 rounded-full bg-primary/80 animate-[pulse_1.6s_ease-in-out_infinite]" />
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
                "inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-medium border transition-all",
                "hover:border-primary/40 hover:text-foreground hover:shadow-[0_8px_30px_-15px_rgba(99,102,241,0.45)] hover:bg-primary/5",
                active
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-transparent text-muted-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4",
                  active && "drop-shadow-[0_6px_24px_rgba(99,102,241,0.45)]"
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

