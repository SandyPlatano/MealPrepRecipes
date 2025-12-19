"use client";

import { useState } from "react";
import {
  GripVertical,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  Plus,
  ExternalLink,
  Link as LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
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
import { useSidebar } from "@/components/sidebar/sidebar-context";
import { SidebarItemEditDialog } from "./sidebar-item-edit-dialog";
import { AddLinkToSectionDialog } from "./add-link-to-section-dialog";
import type {
  BuiltInSectionConfig,
  SectionItemConfig,
  CustomSectionItem,
  SidebarIconName,
} from "@/types/sidebar-customization";
import {
  isInternalLinkItem,
  isExternalLinkItem,
} from "@/types/sidebar-customization";
import {
  getIconComponent,
  DEFAULT_MEAL_PLANNING_ICONS,
} from "@/lib/sidebar/sidebar-icons";

// Built-in item metadata
const BUILTIN_ITEMS: Record<
  string,
  { label: string; href: string; defaultIcon: string }
> = {
  plan: { label: "Plan", href: "/app", defaultIcon: "Calendar" },
  "shopping-list": {
    label: "Shopping List",
    href: "/app/shop",
    defaultIcon: "ShoppingCart",
  },
  recipes: { label: "Recipes", href: "/app/recipes", defaultIcon: "BookOpen" },
  favorites: { label: "Favorites", href: "/app/history", defaultIcon: "Heart" },
  stats: { label: "Stats", href: "/app/stats", defaultIcon: "BarChart3" },
};

// Check if an item ID is a built-in
function isBuiltInItemId(id: string): boolean {
  return id in BUILTIN_ITEMS;
}

interface ItemData {
  id: string;
  type: "builtin" | "custom";
  label: string;
  sublabel: string;
  emoji: string | null;
  icon: SidebarIconName | null;
  hidden: boolean;
  builtinConfig?: SectionItemConfig;
  customItem?: CustomSectionItem;
}

export function MealPlanningItemsManager() {
  const {
    sections,
    updateBuiltInItem,
    reorderBuiltInItems,
    addCustomItemToBuiltInSection,
    removeCustomItemFromBuiltInSection,
    resetBuiltInItem,
  } = useSidebar();

  const [editingItem, setEditingItem] = useState<ItemData | null>(null);
  const [isAddingLink, setIsAddingLink] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Get the meal-planning section
  const mealPlanningSection = sections["meal-planning"] as
    | BuiltInSectionConfig
    | undefined;

  if (!mealPlanningSection) {
    return (
      <div className="text-sm text-muted-foreground p-4 text-center">
        Meal Planning section not found.
      </div>
    );
  }

  // Build ordered item list
  const orderedItems: ItemData[] = mealPlanningSection.itemOrder.map((id) => {
    if (isBuiltInItemId(id)) {
      // Built-in item
      const builtinMeta = BUILTIN_ITEMS[id];
      const config = mealPlanningSection.items[id];
      const DefaultIcon = DEFAULT_MEAL_PLANNING_ICONS[id];

      return {
        id,
        type: "builtin" as const,
        label: config?.customName || builtinMeta.label,
        sublabel: `Built-in • ${builtinMeta.href}`,
        emoji: config?.customEmoji || null,
        icon: config?.customIcon || null,
        hidden: config?.hidden || false,
        builtinConfig: config,
      };
    } else {
      // Custom item
      const customItem = mealPlanningSection.customItems.find(
        (item) => item.id === id
      );

      if (!customItem) {
        return {
          id,
          type: "custom" as const,
          label: "Unknown",
          sublabel: "Custom",
          emoji: null,
          icon: null,
          hidden: false,
        };
      }

      let label = "Unknown";
      let sublabel = "Custom";
      let emoji: string | null = null;

      if (isInternalLinkItem(customItem)) {
        label = customItem.label;
        sublabel = `Custom • ${customItem.href}`;
        emoji = customItem.emoji;
      } else if (isExternalLinkItem(customItem)) {
        label = customItem.label;
        sublabel = `External • ${customItem.url}`;
        emoji = customItem.emoji;
      }

      return {
        id,
        type: "custom" as const,
        label,
        sublabel,
        emoji,
        icon: null,
        hidden: false,
        customItem,
      };
    }
  });

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const itemIds = orderedItems.map((item) => item.id);
    const oldIndex = itemIds.indexOf(active.id as string);
    const newIndex = itemIds.indexOf(over.id as string);

    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = [...itemIds];
    newOrder.splice(oldIndex, 1);
    newOrder.splice(newIndex, 0, active.id as string);

    await reorderBuiltInItems("meal-planning", newOrder);
    toast.success("Item order updated");
  };

  const handleToggleVisibility = async (item: ItemData) => {
    if (item.type !== "builtin") return;

    await updateBuiltInItem("meal-planning", item.id, {
      hidden: !item.hidden,
    });
    toast.success(item.hidden ? "Item shown" : "Item hidden");
  };

  const handleEditItem = (item: ItemData) => {
    setEditingItem(item);
  };

  const handleSaveItem = async (
    name: string | null,
    emoji: string | null,
    icon: SidebarIconName | null
  ) => {
    if (!editingItem) return;

    if (editingItem.type === "builtin") {
      await updateBuiltInItem("meal-planning", editingItem.id, {
        customName: name,
        customEmoji: emoji,
        customIcon: icon,
      });
      toast.success("Item updated");
    }
    // Custom items would need a different update path - for now just close
    setEditingItem(null);
  };

  const handleResetItem = async () => {
    if (!editingItem || editingItem.type !== "builtin") return;

    await resetBuiltInItem("meal-planning", editingItem.id);
    toast.success("Item reset to default");
    setEditingItem(null);
  };

  const handleDeleteCustomItem = async (itemId: string) => {
    await removeCustomItemFromBuiltInSection("meal-planning", itemId);
    toast.success("Link removed");
  };

  const handleAddLink = async (
    item: Omit<CustomSectionItem, "id" | "sortOrder">
  ) => {
    await addCustomItemToBuiltInSection("meal-planning", item);
    toast.success("Link added");
    setIsAddingLink(false);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Items List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={orderedItems.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-1.5">
            {orderedItems.map((item) => (
              <SortableItem
                key={item.id}
                item={item}
                onToggleVisibility={() => handleToggleVisibility(item)}
                onEdit={() => handleEditItem(item)}
                onDelete={
                  item.type === "custom"
                    ? () => handleDeleteCustomItem(item.id)
                    : undefined
                }
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add Link Button */}
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => setIsAddingLink(true)}
      >
        <Plus className="size-4 mr-2" />
        Add Link
      </Button>

      {/* Edit Dialog */}
      {editingItem && (
        <SidebarItemEditDialog
          itemId={editingItem.id}
          currentName={
            editingItem.type === "builtin"
              ? editingItem.builtinConfig?.customName || null
              : null
          }
          currentEmoji={editingItem.emoji}
          currentIcon={editingItem.icon}
          open={!!editingItem}
          onClose={() => setEditingItem(null)}
          onSave={handleSaveItem}
          onReset={editingItem.type === "builtin" ? handleResetItem : undefined}
          isBuiltIn={editingItem.type === "builtin"}
        />
      )}

      {/* Add Link Dialog */}
      <AddLinkToSectionDialog
        open={isAddingLink}
        onClose={() => setIsAddingLink(false)}
        onAddItem={handleAddLink}
        existingHrefs={orderedItems
          .filter((item) => item.type === "builtin")
          .map((item) => BUILTIN_ITEMS[item.id]?.href)
          .filter(Boolean)}
      />
    </div>
  );
}

// Sortable item component
interface SortableItemProps {
  item: ItemData;
  onToggleVisibility: () => void;
  onEdit: () => void;
  onDelete?: () => void;
}

function SortableItem({
  item,
  onToggleVisibility,
  onEdit,
  onDelete,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Get icon component
  const IconComponent =
    item.type === "builtin"
      ? item.icon
        ? getIconComponent(item.icon)
        : DEFAULT_MEAL_PLANNING_ICONS[item.id]
      : item.customItem && isExternalLinkItem(item.customItem)
        ? ExternalLink
        : LinkIcon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 py-2.5 px-3 rounded-md bg-muted/50 group",
        isDragging && "opacity-50 shadow-md z-10",
        item.hidden && "opacity-50"
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-0.5 hover:bg-background rounded shrink-0"
      >
        <GripVertical className="size-4 text-muted-foreground" />
      </div>

      {/* Icon/Emoji */}
      <div className="flex items-center justify-center w-7 h-7 shrink-0">
        {item.emoji ? (
          <span className="text-base">{item.emoji}</span>
        ) : IconComponent ? (
          <IconComponent className="size-4 text-muted-foreground" />
        ) : (
          <LinkIcon className="size-4 text-muted-foreground" />
        )}
      </div>

      {/* Label & Sublabel */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium truncate",
            item.hidden && "line-through text-muted-foreground"
          )}
        >
          {item.label}
        </p>
        <p className="text-xs text-muted-foreground truncate">{item.sublabel}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Visibility Toggle (only for built-in) */}
        {item.type === "builtin" && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={onToggleVisibility}
            title={item.hidden ? "Show item" : "Hide item"}
          >
            {item.hidden ? (
              <EyeOff className="size-3.5" />
            ) : (
              <Eye className="size-3.5" />
            )}
          </Button>
        )}

        {/* Edit Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={onEdit}
          title="Edit item"
        >
          <Pencil className="size-3.5" />
        </Button>

        {/* Delete Button (only for custom) */}
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={onDelete}
            title="Remove link"
          >
            <Trash2 className="size-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
