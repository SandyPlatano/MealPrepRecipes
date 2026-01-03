"use client";

import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SettingsHeader } from "@/components/settings/layout/settings-header";
import {
  Volume2,
  Hand,
  Clock,
  Eye,
  Settings2,
} from "lucide-react";
import type {
  CookModeSettings,
  CustomCookModePreset,
} from "@/types/settings";
import {
  PresetSection,
  DisplaySettings,
  VoiceSettings,
  GestureSettings,
  TimerSettings,
  BehaviorSettings,
  TryNowCard,
  useCookingModeSettings,
} from "./components";

interface CookModeSettingsContentProps {
  initialSettings: CookModeSettings | null;
  initialPresets: CustomCookModePreset[] | null;
}

export function CookModeSettingsContent({
  initialSettings,
  initialPresets,
}: CookModeSettingsContentProps) {
  const router = useRouter();
  const {
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
  } = useCookingModeSettings({ initialSettings, initialPresets });

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
      <TryNowCard onNavigate={() => router.push("/app/recipes")} />

      {/* Presets Section */}
      <PresetSection
        customPresets={customPresets}
        onApplyPreset={applyPreset}
        onCreatePreset={handleCreatePreset}
        onDeletePreset={handleDeletePreset}
        onSetDefault={handleSetDefault}
      />

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
          <DisplaySettings
            settings={settings.display}
            onUpdate={updateDisplaySettings}
          />
        </TabsContent>

        {/* Voice & Audio Tab */}
        <TabsContent value="voice" className="flex flex-col gap-6">
          <VoiceSettings
            voiceSettings={settings.voice}
            audioSettings={settings.audio}
            onUpdateVoice={updateVoiceSettings}
            onUpdateAudio={updateAudioSettings}
          />
        </TabsContent>

        {/* Gestures Tab */}
        <TabsContent value="gestures" className="flex flex-col gap-6">
          <GestureSettings
            settings={settings.gestures}
            onUpdate={updateGestureSettings}
          />
        </TabsContent>

        {/* Timers Tab */}
        <TabsContent value="timers" className="flex flex-col gap-6">
          <TimerSettings
            timerSettings={settings.timers}
            audioSettings={settings.audio}
            onUpdateTimer={updateTimerSettings}
            onUpdateAudio={updateAudioSettings}
          />
        </TabsContent>

        {/* Behavior Tab */}
        <TabsContent value="behavior" className="flex flex-col gap-6">
          <BehaviorSettings
            settings={settings.behavior}
            onUpdate={updateBehaviorSettings}
          />
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
