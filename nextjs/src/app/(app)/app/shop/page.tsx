import { getShoppingListWithItems } from "@/app/actions/shopping-list";
import { getPantryItems } from "@/app/actions/pantry";
import { getSettings } from "@/app/actions/settings";
import { ShoppingListView } from "@/components/shopping-list/shopping-list-view";

export default async function ShopPage() {
  const [listResult, pantryResult, settingsResult] = await Promise.all([
    getShoppingListWithItems(),
    getPantryItems(),
    getSettings(),
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-mono font-bold">Shopping List</h1>
        <p className="text-muted-foreground mt-1">
          No more wandering around like a lost puppy. Organized by aisle.
        </p>
      </div>

      <ShoppingListView
        shoppingList={shoppingList}
        initialPantryItems={pantryItems}
        initialCategoryOrder={categoryOrder}
      />
    </div>
  );
}
