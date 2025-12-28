import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/actions/auth";
import { RetroAppShell } from "@/components/dashboard-new";
import { Heart, CalendarDays, ShoppingCart } from "lucide-react";

export default async function DashboardNewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get shopping list count
  const { data: householdData } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single();

  let shoppingListCount = 0;
  let favoritesCount = 0;

  if (householdData?.household_id) {
    // Get active shopping list
    const { data: activeList } = await supabase
      .from("shopping_lists")
      .select("id")
      .eq("household_id", householdData.household_id)
      .eq("is_active", true)
      .single();

    if (activeList?.id) {
      // Get unchecked item count
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
  }

  return (
    <RetroAppShell
      user={user}
      onLogout={logout}
      shoppingListCount={shoppingListCount}
      favoritesCount={favoritesCount}
    >
      {/* Sample content to test the layout */}
      <div className="space-y-8">
        {/* Page header */}
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold font-display mb-1">
              Dashboard Preview
            </h2>
            <p className="text-[#6B7280] font-mono text-sm">
              Testing the new retro navigation design
            </p>
          </div>
          <button className="px-4 py-2 bg-black text-white text-xs font-bold uppercase rounded-full shadow-[3px_3px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#000] transition-all">
            This Week
          </button>
        </div>

        {/* Sample cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#fbcfe8] border-2 border-black rounded-xl p-6 shadow-[3px_3px_0px_0px_#000]">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-white/50 p-1.5 rounded-lg border border-black/10">
                <Heart className="h-4 w-4" />
              </span>
              <span className="text-sm font-bold">Recipes Cooked</span>
            </div>
            <h3 className="text-3xl font-bold font-display mb-1">42</h3>
            <div className="flex justify-between items-end">
              <p className="text-xs opacity-60">This month</p>
              <span className="bg-white px-2 py-0.5 rounded text-xs font-bold border border-black shadow-[1px_1px_0px_0px_#000]">
                ↑ +12%
              </span>
            </div>
          </div>

          <div className="bg-[#bae6fd] border-2 border-black rounded-xl p-6 shadow-[3px_3px_0px_0px_#000]">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-white/50 p-1.5 rounded-lg border border-black/10">
                <CalendarDays className="h-4 w-4" />
              </span>
              <span className="text-sm font-bold">Meals Planned</span>
            </div>
            <h3 className="text-3xl font-bold font-display mb-1">14</h3>
            <div className="flex justify-between items-end">
              <p className="text-xs opacity-60">This week</p>
              <span className="bg-white px-2 py-0.5 rounded text-xs font-bold border border-black shadow-[1px_1px_0px_0px_#000]">
                100%
              </span>
            </div>
          </div>

          <div className="bg-[#FBBF24] border-2 border-black rounded-xl p-6 shadow-[3px_3px_0px_0px_#000]">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-white/50 p-1.5 rounded-lg border border-black/10">
                <ShoppingCart className="h-4 w-4" />
              </span>
              <span className="text-sm font-bold">Shopping Items</span>
            </div>
            <h3 className="text-3xl font-bold font-display mb-1">{shoppingListCount}</h3>
            <div className="flex justify-between items-end">
              <p className="text-xs opacity-60">Items remaining</p>
              <span className="bg-white px-2 py-0.5 rounded text-xs font-bold border border-black shadow-[1px_1px_0px_0px_#000]">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Info card */}
        <div className="bg-white border-2 border-black rounded-xl p-6 shadow-[3px_3px_0px_0px_#000]">
          <h3 className="text-lg font-bold font-display mb-4">
            ✨ New Navigation Preview
          </h3>
          <div className="space-y-3 text-sm">
            <p>
              <strong>Sidebar:</strong> Dark navigation with your app pages (Plan, Recipes, Shop, Stats, Favorites, Settings)
            </p>
            <p>
              <strong>Search:</strong> Click the search bar to open the global search modal (or press <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">/</kbd>)
            </p>
            <p>
              <strong>Account Pill:</strong> Notifications, Settings, and your avatar in the top-right
            </p>
            <p>
              <strong>Logout:</strong> At the bottom of the sidebar
            </p>
          </div>
        </div>
      </div>
    </RetroAppShell>
  );
}
