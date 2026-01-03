"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Confetti } from "@/components/ui/confetti";
import { BarcodeScanner } from "./barcode-scanner";
import { ScanResultModal } from "./scan-result-modal";
import { SubstitutionSheet } from "./substitution-sheet";
import { AddItemForm } from "./add-item-form";
import { ProgressBar } from "./progress-bar";
import { clearCheckedItems, clearShoppingList } from "@/app/actions/shopping-list";
import { STORE_FLOW_ORDER } from "@/types/shopping-list";
import type {
  ShoppingListWithItems,
  PantryItem,
} from "@/types/shopping-list";
import type { UnitSystem } from "@/lib/ingredient-scaler";
import { useOffline } from "@/lib/use-offline";
import {
  useShoppingListState,
  useCelebration,
  useCategoryDnd,
  useStoreMode,
  useShoppingListHandlers,
  useShoppingListRealtime,
} from "./hooks";
import { useShoppingListView } from "@/hooks/use-shopping-list-view";
import {
  OfflineIndicator,
  PlannedRecipesSection,
  ActionsToolbar,
  ClearAllDialog,
  ItemsList,
  useBarcodeHandlers,
  type PlannedRecipe,
} from "./shopping-list-view/index";

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
  // State Hooks
  // ─────────────────────────────────────────────────────────────────────────
  const state = useShoppingListState({
    items: shoppingList.items,
    initialPantryItems,
    initialCategoryOrder,
    initialShowRecipeSources,
  });

  const viewState = useShoppingListView({
    initialShowRecipeSources,
  });

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
    setPantryLookup,
    showPantryItems,
    setShowPantryItems,
    showRecipeSources,
    setShowRecipeSources,
    categoryOrder,
    setCategoryOrder,
    expandedCategories,
    setExpandedCategories,
    isSendingPlan,
    setIsSendingPlan,
    optimisticCooks,
    setOptimisticCooks,
    // Derived Data (memoized)
    groupedItems,
    sortedCategories,
    checkedCount,
    totalCount,
    pantryCount,
  } = state;

  const {
    isScannerOpen,
    setIsScannerOpen,
    scannedProduct,
    setScannedProduct,
    isLookingUp,
    setIsLookingUp,
    isScanResultOpen,
    setIsScanResultOpen,
    substitutionItem,
    setSubstitutionItem,
    isRecipesOpen,
    setIsRecipesOpen,
    clearAllDialogOpen,
    setClearAllDialogOpen,
    showConfetti,
    setShowConfetti,
  } = viewState;

  // ─────────────────────────────────────────────────────────────────────────
  // Feature Hooks
  // ─────────────────────────────────────────────────────────────────────────

  const router = useRouter();

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

  // Real-time sync for household shopping together
  const { isConnected: isRealtimeConnected } = useShoppingListRealtime({
    shoppingListId: shoppingList.id,
    enabled: !isOffline && !!shoppingList.id,
    onItemChange: () => {
      router.refresh();
    },
  });

  // Extract planned recipes from weekPlan
  const plannedRecipes: PlannedRecipe[] = weekPlan?.assignments
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
  // Handler Hooks
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

  const {
    handleBarcodeScanned,
    handleAddScannedToList,
    handleAddScannedToPantry,
  } = useBarcodeHandlers({
    onScannerClose: () => setIsScannerOpen(false),
    onResultOpen: () => setIsScanResultOpen(true),
    onLookupStart: () => setIsLookingUp(true),
    onLookupEnd: () => setIsLookingUp(false),
    onProductScanned: setScannedProduct,
    onRefresh: () => router.refresh(),
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Effects
  // ─────────────────────────────────────────────────────────────────────────

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

      {/* Barcode Scanner */}
      <BarcodeScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleBarcodeScanned}
      />

      {/* Scan Result Modal */}
      <ScanResultModal
        isOpen={isScanResultOpen}
        onClose={() => {
          setIsScanResultOpen(false);
          setScannedProduct(null);
        }}
        product={scannedProduct}
        isLoading={isLookingUp}
        onAddToList={handleAddScannedToList}
        onAddToPantry={handleAddScannedToPantry}
      />

      {/* Substitution Sheet */}
      <SubstitutionSheet
        isOpen={!!substitutionItem}
        onClose={() => setSubstitutionItem(null)}
        item={substitutionItem}
      />

      {/* Offline indicator */}
      {isOffline && <OfflineIndicator />}

      {/* Planned Recipes Accordion */}
      <PlannedRecipesSection
        recipes={plannedRecipes}
        isOpen={isRecipesOpen}
        onOpenChange={setIsRecipesOpen}
        weekStart={weekStart}
        cookNames={cookNames}
        cookColors={cookColors}
        onUpdateCook={handleUpdateCook}
        getCookForAssignment={getCookForAssignment}
      />

      {/* Add Item Form with Scan Button */}
      <AddItemForm
        newItem={newItem}
        setNewItem={setNewItem}
        newCategory={newCategory}
        setNewCategory={setNewCategory}
        isAdding={isAdding}
        onSubmit={handleAddItem}
        onScan={() => setIsScannerOpen(true)}
      />

      {/* Actions */}
      {shoppingList.items.length > 0 && (
        <ActionsToolbar
          pantryCount={pantryCount}
          checkedCount={checkedCount}
          showPantryItems={showPantryItems}
          showRecipeSources={showRecipeSources}
          storeMode={storeMode}
          isSendingPlan={isSendingPlan}
          isGenerating={isGenerating}
          hasCategoryOrder={!!categoryOrder}
          onTogglePantry={() => setShowPantryItems(!showPantryItems)}
          onToggleRecipeSources={handleToggleRecipeSources}
          onToggleStoreMode={handleToggleStoreMode}
          onSendPlan={handleSendPlan}
          onClearAll={() => setClearAllDialogOpen(true)}
          onCopyToClipboard={handleCopyToClipboard}
          onGenerateFromPlan={handleGenerateFromPlan}
          onSortForStore={() => setCategoryOrder([...STORE_FLOW_ORDER])}
          onResetOrder={handleResetOrder}
          onClearChecked={async () => { await clearCheckedItems(); }}
          hasPlannedRecipes={plannedRecipes.length > 0}
        />
      )}

      {/* Clear All Confirmation Dialog */}
      <ClearAllDialog
        isOpen={clearAllDialogOpen}
        onOpenChange={setClearAllDialogOpen}
        itemCount={shoppingList.items.length}
        onConfirm={() => clearShoppingList()}
      />

      {/* Shopping List Items by Category */}
      <ItemsList
        totalCount={totalCount}
        sortedCategories={sortedCategories}
        groupedItems={groupedItems}
        activeCategory={activeCategory}
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onPantryToggle={handlePantryToggle}
        onSubstitute={setSubstitutionItem}
        onRemoveRecipeItems={handleRemoveRecipeItems}
        onToggleCategory={handleToggleCategory}
        onGenerateFromPlan={handleGenerateFromPlan}
        expandedCategories={expandedCategories}
        showRecipeSources={showRecipeSources}
        storeMode={storeMode}
        isGenerating={isGenerating}
        userUnitSystem={userUnitSystem}
      />

      {/* Spacer for sticky progress bar on mobile */}
      {totalCount > 0 && <div className="h-20 sm:h-0" />}

      {/* Sticky Progress Bar */}
      <ProgressBar checkedCount={checkedCount} totalCount={totalCount} />
    </div>
  );
}
