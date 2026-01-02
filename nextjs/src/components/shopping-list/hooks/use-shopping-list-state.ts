"use client";

import { useState, useRef, useMemo } from "react";
import type {
  ShoppingListItem,
  PantryItem,
  GroupedShoppingItems,
} from "@/types/shopping-list";
import { groupItemsByCategory, sortCategories } from "@/types/shopping-list";
import { normalizeIngredientName } from "@/lib/ingredient-scaler";

/**
 * Substitution item type for the substitution sheet
 */
export interface SubstitutionItem {
  id: string;
  ingredient: string;
  quantity?: string | null;
  unit?: string | null;
  recipe_id?: string | null;
  recipe_title?: string | null;
}

/**
 * Extended shopping list item with pantry status
 */
export interface ShoppingListItemWithPantry extends ShoppingListItem {
  is_in_pantry: boolean;
}

/**
 * Options for initializing the shopping list state hook
 */
export interface ShoppingListStateOptions {
  items: ShoppingListItem[];
  initialPantryItems: PantryItem[];
  initialCategoryOrder: string[] | null;
  initialShowRecipeSources: boolean;
}

/**
 * Shopping list state - UI state and setters
 */
export interface ShoppingListUIState {
  // Add item form
  newItem: string;
  setNewItem: (value: string) => void;
  newCategory: string;
  setNewCategory: (value: string) => void;
  isAdding: boolean;
  setIsAdding: (value: boolean) => void;
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;

  // Visibility toggles
  showPantryItems: boolean;
  setShowPantryItems: (value: boolean) => void;
  showRecipeSources: boolean;
  setShowRecipeSources: (value: boolean) => void;

  // Category state
  categoryOrder: string[] | null;
  setCategoryOrder: (value: string[] | null) => void;
  expandedCategories: Set<string>;
  setExpandedCategories: React.Dispatch<React.SetStateAction<Set<string>>>;

  // UI state
  isRecipesOpen: boolean;
  setIsRecipesOpen: (value: boolean) => void;
  isSendingPlan: boolean;
  setIsSendingPlan: (value: boolean) => void;
  clearAllDialogOpen: boolean;
  setClearAllDialogOpen: (value: boolean) => void;

  // Optimistic updates
  optimisticCooks: Record<string, string | null>;
  setOptimisticCooks: React.Dispatch<React.SetStateAction<Record<string, string | null>>>;

  // Celebration
  showConfetti: boolean;
  setShowConfetti: (value: boolean) => void;
  prevCheckedCountRef: React.MutableRefObject<number | null>;

  // Substitution sheet
  substitutionItem: SubstitutionItem | null;
  setSubstitutionItem: (value: SubstitutionItem | null) => void;

  // Pantry lookup (for handlers)
  pantryLookup: Set<string>;
  setPantryLookup: React.Dispatch<React.SetStateAction<Set<string>>>;
}

/**
 * Shopping list derived data - memoized computed values
 */
export interface ShoppingListDerivedData {
  /** All items with is_in_pantry flag computed */
  itemsWithPantryStatus: ShoppingListItemWithPantry[];
  /** Filtered items based on showPantryItems toggle */
  visibleItems: ShoppingListItemWithPantry[];
  /** Items grouped by category */
  groupedItems: GroupedShoppingItems;
  /** Categories sorted by user preference */
  sortedCategories: string[];
  /** Count of checked items */
  checkedCount: number;
  /** Total visible item count */
  totalCount: number;
  /** Count of items in pantry */
  pantryCount: number;
}

/**
 * Complete shopping list state including UI state and derived data
 */
export interface ShoppingListState extends ShoppingListUIState, ShoppingListDerivedData {}

/**
 * Hook for managing shopping list state with memoized derived data
 *
 * @example
 * ```tsx
 * const state = useShoppingListState({
 *   items: shoppingList.items,
 *   initialPantryItems,
 *   initialCategoryOrder,
 *   initialShowRecipeSources,
 * });
 *
 * // Access derived data (memoized)
 * state.sortedCategories.map(category => ...)
 * state.groupedItems[category].map(item => ...)
 * ```
 */
export function useShoppingListState(
  options: ShoppingListStateOptions
): ShoppingListState {
  const {
    items,
    initialPantryItems,
    initialCategoryOrder,
    initialShowRecipeSources,
  } = options;

  // ─────────────────────────────────────────────────────────────────────────
  // UI State
  // ─────────────────────────────────────────────────────────────────────────

  // Add item form
  const [newItem, setNewItem] = useState("");
  const [newCategory, setNewCategory] = useState<string>("Other");
  const [isAdding, setIsAdding] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Pantry
  const [pantryLookup, setPantryLookup] = useState<Set<string>>(
    () => new Set(initialPantryItems.map((p) => p.normalized_ingredient))
  );
  const [showPantryItems, setShowPantryItems] = useState(false);

  // Recipe sources
  const [showRecipeSources, setShowRecipeSources] = useState(initialShowRecipeSources);

  // Category ordering
  const [categoryOrder, setCategoryOrder] = useState<string[] | null>(
    initialCategoryOrder
  );
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    () => new Set()
  );

  // Recipes accordion
  const [isRecipesOpen, setIsRecipesOpen] = useState(false);

  // Send plan
  const [isSendingPlan, setIsSendingPlan] = useState(false);

  // Clear all dialog
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false);

  // Optimistic cook assignments
  const [optimisticCooks, setOptimisticCooks] = useState<Record<string, string | null>>({});

  // Confetti celebration
  const [showConfetti, setShowConfetti] = useState(false);
  const prevCheckedCountRef = useRef<number | null>(null);

  // Substitution sheet
  const [substitutionItem, setSubstitutionItem] = useState<SubstitutionItem | null>(null);

  // ─────────────────────────────────────────────────────────────────────────
  // Derived Data (Memoized)
  // ─────────────────────────────────────────────────────────────────────────

  // Convert pantryLookup Set to array for stable dependency
  const pantryLookupArray = useMemo(
    () => Array.from(pantryLookup),
    [pantryLookup]
  );

  // Items with pantry status computed
  const itemsWithPantryStatus = useMemo(
    (): ShoppingListItemWithPantry[] =>
      items.map((item) => ({
        ...item,
        is_in_pantry: pantryLookup.has(normalizeIngredientName(item.ingredient)),
      })),
    [items, pantryLookupArray]
  );

  // Filtered items based on showPantryItems toggle
  const visibleItems = useMemo(
    (): ShoppingListItemWithPantry[] =>
      showPantryItems
        ? itemsWithPantryStatus
        : itemsWithPantryStatus.filter((item) => !item.is_in_pantry),
    [itemsWithPantryStatus, showPantryItems]
  );

  // Group items by category
  const groupedItems = useMemo(
    (): GroupedShoppingItems => groupItemsByCategory(visibleItems),
    [visibleItems]
  );

  // Sort categories by user preference
  const sortedCategories = useMemo(
    (): string[] => sortCategories(Object.keys(groupedItems), categoryOrder),
    [groupedItems, categoryOrder]
  );

  // Count of checked items
  const checkedCount = useMemo(
    () => visibleItems.filter((i) => i.is_checked).length,
    [visibleItems]
  );

  // Total visible item count
  const totalCount = visibleItems.length;

  // Count of items in pantry
  const pantryCount = useMemo(
    () => itemsWithPantryStatus.filter((i) => i.is_in_pantry).length,
    [itemsWithPantryStatus]
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Return combined state
  // ─────────────────────────────────────────────────────────────────────────

  return {
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
    prevCheckedCountRef,
    substitutionItem,
    setSubstitutionItem,

    // Derived Data
    itemsWithPantryStatus,
    visibleItems,
    groupedItems,
    sortedCategories,
    checkedCount,
    totalCount,
    pantryCount,
  };
}
