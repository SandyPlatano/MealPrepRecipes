/**
 * Web Audio API sound generator for UI feedback sounds
 * Generates sounds programmatically without requiring audio files
 */

import type { SoundPreset } from "@/types/user-preferences-v2";

// Singleton AudioContext (created lazily to comply with autoplay policies)
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  // Resume if suspended (browser autoplay policy)
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  return audioContext;
}

/**
 * Play a sound preset at the given volume
 * @param sound - The sound preset to play
 * @param volume - Volume from 0-100
 */
export function playSound(sound: SoundPreset, volume: number = 50): void {
  if (sound === "none" || typeof window === "undefined") return;

  const ctx = getAudioContext();
  const masterGain = ctx.createGain();
  masterGain.gain.value = volume / 100;
  masterGain.connect(ctx.destination);

  switch (sound) {
    case "pop":
      playPop(ctx, masterGain);
      break;
    case "click":
      playClick(ctx, masterGain);
      break;
    case "tick":
      playTick(ctx, masterGain);
      break;
    case "ping":
      playPing(ctx, masterGain);
      break;
    case "ding":
      playDing(ctx, masterGain);
      break;
    case "chime":
      playChime(ctx, masterGain);
      break;
    case "bell":
      playBell(ctx, masterGain);
      break;
    case "whoosh":
      playWhoosh(ctx, masterGain);
      break;
    case "success":
      playSuccess(ctx, masterGain);
      break;
    case "fanfare":
      playFanfare(ctx, masterGain);
      break;
    case "tada":
      playTada(ctx, masterGain);
      break;
    default:
      // Unknown sound, play a simple beep
      playPing(ctx, masterGain);
  }
}

// ============================================================================
// Individual Sound Implementations
// ============================================================================

/** Short bubble pop sound */
function playPop(ctx: AudioContext, output: GainNode): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(400, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.1);

  gain.gain.setValueAtTime(0.5, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

  osc.connect(gain);
  gain.connect(output);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.1);
}

/** Quick click sound */
function playClick(ctx: AudioContext, output: GainNode): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "square";
  osc.frequency.setValueAtTime(1000, ctx.currentTime);

  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.03);

  osc.connect(gain);
  gain.connect(output);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.03);
}

/** Soft tick sound */
function playTick(ctx: AudioContext, output: GainNode): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(800, ctx.currentTime);

  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

  osc.connect(gain);
  gain.connect(output);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.05);
}

/** High-pitched ping notification */
function playPing(ctx: AudioContext, output: GainNode): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(880, ctx.currentTime);

  gain.gain.setValueAtTime(0.4, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

  osc.connect(gain);
  gain.connect(output);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.3);
}

/** Classic ding sound (two tones) */
function playDing(ctx: AudioContext, output: GainNode): void {
  [523.25, 659.25].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);

    gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.1);
    gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + i * 0.1 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.4);

    osc.connect(gain);
    gain.connect(output);

    osc.start(ctx.currentTime + i * 0.1);
    osc.stop(ctx.currentTime + i * 0.1 + 0.4);
  });
}

/** Musical chime (three ascending notes) */
function playChime(ctx: AudioContext, output: GainNode): void {
  [523.25, 659.25, 783.99].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);

    gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.15);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + i * 0.15 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.5);

    osc.connect(gain);
    gain.connect(output);

    osc.start(ctx.currentTime + i * 0.15);
    osc.stop(ctx.currentTime + i * 0.15 + 0.5);
  });
}

/** Rich bell sound with harmonics */
function playBell(ctx: AudioContext, output: GainNode): void {
  const fundamental = 440;
  const harmonics = [1, 2, 2.4, 3, 4.2, 5.4];
  const amplitudes = [1, 0.6, 0.4, 0.25, 0.2, 0.15];

  harmonics.forEach((harmonic, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(fundamental * harmonic, ctx.currentTime);

    gain.gain.setValueAtTime(amplitudes[i] * 0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);

    osc.connect(gain);
    gain.connect(output);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.5);
  });
}

/** Swoosh/whoosh sound using filtered noise */
function playWhoosh(ctx: AudioContext, output: GainNode): void {
  const bufferSize = ctx.sampleRate * 0.3;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(1000, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.3);
  filter.Q.value = 1;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(output);

  noise.start(ctx.currentTime);
}

/** Success sound (ascending arpeggio) */
function playSuccess(ctx: AudioContext, output: GainNode): void {
  // C major arpeggio
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);

    gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.08);
    gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + i * 0.08 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.3);

    osc.connect(gain);
    gain.connect(output);

    osc.start(ctx.currentTime + i * 0.08);
    osc.stop(ctx.currentTime + i * 0.08 + 0.3);
  });
}

/** Fanfare sound (triumphant brass-like) */
function playFanfare(ctx: AudioContext, output: GainNode): void {
  // Triumphant chord progression
  const notes = [
    { freq: 261.63, time: 0 },     // C
    { freq: 329.63, time: 0 },     // E
    { freq: 392.00, time: 0 },     // G
    { freq: 523.25, time: 0.15 },  // C (octave)
    { freq: 659.25, time: 0.15 },  // E (octave)
    { freq: 783.99, time: 0.15 },  // G (octave)
  ];

  notes.forEach(({ freq, time }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Sawtooth for brassy sound
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(freq, ctx.currentTime + time);

    // Filter for warmth
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 2000;

    gain.gain.setValueAtTime(0, ctx.currentTime + time);
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + time + 0.05);
    gain.gain.setValueAtTime(0.15, ctx.currentTime + time + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + time + 0.8);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(output);

    osc.start(ctx.currentTime + time);
    osc.stop(ctx.currentTime + time + 0.8);
  });
}

/** Tada celebration sound */
function playTada(ctx: AudioContext, output: GainNode): void {
  // Quick ascending flourish followed by a chord
  const flourish = [392, 440, 493.88, 523.25]; // G, A, B, C

  flourish.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.05);

    gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.05 + 0.15);

    osc.connect(gain);
    gain.connect(output);

    osc.start(ctx.currentTime + i * 0.05);
    osc.stop(ctx.currentTime + i * 0.05 + 0.15);
  });

  // Final chord
  const chordTime = 0.25;
  [523.25, 659.25, 783.99].forEach((freq) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime + chordTime);

    gain.gain.setValueAtTime(0, ctx.currentTime + chordTime);
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + chordTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + chordTime + 0.6);

    osc.connect(gain);
    gain.connect(output);

    osc.start(ctx.currentTime + chordTime);
    osc.stop(ctx.currentTime + chordTime + 0.6);
  });
}
