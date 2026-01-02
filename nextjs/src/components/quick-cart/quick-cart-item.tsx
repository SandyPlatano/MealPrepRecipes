"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { ShoppingListItem } from "@/types/shopping-list";

interface QuickCartItemProps {
  item: ShoppingListItem;
  onToggle: () => void;
}

export function QuickCartItem({ item, onToggle }: QuickCartItemProps) {
  const displayText = [item.quantity, item.unit, item.ingredient]
    .filter(Boolean)
    .join(" ");

  return (
    <label
      className={cn(
        "flex items-center gap-3 py-2 px-2 -mx-2 rounded-lg cursor-pointer",
        "hover:bg-muted/50 transition-colors",
        item.is_checked && "opacity-60"
      )}
    >
      <Checkbox
        checked={item.is_checked}
        onCheckedChange={onToggle}
        className="shrink-0"
      />
      <span
        className={cn(
          "text-sm flex-1",
          item.is_checked && "line-through text-muted-foreground"
        )}
      >
        {displayText}
      </span>
      {item.recipe_title && (
        <span className="text-xs text-muted-foreground truncate max-w-[100px]">
          {item.recipe_title}
        </span>
      )}
    </label>
  );
}
