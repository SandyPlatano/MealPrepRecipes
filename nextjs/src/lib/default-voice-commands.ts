/**
 * Default Voice Command Mappings
 * Users can customize these phrases to match their preferences
 */

import type {
  VoiceCommandMapping,
  VoiceCommandAction,
  CookModeAudioSettings,
  CookModeTimerSettings
} from "@/types/settings";

export const DEFAULT_VOICE_COMMANDS: VoiceCommandMapping = {
  nextStep: ["next", "next step", "continue", "forward", "go", "next one"],
  prevStep: ["back", "previous", "go back", "previous step", "last step", "before"],
  setTimer: ["timer", "set timer", "start timer", "timer for"],
  stopTimer: ["stop timer", "cancel timer", "stop", "clear timer"],
  repeat: ["repeat", "say again", "what", "again", "huh", "pardon", "one more time"],
  readIngredients: ["ingredients", "what do I need", "read ingredients", "list ingredients", "what ingredients"],
  pause: ["pause", "hold", "wait", "hold on", "stop talking"],
  resume: ["resume", "continue", "go ahead", "okay", "keep going", "go on"]
};

/**
 * Check if a transcript matches any phrase in a command's phrase list
 */
export function matchesCommand(
  transcript: string,
  phrases: string[]
): boolean {
  const normalized = transcript.toLowerCase().trim();
  return phrases.some(phrase =>
    normalized.includes(phrase.toLowerCase()) ||
    phrase.toLowerCase().includes(normalized)
  );
}

/**
 * Finds a matching command action from a transcript
 * Uses fuzzy matching to handle natural speech variations
 *
 * @param transcript - The voice transcript to match against
 * @param mappings - Custom command mappings (defaults to DEFAULT_VOICE_COMMANDS)
 * @returns The matched VoiceCommandAction or null if no match
 */
export function findMatchingCommand(
  transcript: string,
  mappings: VoiceCommandMapping = DEFAULT_VOICE_COMMANDS
): VoiceCommandAction | null {
  const normalized = transcript.toLowerCase().trim();

  // Check each command action
  for (const [action, phrases] of Object.entries(mappings) as Array<
    [VoiceCommandAction, string[]]
  >) {
    // Special handling for timer commands - extract minutes
    if (action === "setTimer") {
      // Match patterns like "timer 5 minutes" or "set timer 10"
      const timerMatch = normalized.match(
        /(?:timer|set timer|start timer)\s+(\d+)\s*(?:minute|minutes|min|mins)?/i
      );
      if (timerMatch) {
        return "setTimer";
      }
      continue; // Skip exact phrase matching for timer
    }

    // Check if any phrase matches
    if (matchesCommand(normalized, phrases)) {
      return action;
    }
  }

  return null;
}

/**
 * Extracts minutes from a timer command
 *
 * @param transcript - The voice transcript containing timer command
 * @returns The number of minutes, or null if not found
 */
export function extractTimerMinutes(transcript: string): number | null {
  const normalized = transcript.toLowerCase().trim();

  const timerMatch = normalized.match(
    /(?:timer|set timer|start timer)\s+(\d+)\s*(?:minute|minutes|min|mins)?/i
  );

  if (timerMatch) {
    const minutes = parseInt(timerMatch[1], 10);
    if (!isNaN(minutes) && minutes > 0) {
      return minutes;
    }
  }

  return null;
}

/**
 * Default wake words - users can add their own
 */
export const DEFAULT_WAKE_WORDS = ["hey chef", "okay chef", "yo chef"];

/**
 * Default audio settings
 */
export const DEFAULT_AUDIO_SETTINGS: CookModeAudioSettings = {
  ttsVoice: "",           // Empty = use system default
  ttsPitch: 1.0,
  ttsRate: 1.0,
  ttsVolume: 1.0,
  acknowledgmentSound: "beep",
  timerSound: "classic",
};

/**
 * Default timer settings
 */
export const DEFAULT_TIMER_SETTINGS: CookModeTimerSettings = {
  quickTimerPresets: [1, 3, 5, 10, 15, 20, 30],
  autoDetectTimers: true,
  showTimerInTitle: true,
  vibrationOnComplete: true,
  repeatTimerAlert: false,
};
