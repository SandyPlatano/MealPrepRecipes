"use client";

import { useSettings } from "@/contexts/settings-context";
import { SettingsHeader } from "@/components/settings/layout/settings-header";
import { SettingRow, SettingSection } from "@/components/settings/shared/setting-row";
import { AdvancedToggle } from "@/components/settings/shared/advanced-toggle";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SOUND_OPTIONS, DEFAULT_SOUND_PREFERENCES, DEFAULT_KEYBOARD_PREFERENCES, type SoundPreset } from "@/types/user-preferences-v2";
import { resetAllHints } from "@/app/actions/settings";
import { playSound } from "@/lib/sounds";
import { toast } from "sonner";
import { RotateCcw, Play } from "lucide-react";
import { KeyboardShortcutsSection } from "@/components/settings/keyboard-shortcuts-section";

export default function ShortcutsSettingsPage() {
  const { profile, preferencesV2, updateSoundPrefs, updateKeyboardPrefs } = useSettings();
  // Defensive: ensure sounds and keyboard objects exist with defaults
  const sounds = preferencesV2?.sounds ?? DEFAULT_SOUND_PREFERENCES;
  const keyboard = preferencesV2?.keyboard ?? DEFAULT_KEYBOARD_PREFERENCES;

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
    playSound(sound);
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

      {/* Keyboard Shortcuts */}
      <div id="setting-keyboard-shortcuts">
        <div id="setting-custom-hotkeys">
          <KeyboardShortcutsSection
            userId={profile.id}
            initialPreferences={keyboard}
          />
        </div>
      </div>
    </div>
  );
}
