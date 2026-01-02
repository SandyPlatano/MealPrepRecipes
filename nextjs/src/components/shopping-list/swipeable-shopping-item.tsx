"use client";

import { useRef, useState, useCallback } from "react";
import { Check } from "lucide-react";
import { triggerHaptic } from "@/lib/haptics";

interface SwipeableShoppingItemProps {
  children: React.ReactNode;
  onSwipeComplete: () => void;
  disabled?: boolean;
  isChecked?: boolean;
}

const SWIPE_THRESHOLD = 100; // pixels to complete swipe
const HAPTIC_THRESHOLD = 50; // pixels to trigger haptic feedback

export function SwipeableShoppingItem({
  children,
  onSwipeComplete,
  disabled = false,
  isChecked = false,
}: SwipeableShoppingItemProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const hasTriggeredHaptic = useRef(false);
  const hasCompletedSwipe = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return;
    const touch = e.touches[0];
    if (!touch) return;
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    hasTriggeredHaptic.current = false;
    hasCompletedSwipe.current = false;
    setIsSwiping(false);
  }, [disabled]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (disabled || touchStartX.current === null || touchStartY.current === null) return;

    const touch = e.touches[0];
    if (!touch) return;

    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = touch.clientY - touchStartY.current;

    // Only allow rightward swipes and ensure horizontal movement is dominant
    if (deltaX > 10 && Math.abs(deltaX) > Math.abs(deltaY)) {
      setIsSwiping(true);
      // Limit swipe to threshold + some extra for visual feedback
      const clampedOffset = Math.min(deltaX, SWIPE_THRESHOLD + 20);
      setSwipeOffset(clampedOffset);

      // Haptic feedback when crossing threshold
      if (clampedOffset >= HAPTIC_THRESHOLD && !hasTriggeredHaptic.current) {
        triggerHaptic("light");
        hasTriggeredHaptic.current = true;
      }

      // Complete swipe when threshold reached
      if (clampedOffset >= SWIPE_THRESHOLD && !hasCompletedSwipe.current) {
        hasCompletedSwipe.current = true;
        triggerHaptic("success");
        onSwipeComplete();
      }
    }
  }, [disabled, onSwipeComplete]);

  const handleTouchEnd = useCallback(() => {
    touchStartX.current = null;
    touchStartY.current = null;
    setIsSwiping(false);
    // Animate back to 0
    setSwipeOffset(0);
  }, []);

  // Don't apply swipe when already checked (could allow uncheck via swipe left, but keeping simple)
  const swipeDisabled = disabled || isChecked;

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {/* Lime green background that reveals on swipe */}
      <div
        className={`absolute inset-y-0 left-0 flex items-center justify-center bg-[#D9F99D] transition-opacity ${
          isSwiping && !swipeDisabled ? "opacity-100" : "opacity-0"
        }`}
        style={{ width: Math.max(swipeOffset, 0) }}
      >
        <Check
          className={`h-6 w-6 text-gray-700 transition-transform ${
            swipeOffset >= SWIPE_THRESHOLD ? "scale-125" : "scale-100"
          }`}
        />
      </div>

      {/* Content that slides */}
      <div
        className={`relative bg-background transition-transform ${
          isSwiping && !swipeDisabled ? "" : "duration-200"
        }`}
        style={{
          transform: swipeDisabled
            ? "translateX(0)"
            : `translateX(${swipeOffset}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
