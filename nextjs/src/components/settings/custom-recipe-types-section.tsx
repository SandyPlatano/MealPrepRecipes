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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  getCustomRecipeTypes,
  getCustomRecipeTypeUsage,
  createCustomRecipeType,
  updateCustomRecipeType,
  deleteCustomRecipeType,
  reorderCustomRecipeTypes,
  reassignRecipesToType,
} from "@/app/actions/custom-recipe-types";
import type {
  CustomRecipeType,
  CustomRecipeTypeFormData,
} from "@/types/custom-recipe-type";
import {
  EmojiPickerField,
  ColorPickerField,
  SortableWrapper,
  SortableItem,
  DragHandle,
} from "./customizable-list";

interface CustomRecipeTypesSectionProps {
  householdId: string;
}

export function CustomRecipeTypesSection({
  householdId,
}: CustomRecipeTypesSectionProps) {
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
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<CustomRecipeType | null>(
    null
  );
  const [reassignTarget, setReassignTarget] = useState<string>("");
  const [usage, setUsage] = useState<{ count: number; limit: number } | null>(
    null
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
  };

  // Close dialogs
  const handleClose = () => {
    setIsCreating(false);
    setEditingType(null);
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
    const firstSystemType = recipeTypes.find(
      (t) => t.isSystem && t.id !== type.id
    );
    setReassignTarget(firstSystemType?.id || "");
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    setIsSaving(true);

    // First reassign recipes if a target is selected
    if (reassignTarget) {
      const reassignResult = await reassignRecipesToType(
        deleteConfirm.id,
        reassignTarget
      );
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

  // Handle reorder
  async function handleReorder(reordered: CustomRecipeType[]) {
    const previousOrder = recipeTypes;
    setRecipeTypes(reordered);

    const orderedIds = reordered.map((t) => t.id);
    const result = await reorderCustomRecipeTypes(householdId, orderedIds);
    if (result.error) {
      toast.error("Failed to reorder recipe types");
      setRecipeTypes(previousOrder);
    }
  }

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground">
        Loading recipe types...
      </div>
    );
  }

  const isDialogOpen = isCreating || editingType !== null;

  return (
    <div className="flex flex-col gap-6">
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
          You've reached the maximum of {usage?.limit} custom recipe types.
          Delete an existing type to add a new one.
        </div>
      )}

      {/* Sortable list */}
      <SortableWrapper items={recipeTypes} onReorder={handleReorder}>
        <div className="flex flex-col gap-2">
          {recipeTypes.map((type) => {
            const hasEmoji = type.emoji && type.emoji.trim() !== "";
            return (
              <SortableItem key={type.id} id={type.id}>
                <div className="group relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all bg-card">
                  {/* Drag handle */}
                  <DragHandle />

                  {/* Color accent */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-lg"
                    style={{ backgroundColor: type.color }}
                  />

                  {/* Emoji */}
                  <div className="text-2xl w-10 h-10 flex items-center justify-center">
                    {hasEmoji ? (
                      type.emoji
                    ) : (
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
                      onClick={() => handleEdit(type)}
                    >
                      Edit
                    </Button>
                    {!type.isSystem && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(type)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              </SortableItem>
            );
          })}
        </div>
      </SortableWrapper>

      {/* Create/Edit Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => !open && handleClose()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isCreating ? "Create Recipe Type" : "Edit Recipe Type"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-6 py-4">
            {/* Name */}
            <div className="flex flex-col gap-2">
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., Comfort Food"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <Label>Description (optional)</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="e.g., Warm, cozy meals for cold days"
                rows={2}
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

            {/* Preview */}
            <div className="flex flex-col gap-2">
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
                <span className="flex-1 font-semibold">
                  {formData.name || "Recipe Type"}
                </span>
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

      {/* Delete Confirmation Dialog with Reassignment */}
      <AlertDialog
        open={deleteConfirm !== null}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Recipe Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteConfirm?.name}"?
              {recipeTypes.filter((t) => t.id !== deleteConfirm?.id).length >
                0 && (
                <div className="mt-4 flex flex-col gap-2">
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
