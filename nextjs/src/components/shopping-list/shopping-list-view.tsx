"use client";

import { useState, useEffect, useTransition, memo, useRef } from "react";
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
  Cookie,
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
import { updateMealAssignment } from "@/app/actions/meal-plans";
import {
  addToPantry,
  removeFromPantry,
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
import { triggerHaptic } from "@/lib/haptics";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, ChevronUp, CalendarDays, Mail, ChefHat } from "lucide-react";
import { GripVertical, RotateCcw, WifiOff, MoreVertical } from "lucide-react";
import { updateSettings } from "@/app/actions/settings";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  useOffline,
  setCachedShoppingList,
  getCachedShoppingList,
  type CachedShoppingList,
} from "@/lib/use-offline";
import { Confetti } from "@/components/ui/confetti";

interface ShoppingListViewProps {
  shoppingList: ShoppingListWithItems;
  initialPantryItems?: PantryItem[];
  initialCategoryOrder?: string[] | null;
  weekPlan?: Record<string, unknown> | null;
  weekStart?: string;
  cookNames?: string[];
  cookColors?: Record<string, string>;
}

export function ShoppingListView({
  shoppingList,
  initialPantryItems = [],
  initialCategoryOrder = null,
  weekPlan = null,
  weekStart,
  cookNames = [],
  cookColors = {},
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
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isRecipesOpen, setIsRecipesOpen] = useState(false);
  const [isSendingPlan, setIsSendingPlan] = useState(false);
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false);
  const [, startTransition] = useTransition();

  // Optimistic state for cook assignments (instant UI feedback)
  const [optimisticCooks, setOptimisticCooks] = useState<Record<string, string | null>>({});

  // Confetti celebration state
  const [showConfetti, setShowConfetti] = useState(false);
  const prevCheckedCountRef = useRef<number | null>(null);

  // Offline support
  const { isOffline } = useOffline();

  // Helper function to get cook badge color
  const getCookBadgeColor = (cook: string) => {
    if (cookColors[cook]) {
      return cookColors[cook];
    }
    // Default colors if not customized
    const defaultColors = [
      "#3b82f6", // blue
      "#a855f7", // purple
      "#10b981", // green
      "#f59e0b", // amber
      "#ec4899", // pink
      "#14b8a6", // teal
      "#f97316", // orange
    ];
    const index = cookNames.indexOf(cook);
    return index >= 0 ? defaultColors[index % defaultColors.length] : "#6b7280";
  };

  // Helper function to get date for a day of the week
  const getDateForDay = (day: string): string => {
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const dayIndex = daysOfWeek.indexOf(day);
    if (dayIndex === -1 || !weekStart) return "";
    const date = new Date(weekStart);
    date.setDate(date.getDate() + dayIndex);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Extract planned recipes from weekPlan
  const plannedRecipes = weekPlan?.assignments
    ? Object.entries(weekPlan.assignments).flatMap(([day, assignments]: [string, Record<string, unknown>[]]) =>
        assignments.map((assignment) => {
          const recipe = assignment.recipe as { title?: string; id?: string } | undefined;
          return {
            day,
            assignmentId: assignment.id as string,
            recipeName: recipe?.title || "Unknown Recipe",
            recipeId: recipe?.id,
            cook: assignment.cook as string | undefined,
            recipe: assignment.recipe,
          };
        })
      )
    : [];

  // Handler for updating cook assignment with optimistic updates
  const handleUpdateCook = async (assignmentId: string, cook: string | null) => {
    // Optimistically update local state immediately for instant UI feedback
    setOptimisticCooks(prev => ({ ...prev, [assignmentId]: cook }));

    startTransition(async () => {
      const result = await updateMealAssignment(assignmentId, { cook: cook || undefined });
      if (result.error) {
        // Rollback optimistic update on error
        setOptimisticCooks(prev => {
          const next = { ...prev };
          delete next[assignmentId];
          return next;
        });
        toast.error(result.error);
      }
    });
  };

  // Helper to get cook value with optimistic override
  const getCookForAssignment = (assignmentId: string, serverCook: string | undefined): string | undefined => {
    if (assignmentId in optimisticCooks) {
      const optimisticValue = optimisticCooks[assignmentId];
      return optimisticValue === null ? undefined : optimisticValue;
    }
    return serverCook;
  };

  // Handler for sending meal plan
  const handleSendPlan = async () => {
    if (plannedRecipes.length === 0) {
      toast.error("No planned meals to send");
      return;
    }

    setIsSendingPlan(true);
    try {
      const response = await fetch("/api/send-shopping-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekRange: `${new Date(weekStart!).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })} - ${new Date(new Date(weekStart!).getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}`,
          weekStart: weekStart,
          items: plannedRecipes.map((item) => ({
            recipe: item.recipe,
            cook: item.cook,
            day: item.day,
          })),
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error || "Failed to send plan");
      } else {
        toast.success(result.message || "Plan sent!");
      }
    } catch {
      toast.error("Failed to send plan");
    } finally {
      setIsSendingPlan(false);
    }
  };

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

  // Trigger confetti when all items are checked (and it's a meaningful change)
  useEffect(() => {
    const allChecked = checkedCount === totalCount && totalCount > 0;
    const wasNotAllChecked = prevCheckedCountRef.current !== null && prevCheckedCountRef.current < totalCount;

    if (allChecked && wasNotAllChecked) {
      setShowConfetti(true);
      triggerHaptic("success");
      setTimeout(() => setShowConfetti(false), 100);
    }

    prevCheckedCountRef.current = checkedCount;
  }, [checkedCount, totalCount]);

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
      const result = await generateFromMealPlan();
      
      if (result.error) {
        toast.error(result.error);
      } else if (result.count === 0) {
        toast.info("No meals planned for this week");
      } else {
        toast.success(`Added ${result.count} item${result.count !== 1 ? "s" : ""} to your list!`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error && error.message.includes("fetch")
        ? "Network error. Please check your connection and try again."
        : "Failed to generate shopping list";
      toast.error(errorMessage);
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


  // @dnd-kit sensors for drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Drag and drop handlers for category reordering
  const handleDragStart = (event: DragStartEvent) => {
    triggerHaptic("medium");
    setActiveCategory(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCategory(null);

    if (!over || active.id === over.id) return;

    triggerHaptic("success");
    const oldIndex = sortedCategories.indexOf(active.id as string);
    const newIndex = sortedCategories.indexOf(over.id as string);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newOrder = arrayMove(sortedCategories, oldIndex, newIndex);
      setCategoryOrder(newOrder);
      await updateSettings({ category_order: newOrder });
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
      {/* Confetti celebration when all items checked */}
      <Confetti active={showConfetti} />

      {/* Offline indicator */}
      {isOffline && (
        <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-600 dark:text-yellow-400">
          <WifiOff className="h-4 w-4" />
          <span className="text-sm font-medium">
            You&apos;re offline. Changes will sync when you reconnect.
          </span>
        </div>
      )}

      {/* Planned Recipes Accordion */}
      {plannedRecipes.length > 0 && (
        <Collapsible open={isRecipesOpen} onOpenChange={setIsRecipesOpen}>
          <Card>
            <CollapsibleTrigger className="w-full hover:bg-muted/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">
                      {plannedRecipes.length} Recipe{plannedRecipes.length !== 1 ? "s" : ""} This Week
                    </CardTitle>
                  </div>
                  {isRecipesOpen ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground transition-transform" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {plannedRecipes.map((item, index) => {
                    // Use optimistic cook value for instant UI feedback
                    const currentCook = getCookForAssignment(item.assignmentId, item.cook);
                    const cookColor = currentCook ? getCookBadgeColor(currentCook) : null;
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="min-w-[100px]">
                          <span className="font-medium text-primary text-sm block">
                            {item.day}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {getDateForDay(item.day)}
                          </span>
                        </div>
                        <span className="flex-1 text-sm font-medium">{item.recipeName}</span>
                        <Select
                          value={currentCook || "none"}
                          onValueChange={(value) => handleUpdateCook(item.assignmentId, value === "none" ? null : value)}
                        >
                          <SelectTrigger
                            className="h-8 w-[130px] text-xs"
                            style={cookColor ? {
                              borderLeft: `3px solid ${cookColor}`,
                            } : undefined}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ChefHat className="h-3 w-3 mr-1 flex-shrink-0" />
                            <SelectValue placeholder="Assign cook" />
                          </SelectTrigger>
                          <SelectContent
                            onCloseAutoFocus={(e) => e.preventDefault()}
                          >
                            <SelectItem value="none">No cook</SelectItem>
                            {cookNames.map((name) => {
                              const color = getCookBadgeColor(name);
                              return (
                                <SelectItem key={name} value={name}>
                                  <span className="flex items-center gap-2">
                                    <span
                                      className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                                      style={{ backgroundColor: color }}
                                      aria-hidden="true"
                                    />
                                    {name}
                                  </span>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
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
      {shoppingList.items.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {/* Send Meal Plan - Primary */}
          {plannedRecipes.length > 0 && (
            <Button variant="outline" onClick={handleSendPlan} disabled={isSendingPlan}>
              <Mail className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{isSendingPlan ? "Sending..." : "Send Meal Plan"}</span>
              <span className="sm:hidden">{isSendingPlan ? "..." : "Send"}</span>
            </Button>
          )}

          {/* Show Pantry Items */}
          {pantryCount > 0 && (
            <Button
              variant={showPantryItems ? "default" : "outline"}
              onClick={() => setShowPantryItems(!showPantryItems)}
            >
              <Cookie className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">
                {showPantryItems ? "Hide" : "Show"} Pantry ({pantryCount})
              </span>
              <span className="sm:hidden">
                Pantry ({pantryCount})
              </span>
            </Button>
          )}

          {/* Clear All Items */}
          <Button
            variant="outline"
            className="text-destructive hover:text-destructive"
            onClick={() => setClearAllDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Clear All</span>
            <span className="sm:hidden">Clear</span>
          </Button>

          {/* Three-Dot Menu - Secondary Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCopyToClipboard}>
                <Copy className="h-4 w-4 mr-2" />
                Copy List
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleGenerateFromPlan} disabled={isGenerating}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? "animate-spin" : ""}`} />
                Refresh from Meal Plan
              </DropdownMenuItem>
              {categoryOrder && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleResetOrder}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset Category Order
                  </DropdownMenuItem>
                </>
              )}
              {checkedCount > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => clearCheckedItems()}>
                    <Check className="h-4 w-4 mr-2" />
                    Clear Checked ({checkedCount})
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Clear All Confirmation Dialog */}
      <AlertDialog open={clearAllDialogOpen} onOpenChange={setClearAllDialogOpen}>
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

      {/* Progress */}
      {totalCount > 0 && (
        <div className="space-y-2">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${(checkedCount / totalCount) * 100}%` }}
            />
          </div>
          <div className="text-sm text-muted-foreground flex items-center justify-between">
            <span>
              {checkedCount} of {totalCount} items
            </span>
            {checkedCount === totalCount && totalCount > 0 && (
              <span className="text-green-600 font-medium">
                🎉 Shopping done!
              </span>
            )}
          </div>
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedCategories}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {sortedCategories.map((category) => (
                <SortableCategorySection
                  key={category}
                  category={category}
                  items={groupedItems[category]}
                  onPantryToggle={handlePantryToggle}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeCategory && (
              <CategoryCardOverlay
                category={activeCategory}
                items={groupedItems[activeCategory] || []}
              />
            )}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}

interface SortableCategorySectionProps {
  category: string;
  items: (ShoppingListItem & { is_in_pantry?: boolean })[];
  onPantryToggle: (ingredient: string, isInPantry: boolean) => void;
}

const SortableCategorySection = memo(function SortableCategorySection({
  category,
  items,
  onPantryToggle,
}: SortableCategorySectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: category,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const checkedCount = items.filter((i) => i.is_checked).length;
  const allChecked = checkedCount === items.length;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`${allChecked ? "opacity-60" : ""} ${
        isDragging ? "opacity-50 shadow-lg ring-2 ring-primary z-50" : ""
      }`}
    >
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span className="flex items-center gap-2">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing touch-none p-2 -ml-2 rounded hover:bg-muted"
            >
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>
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
});

function CategoryCardOverlay({
  category,
  items,
}: {
  category: string;
  items: (ShoppingListItem & { is_in_pantry?: boolean })[];
}) {
  const checkedCount = items.filter((i) => i.is_checked).length;

  return (
    <Card className="shadow-xl border-2 border-primary opacity-90">
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            {category}
          </span>
          <span className="text-xs text-muted-foreground font-normal">
            {checkedCount}/{items.length}
          </span>
        </CardTitle>
      </CardHeader>
    </Card>
  );
}

interface ShoppingItemRowProps {
  item: ShoppingListItem & { is_in_pantry?: boolean };
  onPantryToggle: (ingredient: string, isInPantry: boolean) => void;
}

const ShoppingItemRow = memo(function ShoppingItemRow({ item, onPantryToggle }: ShoppingItemRowProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [isTogglingPantry, setIsTogglingPantry] = useState(false);

  const handleToggle = async () => {
    triggerHaptic("selection");
    await toggleShoppingListItem(item.id);
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    await removeShoppingListItem(item.id);
  };

  const handlePantryToggle = async () => {
    triggerHaptic("light");
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
        className={`flex items-center gap-3 group py-1 ${
          item.is_in_pantry ? "opacity-50" : ""
        }`}
      >
        <Checkbox
          id={item.id}
          checked={item.is_checked}
          onCheckedChange={handleToggle}
          className="h-6 w-6 sm:h-5 sm:w-5"
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
              className={`h-10 w-10 sm:h-8 sm:w-8 flex-shrink-0 transition-opacity ${
                item.is_in_pantry
                  ? "opacity-100 text-green-600"
                  : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
              }`}
              onClick={handlePantryToggle}
              disabled={isTogglingPantry}
            >
              <Cookie className="h-5 w-5 sm:h-4 sm:w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {item.is_in_pantry
              ? "Remove from pantry"
              : "Mark as pantry staple"}
          </TooltipContent>
        </Tooltip>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 sm:h-8 sm:w-8 flex-shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
          onClick={handleRemove}
          disabled={isRemoving}
        >
          <Trash2 className="h-5 w-5 sm:h-4 sm:w-4" />
        </Button>
      </li>
    </TooltipProvider>
  );
});
