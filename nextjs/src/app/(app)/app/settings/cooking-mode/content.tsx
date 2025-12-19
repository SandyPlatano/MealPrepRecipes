"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { SettingsHeader } from "@/components/settings/layout/settings-header";
import { SettingRow, SettingSection } from "@/components/settings/shared/setting-row";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  ChefHat,
  Minus,
  Sparkles,
  Hand,
  Focus,
  Plus,
  Edit,
  Trash2,
  Star,
  Check,
  Volume2,
  Vibrate,
  Clock,
  Eye,
  Settings2,
  Palette,
} from "lucide-react";
import type {
  CookModeSettings,
  CustomCookModePreset,
  CookModeFontSize,
  CookModeTheme,
  IngredientHighlightStyle,
  StepTransition,
  GestureAction,
  AcknowledgmentSound,
  TimerSoundType,
} from "@/types/settings";
import { COOK_MODE_PRESETS } from "@/lib/cook-mode-presets";
import {
  updateCookModeSettings,
  saveCustomCookModePreset,
  updateCustomCookModePreset,
  deleteCustomCookModePreset,
  setDefaultCookModePreset,
} from "@/app/actions/settings";
import { ACCENT_COLOR_PALETTE } from "@/types/user-preferences-v2";

interface CookModeSettingsContentProps {
  initialSettings: CookModeSettings | null;
  initialPresets: CustomCookModePreset[] | null;
}

const FONT_SIZE_OPTIONS: { value: CookModeFontSize; label: string }[] = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
  { value: "extra-large", label: "Extra Large" },
];

const THEME_OPTIONS: { value: CookModeTheme; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

const HIGHLIGHT_STYLE_OPTIONS: { value: IngredientHighlightStyle; label: string }[] = [
  { value: "bold", label: "Bold" },
  { value: "underline", label: "Underline" },
  { value: "background", label: "Background" },
  { value: "badge", label: "Badge" },
];

const TRANSITION_OPTIONS: { value: StepTransition; label: string }[] = [
  { value: "none", label: "None" },
  { value: "fade", label: "Fade" },
  { value: "slide", label: "Slide" },
];

const GESTURE_ACTION_OPTIONS: { value: GestureAction; label: string }[] = [
  { value: "none", label: "None" },
  { value: "repeat", label: "Repeat Step" },
  { value: "timer", label: "Quick Timer" },
  { value: "ingredients", label: "Show Ingredients" },
  { value: "voice", label: "Toggle Voice" },
  { value: "fullscreen", label: "Toggle Fullscreen" },
  { value: "settings", label: "Open Settings" },
  { value: "exit", label: "Exit Cook Mode" },
];

const ACKNOWLEDGMENT_SOUND_OPTIONS: { value: AcknowledgmentSound; label: string }[] = [
  { value: "beep", label: "Beep" },
  { value: "chime", label: "Chime" },
  { value: "ding", label: "Ding" },
  { value: "silent", label: "Silent" },
];

const TIMER_SOUND_OPTIONS: { value: TimerSoundType; label: string }[] = [
  { value: "classic", label: "Classic" },
  { value: "gentle", label: "Gentle" },
  { value: "urgent", label: "Urgent" },
  { value: "melody", label: "Melody" },
];

const PRESET_ICONS = {
  Minus,
  Sparkles,
  Hand,
  Focus,
  Star,
};

export function CookModeSettingsContent({
  initialSettings,
  initialPresets,
}: CookModeSettingsContentProps) {
  const router = useRouter();
  const [settings, setSettings] = useState<CookModeSettings | null>(initialSettings);
  const [customPresets, setCustomPresets] = useState<CustomCookModePreset[]>(initialPresets || []);
  const [isSaving, setIsSaving] = useState(false);

  // Debounced auto-save
  useEffect(() => {
    if (!settings) return;

    const timeoutId = setTimeout(async () => {
      setIsSaving(true);
      const result = await updateCookModeSettings(settings);
      setIsSaving(false);

      if (result.error) {
        toast.error("Failed to save settings");
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [settings]);

  const applyPreset = useCallback((presetSettings: CookModeSettings) => {
    setSettings(presetSettings);
    toast.success("Preset applied");
  }, []);

  const handleCreatePreset = useCallback(async () => {
    if (!settings) return;

    const name = prompt("Enter preset name:");
    if (!name) return;

    const result = await saveCustomCookModePreset({
      name,
      icon: "Star",
      settings,
    });
    if (result.error) {
      toast.error("Failed to create preset");
    } else if (result.data) {
      setCustomPresets((prev) => [...prev, result.data!]);
      toast.success("Preset created");
    }
  }, [settings]);

  const handleDeletePreset = useCallback(async (presetId: string) => {
    const result = await deleteCustomCookModePreset(presetId);
    if (result.error) {
      toast.error("Failed to delete preset");
    } else {
      setCustomPresets((prev) => prev.filter((p) => p.id !== presetId));
      toast.success("Preset deleted");
    }
  }, []);

  const handleSetDefault = useCallback(async (presetId: string | null) => {
    const result = await setDefaultCookModePreset(presetId);
    if (result.error) {
      toast.error("Failed to set default preset");
    } else {
      router.refresh();
      toast.success("Default preset updated");
    }
  }, [router]);

  const updateDisplaySettings = useCallback(
    (updates: Partial<CookModeSettings["display"]>) => {
      setSettings((prev) =>
        prev ? { ...prev, display: { ...prev.display, ...updates } } : null
      );
    },
    []
  );

  const updateVoiceSettings = useCallback(
    (updates: Partial<CookModeSettings["voice"]>) => {
      setSettings((prev) =>
        prev ? { ...prev, voice: { ...prev.voice, ...updates } } : null
      );
    },
    []
  );

  const updateGestureSettings = useCallback(
    (updates: Partial<CookModeSettings["gestures"]>) => {
      setSettings((prev) =>
        prev ? { ...prev, gestures: { ...prev.gestures, ...updates } } : null
      );
    },
    []
  );

  const updateTimerSettings = useCallback(
    (updates: Partial<CookModeSettings["timers"]>) => {
      setSettings((prev) =>
        prev ? { ...prev, timers: { ...prev.timers, ...updates } } : null
      );
    },
    []
  );

  const updateAudioSettings = useCallback(
    (updates: Partial<CookModeSettings["audio"]>) => {
      setSettings((prev) =>
        prev ? { ...prev, audio: { ...prev.audio, ...updates } } : null
      );
    },
    []
  );

  const updateBehaviorSettings = useCallback(
    (updates: Partial<CookModeSettings["behavior"]>) => {
      setSettings((prev) =>
        prev ? { ...prev, behavior: { ...prev.behavior, ...updates } } : null
      );
    },
    []
  );

  if (!settings) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <SettingsHeader
        title="Cooking Mode"
        description="Customize your hands-free cooking experience"
      />

      {/* Try Now Button */}
      <Card className="group hover:border-primary/50 transition-colors">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ChefHat className="h-5 w-5" />
                Ready to Cook?
              </CardTitle>
              <CardDescription>
                Test your settings in cooking mode
              </CardDescription>
            </div>
            <Button onClick={() => router.push("/app/recipes")}>
              <ChefHat className="h-4 w-4 mr-2" />
              Try Now
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Presets Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-mono font-semibold">Presets</h2>
            <p className="text-sm text-muted-foreground">
              Quick configurations for different cooking styles
            </p>
          </div>
          <Button onClick={handleCreatePreset} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Preset
          </Button>
        </div>

        {/* Built-in Presets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {COOK_MODE_PRESETS.map((preset) => {
            const Icon = PRESET_ICONS[preset.icon as keyof typeof PRESET_ICONS];
            return (
              <Card key={preset.key} className="group hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {Icon && <Icon className="h-4 w-4" />}
                      <CardTitle className="text-base">{preset.name}</CardTitle>
                    </div>
                  </div>
                  <CardDescription className="text-xs">
                    {preset.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => applyPreset(preset.settings)}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Apply
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Custom Presets */}
        {customPresets.length > 0 && (
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-medium text-muted-foreground">Your Presets</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {customPresets.map((preset) => {
                const Icon = PRESET_ICONS[preset.icon as keyof typeof PRESET_ICONS] || Star;
                return (
                  <Card key={preset.id} className="group hover:border-primary/50 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <CardTitle className="text-base">{preset.name}</CardTitle>
                        </div>
                        {preset.isDefault && (
                          <Badge variant="secondary" className="text-xs">
                            Default
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => applyPreset(preset.settings)}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          Apply
                        </Button>
                        <Button
                          onClick={() => handleDeletePreset(preset.id)}
                          variant="ghost"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {!preset.isDefault && (
                        <Button
                          onClick={() => handleSetDefault(preset.id)}
                          variant="ghost"
                          size="sm"
                          className="w-full text-xs"
                        >
                          Set as Default
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="display" className="flex flex-col gap-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="display">
            <Eye className="h-4 w-4 mr-2" />
            Display
          </TabsTrigger>
          <TabsTrigger value="voice">
            <Volume2 className="h-4 w-4 mr-2" />
            Voice
          </TabsTrigger>
          <TabsTrigger value="gestures">
            <Hand className="h-4 w-4 mr-2" />
            Gestures
          </TabsTrigger>
          <TabsTrigger value="timers">
            <Clock className="h-4 w-4 mr-2" />
            Timers
          </TabsTrigger>
          <TabsTrigger value="behavior">
            <Settings2 className="h-4 w-4 mr-2" />
            Behavior
          </TabsTrigger>
        </TabsList>

        {/* Display Tab */}
        <TabsContent value="display" className="flex flex-col gap-6">
          <SettingSection title="Text & Theme">
            <SettingRow
              id="setting-font-size"
              label="Font Size"
              description="How large the text appears"
            >
              <Select
                value={settings.display.fontSize}
                onValueChange={(value: CookModeFontSize) =>
                  updateDisplaySettings({ fontSize: value })
                }
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_SIZE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SettingRow>

            <SettingRow
              id="setting-theme-override"
              label="Theme"
              description="Override app theme in cooking mode"
            >
              <Select
                value={settings.display.themeOverride}
                onValueChange={(value: CookModeTheme) =>
                  updateDisplaySettings({ themeOverride: value })
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {THEME_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SettingRow>

            <SettingRow
              id="setting-high-contrast"
              label="High Contrast"
              description="Enhanced readability with stronger contrast"
            >
              <Switch
                checked={settings.display.highContrast}
                onCheckedChange={(checked) =>
                  updateDisplaySettings({ highContrast: checked })
                }
              />
            </SettingRow>
          </SettingSection>

          <SettingSection title="Visual Styling">
            <SettingRow
              id="setting-accent-color"
              label="Accent Color"
              description="Color used for highlights and buttons"
            >
              <div className="flex flex-wrap gap-2 max-w-xs">
                {ACCENT_COLOR_PALETTE.map(({ key, color }) => (
                  <button
                    key={key}
                    onClick={() => updateDisplaySettings({ accentColor: color })}
                    className={cn(
                      "w-8 h-8 rounded-full transition-all",
                      settings.display.accentColor === color
                        ? "ring-2 ring-offset-2 ring-offset-background ring-primary scale-110"
                        : "hover:scale-105"
                    )}
                    style={{ backgroundColor: color }}
                    title={key}
                  />
                ))}
              </div>
            </SettingRow>

            <SettingRow
              id="setting-ingredient-highlight"
              label="Ingredient Highlight Style"
              description="How ingredients are highlighted in steps"
            >
              <Select
                value={settings.display.ingredientHighlightStyle}
                onValueChange={(value: IngredientHighlightStyle) =>
                  updateDisplaySettings({ ingredientHighlightStyle: value })
                }
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HIGHLIGHT_STYLE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SettingRow>

            <SettingRow
              id="setting-step-transition"
              label="Step Transition"
              description="Animation when moving between steps"
            >
              <Select
                value={settings.display.stepTransition}
                onValueChange={(value: StepTransition) =>
                  updateDisplaySettings({ stepTransition: value })
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRANSITION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SettingRow>

            <SettingRow
              id="setting-show-step-numbers"
              label="Show Step Numbers"
              description="Display step numbers (1 of 10)"
            >
              <Switch
                checked={settings.display.showStepNumbers}
                onCheckedChange={(checked) =>
                  updateDisplaySettings({ showStepNumbers: checked })
                }
              />
            </SettingRow>

            <SettingRow
              id="setting-show-estimated-time"
              label="Show Estimated Time"
              description="Display time remaining for recipe"
            >
              <Switch
                checked={settings.display.showEstimatedTime}
                onCheckedChange={(checked) =>
                  updateDisplaySettings({ showEstimatedTime: checked })
                }
              />
            </SettingRow>
          </SettingSection>
        </TabsContent>

        {/* Voice & Audio Tab */}
        <TabsContent value="voice" className="flex flex-col gap-6">
          <SettingSection title="Voice Control">
            <SettingRow
              id="setting-voice-enabled"
              label="Enable Voice Commands"
              description="Control cooking mode with your voice"
            >
              <Switch
                checked={settings.voice.enabled}
                onCheckedChange={(checked) =>
                  updateVoiceSettings({ enabled: checked })
                }
              />
            </SettingRow>

            {settings.voice.enabled && (
              <>
                <SettingRow
                  id="setting-auto-read-steps"
                  label="Auto-Read Steps"
                  description="Automatically read each step aloud"
                >
                  <Switch
                    checked={settings.voice.autoReadSteps}
                    onCheckedChange={(checked) =>
                      updateVoiceSettings({ autoReadSteps: checked })
                    }
                  />
                </SettingRow>

                <SettingRow
                  id="setting-readout-speed"
                  label="Readout Speed"
                  description="How fast voice reads instructions"
                >
                  <Select
                    value={settings.voice.readoutSpeed}
                    onValueChange={(value: "slow" | "normal" | "fast") =>
                      updateVoiceSettings({ readoutSpeed: value })
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slow">Slow</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="fast">Fast</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingRow>

                <SettingRow
                  id="setting-confirm-commands"
                  label="Confirm Commands"
                  description="Show confirmation for voice commands"
                >
                  <Switch
                    checked={settings.voice.confirmCommands}
                    onCheckedChange={(checked) =>
                      updateVoiceSettings({ confirmCommands: checked })
                    }
                  />
                </SettingRow>
              </>
            )}
          </SettingSection>

          <SettingSection title="Audio Feedback">
            <SettingRow
              id="setting-acknowledgment-sound"
              label="Command Acknowledgment"
              description="Sound when voice command is recognized"
            >
              <Select
                value={settings.audio.acknowledgmentSound}
                onValueChange={(value: AcknowledgmentSound) =>
                  updateAudioSettings({ acknowledgmentSound: value })
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACKNOWLEDGMENT_SOUND_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SettingRow>

            <SettingRow
              id="setting-tts-volume"
              label="Voice Volume"
              description="Volume for text-to-speech"
            >
              <div className="w-48">
                <Slider
                  value={[settings.audio.ttsVolume * 100]}
                  onValueChange={([value]) =>
                    updateAudioSettings({ ttsVolume: value / 100 })
                  }
                  max={100}
                  step={1}
                />
              </div>
            </SettingRow>
          </SettingSection>
        </TabsContent>

        {/* Gestures Tab */}
        <TabsContent value="gestures" className="flex flex-col gap-6">
          <SettingSection title="Touch Gestures">
            <SettingRow
              id="setting-swipe-enabled"
              label="Swipe Navigation"
              description="Swipe left/right to move between steps"
            >
              <Switch
                checked={settings.gestures.swipeEnabled}
                onCheckedChange={(checked) =>
                  updateGestureSettings({ swipeEnabled: checked })
                }
              />
            </SettingRow>

            <SettingRow
              id="setting-tap-to-advance"
              label="Tap to Advance"
              description="Tap anywhere to go to next step"
            >
              <Switch
                checked={settings.gestures.tapToAdvance}
                onCheckedChange={(checked) =>
                  updateGestureSettings({ tapToAdvance: checked })
                }
              />
            </SettingRow>

            <SettingRow
              id="setting-haptic-feedback"
              label="Haptic Feedback"
              description="Vibration when performing actions"
            >
              <Switch
                checked={settings.gestures.hapticFeedback}
                onCheckedChange={(checked) =>
                  updateGestureSettings({ hapticFeedback: checked })
                }
              />
            </SettingRow>
          </SettingSection>

          <SettingSection title="Gesture Actions">
            <SettingRow
              id="setting-double-tap-action"
              label="Double-Tap Action"
              description="What happens when you double-tap"
            >
              <Select
                value={settings.gestures.doubleTapAction}
                onValueChange={(value: GestureAction) =>
                  updateGestureSettings({ doubleTapAction: value })
                }
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GESTURE_ACTION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SettingRow>

            <SettingRow
              id="setting-long-press-action"
              label="Long-Press Action"
              description="What happens when you long-press"
            >
              <Select
                value={settings.gestures.longPressAction}
                onValueChange={(value: GestureAction) =>
                  updateGestureSettings({ longPressAction: value })
                }
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GESTURE_ACTION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SettingRow>

            <SettingRow
              id="setting-swipe-up-action"
              label="Swipe Up Action"
              description="What happens when you swipe up"
            >
              <Select
                value={settings.gestures.swipeUpAction}
                onValueChange={(value: GestureAction) =>
                  updateGestureSettings({ swipeUpAction: value })
                }
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GESTURE_ACTION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SettingRow>

            <SettingRow
              id="setting-swipe-down-action"
              label="Swipe Down Action"
              description="What happens when you swipe down"
            >
              <Select
                value={settings.gestures.swipeDownAction}
                onValueChange={(value: GestureAction) =>
                  updateGestureSettings({ swipeDownAction: value })
                }
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GESTURE_ACTION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SettingRow>
          </SettingSection>
        </TabsContent>

        {/* Timers Tab */}
        <TabsContent value="timers" className="flex flex-col gap-6">
          <SettingSection title="Timer Settings">
            <SettingRow
              id="setting-quick-timer-presets"
              label="Quick Timer Presets"
              description="One-tap timer durations (in minutes)"
            >
              <div className="flex flex-wrap gap-2">
                {[1, 3, 5, 10, 15, 20, 30].map((min) => {
                  const isActive = settings.timers.quickTimerPresets.includes(min);
                  return (
                    <Button
                      key={min}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const newPresets = isActive
                          ? settings.timers.quickTimerPresets.filter((p) => p !== min)
                          : [...settings.timers.quickTimerPresets, min].sort((a, b) => a - b);
                        updateTimerSettings({ quickTimerPresets: newPresets });
                      }}
                    >
                      {min}m
                    </Button>
                  );
                })}
              </div>
            </SettingRow>

            <SettingRow
              id="setting-auto-detect-timers"
              label="Auto-Detect Timers"
              description="Automatically detect times in recipe steps"
            >
              <Switch
                checked={settings.timers.autoDetectTimers}
                onCheckedChange={(checked) =>
                  updateTimerSettings({ autoDetectTimers: checked })
                }
              />
            </SettingRow>

            <SettingRow
              id="setting-show-timer-in-title"
              label="Show Timer in Title"
              description="Display active timer in page title"
            >
              <Switch
                checked={settings.timers.showTimerInTitle}
                onCheckedChange={(checked) =>
                  updateTimerSettings({ showTimerInTitle: checked })
                }
              />
            </SettingRow>

            <SettingRow
              id="setting-vibration-on-complete"
              label="Vibration on Complete"
              description="Vibrate when timer finishes"
            >
              <Switch
                checked={settings.timers.vibrationOnComplete}
                onCheckedChange={(checked) =>
                  updateTimerSettings({ vibrationOnComplete: checked })
                }
              />
            </SettingRow>

            <SettingRow
              id="setting-repeat-timer-alert"
              label="Repeat Timer Alert"
              description="Keep alerting until dismissed"
            >
              <Switch
                checked={settings.timers.repeatTimerAlert}
                onCheckedChange={(checked) =>
                  updateTimerSettings({ repeatTimerAlert: checked })
                }
              />
            </SettingRow>

            <SettingRow
              id="setting-timer-sound"
              label="Timer Sound"
              description="Sound to play when timer completes"
            >
              <Select
                value={settings.audio.timerSound}
                onValueChange={(value: TimerSoundType) =>
                  updateAudioSettings({ timerSound: value })
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMER_SOUND_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SettingRow>
          </SettingSection>
        </TabsContent>

        {/* Behavior Tab */}
        <TabsContent value="behavior" className="flex flex-col gap-6">
          <SettingSection title="General Behavior">
            <SettingRow
              id="setting-keep-screen-awake"
              label="Keep Screen Awake"
              description="Prevent screen from turning off while cooking"
            >
              <Switch
                checked={settings.behavior.keepScreenAwake}
                onCheckedChange={(checked) =>
                  updateBehaviorSettings({ keepScreenAwake: checked })
                }
              />
            </SettingRow>

            <SettingRow
              id="setting-timer-sounds"
              label="Timer Sounds"
              description="Play sounds when timers complete"
            >
              <Switch
                checked={settings.behavior.timerSounds}
                onCheckedChange={(checked) =>
                  updateBehaviorSettings({ timerSounds: checked })
                }
              />
            </SettingRow>

            <SettingRow
              id="setting-auto-advance"
              label="Auto-Advance Steps"
              description="Automatically move to next step after timer"
            >
              <Switch
                checked={settings.behavior.autoAdvance}
                onCheckedChange={(checked) =>
                  updateBehaviorSettings({ autoAdvance: checked })
                }
              />
            </SettingRow>
          </SettingSection>
        </TabsContent>
      </Tabs>

      {/* Save indicator */}
      {isSaving && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-md shadow-lg">
          Saving...
        </div>
      )}
    </div>
  );
}
