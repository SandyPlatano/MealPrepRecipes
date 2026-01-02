"use client";

import { useState, useCallback, useEffect, useTransition } from "react";
import { toast } from "sonner";
import type { ShoppingListItem, NewShoppingListItem } from "@/types/shopping-list";
import { groupItemsByCategory, sortCategories } from "@/types/shopping-list";
import type {
  QuickCartContextValue,
  ShoppingItemSource,
  AddFromRecipeResult,
  SubstitutionItem,
} from "@/types/quick-cart";
import type { UnitSystem } from "@/lib/ingredient-scaler";
import {
  getShoppingListWithItems,
  toggleShoppingListItem,
  removeShoppingListItem,
  quickAddItem,
  addIngredientsFromRecipe,
  addSingleIngredientFromRecipe,
  clearCheckedItems as clearCheckedItemsAction,
  clearShoppingList,
  removeItemsByRecipeId,
  generateFromMealPlan,
} from "@/app/actions/shopping-list";
import { getPantryItems } from "@/app/actions/pantry";

export function useQuickCart(): QuickCartContextValue {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Enhanced modal state
  const [storeMode, setStoreMode] = useState(false);
  const [showRecipeSources, setShowRecipeSources] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [categoryOrder, setCategoryOrder] = useState<string[] | null>(null);
  const [pantryIngredients, setPantryIngredients] = useState<Set<string>>(new Set());
  const [substitutionItem, setSubstitutionItem] = useState<SubstitutionItem | null>(null);
  const [userUnitSystem, setUserUnitSystem] = useState<UnitSystem>("metric");

  // Load items and pantry when panel opens
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [listResult, pantryResult] = await Promise.all([
        getShoppingListWithItems(),
        getPantryItems(),
      ]);

      if (listResult.error) {
        setError(listResult.error);
      } else if (listResult.data) {
        setItems(listResult.data.items);

        // Initialize expanded categories (all expanded by default)
        const grouped = groupItemsByCategory(listResult.data.items);
        setExpandedCategories(new Set(Object.keys(grouped)));
      }

      // Set pantry ingredients
      if (pantryResult.data) {
        const pantrySet = new Set(
          pantryResult.data.map((p) => p.ingredient.toLowerCase())
        );
        setPantryIngredients(pantrySet);
      }
    } catch (err) {
      setError("Failed to load shopping list");
      console.error("Quick cart refresh error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-refresh when opening
  useEffect(() => {
    if (isOpen) {
      refresh();
    }
  }, [isOpen, refresh]);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const addItem = useCallback(
    async (item: NewShoppingListItem, source: ShoppingItemSource) => {
      startTransition(async () => {
        let result;
        if (source === "recipe_direct" && item.recipe_id && item.recipe_title) {
          result = await addSingleIngredientFromRecipe(
            item.ingredient,
            item.recipe_id,
            item.recipe_title
          );
        } else {
          result = await quickAddItem(item.ingredient);
        }

        if (!result.error) {
          await refresh();
        } else {
          setError(result.error);
        }
      });
    },
    [refresh]
  );

  const addItemsFromRecipe = useCallback(
    async (
      ingredients: string[],
      recipeId: string,
      recipeTitle: string
    ): Promise<AddFromRecipeResult> => {
      const result = await addIngredientsFromRecipe(
        ingredients,
        recipeId,
        recipeTitle
      );
      if (!result.error) {
        await refresh();
      }
      return result;
    },
    [refresh]
  );

  const toggleItem = useCallback(
    async (itemId: string) => {
      // Optimistic update
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, is_checked: !item.is_checked } : item
        )
      );

      const result = await toggleShoppingListItem(itemId);
      if (result.error) {
        // Revert on error
        await refresh();
      }
    },
    [refresh]
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      // Optimistic update
      setItems((prev) => prev.filter((item) => item.id !== itemId));

      const result = await removeShoppingListItem(itemId);
      if (result.error) {
        await refresh();
        toast.error("Failed to remove item");
      }
    },
    [refresh]
  );

  // Bulk actions
  const clearCheckedItems = useCallback(async () => {
    const result = await clearCheckedItemsAction();
    if (result.error) {
      toast.error("Failed to clear checked items");
    } else {
      await refresh();
      toast.success("Cleared checked items");
    }
  }, [refresh]);

  const clearAllItems = useCallback(async () => {
    const result = await clearShoppingList();
    if (result.error) {
      toast.error("Failed to clear shopping list");
    } else {
      await refresh();
      toast.success("Cleared all items");
    }
  }, [refresh]);

  const removeRecipeItems = useCallback(
    async (recipeId: string, recipeTitle: string) => {
      const result = await removeItemsByRecipeId(recipeId);
      if (result.error) {
        toast.error("Failed to remove recipe items");
      } else {
        await refresh();
        toast.success(`Removed items from "${recipeTitle}"`);
      }
    },
    [refresh]
  );

  const refreshFromMealPlan = useCallback(async () => {
    const result = await generateFromMealPlan();
    if (result.error) {
      toast.error("Failed to refresh from meal plan");
    } else {
      await refresh();
    }
  }, [refresh]);

  // Enhanced modal actions
  const toggleStoreMode = useCallback(() => {
    setStoreMode((prev) => !prev);
  }, []);

  const toggleRecipeSources = useCallback(() => {
    setShowRecipeSources((prev) => !prev);
  }, []);

  const toggleCategoryExpanded = useCallback((category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }, []);

  const updateCategoryOrder = useCallback(async (order: string[]) => {
    setCategoryOrder(order);
    // Note: Category order is not persisted in this modal - it resets on close
  }, []);

  const togglePantryItem = useCallback(
    (ingredient: string, isInPantry: boolean) => {
      setPantryIngredients((prev) => {
        const next = new Set(prev);
        const key = ingredient.toLowerCase();
        if (isInPantry) {
          next.add(key);
        } else {
          next.delete(key);
        }
        return next;
      });
    },
    []
  );

  const copyToClipboard = useCallback(async () => {
    const grouped = groupItemsByCategory(items);
    const sortedCats = categoryOrder
      ? [...Object.keys(grouped)].sort((a, b) => {
          const aIdx = categoryOrder.indexOf(a);
          const bIdx = categoryOrder.indexOf(b);
          if (aIdx === -1 && bIdx === -1) return 0;
          if (aIdx === -1) return 1;
          if (bIdx === -1) return -1;
          return aIdx - bIdx;
        })
      : sortCategories(Object.keys(grouped));

    const lines: string[] = [];
    for (const category of sortedCats) {
      lines.push(`\n${category.toUpperCase()}`);
      for (const item of grouped[category]) {
        const check = item.is_checked ? "✓" : "○";
        const qty = [item.quantity, item.unit].filter(Boolean).join(" ");
        const line = qty
          ? `${check} ${qty} ${item.ingredient}`
          : `${check} ${item.ingredient}`;
        lines.push(line);
      }
    }

    const text = lines.join("\n").trim();
    await navigator.clipboard.writeText(text);
  }, [items, categoryOrder]);

  // Computed values
  const itemCount = items.length;
  const checkedCount = items.filter((i) => i.is_checked).length;
  const uncheckedCount = itemCount - checkedCount;

  return {
    // State
    isOpen,
    items,
    isLoading: isLoading || isPending,
    error,
    storeMode,
    showRecipeSources,
    expandedCategories,
    categoryOrder,
    pantryIngredients,
    substitutionItem,
    userUnitSystem,

    // UI actions
    open,
    close,
    toggle,

    // Item actions
    addItem,
    addItemsFromRecipe,
    toggleItem,
    removeItem,

    // Bulk actions
    clearCheckedItems,
    clearAllItems,
    removeRecipeItems,
    refreshFromMealPlan,

    // Enhanced modal actions
    toggleStoreMode,
    toggleRecipeSources,
    toggleCategoryExpanded,
    updateCategoryOrder,
    togglePantryItem,
    setSubstitutionItem,
    copyToClipboard,

    // Computed
    itemCount,
    checkedCount,
    uncheckedCount,

    // Refresh
    refresh,
  };
}
