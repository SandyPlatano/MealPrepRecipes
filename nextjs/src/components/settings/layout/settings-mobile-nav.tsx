"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SETTINGS_CATEGORIES } from "@/lib/settings/settings-categories";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { MoreHorizontal } from "lucide-react";

const VISIBLE_MOBILE_CATEGORIES = 4;

export function SettingsMobileNav() {
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);

  const visibleCategories = SETTINGS_CATEGORIES.slice(0, VISIBLE_MOBILE_CATEGORIES);
  const overflowCategories = SETTINGS_CATEGORIES.slice(VISIBLE_MOBILE_CATEGORIES);

  // Check if an overflow category is active
  const isOverflowActive = overflowCategories.some(
    (cat) => pathname === cat.path || pathname.startsWith(`${cat.path}/`)
  );

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around py-1.5 px-1">
        {visibleCategories.map((category) => {
          const Icon = category.icon;
          const isActive =
            pathname === category.path ||
            pathname.startsWith(`${category.path}/`);

          return (
            <Link
              key={category.id}
              href={category.path}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1.5 min-h-[56px] min-w-[56px] rounded-lg transition-all active:scale-95",
                isActive
                  ? "text-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium leading-tight">
                {category.shortLabel}
              </span>
            </Link>
          );
        })}

        {overflowCategories.length > 0 && (
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <button
                className={cn(
                  "flex flex-col items-center gap-0.5 px-2 py-1.5 min-h-[56px] min-w-[56px] rounded-lg transition-all active:scale-95",
                  isOverflowActive
                    ? "text-primary bg-primary/5"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <MoreHorizontal className="h-5 w-5" />
                <span className="text-[10px] font-medium leading-tight">More</span>
              </button>
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="h-auto pb-[env(safe-area-inset-bottom)] rounded-t-xl"
            >
              <SheetTitle className="sr-only">More Settings</SheetTitle>
              <div className="grid grid-cols-3 gap-4 p-4 pt-2">
                {overflowCategories.map((category) => {
                  const Icon = category.icon;
                  const isActive =
                    pathname === category.path ||
                    pathname.startsWith(`${category.path}/`);

                  return (
                    <Link
                      key={category.id}
                      href={category.path}
                      onClick={() => setSheetOpen(false)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-lg transition-all active:scale-95",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-accent"
                      )}
                    >
                      <Icon className="h-6 w-6" />
                      <span className="text-sm font-medium text-center">
                        {category.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </nav>
  );
}
