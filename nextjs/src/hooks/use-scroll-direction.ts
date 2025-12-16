"use client";

import { useState, useEffect, useRef } from "react";

interface ScrollState {
  isVisible: boolean;
  isAtTop: boolean;
  direction: "up" | "down";
}

export function useScrollDirection(threshold: number = 10): ScrollState {
  const [scrollState, setScrollState] = useState<ScrollState>({
    isVisible: true,
    isAtTop: true,
    direction: "down",
  });

  const lastScrollYRef = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const isAtTop = currentScrollY < 50;

          // Determine scroll direction
          const direction =
            currentScrollY > lastScrollYRef.current ? "down" : "up";

          // Calculate scroll delta
          const scrollDelta = Math.abs(
            currentScrollY - lastScrollYRef.current
          );

          // Only update if we've scrolled more than threshold
          if (scrollDelta > threshold) {
            setScrollState((prev) => {
              // At top, always show
              if (isAtTop) {
                return { ...prev, isVisible: true, isAtTop: true };
              }

              // Scrolling up, show header
              if (direction === "up") {
                return {
                  isVisible: true,
                  isAtTop: false,
                  direction: "up",
                };
              }

              // Scrolling down, hide header
              return {
                isVisible: false,
                isAtTop: false,
                direction: "down",
              };
            });

            lastScrollYRef.current = currentScrollY;
          }

          ticking.current = false;
        });

        ticking.current = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [threshold]);

  return scrollState;
}
