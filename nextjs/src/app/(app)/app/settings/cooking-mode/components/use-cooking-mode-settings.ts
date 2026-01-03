import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { CookModeSettings, CustomCookModePreset } from "@/types/settings";
import {
  updateCookModeSettings,
  saveCustomCookModePreset,
  deleteCustomCookModePreset,
  setDefaultCookModePreset,
} from "@/app/actions/settings";

interface UseCookingModeSettingsProps {
  initialSettings: CookModeSettings | null;
  initialPresets: CustomCookModePreset[] | null;
}

export function useCookingModeSettings({
  initialSettings,
  initialPresets,
}: UseCookingModeSettingsProps) {
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

  return {
    settings,
    customPresets,
    isSaving,
    applyPreset,
    handleCreatePreset,
    handleDeletePreset,
    handleSetDefault,
    updateDisplaySettings,
    updateVoiceSettings,
    updateGestureSettings,
    updateTimerSettings,
    updateAudioSettings,
    updateBehaviorSettings,
  };
}
