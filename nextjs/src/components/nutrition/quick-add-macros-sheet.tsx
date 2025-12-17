"use client";

/**
 * Quick Add Macros Sheet
 * Bottom sheet for quickly logging macros without a full recipe
 * Features:
 * - Preset buttons for common items (Snack, Protein Shake, Coffee)
 * - Number inputs with +/- steppers for each macro
 * - Optional note field
 * - Saves as a "quick add" entry
 */

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Minus,
  ChevronDown,
  Cookie,
  GlassWater,
  Coffee,
  Pencil,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { addQuickMacros } from "@/app/actions/nutrition";
import { toast } from "sonner";

interface QuickAddMacrosSheetProps {
  isOpen: boolean;
  onClose: () => void;
  date?: string; // ISO date string, defaults to today
}

interface MacroValues {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface Preset {
  id: string;
  label: string;
  icon: React.ReactNode;
  values: MacroValues;
}

const PRESETS: Preset[] = [
  {
    id: "snack",
    label: "Snack",
    icon: <Cookie className="h-4 w-4" />,
    values: { calories: 150, protein: 3, carbs: 20, fat: 7 },
  },
  {
    id: "shake",
    label: "Protein Shake",
    icon: <GlassWater className="h-4 w-4" />,
    values: { calories: 200, protein: 25, carbs: 10, fat: 3 },
  },
  {
    id: "coffee",
    label: "Coffee",
    icon: <Coffee className="h-4 w-4" />,
    values: { calories: 50, protein: 1, carbs: 5, fat: 2 },
  },
  {
    id: "custom",
    label: "Custom",
    icon: <Pencil className="h-4 w-4" />,
    values: { calories: 0, protein: 0, carbs: 0, fat: 0 },
  },
];

export function QuickAddMacrosSheet({
  isOpen,
  onClose,
  date,
}: QuickAddMacrosSheetProps) {
  const [activePreset, setActivePreset] = useState<string>("custom");
  const [values, setValues] = useState<MacroValues>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get today's date if not provided
  const targetDate = date || new Date().toISOString().split("T")[0];

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, isOpen]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      setActivePreset("custom");
      setValues({ calories: 0, protein: 0, carbs: 0, fat: 0 });
      setNote("");
    }
  }, [isOpen]);

  const handlePresetSelect = useCallback((preset: Preset) => {
    setActivePreset(preset.id);
    setValues(preset.values);
  }, []);

  const handleValueChange = useCallback(
    (macro: keyof MacroValues, newValue: number) => {
      setValues((prev) => ({
        ...prev,
        [macro]: Math.max(0, newValue),
      }));
      // Switch to custom when manually editing
      setActivePreset("custom");
    },
    []
  );

  const handleIncrement = useCallback(
    (macro: keyof MacroValues, step: number) => {
      setValues((prev) => ({
        ...prev,
        [macro]: Math.max(0, prev[macro] + step),
      }));
      setActivePreset("custom");
    },
    []
  );

  const handleSubmit = async () => {
    // Validate - at least one macro should be non-zero
    if (
      values.calories === 0 &&
      values.protein === 0 &&
      values.carbs === 0 &&
      values.fat === 0
    ) {
      toast.error("Please enter at least one macro value");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await addQuickMacros({
        date: targetDate,
        nutrition: {
          calories: values.calories || null,
          protein_g: values.protein || null,
          carbs_g: values.carbs || null,
          fat_g: values.fat || null,
        },
        note: note.trim() || undefined,
        preset: activePreset !== "custom" ? activePreset : undefined,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Macros logged successfully!");
      onClose();
    } catch (error) {
      console.error("Error adding quick macros:", error);
      toast.error("Failed to log macros");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with blur */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm",
          "animate-in fade-in duration-200"
        )}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-50",
          "max-h-[85vh]",
          "bg-background rounded-t-2xl shadow-2xl",
          "animate-in slide-in-from-bottom duration-300 ease-out",
          "flex flex-col"
        )}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <button
            onClick={onClose}
            className="w-12 h-1.5 rounded-full bg-muted-foreground/30 hover:bg-muted-foreground/50 transition-colors"
            aria-label="Close"
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-4">
          <div className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            <span className="text-lg font-semibold">Quick Add Macros</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full"
            onClick={onClose}
          >
            <ChevronDown className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {/* Preset buttons */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {PRESETS.map((preset) => (
              <Button
                key={preset.id}
                variant={activePreset === preset.id ? "default" : "outline"}
                size="sm"
                className={cn(
                  "h-auto py-3 flex flex-col gap-1",
                  activePreset === preset.id && "shadow-md"
                )}
                onClick={() => handlePresetSelect(preset)}
              >
                {preset.icon}
                <span className="text-xs">{preset.label}</span>
              </Button>
            ))}
          </div>

          {/* Macro inputs */}
          <div className="space-y-4">
            <MacroInput
              label="Calories"
              value={values.calories}
              onChange={(v) => handleValueChange("calories", v)}
              onIncrement={(step) => handleIncrement("calories", step)}
              unit="kcal"
              step={50}
            />
            <MacroInput
              label="Protein"
              value={values.protein}
              onChange={(v) => handleValueChange("protein", v)}
              onIncrement={(step) => handleIncrement("protein", step)}
              unit="g"
              step={5}
            />
            <MacroInput
              label="Carbs"
              value={values.carbs}
              onChange={(v) => handleValueChange("carbs", v)}
              onIncrement={(step) => handleIncrement("carbs", step)}
              unit="g"
              step={5}
            />
            <MacroInput
              label="Fat"
              value={values.fat}
              onChange={(v) => handleValueChange("fat", v)}
              onIncrement={(step) => handleIncrement("fat", step)}
              unit="g"
              step={2}
            />
          </div>

          {/* Note field */}
          <div className="mt-6 space-y-2">
            <Label htmlFor="note" className="text-sm text-muted-foreground">
              Note (optional)
            </Label>
            <Textarea
              id="note"
              placeholder="e.g., Post-workout shake"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="resize-none h-20"
              maxLength={200}
            />
          </div>

          {/* Submit button */}
          <Button
            className="w-full mt-6 h-12"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add to Today&apos;s Log
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}

/**
 * Individual macro input with +/- steppers
 */
interface MacroInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  onIncrement: (step: number) => void;
  unit: string;
  step: number;
}

function MacroInput({
  label,
  value,
  onChange,
  onIncrement,
  unit,
  step,
}: MacroInputProps) {
  return (
    <div className="flex items-center gap-3">
      <Label className="w-20 text-sm font-medium">{label}</Label>

      <div className="flex-1 flex items-center gap-2">
        {/* Decrement button */}
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full shrink-0"
          onClick={() => onIncrement(-step)}
          disabled={value <= 0}
        >
          <Minus className="h-4 w-4" />
        </Button>

        {/* Input */}
        <div className="relative flex-1">
          <Input
            type="number"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value) || 0)}
            className="h-12 text-center text-lg font-semibold pr-12 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            min={0}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {unit}
          </span>
        </div>

        {/* Increment button */}
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full shrink-0"
          onClick={() => onIncrement(step)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
