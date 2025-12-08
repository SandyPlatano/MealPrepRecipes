import { getPantryItems } from "@/app/actions/pantry";
import { PantryView } from "@/components/pantry/pantry-view";

export default async function PantryPage() {
  const pantryResult = await getPantryItems();
  const pantryItems = pantryResult.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-mono font-bold">Pantry</h1>
        <p className="text-muted-foreground mt-1">
          Track what you already have. These items won&apos;t clutter your shopping list.
        </p>
      </div>

      <PantryView initialItems={pantryItems} />
    </div>
  );
}

