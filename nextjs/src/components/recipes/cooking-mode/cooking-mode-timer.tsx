import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Timer, Play, Pause, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface CookingModeTimerProps {
  timerMinutes: number;
  timerSeconds: number;
  timerRunning: boolean;
  timerTotal: number;
  onToggle: () => void;
  onReset: () => void;
}

export function CookingModeTimer({
  timerMinutes,
  timerSeconds,
  timerRunning,
  timerTotal,
  onToggle,
  onReset,
}: CookingModeTimerProps) {
  if (timerTotal === 0 && !timerRunning) {
    return null;
  }

  return (
    <Card className="p-8">
      <div className="flex flex-col">
        <div className="flex items-center gap-3">
          <Timer className="h-6 w-6 text-[#D9F99D]" />
          <span className="text-lg font-semibold">Timer</span>
        </div>
        <div className="text-center">
          <div className={cn(
            "text-6xl font-mono font-bold tabular-nums",
            timerRunning && "text-[#D9F99D]"
          )}>
            {String(timerMinutes).padStart(2, "0")}:
            {String(timerSeconds).padStart(2, "0")}
          </div>
        </div>
        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={onToggle}
            className="h-12 w-12"
            aria-label={timerRunning ? "Pause timer" : "Start timer"}
          >
            {timerRunning ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={onReset}
            className="h-12 w-12"
            aria-label="Reset timer"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
