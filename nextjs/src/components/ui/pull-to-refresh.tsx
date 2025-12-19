"use client";

import { useState, useRef, useCallback, ReactNode, TouchEvent } from "react";
import { cn } from "@/lib/utils";
import { Loader2, ArrowDown } from "lucide-react";
import { triggerHaptic } from "@/lib/haptics";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  className?: string;
  threshold?: number; // Pull distance to trigger refresh (default: 80px)
  disabled?: boolean;
}

type RefreshState = "idle" | "pulling" | "ready" | "refreshing";

export function PullToRefresh({
  onRefresh,
  children,
  className,
  threshold = 80,
  disabled = false,
}: PullToRefreshProps) {
  const [state, setState] = useState<RefreshState>("idle");
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasTriggeredHaptic = useRef(false);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (disabled || state === "refreshing") return;

      // Only enable pull-to-refresh if we're at the top
      const container = containerRef.current;
      if (!container || container.scrollTop > 0) return;

      startY.current = e.touches[0].clientY;
      hasTriggeredHaptic.current = false;
    },
    [disabled, state]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (disabled || state === "refreshing" || startY.current === null) return;

      const currentY = e.touches[0].clientY;
      const diff = currentY - startY.current;

      // Only pull down, not up
      if (diff < 0) {
        setPullDistance(0);
        setState("idle");
        return;
      }

      // Apply resistance (pull feels heavier as you go)
      const resistance = 0.4;
      const adjustedDiff = diff * resistance;

      setPullDistance(adjustedDiff);
      setState(adjustedDiff >= threshold ? "ready" : "pulling");

      // Haptic feedback when crossing threshold
      if (!hasTriggeredHaptic.current && adjustedDiff >= threshold) {
        triggerHaptic("medium");
        hasTriggeredHaptic.current = true;
      }
    },
    [disabled, state, threshold]
  );

  const handleTouchEnd = useCallback(async () => {
    if (disabled || startY.current === null) return;

    if (state === "ready") {
      setState("refreshing");
      setPullDistance(threshold);
      triggerHaptic("success");

      try {
        await onRefresh();
      } finally {
        setState("idle");
        setPullDistance(0);
      }
    } else {
      setState("idle");
      setPullDistance(0);
    }

    startY.current = null;
  }, [disabled, state, threshold, onRefresh]);

  const indicatorOpacity = Math.min(pullDistance / threshold, 1);
  const indicatorScale = 0.5 + indicatorOpacity * 0.5;

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-auto", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className={cn(
          "absolute left-0 right-0 flex items-center justify-center transition-all duration-200 z-10",
          state === "refreshing" ? "bg-background/80" : ""
        )}
        style={{
          height: `${pullDistance}px`,
          top: 0,
        }}
      >
        {pullDistance > 10 && (
          <div
            className="flex flex-col items-center"
            style={{
              opacity: indicatorOpacity,
              transform: `scale(${indicatorScale})`,
            }}
          >
            {state === "refreshing" ? (
              <Loader2 className="size-6 animate-spin text-primary" />
            ) : (
              <ArrowDown
                className={cn(
                  "size-6 transition-transform duration-200",
                  state === "ready" && "rotate-180 text-primary"
                )}
              />
            )}
            <span className="text-xs text-muted-foreground mt-1">
              {state === "refreshing"
                ? "Refreshing..."
                : state === "ready"
                ? "Release to refresh"
                : "Pull to refresh"}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: state === "idle" ? "transform 0.2s ease-out" : "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}
