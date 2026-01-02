"use client";

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { QuickCartModalHeader } from "./quick-cart-modal-header";
import { QuickCartModalActions } from "./quick-cart-modal-actions";
import { QuickCartModalContent } from "./quick-cart-modal-content";
import { SubstitutionSheet } from "@/components/shopping-list/substitution-sheet";
import type { ShoppingListItem } from "@/types/shopping-list";
import type { SubstitutionItem } from "@/types/quick-cart";
import type { UnitSystem } from "@/lib/ingredient-scaler";

interface QuickCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ShoppingListItem[];
  isLoading: boolean;
  checkedCount: number;
  uncheckedCount: number;
  // Actions
  onToggleItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onAddItem: (text: string) => void;
  onClearChecked: () => void;
  onClearAll: () => void;
  onRemoveRecipeItems: (recipeId: string, recipeTitle: string) => void;
  onRefreshFromMealPlan: () => void;
  onCopyToClipboard: () => void;
  // Enhanced features
  storeMode: boolean;
  onToggleStoreMode: () => void;
  showRecipeSources: boolean;
  onToggleRecipeSources: () => void;
  expandedCategories: Set<string>;
  onToggleCategoryExpanded: (category: string) => void;
  categoryOrder: string[] | null;
  onUpdateCategoryOrder: (order: string[]) => void;
  pantryIngredients: Set<string>;
  onPantryToggle: (ingredient: string, isInPantry: boolean) => void;
  substitutionItem: SubstitutionItem | null;
  onSetSubstitutionItem: (item: SubstitutionItem | null) => void;
  userUnitSystem: UnitSystem;
}

export function QuickCartModal({
  isOpen,
  onClose,
  items,
  isLoading,
  checkedCount,
  uncheckedCount,
  onToggleItem,
  onRemoveItem,
  onAddItem,
  onClearChecked,
  onClearAll,
  onRemoveRecipeItems,
  onRefreshFromMealPlan,
  onCopyToClipboard,
  storeMode,
  onToggleStoreMode,
  showRecipeSources,
  onToggleRecipeSources,
  expandedCategories,
  onToggleCategoryExpanded,
  categoryOrder,
  onUpdateCategoryOrder,
  pantryIngredients,
  onPantryToggle,
  substitutionItem,
  onSetSubstitutionItem,
  userUnitSystem,
}: QuickCartModalProps) {
  const itemCount = items.length;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-[95vw] sm:max-w-[85vw] md:max-w-[75vw] lg:max-w-[70vw] h-[90vh] sm:h-[85vh] flex flex-col p-0 gap-0">
          {/* Header */}
          <QuickCartModalHeader
            itemCount={itemCount}
            checkedCount={checkedCount}
            storeMode={storeMode}
            onToggleStoreMode={onToggleStoreMode}
            onClearChecked={onClearChecked}
            onClearAll={onClearAll}
            onClose={onClose}
          />

          {/* Actions Bar */}
          <QuickCartModalActions
            pantryCount={pantryIngredients.size}
            showRecipeSources={showRecipeSources}
            onToggleRecipeSources={onToggleRecipeSources}
            onCopyToClipboard={onCopyToClipboard}
            onRefreshFromMealPlan={onRefreshFromMealPlan}
            onAddItem={onAddItem}
            isLoading={isLoading}
          />

          {/* Content */}
          <QuickCartModalContent
            items={items}
            isLoading={isLoading}
            storeMode={storeMode}
            showRecipeSources={showRecipeSources}
            expandedCategories={expandedCategories}
            onToggleCategoryExpanded={onToggleCategoryExpanded}
            categoryOrder={categoryOrder}
            onUpdateCategoryOrder={onUpdateCategoryOrder}
            pantryIngredients={pantryIngredients}
            onPantryToggle={onPantryToggle}
            onSubstitute={onSetSubstitutionItem}
            onRemoveRecipeItems={onRemoveRecipeItems}
            userUnitSystem={userUnitSystem}
            checkedCount={checkedCount}
            uncheckedCount={uncheckedCount}
            onClose={onClose}
          />
        </DialogContent>
      </Dialog>

      {/* Substitution Sheet (renders outside dialog to avoid z-index issues) */}
      <SubstitutionSheet
        isOpen={substitutionItem !== null}
        item={substitutionItem}
        onClose={() => onSetSubstitutionItem(null)}
      />
    </>
  );
}
