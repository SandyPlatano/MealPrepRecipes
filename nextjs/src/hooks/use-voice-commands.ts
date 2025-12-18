"use client";

import { useState, useEffect, useCallback, useRef } from "react";

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
  /** Whether voice commands are enabled */
  enabled: boolean;
  /** Wake word to activate voice commands (default: "hey chef") */
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
 * Parse a voice command and extract the intent
 */
function parseCommand(transcript: string): {
  type: string;
  minutes?: number;
} | null {
  const normalized = transcript.toLowerCase().trim();

  // Next step
  if (normalized === "next" || normalized === "next step") {
    return { type: "next" };
  }

  // Previous step
  if (
    normalized === "back" ||
    normalized === "previous" ||
    normalized === "go back" ||
    normalized === "previous step"
  ) {
    return { type: "previous" };
  }

  // Repeat
  if (normalized === "repeat" || normalized === "say again") {
    return { type: "repeat" };
  }

  // Read step
  if (
    normalized === "read" ||
    normalized === "read step" ||
    normalized === "read it"
  ) {
    return { type: "read" };
  }

  // Stop timer
  if (normalized === "stop timer" || normalized === "cancel timer") {
    return { type: "stopTimer" };
  }

  // Set timer - extract minutes
  const timerMatch = normalized.match(
    /(?:timer|set timer)\s+(\d+)\s+(?:minute|minutes)/i
  );
  if (timerMatch) {
    const minutes = parseInt(timerMatch[1], 10);
    if (!isNaN(minutes) && minutes > 0) {
      return { type: "timer", minutes };
    }
  }

  return null;
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
  enabled,
  wakeWord = "hey chef",
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

  // Normalize wake word for comparison
  const normalizedWakeWord = wakeWord.toLowerCase().trim();

  // Execute a parsed command
  const executeCommand = useCallback(
    (command: { type: string; minutes?: number }) => {
      switch (command.type) {
        case "next":
          onNextStep();
          setLastCommand("next");
          break;
        case "previous":
          onPrevStep();
          setLastCommand("previous");
          break;
        case "repeat":
          onRepeat();
          setLastCommand("repeat");
          break;
        case "read":
          onReadStep();
          setLastCommand("read");
          break;
        case "stopTimer":
          onStopTimer();
          setLastCommand("stop timer");
          break;
        case "timer":
          if (command.minutes) {
            onSetTimer(command.minutes);
            setLastCommand(`timer ${command.minutes} minutes`);
          }
          break;
      }
    },
    [onNextStep, onPrevStep, onRepeat, onReadStep, onStopTimer, onSetTimer]
  );

  // Handle speech recognition result
  const handleResult = useCallback(
    (event: SpeechRecognitionEvent) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript;
      const normalized = transcript.toLowerCase().trim();

      if (isAwaitingCommandRef.current) {
        // We're listening for a command
        const command = parseCommand(normalized);
        if (command) {
          executeCommand(command);
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
        if (normalized.includes(normalizedWakeWord)) {
          // Wake word detected!
          playAcknowledgmentSound();
          setIsAwaitingCommand(true);
          isAwaitingCommandRef.current = true;

          // Set timeout to exit awaiting command mode
          commandTimeoutRef.current = setTimeout(() => {
            setIsAwaitingCommand(false);
            isAwaitingCommandRef.current = false;
            commandTimeoutRef.current = null;
          }, 5000); // 5 seconds to give a command
        }
      }
    },
    [normalizedWakeWord, executeCommand]
  );

  // Start listening for voice commands
  // NOTE: Caller is responsible for checking if voice should be enabled
  // Do NOT check 'enabled' here - it causes stale closure issues
  const startListening = useCallback(() => {
    // Already listening - don't start again
    if (recognitionRef.current) {
      return;
    }

    if (typeof window === "undefined") {
      setError("Voice commands not available (no window)");
      return;
    }

    const SpeechRecognitionClass =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setError("Speech recognition not supported in this browser");
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = handleResult;

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        // Handle specific errors differently
        if (event.error === "not-allowed") {
          setError("Microphone access denied. Please allow microphone access.");
        } else if (event.error === "no-speech") {
          // This is normal - don't treat as error, just restart
          return;
        } else {
          setError(`Speech recognition error: ${event.error}`);
        }
        setIsListening(false);
        isListeningRef.current = false;
      };

      recognition.onend = () => {
        // Use refs for current state (avoids stale closure)
        if (enabledRef.current && isListeningRef.current) {
          // Automatically restart if we're still enabled and should be listening
          try {
            recognition.start();
          } catch (err) {
            setError(`Failed to restart: ${err instanceof Error ? err.message : "unknown"}`);
            setIsListening(false);
            isListeningRef.current = false;
          }
        } else {
          setIsListening(false);
          isListeningRef.current = false;
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
      isListeningRef.current = true;
      setError(null);
    } catch (err) {
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
