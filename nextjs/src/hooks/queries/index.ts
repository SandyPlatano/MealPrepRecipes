/**
 * React Query hooks for data fetching with caching.
 *
 * These hooks wrap server actions and provide:
 * - Automatic caching with configurable staleTime
 * - Optimistic updates for mutations
 * - Cache invalidation on data changes
 * - Loading/error states
 *
 * Usage:
 *   import { useRecipes, useCreateRecipe } from "@/hooks/queries";
 *
 *   function MyComponent() {
 *     const { data: recipes, isLoading, error } = useRecipes();
 *     const createMutation = useCreateRecipe();
 *
 *     const handleCreate = async (formData) => {
 *       await createMutation.mutateAsync(formData);
 *     };
 *   }
 */

// Recipe hooks
export {
  recipeKeys,
  useRecipes,
  useRecipe,
  useCreateRecipe,
  useUpdateRecipe,
  useDeleteRecipe,
} from "./use-recipes-query";

// Meal plan hooks
export {
  mealPlanKeys,
  useWeekPlan,
  useGetOrCreateMealPlan,
  useAddMealAssignment,
  useRemoveMealAssignment,
  useRecipesForPlanning,
  usePrefetchWeekPlan,
} from "./use-meal-plan-query";

// Cooking history hooks
export {
  cookingHistoryKeys,
  useCookingHistory,
  useRecipeCookingHistory,
  useMarkAsCooked,
  useQuickRate,
  useUpdateCookingHistoryEntry,
  useDeleteCookingHistoryEntry,
} from "./use-cooking-history-query";

// Shopping list hooks
export {
  shoppingListKeys,
  useShoppingList,
  useAddShoppingListItem,
  useRemoveShoppingListItem,
  useRemoveItemsByRecipe,
} from "./use-shopping-list-query";
