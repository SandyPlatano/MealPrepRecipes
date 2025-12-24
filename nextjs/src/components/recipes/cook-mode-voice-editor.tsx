"use client";

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mic, X, Play, Volume2, AlertCircle, RotateCcw } from "lucide-react";
import type { VoiceCommandMapping, CookModeVoiceSettings, CookModeAudioSettings, VoiceCommandAction, AcknowledgmentSound, TimerSoundType } from "@/types/settings";
import { DEFAULT_VOICE_COMMANDS, DEFAULT_WAKE_WORDS } from "@/lib/default-voice-commands";

interface CookModeVoiceEditorProps {
  voiceSettings: CookModeVoiceSettings;
  audioSettings: CookModeAudioSettings;
  onVoiceSettingsChange: (settings: CookModeVoiceSettings) => void;
  onAudioSettingsChange: (settings: CookModeAudioSettings) => void;
}

// Browser compatibility interfaces
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
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => void) | null;
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

// Browser compatibility check
const isSpeechSupported = typeof window !== "undefined" &&
  !!(window.SpeechRecognition || window.webkitSpeechRecognition);

const isTTSSupported = typeof window !== "undefined" && "speechSynthesis" in window;

// Command labels for display
const COMMAND_LABELS: Record<VoiceCommandAction, { title: string; description: string }> = {
  nextStep: { title: "Next Step", description: "Advance to the next cooking step" },
  prevStep: { title: "Previous Step", description: "Go back to the previous step" },
  setTimer: { title: "Set Timer", description: "Start a countdown timer (e.g., 'timer 5 minutes')" },
  stopTimer: { title: "Stop Timer", description: "Cancel the active timer" },
  repeat: { title: "Repeat", description: "Repeat the current step aloud" },
  readIngredients: { title: "Read Ingredients", description: "Read out the ingredient list" },
  pause: { title: "Pause", description: "Pause voice readout" },
  resume: { title: "Resume", description: "Resume voice readout" },
};

const ACKNOWLEDGMENT_SOUNDS: AcknowledgmentSound[] = ["beep", "chime", "ding", "silent"];
const TIMER_SOUNDS: TimerSoundType[] = ["classic", "gentle", "urgent", "melody"];

export function CookModeVoiceEditor({
  voiceSettings,
  audioSettings,
  onVoiceSettingsChange,
  onAudioSettingsChange,
}: CookModeVoiceEditorProps) {
  // State for UI
  const [newWakeWord, setNewWakeWord] = useState("");
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [isTestingWakeWord, setIsTestingWakeWord] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [newPhrases, setNewPhrases] = useState<Record<VoiceCommandAction, string>>({
    nextStep: "",
    prevStep: "",
    setTimer: "",
    stopTimer: "",
    repeat: "",
    readIngredients: "",
    pause: "",
    resume: "",
  });

  // Load available voices
  useEffect(() => {
    if (!isTTSSupported) return;

    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      setAvailableVoices(voices.filter(v => v.lang.startsWith("en")));
    };

    loadVoices();
    speechSynthesis.addEventListener("voiceschanged", loadVoices);

    return () => {
      speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, []);

  // Add wake word
  const handleAddWakeWord = useCallback(() => {
    const trimmed = newWakeWord.trim().toLowerCase();
    if (!trimmed) return;

    if (voiceSettings.wakeWords.includes(trimmed)) {
      setTestResult("Wake word already exists");
      return;
    }

    onVoiceSettingsChange({
      ...voiceSettings,
      wakeWords: [...voiceSettings.wakeWords, trimmed],
    });
    setNewWakeWord("");
    setTestResult(null);
  }, [newWakeWord, voiceSettings, onVoiceSettingsChange]);

  // Remove wake word
  const handleRemoveWakeWord = useCallback((word: string) => {
    if (voiceSettings.wakeWords.length <= 1) {
      setTestResult("At least one wake word is required");
      return;
    }

    onVoiceSettingsChange({
      ...voiceSettings,
      wakeWords: voiceSettings.wakeWords.filter(w => w !== word),
    });
    setTestResult(null);
  }, [voiceSettings, onVoiceSettingsChange]);

  // Test voice recognition (wake word)
  const testVoiceRecognition = useCallback(() => {
    if (!isSpeechSupported) {
      setTestResult("Speech recognition not supported");
      return;
    }

    setIsTestingWakeWord(true);
    setTestResult("Listening... Say a wake word");

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setTestResult(`Heard: "${transcript}"`);
      setIsTestingWakeWord(false);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setTestResult(`Error: ${event.error}`);
      setIsTestingWakeWord(false);
    };

    recognition.onend = () => {
      setIsTestingWakeWord(false);
    };

    recognition.start();

    // Auto-stop after 5 seconds
    setTimeout(() => {
      if (isTestingWakeWord) {
        recognition.stop();
      }
    }, 5000);
  }, [isTestingWakeWord]);

  // Test TTS
  const testVoice = useCallback(() => {
    if (!isTTSSupported) {
      setTestResult("Text-to-speech not supported");
      return;
    }

    setIsTestingVoice(true);
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance("Hello, I'm your cooking assistant. Preheat the oven to 350 degrees.");
    utterance.pitch = audioSettings.ttsPitch;
    utterance.rate = audioSettings.ttsRate;
    utterance.volume = audioSettings.ttsVolume;

    // Set voice
    if (audioSettings.ttsVoice) {
      const voice = availableVoices.find(v => v.name === audioSettings.ttsVoice);
      if (voice) {
        utterance.voice = voice;
      }
    }

    utterance.onend = () => {
      setIsTestingVoice(false);
    };

    utterance.onerror = () => {
      setIsTestingVoice(false);
      setTestResult("Error playing voice");
    };

    speechSynthesis.speak(utterance);
  }, [audioSettings, availableVoices]);

  // Add phrase to command
  const handleAddPhrase = useCallback((action: VoiceCommandAction) => {
    const phrase = newPhrases[action].trim().toLowerCase();
    if (!phrase) return;

    const currentPhrases = voiceSettings.commandMappings[action];
    if (currentPhrases.includes(phrase)) {
      setTestResult("Phrase already exists for this command");
      return;
    }

    onVoiceSettingsChange({
      ...voiceSettings,
      commandMappings: {
        ...voiceSettings.commandMappings,
        [action]: [...currentPhrases, phrase],
      },
    });

    setNewPhrases({ ...newPhrases, [action]: "" });
    setTestResult(null);
  }, [newPhrases, voiceSettings, onVoiceSettingsChange]);

  // Remove phrase from command
  const handleRemovePhrase = useCallback((action: VoiceCommandAction, phrase: string) => {
    const currentPhrases = voiceSettings.commandMappings[action];

    if (currentPhrases.length <= 1) {
      setTestResult("At least one phrase is required per command");
      return;
    }

    onVoiceSettingsChange({
      ...voiceSettings,
      commandMappings: {
        ...voiceSettings.commandMappings,
        [action]: currentPhrases.filter(p => p !== phrase),
      },
    });
    setTestResult(null);
  }, [voiceSettings, onVoiceSettingsChange]);

  // Reset commands to defaults
  const handleResetCommands = useCallback(() => {
    onVoiceSettingsChange({
      ...voiceSettings,
      commandMappings: DEFAULT_VOICE_COMMANDS,
      wakeWords: DEFAULT_WAKE_WORDS,
    });
    setTestResult("Reset to default commands");
  }, [voiceSettings, onVoiceSettingsChange]);

  // Render browser compatibility warning
  if (!isSpeechSupported || !isTTSSupported) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {!isSpeechSupported && !isTTSSupported && "Voice commands and text-to-speech are not supported in this browser."}
          {!isSpeechSupported && isTTSSupported && "Voice recognition is not supported in this browser. Try Chrome or Edge."}
          {isSpeechSupported && !isTTSSupported && "Text-to-speech is not supported in this browser."}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Voice Control Toggle */}
      <Card>
        <CardHeader>
          <CardTitle>Voice Control</CardTitle>
          <CardDescription>Enable hands-free control with voice commands</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="voice-enabled">Enable voice commands</Label>
            <Switch
              id="voice-enabled"
              checked={voiceSettings.enabled}
              onCheckedChange={(enabled) => onVoiceSettingsChange({ ...voiceSettings, enabled })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Wake Words */}
      <Card>
        <CardHeader>
          <CardTitle>Wake Words</CardTitle>
          <CardDescription>Phrases to activate voice commands</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col">
          <div className="flex flex-wrap gap-2">
            {voiceSettings.wakeWords.map((word) => (
              <Badge key={word} variant="secondary" className="gap-1">
                {word}
                <button
                  type="button"
                  onClick={() => handleRemoveWakeWord(word)}
                  className="ml-1 hover:text-destructive"
                  aria-label={`Remove ${word}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Add wake word (e.g., 'hey chef')"
              value={newWakeWord}
              onChange={(e) => setNewWakeWord(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddWakeWord()}
            />
            <Button onClick={handleAddWakeWord} variant="outline">
              Add
            </Button>
          </div>

          <Button onClick={testVoiceRecognition} variant="outline" className="w-full" disabled={isTestingWakeWord}>
            <Mic className="mr-2 h-4 w-4" />
            {isTestingWakeWord ? "Listening..." : "Test Voice Recognition"}
          </Button>

          {testResult && (
            <Alert>
              <AlertDescription>{testResult}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Command Phrases */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Command Phrases</CardTitle>
              <CardDescription>Customize voice command triggers</CardDescription>
            </div>
            <Button onClick={handleResetCommands} variant="outline" size="sm">
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset to Defaults
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {(Object.keys(COMMAND_LABELS) as VoiceCommandAction[]).map((action) => (
              <AccordionItem key={action} value={action}>
                <AccordionTrigger>
                  {COMMAND_LABELS[action].title}
                </AccordionTrigger>
                <AccordionContent className="flex flex-col">
                  <p className="text-sm text-muted-foreground">
                    {COMMAND_LABELS[action].description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {voiceSettings.commandMappings[action].map((phrase) => (
                      <Badge key={phrase} variant="outline" className="gap-1">
                        {phrase}
                        <button
                          type="button"
                          onClick={() => handleRemovePhrase(action, phrase)}
                          className="ml-1 hover:text-destructive"
                          aria-label={`Remove ${phrase}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Add phrase..."
                      value={newPhrases[action]}
                      onChange={(e) => setNewPhrases({ ...newPhrases, [action]: e.target.value })}
                      onKeyDown={(e) => e.key === "Enter" && handleAddPhrase(action)}
                    />
                    <Button onClick={() => handleAddPhrase(action)} variant="outline" size="sm">
                      Add
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* TTS Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Text-to-Speech Settings</CardTitle>
          <CardDescription>Customize how steps are read aloud</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col">
          {/* Voice Selection */}
          <div className="flex flex-col">
            <Label htmlFor="tts-voice">Voice</Label>
            <Select
              value={audioSettings.ttsVoice}
              onValueChange={(value) => onAudioSettingsChange({ ...audioSettings, ttsVoice: value })}
            >
              <SelectTrigger id="tts-voice">
                <SelectValue placeholder="System default" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">System default</SelectItem>
                {availableVoices.map((voice) => (
                  <SelectItem key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Pitch */}
          <div className="flex flex-col">
            <div className="flex justify-between">
              <Label htmlFor="tts-pitch">Pitch</Label>
              <span className="text-sm text-muted-foreground">{audioSettings.ttsPitch.toFixed(1)}</span>
            </div>
            <Slider
              id="tts-pitch"
              min={0.5}
              max={2.0}
              step={0.1}
              value={[audioSettings.ttsPitch]}
              onValueChange={([value]: number[]) => onAudioSettingsChange({ ...audioSettings, ttsPitch: value })}
            />
          </div>

          {/* Rate */}
          <div className="flex flex-col">
            <div className="flex justify-between">
              <Label htmlFor="tts-rate">Speed</Label>
              <span className="text-sm text-muted-foreground">{audioSettings.ttsRate.toFixed(1)}</span>
            </div>
            <Slider
              id="tts-rate"
              min={0.5}
              max={2.0}
              step={0.1}
              value={[audioSettings.ttsRate]}
              onValueChange={([value]: number[]) => onAudioSettingsChange({ ...audioSettings, ttsRate: value })}
            />
          </div>

          {/* Volume */}
          <div className="flex flex-col">
            <div className="flex justify-between">
              <Label htmlFor="tts-volume">Volume</Label>
              <span className="text-sm text-muted-foreground">{Math.round(audioSettings.ttsVolume * 100)}%</span>
            </div>
            <Slider
              id="tts-volume"
              min={0}
              max={1}
              step={0.1}
              value={[audioSettings.ttsVolume]}
              onValueChange={([value]: number[]) => onAudioSettingsChange({ ...audioSettings, ttsVolume: value })}
            />
          </div>

          <Button onClick={testVoice} variant="outline" className="w-full" disabled={isTestingVoice}>
            <Play className="mr-2 h-4 w-4" />
            {isTestingVoice ? "Playing..." : "Test Voice"}
          </Button>
        </CardContent>
      </Card>

      {/* Sound Effects */}
      <Card>
        <CardHeader>
          <CardTitle>Sound Effects</CardTitle>
          <CardDescription>Customize audio feedback</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col">
          {/* Acknowledgment Sound */}
          <div className="flex flex-col">
            <Label htmlFor="ack-sound">Acknowledgment Sound</Label>
            <Select
              value={audioSettings.acknowledgmentSound}
              onValueChange={(value: AcknowledgmentSound) =>
                onAudioSettingsChange({ ...audioSettings, acknowledgmentSound: value })
              }
            >
              <SelectTrigger id="ack-sound">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACKNOWLEDGMENT_SOUNDS.map((sound) => (
                  <SelectItem key={sound} value={sound}>
                    {sound.charAt(0).toUpperCase() + sound.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Timer Sound */}
          <div className="flex flex-col">
            <Label htmlFor="timer-sound">Timer Sound</Label>
            <Select
              value={audioSettings.timerSound}
              onValueChange={(value: TimerSoundType) =>
                onAudioSettingsChange({ ...audioSettings, timerSound: value })
              }
            >
              <SelectTrigger id="timer-sound">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMER_SOUNDS.map((sound) => (
                  <SelectItem key={sound} value={sound}>
                    {sound.charAt(0).toUpperCase() + sound.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Additional Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Settings</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col">
          {/* Command Timeout */}
          <div className="flex flex-col">
            <Label htmlFor="command-timeout">Command Timeout (seconds)</Label>
            <Input
              id="command-timeout"
              type="number"
              min={1}
              max={10}
              value={voiceSettings.commandTimeout}
              onChange={(e) => onVoiceSettingsChange({
                ...voiceSettings,
                commandTimeout: parseInt(e.target.value) || 3,
              })}
            />
            <p className="text-sm text-muted-foreground">
              How long to wait for a command after wake word
            </p>
          </div>

          {/* Confirm Commands */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <Label htmlFor="confirm-commands">Confirm Commands</Label>
              <p className="text-sm text-muted-foreground">Play sound when command is recognized</p>
            </div>
            <Switch
              id="confirm-commands"
              checked={voiceSettings.confirmCommands}
              onCheckedChange={(confirmCommands) =>
                onVoiceSettingsChange({ ...voiceSettings, confirmCommands })
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
