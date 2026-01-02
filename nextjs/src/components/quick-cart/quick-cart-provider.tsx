"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useQuickCart } from "@/hooks/use-quick-cart";
import { QuickCartBubble } from "./quick-cart-bubble";
import { QuickCartModal } from "./quick-cart-modal";
import type { QuickCartContextValue } from "@/types/quick-cart";

const QuickCartContext = createContext<QuickCartContextValue | null>(null);

export function useQuickCartContext() {
  const context = useContext(QuickCartContext);
  if (!context) {
    throw new Error(
      "useQuickCartContext must be used within a QuickCartProvider"
    );
  }
  return context;
}

interface QuickCartProviderProps {
  children: ReactNode;
  isMobile: boolean;
}

export function QuickCartProvider({
  children,
  isMobile,
}: QuickCartProviderProps) {
  const quickCart = useQuickCart();

  return (
    <QuickCartContext.Provider value={quickCart}>
      {children}

      {/* Desktop: Floating bubble (hidden on mobile) */}
      {!isMobile && (
        <QuickCartBubble
          isOpen={quickCart.isOpen}
          onClick={quickCart.toggle}
          itemCount={quickCart.uncheckedCount}
        />
      )}

      {/* Enhanced Modal (shared between desktop/mobile) */}
      <QuickCartModal
        isOpen={quickCart.isOpen}
        onClose={quickCart.close}
        items={quickCart.items}
        isLoading={quickCart.isLoading}
        checkedCount={quickCart.checkedCount}
        uncheckedCount={quickCart.uncheckedCount}
        // Item actions
        onToggleItem={quickCart.toggleItem}
        onRemoveItem={quickCart.removeItem}
        onAddItem={async (text) => {
          await quickCart.addItem({ ingredient: text }, "quick_add");
        }}
        // Bulk actions
        onClearChecked={quickCart.clearCheckedItems}
        onClearAll={quickCart.clearAllItems}
        onRemoveRecipeItems={quickCart.removeRecipeItems}
        onRefreshFromMealPlan={quickCart.refreshFromMealPlan}
        onCopyToClipboard={quickCart.copyToClipboard}
        // Enhanced features
        storeMode={quickCart.storeMode}
        onToggleStoreMode={quickCart.toggleStoreMode}
        showRecipeSources={quickCart.showRecipeSources}
        onToggleRecipeSources={quickCart.toggleRecipeSources}
        expandedCategories={quickCart.expandedCategories}
        onToggleCategoryExpanded={quickCart.toggleCategoryExpanded}
        categoryOrder={quickCart.categoryOrder}
        onUpdateCategoryOrder={quickCart.updateCategoryOrder}
        pantryIngredients={quickCart.pantryIngredients}
        onPantryToggle={quickCart.togglePantryItem}
        substitutionItem={quickCart.substitutionItem}
        onSetSubstitutionItem={quickCart.setSubstitutionItem}
        userUnitSystem={quickCart.userUnitSystem}
      />
    </QuickCartContext.Provider>
  );
}
