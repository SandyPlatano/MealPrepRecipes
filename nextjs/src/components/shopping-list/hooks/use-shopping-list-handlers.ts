import { useTransition, useEffect } from "react";
import { toast } from "sonner";
import { triggerHaptic } from "@/lib/haptics";
import {
  addShoppingListItem,
  generateFromMealPlan,
  removeItemsByRecipeId,
  clearShoppingList,
} from "@/app/actions/shopping-list";
import { updateMealAssignment } from "@/app/actions/meal-plans";
import { updateShowRecipeSources, updateSettings } from "@/app/actions/settings";
import {
  addToPantry,
  removeFromPantry,
} from "@/app/actions/pantry";
import { normalizeIngredientName } from "@/lib/ingredient-scaler";
import {
  setCachedShoppingList,
  getCachedShoppingList,
  type CachedShoppingList,
} from "@/lib/use-offline";
import type { ShoppingListWithItems, PantryItem } from "@/types/shopping-list";

export interface ShoppingListHandlers {
  handleAddItem: (e: React.FormEvent) => Promise<void>;
  handleGenerateFromPlan: () => Promise<void>;
  handleCopyToClipboard: () => Promise<void>;
  handlePantryToggle: (ingredient: string, isInPantry: boolean) => void;
  handleUpdateCook: (assignmentId: string, cook: string | null) => Promise<void>;
  getCookForAssignment: (assignmentId: string, serverCook: string | undefined) => string | undefined;
  handleSendPlan: () => Promise<void>;
  handleToggleRecipeSources: (checked: boolean) => Promise<void>;
  handleToggleCategory: (category: string) => void;
  handleRemoveRecipeItems: (recipeId: string, recipeTitle: string) => Promise<void>;
}

interface HandlerDependencies {
  newItem: string;
  setNewItem: (value: string) => void;
  newCategory: string;
  setIsAdding: (value: boolean) => void;
  setIsGenerating: (value: boolean) => void;
  totalCount: number;
  sortedCategories: string[];
  groupedItems: Record<string, { is_checked?: boolean; quantity?: string | null; unit?: string | null; ingredient: string }[]>;
  setPantryLookup: React.Dispatch<React.SetStateAction<Set<string>>>;
  setOptimisticCooks: React.Dispatch<React.SetStateAction<Record<string, string | null>>>;
  optimisticCooks: Record<string, string | null>;
  plannedRecipes: { day: string; recipe: unknown; cook: string | undefined }[];
  weekStart?: string;
  setIsSendingPlan: (value: boolean) => void;
  setShowRecipeSources: (value: boolean) => void;
  setExpandedCategories: React.Dispatch<React.SetStateAction<Set<string>>>;
  shoppingList: ShoppingListWithItems;
  initialPantryItems: PantryItem[];
}

export function useShoppingListHandlers(deps: HandlerDependencies): ShoppingListHandlers {
  const [, startTransition] = useTransition();

  const {
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
  } = deps;

  // Refresh pantry lookup when initialPantryItems changes
  useEffect(() => {
    setPantryLookup(
      new Set(initialPantryItems.map((p) => p.normalized_ingredient))
    );
  }, [initialPantryItems, setPantryLookup]);

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

  const handleUpdateCook = async (assignmentId: string, cook: string | null) => {
    setOptimisticCooks(prev => ({ ...prev, [assignmentId]: cook }));

    startTransition(async () => {
      const result = await updateMealAssignment(assignmentId, { cook: cook || undefined });
      if (result.error) {
        setOptimisticCooks(prev => {
          const next = { ...prev };
          delete next[assignmentId];
          return next;
        });
        toast.error(result.error);
      }
    });
  };

  const getCookForAssignment = (assignmentId: string, serverCook: string | undefined): string | undefined => {
    if (assignmentId in optimisticCooks) {
      const optimisticValue = optimisticCooks[assignmentId];
      return optimisticValue === null ? undefined : optimisticValue;
    }
    return serverCook;
  };

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

  const handleToggleRecipeSources = async (checked: boolean) => {
    setShowRecipeSources(checked);
    await updateShowRecipeSources(checked);
  };

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

  const handleRemoveRecipeItems = async (recipeId: string, recipeTitle: string) => {
    const result = await removeItemsByRecipeId(recipeId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Removed ${result.count} item${result.count !== 1 ? "s" : ""} from ${recipeTitle}`);
    }
  };

  return {
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
  };
}
