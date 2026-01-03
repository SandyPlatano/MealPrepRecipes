"use client";

/**
 * ListItem - Individual item card with optional drag handle
 *
 * Renders a clickable card with color accent, content, badges,
 * and action buttons.
 */

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ListItemProps {
  /** Unique item ID */
  id: string;
  /** Whether the item can be edited */
  editable?: boolean;
  /** Whether the item is a system item (non-deletable) */
  isSystem?: boolean;
  /** Color accent (shown as top border) */
  color?: string;
  /** Emoji to display */
  emoji?: string;
  /** Item content */
  children: ReactNode;
  /** Additional badges */
  badges?: ReactNode;
  /** Click handler (opens edit dialog) */
  onClick?: () => void;
  /** Delete handler */
  onDelete?: () => void;
  /** Whether drag is enabled */
  dragEnabled?: boolean;
}

export function ListItem({
  id,
  editable = true,
  isSystem = false,
  color,
  emoji,
  children,
  badges,
  onClick,
  onDelete,
  dragEnabled = false,
}: ListItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !dragEnabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const hasEmoji = emoji && emoji.trim() !== "";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all bg-card",
        editable && "cursor-pointer hover:border-primary/30",
        isDragging && "opacity-50 shadow-lg z-50"
      )}
      onClick={() => editable && onClick?.()}
    >
      {/* Color accent bar */}
      {color && (
        <div
          className="absolute top-0 left-0 right-0 h-1.5 rounded-t-lg"
          style={{ backgroundColor: color }}
        />
      )}

      {/* Drag handle */}
      {dragEnabled && (
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 -ml-1 hover:bg-muted rounded transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      )}

      {/* Emoji */}
      {hasEmoji && <span className="text-xl shrink-0">{emoji}</span>}

      {/* Content */}
      <div className="flex-1 min-w-0">{children}</div>

      {/* Badges */}
      <div className="flex items-center gap-2 shrink-0">
        {isSystem && (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            System
          </Badge>
        )}
        {badges}
      </div>

      {/* Delete button (hidden for system items) */}
      {!isSystem && onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
        </Button>
      )}
    </div>
  );
}
