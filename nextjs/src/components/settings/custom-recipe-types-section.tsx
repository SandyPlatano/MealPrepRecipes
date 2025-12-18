"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Palette, Plus, Smile, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  getCustomRecipeTypes,
  getCustomRecipeTypeUsage,
  createCustomRecipeType,
  updateCustomRecipeType,
  deleteCustomRecipeType,
  reorderCustomRecipeTypes,
  reassignRecipesToType,
} from "@/app/actions/custom-recipe-types";
import type { CustomRecipeType, CustomRecipeTypeFormData } from "@/types/custom-recipe-type";
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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface CustomRecipeTypesSectionProps {
  householdId: string;
}

interface SortableItemProps {
  type: CustomRecipeType;
  onEdit: (type: CustomRecipeType) => void;
  onDelete: (type: CustomRecipeType) => void;
}

function SortableRecipeTypeCard({ type, onEdit, onDelete }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: type.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const hasEmoji = type.emoji && type.emoji.trim() !== "";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all bg-card",
        isDragging && "opacity-50 scale-105 shadow-lg"
      )}
      {...attributes}
    >
      {/* Drag handle */}
      <button
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </button>

      {/* Color accent */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-lg"
        style={{ backgroundColor: type.color }}
      />

      {/* Emoji */}
      <div className="text-2xl w-10 h-10 flex items-center justify-center">
        {hasEmoji ? type.emoji : (
          <span className="text-muted-foreground text-sm">--</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-sm">{type.name}</h4>
          {type.isSystem && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
              System
            </span>
          )}
        </div>
        {type.description && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {type.description}
          </p>
        )}
      </div>

      {/* Color swatch */}
      <div
        className="h-6 w-6 rounded-full ring-1 ring-black/10 flex-shrink-0"
        style={{ backgroundColor: type.color }}
      />

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(type)}
        >
          Edit
        </Button>
        {!type.isSystem && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(type)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        )}
      </div>
    </div>
  );
}

export function CustomRecipeTypesSection({ householdId }: CustomRecipeTypesSectionProps) {
  const [recipeTypes, setRecipeTypes] = useState<CustomRecipeType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingType, setEditingType] = useState<CustomRecipeType | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<CustomRecipeTypeFormData>({
    name: "",
    emoji: "📖",
    color: "#6366f1",
    description: "",
  });
  const [customColorInput, setCustomColorInput] = useState("#6366f1");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<CustomRecipeType | null>(null);
  const [reassignTarget, setReassignTarget] = useState<string>("");
  const [usage, setUsage] = useState<{ count: number; limit: number } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load recipe types and usage
  const loadRecipeTypes = async () => {
    setIsLoading(true);
    const [typesResult, usageResult] = await Promise.all([
      getCustomRecipeTypes(householdId),
      getCustomRecipeTypeUsage(householdId),
    ]);
    if (typesResult.error) {
      toast.error("Failed to load recipe types");
    } else {
      setRecipeTypes(typesResult.data || []);
    }
    if (!usageResult.error && usageResult.data) {
      setUsage(usageResult.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadRecipeTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [householdId]);

  const isAtLimit = usage ? usage.count >= usage.limit : false;

  // Open create dialog
  const handleCreate = () => {
    setIsCreating(true);
    setFormData({
      name: "",
      emoji: "📖",
      color: "#6366f1",
      description: "",
    });
    setCustomColorInput("#6366f1");
  };

  // Open edit dialog
  const handleEdit = (type: CustomRecipeType) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      emoji: type.emoji,
      color: type.color,
      description: type.description || "",
    });
    setCustomColorInput(type.color);
  };

  // Close dialogs
  const handleClose = () => {
    setIsCreating(false);
    setEditingType(null);
    setShowEmojiPicker(false);
  };

  // Save (create or update)
  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a name");
      return;
    }

    setIsSaving(true);

    if (isCreating) {
      const result = await createCustomRecipeType(householdId, formData);
      if (result.error) {
        toast.error("Failed to create recipe type");
      } else {
        toast.success("Recipe type created");
        setRecipeTypes((prev) => [...prev, result.data!]);
        handleClose();
      }
    } else if (editingType) {
      const result = await updateCustomRecipeType(editingType.id, formData);
      if (result.error) {
        toast.error("Failed to update recipe type");
      } else {
        toast.success("Recipe type updated");
        setRecipeTypes((prev) =>
          prev.map((t) => (t.id === editingType.id ? result.data! : t))
        );
        handleClose();
      }
    }

    setIsSaving(false);
  };

  // Delete with reassignment
  const handleDeleteClick = (type: CustomRecipeType) => {
    setDeleteConfirm(type);
    // Pre-select first system type as reassignment target
    const firstSystemType = recipeTypes.find((t) => t.isSystem && t.id !== type.id);
    setReassignTarget(firstSystemType?.id || "");
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    setIsSaving(true);

    // First reassign recipes if a target is selected
    if (reassignTarget) {
      const reassignResult = await reassignRecipesToType(deleteConfirm.id, reassignTarget);
      if (reassignResult.error) {
        toast.error("Failed to reassign recipes");
        setIsSaving(false);
        return;
      }
    }

    // Then delete the type
    const result = await deleteCustomRecipeType(deleteConfirm.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Recipe type deleted");
      setRecipeTypes((prev) => prev.filter((t) => t.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    }

    setIsSaving(false);
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = recipeTypes.findIndex((t) => t.id === active.id);
    const newIndex = recipeTypes.findIndex((t) => t.id === over.id);

    const newOrder = arrayMove(recipeTypes, oldIndex, newIndex);
    setRecipeTypes(newOrder);

    // Update in database
    const orderedIds = newOrder.map((t) => t.id);
    const result = await reorderCustomRecipeTypes(householdId, orderedIds);
    if (result.error) {
      toast.error("Failed to reorder recipe types");
      // Revert on error
      loadRecipeTypes();
    }
  };

  // Emoji handlers
  const handleEmojiSelect = (emoji: { native: string }) => {
    setFormData((prev) => ({ ...prev, emoji: emoji.native }));
    setShowEmojiPicker(false);
  };

  const handleColorSelect = (color: string) => {
    setFormData((prev) => ({ ...prev, color }));
    setCustomColorInput(color);
  };

  const handleCustomColorChange = (value: string) => {
    setCustomColorInput(value);
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      setFormData((prev) => ({ ...prev, color: value }));
    }
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading recipe types...</div>;
  }

  const isDialogOpen = isCreating || editingType !== null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Recipe Types</h3>
          <p className="text-sm text-muted-foreground">
            Customize your recipe categories with emojis and colors
          </p>
          {usage && (
            <p className="text-xs text-muted-foreground mt-1">
              {usage.count} of {usage.limit} custom types used
            </p>
          )}
        </div>
        <Button onClick={handleCreate} disabled={isAtLimit}>
          <Plus className="h-4 w-4 mr-2" />
          {isAtLimit ? "Limit Reached" : "Add Recipe Type"}
        </Button>
      </div>

      {isAtLimit && (
        <div className="text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400 px-3 py-2 rounded-md">
          You've reached the maximum of {usage?.limit} custom recipe types. Delete an existing type to add a new one.
        </div>
      )}

      {/* Sortable list */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={recipeTypes.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {recipeTypes.map((type) => (
              <SortableRecipeTypeCard
                key={type.id}
                type={type}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isCreating ? "Create Recipe Type" : "Edit Recipe Type"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Name */}
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Comfort Food"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="e.g., Warm, cozy meals for cold days"
                rows={2}
              />
            </div>

            {/* Emoji */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Smile className="h-4 w-4" />
                Emoji
              </Label>
              <div className="flex items-center gap-2">
                <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="h-12 w-16 text-2xl p-0">
                      {formData.emoji || "—"}
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
                  onClick={() => setFormData((prev) => ({ ...prev, emoji: "" }))}
                  disabled={!formData.emoji}
                >
                  Clear
                </Button>
              </div>
            </div>

            {/* Color */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Color
              </Label>

              {/* Color palette grid */}
              <div className="grid grid-cols-8 gap-2">
                {MEAL_TYPE_COLOR_PALETTE.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => handleColorSelect(c.color)}
                    className={cn(
                      "h-8 w-8 rounded-md transition-all",
                      formData.color === c.color
                        ? "ring-2 ring-offset-2 ring-primary scale-110"
                        : "hover:scale-110 ring-1 ring-black/10"
                    )}
                    style={{ backgroundColor: c.color }}
                    title={c.label}
                  />
                ))}
              </div>

              {/* Custom color input */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Custom:</span>
                <div className="relative flex-1">
                  <Input
                    type="text"
                    value={customColorInput}
                    onChange={(e) => handleCustomColorChange(e.target.value)}
                    placeholder="#6366f1"
                    className="font-mono text-sm pl-10"
                  />
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => handleColorSelect(e.target.value)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-6 w-6 cursor-pointer rounded border-0"
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <Label>Preview</Label>
              <div
                className="flex items-center gap-3 py-2 px-3 rounded-lg text-sm font-medium"
                style={{
                  backgroundColor: `${formData.color}15`,
                  borderLeft: `4px solid ${formData.color}`,
                }}
              >
                {formData.emoji && (
                  <span className="text-lg">{formData.emoji}</span>
                )}
                <span className="flex-1 font-semibold">{formData.name || "Recipe Type"}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirm !== null} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Recipe Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteConfirm?.name}"?
              {recipeTypes.filter((t) => t.id !== deleteConfirm?.id).length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="font-medium text-foreground">
                    Reassign existing recipes to:
                  </p>
                  <Select value={reassignTarget} onValueChange={setReassignTarget}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a recipe type" />
                    </SelectTrigger>
                    <SelectContent>
                      {recipeTypes
                        .filter((t) => t.id !== deleteConfirm?.id)
                        .map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.emoji} {type.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isSaving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSaving ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
