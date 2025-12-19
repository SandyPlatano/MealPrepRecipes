"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GripVertical, RotateCcw, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { arrayMove } from "@dnd-kit/sortable";
import { useSettings } from "@/contexts/settings-context";
import type { CustomIngredientCategory } from "@/types/custom-ingredient-category";

interface CategoryOrderSectionProps {
  categories: CustomIngredientCategory[];
}

export function CategoryOrderSection({ categories }: CategoryOrderSectionProps) {
  const { settings, updateSettingsField } = useSettings();

  // Initialize order from settings or use default (category IDs in order)
  const defaultOrder = categories
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((c) => c.id);

  const [orderedIds, setOrderedIds] = useState<string[]>(
    settings.category_order || defaultOrder
  );
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Create a map for quick lookup
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  // Get ordered categories (filter out any that no longer exist)
  const orderedCategories = orderedIds
    .map((id) => categoryMap.get(id))
    .filter((c): c is CustomIngredientCategory => c !== undefined);

  // Add any new categories that aren't in the order yet
  const existingIds = new Set(orderedIds);
  const newCategories = categories.filter((c) => !existingIds.has(c.id));
  const allOrderedCategories = [...orderedCategories, ...newCategories];

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = async (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const newOrder = arrayMove(
      allOrderedCategories.map((c) => c.id),
      draggedIndex,
      index
    );

    setOrderedIds(newOrder);
    setDraggedIndex(null);
    setDragOverIndex(null);

    // Save to settings
    setIsSaving(true);
    await updateSettingsField("category_order", newOrder);
    setIsSaving(false);
    toast.success("Shopping route updated");
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleReset = async () => {
    setOrderedIds(defaultOrder);
    setIsSaving(true);
    await updateSettingsField("category_order", null);
    setIsSaving(false);
    toast.success("Reset to default order");
  };

  const hasCustomOrder =
    settings.category_order !== null &&
    settings.category_order !== undefined &&
    settings.category_order.length > 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Shopping Route</h3>
          <p className="text-sm text-muted-foreground">
            Drag categories to match your store layout
          </p>
        </div>
        {hasCustomOrder && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={isSaving}
          >
            <RotateCcw className="size-4 mr-2" />
            Reset
          </Button>
        )}
      </div>

      {/* Status Badge */}
      {hasCustomOrder && (
        <Badge variant="secondary" className="gap-1.5">
          <Check className="size-3" />
          Custom order saved
        </Badge>
      )}

      {/* Categories List */}
      <div className="flex flex-col gap-2">
        {allOrderedCategories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No categories available. Add ingredient categories first.
          </div>
        ) : (
          allOrderedCategories.map((category, index) => (
            <div
              key={category.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border bg-card transition-all cursor-grab active:cursor-grabbing",
                "hover:border-primary hover:shadow-sm",
                draggedIndex === index && "opacity-50 scale-95",
                dragOverIndex === index && "border-primary border-dashed"
              )}
              style={{
                borderLeftColor: category.color,
                borderLeftWidth: "3px",
              }}
            >
              {/* Drag Handle */}
              <GripVertical className="size-5 text-muted-foreground flex-shrink-0" />

              {/* Emoji */}
              <div
                className="flex items-center justify-center w-8 h-8 rounded-md text-lg flex-shrink-0"
                style={{ backgroundColor: `${category.color}15` }}
              >
                {category.emoji || "—"}
              </div>

              {/* Name */}
              <span className="font-medium flex-1 truncate">{category.name}</span>

              {/* Position indicator */}
              <span className="text-xs text-muted-foreground tabular-nums">
                {index + 1}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Helper text */}
      {allOrderedCategories.length > 0 && (
        <p className="text-xs text-muted-foreground">
          💡 Tip: Arrange categories to match your grocery store layout for a more efficient shopping route.
        </p>
      )}
    </div>
  );
}
