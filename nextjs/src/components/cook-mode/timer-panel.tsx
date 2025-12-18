"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pause, Play, X, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { cancelTimer as cancelTimerAction, completeTimer } from "@/app/actions/voice-cooking";
import type { VoiceSessionTimer } from "@/types/voice-cooking";

interface TimerPanelProps {
  timers: VoiceSessionTimer[];
  onAddTimer: () => void;
  onTimerComplete?: (timerId: string) => void;
  className?: string;
}

interface ClientTimer {
  id: string;
  label: string;
  remainingSeconds: number;
  isPaused: boolean;
  isComplete: boolean;
}

/**
 * Panel displaying all active timers with countdown
 * - Live countdown for each timer
 * - Audio alert when timer completes
 * - Pause/resume and cancel controls
 */
export function TimerPanel({
  timers,
  onAddTimer,
  onTimerComplete,
  className,
}: TimerPanelProps) {
  const [clientTimers, setClientTimers] = useState<Map<string, ClientTimer>>(
    new Map()
  );
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  // Initialize client timers from server timers
  useEffect(() => {
    const newTimers = new Map<string, ClientTimer>();
    timers.forEach((timer) => {
      if (!clientTimers.has(timer.id)) {
        newTimers.set(timer.id, {
          id: timer.id,
          label: timer.label,
          remainingSeconds: timer.remaining_seconds,
          isPaused: timer.status === "paused",
          isComplete: false,
        });
      } else {
        newTimers.set(timer.id, clientTimers.get(timer.id)!);
      }
    });
    setClientTimers(newTimers);
  }, [timers]);

  // Initialize audio context on first user interaction
  useEffect(() => {
    const initAudio = () => {
      if (!audioContext) {
        setAudioContext(new AudioContext());
      }
    };
    window.addEventListener("click", initAudio, { once: true });
    return () => window.removeEventListener("click", initAudio);
  }, [audioContext]);

  // Play alert sound using Web Audio API
  const playAlert = useCallback(() => {
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.5
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);

    // Play three beeps
    setTimeout(() => {
      const osc2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();
      osc2.connect(gain2);
      gain2.connect(audioContext.destination);
      osc2.frequency.value = 800;
      osc2.type = "sine";
      gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain2.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.5
      );
      osc2.start();
      osc2.stop(audioContext.currentTime + 0.5);
    }, 200);

    setTimeout(() => {
      const osc3 = audioContext.createOscillator();
      const gain3 = audioContext.createGain();
      osc3.connect(gain3);
      gain3.connect(audioContext.destination);
      osc3.frequency.value = 800;
      osc3.type = "sine";
      gain3.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain3.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.5
      );
      osc3.start();
      osc3.stop(audioContext.currentTime + 0.5);
    }, 400);
  }, [audioContext]);

  // Countdown logic
  useEffect(() => {
    const interval = setInterval(() => {
      setClientTimers((prev) => {
        const updated = new Map(prev);
        let hasChanges = false;

        updated.forEach((timer) => {
          if (!timer.isPaused && !timer.isComplete && timer.remainingSeconds > 0) {
            timer.remainingSeconds -= 1;
            hasChanges = true;

            if (timer.remainingSeconds === 0) {
              timer.isComplete = true;
              playAlert();
              onTimerComplete?.(timer.id);
              completeTimer(timer.id).catch(console.error);
            }
          }
        });

        return hasChanges ? updated : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [playAlert, onTimerComplete]);

  const togglePause = (timerId: string) => {
    setClientTimers((prev) => {
      const updated = new Map(prev);
      const timer = updated.get(timerId);
      if (timer) {
        timer.isPaused = !timer.isPaused;
      }
      return updated;
    });
  };

  const cancelTimer = async (timerId: string) => {
    await cancelTimerAction(timerId);
    setClientTimers((prev) => {
      const updated = new Map(prev);
      updated.delete(timerId);
      return updated;
    });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const activeTimers = Array.from(clientTimers.values());

  if (activeTimers.length === 0) {
    return (
      <Card className={cn("p-4", className)}>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">No active timers</p>
          <Button variant="outline" size="sm" onClick={onAddTimer}>
            <Plus className="mr-2 h-4 w-4" />
            Add Timer
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("p-4 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Active Timers</h3>
        <Button variant="outline" size="sm" onClick={onAddTimer}>
          <Plus className="mr-2 h-4 w-4" />
          Add
        </Button>
      </div>

      <div className="space-y-3">
        {activeTimers.map((timer) => (
          <div
            key={timer.id}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg border",
              timer.isComplete && "bg-primary/10 border-primary"
            )}
          >
            <div className="flex items-center gap-3 flex-1">
              {timer.isComplete && (
                <Bell className="h-5 w-5 text-primary animate-pulse" />
              )}
              <div className="flex-1">
                <p className="font-medium">{timer.label}</p>
                <p
                  className={cn(
                    "text-2xl font-mono font-bold",
                    timer.isComplete && "text-primary"
                  )}
                >
                  {formatTime(timer.remainingSeconds)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!timer.isComplete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => togglePause(timer.id)}
                >
                  {timer.isPaused ? (
                    <Play className="h-4 w-4" />
                  ) : (
                    <Pause className="h-4 w-4" />
                  )}
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => cancelTimer(timer.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
