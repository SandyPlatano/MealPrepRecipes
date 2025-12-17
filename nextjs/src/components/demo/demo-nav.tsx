"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Calendar,
  BookOpen,
  ShoppingCart,
  Activity,
  type LucideIcon,
} from "lucide-react";

type IconKey = "plan" | "recipes" | "shop" | "nutrition";

const iconMap: Record<IconKey, LucideIcon> = {
  plan: Calendar,
  recipes: BookOpen,
  shop: ShoppingCart,
  nutrition: Activity,
};

type NavItem = {
  href: string;
  label: string;
  iconKey: IconKey;
};

interface DemoNavProps {
  items: NavItem[];
  variant?: "desktop" | "mobile";
}

export function DemoNav({ items, variant = "desktop" }: DemoNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    // Exact match
    if (pathname === href) return true;

    // Special case: /demo (Plan) should be active for /demo and /demo/plan
    if (href === "/demo") {
      if (pathname === "/demo" || pathname === "/demo/plan") return true;
      // Don't be active for other /demo/* routes
      return false;
    }

    // Check if pathname starts with this href (for nested routes like /demo/recipes/123)
    return pathname.startsWith(`${href}/`) || pathname === href;
  };

  if (variant === "mobile") {
    return (
      <nav className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 md:hidden shadow-lg shadow-background/50 pb-safe transition-all duration-200">
        <div className="flex items-center justify-around py-1 px-2">
          {items.map((item) => {
            const active = isActive(item.href);
            const Icon = iconMap[item.iconKey];
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-2 min-h-[48px] min-w-[48px] transition-all rounded-lg active:scale-95",
                  active
                    ? "text-primary bg-primary/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                )}
              >
                <Icon
                  className={cn(
                    "h-6 w-6 transition-all",
                    active && "drop-shadow-[0_4px_16px_rgba(99,102,241,0.45)]"
                  )}
                />
                <span className="text-[10px] font-medium leading-tight text-center">
                  {item.label}
                </span>
                {active && (
                  <span className="h-1 w-5 rounded-full bg-primary/80 animate-[pulse_1.6s_ease-in-out_infinite] mt-0.5" />
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
                "inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-medium border transition-all duration-200",
                "hover:border-primary/40 hover:text-foreground hover:shadow-[0_8px_30px_-15px_rgba(99,102,241,0.45)] hover:bg-primary/5 active:scale-95",
                active
                  ? "border-primary/50 bg-primary/10 text-primary shadow-sm"
                  : "border-transparent text-muted-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 transition-all",
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
