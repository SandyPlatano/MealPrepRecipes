import { getShoppingListWithItems } from "@/app/actions/shopping-list";
import { ShoppingListView } from "@/components/shopping-list/shopping-list-view";

export default async function ShopPage() {
  const result = await getShoppingListWithItems();

  const shoppingList = result.data || {
    id: "",
    household_id: "",
    name: "Shopping List",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    items: [],
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-mono font-bold">Shopping List</h1>
        <p className="text-muted-foreground mt-1">
          No more wandering around like a lost puppy. Organized by aisle.
        </p>
      </div>

      <ShoppingListView shoppingList={shoppingList} />
    </div>
  );
}
