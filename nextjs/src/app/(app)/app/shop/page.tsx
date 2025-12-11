import { getShoppingListWithItems } from "@/app/actions/shopping-list";
import { getPantryItems } from "@/app/actions/pantry";
import { getSettings } from "@/app/actions/settings";
import { getWeekPlanForShoppingList } from "@/app/actions/meal-plans";
import { ShoppingListView } from "@/components/shopping-list/shopping-list-view";
import Link from "next/link";
import { Cookie } from "lucide-react";
import { getWeekStart } from "@/types/meal-plan";

export default async function ShopPage() {
  const currentWeekStart = getWeekStart(new Date()).toISOString().split("T")[0];

  // Use lightweight query for shopping list (fetches only id, title, cook - not full recipe)
  const [listResult, pantryResult, settingsResult, weekPlanResult] = await Promise.all([
    getShoppingListWithItems(),
    getPantryItems(),
    getSettings(),
    getWeekPlanForShoppingList(currentWeekStart),
  ]);

  const shoppingList = listResult.data || {
    id: "",
    household_id: "",
    meal_plan_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    items: [],
  };

  const pantryItems = pantryResult.data || [];
  const categoryOrder = settingsResult.data?.category_order || null;
  const weekPlan = weekPlanResult.data || null;
  const cookNames = settingsResult.data?.cook_names || [];
  const cookColors = settingsResult.data?.cook_colors || {};

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-mono font-bold">Shopping List</h1>
          <p className="text-muted-foreground mt-1">
            No more wandering around like a lost puppy. Organized by aisle.
          </p>
        </div>
        <Link
          href="/app/pantry"
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted/50 transition-colors"
        >
          <Cookie className="h-4 w-4" />
          <span className="hidden sm:inline">Manage Pantry</span>
          <span className="sm:hidden">Pantry</span>
          {pantryItems.length > 0 && (
            <span className="bg-primary/10 text-primary text-xs px-1.5 py-0.5 rounded-full">
              {pantryItems.length}
            </span>
          )}
        </Link>
      </div>

      <ShoppingListView
        shoppingList={shoppingList}
        initialPantryItems={pantryItems}
        initialCategoryOrder={categoryOrder}
        weekPlan={weekPlan}
        weekStart={currentWeekStart}
        cookNames={cookNames}
        cookColors={cookColors}
      />
    </div>
  );
}
