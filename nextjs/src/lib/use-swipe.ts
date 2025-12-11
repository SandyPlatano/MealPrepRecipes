"use client";

import { useState, useCallback, useRef, TouchEvent } from "react";
import { triggerHaptic } from "./haptics";

interface SwipeConfig {
  threshold?: number; // Minimum distance to trigger swipe (default: 50px)
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  enableHaptics?: boolean;
}

interface SwipeState {
  swiping: boolean;
  direction: "left" | "right" | "up" | "down" | null;
  offset: { x: number; y: number };
}

interface SwipeHandlers {
  onTouchStart: (e: TouchEvent) => void;
  onTouchMove: (e: TouchEvent) => void;
  onTouchEnd: (e: TouchEvent) => void;
}

export function useSwipe(config: SwipeConfig = {}): [SwipeState, SwipeHandlers] {
  const {
    threshold = 50,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    enableHaptics = true,
  } = config;

  const [state, setState] = useState<SwipeState>({
    swiping: false,
    direction: null,
    offset: { x: 0, y: 0 },
  });

  const startPos = useRef<{ x: number; y: number } | null>(null);
  const hasTriggeredHaptic = useRef(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    startPos.current = { x: touch.clientX, y: touch.clientY };
    hasTriggeredHaptic.current = false;
    setState({ swiping: true, direction: null, offset: { x: 0, y: 0 } });
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!startPos.current) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - startPos.current.x;
      const deltaY = touch.clientY - startPos.current.y;

      // Determine direction based on larger delta
      let direction: "left" | "right" | "up" | "down" | null = null;
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? "right" : "left";
      } else {
        direction = deltaY > 0 ? "down" : "up";
      }

      // Trigger haptic when threshold is crossed for the first time
      if (
        enableHaptics &&
        !hasTriggeredHaptic.current &&
        (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold)
      ) {
        triggerHaptic("selection");
        hasTriggeredHaptic.current = true;
      }

      setState({
        swiping: true,
        direction,
        offset: { x: deltaX, y: deltaY },
      });
    },
    [threshold, enableHaptics]
  );

  const handleTouchEnd = useCallback(() => {
    if (!startPos.current) return;

    const { offset, direction } = state;

    // Check if swipe exceeded threshold
    if (Math.abs(offset.x) > threshold && (direction === "left" || direction === "right")) {
      if (direction === "left" && onSwipeLeft) {
        if (enableHaptics) triggerHaptic("light");
        onSwipeLeft();
      } else if (direction === "right" && onSwipeRight) {
        if (enableHaptics) triggerHaptic("light");
        onSwipeRight();
      }
    }

    if (Math.abs(offset.y) > threshold && (direction === "up" || direction === "down")) {
      if (direction === "up" && onSwipeUp) {
        if (enableHaptics) triggerHaptic("light");
        onSwipeUp();
      } else if (direction === "down" && onSwipeDown) {
        if (enableHaptics) triggerHaptic("light");
        onSwipeDown();
      }
    }

    // Reset state
    startPos.current = null;
    setState({ swiping: false, direction: null, offset: { x: 0, y: 0 } });
  }, [state, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, enableHaptics]);

  const handlers: SwipeHandlers = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };

  return [state, handlers];
}

/**
 * Simple horizontal swipe hook for common use cases
 */
export function useHorizontalSwipe(
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  options?: { threshold?: number; enableHaptics?: boolean }
) {
  return useSwipe({
    onSwipeLeft,
    onSwipeRight,
    ...options,
  });
}
