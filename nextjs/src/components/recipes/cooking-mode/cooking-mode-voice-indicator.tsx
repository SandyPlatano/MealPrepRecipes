import { Mic } from "lucide-react";
import { cn } from "@/lib/utils";

interface CookingModeVoiceIndicatorProps {
  isListening: boolean;
  isAwaitingCommand: boolean;
  wakeWord: string;
}

export function CookingModeVoiceIndicator({
  isListening,
  isAwaitingCommand,
  wakeWord,
}: CookingModeVoiceIndicatorProps) {
  if (!isListening) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full shadow-lg transition-all duration-300",
        isAwaitingCommand
          ? "bg-[#D9F99D] text-[#1A1A1A] animate-pulse"
          : "bg-muted text-muted-foreground"
      )}
    >
      <div className="flex items-center gap-2">
        <Mic className={cn("h-4 w-4", isAwaitingCommand && "animate-bounce")} />
        <span className="text-sm font-medium">
          {isAwaitingCommand
            ? "Listening... say a command"
            : `Say "${wakeWord}"`}
        </span>
      </div>
    </div>
  );
}
