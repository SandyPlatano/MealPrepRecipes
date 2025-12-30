"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

export interface UseCookingTimerOptions {
  recipeTitle: string;
  timerSoundsEnabled: boolean;
  showTimerInTitle: boolean;
  autoAdvanceEnabled: boolean;
  onAutoAdvance: () => void;
}

export interface UseCookingTimerReturn {
  timerMinutes: number;
  timerSeconds: number;
  timerRunning: boolean;
  timerTotal: number;
  startTimer: (minutes: number) => void;
  resetTimer: () => void;
  toggleTimer: () => void;
}

/**
 * Hook for managing cooking timer state and logic.
 */
export function useCookingTimer({
  recipeTitle,
  timerSoundsEnabled,
  showTimerInTitle,
  autoAdvanceEnabled,
  onAutoAdvance,
}: UseCookingTimerOptions): UseCookingTimerReturn {
  const [timerMinutes, setTimerMinutes] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerTotal, setTimerTotal] = useState(0);

  const startTimer = useCallback((minutes: number) => {
    setTimerMinutes(minutes);
    setTimerSeconds(0);
    setTimerTotal(minutes * 60);
    setTimerRunning(true);
    toast.success(`Timer started for ${minutes} minutes`);
  }, []);

  const resetTimer = useCallback(() => {
    setTimerRunning(false);
    setTimerMinutes(0);
    setTimerSeconds(0);
    setTimerTotal(0);
  }, []);

  const toggleTimer = useCallback(() => {
    setTimerRunning((prev) => !prev);
  }, []);

  // Play timer sound using Web Audio API
  const playTimerSound = useCallback(() => {
    if (!timerSoundsEnabled) return;
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;

      const audioContext = new AudioContextClass();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 880; // A5 note
      oscillator.type = "sine";
      gainNode.gain.value = 0.3;

      const now = audioContext.currentTime;
      oscillator.start(now);

      // Beep pattern: on-off-on-off-on-off
      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.setValueAtTime(0, now + 0.15);
      gainNode.gain.setValueAtTime(0.3, now + 0.3);
      gainNode.gain.setValueAtTime(0, now + 0.45);
      gainNode.gain.setValueAtTime(0.3, now + 0.6);
      gainNode.gain.setValueAtTime(0, now + 0.75);

      oscillator.stop(now + 0.8);
      setTimeout(() => audioContext.close(), 1000);
    } catch {
      // Audio not supported
    }
  }, [timerSoundsEnabled]);

  // Handle page title with timer
  useEffect(() => {
    if (showTimerInTitle && timerRunning && (timerMinutes > 0 || timerSeconds > 0)) {
      const timeStr = `${timerMinutes}:${timerSeconds.toString().padStart(2, "0")}`;
      document.title = `${timeStr} - Cooking Mode`;
    } else {
      document.title = `Cooking ${recipeTitle}`;
    }

    return () => {
      document.title = "MealPrepRecipes";
    };
  }, [timerMinutes, timerSeconds, timerRunning, showTimerInTitle, recipeTitle]);

  // Timer countdown logic
  useEffect(() => {
    if (!timerRunning || (timerMinutes === 0 && timerSeconds === 0)) {
      if (timerMinutes === 0 && timerSeconds === 0 && timerTotal > 0) {
        // Timer finished
        toast.success("Timer finished!", { duration: 5000 });
        setTimerRunning(false);
        playTimerSound();
        if (autoAdvanceEnabled) {
          onAutoAdvance();
        }
      }
      return;
    }

    const interval = setInterval(() => {
      if (timerSeconds > 0) {
        setTimerSeconds(timerSeconds - 1);
      } else if (timerMinutes > 0) {
        setTimerMinutes(timerMinutes - 1);
        setTimerSeconds(59);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timerRunning, timerMinutes, timerSeconds, timerTotal, playTimerSound, autoAdvanceEnabled, onAutoAdvance]);

  return {
    timerMinutes,
    timerSeconds,
    timerRunning,
    timerTotal,
    startTimer,
    resetTimer,
    toggleTimer,
  };
}
