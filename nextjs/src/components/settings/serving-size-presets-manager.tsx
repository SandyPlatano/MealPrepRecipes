"use client";

import { useState, useEffect } from "react";
import { useSettings } from "@/contexts/settings-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, X, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ServingSizePreset } from "@/types/user-preferences-v2";

export function ServingSizePresetsManager() {
  const { preferencesV2, updateServingPresets } = useSettings();
  const [presets, setPresets] = useState<ServingSizePreset[]>([]);
  const [newName, setNewName] = useState("");
  const [newSize, setNewSize] = useState<string>("2");

  // Load presets from context
  useEffect(() => {
    if (preferencesV2?.servingSizePresets) {
      setPresets(preferencesV2.servingSizePresets);
    }
  }, [preferencesV2]);

  // Drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Handle add
  const handleAdd = () => {
    const size = parseInt(newSize, 10);
    if (!newName.trim() || isNaN(size) || size < 1) {
      toast.error("Please enter a valid name and serving size");
      return;
    }
    const updated = [...presets, { name: newName.trim(), size }];
    setPresets(updated);
    updateServingPresets(updated);
    setNewName("");
    setNewSize("2");
    toast.success("Preset added");
  };

  // Handle remove
  const handleRemove = (index: number) => {
    const updated = presets.filter((_, i) => i !== index);
    setPresets(updated);
    updateServingPresets(updated);
    toast.success("Preset removed");
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = presets.findIndex((_, i) => i === active.id);
    const newIndex = presets.findIndex((_, i) => i === over.id);
    const updated = arrayMove(presets, oldIndex, newIndex);
    setPresets(updated);
    updateServingPresets(updated);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Add Form */}
      <div className="flex gap-2">
        <Input
          placeholder="Preset name (e.g., 'Family')"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="flex-1"
        />
        <Input
          type="number"
          min={1}
          max={50}
          placeholder="Size"
          value={newSize}
          onChange={(e) => setNewSize(e.target.value)}
          className="w-20"
        />
        <Button onClick={handleAdd} size="sm">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* List */}
      {presets.length > 0 ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={presets.map((_, i) => i)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2">
              {presets.map((preset, index) => (
                <SortablePresetItem
                  key={index}
                  index={index}
                  preset={preset}
                  onRemove={() => handleRemove(index)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <p className="text-sm text-muted-foreground">No presets yet</p>
      )}
    </div>
  );
}

// Sortable item component
function SortablePresetItem({ index, preset, onRemove }: { index: number; preset: ServingSizePreset; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: index });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg"
    >
      <button type="button" {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing" aria-label="Drag to reorder">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>
      <Badge variant="secondary" className="flex-1">
        {preset.name}
      </Badge>
      <span className="text-sm text-muted-foreground font-mono">{preset.size}</span>
      <Button variant="ghost" size="sm" onClick={onRemove} className="h-8 w-8 p-0">
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
