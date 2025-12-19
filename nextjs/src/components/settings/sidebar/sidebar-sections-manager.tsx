"use client";

import { useState } from "react";
import { GripVertical, Pencil, Trash2, Eye, EyeOff, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import type { SectionConfig, BuiltInSectionId } from "@/types/sidebar-customization";
import { isBuiltInSection } from "@/types/sidebar-customization";
import { getIconComponent, DEFAULT_SECTION_ICONS } from "@/lib/sidebar/sidebar-icons";
import { SectionEditDialog } from "./section-edit-dialog";
import { CustomSectionDialog } from "./custom-section-dialog";

// Default labels for built-in sections
const DEFAULT_SECTION_LABELS: Record<BuiltInSectionId, string> = {
  "quick-nav": "Quick Nav",
  "pinned": "Pinned",
  "meal-planning": "Meal Planning",
  "collections": "Collections",
};

export function SidebarSectionsManager() {
  const {
    sections,
    sectionOrder,
    reorderSections,
    toggleSectionVisibility,
    updateSectionLabel,
    updateSectionEmoji,
    resetSection,
    addCustomSection,
    removeCustomSection,
  } = useSidebar();

  const [editingSection, setEditingSection] = useState<SectionConfig | null>(null);
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Get ordered sections
  const orderedSections = sectionOrder
    .map((id) => sections[id])
    .filter((s): s is SectionConfig => s !== undefined);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sectionOrder.indexOf(active.id as string);
    const newIndex = sectionOrder.indexOf(over.id as string);

    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = [...sectionOrder];
    newOrder.splice(oldIndex, 1);
    newOrder.splice(newIndex, 0, active.id as string);

    await reorderSections(newOrder);
    toast.success("Section order updated");
  };

  const handleToggleVisibility = async (sectionId: string) => {
    await toggleSectionVisibility(sectionId);
    const section = sections[sectionId];
    const wasHidden = section?.hidden;
    toast.success(wasHidden ? "Section shown" : "Section hidden");
  };

  const handleDeleteCustomSection = async (sectionId: string) => {
    await removeCustomSection(sectionId);
    toast.success("Custom section deleted");
  };

  const handleCreateCustomSection = async (title: string) => {
    const newId = await addCustomSection(title);
    if (newId) {
      toast.success("Custom section created");
      setIsCreatingCustom(false);
    }
  };

  const handleSaveEdit = async (label: string, emoji: string | null) => {
    if (!editingSection) return;

    await updateSectionLabel(editingSection.id, label);
    await updateSectionEmoji(editingSection.id, emoji);
    setEditingSection(null);
    toast.success("Section updated");
  };

  const handleReset = async () => {
    if (!editingSection || !isBuiltInSection(editingSection)) return;

    await resetSection(editingSection.id as BuiltInSectionId);
    setEditingSection(null);
    toast.success("Section reset to default");
  };

  return (
    <div className="flex flex-col gap-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sectionOrder}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2">
            {orderedSections.map((section) => (
              <SortableSectionCard
                key={section.id}
                section={section}
                onEdit={() => setEditingSection(section)}
                onToggleVisibility={() => handleToggleVisibility(section.id)}
                onDelete={
                  !isBuiltInSection(section)
                    ? () => handleDeleteCustomSection(section.id)
                    : undefined
                }
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => setIsCreatingCustom(true)}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Custom Section
      </Button>

      {/* Edit Dialog */}
      {editingSection && (
        <SectionEditDialog
          section={editingSection}
          open={!!editingSection}
          onClose={() => setEditingSection(null)}
          onSave={handleSaveEdit}
          onReset={
            isBuiltInSection(editingSection)
              ? handleReset
              : undefined
          }
        />
      )}

      {/* Create Custom Section Dialog */}
      <CustomSectionDialog
        open={isCreatingCustom}
        onClose={() => setIsCreatingCustom(false)}
        onCreate={handleCreateCustomSection}
      />
    </div>
  );
}

// Sortable card component
interface SortableSectionCardProps {
  section: SectionConfig;
  onEdit: () => void;
  onToggleVisibility: () => void;
  onDelete?: () => void;
}

function SortableSectionCard({
  section,
  onEdit,
  onToggleVisibility,
  onDelete,
}: SortableSectionCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Get display label
  const label = isBuiltInSection(section)
    ? section.customTitle || DEFAULT_SECTION_LABELS[section.id]
    : section.title;

  // Get emoji or icon
  const emoji = isBuiltInSection(section)
    ? section.customEmoji
    : section.emoji;
  const iconName = isBuiltInSection(section)
    ? section.customIcon
    : section.icon;
  const Icon = iconName
    ? getIconComponent(iconName)
    : DEFAULT_SECTION_ICONS[section.id as BuiltInSectionId] || null;

  const isCustom = !isBuiltInSection(section);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border bg-card",
        isDragging && "opacity-50 shadow-lg",
        section.hidden && "opacity-60"
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Icon/Emoji */}
      <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted shrink-0">
        {emoji ? (
          <span className="text-lg">{emoji}</span>
        ) : Icon ? (
          <Icon className="h-4 w-4 text-muted-foreground" />
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </div>

      {/* Label */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn("text-sm font-medium truncate", section.hidden && "text-muted-foreground")}>
            {label}
          </span>
          {!isCustom && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
              Built-in
            </Badge>
          )}
          {isCustom && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
              Custom
            </Badge>
          )}
        </div>
      </div>

      {/* Visibility Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          onToggleVisibility();
        }}
      >
        {section.hidden ? (
          <EyeOff className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </Button>

      {/* Edit Button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
      >
        <Pencil className="h-4 w-4" />
      </Button>

      {/* Delete Button (custom sections only) */}
      {onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
