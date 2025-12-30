import { useState, useEffect, useCallback, useRef } from "react";
import { useTheme } from "next-themes";

interface UseCookingFullscreenProps {
  themeOverride: "system" | "light" | "dark";
  keepScreenAwake: boolean;
}

export interface CookingFullscreenState {
  isFullscreen: boolean;
  toggleFullscreen: () => Promise<void>;
}

export function useCookingFullscreen({
  themeOverride,
  keepScreenAwake,
}: UseCookingFullscreenProps): CookingFullscreenState {
  const { theme, setTheme } = useTheme();
  const originalThemeRef = useRef(theme);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // Fullscreen not supported
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Handle theme override
  useEffect(() => {
    if (themeOverride !== "system") {
      setTheme(themeOverride);
    }
    // Restore original theme when leaving
    return () => {
      if (originalThemeRef.current && themeOverride !== "system") {
        setTheme(originalThemeRef.current);
      }
    };
  }, [themeOverride, setTheme]);

  // Keep screen awake (conditional on setting)
  useEffect(() => {
    if (!keepScreenAwake) return;

    let wakeLock: { release: () => void } | null = null;

    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator) {
          const nav = navigator as {
            wakeLock?: { request: (type: string) => Promise<{ release: () => void }> };
          };
          if (nav.wakeLock) {
            wakeLock = await nav.wakeLock.request("screen");
          }
        }
      } catch {
        // Wake lock not supported or failed
      }
    };

    requestWakeLock();

    return () => {
      if (wakeLock) {
        wakeLock.release();
      }
    };
  }, [keepScreenAwake]);

  return {
    isFullscreen,
    toggleFullscreen,
  };
}
