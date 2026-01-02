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
  BookOpen,
  ExternalLink,
  Store,
} from "lucide-react";
import { toast } from "sonner";
import {
  addShoppingListItem,
  toggleShoppingListItem,
  removeShoppingListItem,
  clearCheckedItems,
  clearShoppingList,
  generateFromMealPlan,
  removeItemsByRecipeId,
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
import { normalizeIngredientName, convertIngredientToSystem, type UnitSystem } from "@/lib/ingredient-scaler";
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
import { updateSettings, updateShowRecipeSources } from "@/app/actions/settings";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";
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
import { SubstitutionButton } from "./substitution-button";
import { SwipeableShoppingItem } from "./swipeable-shopping-item";
import { SubstitutionSheet } from "./substitution-sheet";
import { EmptyState } from "@/components/ui/empty-state";
import { ShoppingCart } from "lucide-react";

interface ShoppingListViewProps {
  shoppingList: ShoppingListWithItems;
  initialPantryItems?: PantryItem[];
  initialCategoryOrder?: string[] | null;
  weekPlan?: Record<string, unknown> | null;
  weekStart?: string;
  cookNames?: string[];
  cookColors?: Record<string, string>;
  userUnitSystem?: UnitSystem;
  initialShowRecipeSources?: boolean;
}

export function ShoppingListView({
  shoppingList,
  initialPantryItems = [],
  initialCategoryOrder = null,
  weekPlan = null,
  weekStart,
  cookNames = [],
  cookColors = {},
  userUnitSystem = "imperial",
  initialShowRecipeSources = false,
}: ShoppingListViewProps) {
  const [newItem, setNewItem] = useState("");
  const [newCategory, setNewCategory] = useState<string>("Other");
  const [isAdding, setIsAdding] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pantryLookup, setPantryLookup] = useState<Set<string>>(
    new Set(initialPantryItems.map((p) => p.normalized_ingredient))
  );
  const [showPantryItems, setShowPantryItems] = useState(false);
  const [showRecipeSources, setShowRecipeSources] = useState(initialShowRecipeSources);
  const [categoryOrder, setCategoryOrder] = useState<string[] | null>(
    initialCategoryOrder
  );
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [storeMode, setStoreMode] = useState(false);
  const [isRecipesOpen, setIsRecipesOpen] = useState(false);
  const [isSendingPlan, setIsSendingPlan] = useState(false);
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false);
  const [, startTransition] = useTransition();

  // Optimistic state for cook assignments (instant UI feedback)
  const [optimisticCooks, setOptimisticCooks] = useState<Record<string, string | null>>({});

  // Confetti celebration state
  const [showConfetti, setShowConfetti] = useState(false);
  const prevCheckedCountRef = useRef<number | null>(null);

  // Substitution sheet state
  const [substitutionItem, setSubstitutionItem] = useState<{
    id: string;
    ingredient: string;
    quantity?: string | null;
    unit?: string | null;
    recipe_id?: string | null;
    recipe_title?: string | null;
  } | null>(null);

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
  // Using UTC timezone for consistent server/client rendering
  const getDateForDay = (day: string): string => {
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const dayIndex = daysOfWeek.indexOf(day);
    if (dayIndex === -1 || !weekStart) return "";
    const date = new Date(weekStart);
    date.setDate(date.getDate() + dayIndex);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
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
            timeZone: "UTC",
          })} - ${new Date(new Date(weekStart!).getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            timeZone: "UTC",
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

  // Toggle recipe sources visibility and persist to settings
  const handleToggleRecipeSources = async (checked: boolean) => {
    setShowRecipeSources(checked);
    await updateShowRecipeSources(checked);
  };

  // Toggle category expansion (accordion behavior on mobile)
  const handleToggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  // Auto-expand first category with unchecked items on initial load
  useEffect(() => {
    if (sortedCategories.length > 0 && expandedCategories.size === 0) {
      const firstWithUnchecked = sortedCategories.find(cat =>
        groupedItems[cat]?.some(item => !item.is_checked)
      );
      if (firstWithUnchecked) {
        setExpandedCategories(new Set([firstWithUnchecked]));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Store Mode: Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("shopping-store-mode");
    if (saved === "true") {
      setStoreMode(true);
    }
  }, []);

  // Store Mode: Toggle handler with localStorage persistence
  const handleToggleStoreMode = () => {
    const newValue = !storeMode;
    setStoreMode(newValue);
    localStorage.setItem("shopping-store-mode", String(newValue));
    triggerHaptic("medium");

    if (newValue) {
      // Entering store mode: collapse all, expand first with unchecked
      const firstWithUnchecked = sortedCategories.find(cat =>
        groupedItems[cat]?.some(item => !item.is_checked)
      );
      if (firstWithUnchecked) {
        setExpandedCategories(new Set([firstWithUnchecked]));
      } else {
        setExpandedCategories(new Set());
      }
      toast.success("Store Mode activated - focus on one category at a time");
    } else {
      toast.success("Store Mode deactivated");
    }
  };

  // Store Mode: Auto-advance to next category when current is completed
  useEffect(() => {
    if (!storeMode || expandedCategories.size === 0) return;

    // Check if all expanded categories are complete
    const expandedArray = Array.from(expandedCategories);
    const allExpandedComplete = expandedArray.every(cat => {
      const items = groupedItems[cat];
      return items?.every(item => item.is_checked);
    });

    if (allExpandedComplete) {
      // Find next category with unchecked items
      const nextWithUnchecked = sortedCategories.find(cat =>
        !expandedCategories.has(cat) && groupedItems[cat]?.some(item => !item.is_checked)
      );

      if (nextWithUnchecked) {
        triggerHaptic("success");
        setExpandedCategories(new Set([nextWithUnchecked]));
        toast.success(`Moving to ${nextWithUnchecked}`, { duration: 2000 });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeMode, groupedItems]);

  // Remove all items from a specific recipe
  const handleRemoveRecipeItems = async (recipeId: string, recipeTitle: string) => {
    const result = await removeItemsByRecipeId(recipeId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Removed ${result.count} item${result.count !== 1 ? "s" : ""} from ${recipeTitle}`);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Confetti celebration when all items checked */}
      <Confetti active={showConfetti} />

      {/* Substitution Sheet */}
      <SubstitutionSheet
        isOpen={!!substitutionItem}
        onClose={() => setSubstitutionItem(null)}
        item={substitutionItem}
      />

      {/* Offline indicator */}
      {isOffline && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 dark:bg-yellow-950/20 dark:border-yellow-800 dark:text-yellow-400">
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
                    <CalendarDays className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                    <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
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
                <div className="flex flex-col gap-2">
                  {plannedRecipes.map((item, index) => {
                    // Use optimistic cook value for instant UI feedback
                    const currentCook = getCookForAssignment(item.assignmentId, item.cook);
                    const cookColor = currentCook ? getCookBadgeColor(currentCook) : null;
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors dark:border-gray-800 dark:hover:bg-gray-800/50"
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
          <CardTitle className="text-lg text-gray-900 dark:text-gray-100">Add Item</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddItem} className="flex gap-2">
            <Input
              placeholder="Add ingredient..."
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              className="flex-1 border-gray-200 focus:border-[#D9F99D] focus:ring-1 focus:ring-[#D9F99D] dark:border-gray-700"
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
            <Button type="submit" disabled={isAdding || !newItem.trim()} className="bg-[#1A1A1A] hover:bg-[#1A1A1A]/90 text-white rounded-full">
              <Plus className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Actions */}
      {shoppingList.items.length > 0 && (
        <div className="flex gap-2">
          {/* Main action buttons - evenly distributed */}
          <div className="flex gap-2 flex-1">
            {/* Email Meal Plan - Primary */}
            {plannedRecipes.length > 0 && (
              <Button variant="outline" className="flex-1 rounded-full border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300" onClick={handleSendPlan} disabled={isSendingPlan}>
                <Mail className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{isSendingPlan ? "Emailing..." : "Email Meal Plan"}</span>
                <span className="sm:hidden">{isSendingPlan ? "..." : "Email"}</span>
              </Button>
            )}

            {/* Show Pantry Items */}
            {pantryCount > 0 && (
              <Button
                variant={showPantryItems ? "default" : "outline"}
                className={`flex-1 rounded-full ${showPantryItems ? "bg-[#1A1A1A] hover:bg-[#1A1A1A]/90" : "border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"}`}
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

            {/* Show Recipe Sources Toggle */}
            <div className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-full border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
              <BookOpen className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm hidden sm:inline text-gray-700 dark:text-gray-300">Sources</span>
              <Switch
                checked={showRecipeSources}
                onCheckedChange={handleToggleRecipeSources}
                className="h-5 w-9"
              />
            </div>

            {/* Store Mode Toggle */}
            <Button
              variant={storeMode ? "default" : "outline"}
              className={`flex-1 rounded-full ${storeMode ? "bg-[#1A1A1A] hover:bg-[#1A1A1A]/90" : "border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"}`}
              onClick={handleToggleStoreMode}
            >
              <Store className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">
                {storeMode ? "Exit Store" : "Store Mode"}
              </span>
              <span className="sm:hidden">
                {storeMode ? "Exit" : "Store"}
              </span>
            </Button>

            {/* Clear All Items */}
            <Button
              variant="outline"
              className="flex-1 rounded-full border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
              onClick={() => setClearAllDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Clear All</span>
              <span className="sm:hidden">Clear</span>
            </Button>
          </div>

          {/* Three-Dot Menu - Secondary Actions (fixed width) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="flex-shrink-0">
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

      {/* Shopping List Items by Category */}
      {totalCount === 0 ? (
        <EmptyState
          variant="card"
          icon={<ShoppingCart className="h-12 w-12 text-muted-foreground" />}
          title="Your shopping list is empty"
          description="Generate a shopping list from your meal plan or add items manually"
          action={
            <Button
              variant="outline"
              onClick={handleGenerateFromPlan}
              disabled={isGenerating}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? "animate-spin" : ""}`} />
              Generate from This Week
            </Button>
          }
        />
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
            <div className="flex flex-col gap-4">
              {sortedCategories.map((category) => (
                <SortableCategorySection
                  key={category}
                  category={category}
                  items={groupedItems[category]}
                  onPantryToggle={handlePantryToggle}
                  onSubstitute={setSubstitutionItem}
                  userUnitSystem={userUnitSystem}
                  showRecipeSources={showRecipeSources}
                  onRemoveRecipeItems={handleRemoveRecipeItems}
                  isExpanded={expandedCategories.has(category)}
                  onToggle={() => handleToggleCategory(category)}
                  storeMode={storeMode}
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

      {/* Spacer for sticky progress bar on mobile */}
      {totalCount > 0 && <div className="h-20 sm:h-0" />}

      {/* Sticky Progress Bar - Bottom anchored on mobile */}
      {totalCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 sm:relative sm:mt-6 bg-white/95 backdrop-blur-sm border-t border-gray-200 sm:border sm:rounded-lg p-4 sm:p-4 shadow-lg sm:shadow-sm z-40 safe-area-bottom dark:bg-gray-900/95 dark:border-gray-700">
          <div className="max-w-4xl mx-auto flex flex-col gap-2">
            <div className="h-3 sm:h-2 bg-gray-100 rounded-full overflow-hidden dark:bg-gray-800">
              <div
                className="h-full bg-[#D9F99D] transition-all duration-500 ease-out"
                style={{ width: `${(checkedCount / totalCount) * 100}%` }}
              />
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-between">
              <span className="font-medium">
                {checkedCount} of {totalCount} items
              </span>
              {checkedCount === totalCount && totalCount > 0 && (
                <span className="text-green-600 dark:text-green-400 font-medium">
                  Shopping done!
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface SortableCategorySectionProps {
  category: string;
  items: (ShoppingListItem & { is_in_pantry?: boolean })[];
  onPantryToggle: (ingredient: string, isInPantry: boolean) => void;
  onSubstitute: (item: {
    id: string;
    ingredient: string;
    quantity?: string | null;
    unit?: string | null;
    recipe_id?: string | null;
    recipe_title?: string | null;
  }) => void;
  userUnitSystem: UnitSystem;
  showRecipeSources: boolean;
  onRemoveRecipeItems: (recipeId: string, recipeTitle: string) => void;
  isExpanded: boolean;
  onToggle: () => void;
  storeMode: boolean;
}

const SortableCategorySection = memo(function SortableCategorySection({
  category,
  items,
  onPantryToggle,
  onSubstitute,
  userUnitSystem,
  showRecipeSources,
  onRemoveRecipeItems,
  isExpanded,
  onToggle,
  storeMode,
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
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <Card
        ref={setNodeRef}
        style={style}
        className={`${allChecked ? "opacity-60" : ""} ${
          isDragging ? "opacity-50 shadow-lg ring-2 ring-primary z-50" : ""
        }`}
      >
        <CollapsibleTrigger className="w-full text-left">
          <CardHeader className="py-3 hover:bg-muted/50 transition-colors cursor-pointer">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span className="flex items-center gap-2">
                <div
                  {...attributes}
                  {...listeners}
                  className="cursor-grab active:cursor-grabbing touch-none p-2 -ml-2 rounded hover:bg-muted"
                  onClick={(e) => e.stopPropagation()}
                >
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                </div>
                {category}
              </span>
              <span className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-normal">
                  {checkedCount}/{items.length}
                </span>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </span>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <ul className="flex flex-col gap-2">
              {items.map((item) => (
                <ShoppingItemRow
                  key={item.id}
                  item={item}
                  onPantryToggle={onPantryToggle}
                  onSubstitute={onSubstitute}
                  userUnitSystem={userUnitSystem}
                  showRecipeSources={showRecipeSources}
                  onRemoveRecipeItems={onRemoveRecipeItems}
                  storeMode={storeMode}
                />
              ))}
            </ul>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
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
  onSubstitute: (item: {
    id: string;
    ingredient: string;
    quantity?: string | null;
    unit?: string | null;
    recipe_id?: string | null;
    recipe_title?: string | null;
  }) => void;
  userUnitSystem: UnitSystem;
  showRecipeSources: boolean;
  onRemoveRecipeItems: (recipeId: string, recipeTitle: string) => void;
  storeMode: boolean;
}

const ShoppingItemRow = memo(function ShoppingItemRow({
  item,
  onPantryToggle,
  onSubstitute,
  userUnitSystem,
  showRecipeSources,
  onRemoveRecipeItems,
  storeMode,
}: ShoppingItemRowProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [isTogglingPantry, setIsTogglingPantry] = useState(false);

  const handleToggle = async () => {
    triggerHaptic("selection");
    const wasChecked = item.is_checked;
    await toggleShoppingListItem(item.id);

    // Show undo toast when checking off an item (not when unchecking)
    if (!wasChecked) {
      toast(`✓ ${item.ingredient} checked off`, {
        duration: 5000,
        action: {
          label: "Undo",
          onClick: async () => {
            triggerHaptic("light");
            await toggleShoppingListItem(item.id);
          },
        },
      });
    }
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

  // Build quantity display separately for visual prominence
  const quantityPart = [item.quantity, item.unit].filter(Boolean).join(" ");
  const convertedQuantity = quantityPart
    ? convertIngredientToSystem(quantityPart, userUnitSystem)
    : null;

  return (
    <SwipeableShoppingItem
      onSwipeComplete={handleToggle}
      disabled={item.is_checked}
      isChecked={item.is_checked}
    >
      <TooltipProvider>
        <li
          className={`flex items-center gap-3 group cursor-pointer rounded-md hover:bg-muted/50 -mx-2 px-2 transition-colors ${
            storeMode
              ? "min-h-[56px] py-3" // Larger targets in store mode
              : "min-h-[48px] py-2 sm:py-1 sm:min-h-0"
          } ${item.is_in_pantry ? "opacity-50" : ""}`}
          onClick={handleToggle}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleToggle();
            }
          }}
        >
        <Checkbox
          id={item.id}
          checked={item.is_checked}
          onCheckedChange={handleToggle}
          onClick={(e) => e.stopPropagation()}
          className="h-6 w-6 sm:h-5 sm:w-5 pointer-events-auto"
        />
        <span
          className={`flex-1 text-sm flex items-center gap-2 flex-wrap ${
            item.is_checked ? "line-through text-muted-foreground" : ""
          }`}
        >
          {/* Quantity - prominent display */}
          {convertedQuantity && (
            <span className="font-semibold text-primary min-w-[60px] tabular-nums">
              {convertedQuantity}
            </span>
          )}
          {/* Ingredient name - secondary */}
          <span className={convertedQuantity ? "text-muted-foreground" : ""}>
            {item.ingredient}
          </span>

          {/* Recipe Source Badge - only when toggle is ON */}
          {showRecipeSources && item.recipe_title && item.recipe_id && (
            <Popover>
              <PopoverTrigger asChild>
                <Badge
                  variant="secondary"
                  className="cursor-pointer text-xs px-2 py-0.5 hover:bg-secondary/80"
                  onClick={(e) => e.stopPropagation()}
                >
                  {item.recipe_title}
                </Badge>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2" align="start">
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start text-sm h-8"
                    asChild
                  >
                    <Link href={`/app/recipes/${item.recipe_id}`}>
                      <ExternalLink className="h-3.5 w-3.5 mr-2" />
                      View Recipe
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start text-sm h-8 text-destructive hover:text-destructive"
                    onClick={() => onRemoveRecipeItems(item.recipe_id!, item.recipe_title!)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    Remove all from recipe
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* Fallback for manually added items with no recipe */}
          {showRecipeSources && !item.recipe_id && (
            <Badge variant="outline" className="text-xs px-2 py-0.5 opacity-60">
              Manual
            </Badge>
          )}


          {item.is_in_pantry && (
            <span className="text-xs text-green-600">(in pantry)</span>
          )}
          {item.substituted_from && (
            <span className="text-xs text-blue-600">(was: {item.substituted_from})</span>
          )}
        </span>
        <SubstitutionButton
          onClick={() =>
            onSubstitute({
              id: item.id,
              ingredient: item.ingredient,
              quantity: item.quantity,
              unit: item.unit,
              recipe_id: item.recipe_id,
              recipe_title: item.recipe_title,
            })
          }
          disabled={item.is_checked}
        />
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
              onClick={(e) => {
                e.stopPropagation();
                handlePantryToggle();
              }}
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
          onClick={(e) => {
            e.stopPropagation();
            handleRemove();
          }}
          disabled={isRemoving}
        >
          <Trash2 className="h-5 w-5 sm:h-4 sm:w-4" />
        </Button>
        </li>
      </TooltipProvider>
    </SwipeableShoppingItem>
  );
});
