"use client";

/**
 * Cook Mode Settings Sheet
 * Bottom sheet for customizing the cook mode experience
 * Features:
 * - Display options: font size, theme override
 * - Visibility toggles: ingredients, timers, progress bar
 * - Behavior settings: wake lock, timer sounds, auto-advance
 * - Navigation mode: step-by-step vs scrollable
 */

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  ChevronDown,
  Settings2,
  Type,
  Eye,
  Zap,
  Navigation,
  Sun,
  Moon,
  Monitor,
  Wand2,
  Plus,
  Settings,
  Star,
  Minus,
  Sparkles,
  Hand,
  Focus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  updateCookModeSettings,
  getCustomCookModePresets,
  saveCustomCookModePreset,
  setDefaultCookModePreset
} from "@/app/actions/settings";
import { toast } from "sonner";
import type {
  CookModeSettings,
  CookModeFontSize,
  CookModeTheme,
  CookModeNavigationMode,
  CustomCookModePreset,
} from "@/types/settings";
import { COOK_MODE_PRESETS, getMatchingPreset } from "@/lib/cook-mode-presets";
import { CookModeSettingsPreview } from "./cook-mode-settings-preview";
import { CookModePresetEditor } from "./cook-mode-preset-editor";

interface CookModeSettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CookModeSettings;
  onSettingsChange: (settings: CookModeSettings) => void;
}

// Icon mapping for built-in presets
const PRESET_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Minus,
  Sparkles,
  Hand,
  Focus,
};

// Helper to get icon component from name
function PresetIcon({ name, className }: { name: string; className?: string }) {
  const IconComponent = PRESET_ICON_MAP[name];
  if (!IconComponent) return null;
  return <IconComponent className={className} />;
}

export function CookModeSettingsSheet({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
}: CookModeSettingsSheetProps) {
  const [localSettings, setLocalSettings] = useState<CookModeSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [customPresets, setCustomPresets] = useState<CustomCookModePreset[]>([]);
  const [loadingPresets, setLoadingPresets] = useState(true);
  const [showPresetEditor, setShowPresetEditor] = useState(false);

  // Sync local settings when props change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Load custom presets on mount
  useEffect(() => {
    async function loadPresets() {
      const result = await getCustomCookModePresets();
      if (!result.error) {
        setCustomPresets(result.data);
      }
      setLoadingPresets(false);
    }
    if (isOpen) {
      loadPresets();
    }
  }, [isOpen]);

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

  // Save settings with debounce
  const saveSettings = useCallback(async (newSettings: CookModeSettings) => {
    setIsSaving(true);
    try {
      const result = await updateCookModeSettings(newSettings);
      if (result.error) {
        toast.error("Failed to save settings");
      }
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Update a setting and propagate changes
  const updateSetting = useCallback(
    <K extends keyof CookModeSettings>(
      category: K,
      key: keyof CookModeSettings[K],
      value: CookModeSettings[K][typeof key]
    ) => {
      const newSettings: CookModeSettings = {
        ...localSettings,
        [category]: {
          ...localSettings[category],
          [key]: value,
        },
      };
      setLocalSettings(newSettings);
      onSettingsChange(newSettings);
      saveSettings(newSettings);
    },
    [localSettings, onSettingsChange, saveSettings]
  );

  // Apply a preset
  const applyPreset = useCallback(
    (presetKey: string) => {
      const preset = COOK_MODE_PRESETS.find((p) => p.key === presetKey);
      if (preset) {
        setLocalSettings(preset.settings);
        onSettingsChange(preset.settings);
        saveSettings(preset.settings);
        toast.success(`Applied "${preset.name}" preset`);
      }
    },
    [onSettingsChange, saveSettings]
  );

  // Apply a preset from settings object
  const onApplyPreset = useCallback(
    async (presetSettings: CookModeSettings) => {
      setLocalSettings(presetSettings);
      onSettingsChange(presetSettings);
      saveSettings(presetSettings);
      toast.success("Preset applied!");
    },
    [onSettingsChange, saveSettings]
  );

  // Handle save preset
  const handleSavePreset = useCallback(
    async (preset: Omit<CustomCookModePreset, "id" | "createdAt">) => {
      const result = await saveCustomCookModePreset(preset);
      if (!result.error && result.data) {
        setCustomPresets((prev) => [...prev, result.data!]);
        toast.success("Preset saved!");
      } else {
        toast.error("Failed to save preset");
      }
    },
    []
  );

  // Check if current settings match a preset
  const currentPreset = getMatchingPreset(localSettings);

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
            <Settings2 className="h-5 w-5 text-primary" />
            <span className="text-lg font-semibold">Cook Mode Settings</span>
            {isSaving && (
              <span className="text-xs text-muted-foreground animate-pulse">
                Saving...
              </span>
            )}
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

        {/* Content - Integrated Layout */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {/* Two-Column Layout on Desktop */}
          <div className="grid md:grid-cols-[280px_1fr] gap-4">
            {/* Left Column: Preview */}
            <div className="hidden md:block">
              <CookModeSettingsPreview settings={localSettings} />
            </div>

            {/* Right Column: All Settings */}
            <div className="flex flex-col">
              {/* Presets Section */}
              <div className="flex flex-col pb-4 border-b">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Quick Presets</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPresetEditor(true)}
                    className="h-8 px-2"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Save Current
                  </Button>
                </div>

                {/* Built-in Presets */}
                <div className="grid grid-cols-2 gap-2">
                  {COOK_MODE_PRESETS.map((preset) => (
                    <Button
                      key={preset.key}
                      variant={currentPreset === preset.key ? "default" : "outline"}
                      size="sm"
                      className="justify-start h-9"
                      onClick={() => onApplyPreset(preset.settings)}
                    >
                      <PresetIcon name={preset.icon} className="h-4 w-4 mr-2" />
                      {preset.name}
                    </Button>
                  ))}
                </div>

                {/* Custom Presets */}
                {customPresets.length > 0 && (
                  <div className="flex flex-col">
                    <Label className="text-xs text-muted-foreground">Your Presets</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {customPresets.map((preset) => (
                        <Button
                          key={preset.id}
                          variant="outline"
                          size="sm"
                          className="justify-start h-9 relative"
                          onClick={() => onApplyPreset(preset.settings)}
                        >
                          {preset.isDefault && (
                            <Star className="h-3 w-3 absolute top-1 right-1 text-yellow-500 fill-yellow-500" />
                          )}
                          <span className="mr-2 text-base">{preset.icon}</span>
                          <span className="truncate text-xs">{preset.name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {/* Display Row - Font + Theme */}
              <div className="grid grid-cols-2 gap-3">
                {/* Font Size */}
                <div className="flex flex-col">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Type className="h-3 w-3" />
                    Font Size
                  </Label>
                  <div className="flex gap-1">
                    {(["small", "medium", "large"] as CookModeFontSize[]).map(
                      (size) => (
                        <Button
                          key={size}
                          variant={
                            localSettings.display.fontSize === size
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => updateSetting("display", "fontSize", size)}
                          className="flex-1 capitalize h-8 text-xs px-2"
                        >
                          {size.charAt(0).toUpperCase()}
                        </Button>
                      )
                    )}
                  </div>
                </div>

                {/* Theme Override */}
                <div className="flex flex-col">
                  <Label className="text-xs text-muted-foreground">Theme</Label>
                  <div className="flex gap-1">
                    {(
                      [
                        { value: "system", icon: <Monitor className="h-3.5 w-3.5" /> },
                        { value: "light", icon: <Sun className="h-3.5 w-3.5" /> },
                        { value: "dark", icon: <Moon className="h-3.5 w-3.5" /> },
                      ] as { value: CookModeTheme; icon: React.ReactNode }[]
                    ).map(({ value, icon }) => (
                      <Button
                        key={value}
                        variant={
                          localSettings.display.themeOverride === value
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          updateSetting("display", "themeOverride", value)
                        }
                        className="flex-1 h-8 px-2"
                      >
                        {icon}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Navigation Mode */}
              <div className="flex flex-col">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Navigation className="h-3 w-3" />
                  Navigation
                </Label>
                <div className="grid grid-cols-2 gap-1">
                  {(
                    [
                      { value: "step-by-step", label: "Step by Step" },
                      { value: "scrollable", label: "Scrollable" },
                    ] as { value: CookModeNavigationMode; label: string }[]
                  ).map(({ value, label }) => (
                    <Button
                      key={value}
                      variant={
                        localSettings.navigation.mode === value
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => updateSetting("navigation", "mode", value)}
                      className="h-8 text-xs"
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Toggles Grid - More Compact */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2 border-t">
                {/* Visibility Toggles */}
                <div className="flex flex-col">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    Show/Hide
                  </Label>
                  <CompactToggle
                    label="Ingredients"
                    checked={localSettings.visibility.showIngredients}
                    onCheckedChange={(checked) =>
                      updateSetting("visibility", "showIngredients", checked)
                    }
                  />
                  <CompactToggle
                    label="Timers"
                    checked={localSettings.visibility.showTimers}
                    onCheckedChange={(checked) =>
                      updateSetting("visibility", "showTimers", checked)
                    }
                  />
                  <CompactToggle
                    label="Progress"
                    checked={localSettings.visibility.showProgress}
                    onCheckedChange={(checked) =>
                      updateSetting("visibility", "showProgress", checked)
                    }
                  />
                </div>

                {/* Behavior Toggles */}
                <div className="flex flex-col">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    Behavior
                  </Label>
                  <CompactToggle
                    label="Screen Awake"
                    checked={localSettings.behavior.keepScreenAwake}
                    onCheckedChange={(checked) =>
                      updateSetting("behavior", "keepScreenAwake", checked)
                    }
                  />
                  <CompactToggle
                    label="Timer Sounds"
                    checked={localSettings.behavior.timerSounds}
                    onCheckedChange={(checked) =>
                      updateSetting("behavior", "timerSounds", checked)
                    }
                  />
                  <CompactToggle
                    label="Auto-Advance"
                    checked={localSettings.behavior.autoAdvance}
                    onCheckedChange={(checked) =>
                      updateSetting("behavior", "autoAdvance", checked)
                    }
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Link to Full Settings */}
          <div className="mt-6 pt-4 border-t px-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                window.location.href = "/app/settings/cooking-mode";
              }}
            >
              <Settings className="h-4 w-4 mr-2" />
              All Cooking Mode Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Preset Editor Dialog */}
      <CookModePresetEditor
        open={showPresetEditor}
        onOpenChange={setShowPresetEditor}
        currentSettings={localSettings}
        onSave={handleSavePreset}
      />
    </>
  );
}

/**
 * Compact toggle setting - just label and switch inline
 */
interface CompactToggleProps {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

function CompactToggle({
  label,
  checked,
  onCheckedChange,
}: CompactToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="scale-90"
      />
    </div>
  );
}
