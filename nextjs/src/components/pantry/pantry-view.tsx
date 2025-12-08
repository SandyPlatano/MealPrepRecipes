"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Cookie, PackageX } from "lucide-react";
import { toast } from "sonner";
import {
  addToPantry,
  removePantryItemById,
  clearPantry,
} from "@/app/actions/pantry";
import {
  type PantryItem,
  INGREDIENT_CATEGORIES,
  groupItemsByCategory,
  sortCategories,
} from "@/types/shopping-list";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

interface PantryViewProps {
  initialItems: PantryItem[];
}

export function PantryView({ initialItems }: PantryViewProps) {
  const [newItem, setNewItem] = useState("");
  const [newCategory, setNewCategory] = useState<string>("Other");
  const [isAdding, setIsAdding] = useState(false);

  // Group items by category for display
  const groupedItems = initialItems.reduce(
    (acc, item) => {
      const category = item.category || "Other";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    },
    {} as Record<string, PantryItem[]>
  );

  const sortedCategories = sortCategories(Object.keys(groupedItems));
  const totalCount = initialItems.length;

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    setIsAdding(true);
    const result = await addToPantry(newItem.trim(), newCategory);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Added "${newItem}" to pantry`);
      setNewItem("");
    }
    setIsAdding(false);
  };

  const handleRemoveItem = async (itemId: string, itemName: string) => {
    const result = await removePantryItemById(itemId);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Removed "${itemName}" from pantry`);
    }
  };

  const handleClearAll = async () => {
    const result = await clearPantry();
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Cleared all pantry items");
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Item Form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Add Pantry Item</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddItem} className="flex gap-2">
            <Input
              placeholder="Add ingredient you always have..."
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              className="flex-1"
            />
            <Select value={newCategory} onValueChange={setNewCategory}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INGREDIENT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" disabled={isAdding || !newItem.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2">
            Common pantry staples: salt, pepper, olive oil, butter, garlic, onions, etc.
          </p>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" asChild>
          <Link href="/app/shop">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Back to Shopping List
          </Link>
        </Button>

        {totalCount > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-destructive">
                <PackageX className="h-4 w-4 mr-2" />
                Clear Pantry
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all pantry items?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove all {totalCount} items from your pantry.
                  This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearAll}>
                  Clear All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Stats */}
      {totalCount > 0 && (
        <div className="text-sm text-muted-foreground">
          {totalCount} item{totalCount !== 1 ? "s" : ""} in pantry
        </div>
      )}

      {/* Pantry Items by Category */}
      {totalCount === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="max-w-sm mx-auto space-y-4">
              <div className="text-5xl">
                <Cookie className="h-12 w-12 mx-auto text-muted-foreground" />
              </div>
              <div>
                <p className="text-lg font-medium">Your pantry is empty</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Add items you always have on hand. They&apos;ll be hidden from
                  your shopping list so you don&apos;t buy duplicates.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedCategories.map((category) => (
            <PantryCategorySection
              key={category}
              category={category}
              items={groupedItems[category]}
              onRemove={handleRemoveItem}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface PantryCategorySectionProps {
  category: string;
  items: PantryItem[];
  onRemove: (itemId: string, itemName: string) => void;
}

function PantryCategorySection({
  category,
  items,
  onRemove,
}: PantryCategorySectionProps) {
  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span>{category}</span>
          <span className="text-xs text-muted-foreground font-normal">
            {items.length} item{items.length !== 1 ? "s" : ""}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-2">
          {items.map((item) => (
            <PantryItemRow key={item.id} item={item} onRemove={onRemove} />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

interface PantryItemRowProps {
  item: PantryItem;
  onRemove: (itemId: string, itemName: string) => void;
}

function PantryItemRow({ item, onRemove }: PantryItemRowProps) {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async () => {
    setIsRemoving(true);
    await onRemove(item.id, item.ingredient);
    setIsRemoving(false);
  };

  return (
    <li className="flex items-center gap-3 group">
      <Cookie className="h-4 w-4 text-muted-foreground" />
      <span className="flex-1 text-sm">{item.ingredient}</span>
      {item.last_restocked && (
        <span className="text-xs text-muted-foreground">
          Added {new Date(item.last_restocked).toLocaleDateString()}
        </span>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleRemove}
        disabled={isRemoving}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </li>
  );
}

