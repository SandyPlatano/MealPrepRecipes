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
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Check, RefreshCw } from "lucide-react";
import {
  addShoppingListItem,
  toggleShoppingListItem,
  removeShoppingListItem,
  clearCheckedItems,
  clearShoppingList,
  generateFromMealPlan,
} from "@/app/actions/shopping-list";
import {
  type ShoppingListWithItems,
  type ShoppingListItem,
  INGREDIENT_CATEGORIES,
  groupItemsByCategory,
  sortCategories,
} from "@/types/shopping-list";
import { getWeekStart } from "@/types/meal-plan";
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

interface ShoppingListViewProps {
  shoppingList: ShoppingListWithItems;
}

export function ShoppingListView({ shoppingList }: ShoppingListViewProps) {
  const [newItem, setNewItem] = useState("");
  const [newCategory, setNewCategory] = useState<string>("Other");
  const [isAdding, setIsAdding] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const groupedItems = groupItemsByCategory(shoppingList.items);
  const sortedCategories = sortCategories(Object.keys(groupedItems));

  const checkedCount = shoppingList.items.filter((i) => i.is_checked).length;
  const totalCount = shoppingList.items.length;

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    setIsAdding(true);
    await addShoppingListItem({
      ingredient: newItem.trim(),
      category: newCategory,
    });
    setNewItem("");
    setIsAdding(false);
  };

  const handleGenerateFromPlan = async () => {
    setIsGenerating(true);
    const weekStart = getWeekStart(new Date());
    const weekStartStr = weekStart.toISOString().split("T")[0];
    await generateFromMealPlan(weekStartStr);
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      {/* Add Item Form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Add Item</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddItem} className="flex gap-2">
            <Input
              placeholder="Add ingredient..."
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
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={handleGenerateFromPlan}
          disabled={isGenerating}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isGenerating ? "animate-spin" : ""}`}
          />
          Generate from This Week&apos;s Plan
        </Button>

        {checkedCount > 0 && (
          <Button variant="outline" onClick={() => clearCheckedItems()}>
            <Check className="h-4 w-4 mr-2" />
            Clear Checked ({checkedCount})
          </Button>
        )}

        {totalCount > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear shopping list?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove all {totalCount} items from your shopping
                  list. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => clearShoppingList()}>
                  Clear All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Progress */}
      {totalCount > 0 && (
        <div className="text-sm text-muted-foreground">
          {checkedCount} of {totalCount} items checked
          {checkedCount === totalCount && totalCount > 0 && (
            <span className="ml-2 text-green-600 font-medium">
              Boom. Shopping done!
            </span>
          )}
        </div>
      )}

      {/* Shopping List Items by Category */}
      {totalCount === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <p>Starting fresh.</p>
            <p className="text-sm mt-1">
              Add items manually or generate from your meal plan.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedCategories.map((category) => (
            <CategorySection
              key={category}
              category={category}
              items={groupedItems[category]}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface CategorySectionProps {
  category: string;
  items: ShoppingListItem[];
}

function CategorySection({ category, items }: CategorySectionProps) {
  const checkedCount = items.filter((i) => i.is_checked).length;
  const allChecked = checkedCount === items.length;

  return (
    <Card className={allChecked ? "opacity-60" : ""}>
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span>{category}</span>
          <span className="text-xs text-muted-foreground font-normal">
            {checkedCount}/{items.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-2">
          {items.map((item) => (
            <ShoppingItemRow key={item.id} item={item} />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

interface ShoppingItemRowProps {
  item: ShoppingListItem;
}

function ShoppingItemRow({ item }: ShoppingItemRowProps) {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleToggle = async () => {
    await toggleShoppingListItem(item.id);
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    await removeShoppingListItem(item.id);
  };

  const displayText = [item.quantity, item.unit, item.ingredient]
    .filter(Boolean)
    .join(" ");

  return (
    <li className="flex items-center gap-3 group">
      <Checkbox
        id={item.id}
        checked={item.is_checked}
        onCheckedChange={handleToggle}
      />
      <label
        htmlFor={item.id}
        className={`flex-1 text-sm cursor-pointer ${
          item.is_checked ? "line-through text-muted-foreground" : ""
        }`}
      >
        {displayText}
        {item.recipe_title && (
          <span className="text-xs text-muted-foreground ml-2">
            ({item.recipe_title})
          </span>
        )}
      </label>
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
