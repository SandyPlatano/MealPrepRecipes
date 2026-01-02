"use client";

import { useEffect, useRef } from "react";
import { triggerHaptic } from "@/lib/haptics";

export interface UseCelebrationOptions {
  /** Number of checked items */
  checkedCount: number;
  /** Total number of items */
  totalCount: number;
  /** Callback to trigger confetti */
  setShowConfetti: (show: boolean) => void;
}

/**
 * Hook for triggering celebration (confetti + haptic) when all items are checked
 *
 * Only triggers when transitioning from incomplete to complete state,
 * not on initial load or when items are unchecked.
 *
 * @example
 * ```tsx
 * useCelebration({
 *   checkedCount: state.checkedCount,
 *   totalCount: state.totalCount,
 *   setShowConfetti: state.setShowConfetti,
 * });
 * ```
 */
export function useCelebration({
  checkedCount,
  totalCount,
  setShowConfetti,
}: UseCelebrationOptions): void {
  const prevCheckedCountRef = useRef<number | null>(null);

  useEffect(() => {
    const allChecked = checkedCount === totalCount && totalCount > 0;
    const wasNotAllChecked =
      prevCheckedCountRef.current !== null &&
      prevCheckedCountRef.current < totalCount;

    if (allChecked && wasNotAllChecked) {
      setShowConfetti(true);
      triggerHaptic("success");
      // Brief flash for the confetti component to trigger
      setTimeout(() => setShowConfetti(false), 100);
    }

    prevCheckedCountRef.current = checkedCount;
  }, [checkedCount, totalCount, setShowConfetti]);
}
