'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number; // Minimum swipe distance in pixels, default: 50
  enabled?: boolean; // Default: true
  hapticFeedback?: boolean; // Default: true
}

interface SwipeGestureReturn {
  ref: React.RefObject<HTMLDivElement | null>;
  isSwiping: boolean;
}

interface TouchPosition {
  x: number;
  y: number;
  time: number;
}

export function useSwipeGesture(options: SwipeGestureOptions): SwipeGestureReturn {
  const {
    onSwipeLeft,
    onSwipeRight,
    threshold = 50,
    enabled = true,
    hapticFeedback = true,
  } = options;

  const ref = useRef<HTMLDivElement>(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStart = useRef<TouchPosition | null>(null);
  const touchCurrent = useRef<TouchPosition | null>(null);

  const triggerHaptic = useCallback(() => {
    if (hapticFeedback && navigator.vibrate) {
      navigator.vibrate(10); // Short 10ms vibration
    }
  }, [hapticFeedback]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled) return;

    const touch = e.touches[0];
    if (!touch) return;

    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    touchCurrent.current = touchStart.current;
    setIsSwiping(false);
  }, [enabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled || !touchStart.current) return;

    const touch = e.touches[0];
    if (!touch) return;

    touchCurrent.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };

    const deltaX = Math.abs(touchCurrent.current.x - touchStart.current.x);
    const deltaY = Math.abs(touchCurrent.current.y - touchStart.current.y);

    // If horizontal movement is dominant, prevent default to avoid scrolling
    if (deltaX > deltaY && deltaX > 10) {
      setIsSwiping(true);
      e.preventDefault();
    }
  }, [enabled]);

  const handleTouchEnd = useCallback(() => {
    if (!enabled || !touchStart.current || !touchCurrent.current) {
      touchStart.current = null;
      touchCurrent.current = null;
      setIsSwiping(false);
      return;
    }

    const deltaX = touchCurrent.current.x - touchStart.current.x;
    const deltaY = touchCurrent.current.y - touchStart.current.y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Check if swipe meets threshold and is primarily horizontal
    if (absDeltaX > threshold && absDeltaX > absDeltaY) {
      if (deltaX > 0) {
        // Swipe right
        onSwipeRight?.();
        triggerHaptic();
      } else {
        // Swipe left
        onSwipeLeft?.();
        triggerHaptic();
      }
    }

    // Reset touch tracking
    touchStart.current = null;
    touchCurrent.current = null;
    setIsSwiping(false);
  }, [enabled, threshold, onSwipeLeft, onSwipeRight, triggerHaptic]);

  useEffect(() => {
    const element = ref.current;
    if (!element || !enabled) return;

    // Add event listeners with passive: false for touchmove to allow preventDefault
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    element.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    ref,
    isSwiping,
  };
}
