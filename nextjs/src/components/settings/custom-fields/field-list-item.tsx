import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GripVertical, Eye, Filter, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CustomFieldDefinition } from "@/types/custom-fields";
import { FIELD_TYPE_META } from "./constants";

interface FieldListItemProps {
  field: CustomFieldDefinition;
  index: number;
  isDragging: boolean;
  draggedIndex: number | null;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  onEdit: (field: CustomFieldDefinition) => void;
  onDelete: (id: string) => void;
}

export function FieldListItem({
  field,
  index,
  isDragging,
  draggedIndex,
  onDragStart,
  onDragOver,
  onDragEnd,
  onEdit,
  onDelete,
}: FieldListItemProps) {
  const Icon = FIELD_TYPE_META[field.fieldType].icon;

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnd={onDragEnd}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border bg-card transition-all",
        isDragging && draggedIndex === index && "opacity-50",
        "hover:border-primary hover:shadow-sm"
      )}
    >
      <GripVertical className="size-5 text-muted-foreground cursor-grab active:cursor-grabbing" />
      <Icon className="size-5 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium">{field.name}</span>
          <Badge variant="outline" className="text-xs">
            {FIELD_TYPE_META[field.fieldType].label}
          </Badge>
        </div>
        {field.description && (
          <p className="text-sm text-muted-foreground truncate">
            {field.description}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1">
        {field.isRequired && (
          <Badge variant="secondary" className="text-xs">
            Required
          </Badge>
        )}
        {field.showInCard && (
          <Badge variant="secondary" className="text-xs">
            <Eye className="size-3 mr-1" />
            Card
          </Badge>
        )}
        {field.showInFilters && (
          <Badge variant="secondary" className="text-xs">
            <Filter className="size-3 mr-1" />
            Filter
          </Badge>
        )}
      </div>
      <Button variant="ghost" size="sm" onClick={() => onEdit(field)}>
        <Pencil className="size-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => onDelete(field.id)}>
        <Trash2 className="size-4 text-destructive" />
      </Button>
    </div>
  );
}
