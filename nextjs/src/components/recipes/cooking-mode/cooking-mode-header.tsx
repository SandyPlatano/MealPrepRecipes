import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  X,
  Settings2,
  Maximize,
  Minimize,
  Mic,
  MicOff,
  Volume2,
  MoreVertical,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { CookModeSettings } from "@/types/settings";

interface CookingModeHeaderProps {
  currentStep: number;
  totalSteps: number;
  recipeTitle: string;
  progress: number;
  showProgress: boolean;
  isFullscreen: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  voiceCommandsSupported: boolean;
  voiceReadoutSupported: boolean;
  settings: CookModeSettings;
  onExit: () => void;
  onToggleFullscreen: () => void;
  onOpenSettings: () => void;
  onReadStep: () => void;
  onStopSpeaking: () => void;
  onStartListening: () => void;
  onStopListening: () => void;
  onSettingsChange: (settings: CookModeSettings) => void;
}

export function CookingModeHeader({
  currentStep,
  totalSteps,
  recipeTitle,
  progress,
  showProgress,
  isFullscreen,
  isListening,
  isSpeaking,
  voiceCommandsSupported,
  voiceReadoutSupported,
  settings,
  onExit,
  onToggleFullscreen,
  onOpenSettings,
  onReadStep,
  onStopSpeaking,
  onStartListening,
  onStopListening,
  onSettingsChange,
}: CookingModeHeaderProps) {
  const handleVoiceToggle = () => {
    console.log("[CookingModeHeader] Voice button selected");
    console.log("[CookingModeHeader] voiceCommandsSupported:", voiceCommandsSupported);
    console.log("[CookingModeHeader] isListening:", isListening);

    if (!voiceCommandsSupported) {
      toast.error("Voice commands not supported in this browser. Try Chrome or Edge.");
      return;
    }

    if (isListening) {
      console.log("[CookingModeHeader] Stopping voice...");
      onStopListening();
      onSettingsChange({
        ...settings,
        voice: { ...settings.voice, enabled: false },
      });
      toast.info("Voice commands disabled");
    } else {
      console.log("[CookingModeHeader] Starting voice...");
      onSettingsChange({
        ...settings,
        voice: { ...settings.voice, enabled: true },
      });
      onStartListening();
      toast.success(`Voice commands enabled! Say "${settings.voice.wakeWords?.[0] || "hey chef"}" to start.`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto mb-10">
      <div className="flex items-center justify-between mb-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onExit}
          className="h-12 w-12"
          aria-label="Exit cooking mode"
        >
          <X className="h-6 w-6" />
        </Button>

        {/* Center: Step Indicator */}
        <div className="text-center">
          <span className="text-lg lg:text-xl font-bold">
            Step {currentStep + 1} of {totalSteps}
          </span>
        </div>

        {/* Right: Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-12 w-12" aria-label="Cooking mode options">
              <MoreVertical className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {/* Voice Commands */}
            <DropdownMenuItem
              disabled={!voiceCommandsSupported}
              onSelect={handleVoiceToggle}
            >
              {isListening ? (
                <Mic className="h-4 w-4 mr-2" />
              ) : (
                <MicOff className="h-4 w-4 mr-2" />
              )}
              {isListening ? "Disable Voice Commands" : "Enable Voice Commands"}
            </DropdownMenuItem>

            {/* Read Step Aloud */}
            {voiceReadoutSupported && (
              <DropdownMenuItem onSelect={isSpeaking ? onStopSpeaking : onReadStep}>
                <Volume2 className={cn("h-4 w-4 mr-2", isSpeaking && "text-primary")} />
                {isSpeaking ? "Stop Reading" : "Read Step Aloud"}
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            {/* Fullscreen */}
            <DropdownMenuItem onSelect={onToggleFullscreen}>
              {isFullscreen ? (
                <Minimize className="h-4 w-4 mr-2" />
              ) : (
                <Maximize className="h-4 w-4 mr-2" />
              )}
              {isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Settings */}
            <DropdownMenuItem onSelect={onOpenSettings}>
              <Settings2 className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Recipe Title */}
      <h1 className="text-3xl lg:text-4xl font-mono font-bold mb-6">{recipeTitle}</h1>

      {/* Progress bar */}
      {showProgress && (
        <div className="mt-4">
          <div className="h-3 lg:h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#D9F99D] transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
