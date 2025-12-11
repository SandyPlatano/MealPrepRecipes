import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/actions/auth";
import { History, Settings, Menu, Sparkles, BookOpen, Calendar, ShoppingCart } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { BrandLogoCompact } from "@/components/brand/logo";
import { AppNav } from "@/components/navigation/app-nav";

// Navigation: Plan, List, Recipes, Discover, History
const navItems = [
  { href: "/app/plan", iconKey: "plan" as const, label: "Plan" },
  { href: "/app/shop", iconKey: "shop" as const, label: "List" },
  { href: "/app/recipes", iconKey: "recipes" as const, label: "Recipes" },
  { href: "/app/recipes/discover", iconKey: "discover" as const, label: "Discover" },
  { href: "/app/history", iconKey: "history" as const, label: "History" },
];
const settingsItem = { href: "/app/settings", iconKey: "settings" as const, label: "Settings" };

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  let user = null;
  
  try {
    const { data } = await supabase.auth.getUser();
    user = data?.user ?? null;
  } catch (error) {
    console.error("Failed to get user in app layout:", error);
    // If auth check fails, redirect to login
    redirect("/login");
  }

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with navigation */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
          <Link href="/app" className="hover:opacity-80 transition-opacity">
            <BrandLogoCompact />
          </Link>

          <div className="flex items-center gap-3">
            {/* Desktop Navigation + Settings grouped */}
            <div className="hidden md:flex items-center gap-3">
              <AppNav items={navItems} variant="desktop" />
              <Link href="/app/settings">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Mobile Menu */}
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
                    const Icon = item.iconKey === "plan" ? Calendar
                      : item.iconKey === "recipes" ? BookOpen
                      : item.iconKey === "discover" ? Sparkles
                      : item.iconKey === "shop" ? ShoppingCart
                      : History;
                    return (
                      <SheetClose asChild key={item.href}>
                        <Link href={item.href}>
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-base hover:bg-primary/5"
                          >
                            <Icon className="mr-3 h-4 w-4" />
                            {item.label}
                          </Button>
                        </Link>
                      </SheetClose>
                    );
                  })}
                  <div className="border-t my-3" />
                  <SheetClose asChild>
                    <Link href="/app/settings">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-base hover:bg-primary/5"
                      >
                        <Settings className="mr-3 h-4 w-4" />
                        Settings
                      </Button>
                    </Link>
                  </SheetClose>
                  <form action={logout} className="mt-2">
                    <Button variant="outline" className="w-full justify-center">
                      Sign out
                    </Button>
                  </form>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main content with page transition */}
      <main className="container mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <AppNav
        items={navItems}
        includeSettings
        settingsItem={settingsItem}
        variant="mobile"
      />

      {/* Spacer for mobile bottom nav */}
      <div className="md:hidden h-16 pb-safe" />
    </div>
  );
}
