"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Clock, Palette, Smile, Plus, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  getCustomMealTypes,
  createCustomMealType,
  updateCustomMealType,
  deleteCustomMealType,
  reorderCustomMealTypes,
} from "@/app/actions/custom-meal-types";
import type { CustomMealType, CustomMealTypeFormData } from "@/types/custom-meal-type";
import { MEAL_TYPE_COLOR_PALETTE } from "@/types/settings";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
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

interface CustomMealTypesSectionProps {
  householdId: string;
}

const TIME_OPTIONS = Array.from({ length: 37 }, (_, i) => {
  const hour = Math.floor(i / 2) + 5;
  const minute = (i % 2) * 30;
  const value = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
  const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  const ampm = hour >= 12 ? "PM" : "AM";
  const label = `${hour12}:${minute.toString().padStart(2, "0")} ${ampm}`;
  return { value, label };
});

function formatTime(time: string): string {
  const [hour, minute] = time.split(":").map(Number);
  const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  const ampm = hour >= 12 ? "PM" : "AM";
  return `${hour12}:${minute.toString().padStart(2, "0")} ${ampm}`;
}

interface SortableMealTypeCardProps {
  mealType: CustomMealType;
  onEdit: (mealType: CustomMealType) => void;
}

function SortableMealTypeCard({ mealType, onEdit }: SortableMealTypeCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: mealType.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const hasEmoji = mealType.emoji && mealType.emoji.trim() !== "";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all bg-card",
        isDragging && "opacity-50 shadow-lg"
      )}
      onClick={() => !isDragging && onEdit(mealType)}
    >
      <div
        className="absolute top-0 left-0 right-0 h-1.5 rounded-t-lg"
        style={{ backgroundColor: mealType.color }}
      />

      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 -ml-1 hover:bg-muted rounded transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {hasEmoji && <span className="text-xl">{mealType.emoji}</span>}
          <span className="text-sm font-medium truncate">{mealType.name}</span>
          {mealType.isSystem && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              System
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div
            className="h-3 w-3 rounded-full ring-1 ring-black/10"
            style={{ backgroundColor: mealType.color }}
          />
          <Clock className="h-3 w-3" />
          <span className="font-mono">{formatTime(mealType.defaultTime)}</span>
        </div>
      </div>

      <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
        Click to edit
      </span>
    </div>
  );
}

export function CustomMealTypesSection({ householdId }: CustomMealTypesSectionProps) {
  const [mealTypes, setMealTypes] = useState<CustomMealType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingMealType, setEditingMealType] = useState<CustomMealType | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editForm, setEditForm] = useState<CustomMealTypeFormData>({
    name: "",
    emoji: "🍽️",
    color: "#6366f1",
    defaultTime: "12:00",
  });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [customColorInput, setCustomColorInput] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadMealTypes();
  }, [householdId]);

  async function loadMealTypes() {
    setIsLoading(true);
    const result = await getCustomMealTypes(householdId);
    setIsLoading(false);

    if (result.error) {
      toast.error("Failed to load meal types");
      return;
    }

    setMealTypes(result.data || []);
  }

  function handleOpenCreate() {
    setIsCreating(true);
    setEditForm({
      name: "",
      emoji: "🍽️",
      color: "#6366f1",
      defaultTime: "12:00",
    });
    setCustomColorInput("#6366f1");
  }

  function handleOpenEdit(mealType: CustomMealType) {
    setEditingMealType(mealType);
    setEditForm({
      name: mealType.name,
      emoji: mealType.emoji,
      color: mealType.color,
      defaultTime: mealType.defaultTime,
    });
    setCustomColorInput(mealType.color);
  }

  function handleClose() {
    setEditingMealType(null);
    setIsCreating(false);
    setShowEmojiPicker(false);
  }

  async function handleSave() {
    if (!editForm.name.trim()) {
      toast.error("Name is required");
      return;
    }

    setIsSaving(true);

    if (isCreating) {
      const result = await createCustomMealType(householdId, editForm);
      setIsSaving(false);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      setMealTypes((prev) => [...prev, result.data!]);
      toast.success(`${editForm.name} created`);
    } else if (editingMealType) {
      const result = await updateCustomMealType(editingMealType.id, editForm);
      setIsSaving(false);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      setMealTypes((prev) =>
        prev.map((mt) =>
          mt.id === editingMealType.id
            ? {
                ...mt,
                name: editForm.name,
                emoji: editForm.emoji,
                color: editForm.color,
                defaultTime: editForm.defaultTime,
              }
            : mt
        )
      );
      toast.success(`${editForm.name} updated`);
    }

    handleClose();
  }

  async function handleDelete(id: string) {
    setIsSaving(true);
    const result = await deleteCustomMealType(id);
    setIsSaving(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    setMealTypes((prev) => prev.filter((mt) => mt.id !== id));
    toast.success("Meal type deleted");
    setDeleteConfirmId(null);
  }

  function handleEmojiSelect(emoji: { native: string }) {
    setEditForm((prev) => ({ ...prev, emoji: emoji.native }));
    setShowEmojiPicker(false);
  }

  function handleColorSelect(color: string) {
    setEditForm((prev) => ({ ...prev, color }));
    setCustomColorInput(color);
  }

  function handleCustomColorChange(value: string) {
    setCustomColorInput(value);
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      setEditForm((prev) => ({ ...prev, color: value }));
    }
  }

  function handleTimeChange(time: string) {
    setEditForm((prev) => ({ ...prev, defaultTime: time }));
  }

  function handleClearEmoji() {
    setEditForm((prev) => ({ ...prev, emoji: "" }));
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = mealTypes.findIndex((mt) => mt.id === active.id);
    const newIndex = mealTypes.findIndex((mt) => mt.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const reordered = [...mealTypes];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    setMealTypes(reordered);

    const result = await reorderCustomMealTypes(
      householdId,
      reordered.map((mt) => mt.id)
    );

    if (result.error) {
      toast.error("Failed to reorder meal types");
      setMealTypes(mealTypes);
    }
  }

  const isDialogOpen = isCreating || editingMealType !== null;
  const dialogTitle = isCreating ? "Add New Meal Type" : `Edit ${editingMealType?.name || ""}`;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={mealTypes} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {mealTypes.map((mealType) => (
              <SortableMealTypeCard
                key={mealType.id}
                mealType={mealType}
                onEdit={handleOpenEdit}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Button onClick={handleOpenCreate} className="w-full" variant="outline">
        <Plus className="h-4 w-4 mr-2" />
        Add New Meal Type
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editForm?.emoji && <span className="text-xl">{editForm.emoji}</span>}
              {dialogTitle}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-6 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Second Breakfast, Pre-Workout"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="flex items-center gap-2">
                <Smile className="h-4 w-4" />
                Emoji
              </Label>
              <div className="flex items-center gap-2">
                <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="h-12 w-16 text-2xl p-0">
                      {editForm.emoji || "—"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 border-0 z-[10000]" align="start" usePortal={false}>
                    <Picker
                      data={data}
                      onEmojiSelect={handleEmojiSelect}
                      theme="auto"
                      previewPosition="none"
                      skinTonePosition="search"
                      categories={[
                        "foods",
                        "activity",
                        "nature",
                        "objects",
                        "symbols",
                        "people",
                      ]}
                      perLine={8}
                    />
                  </PopoverContent>
                </Popover>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearEmoji}
                  disabled={!editForm.emoji}
                >
                  Clear
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
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
                      "h-8 w-8 rounded-md transition-all",
                      editForm.color === c.color
                        ? "ring-2 ring-offset-2 ring-primary scale-110"
                        : "hover:scale-110 ring-1 ring-black/10"
                    )}
                    style={{ backgroundColor: c.color }}
                    title={c.label}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Custom:</span>
                <div className="relative flex-1">
                  <Input
                    type="text"
                    value={customColorInput}
                    onChange={(e) => handleCustomColorChange(e.target.value)}
                    placeholder="#f97316"
                    className="font-mono text-sm pl-10"
                  />
                  <input
                    type="color"
                    value={editForm.color}
                    onChange={(e) => handleColorSelect(e.target.value)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-6 w-6 cursor-pointer rounded border-0"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Default Calendar Time
              </Label>
              <p className="text-xs text-muted-foreground mb-2">
                When Google Calendar events are created, this meal type will start at this time.
              </p>
              <Select value={editForm.defaultTime} onValueChange={handleTimeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60 z-[10000]">
                  {TIME_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Preview</Label>
              <div
                className="flex items-center gap-2.5 py-2 px-3 rounded-lg text-sm font-medium"
                style={{
                  backgroundColor: `${editForm.color}15`,
                  borderLeft: `4px solid ${editForm.color}`,
                }}
              >
                {editForm.emoji && <span className="text-lg">{editForm.emoji}</span>}
                <span className="flex-1 font-semibold">{editForm.name || "Meal Type"}</span>
                <Badge variant="secondary" className="text-[11px] px-2 py-0.5 h-5 font-mono">
                  {formatTime(editForm.defaultTime)}
                </Badge>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-row justify-between sm:justify-between">
            {editingMealType && !editingMealType.isSystem && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteConfirmId(editingMealType.id)}
                disabled={isSaving}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3 mr-1.5" />
                Delete
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={handleClose} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirmId !== null} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Meal Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this meal type? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              disabled={isSaving}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
