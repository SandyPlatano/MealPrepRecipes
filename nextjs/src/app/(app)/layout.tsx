import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/actions/auth";
import { History, PlusCircle, Settings, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CartButton } from "@/components/cart/cart-button";
import { BrandLogoCompact } from "@/components/brand/logo";

// Navigation: Add Recipe, History
const navItems = [
  { href: "/app/recipes/new", icon: PlusCircle, label: "Add Recipe" },
  { href: "/app/history", icon: History, label: "History" },
];

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with navigation */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/app" className="hover:opacity-80 transition-opacity">
              <BrandLogoCompact />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {/* Cart Button */}
            <CartButton />

            {/* Desktop Settings */}
            <div className="hidden md:flex items-center gap-2">
              <Link href="/app/settings">
                <Button variant="ghost" size="icon">
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
              <SheetContent side="right" className="w-[280px]">
                <SheetHeader>
                  <SheetTitle className="font-mono text-left">Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-2 mt-6">
                  {navItems.map((item) => (
                    <Link key={item.href} href={item.href}>
                      <Button variant="ghost" className="w-full justify-start">
                        <item.icon className="mr-3 h-4 w-4" />
                        {item.label}
                      </Button>
                    </Link>
                  ))}
                  <div className="border-t my-2" />
                  <Link href="/app/settings">
                    <Button variant="ghost" className="w-full justify-start">
                      <Settings className="mr-3 h-4 w-4" />
                      Settings
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="flex items-center justify-around py-2">
          <Link href="/app/recipes/new" className="flex flex-col items-center gap-1 p-2">
            <PlusCircle className="h-5 w-5" />
            <span className="text-[10px]">Add</span>
          </Link>
          <Link href="/app/history" className="flex flex-col items-center gap-1 p-2">
            <History className="h-5 w-5" />
            <span className="text-[10px]">History</span>
          </Link>
          <Link href="/app/settings" className="flex flex-col items-center gap-1 p-2">
            <Settings className="h-5 w-5" />
            <span className="text-[10px]">Settings</span>
          </Link>
        </div>
      </nav>

      {/* Spacer for mobile bottom nav */}
      <div className="md:hidden h-16" />
    </div>
  );
}
