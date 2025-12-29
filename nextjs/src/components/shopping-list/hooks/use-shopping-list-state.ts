import { useState, useRef } from "react";
import type { PantryItem } from "@/types/shopping-list";
import { normalizeIngredientName } from "@/lib/ingredient-scaler";

export interface ShoppingListState {
  newItem: string;
  setNewItem: (value: string) => void;
  newCategory: string;
  setNewCategory: (value: string) => void;
  isAdding: boolean;
  setIsAdding: (value: boolean) => void;
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;
  pantryLookup: Set<string>;
  setPantryLookup: React.Dispatch<React.SetStateAction<Set<string>>>;
  showPantryItems: boolean;
  setShowPantryItems: (value: boolean) => void;
  showRecipeSources: boolean;
  setShowRecipeSources: (value: boolean) => void;
  categoryOrder: string[] | null;
  setCategoryOrder: (value: string[] | null) => void;
  expandedCategories: Set<string>;
  setExpandedCategories: React.Dispatch<React.SetStateAction<Set<string>>>;
  isRecipesOpen: boolean;
  setIsRecipesOpen: (value: boolean) => void;
  isSendingPlan: boolean;
  setIsSendingPlan: (value: boolean) => void;
  clearAllDialogOpen: boolean;
  setClearAllDialogOpen: (value: boolean) => void;
  optimisticCooks: Record<string, string | null>;
  setOptimisticCooks: React.Dispatch<React.SetStateAction<Record<string, string | null>>>;
  showConfetti: boolean;
  setShowConfetti: (value: boolean) => void;
  prevCheckedCountRef: React.MutableRefObject<number | null>;
  substitutionItem: {
    id: string;
    ingredient: string;
    quantity?: string | null;
    unit?: string | null;
    recipe_id?: string | null;
    recipe_title?: string | null;
  } | null;
  setSubstitutionItem: (value: {
    id: string;
    ingredient: string;
    quantity?: string | null;
    unit?: string | null;
    recipe_id?: string | null;
    recipe_title?: string | null;
  } | null) => void;
}

export function useShoppingListState(
  initialPantryItems: PantryItem[],
  initialCategoryOrder: string[] | null,
  initialShowRecipeSources: boolean
): ShoppingListState {
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
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [isRecipesOpen, setIsRecipesOpen] = useState(false);
  const [isSendingPlan, setIsSendingPlan] = useState(false);
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false);
  const [optimisticCooks, setOptimisticCooks] = useState<Record<string, string | null>>({});
  const [showConfetti, setShowConfetti] = useState(false);
  const prevCheckedCountRef = useRef<number | null>(null);
  const [substitutionItem, setSubstitutionItem] = useState<{
    id: string;
    ingredient: string;
    quantity?: string | null;
    unit?: string | null;
    recipe_id?: string | null;
    recipe_title?: string | null;
  } | null>(null);

  return {
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
  };
}
