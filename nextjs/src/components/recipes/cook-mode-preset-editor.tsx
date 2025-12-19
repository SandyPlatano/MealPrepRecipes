"use client";

/**
 * Cook Mode Preset Editor
 * Modal dialog for creating and editing custom cooking mode presets
 * Features:
 * - Name and icon selection
 * - Tabbed settings organization (Display, Voice, Gestures, Timers, Behavior, Visibility)
 * - Live preview of settings
 * - Save/update preset functionality
 * - Delete with confirmation
 */

import { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChefHat,
  Utensils,
  Timer,
  Mic,
  Hand,
  Eye,
  Sparkles,
  Zap,
  Focus,
  Moon,
  Sun,
  Star,
  Heart,
  Flame,
  Leaf,
  Coffee,
  Type,
  Monitor,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  CookModeSettings,
  CustomCookModePreset,
  CookModeFontSize,
  CookModeTheme,
  IngredientHighlightStyle,
  StepTransition,
  GestureAction,
} from "@/types/settings";
import { DEFAULT_COOK_MODE_SETTINGS } from "@/types/settings";

interface CookModePresetEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preset?: CustomCookModePreset;
  currentSettings: CookModeSettings;
  onSave: (preset: Omit<CustomCookModePreset, "id" | "createdAt">) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

// Icon options for preset selection
const PRESET_ICONS = [
  { name: "ChefHat", icon: ChefHat },
  { name: "Utensils", icon: Utensils },
  { name: "Timer", icon: Timer },
  { name: "Mic", icon: Mic },
  { name: "Hand", icon: Hand },
  { name: "Eye", icon: Eye },
  { name: "Sparkles", icon: Sparkles },
  { name: "Zap", icon: Zap },
  { name: "Focus", icon: Focus },
  { name: "Moon", icon: Moon },
  { name: "Sun", icon: Sun },
  { name: "Star", icon: Star },
  { name: "Heart", icon: Heart },
  { name: "Flame", icon: Flame },
  { name: "Leaf", icon: Leaf },
  { name: "Coffee", icon: Coffee },
] as const;

export function CookModePresetEditor({
  open,
  onOpenChange,
  preset,
  currentSettings,
  onSave,
  onDelete,
}: CookModePresetEditorProps) {
  // State for preset configuration
  const [presetName, setPresetName] = useState("");
  const [presetIcon, setPresetIcon] = useState("ChefHat");
  const [settings, setSettings] = useState<CookModeSettings>(DEFAULT_COOK_MODE_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Initialize state when preset changes
  useEffect(() => {
    if (preset) {
      setPresetName(preset.name);
      setPresetIcon(preset.icon);
      setSettings(preset.settings);
    } else {
      setPresetName("");
      setPresetIcon("ChefHat");
      setSettings(currentSettings);
    }
  }, [preset, currentSettings]);

  // Update a setting
  const updateSetting = useCallback(
    <K extends keyof CookModeSettings>(
      category: K,
      key: keyof CookModeSettings[K],
      value: CookModeSettings[K][typeof key]
    ) => {
      setSettings((prev) => ({
        ...prev,
        [category]: {
          ...prev[category],
          [key]: value,
        },
      }));
    },
    []
  );

  // Handle save
  const handleSave = useCallback(async () => {
    if (!presetName.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        name: presetName.trim(),
        icon: presetIcon,
        settings,
      });
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  }, [presetName, presetIcon, settings, onSave, onOpenChange]);

  // Handle delete
  const handleDelete = useCallback(async () => {
    if (!preset || !onDelete) return;

    setIsSaving(true);
    try {
      await onDelete(preset.id);
      onOpenChange(false);
    } finally {
      setIsSaving(false);
      setShowDeleteDialog(false);
    }
  }, [preset, onDelete, onOpenChange]);

  // Copy current cook mode settings
  const handleCopyCurrentSettings = useCallback(() => {
    setSettings(currentSettings);
  }, [currentSettings]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {preset ? "Edit Preset" : "Create Preset"}
            </DialogTitle>
            <DialogDescription>
              Customize your cooking mode experience with a custom preset
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col py-4">
            {/* Preset Name */}
            <div className="flex flex-col">
              <Label htmlFor="preset-name">Preset Name</Label>
              <Input
                id="preset-name"
                placeholder="My Custom Preset"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
              />
            </div>

            {/* Icon Picker */}
            <div className="flex flex-col">
              <Label>Preset Icon</Label>
              <div className="grid grid-cols-8 gap-2">
                {PRESET_ICONS.map(({ name, icon: Icon }) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setPresetIcon(name)}
                    className={cn(
                      "p-2 rounded-md border-2 transition-all hover:bg-accent",
                      presetIcon === name
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    )}
                  >
                    <Icon className="h-5 w-5 mx-auto" />
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Action */}
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-sm text-muted-foreground">
                Start with current cook mode settings
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyCurrentSettings}
              >
                Copy Current
              </Button>
            </div>

            {/* Settings Tabs */}
            <Tabs defaultValue="display" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="display">Display</TabsTrigger>
                <TabsTrigger value="voice">Voice</TabsTrigger>
                <TabsTrigger value="gestures">Gestures</TabsTrigger>
                <TabsTrigger value="timers">Timers</TabsTrigger>
                <TabsTrigger value="behavior">Behavior</TabsTrigger>
                <TabsTrigger value="visibility">Visibility</TabsTrigger>
              </TabsList>

              {/* Display Tab */}
              <TabsContent value="display" className="flex flex-col">
                {/* Font Size */}
                <div className="flex flex-col">
                  <Label className="flex items-center gap-1">
                    <Type className="h-3 w-3" />
                    Font Size
                  </Label>
                  <div className="grid grid-cols-4 gap-2">
                    {(["small", "medium", "large", "extra-large"] as CookModeFontSize[]).map(
                      (size) => (
                        <Button
                          key={size}
                          variant={settings.display.fontSize === size ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateSetting("display", "fontSize", size)}
                          className="capitalize"
                        >
                          {size === "extra-large" ? "XL" : size.charAt(0).toUpperCase()}
                        </Button>
                      )
                    )}
                  </div>
                </div>

                {/* Theme Override */}
                <div className="flex flex-col">
                  <Label>Theme</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { value: "system", icon: Monitor, label: "System" },
                        { value: "light", icon: Sun, label: "Light" },
                        { value: "dark", icon: Moon, label: "Dark" },
                      ] as { value: CookModeTheme; icon: typeof Monitor; label: string }[]
                    ).map(({ value, icon: Icon, label }) => (
                      <Button
                        key={value}
                        variant={settings.display.themeOverride === value ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateSetting("display", "themeOverride", value)}
                        className="flex items-center gap-1"
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Accent Color */}
                <div className="flex flex-col">
                  <Label htmlFor="accent-color">Accent Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accent-color"
                      type="color"
                      value={settings.display.accentColor}
                      onChange={(e) => updateSetting("display", "accentColor", e.target.value)}
                      className="w-16 h-9 p-1 cursor-pointer"
                    />
                    <Input
                      value={settings.display.accentColor}
                      onChange={(e) => updateSetting("display", "accentColor", e.target.value)}
                      placeholder="#f97316"
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Highlight Style */}
                <div className="flex flex-col">
                  <Label htmlFor="highlight-style">Ingredient Highlight Style</Label>
                  <Select
                    value={settings.display.ingredientHighlightStyle}
                    onValueChange={(value: IngredientHighlightStyle) =>
                      updateSetting("display", "ingredientHighlightStyle", value)
                    }
                  >
                    <SelectTrigger id="highlight-style">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bold">Bold</SelectItem>
                      <SelectItem value="underline">Underline</SelectItem>
                      <SelectItem value="background">Background</SelectItem>
                      <SelectItem value="badge">Badge</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Transition */}
                <div className="flex flex-col">
                  <Label htmlFor="transition">Step Transition</Label>
                  <Select
                    value={settings.display.stepTransition}
                    onValueChange={(value: StepTransition) =>
                      updateSetting("display", "stepTransition", value)
                    }
                  >
                    <SelectTrigger id="transition">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="fade">Fade</SelectItem>
                      <SelectItem value="slide">Slide</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Display Toggles */}
                <div className="flex flex-col">
                  <SettingToggle
                    label="High Contrast"
                    checked={settings.display.highContrast}
                    onCheckedChange={(checked) => updateSetting("display", "highContrast", checked)}
                  />
                  <SettingToggle
                    label="Show Step Numbers"
                    checked={settings.display.showStepNumbers}
                    onCheckedChange={(checked) => updateSetting("display", "showStepNumbers", checked)}
                  />
                  <SettingToggle
                    label="Show Estimated Time"
                    checked={settings.display.showEstimatedTime}
                    onCheckedChange={(checked) => updateSetting("display", "showEstimatedTime", checked)}
                  />
                </div>
              </TabsContent>

              {/* Voice Tab */}
              <TabsContent value="voice" className="flex flex-col">
                <SettingToggle
                  label="Voice Commands Enabled"
                  checked={settings.voice.enabled}
                  onCheckedChange={(checked) => updateSetting("voice", "enabled", checked)}
                />

                {/* Wake Words */}
                <div className="flex flex-col">
                  <Label htmlFor="wake-words">Wake Words (comma-separated)</Label>
                  <Input
                    id="wake-words"
                    value={settings.voice.wakeWords.join(", ")}
                    onChange={(e) =>
                      updateSetting(
                        "voice",
                        "wakeWords",
                        e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                      )
                    }
                    placeholder="hey chef, okay chef"
                  />
                </div>

                {/* Command Timeout */}
                <div className="flex flex-col">
                  <Label htmlFor="command-timeout">Command Timeout (ms)</Label>
                  <Input
                    id="command-timeout"
                    type="number"
                    value={settings.voice.commandTimeout}
                    onChange={(e) =>
                      updateSetting("voice", "commandTimeout", parseInt(e.target.value) || 3000)
                    }
                    min={1000}
                    max={10000}
                    step={500}
                  />
                </div>

                {/* Voice Toggles */}
                <div className="flex flex-col">
                  <SettingToggle
                    label="Confirm Commands"
                    checked={settings.voice.confirmCommands}
                    onCheckedChange={(checked) => updateSetting("voice", "confirmCommands", checked)}
                  />
                  <SettingToggle
                    label="Auto Read Steps"
                    checked={settings.voice.autoReadSteps}
                    onCheckedChange={(checked) => updateSetting("voice", "autoReadSteps", checked)}
                  />
                </div>
              </TabsContent>

              {/* Gestures Tab */}
              <TabsContent value="gestures" className="flex flex-col">
                <SettingToggle
                  label="Swipe Enabled"
                  checked={settings.gestures.swipeEnabled}
                  onCheckedChange={(checked) => updateSetting("gestures", "swipeEnabled", checked)}
                />
                <SettingToggle
                  label="Tap to Advance"
                  checked={settings.gestures.tapToAdvance}
                  onCheckedChange={(checked) => updateSetting("gestures", "tapToAdvance", checked)}
                />
                <SettingToggle
                  label="Haptic Feedback"
                  checked={settings.gestures.hapticFeedback}
                  onCheckedChange={(checked) => updateSetting("gestures", "hapticFeedback", checked)}
                />

                {/* Gesture Actions */}
                <GestureActionSelect
                  label="Double Tap Action"
                  value={settings.gestures.doubleTapAction}
                  onChange={(value) => updateSetting("gestures", "doubleTapAction", value)}
                />
                <GestureActionSelect
                  label="Long Press Action"
                  value={settings.gestures.longPressAction}
                  onChange={(value) => updateSetting("gestures", "longPressAction", value)}
                />
                <GestureActionSelect
                  label="Swipe Up Action"
                  value={settings.gestures.swipeUpAction}
                  onChange={(value) => updateSetting("gestures", "swipeUpAction", value)}
                />
                <GestureActionSelect
                  label="Swipe Down Action"
                  value={settings.gestures.swipeDownAction}
                  onChange={(value) => updateSetting("gestures", "swipeDownAction", value)}
                />
              </TabsContent>

              {/* Timers Tab */}
              <TabsContent value="timers" className="flex flex-col">
                {/* Quick Timer Presets */}
                <div className="flex flex-col">
                  <Label htmlFor="timer-presets">Quick Timer Presets (comma-separated minutes)</Label>
                  <Input
                    id="timer-presets"
                    value={settings.timers.quickTimerPresets.join(", ")}
                    onChange={(e) =>
                      updateSetting(
                        "timers",
                        "quickTimerPresets",
                        e.target.value
                          .split(",")
                          .map((s) => parseInt(s.trim()))
                          .filter((n) => !isNaN(n))
                      )
                    }
                    placeholder="1, 3, 5, 10, 15"
                  />
                </div>

                {/* Timer Toggles */}
                <div className="flex flex-col">
                  <SettingToggle
                    label="Auto-Detect Timers"
                    checked={settings.timers.autoDetectTimers}
                    onCheckedChange={(checked) => updateSetting("timers", "autoDetectTimers", checked)}
                  />
                  <SettingToggle
                    label="Show Timer in Title"
                    checked={settings.timers.showTimerInTitle}
                    onCheckedChange={(checked) => updateSetting("timers", "showTimerInTitle", checked)}
                  />
                  <SettingToggle
                    label="Vibration on Complete"
                    checked={settings.timers.vibrationOnComplete}
                    onCheckedChange={(checked) => updateSetting("timers", "vibrationOnComplete", checked)}
                  />
                  <SettingToggle
                    label="Repeat Timer Alert"
                    checked={settings.timers.repeatTimerAlert}
                    onCheckedChange={(checked) => updateSetting("timers", "repeatTimerAlert", checked)}
                  />
                </div>
              </TabsContent>

              {/* Behavior Tab */}
              <TabsContent value="behavior" className="flex flex-col">
                <SettingToggle
                  label="Keep Screen Awake"
                  checked={settings.behavior.keepScreenAwake}
                  onCheckedChange={(checked) => updateSetting("behavior", "keepScreenAwake", checked)}
                />
                <SettingToggle
                  label="Timer Sounds"
                  checked={settings.behavior.timerSounds}
                  onCheckedChange={(checked) => updateSetting("behavior", "timerSounds", checked)}
                />
                <SettingToggle
                  label="Auto-Advance"
                  checked={settings.behavior.autoAdvance}
                  onCheckedChange={(checked) => updateSetting("behavior", "autoAdvance", checked)}
                />
              </TabsContent>

              {/* Visibility Tab */}
              <TabsContent value="visibility" className="flex flex-col">
                <SettingToggle
                  label="Show Ingredients"
                  checked={settings.visibility.showIngredients}
                  onCheckedChange={(checked) => updateSetting("visibility", "showIngredients", checked)}
                />
                <SettingToggle
                  label="Show Timers"
                  checked={settings.visibility.showTimers}
                  onCheckedChange={(checked) => updateSetting("visibility", "showTimers", checked)}
                />
                <SettingToggle
                  label="Show Progress"
                  checked={settings.visibility.showProgress}
                  onCheckedChange={(checked) => updateSetting("visibility", "showProgress", checked)}
                />
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter>
            <div className="flex items-center justify-between w-full">
              <div>
                {preset && onDelete && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowDeleteDialog(true)}
                    disabled={isSaving}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!presetName.trim() || isSaving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Preset"}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Preset?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{preset?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isSaving}>
              {isSaving ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/**
 * Compact toggle setting - label and switch inline
 */
interface SettingToggleProps {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

function SettingToggle({ label, checked, onCheckedChange }: SettingToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <Label className="cursor-pointer">{label}</Label>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

/**
 * Gesture action select dropdown
 */
interface GestureActionSelectProps {
  label: string;
  value: GestureAction;
  onChange: (value: GestureAction) => void;
}

function GestureActionSelect({ label, value, onChange }: GestureActionSelectProps) {
  return (
    <div className="flex flex-col">
      <Label htmlFor={`gesture-${label.toLowerCase().replace(/\s+/g, "-")}`}>{label}</Label>
      <Select value={value} onValueChange={(v: GestureAction) => onChange(v)}>
        <SelectTrigger id={`gesture-${label.toLowerCase().replace(/\s+/g, "-")}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">None</SelectItem>
          <SelectItem value="repeat">Repeat Step</SelectItem>
          <SelectItem value="timer">Quick Timer</SelectItem>
          <SelectItem value="ingredients">Show Ingredients</SelectItem>
          <SelectItem value="voice">Toggle Voice</SelectItem>
          <SelectItem value="fullscreen">Toggle Fullscreen</SelectItem>
          <SelectItem value="settings">Open Settings</SelectItem>
          <SelectItem value="exit">Exit Cook Mode</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
