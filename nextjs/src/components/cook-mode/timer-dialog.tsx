"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { CreateTimerData } from "@/types/voice-cooking";

interface TimerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTimer: (data: CreateTimerData) => Promise<void>;
  currentStep?: number;
}

const QUICK_PRESETS = [
  { label: "5 min", minutes: 5 },
  { label: "10 min", minutes: 10 },
  { label: "15 min", minutes: 15 },
  { label: "30 min", minutes: 30 },
  { label: "1 hour", minutes: 60 },
];

/**
 * Dialog for creating new timers
 * - Quick preset buttons
 * - Custom duration input
 * - Label input
 */
export function TimerDialog({
  open,
  onOpenChange,
  onCreateTimer,
  currentStep,
}: TimerDialogProps) {
  const [label, setLabel] = useState("");
  const [minutes, setMinutes] = useState(10);
  const [seconds, setSeconds] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handlePresetClick = (presetMinutes: number) => {
    setMinutes(presetMinutes);
    setSeconds(0);
  };

  const handleCreate = async () => {
    if (!label.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      await onCreateTimer({
        label: label.trim(),
        durationSeconds: minutes * 60 + seconds,
        stepIndex: currentStep,
      });

      // Reset form
      setLabel("");
      setMinutes(10);
      setSeconds(0);
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating timer:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && label.trim()) {
      handleCreate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Timer</DialogTitle>
          <DialogDescription>
            Set a timer to help you keep track of cooking times.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {/* Quick presets */}
          <div className="flex flex-col gap-2">
            <Label>Quick Presets</Label>
            <div className="flex flex-wrap gap-2">
              {QUICK_PRESETS.map((preset) => (
                <Badge
                  key={preset.minutes}
                  variant={minutes === preset.minutes && seconds === 0 ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/10"
                  onClick={() => handlePresetClick(preset.minutes)}
                >
                  {preset.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Custom duration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="minutes">Minutes</Label>
              <Input
                id="minutes"
                type="number"
                min="0"
                max="999"
                value={minutes}
                onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="seconds">Seconds</Label>
              <Input
                id="seconds"
                type="number"
                min="0"
                max="59"
                value={seconds}
                onChange={(e) => setSeconds(parseInt(e.target.value) || 0)}
                onKeyPress={handleKeyPress}
              />
            </div>
          </div>

          {/* Label */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="label">Label</Label>
            <Input
              id="label"
              placeholder="e.g., Simmer sauce, Bake cookies"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyPress={handleKeyPress}
              autoFocus
            />
          </div>

          {/* Duration preview */}
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Duration</p>
            <p className="text-3xl font-mono font-bold">
              {minutes}:{seconds.toString().padStart(2, "0")}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!label.trim() || (minutes === 0 && seconds === 0) || isLoading}
          >
            {isLoading ? "Creating..." : "Create Timer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
