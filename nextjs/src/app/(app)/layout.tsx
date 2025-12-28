import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { QuickCookProvider } from "@/components/quick-cook/quick-cook-provider";
import { DifficultyThresholdsProvider } from "@/contexts/difficulty-thresholds-context";
import { RetroAppShell } from "@/components/dashboard-new";
import { PepperProvider } from "@/components/pepper";

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

  // Fetch counts for sidebar badges
  let shoppingListCount = 0;
  let favoritesCount = 0;
  let totalRecipeCount = 0;

  try {
    // Get household
    const { data: householdData } = await supabase
      .from("household_members")
      .select("household_id")
      .eq("user_id", user.id)
      .single();

    if (householdData?.household_id) {
      // Get active shopping list count
      const { data: activeList } = await supabase
        .from("shopping_lists")
        .select("id")
        .eq("household_id", householdData.household_id)
        .eq("is_active", true)
        .single();

      if (activeList?.id) {
        const { count: shopCount } = await supabase
          .from("shopping_list_items")
          .select("*", { count: "exact", head: true })
          .eq("shopping_list_id", activeList.id)
          .eq("is_checked", false);
        shoppingListCount = shopCount || 0;
      }

      // Get favorites count
      const { count: favCount } = await supabase
        .from("recipe_favorites")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      favoritesCount = favCount || 0;

      // Get total recipe count
      const { count: recipeCount } = await supabase
        .from("recipes")
        .select("*", { count: "exact", head: true })
        .eq("household_id", householdData.household_id);
      totalRecipeCount = recipeCount || 0;
    }
  } catch (error) {
    console.error("Failed to fetch sidebar counts:", error);
  }

  return (
    <QuickCookProvider>
      <DifficultyThresholdsProvider>
        <PepperProvider>
          <RetroAppShell
            user={user}
            onLogout={logout}
            shoppingListCount={shoppingListCount}
            favoritesCount={favoritesCount}
            totalRecipeCount={totalRecipeCount}
          >
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              {children}
            </div>
          </RetroAppShell>
        </PepperProvider>
      </DifficultyThresholdsProvider>
    </QuickCookProvider>
  );
}
