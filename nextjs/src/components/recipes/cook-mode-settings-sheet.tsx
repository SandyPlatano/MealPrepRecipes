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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { updateCookModeSettings } from "@/app/actions/settings";
import { toast } from "sonner";
import type {
  CookModeSettings,
  CookModeFontSize,
  CookModeTheme,
  CookModeNavigationMode,
} from "@/types/settings";
import { COOK_MODE_PRESETS, getMatchingPreset } from "@/lib/cook-mode-presets";
import { CookModePresetCard } from "./cook-mode-preset-card";
import { CookModeSettingsPreview } from "./cook-mode-settings-preview";

interface CookModeSettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CookModeSettings;
  onSettingsChange: (settings: CookModeSettings) => void;
}

export function CookModeSettingsSheet({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
}: CookModeSettingsSheetProps) {
  const [localSettings, setLocalSettings] = useState<CookModeSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);

  // Sync local settings when props change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

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

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-6">
          {/* Live Preview - sticky on desktop */}
          <div className="hidden md:block sticky top-0 z-10 pb-4 bg-background">
            <CookModeSettingsPreview settings={localSettings} />
          </div>

          {/* Quick Presets */}
          <SettingsSection icon={<Wand2 className="h-4 w-4" />} title="Quick Presets">
            <div className="grid grid-cols-2 gap-3 -ml-6">
              {COOK_MODE_PRESETS.map((preset) => (
                <CookModePresetCard
                  key={preset.key}
                  preset={preset}
                  isSelected={currentPreset === preset.key}
                  onSelect={() => applyPreset(preset.key)}
                />
              ))}
            </div>
          </SettingsSection>

          {/* Display Options */}
          <SettingsSection icon={<Type className="h-4 w-4" />} title="Display">
            {/* Font Size */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Font Size</Label>
              <div className="grid grid-cols-3 gap-2">
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
                      className="capitalize"
                    >
                      {size}
                    </Button>
                  )
                )}
              </div>
            </div>

            {/* Theme Override */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Theme Override
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { value: "system", icon: <Monitor className="h-4 w-4" /> },
                    { value: "light", icon: <Sun className="h-4 w-4" /> },
                    { value: "dark", icon: <Moon className="h-4 w-4" /> },
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
                    className="capitalize gap-1"
                  >
                    {icon}
                    {value}
                  </Button>
                ))}
              </div>
            </div>
          </SettingsSection>

          {/* Visibility Options */}
          <SettingsSection icon={<Eye className="h-4 w-4" />} title="Show/Hide">
            <ToggleSetting
              label="Ingredients Sidebar"
              description="Show the ingredient checklist"
              checked={localSettings.visibility.showIngredients}
              onCheckedChange={(checked) =>
                updateSetting("visibility", "showIngredients", checked)
              }
            />
            <ToggleSetting
              label="Timer Section"
              description="Show detected and quick timers"
              checked={localSettings.visibility.showTimers}
              onCheckedChange={(checked) =>
                updateSetting("visibility", "showTimers", checked)
              }
            />
            <ToggleSetting
              label="Progress Bar"
              description="Show step progress at top"
              checked={localSettings.visibility.showProgress}
              onCheckedChange={(checked) =>
                updateSetting("visibility", "showProgress", checked)
              }
            />
          </SettingsSection>

          {/* Behavior Options */}
          <SettingsSection icon={<Zap className="h-4 w-4" />} title="Behavior">
            <ToggleSetting
              label="Keep Screen Awake"
              description="Prevent screen from sleeping"
              checked={localSettings.behavior.keepScreenAwake}
              onCheckedChange={(checked) =>
                updateSetting("behavior", "keepScreenAwake", checked)
              }
            />
            <ToggleSetting
              label="Timer Sounds"
              description="Play sound when timer completes"
              checked={localSettings.behavior.timerSounds}
              onCheckedChange={(checked) =>
                updateSetting("behavior", "timerSounds", checked)
              }
            />
            <ToggleSetting
              label="Auto-Advance Steps"
              description="Go to next step when timer ends"
              checked={localSettings.behavior.autoAdvance}
              onCheckedChange={(checked) =>
                updateSetting("behavior", "autoAdvance", checked)
              }
            />
          </SettingsSection>

          {/* Navigation Mode */}
          <SettingsSection
            icon={<Navigation className="h-4 w-4" />}
            title="Navigation"
          >
            <div className="grid grid-cols-2 gap-2">
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
                  className="h-12"
                >
                  {label}
                </Button>
              ))}
            </div>
          </SettingsSection>
        </div>
      </div>
    </>
  );
}

/**
 * Settings section with icon and title
 */
interface SettingsSectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

function SettingsSection({ icon, title, children }: SettingsSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        {icon}
        {title}
      </div>
      <div className="space-y-3 pl-6">{children}</div>
    </div>
  );
}

/**
 * Toggle setting with label and description
 */
interface ToggleSettingProps {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

function ToggleSetting({
  label,
  description,
  checked,
  onCheckedChange,
}: ToggleSettingProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
