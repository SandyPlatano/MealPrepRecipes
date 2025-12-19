"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, BookOpen, ShoppingCart, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/sidebar";

interface NavTab {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  exactMatch?: boolean;
}

const NAV_TABS: NavTab[] = [
  { href: "/app", icon: Calendar, label: "Plan", exactMatch: true },
  { href: "/app/recipes", icon: BookOpen, label: "Recipes" },
  { href: "/app/shop", icon: ShoppingCart, label: "Shop" },
  { href: "/app/stats", icon: BarChart3, label: "Stats" },
];

export function MobileBottomNav() {
  const { isMobile } = useSidebar();
  const pathname = usePathname();

  // Only render on mobile
  if (!isMobile) return null;

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        "border-t border-border",
        "pb-safe" // Safe area for iOS home indicator
      )}
      aria-label="Main navigation"
    >
      <div className="flex items-stretch h-14">
        {NAV_TABS.map((tab) => {
          const isActive = tab.exactMatch
            ? pathname === tab.href
            : pathname === tab.href || pathname.startsWith(`${tab.href}/`);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-0.5",
                "min-h-[56px] min-w-[64px]", // Ensures 44x44 touch target
                "transition-colors duration-150",
                "active:bg-muted/50", // Touch feedback
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <tab.icon
                className={cn(
                  "h-5 w-5",
                  isActive && "stroke-[2.5]"
                )}
              />
              <span
                className={cn(
                  "text-[10px] leading-tight",
                  isActive ? "font-semibold" : "font-medium"
                )}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
