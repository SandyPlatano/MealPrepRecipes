"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getShoppingListWithItems,
  addShoppingListItem,
  removeShoppingListItem,
  removeItemsByRecipeId,
} from "@/app/actions/shopping-list";
import type {
  ShoppingListWithItems,
  NewShoppingListItem,
  ShoppingListItem,
} from "@/types/shopping-list";

// Query keys for shopping list cache management
export const shoppingListKeys = {
  all: ["shopping-list"] as const,
  current: () => [...shoppingListKeys.all, "current"] as const,
};

/**
 * Hook to fetch the current shopping list with items.
 */
export function useShoppingList() {
  return useQuery({
    queryKey: shoppingListKeys.current(),
    queryFn: async () => {
      const result = await getShoppingListWithItems();
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data as ShoppingListWithItems;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - shopping list changes frequently
  });
}

/**
 * Hook to add an item to the shopping list with optimistic update.
 */
export function useAddShoppingListItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: NewShoppingListItem) => {
      const result = await addShoppingListItem(item);
      if (result.error) {
        throw new Error(result.error);
      }
      // Server doesn't return the created item, return the input for optimistic update
      return item;
    },
    onMutate: async (newItem) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: shoppingListKeys.current() });

      // Snapshot current data
      const previousList = queryClient.getQueryData<ShoppingListWithItems>(
        shoppingListKeys.current()
      );

      // Optimistically add the item
      if (previousList) {
        const optimisticItem: ShoppingListItem = {
          id: `temp-${Date.now()}`,
          shopping_list_id: previousList.id,
          ingredient: newItem.ingredient,
          quantity: newItem.quantity ?? null,
          unit: newItem.unit ?? null,
          category: newItem.category ?? "Other",
          is_checked: false,
          recipe_id: newItem.recipe_id ?? null,
          recipe_title: newItem.recipe_title ?? null,
          created_at: new Date().toISOString(),
        };

        queryClient.setQueryData<ShoppingListWithItems>(
          shoppingListKeys.current(),
          {
            ...previousList,
            items: [...previousList.items, optimisticItem],
          }
        );
      }

      return { previousList };
    },
    onError: (_err, _newItem, context) => {
      // Rollback on error
      if (context?.previousList) {
        queryClient.setQueryData(
          shoppingListKeys.current(),
          context.previousList
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: shoppingListKeys.current() });
    },
  });
}

/**
 * Hook to remove an item from the shopping list with optimistic update.
 */
export function useRemoveShoppingListItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const result = await removeShoppingListItem(itemId);
      if (result.error) {
        throw new Error(result.error);
      }
      return itemId;
    },
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: shoppingListKeys.current() });

      const previousList = queryClient.getQueryData<ShoppingListWithItems>(
        shoppingListKeys.current()
      );

      if (previousList) {
        queryClient.setQueryData<ShoppingListWithItems>(
          shoppingListKeys.current(),
          {
            ...previousList,
            items: previousList.items.filter((item) => item.id !== itemId),
          }
        );
      }

      return { previousList };
    },
    onError: (_err, _itemId, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(
          shoppingListKeys.current(),
          context.previousList
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: shoppingListKeys.current() });
    },
  });
}

/**
 * Hook to remove all items associated with a recipe.
 */
export function useRemoveItemsByRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recipeId: string) => {
      const result = await removeItemsByRecipeId(recipeId);
      if (result.error) {
        throw new Error(result.error);
      }
      return recipeId;
    },
    onMutate: async (recipeId) => {
      await queryClient.cancelQueries({ queryKey: shoppingListKeys.current() });

      const previousList = queryClient.getQueryData<ShoppingListWithItems>(
        shoppingListKeys.current()
      );

      if (previousList) {
        queryClient.setQueryData<ShoppingListWithItems>(
          shoppingListKeys.current(),
          {
            ...previousList,
            items: previousList.items.filter(
              (item) => item.recipe_id !== recipeId
            ),
          }
        );
      }

      return { previousList };
    },
    onError: (_err, _recipeId, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(
          shoppingListKeys.current(),
          context.previousList
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: shoppingListKeys.current() });
    },
  });
}
