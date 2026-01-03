"use client";

/**
 * SortableWrapper - dnd-kit wrapper for drag-to-reorder functionality
 *
 * Encapsulates all dnd-kit setup and provides a simple interface
 * for making lists sortable.
 */

import type { ReactNode } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { GripVertical } from "lucide-react";
import type { BaseListItem } from "./types";

interface SortableWrapperProps<T extends BaseListItem> {
  items: T[];
  onReorder: (newItems: T[]) => void;
  children: ReactNode;
  disabled?: boolean;
}

/** Container that provides drag-and-drop context */
export function SortableWrapper<T extends BaseListItem>({
  items,
  onReorder,
  children,
  disabled = false,
}: SortableWrapperProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const reordered = [...items];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    onReorder(reordered);
  };

  if (disabled) {
    return <>{children}</>;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        {children}
      </SortableContext>
    </DndContext>
  );
}

interface SortableItemProps {
  id: string;
  children: ReactNode;
  disabled?: boolean;
}

/** Individual sortable item wrapper */
export function SortableItem({ id, children, disabled = false }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && "opacity-50 shadow-lg z-50")}
    >
      {children}
    </div>
  );
}

interface DragHandleProps {
  disabled?: boolean;
}

/** Drag handle component for sortable items */
export function DragHandle({ disabled = false }: DragHandleProps) {
  const { attributes, listeners } = useSortable({ id: "" });

  if (disabled) {
    return null;
  }

  return (
    <div
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing p-1 -ml-1 hover:bg-muted rounded transition-colors"
      onClick={(e) => e.stopPropagation()}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}

/** Hook to get sortable props for an item */
export function useSortableItem(id: string, disabled = false) {
  const sortable = useSortable({ id, disabled });
  return {
    ...sortable,
    dragHandleProps: {
      ...sortable.attributes,
      ...sortable.listeners,
    },
  };
}
