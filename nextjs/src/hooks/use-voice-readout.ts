"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { VoiceReadoutSpeed } from "@/types/settings";

interface VoiceReadoutOptions {
  speed?: VoiceReadoutSpeed;
  enabled?: boolean;
  /** Specific voice name to use (optional) */
  voiceName?: string;
  /** Voice pitch: 0.5 - 2.0 (default: 1.0) */
  pitch?: number;
  /** Voice rate: 0.5 - 2.0 (overrides speed if provided) */
  rate?: number;
  /** Voice volume: 0 - 1 (default: 1.0) */
  volume?: number;
}

interface VoiceReadoutReturn {
  speak: (text: string) => void;
  stop: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
}

const SPEED_MAP = {
  slow: 0.8,
  normal: 1.0,
  fast: 1.2,
} as const;

const ABBREVIATION_MAP: Record<string, string> = {
  tbsp: "tablespoon",
  tsp: "teaspoon",
  oz: "ounce",
  lb: "pound",
  qt: "quart",
  pt: "pint",
  gal: "gallon",
  ml: "milliliter",
  cl: "centiliter",
  dl: "deciliter",
  l: "liter",
  g: "gram",
  kg: "kilogram",
  mg: "milligram",
  f: "fahrenheit",
  c: "celsius",
  min: "minute",
  hr: "hour",
  sec: "second",
};

const FRACTION_MAP: Record<string, string> = {
  "1/2": "one half",
  "1/3": "one third",
  "2/3": "two thirds",
  "1/4": "one quarter",
  "3/4": "three quarters",
  "1/5": "one fifth",
  "2/5": "two fifths",
  "3/5": "three fifths",
  "4/5": "four fifths",
  "1/6": "one sixth",
  "5/6": "five sixths",
  "1/8": "one eighth",
  "3/8": "three eighths",
  "5/8": "five eighths",
  "7/8": "seven eighths",
};

/**
 * Process text to make it more suitable for text-to-speech
 * Strips markdown, converts fractions, and expands abbreviations
 */
function processTextForSpeech(text: string): string {
  let processed = text;

  // Strip markdown bold (**text** or __text__)
  processed = processed.replace(/(\*\*|__)(.*?)\1/g, "$2");

  // Strip markdown italic (*text* or _text_)
  processed = processed.replace(/(\*|_)(.*?)\1/g, "$2");

  // Strip markdown headers (# text)
  processed = processed.replace(/^#+\s+/gm, "");

  // Strip markdown links [text](url)
  processed = processed.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

  // Strip markdown code `text`
  processed = processed.replace(/`([^`]+)`/g, "$1");

  // Strip markdown lists (-, *, +)
  processed = processed.replace(/^[\*\-\+]\s+/gm, "");

  // Convert fractions to spoken form
  Object.entries(FRACTION_MAP).forEach(([fraction, spoken]) => {
    const regex = new RegExp(`\\b${fraction.replace("/", "\\/")}\\b`, "g");
    processed = processed.replace(regex, spoken);
  });

  // Expand cooking abbreviations
  Object.entries(ABBREVIATION_MAP).forEach(([abbr, full]) => {
    // Match whole word with optional period and optional 's' for plural
    const regex = new RegExp(`\\b${abbr}\\.?s?\\b`, "gi");
    processed = processed.replace(regex, (match) => {
      const isPlural = match.toLowerCase().endsWith("s");
      return isPlural ? `${full}s` : full;
    });
  });

  // Handle degree symbols
  processed = processed.replace(/(\d+)\s*°([FC])/g, "$1 degrees $2");

  return processed.trim();
}

/**
 * Get the preferred voice for natural speech
 * Prioritizes custom voice name if provided, otherwise uses system defaults
 */
function getPreferredVoice(
  voices: SpeechSynthesisVoice[],
  voiceName?: string
): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null;

  // If voiceName is specified, try to find it
  if (voiceName && voiceName.trim()) {
    const requestedVoice = voices.find((v) =>
      v.name.toLowerCase().includes(voiceName.toLowerCase())
    );
    if (requestedVoice) return requestedVoice;
  }

  // Preferred voice names in order of preference
  const preferredNames = [
    "Google US English",
    "Google UK English Female",
    "Google UK English Male",
    "Samantha",
    "Alex",
    "Karen",
  ];

  // Try to find a preferred voice
  for (const name of preferredNames) {
    const voice = voices.find((v) => v.name === name);
    if (voice) return voice;
  }

  // Fallback to first English voice
  const englishVoice = voices.find((v) => v.lang.startsWith("en"));
  if (englishVoice) return englishVoice;

  // Last resort: first available voice
  return voices[0];
}

/**
 * Hook for reading text aloud using the Web Speech API
 *
 * Provides text-to-speech functionality with configurable speed,
 * markdown stripping, and cooking-specific text processing.
 *
 * @example
 * ```tsx
 * const { speak, stop, isSpeaking, isSupported } = useVoiceReadout({ speed: "normal" });
 *
 * <button onClick={() => speak("Preheat oven to 350°F")}>
 *   Read Step
 * </button>
 * ```
 */
export function useVoiceReadout(options: VoiceReadoutOptions = {}): VoiceReadoutReturn {
  const {
    speed = "normal",
    enabled = true,
    voiceName,
    pitch = 1.0,
    rate: customRate,
    volume = 1.0,
  } = options;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // Check if SpeechSynthesis is supported
  useEffect(() => {
    const supported = typeof window !== "undefined" && "speechSynthesis" in window;
    setIsSupported(supported);

    if (!supported) return;

    // Load voices
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      voiceRef.current = getPreferredVoice(voices, voiceName);
    };

    // Voices might load asynchronously
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, [voiceName]);

  // Stop speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Update speaking state
  useEffect(() => {
    if (!isSupported) return;

    const handleEnd = () => setIsSpeaking(false);
    const handleStart = () => setIsSpeaking(true);

    // Add event listeners to current utterance if it exists
    const utterance = utteranceRef.current;
    if (utterance) {
      utterance.addEventListener("end", handleEnd);
      utterance.addEventListener("start", handleStart);

      return () => {
        utterance.removeEventListener("end", handleEnd);
        utterance.removeEventListener("start", handleStart);
      };
    }
  }, [isSupported, utteranceRef.current]);

  const speak = useCallback(
    (text: string) => {
      if (!isSupported || !enabled || !text.trim()) return;

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      // Process text for better speech
      const processedText = processTextForSpeech(text);

      // Create new utterance
      const utterance = new SpeechSynthesisUtterance(processedText);

      // Use custom rate if provided, otherwise use speed preset
      utterance.rate = customRate !== undefined ? customRate : SPEED_MAP[speed];

      // Apply custom pitch and volume
      utterance.pitch = pitch;
      utterance.volume = volume;

      // Set preferred voice if available
      if (voiceRef.current) {
        utterance.voice = voiceRef.current;
      }

      // Update state handlers
      utterance.addEventListener("end", () => setIsSpeaking(false));
      utterance.addEventListener("error", () => setIsSpeaking(false));
      utterance.addEventListener("start", () => setIsSpeaking(true));

      // Store reference
      utteranceRef.current = utterance;

      // Speak
      window.speechSynthesis.speak(utterance);
    },
    [isSupported, enabled, speed, customRate, pitch, volume]
  );

  const stop = useCallback(() => {
    if (!isSupported) return;

    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
  };
}
