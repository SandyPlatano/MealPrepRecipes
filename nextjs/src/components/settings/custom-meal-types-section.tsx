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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Clock, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  getCustomMealTypes,
  createCustomMealType,
  updateCustomMealType,
  deleteCustomMealType,
  reorderCustomMealTypes,
} from "@/app/actions/custom-meal-types";
import type {
  CustomMealType,
  CustomMealTypeFormData,
} from "@/types/custom-meal-type";
import {
  EmojiPickerField,
  ColorPickerField,
  DeleteConfirmation,
  SortableWrapper,
  SortableItem,
  DragHandle,
} from "./customizable-list";

interface CustomMealTypesSectionProps {
  householdId: string;
}

// Time options from 5:00 AM to 11:30 PM in 30-minute increments
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

export function CustomMealTypesSection({
  householdId,
}: CustomMealTypesSectionProps) {
  const [mealTypes, setMealTypes] = useState<CustomMealType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingMealType, setEditingMealType] = useState<CustomMealType | null>(
    null
  );
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<CustomMealTypeFormData>({
    name: "",
    emoji: "🍽️",
    color: "#6366f1",
    defaultTime: "12:00",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmItem, setDeleteConfirmItem] =
    useState<CustomMealType | null>(null);

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

  function handleCreate() {
    setIsCreating(true);
    setFormData({
      name: "",
      emoji: "🍽️",
      color: "#6366f1",
      defaultTime: "12:00",
    });
  }

  function handleEdit(mealType: CustomMealType) {
    setEditingMealType(mealType);
    setFormData({
      name: mealType.name,
      emoji: mealType.emoji,
      color: mealType.color,
      defaultTime: mealType.defaultTime,
    });
  }

  function handleClose() {
    setEditingMealType(null);
    setIsCreating(false);
  }

  async function handleSave() {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    setIsSaving(true);

    if (isCreating) {
      const result = await createCustomMealType(householdId, formData);
      setIsSaving(false);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      setMealTypes((prev) => [...prev, result.data!]);
      toast.success(`${formData.name} created`);
    } else if (editingMealType) {
      const result = await updateCustomMealType(editingMealType.id, formData);
      setIsSaving(false);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      setMealTypes((prev) =>
        prev.map((mt) =>
          mt.id === editingMealType.id ? { ...mt, ...formData } : mt
        )
      );
      toast.success(`${formData.name} updated`);
    }

    handleClose();
  }

  async function handleDelete() {
    if (!deleteConfirmItem) return;

    setIsSaving(true);
    const result = await deleteCustomMealType(deleteConfirmItem.id);
    setIsSaving(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    setMealTypes((prev) => prev.filter((mt) => mt.id !== deleteConfirmItem.id));
    toast.success("Meal type deleted");
    setDeleteConfirmItem(null);
    handleClose();
  }

  async function handleReorder(reordered: CustomMealType[]) {
    const previousOrder = mealTypes;
    setMealTypes(reordered);

    const result = await reorderCustomMealTypes(
      householdId,
      reordered.map((mt) => mt.id)
    );

    if (result.error) {
      toast.error("Failed to reorder meal types");
      setMealTypes(previousOrder);
    }
  }

  const isDialogOpen = isCreating || editingMealType !== null;
  const dialogTitle = isCreating
    ? "Add New Meal Type"
    : `Edit ${editingMealType?.name || ""}`;

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
      {/* Meal Types List with Drag Reorder */}
      <SortableWrapper items={mealTypes} onReorder={handleReorder}>
        <div className="flex flex-col gap-2">
          {mealTypes.map((mealType) => {
            const hasEmoji = mealType.emoji && mealType.emoji.trim() !== "";
            return (
              <SortableItem key={mealType.id} id={mealType.id}>
                <div
                  className="group relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all bg-card cursor-pointer hover:border-primary/30"
                  onClick={() => handleEdit(mealType)}
                >
                  {/* Color accent bar */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1.5 rounded-t-lg"
                    style={{ backgroundColor: mealType.color }}
                  />

                  {/* Drag handle */}
                  <DragHandle />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {hasEmoji && (
                        <span className="text-xl">{mealType.emoji}</span>
                      )}
                      <span className="text-sm font-medium truncate">
                        {mealType.name}
                      </span>
                      {mealType.isSystem && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0"
                        >
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
                      <span className="font-mono">
                        {formatTime(mealType.defaultTime)}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to edit
                  </span>
                </div>
              </SortableItem>
            );
          })}
        </div>
      </SortableWrapper>

      {/* Add Button */}
      <Button onClick={handleCreate} className="w-full" variant="outline">
        <Plus className="h-4 w-4 mr-2" />
        Add New Meal Type
      </Button>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {formData?.emoji && <span className="text-xl">{formData.emoji}</span>}
              {dialogTitle}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-6 py-4">
            {/* Name */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., Second Breakfast, Pre-Workout"
              />
            </div>

            {/* Emoji */}
            <EmojiPickerField
              value={formData.emoji}
              onChange={(emoji) => setFormData((prev) => ({ ...prev, emoji }))}
              onClear={() => setFormData((prev) => ({ ...prev, emoji: "" }))}
            />

            {/* Color */}
            <ColorPickerField
              value={formData.color}
              onChange={(color) => setFormData((prev) => ({ ...prev, color }))}
            />

            {/* Default Time */}
            <div className="flex flex-col gap-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Default Calendar Time
              </Label>
              <p className="text-xs text-muted-foreground mb-2">
                When Google Calendar events are created, this meal type will
                start at this time.
              </p>
              <Select
                value={formData.defaultTime}
                onValueChange={(time) =>
                  setFormData((prev) => ({ ...prev, defaultTime: time }))
                }
              >
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

            {/* Preview */}
            <div className="flex flex-col gap-2">
              <Label>Preview</Label>
              <div
                className="flex items-center gap-2.5 py-2 px-3 rounded-lg text-sm font-medium"
                style={{
                  backgroundColor: `${formData.color}15`,
                  borderLeft: `4px solid ${formData.color}`,
                }}
              >
                {formData.emoji && (
                  <span className="text-lg">{formData.emoji}</span>
                )}
                <span className="flex-1 font-semibold">
                  {formData.name || "Meal Type"}
                </span>
                <Badge
                  variant="secondary"
                  className="text-[11px] px-2 py-0.5 h-5 font-mono"
                >
                  {formatTime(formData.defaultTime)}
                </Badge>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-row justify-between sm:justify-between">
            {editingMealType && !editingMealType.isSystem && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteConfirmItem(editingMealType)}
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

      {/* Delete Confirmation */}
      <DeleteConfirmation
        isOpen={deleteConfirmItem !== null}
        onClose={() => setDeleteConfirmItem(null)}
        onConfirm={handleDelete}
        isSaving={isSaving}
        title="Delete Meal Type"
        description={`Are you sure you want to delete "${deleteConfirmItem?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}
