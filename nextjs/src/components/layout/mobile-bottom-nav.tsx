"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, BookOpen, ShoppingCart, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavTab {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  exactMatch?: boolean;
  badge?: number;
}

const NAV_TABS: NavTab[] = [
  { href: "/app", icon: Calendar, label: "Plan", exactMatch: true },
  { href: "/app/recipes", icon: BookOpen, label: "Recipes" },
  { href: "/app/shop", icon: ShoppingCart, label: "Shop" },
  { href: "/app/stats", icon: BarChart3, label: "Stats" },
];

function NavTabItem({ tab, isActive }: { tab: NavTab; isActive: boolean }) {
  return (
    <Link
      href={tab.href}
      className={cn(
        "relative flex-1 flex flex-col items-center justify-center gap-1",
        "min-h-[56px] min-w-[64px]",
        "touch-none-highlight touch-press",
        "transition-all duration-200",
        isActive ? "text-primary" : "text-muted-foreground hover:text-foreground/80"
      )}
      aria-current={isActive ? "page" : undefined}
    >
      {/* Icon container with glow effect when active */}
      <div className="relative">
        <tab.icon
          className={cn(
            "h-5 w-5 transition-all duration-200",
            isActive && "stroke-[2.5] drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
          )}
        />

        {/* Badge for counts */}
        {tab.badge && tab.badge > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 flex items-center justify-center text-[10px] font-bold bg-primary text-primary-foreground rounded-full">
            {tab.badge > 99 ? "99+" : tab.badge}
          </span>
        )}
      </div>

      {/* Label with weight transition */}
      <span
        className={cn(
          "text-[10px] leading-tight transition-all duration-200",
          isActive ? "font-semibold" : "font-medium"
        )}
      >
        {tab.label}
      </span>

      {/* Active indicator dot */}
      {isActive && (
        <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary animate-pulse" />
      )}
    </Link>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();

  // Note: AppShell only renders this component when on mobile, so no isMobile check needed
  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80",
        "border-t border-border/50",
        "pb-safe"
      )}
      aria-label="Main navigation"
    >
      <div className="flex items-stretch h-14">
        {NAV_TABS.map((tab) => {
          const isActive = tab.exactMatch
            ? pathname === tab.href
            : pathname === tab.href || pathname.startsWith(`${tab.href}/`);

          return <NavTabItem key={tab.href} tab={tab} isActive={isActive} />;
        })}
      </div>
    </nav>
  );
}
