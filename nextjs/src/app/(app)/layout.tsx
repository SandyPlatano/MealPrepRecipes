import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { BrandLogoCompact } from "@/components/brand/logo";
import { AppNav } from "@/components/navigation/app-nav";
import { MobileMenu } from "@/components/navigation/mobile-menu";
import { SettingsButton } from "@/components/navigation/settings-button";
import { ScrollHeader } from "@/components/navigation/scroll-header";

// Navigation: Plan, List, Recipes, Nutrition, Favorites
const navItems = [
  { href: "/app", iconKey: "plan" as const, label: "Plan" },
  { href: "/app/shop", iconKey: "shop" as const, label: "List" },
  { href: "/app/recipes", iconKey: "recipes" as const, label: "Recipes" },
  { href: "/app/nutrition", iconKey: "nutrition" as const, label: "Nutrition" },
  { href: "/app/history", iconKey: "favorites" as const, label: "Favorites" },
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with scroll detection */}
      <ScrollHeader>
        <div className="container mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
          <Link href="/app" className="hover:opacity-80 transition-opacity flex-shrink-0">
            <BrandLogoCompact />
          </Link>

          <div className="flex items-center gap-3">
            {/* Desktop Navigation + Settings grouped */}
            <div className="hidden md:flex items-center gap-3">
              <AppNav items={navItems} variant="desktop" />
              <SettingsButton />
            </div>

            {/* Mobile Menu */}
            <MobileMenu
              navItems={navItems}
              settingsItem={settingsItem}
              logoutAction={logout}
            />
          </div>
        </div>
      </ScrollHeader>

      {/* Main content with page transition - flex-1 to fill space */}
      <main className="flex-1 container mx-auto w-full px-4 py-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
        {children}
      </main>

      {/* Mobile Bottom Navigation - fixed above safe area */}
      <div className="md:hidden">
        <AppNav
          items={navItems}
          includeSettings
          settingsItem={settingsItem}
          variant="mobile"
        />
      </div>
    </div>
  );
}
