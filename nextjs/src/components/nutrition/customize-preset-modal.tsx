"use client";

/**
 * CustomizePresetModal Component
 * Modal to adjust preset values before adding to nutrition log
 * Pre-fills with preset values and allows customization
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";
import type { MacroPreset, MacroValues } from "@/types/macro-preset";
import { getPresetEmoji } from "@/types/macro-preset";

interface CustomizePresetModalProps {
  preset: MacroPreset | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: MacroValues, note?: string) => Promise<void>;
}

export function CustomizePresetModal({
  preset,
  isOpen,
  onClose,
  onSubmit,
}: CustomizePresetModalProps) {
  const [values, setValues] = useState<MacroValues>({
    calories: null,
    protein_g: null,
    carbs_g: null,
    fat_g: null,
  });
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when preset changes
  useEffect(() => {
    if (preset) {
      setValues({
        calories: preset.calories,
        protein_g: preset.protein_g,
        carbs_g: preset.carbs_g,
        fat_g: preset.fat_g,
      });
      setNote("");
    }
  }, [preset]);

  const handleSubmit = async () => {
    // Validate at least one value
    if (
      values.calories === null &&
      values.protein_g === null &&
      values.carbs_g === null &&
      values.fat_g === null
    ) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values, note.trim() || undefined);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleValueChange = (field: keyof MacroValues, value: string) => {
    const numValue = value === "" ? null : Number(value);
    setValues((prev) => ({
      ...prev,
      [field]: numValue,
    }));
  };

  if (!preset) return null;

  const emoji = getPresetEmoji(preset);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-xl">{emoji}</span>
            <span>Customize {preset.name}</span>
          </DialogTitle>
          <DialogDescription>
            Adjust the values before adding to your log
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Macro inputs in a 2x2 grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="calories" className="text-sm">
                Calories
              </Label>
              <Input
                id="calories"
                type="number"
                value={values.calories ?? ""}
                onChange={(e) => handleValueChange("calories", e.target.value)}
                placeholder="0"
                className="h-10"
                min={0}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="protein" className="text-sm">
                Protein (g)
              </Label>
              <Input
                id="protein"
                type="number"
                value={values.protein_g ?? ""}
                onChange={(e) => handleValueChange("protein_g", e.target.value)}
                placeholder="0"
                className="h-10"
                min={0}
                step={0.1}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="carbs" className="text-sm">
                Carbs (g)
              </Label>
              <Input
                id="carbs"
                type="number"
                value={values.carbs_g ?? ""}
                onChange={(e) => handleValueChange("carbs_g", e.target.value)}
                placeholder="0"
                className="h-10"
                min={0}
                step={0.1}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fat" className="text-sm">
                Fat (g)
              </Label>
              <Input
                id="fat"
                type="number"
                value={values.fat_g ?? ""}
                onChange={(e) => handleValueChange("fat_g", e.target.value)}
                placeholder="0"
                className="h-10"
                min={0}
                step={0.1}
              />
            </div>
          </div>

          {/* Note field */}
          <div className="space-y-2">
            <Label htmlFor="note" className="text-sm text-muted-foreground">
              Note (optional)
            </Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Post-workout, extra scoop..."
              className="resize-none h-16"
              maxLength={200}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add to Log
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
