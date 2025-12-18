"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { STATS_CATEGORIES } from "@/lib/stats/stats-categories";
import { ScrollArea } from "@/components/ui/scroll-area";

export function StatsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-60 border-r bg-muted/30 h-full shrink-0">
      <div className="p-4 border-b">
        <h2 className="font-mono font-semibold text-lg">Stats</h2>
      </div>
      <ScrollArea className="flex-1">
        <nav className="p-3 space-y-1">
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
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  "hover:bg-accent hover:text-accent-foreground",
                  isActive
                    ? "bg-primary/10 text-primary border-l-2 border-primary -ml-[2px] pl-[14px]"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span>{category.label}</span>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </aside>
  );
}
