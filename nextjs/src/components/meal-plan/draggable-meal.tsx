"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { GripVertical } from "lucide-react";

interface DraggableMealProps {
  id: string;
  children: React.ReactNode;
  disabled?: boolean;
}

export function DraggableMeal({ id, children, disabled = false }: DraggableMealProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id,
    disabled,
  });

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group/drag",
        isDragging && "opacity-40 z-10"
      )}
    >
      {/* Drag handle - visible on hover */}
      {!disabled && (
        <button
          type="button"
          {...listeners}
          {...attributes}
          className={cn(
            "absolute -left-6 top-1/2 -translate-y-1/2 p-1 rounded-md",
            "opacity-0 group-hover/drag:opacity-100 focus:opacity-100",
            "hover:bg-muted cursor-grab active:cursor-grabbing",
            "transition-opacity touch-none",
            "md:-left-7"
          )}
          aria-label="Drag to move meal"
        >
          <GripVertical className="size-4 text-muted-foreground" />
        </button>
      )}
      {children}
    </div>
  );
}
