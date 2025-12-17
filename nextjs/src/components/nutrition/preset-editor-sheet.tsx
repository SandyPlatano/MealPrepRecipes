"use client";

/**
 * PresetEditorSheet Component
 * Full preset management interface
 * Features:
 * - List all presets (including hidden, shown grayed out)
 * - Create new preset form
 * - Edit/Delete custom presets
 * - Pin/Unpin toggle
 * - Hide/Unhide toggle
 */

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
  Plus,
  Loader2,
  Pin,
  PinOff,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  ArrowLeft,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { MacroPreset, MacroPresetFormData } from "@/types/macro-preset";
import { PRESET_EMOJIS, getPresetEmoji, formatMacroSummary } from "@/types/macro-preset";
import {
  getMacroPresets,
  createMacroPreset,
  updateMacroPreset,
  deleteMacroPreset,
  togglePresetPinned,
  togglePresetHidden,
} from "@/app/actions/macro-presets";

interface PresetEditorSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onPresetsChanged?: () => void;
}

type EditorMode = "list" | "create" | "edit";

export function PresetEditorSheet({
  isOpen,
  onClose,
  onPresetsChanged,
}: PresetEditorSheetProps) {
  const [presets, setPresets] = useState<MacroPreset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState<EditorMode>("list");
  const [editingPreset, setEditingPreset] = useState<MacroPreset | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<MacroPresetFormData>({
    name: "",
    emoji: null,
    calories: null,
    protein_g: null,
    carbs_g: null,
    fat_g: null,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Load presets
  const loadPresets = useCallback(async () => {
    setIsLoading(true);
    const result = await getMacroPresets(true); // Include hidden
    if (result.error) {
      toast.error(result.error);
    } else {
      setPresets(result.data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadPresets();
      setMode("list");
      setEditingPreset(null);
    }
  }, [isOpen, loadPresets]);

  // Reset form when mode changes
  useEffect(() => {
    if (mode === "create") {
      setFormData({
        name: "",
        emoji: null,
        calories: null,
        protein_g: null,
        carbs_g: null,
        fat_g: null,
      });
    } else if (mode === "edit" && editingPreset) {
      setFormData({
        name: editingPreset.name,
        emoji: editingPreset.emoji,
        calories: editingPreset.calories,
        protein_g: editingPreset.protein_g,
        carbs_g: editingPreset.carbs_g,
        fat_g: editingPreset.fat_g,
      });
    }
  }, [mode, editingPreset]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (
      formData.calories == null &&
      formData.protein_g == null &&
      formData.carbs_g == null &&
      formData.fat_g == null
    ) {
      toast.error("At least one macro value is required");
      return;
    }

    setIsSaving(true);
    try {
      if (mode === "create") {
        const result = await createMacroPreset(formData);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success("Preset created");
          setMode("list");
          loadPresets();
          onPresetsChanged?.();
        }
      } else if (mode === "edit" && editingPreset) {
        const result = await updateMacroPreset(editingPreset.id, formData);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success("Preset updated");
          setMode("list");
          setEditingPreset(null);
          loadPresets();
          onPresetsChanged?.();
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await deleteMacroPreset(id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Preset deleted");
      loadPresets();
      onPresetsChanged?.();
    }
    setDeleteConfirmId(null);
  };

  const handleTogglePin = async (id: string) => {
    const result = await togglePresetPinned(id);
    if (result.error) {
      toast.error(result.error);
    } else {
      loadPresets();
      onPresetsChanged?.();
    }
  };

  const handleToggleHidden = async (id: string) => {
    const result = await togglePresetHidden(id);
    if (result.error) {
      toast.error(result.error);
    } else {
      loadPresets();
      onPresetsChanged?.();
    }
  };

  const renderListMode = () => (
    <>
      <SheetHeader>
        <SheetTitle>Manage Presets</SheetTitle>
        <SheetDescription>
          Create, edit, and organize your macro presets
        </SheetDescription>
      </SheetHeader>

      <div className="mt-6 space-y-4">
        {/* Create new button */}
        <Button
          className="w-full"
          onClick={() => setMode("create")}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create New Preset
        </Button>

        {/* Presets list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : presets.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No presets yet. Create your first one!
          </p>
        ) : (
          <div className="space-y-2">
            {presets.map((preset) => (
              <PresetListItem
                key={preset.id}
                preset={preset}
                onEdit={() => {
                  setEditingPreset(preset);
                  setMode("edit");
                }}
                onDelete={() => setDeleteConfirmId(preset.id)}
                onTogglePin={() => handleTogglePin(preset.id)}
                onToggleHidden={() => handleToggleHidden(preset.id)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );

  const renderFormMode = () => (
    <>
      <SheetHeader>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              setMode("list");
              setEditingPreset(null);
            }}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <SheetTitle>
            {mode === "create" ? "Create Preset" : "Edit Preset"}
          </SheetTitle>
        </div>
        <SheetDescription>
          {mode === "create"
            ? "Create a new macro preset for quick logging"
            : "Update your preset values"}
        </SheetDescription>
      </SheetHeader>

      <div className="mt-6 space-y-6">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="e.g., Morning Protein"
            maxLength={50}
          />
        </div>

        {/* Emoji picker */}
        <div className="space-y-2">
          <Label>Emoji (optional)</Label>
          <div className="flex flex-wrap gap-2">
            {PRESET_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    emoji: prev.emoji === emoji ? null : emoji,
                  }))
                }
                className={cn(
                  "h-10 w-10 rounded-lg text-xl",
                  "hover:bg-accent transition-colors",
                  formData.emoji === emoji
                    ? "bg-primary/10 ring-2 ring-primary"
                    : "bg-muted"
                )}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Macro values */}
        <div className="space-y-4">
          <Label>Macro Values</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="calories" className="text-xs text-muted-foreground">
                Calories
              </Label>
              <Input
                id="calories"
                type="number"
                value={formData.calories ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    calories: e.target.value === "" ? null : Number(e.target.value),
                  }))
                }
                placeholder="0"
                min={0}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="protein_g" className="text-xs text-muted-foreground">
                Protein (g)
              </Label>
              <Input
                id="protein_g"
                type="number"
                value={formData.protein_g ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    protein_g: e.target.value === "" ? null : Number(e.target.value),
                  }))
                }
                placeholder="0"
                min={0}
                step={0.1}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="carbs_g" className="text-xs text-muted-foreground">
                Carbs (g)
              </Label>
              <Input
                id="carbs_g"
                type="number"
                value={formData.carbs_g ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    carbs_g: e.target.value === "" ? null : Number(e.target.value),
                  }))
                }
                placeholder="0"
                min={0}
                step={0.1}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="fat_g" className="text-xs text-muted-foreground">
                Fat (g)
              </Label>
              <Input
                id="fat_g"
                type="number"
                value={formData.fat_g ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    fat_g: e.target.value === "" ? null : Number(e.target.value),
                  }))
                }
                placeholder="0"
                min={0}
                step={0.1}
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        <Button
          className="w-full"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {mode === "create" ? "Create Preset" : "Save Changes"}
            </>
          )}
        </Button>
      </div>
    </>
  );

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          {mode === "list" ? renderListMode() : renderFormMode()}
        </SheetContent>
      </Sheet>

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={deleteConfirmId !== null}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Preset?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This preset will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/**
 * Individual preset item in the list
 */
interface PresetListItemProps {
  preset: MacroPreset;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
  onToggleHidden: () => void;
}

function PresetListItem({
  preset,
  onEdit,
  onDelete,
  onTogglePin,
  onToggleHidden,
}: PresetListItemProps) {
  const emoji = getPresetEmoji(preset);
  const summary = formatMacroSummary(preset);

  return (
    <div
      className={cn(
        "p-3 rounded-lg border bg-card",
        preset.is_hidden && "opacity-50"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Emoji */}
        <div className="text-2xl shrink-0">{emoji}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium truncate">{preset.name}</h3>
            {preset.is_system && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                Default
              </span>
            )}
            {preset.is_pinned && (
              <Pin className="h-3 w-3 text-primary shrink-0" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">{summary}</p>
        </div>
      </div>

      {/* Actions row */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t">
        <div className="flex items-center gap-4">
          {/* Pin toggle */}
          <button
            onClick={onTogglePin}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {preset.is_pinned ? (
              <>
                <PinOff className="h-3.5 w-3.5" />
                Unpin
              </>
            ) : (
              <>
                <Pin className="h-3.5 w-3.5" />
                Pin
              </>
            )}
          </button>

          {/* Hide toggle */}
          <button
            onClick={onToggleHidden}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {preset.is_hidden ? (
              <>
                <Eye className="h-3.5 w-3.5" />
                Show
              </>
            ) : (
              <>
                <EyeOff className="h-3.5 w-3.5" />
                Hide
              </>
            )}
          </button>
        </div>

        {/* Edit/Delete (only for non-system presets) */}
        {!preset.is_system && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={onEdit}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-destructive hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
