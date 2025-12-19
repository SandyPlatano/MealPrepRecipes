"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { FilterConditionRow } from "./filter-condition-row";
import { createSmartFolder, updateSmartFolder } from "@/app/actions/smart-folders";
import type { FolderWithChildren, FolderCategory } from "@/types/folder";
import type {
  SmartFilterCondition,
  SmartFilterCriteria,
  SmartFolderPreset,
} from "@/types/smart-folder";
import { SMART_FOLDER_PRESETS, SMART_FILTER_FIELDS } from "@/types/smart-folder";
import { FOLDER_COLORS, FOLDER_EMOJIS } from "@/types/folder";

interface SmartFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folder?: FolderWithChildren | null; // If provided, editing mode
  categories?: FolderCategory[];
}

// Default condition for new filters
const DEFAULT_CONDITION: SmartFilterCondition = {
  field: "recipe_type",
  operator: "eq",
  value: null,
};

export function SmartFolderDialog({
  open,
  onOpenChange,
  folder,
  categories = [],
}: SmartFolderDialogProps) {
  const router = useRouter();
  const isEditing = !!folder;
  const [isPending, startTransition] = useTransition();

  // Form state
  const [name, setName] = useState(folder?.name ?? "");
  const [emoji, setEmoji] = useState<string | null>(folder?.emoji ?? null);
  const [color, setColor] = useState<string | null>(folder?.color ?? null);
  const [categoryId, setCategoryId] = useState<string | null>(
    folder?.category_id ?? null
  );
  const [conditions, setConditions] = useState<SmartFilterCondition[]>(
    folder?.smart_filters?.conditions ?? [{ ...DEFAULT_CONDITION }]
  );

  // Reset form when dialog opens/closes or folder changes
  useMemo(() => {
    if (open) {
      setName(folder?.name ?? "");
      setEmoji(folder?.emoji ?? null);
      setColor(folder?.color ?? null);
      setCategoryId(folder?.category_id ?? null);
      setConditions(
        folder?.smart_filters?.conditions ?? [{ ...DEFAULT_CONDITION }]
      );
    }
  }, [open, folder]);

  // Handle adding a new condition
  const handleAddCondition = () => {
    setConditions([...conditions, { ...DEFAULT_CONDITION }]);
  };

  // Handle updating a condition
  const handleUpdateCondition = (index: number, condition: SmartFilterCondition) => {
    const updated = [...conditions];
    updated[index] = condition;
    setConditions(updated);
  };

  // Handle removing a condition
  const handleRemoveCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  // Handle applying a preset
  const handleApplyPreset = (preset: SmartFolderPreset) => {
    setName(preset.name);
    setEmoji(preset.emoji);
    setConditions([...preset.filters.conditions]);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a folder name");
      return;
    }

    if (conditions.length === 0) {
      toast.error("Please add at least one filter condition");
      return;
    }

    // Validate all conditions have values (except null operators)
    const invalidCondition = conditions.find((c) => {
      if (c.operator === "is_null" || c.operator === "is_not_null") {
        return false;
      }
      if (c.operator === "in" || c.operator === "not_in") {
        return !Array.isArray(c.value) || c.value.length === 0;
      }
      return c.value === null || c.value === undefined || c.value === "";
    });

    if (invalidCondition) {
      const fieldMeta = SMART_FILTER_FIELDS.find(
        (f) => f.field === invalidCondition.field
      );
      toast.error(`Please enter a value for "${fieldMeta?.label || invalidCondition.field}"`);
      return;
    }

    const criteria: SmartFilterCriteria = { conditions };

    startTransition(async () => {
      const result = isEditing
        ? await updateSmartFolder(folder!.id, {
            name: name.trim(),
            emoji,
            color,
            category_id: categoryId,
            smart_filters: criteria,
          })
        : await createSmartFolder({
            name: name.trim(),
            emoji,
            color,
            category_id: categoryId,
            smart_filters: criteria,
          });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(isEditing ? "Smart folder updated" : "Smart folder created");
        onOpenChange(false);
        // Force refresh to update the sidebar with new folder
        router.refresh();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand-coral" />
            {isEditing ? "Edit Smart Folder" : "Create Smart Folder"}
          </DialogTitle>
          <DialogDescription>
            Smart folders automatically show recipes matching your filter criteria.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Quick Presets (only for new folders) */}
          {!isEditing && (
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium">Quick Start</Label>
              <div className="flex flex-wrap gap-2">
                {SMART_FOLDER_PRESETS.slice(0, 4).map((preset) => (
                  <Button
                    key={preset.id}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => handleApplyPreset(preset)}
                  >
                    <span className="mr-1">{preset.emoji}</span>
                    {preset.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Name & Appearance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Smart Folder"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={categoryId ?? "none"}
                onValueChange={(v) => setCategoryId(v === "none" ? null : v)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Uncategorized" />
                </SelectTrigger>
                <SelectContent className="z-[10000]">
                  <SelectItem value="none">Uncategorized</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.emoji && <span className="mr-1">{cat.emoji}</span>}
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Emoji & Color */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Icon</Label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 border rounded-md">
                <button
                  type="button"
                  onClick={() => setEmoji(null)}
                  className={`w-8 h-8 flex items-center justify-center rounded transition-colors text-xs ${
                    emoji === null
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  None
                </button>
                {FOLDER_EMOJIS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setEmoji(e)}
                    className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
                      emoji === e
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-1.5 p-2 border rounded-md">
                <button
                  type="button"
                  onClick={() => setColor(null)}
                  className={`w-8 h-8 rounded flex items-center justify-center text-xs transition-all ${
                    color === null ? "ring-2 ring-primary" : ""
                  }`}
                >
                  None
                </button>
                {FOLDER_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded transition-all ${
                      color === c
                        ? "ring-2 ring-primary ring-offset-2"
                        : "hover:scale-110"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Filter Conditions */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Filter Conditions</Label>
              <span className="text-xs text-muted-foreground">
                Recipes must match ALL conditions
              </span>
            </div>

            <div className="flex flex-col gap-3 p-4 bg-muted/50 rounded-lg">
              {conditions.map((condition, index) => (
                <FilterConditionRow
                  key={index}
                  condition={condition}
                  onChange={(c) => handleUpdateCondition(index, c)}
                  onRemove={() => handleRemoveCondition(index)}
                  canRemove={conditions.length > 1}
                />
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddCondition}
                className="w-full mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Condition
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Smart Folder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
