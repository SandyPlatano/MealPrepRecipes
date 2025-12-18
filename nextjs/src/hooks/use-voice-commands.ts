"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { VoiceCommandMapping, VoiceReadoutSpeed } from "@/types/settings";
import { findMatchingCommand, extractTimerMinutes, DEFAULT_VOICE_COMMANDS } from "@/lib/default-voice-commands";

/**
 * Browser compatibility interface for Web Speech API
 */
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition?: { new (): SpeechRecognition };
    webkitSpeechRecognition?: { new (): SpeechRecognition };
  }
}

/**
 * Options for configuring voice commands
 */
export interface VoiceCommandsOptions {
  /** Callback for "next" or "next step" commands */
  onNextStep: () => void;
  /** Callback for "back", "previous", "go back" commands */
  onPrevStep: () => void;
  /** Callback for timer commands like "timer 5 minutes" */
  onSetTimer: (minutes: number) => void;
  /** Callback for "stop timer" or "cancel timer" commands */
  onStopTimer: () => void;
  /** Callback for "repeat" or "say again" commands */
  onRepeat: () => void;
  /** Callback for "read", "read step", "read it" commands */
  onReadStep: () => void;
  /** Callback for "read ingredients" commands */
  onReadIngredients?: () => void;
  /** Callback for "pause" commands */
  onPause?: () => void;
  /** Callback for "resume" commands */
  onResume?: () => void;
  /** Whether voice commands are enabled */
  enabled: boolean;
  /** Wake words to activate voice commands (default: ["hey chef"]) */
  wakeWords?: string[];
  /** Custom command phrase mappings (defaults to DEFAULT_VOICE_COMMANDS) */
  commandMappings?: VoiceCommandMapping;
  /** Timeout in seconds to wait for command after wake word (default: 5) */
  commandTimeout?: number;
  /** Play confirmation sound when command is recognized (default: false) */
  confirmCommands?: boolean;

  // Backward compatibility - deprecated
  /** @deprecated Use wakeWords instead */
  wakeWord?: string;
}

/**
 * Return type for the useVoiceCommands hook
 */
export interface VoiceCommandsState {
  /** Whether the hook is actively listening for voice input */
  isListening: boolean;
  /** Whether the system is awaiting a command (wake word was detected) */
  isAwaitingCommand: boolean;
  /** The last recognized command */
  lastCommand: string | null;
  /** Any error that occurred during voice recognition */
  error: string | null;
  /** Whether speech recognition is supported in this browser */
  isSupported: boolean;
  /** Start listening for voice commands */
  startListening: () => void;
  /** Stop listening for voice commands */
  stopListening: () => void;
}

/**
 * Play acknowledgment sound when wake word is detected
 */
function playAcknowledgmentSound(): void {
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

    // Short pleasant acknowledgment beep
    oscillator.frequency.value = 880; // A5 note
    oscillator.type = "sine";
    gainNode.gain.value = 0.3;

    const now = audioContext.currentTime;
    oscillator.start(now);

    // Quick beep
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    oscillator.stop(now + 0.2);

    // Cleanup
    setTimeout(() => audioContext.close(), 300);
  } catch {
    // Audio not supported, silently fail
  }
}

/**
 * Play confirmation sound when command is recognized
 */
function playCommandConfirmationSound(): void {
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

    // Quick confirmation beep (higher pitch than wake word)
    oscillator.frequency.value = 1200; // Higher pitch
    oscillator.type = "sine";
    gainNode.gain.value = 0.2;

    const now = audioContext.currentTime;
    oscillator.start(now);

    // Very quick beep
    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    oscillator.stop(now + 0.12);

    // Cleanup
    setTimeout(() => audioContext.close(), 200);
  } catch {
    // Audio not supported, silently fail
  }
}

/**
 * Voice commands hook for cooking mode
 *
 * Listens continuously for the wake word "hey chef" (case insensitive).
 * After wake word is detected:
 * - Plays a short acknowledgment sound
 * - Enters "awaiting command" mode for 5 seconds
 * - Listens for commands: "next", "back/previous", "repeat", "timer X minutes", "stop timer", "read"
 * - Executes the appropriate callback
 * - Returns to wake word listening mode
 *
 * Uses the Web Speech API (SpeechRecognition) with graceful degradation if not supported.
 *
 * @example
 * ```tsx
 * const {
 *   isListening,
 *   isAwaitingCommand,
 *   startListening,
 *   stopListening,
 * } = useVoiceCommands({
 *   onNextStep: () => handleNextStep(),
 *   onPrevStep: () => handlePrevStep(),
 *   onSetTimer: (minutes) => startTimer(minutes),
 *   onStopTimer: () => resetTimer(),
 *   onRepeat: () => repeatStep(),
 *   onReadStep: () => readStepAloud(),
 *   enabled: true,
 *   wakeWord: "hey chef",
 * });
 * ```
 */
export function useVoiceCommands({
  onNextStep,
  onPrevStep,
  onSetTimer,
  onStopTimer,
  onRepeat,
  onReadStep,
  onReadIngredients,
  onPause,
  onResume,
  enabled,
  wakeWords: wakeWordsProp,
  wakeWord: deprecatedWakeWord,
  commandMappings = DEFAULT_VOICE_COMMANDS,
  commandTimeout = 5,
  confirmCommands = false,
}: VoiceCommandsOptions): VoiceCommandsState {
  const [isListening, setIsListening] = useState(false);
  const [isAwaitingCommand, setIsAwaitingCommand] = useState(false);
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const commandTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isAwaitingCommandRef = useRef(false);

  // Use refs to track current state for event handlers (avoids stale closures)
  const enabledRef = useRef(enabled);
  const isListeningRef = useRef(isListening);

  // Keep refs in sync with state
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // Check if SpeechRecognition is supported
  const isSupported =
    typeof window !== "undefined" &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  // Handle backward compatibility for wake word
  const wakeWords = wakeWordsProp || (deprecatedWakeWord ? [deprecatedWakeWord] : ["hey chef"]);

  // Normalize wake words for comparison
  const normalizedWakeWords = wakeWords.map(word => word.toLowerCase().trim());

  // Execute a matched command action
  const executeCommand = useCallback(
    (action: string, transcript: string) => {
      // Optionally play confirmation sound
      if (confirmCommands) {
        playCommandConfirmationSound();
      }

      switch (action) {
        case "nextStep":
          onNextStep();
          setLastCommand("next step");
          break;
        case "prevStep":
          onPrevStep();
          setLastCommand("previous step");
          break;
        case "repeat":
          onRepeat();
          setLastCommand("repeat");
          break;
        case "readStep":
          onReadStep();
          setLastCommand("read step");
          break;
        case "readIngredients":
          if (onReadIngredients) {
            onReadIngredients();
            setLastCommand("read ingredients");
          }
          break;
        case "pause":
          if (onPause) {
            onPause();
            setLastCommand("pause");
          }
          break;
        case "resume":
          if (onResume) {
            onResume();
            setLastCommand("resume");
          }
          break;
        case "stopTimer":
          onStopTimer();
          setLastCommand("stop timer");
          break;
        case "setTimer": {
          const minutes = extractTimerMinutes(transcript);
          if (minutes) {
            onSetTimer(minutes);
            setLastCommand(`timer ${minutes} minutes`);
          }
          break;
        }
      }
    },
    [
      onNextStep,
      onPrevStep,
      onRepeat,
      onReadStep,
      onReadIngredients,
      onPause,
      onResume,
      onStopTimer,
      onSetTimer,
      confirmCommands,
    ]
  );

  // Handle speech recognition result
  const handleResult = useCallback(
    (event: SpeechRecognitionEvent) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript;
      const normalized = transcript.toLowerCase().trim();

      console.log("[VoiceCommands] Heard:", transcript);
      console.log("[VoiceCommands] isAwaitingCommand:", isAwaitingCommandRef.current);
      console.log("[VoiceCommands] Wake words:", normalizedWakeWords);

      if (isAwaitingCommandRef.current) {
        // We're listening for a command
        console.log("[VoiceCommands] Checking for command match...");
        const matchedAction = findMatchingCommand(normalized, commandMappings);
        console.log("[VoiceCommands] Matched action:", matchedAction);
        if (matchedAction) {
          executeCommand(matchedAction, transcript);
          // Clear the awaiting command state
          setIsAwaitingCommand(false);
          isAwaitingCommandRef.current = false;
          if (commandTimeoutRef.current) {
            clearTimeout(commandTimeoutRef.current);
            commandTimeoutRef.current = null;
          }
        }
      } else {
        // We're listening for the wake word
        const isWakeWord = normalizedWakeWords.some(word =>
          normalized.includes(word)
        );
        console.log("[VoiceCommands] Is wake word match:", isWakeWord);

        if (isWakeWord) {
          // Wake word detected!
          console.log("[VoiceCommands] Wake word detected! Playing sound...");
          playAcknowledgmentSound();
          setIsAwaitingCommand(true);
          isAwaitingCommandRef.current = true;

          // Set timeout to exit awaiting command mode (convert to milliseconds)
          commandTimeoutRef.current = setTimeout(() => {
            console.log("[VoiceCommands] Command timeout reached");
            setIsAwaitingCommand(false);
            isAwaitingCommandRef.current = false;
            commandTimeoutRef.current = null;
          }, commandTimeout * 1000);
        }
      }
    },
    [normalizedWakeWords, commandMappings, commandTimeout, executeCommand]
  );

  // Start listening for voice commands
  // NOTE: Caller is responsible for checking if voice should be enabled
  // Do NOT check 'enabled' here - it causes stale closure issues
  const startListening = useCallback(() => {
    console.log("[VoiceCommands] startListening called");

    // Already listening - don't start again
    if (recognitionRef.current) {
      console.log("[VoiceCommands] Already listening, returning early");
      return;
    }

    if (typeof window === "undefined") {
      console.error("[VoiceCommands] No window object");
      setError("Voice commands not available (no window)");
      return;
    }

    const SpeechRecognitionClass =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      console.error("[VoiceCommands] SpeechRecognition not supported");
      setError("Speech recognition not supported in this browser");
      return;
    }

    console.log("[VoiceCommands] Creating recognition instance...");

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = handleResult;

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("[VoiceCommands] Recognition error:", event.error, event.message);
        // Handle specific errors differently
        if (event.error === "not-allowed") {
          setError("Microphone access denied. Please allow microphone access.");
        } else if (event.error === "no-speech") {
          // This is normal - don't treat as error, just restart
          console.log("[VoiceCommands] No speech detected, continuing...");
          return;
        } else if (event.error === "aborted") {
          // Recognition was aborted, this is normal when stopping
          console.log("[VoiceCommands] Recognition aborted");
          return;
        } else {
          setError(`Speech recognition error: ${event.error}`);
        }
        setIsListening(false);
        isListeningRef.current = false;
      };

      recognition.onend = () => {
        console.log("[VoiceCommands] Recognition ended, enabledRef:", enabledRef.current, "isListeningRef:", isListeningRef.current);
        // Use refs for current state (avoids stale closure)
        if (enabledRef.current && isListeningRef.current) {
          // Automatically restart if we're still enabled and should be listening
          console.log("[VoiceCommands] Restarting recognition...");
          try {
            recognition.start();
          } catch (err) {
            console.error("[VoiceCommands] Failed to restart:", err);
            setError(`Failed to restart: ${err instanceof Error ? err.message : "unknown"}`);
            setIsListening(false);
            isListeningRef.current = false;
          }
        } else {
          console.log("[VoiceCommands] Not restarting, stopping listening");
          setIsListening(false);
          isListeningRef.current = false;
        }
      };

      recognition.onstart = () => {
        console.log("[VoiceCommands] Recognition started successfully!");
      };

      recognition.onaudiostart = () => {
        console.log("[VoiceCommands] Audio capture started");
      };

      console.log("[VoiceCommands] Calling recognition.start()...");
      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
      isListeningRef.current = true;
      setError(null);
      console.log("[VoiceCommands] Voice commands listening started!");
    } catch (err) {
      console.error("[VoiceCommands] Failed to start:", err);
      setError(
        `Failed to start speech recognition: ${err instanceof Error ? err.message : "unknown error"}`
      );
      setIsListening(false);
      isListeningRef.current = false;
    }
  }, [handleResult]); // Removed 'enabled' and 'isListening' - use refs instead

  // Stop listening for voice commands
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (commandTimeoutRef.current) {
      clearTimeout(commandTimeoutRef.current);
      commandTimeoutRef.current = null;
    }
    setIsListening(false);
    setIsAwaitingCommand(false);
    isAwaitingCommandRef.current = false;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      if (commandTimeoutRef.current) {
        clearTimeout(commandTimeoutRef.current);
        commandTimeoutRef.current = null;
      }
    };
  }, []);

  // Auto-stop if disabled
  useEffect(() => {
    if (!enabled && isListening) {
      stopListening();
    }
  }, [enabled, isListening, stopListening]);

  return {
    isListening,
    isAwaitingCommand,
    lastCommand,
    error,
    isSupported,
    startListening,
    stopListening,
  };
}
