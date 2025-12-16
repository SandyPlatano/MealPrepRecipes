"use client";

import { ReactNode } from "react";
import { useScrollDirection } from "@/hooks/use-scroll-direction";

interface ScrollHeaderProps {
  children: ReactNode;
}

export function ScrollHeader({ children }: ScrollHeaderProps) {
  const { isVisible } = useScrollDirection();

  return (
    <header
      className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm transition-all duration-300 ease-out"
      style={{
        transform: isVisible ? "translateY(0)" : "translateY(-100%)",
        opacity: isVisible ? 1 : 0,
      }}
    >
      {children}
    </header>
  );
}
