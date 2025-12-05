"use client";

import { useState, useEffect } from "react";
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
import {
  Plus,
  Trash2,
  Check,
  RefreshCw,
  Copy,
  Package,
  PackageCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  addShoppingListItem,
  toggleShoppingListItem,
  removeShoppingListItem,
  clearCheckedItems,
  clearShoppingList,
  generateFromMealPlan,
} from "@/app/actions/shopping-list";
import {
  addToPantry,
  removeFromPantry,
  getPantryItems,
} from "@/app/actions/pantry";
import {
  type ShoppingListWithItems,
  type ShoppingListItem,
  type PantryItem,
  INGREDIENT_CATEGORIES,
  groupItemsByCategory,
  sortCategories,
} from "@/types/shopping-list";
import { normalizeIngredientName } from "@/lib/ingredient-scaler";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExternalLink, Share2 } from "lucide-react";
import {
  SUPPORTED_STORES,
  openStoreWithItems,
  copyForStore,
  shareList,
  type ExportableItem,
} from "@/lib/store-export";
import { GripVertical, Settings2, WifiOff, Wifi } from "lucide-react";
import { updateSettings } from "@/app/actions/settings";
import {
  useOffline,
  setCachedShoppingList,
  getCachedShoppingList,
  type CachedShoppingList,
} from "@/lib/use-offline";

interface ShoppingListViewProps {
  shoppingList: ShoppingListWithItems;
  initialPantryItems?: PantryItem[];
  initialCategoryOrder?: string[] | null;
}

export function ShoppingListView({
  shoppingList,
  initialPantryItems = [],
  initialCategoryOrder = null,
}: ShoppingListViewProps) {
  const [newItem, setNewItem] = useState("");
  const [newCategory, setNewCategory] = useState<string>("Other");
  const [isAdding, setIsAdding] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pantryLookup, setPantryLookup] = useState<Set<string>>(
    new Set(initialPantryItems.map((p) => p.normalized_ingredient))
  );
  const [showPantryItems, setShowPantryItems] = useState(false);
  const [categoryOrder, setCategoryOrder] = useState<string[] | null>(
    initialCategoryOrder
  );
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [draggedCategory, setDraggedCategory] = useState<string | null>(null);

  // Offline support
  const { isOffline, isServiceWorkerReady } = useOffline();

  // Refresh pantry lookup when initialPantryItems changes
  useEffect(() => {
    setPantryLookup(
      new Set(initialPantryItems.map((p) => p.normalized_ingredient))
    );
  }, [initialPantryItems]);

  // Cache shopping list for offline use
  useEffect(() => {
    if (shoppingList.items.length > 0) {
      const cacheData: CachedShoppingList = {
        items: shoppingList.items.map((item) => ({
          id: item.id,
          ingredient: item.ingredient,
          quantity: item.quantity,
          unit: item.unit,
          category: item.category,
          is_checked: item.is_checked,
          recipe_title: item.recipe_title,
        })),
        lastUpdated: new Date().toISOString(),
        pendingChanges: getCachedShoppingList()?.pendingChanges || [],
      };
      setCachedShoppingList(cacheData);
    }
  }, [shoppingList.items]);

  // Mark items that are in pantry
  const itemsWithPantryStatus = shoppingList.items.map((item) => ({
    ...item,
    is_in_pantry: pantryLookup.has(normalizeIngredientName(item.ingredient)),
  }));

  // Filter items based on showPantryItems toggle
  const visibleItems = showPantryItems
    ? itemsWithPantryStatus
    : itemsWithPantryStatus.filter((item) => !item.is_in_pantry);

  const groupedItems = groupItemsByCategory(visibleItems);
  const sortedCategories = sortCategories(
    Object.keys(groupedItems),
    categoryOrder
  );

  const checkedCount = visibleItems.filter((i) => i.is_checked).length;
  const totalCount = visibleItems.length;
  const pantryCount = itemsWithPantryStatus.filter(
    (i) => i.is_in_pantry
  ).length;

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
    try {
      const weekStart = getWeekStart(new Date());
      const weekStartStr = weekStart.toISOString().split("T")[0];
      const result = await generateFromMealPlan(weekStartStr);
      
      if (result.error) {
        toast.error(result.error);
      } else if (result.count === 0) {
        toast.info("No meals planned for this week");
      } else {
        toast.success(`Added ${result.count} item${result.count !== 1 ? "s" : ""} to your list!`);
      }
    } catch (error) {
      toast.error("Failed to generate shopping list");
      console.error("Generate error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (totalCount === 0) {
      toast.error("Nothing to copy yet");
      return;
    }

    // Format shopping list as plain text
    let text = "Shopping List\n\n";

    sortedCategories.forEach((category) => {
      const items = groupedItems[category];
      text += `${category}:\n`;
      items.forEach((item) => {
        const displayText = [item.quantity, item.unit, item.ingredient]
          .filter(Boolean)
          .join(" ");
        text += `  ${item.is_checked ? "✓" : "○"} ${displayText}\n`;
      });
      text += "\n";
    });

    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Failed to copy. Try again?");
    }
  };

  const handlePantryToggle = (ingredient: string, isInPantry: boolean) => {
    const normalized = normalizeIngredientName(ingredient);
    setPantryLookup((prev) => {
      const next = new Set(prev);
      if (isInPantry) {
        next.add(normalized);
      } else {
        next.delete(normalized);
      }
      return next;
    });
  };

  // Get unchecked items for export (don't export already purchased items)
  const itemsToExport: ExportableItem[] = visibleItems
    .filter((item) => !item.is_checked)
    .map((item) => ({
      ingredient: item.ingredient,
      quantity: item.quantity,
      unit: item.unit,
    }));

  const handleStoreExport = (storeId: string) => {
    if (itemsToExport.length === 0) {
      toast.error("No items to export");
      return;
    }

    const store = SUPPORTED_STORES.find((s) => s.id === storeId);
    if (!store) return;

    // Copy list to clipboard first
    copyForStore(itemsToExport).then((copied) => {
      if (copied) {
        toast.success(
          `List copied! Opening ${store.name}... Paste your list there.`,
          { duration: 5000 }
        );
      }
    });

    // Open store in new tab
    openStoreWithItems(store.id, itemsToExport);
  };

  const handleShare = async () => {
    if (itemsToExport.length === 0) {
      toast.error("No items to share");
      return;
    }

    const shared = await shareList(itemsToExport, "Shopping List");
    if (shared) {
      toast.success("List shared!");
    } else {
      toast.error("Could not share list");
    }
  };

  // Drag and drop handlers for category reordering
  const handleDragStart = (category: string) => {
    setDraggedCategory(category);
  };

  const handleDragOver = (e: React.DragEvent, targetCategory: string) => {
    e.preventDefault();
    if (!draggedCategory || draggedCategory === targetCategory) return;

    const currentOrder = categoryOrder || [...INGREDIENT_CATEGORIES];
    const fromIndex = currentOrder.indexOf(draggedCategory);
    const toIndex = currentOrder.indexOf(targetCategory);

    if (fromIndex === -1) {
      // Dragged category not in current order, add it
      const newOrder = [...currentOrder];
      newOrder.splice(toIndex, 0, draggedCategory);
      setCategoryOrder(newOrder);
    } else if (toIndex !== -1) {
      // Both exist, swap positions
      const newOrder = [...currentOrder];
      newOrder.splice(fromIndex, 1);
      newOrder.splice(toIndex, 0, draggedCategory);
      setCategoryOrder(newOrder);
    }
  };

  const handleDragEnd = async () => {
    setDraggedCategory(null);
    // Save the new order to settings
    if (categoryOrder) {
      await updateSettings({ category_order: categoryOrder });
      toast.success("Shopping route saved");
    }
  };

  const handleResetOrder = async () => {
    setCategoryOrder(null);
    await updateSettings({ category_order: null });
    toast.success("Reset to default order");
  };

  return (
    <div className="space-y-6">
      {/* Offline indicator */}
      {isOffline && (
        <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-600 dark:text-yellow-400">
          <WifiOff className="h-4 w-4" />
          <span className="text-sm font-medium">
            You&apos;re offline. Changes will sync when you reconnect.
          </span>
        </div>
      )}

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

        {shoppingList.items.length > 0 && (
          <>
            <Button variant="outline" onClick={handleCopyToClipboard}>
              <Copy className="h-4 w-4 mr-2" />
              Copy List
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Send to Store
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {SUPPORTED_STORES.map((store) => (
                  <DropdownMenuItem
                    key={store.id}
                    onClick={() => handleStoreExport(store.id)}
                  >
                    <span className="mr-2">{store.icon}</span>
                    {store.name}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share List...
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}

        {checkedCount > 0 && (
          <Button variant="outline" onClick={() => clearCheckedItems()}>
            <Check className="h-4 w-4 mr-2" />
            Clear Checked ({checkedCount})
          </Button>
        )}

        {shoppingList.items.length > 0 && (
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
                  This will remove all {shoppingList.items.length} items from
                  your shopping list. This cannot be undone.
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

      {/* Pantry Filter */}
      {pantryCount > 0 && (
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <PackageCheck className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {pantryCount} item{pantryCount !== 1 ? "s" : ""} already in your
            pantry
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPantryItems(!showPantryItems)}
            className="ml-auto"
          >
            {showPantryItems ? "Hide" : "Show"}
          </Button>
        </div>
      )}

      {/* Reorder Mode Toggle */}
      {sortedCategories.length > 1 && (
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <Settings2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {isReorderMode
              ? "Drag categories to match your shopping route"
              : "Customize category order"}
          </span>
          <div className="ml-auto flex gap-2">
            {isReorderMode && categoryOrder && (
              <Button variant="ghost" size="sm" onClick={handleResetOrder}>
                Reset
              </Button>
            )}
            <Button
              variant={isReorderMode ? "default" : "ghost"}
              size="sm"
              onClick={() => setIsReorderMode(!isReorderMode)}
            >
              {isReorderMode ? "Done" : "Reorder"}
            </Button>
          </div>
        </div>
      )}

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
          <CardContent className="py-12 text-center">
            <div className="max-w-sm mx-auto space-y-4">
              <div className="text-5xl">🛒</div>
              <div>
                <p className="text-lg font-medium">No items on your list</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Generate from your meal plan or add items manually
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={handleGenerateFromPlan}
                disabled={isGenerating}
                className="mt-2"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? "animate-spin" : ""}`} />
                Generate from This Week
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedCategories.map((category) => (
            <CategorySection
              key={category}
              category={category}
              items={groupedItems[category]}
              onPantryToggle={handlePantryToggle}
              isReorderMode={isReorderMode}
              isDragging={draggedCategory === category}
              onDragStart={() => handleDragStart(category)}
              onDragOver={(e) => handleDragOver(e, category)}
              onDragEnd={handleDragEnd}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface CategorySectionProps {
  category: string;
  items: (ShoppingListItem & { is_in_pantry?: boolean })[];
  onPantryToggle: (ingredient: string, isInPantry: boolean) => void;
  isReorderMode?: boolean;
  isDragging?: boolean;
  onDragStart?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
}

function CategorySection({
  category,
  items,
  onPantryToggle,
  isReorderMode = false,
  isDragging = false,
  onDragStart,
  onDragOver,
  onDragEnd,
}: CategorySectionProps) {
  const checkedCount = items.filter((i) => i.is_checked).length;
  const allChecked = checkedCount === items.length;

  return (
    <Card
      className={`${allChecked ? "opacity-60" : ""} ${
        isReorderMode ? "cursor-move" : ""
      } ${isDragging ? "opacity-50 border-dashed" : ""}`}
      draggable={isReorderMode}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span className="flex items-center gap-2">
            {isReorderMode && (
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            )}
            {category}
          </span>
          <span className="text-xs text-muted-foreground font-normal">
            {checkedCount}/{items.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-2">
          {items.map((item) => (
            <ShoppingItemRow
              key={item.id}
              item={item}
              onPantryToggle={onPantryToggle}
            />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

interface ShoppingItemRowProps {
  item: ShoppingListItem & { is_in_pantry?: boolean };
  onPantryToggle: (ingredient: string, isInPantry: boolean) => void;
}

function ShoppingItemRow({ item, onPantryToggle }: ShoppingItemRowProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [isTogglingPantry, setIsTogglingPantry] = useState(false);

  const handleToggle = async () => {
    await toggleShoppingListItem(item.id);
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    await removeShoppingListItem(item.id);
  };

  const handlePantryToggle = async () => {
    setIsTogglingPantry(true);
    try {
      if (item.is_in_pantry) {
        await removeFromPantry(item.ingredient);
        onPantryToggle(item.ingredient, false);
        toast.success("Removed from pantry");
      } else {
        await addToPantry(item.ingredient, item.category || undefined);
        onPantryToggle(item.ingredient, true);
        toast.success("Added to pantry - won't show on future lists");
      }
    } catch {
      toast.error("Failed to update pantry");
    }
    setIsTogglingPantry(false);
  };

  const displayText = [item.quantity, item.unit, item.ingredient]
    .filter(Boolean)
    .join(" ");

  return (
    <TooltipProvider>
      <li
        className={`flex items-center gap-3 group ${
          item.is_in_pantry ? "opacity-50" : ""
        }`}
      >
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
          {item.is_in_pantry && (
            <span className="text-xs text-green-600 ml-2">(in pantry)</span>
          )}
        </label>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`h-6 w-6 transition-opacity ${
                item.is_in_pantry
                  ? "opacity-100 text-green-600"
                  : "opacity-0 group-hover:opacity-100"
              }`}
              onClick={handlePantryToggle}
              disabled={isTogglingPantry}
            >
              {item.is_in_pantry ? (
                <PackageCheck className="h-3 w-3" />
              ) : (
                <Package className="h-3 w-3" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {item.is_in_pantry
              ? "Remove from pantry"
              : "Mark as pantry staple (I always have this)"}
          </TooltipContent>
        </Tooltip>
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
    </TooltipProvider>
  );
}
