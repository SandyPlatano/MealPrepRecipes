"use client";

import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { type ShoppingListItem } from "@/types/shopping-list";
import { type UnitSystem } from "@/lib/ingredient-scaler";
import { ShoppingItemRow } from "./shopping-item-row";

export interface SortableCategorySectionProps {
  category: string;
  items: (ShoppingListItem & { is_in_pantry?: boolean })[];
  onPantryToggle: (ingredient: string, isInPantry: boolean) => void;
  onSubstitute: (item: {
    id: string;
    ingredient: string;
    quantity?: string | null;
    unit?: string | null;
    recipe_id?: string | null;
    recipe_title?: string | null;
  }) => void;
  userUnitSystem: UnitSystem;
  showRecipeSources: boolean;
  onRemoveRecipeItems: (recipeId: string, recipeTitle: string) => void;
  isExpanded: boolean;
  onToggle: () => void;
  storeMode: boolean;
}

export const SortableCategorySection = memo(function SortableCategorySection({
  category,
  items,
  onPantryToggle,
  onSubstitute,
  userUnitSystem,
  showRecipeSources,
  onRemoveRecipeItems,
  isExpanded,
  onToggle,
  storeMode,
}: SortableCategorySectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: category,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const checkedCount = items.filter((i) => i.is_checked).length;
  const allChecked = checkedCount === items.length;

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <Card
        ref={setNodeRef}
        style={style}
        className={`${allChecked ? "opacity-60" : ""} ${
          isDragging ? "opacity-50 shadow-lg ring-2 ring-primary z-50" : ""
        }`}
      >
        <CollapsibleTrigger className="w-full">
          <CardHeader className="cursor-pointer">
            <CardTitle className="text-sm flex items-center justify-between">
              <span className="flex items-center">
                <div
                  {...attributes}
                  {...listeners}
                  className="cursor-grab active:cursor-grabbing touch-none -ml-2 rounded"
                  onClick={(e) => e.stopPropagation()}
                >
                  <GripVertical className="h-5 w-5" />
                </div>
                {category}
              </span>
              <span className="flex items-center">
                <span className="text-xs">
                  {checkedCount}/{items.length}
                </span>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </span>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent >
            <ul className="flex flex-col">
              {items.map((item) => (
                <ShoppingItemRow
                  key={item.id}
                  item={item}
                  onPantryToggle={onPantryToggle}
                  onSubstitute={onSubstitute}
                  userUnitSystem={userUnitSystem}
                  showRecipeSources={showRecipeSources}
                  onRemoveRecipeItems={onRemoveRecipeItems}
                  storeMode={storeMode}
                />
              ))}
            </ul>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
});

export interface CategoryCardOverlayProps {
  category: string;
  items: (ShoppingListItem & { is_in_pantry?: boolean })[];
}

export function CategoryCardOverlay({
  category,
  items,
}: CategoryCardOverlayProps) {
  const checkedCount = items.filter((i) => i.is_checked).length;

  return (
    <Card className="border-2">
      <CardHeader >
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center">
            <GripVertical className="h-4 w-4" />
            {category}
          </span>
          <span className="text-xs">
            {checkedCount}/{items.length}
          </span>
        </CardTitle>
      </CardHeader>
    </Card>
  );
}
