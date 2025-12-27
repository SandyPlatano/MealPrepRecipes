"use client";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import type { DayOfWeek } from "@/types/meal-plan";

interface DroppableDayProps {
  day: DayOfWeek;
  children: React.ReactNode;
  className?: string;
}

export function DroppableDay({ day, children, className }: DroppableDayProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: day,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "transition-all duration-200 h-full",
        isOver && "ring-2 ring-primary ring-offset-2 rounded-xl scale-[1.01]",
        className
      )}
    >
      {children}
    </div>
  );
}
