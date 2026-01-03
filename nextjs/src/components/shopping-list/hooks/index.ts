/**
 * Shopping List Hooks
 *
 * Extracted from shopping-list-view.tsx for better composability,
 * testability, and memoization of derived data.
 */

// Core state hook with memoized derived data
export {
  useShoppingListState,
  type ShoppingListState,
  type ShoppingListStateOptions,
  type ShoppingListUIState,
  type ShoppingListDerivedData,
  type ShoppingListItemWithPantry,
  type SubstitutionItem,
} from "./use-shopping-list-state";

// Store mode with localStorage persistence and auto-advance
export {
  useStoreMode,
  type StoreModeState,
} from "./use-store-mode";

// Category drag-and-drop for reordering
export {
  useCategoryDnd,
  type CategoryDndState,
} from "./use-category-dnd";

// Action handlers (add, generate, copy, clear, etc.)
export {
  useShoppingListHandlers,
  type ShoppingListHandlers,
} from "./use-shopping-list-handlers";

// Celebration (confetti) hook
export { useCelebration, type UseCelebrationOptions } from "./use-celebration";

// Real-time sync for household shopping
export { useShoppingListRealtime } from "./use-shopping-list-realtime";
