"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { SettingRow, SettingSection } from "@/components/settings/shared/setting-row";
import type { CookModeSettings, TimerSoundType } from "@/types/settings";

const TIMER_SOUND_OPTIONS: { value: TimerSoundType; label: string }[] = [
  { value: "classic", label: "Classic" },
  { value: "gentle", label: "Gentle" },
  { value: "urgent", label: "Urgent" },
  { value: "melody", label: "Melody" },
];

interface TimerSettingsProps {
  timerSettings: CookModeSettings["timers"];
  audioSettings: CookModeSettings["audio"];
  onUpdateTimer: (updates: Partial<CookModeSettings["timers"]>) => void;
  onUpdateAudio: (updates: Partial<CookModeSettings["audio"]>) => void;
}

export function TimerSettings({
  timerSettings,
  audioSettings,
  onUpdateTimer,
  onUpdateAudio,
}: TimerSettingsProps) {
  return (
    <div className="flex flex-col gap-6">
      <SettingSection title="Timer Settings">
        <SettingRow
          id="setting-quick-timer-presets"
          label="Quick Timer Presets"
          description="One-tap timer durations (in minutes)"
        >
          <div className="flex flex-wrap gap-2">
            {[1, 3, 5, 10, 15, 20, 30].map((min) => {
              const isActive = timerSettings.quickTimerPresets.includes(min);
              return (
                <Button
                  key={min}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    const newPresets = isActive
                      ? timerSettings.quickTimerPresets.filter((p) => p !== min)
                      : [...timerSettings.quickTimerPresets, min].sort((a, b) => a - b);
                    onUpdateTimer({ quickTimerPresets: newPresets });
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
            checked={timerSettings.autoDetectTimers}
            onCheckedChange={(checked) =>
              onUpdateTimer({ autoDetectTimers: checked })
            }
          />
        </SettingRow>

        <SettingRow
          id="setting-show-timer-in-title"
          label="Show Timer in Title"
          description="Display active timer in page title"
        >
          <Switch
            checked={timerSettings.showTimerInTitle}
            onCheckedChange={(checked) =>
              onUpdateTimer({ showTimerInTitle: checked })
            }
          />
        </SettingRow>

        <SettingRow
          id="setting-vibration-on-complete"
          label="Vibration on Complete"
          description="Vibrate when timer finishes"
        >
          <Switch
            checked={timerSettings.vibrationOnComplete}
            onCheckedChange={(checked) =>
              onUpdateTimer({ vibrationOnComplete: checked })
            }
          />
        </SettingRow>

        <SettingRow
          id="setting-repeat-timer-alert"
          label="Repeat Timer Alert"
          description="Keep alerting until dismissed"
        >
          <Switch
            checked={timerSettings.repeatTimerAlert}
            onCheckedChange={(checked) =>
              onUpdateTimer({ repeatTimerAlert: checked })
            }
          />
        </SettingRow>

        <SettingRow
          id="setting-timer-sound"
          label="Timer Sound"
          description="Sound to play when timer completes"
        >
          <Select
            value={audioSettings.timerSound}
            onValueChange={(value: TimerSoundType) =>
              onUpdateAudio({ timerSound: value })
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
    </div>
  );
}
