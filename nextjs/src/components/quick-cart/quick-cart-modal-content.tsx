"use client";

import Link from "next/link";
import { Loader2, ShoppingCart, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useState } from "react";
import { triggerHaptic } from "@/lib/haptics";
import { groupItemsByCategory, sortCategories } from "@/types/shopping-list";
import {
  SortableCategorySection,
  CategoryCardOverlay,
} from "@/components/shopping-list/sortable-category-section";
import type { ShoppingListItem } from "@/types/shopping-list";
import type { SubstitutionItem } from "@/types/quick-cart";
import type { UnitSystem } from "@/lib/ingredient-scaler";

interface QuickCartModalContentProps {
  items: ShoppingListItem[];
  isLoading: boolean;
  storeMode: boolean;
  showRecipeSources: boolean;
  expandedCategories: Set<string>;
  onToggleCategoryExpanded: (category: string) => void;
  categoryOrder: string[] | null;
  onUpdateCategoryOrder: (order: string[]) => void;
  pantryIngredients: Set<string>;
  onPantryToggle: (ingredient: string, isInPantry: boolean) => void;
  onSubstitute: (item: SubstitutionItem | null) => void;
  onRemoveRecipeItems: (recipeId: string, recipeTitle: string) => void;
  userUnitSystem: UnitSystem;
  checkedCount: number;
  uncheckedCount: number;
  onClose: () => void;
}

export function QuickCartModalContent({
  items,
  isLoading,
  storeMode,
  showRecipeSources,
  expandedCategories,
  onToggleCategoryExpanded,
  categoryOrder,
  onUpdateCategoryOrder,
  pantryIngredients,
  onPantryToggle,
  onSubstitute,
  onRemoveRecipeItems,
  userUnitSystem,
  checkedCount,
  uncheckedCount,
  onClose,
}: QuickCartModalContentProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Group items by category and add pantry status
  const grouped = groupItemsByCategory(items);
  const itemsWithPantry = Object.fromEntries(
    Object.entries(grouped).map(([category, categoryItems]) => [
      category,
      categoryItems.map((item) => ({
        ...item,
        is_in_pantry: pantryIngredients.has(item.ingredient.toLowerCase()),
      })),
    ])
  );

  // Sort categories by custom order or default
  const allCategories = Object.keys(grouped);
  const sortedCategories = categoryOrder
    ? [...allCategories].sort((a, b) => {
        const aIndex = categoryOrder.indexOf(a);
        const bIndex = categoryOrder.indexOf(b);
        if (aIndex === -1 && bIndex === -1) return sortCategories([a, b])[0] === a ? -1 : 1;
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      })
    : sortCategories(allCategories);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    triggerHaptic("light");
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = sortedCategories.indexOf(active.id as string);
      const newIndex = sortedCategories.indexOf(over.id as string);
      const newOrder = arrayMove(sortedCategories, oldIndex, newIndex);
      onUpdateCategoryOrder(newOrder);
      triggerHaptic("medium");
    }
  };

  const itemCount = items.length;
  const progressPercentage = itemCount > 0 ? (checkedCount / itemCount) * 100 : 0;

  // Store mode: only show one category at a time
  const categoriesToShow = storeMode
    ? sortedCategories.filter((cat) => {
        const catItems = itemsWithPantry[cat];
        return catItems.some((item) => !item.is_checked);
      }).slice(0, 1)
    : sortedCategories;

  return (
    <>
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ShoppingCart className="size-16 mx-auto mb-4 opacity-30" />
            <p className="font-medium text-lg">Your cart is empty</p>
            <p className="text-sm mt-1">Add items above or from recipes</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sortedCategories}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {categoriesToShow.map((category) => (
                  <SortableCategorySection
                    key={category}
                    category={category}
                    items={itemsWithPantry[category]}
                    onPantryToggle={onPantryToggle}
                    onSubstitute={(item) =>
                      onSubstitute({
                        id: item.id,
                        ingredient: item.ingredient,
                        quantity: item.quantity,
                        unit: item.unit,
                        recipe_id: item.recipe_id,
                        recipe_title: item.recipe_title,
                      })
                    }
                    userUnitSystem={userUnitSystem}
                    showRecipeSources={showRecipeSources}
                    onRemoveRecipeItems={onRemoveRecipeItems}
                    isExpanded={expandedCategories.has(category)}
                    onToggle={() => onToggleCategoryExpanded(category)}
                    storeMode={storeMode}
                  />
                ))}
              </div>
            </SortableContext>

            <DragOverlay>
              {activeId && itemsWithPantry[activeId] ? (
                <CategoryCardOverlay
                  category={activeId}
                  items={itemsWithPantry[activeId]}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Footer with Progress */}
      <div className="px-4 sm:px-6 py-4 border-t bg-muted/30 flex-shrink-0 space-y-3">
        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {checkedCount} of {itemCount} items
            </span>
            {progressPercentage === 100 && (
              <span className="text-green-600 font-medium">
                Shopping done!
              </span>
            )}
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Link to Full Page */}
        <Button asChild variant="outline" className="w-full">
          <Link href="/app/shop" onClick={onClose}>
            <ExternalLink className="size-4 mr-2" />
            View Full Shopping List
          </Link>
        </Button>
      </div>
    </>
  );
}
