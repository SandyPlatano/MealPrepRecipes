import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { AppNav } from "@/components/navigation/app-nav";
import { AppHeader } from "@/components/navigation/app-header";
import { QuickCookProvider } from "@/components/quick-cook/quick-cook-provider";

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
    <QuickCookProvider>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header with scroll detection and Quick Cook trigger */}
        <AppHeader
          navItems={navItems}
          settingsItem={settingsItem}
          logoutAction={logout}
        />

        {/* Main content with page transition - flex-1 to fill space */}
        <main className="flex-1 container mx-auto w-full px-4 py-8 pb-24 md:pb-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
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
    </QuickCookProvider>
  );
}
