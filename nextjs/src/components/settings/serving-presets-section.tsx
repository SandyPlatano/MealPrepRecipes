"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
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
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { updateServingSizePresets } from "@/app/actions/user-preferences";
import type { ServingSizePreset } from "@/types/user-preferences-v2";
import { DEFAULT_SERVING_SIZE_PRESETS } from "@/types/user-preferences-v2";
import {
  Plus,
  Trash2,
  GripVertical,
  Users,
  Edit2,
  Check,
  X,
} from "lucide-react";

interface ServingPresetsSectionProps {
  userId: string;
  initialPresets: ServingSizePreset[];
}

export function ServingPresetsSection({
  userId,
  initialPresets,
}: ServingPresetsSectionProps) {
  const [presets, setPresets] = useState<ServingSizePreset[]>(initialPresets);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<ServingSizePreset | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newPreset, setNewPreset] = useState<ServingSizePreset>({
    name: "",
    size: 1,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const handleSavePresets = async (updatedPresets: ServingSizePreset[]) => {
    setIsSaving(true);
    const result = await updateServingSizePresets(userId, updatedPresets);
    setIsSaving(false);

    if (result.error) {
      toast.error("Failed to save serving presets");
      setPresets(presets); // Revert
      return false;
    }

    toast.success("Serving presets saved");
    return true;
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditForm({ ...presets[index] });
  };

  const handleSaveEdit = async () => {
    if (editingIndex === null || !editForm) return;

    if (!editForm.name.trim()) {
      toast.error("Preset name cannot be empty");
      return;
    }

    if (editForm.size < 1 || editForm.size > 100) {
      toast.error("Serving size must be between 1 and 100");
      return;
    }

    const updatedPresets = [...presets];
    updatedPresets[editingIndex] = editForm;
    setPresets(updatedPresets);

    const success = await handleSavePresets(updatedPresets);
    if (success) {
      setEditingIndex(null);
      setEditForm(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditForm(null);
  };

  const handleDelete = async () => {
    if (deleteIndex === null) return;

    const updatedPresets = presets.filter((_, idx) => idx !== deleteIndex);
    setPresets(updatedPresets);

    const success = await handleSavePresets(updatedPresets);
    if (!success) {
      setPresets(presets); // Revert
    }

    setDeleteIndex(null);
  };

  const handleStartAdd = () => {
    setIsAdding(true);
    setNewPreset({ name: "", size: 1 });
  };

  const handleSaveNew = async () => {
    if (!newPreset.name.trim()) {
      toast.error("Preset name cannot be empty");
      return;
    }

    if (newPreset.size < 1 || newPreset.size > 100) {
      toast.error("Serving size must be between 1 and 100");
      return;
    }

    const updatedPresets = [...presets, newPreset];
    setPresets(updatedPresets);

    const success = await handleSavePresets(updatedPresets);
    if (success) {
      setIsAdding(false);
      setNewPreset({ name: "", size: 1 });
    }
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewPreset({ name: "", size: 1 });
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;

    const updatedPresets = [...presets];
    [updatedPresets[index - 1], updatedPresets[index]] = [
      updatedPresets[index],
      updatedPresets[index - 1],
    ];
    setPresets(updatedPresets);

    await handleSavePresets(updatedPresets);
  };

  const handleMoveDown = async (index: number) => {
    if (index === presets.length - 1) return;

    const updatedPresets = [...presets];
    [updatedPresets[index], updatedPresets[index + 1]] = [
      updatedPresets[index + 1],
      updatedPresets[index],
    ];
    setPresets(updatedPresets);

    await handleSavePresets(updatedPresets);
  };

  const handleResetToDefaults = async () => {
    setPresets(DEFAULT_SERVING_SIZE_PRESETS);
    await handleSavePresets(DEFAULT_SERVING_SIZE_PRESETS);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="size-4 text-muted-foreground" />
          <Label>Serving Size Presets</Label>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleResetToDefaults}
          disabled={isSaving}
        >
          Reset to Defaults
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Quick presets for common serving sizes when planning meals
      </p>

      {/* Presets List */}
      <div className="flex flex-col gap-2">
        {presets.map((preset, index) => {
          const isEditing = editingIndex === index;

          return (
            <Card
              key={index}
              className={cn(
                "p-3 transition-colors",
                isEditing && "ring-2 ring-primary"
              )}
            >
              {isEditing && editForm ? (
                // Edit Mode
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs">Name</Label>
                      <Input
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                        placeholder="e.g., Just Me"
                        autoFocus
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs">Servings</Label>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={editForm.size}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            size: parseInt(e.target.value, 10) || 1,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={handleSaveEdit}
                      disabled={isSaving}
                    >
                      <Check className="size-3 mr-1" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                    >
                      <X className="size-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="flex items-center gap-3">
                  {/* Drag Handle */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0 || isSaving}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move up"
                    >
                      <GripVertical className="size-3" />
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === presets.length - 1 || isSaving}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move down"
                    >
                      <GripVertical className="size-3 rotate-180" />
                    </button>
                  </div>

                  {/* Preset Info */}
                  <div className="flex-1">
                    <div className="font-medium text-sm">{preset.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {preset.size} {preset.size === 1 ? "serving" : "servings"}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleStartEdit(index)}
                      disabled={isSaving}
                    >
                      <Edit2 className="size-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteIndex(index)}
                      disabled={isSaving}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          );
        })}

        {/* Add New Preset */}
        {isAdding ? (
          <Card className="p-3 ring-2 ring-primary">
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Name</Label>
                  <Input
                    value={newPreset.name}
                    onChange={(e) =>
                      setNewPreset({ ...newPreset, name: e.target.value })
                    }
                    placeholder="e.g., Party"
                    autoFocus
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Servings</Label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={newPreset.size}
                    onChange={(e) =>
                      setNewPreset({
                        ...newPreset,
                        size: parseInt(e.target.value, 10) || 1,
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveNew}
                  disabled={isSaving}
                >
                  <Check className="size-3 mr-1" />
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancelAdd}
                  disabled={isSaving}
                >
                  <X className="size-3 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Button
            variant="outline"
            className="w-full"
            onClick={handleStartAdd}
            disabled={isSaving}
          >
            <Plus className="size-4 mr-2" />
            Add Preset
          </Button>
        )}
      </div>

      {isSaving && (
        <p className="text-xs text-muted-foreground text-center">Saving...</p>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteIndex !== null}
        onOpenChange={(open) => !open && setDeleteIndex(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Preset?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteIndex !== null ? presets[deleteIndex]?.name : ""}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
