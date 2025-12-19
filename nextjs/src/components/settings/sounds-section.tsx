"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { updateSoundPreferences } from "@/app/actions/user-preferences";
import type { SoundPreferences, SoundPreset } from "@/types/user-preferences-v2";
import { SOUND_OPTIONS } from "@/types/user-preferences-v2";
import { playSound as playSoundEffect } from "@/lib/sounds";
import { Volume2, VolumeX, Play, Bell, Trophy, MessageSquare } from "lucide-react";

interface SoundsSectionProps {
  userId: string;
  initialPreferences: SoundPreferences;
}

export function SoundsSection({
  userId,
  initialPreferences,
}: SoundsSectionProps) {
  const [preferences, setPreferences] = useState<SoundPreferences>(initialPreferences);
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdate = async (updates: Partial<SoundPreferences>) => {
    const updatedPrefs = { ...preferences, ...updates };
    setPreferences(updatedPrefs);

    setIsSaving(true);
    const result = await updateSoundPreferences(userId, updates);
    setIsSaving(false);

    if (result.error) {
      toast.error("Failed to save sound preferences");
      setPreferences(preferences); // Revert on error
    } else {
      toast.success("Sound preferences saved");
    }
  };

  const playSound = (sound: SoundPreset) => {
    if (sound === "none") {
      toast.info("This sound is silent");
      return;
    }

    // Play the actual sound using Web Audio API (at system volume)
    playSoundEffect(sound);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Master Audio Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            {preferences.enabled ? (
              <Volume2 className="size-4 text-muted-foreground" />
            ) : (
              <VolumeX className="size-4 text-muted-foreground" />
            )}
            <Label>Enable Sounds</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Turn on audio feedback for timers, notifications, and achievements
          </p>
        </div>
        <Switch
          checked={preferences.enabled}
          onCheckedChange={(checked) => handleUpdate({ enabled: checked })}
        />
      </div>

      {preferences.enabled && (
        <>
          {/* Timer Complete Sound */}
          <Card className="p-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Bell className="size-4 text-muted-foreground" />
                <Label>Timer Complete</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Sound played when a cooking timer finishes
              </p>
              <div className="flex items-center gap-2">
                <Select
                  value={preferences.timerComplete}
                  onValueChange={(value) =>
                    handleUpdate({ timerComplete: value as SoundPreset })
                  }
                >
                  <SelectTrigger className="flex-1">
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
                  onClick={() => playSound(preferences.timerComplete)}
                  title="Preview sound"
                >
                  <Play className="size-4" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Notification Sound */}
          <Card className="p-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="size-4 text-muted-foreground" />
                <Label>Notification</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Sound for general notifications and alerts
              </p>
              <div className="flex items-center gap-2">
                <Select
                  value={preferences.notification}
                  onValueChange={(value) =>
                    handleUpdate({ notification: value as SoundPreset })
                  }
                >
                  <SelectTrigger className="flex-1">
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
                  onClick={() => playSound(preferences.notification)}
                  title="Preview sound"
                >
                  <Play className="size-4" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Achievement Sound */}
          <Card className="p-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Trophy className="size-4 text-muted-foreground" />
                <Label>Achievement</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Celebratory sound for milestones and achievements
              </p>
              <div className="flex items-center gap-2">
                <Select
                  value={preferences.achievement}
                  onValueChange={(value) =>
                    handleUpdate({ achievement: value as SoundPreset })
                  }
                >
                  <SelectTrigger className="flex-1">
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
                  onClick={() => playSound(preferences.achievement)}
                  title="Preview sound"
                >
                  <Play className="size-4" />
                </Button>
              </div>
            </div>
          </Card>
        </>
      )}

      {isSaving && (
        <p className="text-xs text-muted-foreground text-center">Saving...</p>
      )}
    </div>
  );
}
