import { useState } from "react";
import {
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { toast } from "sonner";
import { triggerHaptic } from "@/lib/haptics";
import { updateSettings } from "@/app/actions/settings";

export interface CategoryDndState {
  sensors: ReturnType<typeof useSensors>;
  activeCategory: string | null;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragEnd: (event: DragEndEvent) => Promise<void>;
  handleResetOrder: () => Promise<void>;
}

export function useCategoryDnd(
  sortedCategories: string[],
  setCategoryOrder: (value: string[] | null) => void
): CategoryDndState {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    triggerHaptic("medium");
    setActiveCategory(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCategory(null);

    if (!over || active.id === over.id) return;

    triggerHaptic("success");
    const oldIndex = sortedCategories.indexOf(active.id as string);
    const newIndex = sortedCategories.indexOf(over.id as string);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newOrder = arrayMove(sortedCategories, oldIndex, newIndex);
      setCategoryOrder(newOrder);
      await updateSettings({ category_order: newOrder });
      toast.success("Shopping route saved");
    }
  };

  const handleResetOrder = async () => {
    setCategoryOrder(null);
    await updateSettings({ category_order: null });
    toast.success("Reset to default order");
  };

  return {
    sensors,
    activeCategory,
    handleDragStart,
    handleDragEnd,
    handleResetOrder,
  };
}
