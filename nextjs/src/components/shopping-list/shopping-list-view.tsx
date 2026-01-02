"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Trash2,
  Check,
  RefreshCw,
  Copy,
  Cookie,
  BookOpen,
  Store,
} from "lucide-react";
import { toast } from "sonner";
import {
  clearCheckedItems,
  clearShoppingList,
} from "@/app/actions/shopping-list";
import {
  type ShoppingListWithItems,
  type ShoppingListItem,
  type PantryItem,
} from "@/types/shopping-list";
import { convertIngredientToSystem, type UnitSystem } from "@/lib/ingredient-scaler";
import { triggerHaptic } from "@/lib/haptics";
import {
  useShoppingListState,
  useCelebration,
  useCategoryDnd,
  useStoreMode,
  useShoppingListHandlers,
} from "./hooks";
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
import { RotateCcw, WifiOff, MoreVertical } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  DndContext,
  DragOverlay,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useOffline } from "@/lib/use-offline";
import { Confetti } from "@/components/ui/confetti";
import { SubstitutionSheet } from "./substitution-sheet";
import { SortableCategorySection, CategoryCardOverlay } from "./category-section";
import { AddItemForm } from "./add-item-form";
import { ProgressBar } from "./progress-bar";
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
  // ─────────────────────────────────────────────────────────────────────────
  // State Hook - all UI state and memoized derived data
  // ─────────────────────────────────────────────────────────────────────────
  const state = useShoppingListState({
    items: shoppingList.items,
    initialPantryItems,
    initialCategoryOrder,
    initialShowRecipeSources,
  });

  // Destructure for convenience
  const {
    // UI State
    newItem,
    setNewItem,
    newCategory,
    setNewCategory,
    isAdding,
    setIsAdding,
    isGenerating,
    setIsGenerating,
    pantryLookup,
    setPantryLookup,
    showPantryItems,
    setShowPantryItems,
    showRecipeSources,
    setShowRecipeSources,
    categoryOrder,
    setCategoryOrder,
    expandedCategories,
    setExpandedCategories,
    isRecipesOpen,
    setIsRecipesOpen,
    isSendingPlan,
    setIsSendingPlan,
    clearAllDialogOpen,
    setClearAllDialogOpen,
    optimisticCooks,
    setOptimisticCooks,
    showConfetti,
    setShowConfetti,
    substitutionItem,
    setSubstitutionItem,
    // Derived Data (memoized)
    itemsWithPantryStatus,
    visibleItems,
    groupedItems,
    sortedCategories,
    checkedCount,
    totalCount,
    pantryCount,
  } = state;

  // ─────────────────────────────────────────────────────────────────────────
  // Feature Hooks
  // ─────────────────────────────────────────────────────────────────────────

  // DnD for category reordering
  const {
    sensors,
    activeCategory,
    handleDragStart,
    handleDragEnd,
    handleResetOrder,
  } = useCategoryDnd(sortedCategories, setCategoryOrder);

  // Store mode with localStorage persistence and auto-advance
  const { storeMode, handleToggleStoreMode } = useStoreMode(
    expandedCategories,
    setExpandedCategories,
    sortedCategories,
    groupedItems
  );

  // Celebration - triggers confetti when all items checked
  useCelebration({
    checkedCount,
    totalCount,
    setShowConfetti,
  });

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

  // ─────────────────────────────────────────────────────────────────────────
  // Handler Hook - all action handlers and side effects
  // ─────────────────────────────────────────────────────────────────────────
  const {
    handleAddItem,
    handleGenerateFromPlan,
    handleCopyToClipboard,
    handlePantryToggle,
    handleUpdateCook,
    getCookForAssignment,
    handleSendPlan,
    handleToggleRecipeSources,
    handleToggleCategory,
    handleRemoveRecipeItems,
  } = useShoppingListHandlers({
    newItem,
    setNewItem,
    newCategory,
    setIsAdding,
    setIsGenerating,
    totalCount,
    sortedCategories,
    groupedItems,
    setPantryLookup,
    setOptimisticCooks,
    optimisticCooks,
    plannedRecipes,
    weekStart,
    setIsSendingPlan,
    setShowRecipeSources,
    setExpandedCategories,
    shoppingList,
    initialPantryItems,
  });

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
      <AddItemForm
        newItem={newItem}
        setNewItem={setNewItem}
        newCategory={newCategory}
        setNewCategory={setNewCategory}
        isAdding={isAdding}
        onSubmit={handleAddItem}
      />

      {/* Actions */}
      {shoppingList.items.length > 0 && (
        <div className="flex gap-2">
          {/* Main action buttons - evenly distributed */}
          <div className="flex gap-2 flex-1">
            {/* Email Meal Plan - Primary */}
            {plannedRecipes.length > 0 && (
              <Button variant="outline" className="flex-1 rounded-full border-gray-300 text-gray-900 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-100" onClick={handleSendPlan} disabled={isSendingPlan}>
                <Mail className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{isSendingPlan ? "Emailing..." : "Email Meal Plan"}</span>
                <span className="sm:hidden">{isSendingPlan ? "..." : "Email"}</span>
              </Button>
            )}

            {/* Show Pantry Items */}
            {pantryCount > 0 && (
              <Button
                variant={showPantryItems ? "default" : "outline"}
                className={`flex-1 rounded-full ${showPantryItems ? "bg-[#1A1A1A] hover:bg-[#1A1A1A]/90" : "border-gray-300 text-gray-900 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-100"}`}
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
            <div className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-full border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800">
              <BookOpen className="h-4 w-4 text-gray-700 dark:text-gray-300" />
              <span className="text-sm hidden sm:inline text-gray-900 dark:text-gray-100">Sources</span>
              <Switch
                checked={showRecipeSources}
                onCheckedChange={handleToggleRecipeSources}
                className="h-5 w-9"
              />
            </div>

            {/* Store Mode Toggle */}
            <Button
              variant={storeMode ? "default" : "outline"}
              className={`flex-1 rounded-full ${storeMode ? "bg-[#1A1A1A] hover:bg-[#1A1A1A]/90" : "border-gray-300 text-gray-900 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-100"}`}
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
              className="flex-1 rounded-full border-gray-300 text-gray-900 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-100"
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

      {/* Sticky Progress Bar */}
      <ProgressBar checkedCount={checkedCount} totalCount={totalCount} />
    </div>
  );
}
