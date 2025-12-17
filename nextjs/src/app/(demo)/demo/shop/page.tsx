"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useDemo } from "@/lib/demo/demo-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ShoppingCart,
  Check,
  RotateCcw,
  ChefHat,
  Apple,
  Beef,
  Milk,
  Wheat,
  Package,
  Snowflake,
  Leaf,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Category icons
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Produce: <Apple className="h-4 w-4" />,
  Meat: <Beef className="h-4 w-4" />,
  Dairy: <Milk className="h-4 w-4" />,
  Grains: <Wheat className="h-4 w-4" />,
  Pantry: <Package className="h-4 w-4" />,
  Frozen: <Snowflake className="h-4 w-4" />,
  Herbs: <Leaf className="h-4 w-4" />,
};

// Category colors
const CATEGORY_COLORS: Record<string, string> = {
  Produce: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Meat: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  Dairy: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Grains: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Pantry: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  Frozen: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  Herbs: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

export default function DemoShopPage() {
  const { shoppingList, toggleShoppingItem, resetShoppingList } = useDemo();
  const [showChecked, setShowChecked] = useState(true);

  // Group items by category
  const groupedItems = useMemo(() => {
    const groups: Record<string, typeof shoppingList> = {};
    for (const item of shoppingList) {
      if (!showChecked && item.checked) continue;
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    }
    return groups;
  }, [shoppingList, showChecked]);

  // Calculate progress
  const checkedCount = shoppingList.filter((item) => item.checked).length;
  const totalCount = shoppingList.length;
  const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

  const handleToggleItem = (itemId: string) => {
    toggleShoppingItem(itemId);
  };

  const handleReset = () => {
    resetShoppingList();
    toast.success("Shopping list reset");
  };

  const handleMarkAllDone = () => {
    shoppingList.forEach((item) => {
      if (!item.checked) {
        toggleShoppingItem(item.id);
      }
    });
    toast.success("All items checked off!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-mono font-bold">Shopping List</h1>
          <p className="text-muted-foreground mt-1">
            Auto-generated from your meal plan. {totalCount} items total.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-1">
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          {checkedCount < totalCount && (
            <Button size="sm" onClick={handleMarkAllDone} className="gap-1">
              <Check className="h-4 w-4" />
              Done Shopping
            </Button>
          )}
        </div>
      </div>

      {/* Progress Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Shopping Progress</span>
            <span className="text-sm text-muted-foreground">
              {checkedCount} of {totalCount} items
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          {checkedCount === totalCount && totalCount > 0 && (
            <p className="text-sm text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
              <Check className="h-4 w-4" />
              All done! Ready to cook.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Toggle Checked Items */}
      <div className="flex items-center gap-2">
        <Button
          variant={showChecked ? "secondary" : "outline"}
          size="sm"
          onClick={() => setShowChecked(!showChecked)}
        >
          {showChecked ? "Hide" : "Show"} checked items
        </Button>
      </div>

      {/* Shopping List by Category */}
      <div className="space-y-4">
        {Object.entries(groupedItems).map(([category, items]) => (
          <Card key={category}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <span
                  className={cn(
                    "p-1.5 rounded-lg",
                    CATEGORY_COLORS[category] || "bg-muted"
                  )}
                >
                  {CATEGORY_ICONS[category] || <Package className="h-4 w-4" />}
                </span>
                {category}
                <Badge variant="secondary" className="ml-auto">
                  {items.filter((i) => !i.checked).length} left
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-lg transition-colors",
                      item.checked && "bg-muted/50"
                    )}
                  >
                    <Checkbox
                      id={item.id}
                      checked={item.checked}
                      onCheckedChange={() => handleToggleItem(item.id)}
                    />
                    <label
                      htmlFor={item.id}
                      className={cn(
                        "flex-1 cursor-pointer",
                        item.checked && "line-through text-muted-foreground"
                      )}
                    >
                      <span className="font-medium">{item.quantity}</span>{" "}
                      <span>{item.name}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {Object.keys(groupedItems).length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">
              {showChecked ? "No items in your list" : "All items checked off!"}
            </h3>
            <p className="text-muted-foreground mt-1">
              {showChecked
                ? "Add recipes to your meal plan to generate a shopping list"
                : "Great job! Toggle 'Show checked items' to see everything."}
            </p>
            {!showChecked && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setShowChecked(true)}
              >
                Show all items
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tips Card */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <ChefHat className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Pro tip</p>
              <p className="text-sm text-muted-foreground">
                Items are grouped by grocery store aisle to make shopping faster.
                Check off items as you shop!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 border-primary/20">
        <CardContent className="p-6 text-center">
          <h3 className="font-semibold text-lg">Never forget an ingredient again</h3>
          <p className="text-muted-foreground mt-1 mb-4">
            Sign up to auto-generate shopping lists from your meal plan
          </p>
          <Link href="/signup">
            <Button>Start Planning Free</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
