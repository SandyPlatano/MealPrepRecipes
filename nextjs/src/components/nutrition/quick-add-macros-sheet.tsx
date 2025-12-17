"use client";

/**
 * Quick Add Macros Sheet
 * Bottom sheet for quickly logging macros without a full recipe
 * Features:
 * - One-tap preset cards for instant logging
 * - Pinned presets section for favorites
 * - Customize option to adjust values before adding
 * - Custom entry section for manual input
 * - Preset management link
 */

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  ChevronDown,
  Settings,
  Loader2,
  Pin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { MacroPreset, MacroValues } from "@/types/macro-preset";
import { addQuickMacros } from "@/app/actions/nutrition";
import {
  getMacroPresets,
  quickAddFromPreset,
  seedDefaultPresets,
} from "@/app/actions/macro-presets";
import { PresetCard, CreatePresetCard } from "./preset-card";
import { CustomizePresetModal } from "./customize-preset-modal";
import { PresetEditorSheet } from "./preset-editor-sheet";

interface QuickAddMacrosSheetProps {
  isOpen: boolean;
  onClose: () => void;
  date?: string; // ISO date string, defaults to today
}

export function QuickAddMacrosSheet({
  isOpen,
  onClose,
  date,
}: QuickAddMacrosSheetProps) {
  // Presets state
  const [presets, setPresets] = useState<MacroPreset[]>([]);
  const [isLoadingPresets, setIsLoadingPresets] = useState(true);

  // Custom entry state
  const [customValues, setCustomValues] = useState<MacroValues>({
    calories: null,
    protein_g: null,
    carbs_g: null,
    fat_g: null,
  });
  const [customNote, setCustomNote] = useState("");
  const [isSubmittingCustom, setIsSubmittingCustom] = useState(false);

  // Modal states
  const [customizePreset, setCustomizePreset] = useState<MacroPreset | null>(null);
  const [showPresetEditor, setShowPresetEditor] = useState(false);

  // Get today's date if not provided
  const targetDate = date || new Date().toISOString().split("T")[0];

  // Load presets
  const loadPresets = useCallback(async () => {
    setIsLoadingPresets(true);

    // First, ensure user has presets (seed defaults if needed)
    await seedDefaultPresets();

    // Then load presets
    const result = await getMacroPresets(false); // Exclude hidden
    if (!result.error) {
      setPresets(result.data);
    }
    setIsLoadingPresets(false);
  }, []);

  // Load presets when sheet opens
  useEffect(() => {
    if (isOpen) {
      loadPresets();
    }
  }, [isOpen, loadPresets]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !showPresetEditor && !customizePreset) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, isOpen, showPresetEditor, customizePreset]);

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
      setCustomValues({ calories: null, protein_g: null, carbs_g: null, fat_g: null });
      setCustomNote("");
      setCustomizePreset(null);
    }
  }, [isOpen]);

  // One-tap add from preset
  const handleQuickAdd = async (presetId: string) => {
    const result = await quickAddFromPreset(presetId, targetDate);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Added to log!");
    }
  };

  // Add customized values
  const handleCustomizedAdd = async (values: MacroValues, note?: string) => {
    const result = await addQuickMacros({
      date: targetDate,
      nutrition: {
        calories: values.calories,
        protein_g: values.protein_g,
        carbs_g: values.carbs_g,
        fat_g: values.fat_g,
      },
      note,
      preset: customizePreset?.name,
    });

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Added to log!");
      setCustomizePreset(null);
    }
  };

  // Add custom entry
  const handleCustomSubmit = async () => {
    if (
      customValues.calories === null &&
      customValues.protein_g === null &&
      customValues.carbs_g === null &&
      customValues.fat_g === null
    ) {
      toast.error("Enter at least one value");
      return;
    }

    setIsSubmittingCustom(true);
    try {
      const result = await addQuickMacros({
        date: targetDate,
        nutrition: {
          calories: customValues.calories,
          protein_g: customValues.protein_g,
          carbs_g: customValues.carbs_g,
          fat_g: customValues.fat_g,
        },
        note: customNote.trim() || undefined,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Added to log!");
        setCustomValues({ calories: null, protein_g: null, carbs_g: null, fat_g: null });
        setCustomNote("");
      }
    } finally {
      setIsSubmittingCustom(false);
    }
  };

  // Split presets into pinned and regular
  const pinnedPresets = presets.filter((p) => p.is_pinned);
  const regularPresets = presets.filter((p) => !p.is_pinned);

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
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5"
              onClick={() => setShowPresetEditor(true)}
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Manage</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={onClose}
            >
              <ChevronDown className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {isLoadingPresets ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Pinned presets section */}
              {pinnedPresets.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Pin className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Pinned
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {pinnedPresets.map((preset) => (
                      <PresetCard
                        key={preset.id}
                        preset={preset}
                        onQuickAdd={handleQuickAdd}
                        onCustomize={setCustomizePreset}
                        showActions={false}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* All presets section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground">
                    {pinnedPresets.length > 0 ? "All Presets" : "Presets"}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {regularPresets.map((preset) => (
                    <PresetCard
                      key={preset.id}
                      preset={preset}
                      onQuickAdd={handleQuickAdd}
                      onCustomize={setCustomizePreset}
                      showActions={false}
                    />
                  ))}
                  <CreatePresetCard onClick={() => setShowPresetEditor(true)} />
                </div>
              </div>

              {/* Custom entry section */}
              <div className="border-t pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm font-medium text-muted-foreground">
                    Or enter custom values
                  </span>
                </div>

                {/* Compact input row */}
                <div className="grid grid-cols-4 gap-2 mb-3">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Cal</Label>
                    <Input
                      type="number"
                      value={customValues.calories ?? ""}
                      onChange={(e) =>
                        setCustomValues((prev) => ({
                          ...prev,
                          calories: e.target.value === "" ? null : Number(e.target.value),
                        }))
                      }
                      placeholder="0"
                      className="h-10 text-center"
                      min={0}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Pro</Label>
                    <Input
                      type="number"
                      value={customValues.protein_g ?? ""}
                      onChange={(e) =>
                        setCustomValues((prev) => ({
                          ...prev,
                          protein_g: e.target.value === "" ? null : Number(e.target.value),
                        }))
                      }
                      placeholder="0"
                      className="h-10 text-center"
                      min={0}
                      step={0.1}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Carb</Label>
                    <Input
                      type="number"
                      value={customValues.carbs_g ?? ""}
                      onChange={(e) =>
                        setCustomValues((prev) => ({
                          ...prev,
                          carbs_g: e.target.value === "" ? null : Number(e.target.value),
                        }))
                      }
                      placeholder="0"
                      className="h-10 text-center"
                      min={0}
                      step={0.1}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Fat</Label>
                    <Input
                      type="number"
                      value={customValues.fat_g ?? ""}
                      onChange={(e) =>
                        setCustomValues((prev) => ({
                          ...prev,
                          fat_g: e.target.value === "" ? null : Number(e.target.value),
                        }))
                      }
                      placeholder="0"
                      className="h-10 text-center"
                      min={0}
                      step={0.1}
                    />
                  </div>
                </div>

                {/* Note and submit */}
                <div className="flex gap-2">
                  <Input
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder="Note (optional)"
                    className="flex-1 h-10"
                    maxLength={200}
                  />
                  <Button
                    onClick={handleCustomSubmit}
                    disabled={isSubmittingCustom}
                    className="h-10"
                  >
                    {isSubmittingCustom ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Customize preset modal */}
      <CustomizePresetModal
        preset={customizePreset}
        isOpen={customizePreset !== null}
        onClose={() => setCustomizePreset(null)}
        onSubmit={handleCustomizedAdd}
      />

      {/* Preset editor sheet */}
      <PresetEditorSheet
        isOpen={showPresetEditor}
        onClose={() => setShowPresetEditor(false)}
        onPresetsChanged={loadPresets}
      />
    </>
  );
}
