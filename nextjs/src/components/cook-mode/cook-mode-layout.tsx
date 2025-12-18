"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface CookModeLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Full-screen optimized layout for cooking mode
 * - Large fonts for kitchen visibility
 * - Keeps screen awake using wakeLock API
 * - High contrast for readability
 */
export function CookModeLayout({ children, className }: CookModeLayoutProps) {
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);

  useEffect(() => {
    // Request wake lock to keep screen on during cooking
    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator) {
          const lock = await navigator.wakeLock.request("screen");
          setWakeLock(lock);

          // Re-acquire wake lock if the page becomes visible again
          const handleVisibilityChange = async () => {
            if (document.visibilityState === "visible" && wakeLock === null) {
              const newLock = await navigator.wakeLock.request("screen");
              setWakeLock(newLock);
            }
          };

          document.addEventListener("visibilitychange", handleVisibilityChange);

          return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
          };
        }
      } catch (err) {
        console.error("Wake Lock error:", err);
      }
    };

    requestWakeLock();

    // Release wake lock on unmount
    return () => {
      if (wakeLock) {
        wakeLock.release().catch(console.error);
      }
    };
  }, [wakeLock]);

  return (
    <div
      className={cn(
        "min-h-screen bg-background text-foreground",
        "flex flex-col",
        "cook-mode-layout",
        className
      )}
    >
      {children}
    </div>
  );
}
