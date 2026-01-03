"use client";

import { Switch } from "@/components/ui/switch";
import { SettingRow, SettingSection } from "@/components/settings/shared/setting-row";
import type { CookModeSettings } from "@/types/settings";

interface BehaviorSettingsProps {
  settings: CookModeSettings["behavior"];
  onUpdate: (updates: Partial<CookModeSettings["behavior"]>) => void;
}

export function BehaviorSettings({ settings, onUpdate }: BehaviorSettingsProps) {
  return (
    <div className="flex flex-col gap-6">
      <SettingSection title="General Behavior">
        <SettingRow
          id="setting-keep-screen-awake"
          label="Keep Screen Awake"
          description="Prevent screen from turning off while cooking"
        >
          <Switch
            checked={settings.keepScreenAwake}
            onCheckedChange={(checked) =>
              onUpdate({ keepScreenAwake: checked })
            }
          />
        </SettingRow>

        <SettingRow
          id="setting-timer-sounds"
          label="Timer Sounds"
          description="Play sounds when timers complete"
        >
          <Switch
            checked={settings.timerSounds}
            onCheckedChange={(checked) =>
              onUpdate({ timerSounds: checked })
            }
          />
        </SettingRow>

        <SettingRow
          id="setting-auto-advance"
          label="Auto-Advance Steps"
          description="Automatically move to next step after timer"
        >
          <Switch
            checked={settings.autoAdvance}
            onCheckedChange={(checked) =>
              onUpdate({ autoAdvance: checked })
            }
          />
        </SettingRow>
      </SettingSection>
    </div>
  );
}
