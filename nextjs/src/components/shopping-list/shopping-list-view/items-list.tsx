import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ShoppingCart, RefreshCw } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { UnitSystem } from "@/lib/ingredient-scaler";
import { SortableCategorySection, CategoryCardOverlay } from "../category-section";
import type { ShoppingListItemWithPantry, SubstitutionItem } from "../hooks";
import type { ShoppingListItem } from "@/types/shopping-list";

interface ItemsListProps {
  // Data
  totalCount: number;
  sortedCategories: string[];
  groupedItems: Record<string, ShoppingListItem[]>;
  activeCategory: string | null;

  // DnD
  sensors: ReturnType<typeof import("@dnd-kit/core").useSensors>;
  onDragStart: (event: DragStartEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;

  // Handlers
  onPantryToggle: (itemId: string, inPantry: boolean) => void;
  onSubstitute: (item: SubstitutionItem) => void;
  onRemoveRecipeItems: (recipeId: string, recipeTitle: string) => void | Promise<void>;
  onToggleCategory: (category: string) => void;
  onGenerateFromPlan: () => void | Promise<void>;

  // State
  expandedCategories: Set<string>;
  showRecipeSources: boolean;
  storeMode: boolean;
  isGenerating: boolean;
  userUnitSystem: UnitSystem;
}

export function ItemsList({
  totalCount,
  sortedCategories,
  groupedItems,
  activeCategory,
  sensors,
  onDragStart,
  onDragEnd,
  onPantryToggle,
  onSubstitute,
  onRemoveRecipeItems,
  onToggleCategory,
  onGenerateFromPlan,
  expandedCategories,
  showRecipeSources,
  storeMode,
  isGenerating,
  userUnitSystem,
}: ItemsListProps) {
  if (totalCount === 0) {
    return (
      <EmptyState
        variant="card"
        icon={<ShoppingCart className="h-12 w-12 text-muted-foreground" />}
        title="Your shopping list is empty"
        description="Generate a shopping list from your meal plan or add items manually"
        action={
          <Button
            variant="outline"
            onClick={onGenerateFromPlan}
            disabled={isGenerating}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? "animate-spin" : ""}`} />
            Generate from This Week
          </Button>
        }
      />
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={sortedCategories}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-4">
          {sortedCategories.map((category) => (
            <SortableCategorySection
              key={category}
              category={category}
              items={groupedItems[category]}
              onPantryToggle={onPantryToggle}
              onSubstitute={onSubstitute}
              userUnitSystem={userUnitSystem}
              showRecipeSources={showRecipeSources}
              onRemoveRecipeItems={onRemoveRecipeItems}
              isExpanded={expandedCategories.has(category)}
              onToggle={() => onToggleCategory(category)}
              storeMode={storeMode}
            />
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeCategory && (
          <CategoryCardOverlay
            category={activeCategory}
            items={groupedItems[activeCategory] || []}
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}
