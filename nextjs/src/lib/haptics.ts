/**
 * Haptic feedback utility for mobile devices
 * Uses the Web Vibration API when available
 */

type HapticType = "light" | "medium" | "heavy" | "success" | "error" | "selection";

const HAPTIC_PATTERNS: Record<HapticType, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 30,
  success: [10, 50, 10],
  error: [50, 30, 50],
  selection: 5,
};

/**
 * Trigger haptic feedback on supported devices
 * @param type - The type of haptic feedback to trigger
 * @returns boolean indicating if haptic was triggered
 */
export function triggerHaptic(type: HapticType = "light"): boolean {
  if (typeof window === "undefined") return false;

  // Check if vibration API is available
  if (!("vibrate" in navigator)) return false;

  try {
    const pattern = HAPTIC_PATTERNS[type];
    navigator.vibrate(pattern);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if haptic feedback is supported on this device
 */
export function isHapticSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "vibrate" in navigator;
}

/**
 * Hook-friendly wrapper for haptic feedback
 * Returns a stable function that can be called to trigger haptics
 */
export function createHapticHandler(type: HapticType = "light") {
  return () => triggerHaptic(type);
}
