"use client";

import { useSettings } from "@/contexts/settings-context";
import { SettingsHeader } from "@/components/settings/layout/settings-header";
import { SettingRow, SettingSection } from "@/components/settings/shared/setting-row";
import { AdvancedToggle } from "@/components/settings/shared/advanced-toggle";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SOUND_OPTIONS, type SoundPreset } from "@/types/user-preferences-v2";
import { resetAllHints } from "@/app/actions/settings";
import { playSound } from "@/lib/sounds";
import { toast } from "sonner";
import { Volume2, RotateCcw, Play } from "lucide-react";

export default function ShortcutsSettingsPage() {
  const { preferencesV2, updateSoundPrefs, updateKeyboardPrefs } = useSettings();
  const sounds = preferencesV2.sounds;
  const keyboard = preferencesV2.keyboard;

  const handleResetHints = async () => {
    const result = await resetAllHints();
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("All hints have been reset");
    }
  };

  const handlePreviewSound = (sound: SoundPreset) => {
    if (sound === "none") {
      toast.info("This sound is silent");
      return;
    }
    playSound(sound, sounds.volume);
  };

  return (
    <div className="space-y-8">
      <SettingsHeader
        title="Sounds & Shortcuts"
        description="Audio feedback and keyboard navigation"
      />

      {/* Sounds */}
      <SettingSection title="Sound Effects">
        <SettingRow
          id="setting-sounds-enabled"
          label="Enable Sounds"
          description="Play sound effects for actions"
        >
          <Switch
            id="setting-sounds-enabled-control"
            checked={sounds.enabled}
            onCheckedChange={(checked) => updateSoundPrefs({ enabled: checked })}
          />
        </SettingRow>

        {sounds.enabled && (
          <>
            <SettingRow
              id="setting-volume"
              label="Volume"
              description="Sound effect volume (0-100)"
            >
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={5}
                  value={sounds.volume}
                  onChange={(e) => updateSoundPrefs({ volume: Number(e.target.value) })}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </SettingRow>

            <SettingRow
              id="setting-timer-sound"
              label="Timer Sound"
              description="Sound when cooking timer completes"
            >
              <div className="flex items-center gap-2">
                <Select
                  value={sounds.timerComplete}
                  onValueChange={(value: SoundPreset) =>
                    updateSoundPrefs({ timerComplete: value })
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SOUND_OPTIONS.filter(
                      (s) => s.category === "timer" || s.category === "all"
                    ).map((opt) => (
                      <SelectItem key={opt.id} value={opt.id}>
                        {opt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => handlePreviewSound(sounds.timerComplete)}
                  title="Preview sound"
                >
                  <Play className="h-4 w-4" />
                </Button>
              </div>
            </SettingRow>

            <SettingRow
              id="setting-notification-sound"
              label="Notification Sound"
              description="Sound for app notifications"
            >
              <div className="flex items-center gap-2">
                <Select
                  value={sounds.notification}
                  onValueChange={(value: SoundPreset) =>
                    updateSoundPrefs({ notification: value })
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SOUND_OPTIONS.filter(
                      (s) => s.category === "notification" || s.category === "all"
                    ).map((opt) => (
                      <SelectItem key={opt.id} value={opt.id}>
                        {opt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => handlePreviewSound(sounds.notification)}
                  title="Preview sound"
                >
                  <Play className="h-4 w-4" />
                </Button>
              </div>
            </SettingRow>

            <SettingRow
              id="setting-achievement-sound"
              label="Achievement Sound"
              description="Sound for achievements"
            >
              <div className="flex items-center gap-2">
                <Select
                  value={sounds.achievement}
                  onValueChange={(value: SoundPreset) =>
                    updateSoundPrefs({ achievement: value })
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SOUND_OPTIONS.filter(
                      (s) => s.category === "achievement" || s.category === "all"
                    ).map((opt) => (
                      <SelectItem key={opt.id} value={opt.id}>
                        {opt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => handlePreviewSound(sounds.achievement)}
                  title="Preview sound"
                >
                  <Play className="h-4 w-4" />
                </Button>
              </div>
            </SettingRow>
          </>
        )}
      </SettingSection>

      {/* Help */}
      <SettingSection title="Help & Hints">
        <SettingRow
          id="setting-reset-hints"
          label="Reset All Hints"
          description="Show all dismissed help hints again"
        >
          <Button variant="outline" onClick={handleResetHints}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Hints
          </Button>
        </SettingRow>
      </SettingSection>

      {/* Advanced - Keyboard */}
      <AdvancedToggle>
        <SettingSection title="Keyboard Shortcuts">
          <SettingRow
            id="setting-keyboard-shortcuts"
            label="Enable Keyboard Shortcuts"
            description="Use keyboard shortcuts for navigation"
          >
            <Switch
              id="setting-keyboard-shortcuts-control"
              checked={keyboard.enabled}
              onCheckedChange={(checked) =>
                updateKeyboardPrefs({ enabled: checked })
              }
            />
          </SettingRow>

          {keyboard.enabled && (
            <SettingRow
              id="setting-custom-hotkeys"
              label="Custom Hotkeys"
              description="Current keyboard shortcuts"
            >
              <div className="text-xs text-muted-foreground space-y-1">
                {Object.entries(keyboard.shortcuts).slice(0, 4).map(([action, key]) => (
                  <div key={action} className="flex gap-2">
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">
                      {key}
                    </kbd>
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </SettingRow>
          )}
        </SettingSection>
      </AdvancedToggle>
    </div>
  );
}
