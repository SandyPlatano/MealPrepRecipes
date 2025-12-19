"use client";

import { GripVertical, Eye, EyeOff, RectangleHorizontal, Square, RotateCcw } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type {
  RecipeSectionId,
  RecipeSectionConfig,
  RecipeSectionWidth,
  RecipeLayoutPreferences,
} from "@/types/recipe-layout";
import {
  RECIPE_SECTION_LABELS,
  RECIPE_SECTION_DESCRIPTIONS,
  reorderSections,
  toggleSectionVisibility,
  updateSectionWidth,
  resetToDefaultLayout,
} from "@/types/recipe-layout";

// Section icons for visual identification
const SECTION_ICONS: Record<RecipeSectionId, string> = {
  ingredients: "🥕",
  instructions: "📋",
  nutrition: "📊",
  notes: "📝",
  "cooking-history": "🕐",
  reviews: "⭐",
};

interface RecipeSectionsManagerProps {
  layoutPrefs: RecipeLayoutPreferences;
  onUpdate: (prefs: RecipeLayoutPreferences) => void;
  /** Hide the reset button (useful in dialogs) */
  hideReset?: boolean;
}

export function RecipeSectionsManager({
  layoutPrefs,
  onUpdate,
  hideReset = false,
}: RecipeSectionsManagerProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Get ordered sections
  const orderedSections = layoutPrefs.sectionOrder.map(
    (id) => layoutPrefs.sections[id]
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = layoutPrefs.sectionOrder.indexOf(active.id as RecipeSectionId);
    const newIndex = layoutPrefs.sectionOrder.indexOf(over.id as RecipeSectionId);

    if (oldIndex === -1 || newIndex === -1) return;

    const newPrefs = reorderSections(layoutPrefs, oldIndex, newIndex);
    onUpdate(newPrefs);
    toast.success("Section order updated");
  };

  const handleToggleVisibility = (sectionId: RecipeSectionId) => {
    const newPrefs = toggleSectionVisibility(layoutPrefs, sectionId);
    const wasVisible = layoutPrefs.sections[sectionId].visible;
    onUpdate(newPrefs);
    toast.success(wasVisible ? "Section hidden" : "Section shown");
  };

  const handleWidthChange = (sectionId: RecipeSectionId, width: RecipeSectionWidth) => {
    const newPrefs = updateSectionWidth(layoutPrefs, sectionId, width);
    onUpdate(newPrefs);
    toast.success(`Section width set to ${width}`);
  };

  const handleReset = () => {
    const defaults = resetToDefaultLayout();
    onUpdate(defaults);
    toast.success("Layout reset to default");
  };

  return (
    <div className="flex flex-col gap-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={layoutPrefs.sectionOrder}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2">
            {orderedSections.map((section) => (
              <SortableSectionCard
                key={section.id}
                section={section}
                onToggleVisibility={() => handleToggleVisibility(section.id)}
                onWidthChange={(width) => handleWidthChange(section.id, width)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {!hideReset && (
        <Button
          variant="outline"
          className="w-full"
          onClick={handleReset}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset to Default Layout
        </Button>
      )}
    </div>
  );
}

// Sortable card component
interface SortableSectionCardProps {
  section: RecipeSectionConfig;
  onToggleVisibility: () => void;
  onWidthChange: (width: RecipeSectionWidth) => void;
}

function SortableSectionCard({
  section,
  onToggleVisibility,
  onWidthChange,
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

  const label = RECIPE_SECTION_LABELS[section.id];
  const description = RECIPE_SECTION_DESCRIPTIONS[section.id];
  const emoji = SECTION_ICONS[section.id];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border bg-card",
        isDragging && "opacity-50 shadow-lg z-50",
        !section.visible && "opacity-60"
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
        <span className="text-lg">{emoji}</span>
      </div>

      {/* Label & Description */}
      <div className="flex-1 min-w-0">
        <span
          className={cn(
            "text-sm font-medium truncate block",
            !section.visible && "text-muted-foreground"
          )}
        >
          {label}
        </span>
        <span className="text-xs text-muted-foreground truncate block">
          {description}
        </span>
      </div>

      {/* Width Toggle */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center border rounded-md shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 rounded-r-none",
                section.width === "half" && "bg-muted"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onWidthChange("half");
              }}
            >
              <Square className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 rounded-l-none border-l",
                section.width === "full" && "bg-muted"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onWidthChange("full");
              }}
            >
              <RectangleHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Width: {section.width === "half" ? "Half (side-by-side)" : "Full width"}</p>
        </TooltipContent>
      </Tooltip>

      {/* Visibility Toggle */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility();
            }}
          >
            {section.visible ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{section.visible ? "Hide section" : "Show section"}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
