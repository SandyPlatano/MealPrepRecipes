"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { SettingRow, SettingSection } from "@/components/settings/shared/setting-row";
import type { CookModeSettings, AcknowledgmentSound } from "@/types/settings";

const ACKNOWLEDGMENT_SOUND_OPTIONS: { value: AcknowledgmentSound; label: string }[] = [
  { value: "beep", label: "Beep" },
  { value: "chime", label: "Chime" },
  { value: "ding", label: "Ding" },
  { value: "silent", label: "Silent" },
];

interface VoiceSettingsProps {
  voiceSettings: CookModeSettings["voice"];
  audioSettings: CookModeSettings["audio"];
  onUpdateVoice: (updates: Partial<CookModeSettings["voice"]>) => void;
  onUpdateAudio: (updates: Partial<CookModeSettings["audio"]>) => void;
}

export function VoiceSettings({
  voiceSettings,
  audioSettings,
  onUpdateVoice,
  onUpdateAudio,
}: VoiceSettingsProps) {
  return (
    <div className="flex flex-col gap-6">
      <SettingSection title="Voice Control">
        <SettingRow
          id="setting-voice-enabled"
          label="Enable Voice Commands"
          description="Control cooking mode with your voice"
        >
          <Switch
            checked={voiceSettings.enabled}
            onCheckedChange={(checked) =>
              onUpdateVoice({ enabled: checked })
            }
          />
        </SettingRow>

        {voiceSettings.enabled && (
          <>
            <SettingRow
              id="setting-auto-read-steps"
              label="Auto-Read Steps"
              description="Automatically read each step aloud"
            >
              <Switch
                checked={voiceSettings.autoReadSteps}
                onCheckedChange={(checked) =>
                  onUpdateVoice({ autoReadSteps: checked })
                }
              />
            </SettingRow>

            <SettingRow
              id="setting-readout-speed"
              label="Readout Speed"
              description="How fast voice reads instructions"
            >
              <Select
                value={voiceSettings.readoutSpeed}
                onValueChange={(value: "slow" | "normal" | "fast") =>
                  onUpdateVoice({ readoutSpeed: value })
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
                checked={voiceSettings.confirmCommands}
                onCheckedChange={(checked) =>
                  onUpdateVoice({ confirmCommands: checked })
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
            value={audioSettings.acknowledgmentSound}
            onValueChange={(value: AcknowledgmentSound) =>
              onUpdateAudio({ acknowledgmentSound: value })
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
              value={[audioSettings.ttsVolume * 100]}
              onValueChange={([value]) =>
                onUpdateAudio({ ttsVolume: value / 100 })
              }
              max={100}
              step={1}
            />
          </div>
        </SettingRow>
      </SettingSection>
    </div>
  );
}
