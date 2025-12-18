"use client";

import { useState, useEffect } from "react";
import { useSettings } from "@/contexts/settings-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, GripVertical, Smile, Palette, Clock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import {
  getCustomMealTypes,
  createCustomMealType,
  updateCustomMealType,
  deleteCustomMealType,
  reorderCustomMealTypes,
} from "@/app/actions/custom-meal-types";
import type { CustomMealType, CustomMealTypeFormData } from "@/types/custom-meal-type";
import { MEAL_TYPE_COLOR_PALETTE } from "@/types/settings";

// Generate time options 5:00-23:00 in 30min intervals
const TIME_OPTIONS = Array.from({ length: 37 }, (_, i) => {
  const hour = Math.floor(i / 2) + 5;
  const minute = (i % 2) * 30;
  const value = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
  const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  const ampm = hour >= 12 ? "PM" : "AM";
  const label = `${hour12}:${minute.toString().padStart(2, "0")} ${ampm}`;
  return { value, label };
});

export function CustomMealTypesManager() {
  const { household } = useSettings();
  const [mealTypes, setMealTypes] = useState<CustomMealType[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<CustomMealType | null>(null);
  const [formData, setFormData] = useState<CustomMealTypeFormData>({
    name: "",
    emoji: "🍽️",
    color: "#6366f1",
    defaultTime: "12:00",
  });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [customColorInput, setCustomColorInput] = useState("#6366f1");
  const [isSaving, setIsSaving] = useState(false);

  // Load meal types
  useEffect(() => {
    loadMealTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [household]);

  const loadMealTypes = async () => {
    if (!household?.household?.id) return;
    const { data, error } = await getCustomMealTypes(household.household.id);
    if (!error && data) {
      setMealTypes(data);
    }
  };

  // Drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Open create dialog
  const handleCreate = () => {
    setEditingType(null);
    setFormData({ name: "", emoji: "🍽️", color: "#6366f1", defaultTime: "12:00" });
    setCustomColorInput("#6366f1");
    setIsDialogOpen(true);
  };

  // Open edit dialog
  const handleEdit = (type: CustomMealType) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      emoji: type.emoji,
      color: type.color,
      defaultTime: type.defaultTime,
    });
    setCustomColorInput(type.color);
    setIsDialogOpen(true);
  };

  // Save (create or update)
  const handleSave = async () => {
    if (!household?.household?.id) return;
    if (!formData.name.trim()) {
      toast.error("Please enter a name");
      return;
    }

    setIsSaving(true);
    if (editingType) {
      const { error } = await updateCustomMealType(editingType.id, formData);
      if (error) {
        toast.error(error);
      } else {
        toast.success("Meal type updated");
        loadMealTypes();
        setIsDialogOpen(false);
      }
    } else {
      const { error } = await createCustomMealType(household.household.id, formData);
      if (error) {
        toast.error(error);
      } else {
        toast.success("Meal type created");
        loadMealTypes();
        setIsDialogOpen(false);
      }
    }
    setIsSaving(false);
  };

  // Delete
  const handleDelete = async (id: string, isSystem: boolean) => {
    if (isSystem) {
      toast.error("Cannot delete system meal types");
      return;
    }
    const { error } = await deleteCustomMealType(id);
    if (error) {
      toast.error(error);
    } else {
      toast.success("Meal type deleted");
      loadMealTypes();
    }
  };

  // Reorder
  const handleDragEnd = async (event: any) => {
    if (!household?.household?.id) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = mealTypes.findIndex((t) => t.id === active.id);
    const newIndex = mealTypes.findIndex((t) => t.id === over.id);
    const reordered = arrayMove(mealTypes, oldIndex, newIndex);
    setMealTypes(reordered);

    const { error } = await reorderCustomMealTypes(household.household.id, reordered.map((t) => t.id));
    if (error) {
      toast.error("Failed to reorder");
      loadMealTypes();
    }
  };

  // Emoji select
  const handleEmojiSelect = (emoji: { native: string }) => {
    setFormData((prev) => ({ ...prev, emoji: emoji.native }));
    setShowEmojiPicker(false);
  };

  // Color select
  const handleColorSelect = (color: string) => {
    setFormData((prev) => ({ ...prev, color }));
    setCustomColorInput(color);
  };

  return (
    <div className="space-y-4">
      <Button onClick={handleCreate} size="sm">
        <Plus className="h-4 w-4 mr-1.5" />
        Add Meal Type
      </Button>

      {mealTypes.length > 0 ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={mealTypes.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {mealTypes.map((type) => (
                <SortableMealTypeItem
                  key={type.id}
                  type={type}
                  onEdit={() => handleEdit(type)}
                  onDelete={() => handleDelete(type.id, type.isSystem)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <p className="text-sm text-muted-foreground">No custom meal types</p>
      )}

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingType ? "Edit" : "Create"} Meal Type</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Name */}
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Brunch"
              />
            </div>

            {/* Emoji */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Smile className="h-4 w-4" />
                Emoji
              </Label>
              <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-12 w-16 text-2xl">
                    {formData.emoji}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-0" align="start">
                  <Picker data={data} onEmojiSelect={handleEmojiSelect} theme="auto" previewPosition="none" />
                </PopoverContent>
              </Popover>
            </div>

            {/* Color */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Color
              </Label>
              <div className="grid grid-cols-8 gap-2">
                {MEAL_TYPE_COLOR_PALETTE.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => handleColorSelect(c.color)}
                    className={cn(
                      "h-8 w-8 rounded-md transition-all ring-1 ring-black/10",
                      formData.color === c.color && "ring-2 ring-offset-2 ring-primary scale-110"
                    )}
                    style={{ backgroundColor: c.color }}
                  />
                ))}
              </div>
              <Input
                type="text"
                value={customColorInput}
                onChange={(e) => {
                  setCustomColorInput(e.target.value);
                  if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                    handleColorSelect(e.target.value);
                  }
                }}
                placeholder="#6366f1"
                className="font-mono"
              />
            </div>

            {/* Time */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Default Calendar Time
              </Label>
              <Select value={formData.defaultTime} onValueChange={(v) => setFormData((prev) => ({ ...prev, defaultTime: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {TIME_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Sortable item
function SortableMealTypeItem({
  type,
  onEdit,
  onDelete,
}: {
  type: CustomMealType;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: type.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>
      <span className="text-xl">{type.emoji}</span>
      <span className="flex-1 font-medium">{type.name}</span>
      <div className="h-4 w-4 rounded-full ring-1 ring-black/10" style={{ backgroundColor: type.color }} />
      <Button variant="ghost" size="sm" onClick={onEdit} className="h-8 w-8 p-0">
        <Pencil className="h-4 w-4" />
      </Button>
      {!type.isSystem && (
        <Button variant="ghost" size="sm" onClick={onDelete} className="h-8 w-8 p-0">
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
