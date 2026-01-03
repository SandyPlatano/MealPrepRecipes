"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { SettingRow, SettingSection } from "@/components/settings/shared/setting-row";
import type { CookModeSettings, GestureAction } from "@/types/settings";

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

interface GestureSettingsProps {
  settings: CookModeSettings["gestures"];
  onUpdate: (updates: Partial<CookModeSettings["gestures"]>) => void;
}

export function GestureSettings({ settings, onUpdate }: GestureSettingsProps) {
  return (
    <div className="flex flex-col gap-6">
      <SettingSection title="Touch Gestures">
        <SettingRow
          id="setting-swipe-enabled"
          label="Swipe Navigation"
          description="Swipe left/right to move between steps"
        >
          <Switch
            checked={settings.swipeEnabled}
            onCheckedChange={(checked) =>
              onUpdate({ swipeEnabled: checked })
            }
          />
        </SettingRow>

        <SettingRow
          id="setting-tap-to-advance"
          label="Tap to Advance"
          description="Tap anywhere to go to next step"
        >
          <Switch
            checked={settings.tapToAdvance}
            onCheckedChange={(checked) =>
              onUpdate({ tapToAdvance: checked })
            }
          />
        </SettingRow>

        <SettingRow
          id="setting-haptic-feedback"
          label="Haptic Feedback"
          description="Vibration when performing actions"
        >
          <Switch
            checked={settings.hapticFeedback}
            onCheckedChange={(checked) =>
              onUpdate({ hapticFeedback: checked })
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
            value={settings.doubleTapAction}
            onValueChange={(value: GestureAction) =>
              onUpdate({ doubleTapAction: value })
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
            value={settings.longPressAction}
            onValueChange={(value: GestureAction) =>
              onUpdate({ longPressAction: value })
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
            value={settings.swipeUpAction}
            onValueChange={(value: GestureAction) =>
              onUpdate({ swipeUpAction: value })
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
            value={settings.swipeDownAction}
            onValueChange={(value: GestureAction) =>
              onUpdate({ swipeDownAction: value })
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
    </div>
  );
}
