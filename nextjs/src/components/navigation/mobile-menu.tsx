"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Menu,
  Calendar,
  BookOpen,
  Sparkles,
  ShoppingCart,
  History,
  Settings,
  Activity,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type IconKey = "plan" | "recipes" | "discover" | "shop" | "history" | "settings" | "nutrition";

const iconMap: Record<IconKey, LucideIcon> = {
  plan: Calendar,
  recipes: BookOpen,
  discover: Sparkles,
  shop: ShoppingCart,
  history: History,
  settings: Settings,
  nutrition: Activity,
};

type NavItem = {
  href: string;
  label: string;
  iconKey: IconKey;
};

interface MobileMenuProps {
  navItems: NavItem[];
  settingsItem: NavItem;
  logoutAction: () => Promise<void>;
}

export function MobileMenu({ navItems, settingsItem, logoutAction }: MobileMenuProps) {
  const pathname = usePathname();

  // Get all hrefs to check for more specific routes
  const allHrefs = [...navItems.map(item => item.href), settingsItem.href];

  const isActive = (href: string) => {
    // Exact match always wins
    if (pathname === href) return true;

    // Check if pathname starts with this href (for nested routes)
    if (!pathname.startsWith(`${href}/`)) return false;

    // If it's a parent route, check if there's a more specific route that should be active
    const isMoreSpecificRoute = allHrefs.some(otherHref => {
      if (otherHref === href) return false;
      return otherHref.startsWith(`${href}/`) &&
             (pathname === otherHref || pathname.startsWith(`${otherHref}/`));
    });

    return !isMoreSpecificRoute;
  };

  return (
    <Sheet>
      <SheetTrigger asChild className="md:hidden">
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px]">
        <SheetHeader>
          <SheetTitle className="font-mono text-left">Menu</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-2 mt-6">
          {navItems.map((item) => {
            const Icon = iconMap[item.iconKey];
            const active = isActive(item.href);
            return (
              <SheetClose asChild key={item.href}>
                <Link href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-base",
                      active
                        ? "bg-primary/10 text-primary hover:bg-primary/15"
                        : "hover:bg-primary/5"
                    )}
                  >
                    <Icon className={cn(
                      "mr-3 h-4 w-4",
                      active && "text-primary"
                    )} />
                    {item.label}
                  </Button>
                </Link>
              </SheetClose>
            );
          })}
          <div className="border-t my-3" />
          <SheetClose asChild>
            <Link href={settingsItem.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-base",
                  isActive(settingsItem.href)
                    ? "bg-primary/10 text-primary hover:bg-primary/15"
                    : "hover:bg-primary/5"
                )}
              >
                <Settings className={cn(
                  "mr-3 h-4 w-4",
                  isActive(settingsItem.href) && "text-primary"
                )} />
                Settings
              </Button>
            </Link>
          </SheetClose>
          <form action={logoutAction} className="mt-2">
            <Button variant="outline" className="w-full justify-center">
              Sign out
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
