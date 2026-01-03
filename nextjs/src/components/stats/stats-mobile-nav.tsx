"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { STATS_CATEGORIES } from "@/lib/stats/stats-categories";

export function StatsMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around py-1.5 px-1">
        {STATS_CATEGORIES.map((category) => {
          const Icon = category.icon;
          const isActive =
            pathname === category.path ||
            (category.id !== "overview" && pathname.startsWith(`${category.path}/`));

          return (
            <Link
              key={category.id}
              href={category.path}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1.5 min-h-[56px] min-w-[56px] rounded-lg transition-all active:scale-95",
                isActive
                  ? "text-[#1A1A1A] bg-[#D9F99D]/50"
                  : "text-muted-foreground hover:text-foreground hover:bg-[#D9F99D]/30"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium leading-tight">
                {category.shortLabel}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
