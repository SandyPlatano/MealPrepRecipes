"use client";

import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  duration: number;
}

const COLORS = [
  "#f87171", // red
  "#fb923c", // orange
  "#facc15", // yellow
  "#4ade80", // green
  "#60a5fa", // blue
  "#a78bfa", // purple
  "#f472b6", // pink
];

interface ConfettiProps {
  active: boolean;
  duration?: number; // How long confetti falls (ms)
  pieces?: number; // Number of confetti pieces
  className?: string;
}

export function Confetti({
  active,
  duration = 3000,
  pieces = 50,
  className,
}: ConfettiProps) {
  const [confettiPieces, setConfettiPieces] = useState<ConfettiPiece[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Track when component is mounted (client-side only)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Only generate random values on the client after mount
    if (!isMounted) return;

    if (active) {
      // Generate confetti pieces (safe to use Math.random() after mount)
      const newPieces: ConfettiPiece[] = Array.from({ length: pieces }, (_, i) => ({
        id: i,
        x: Math.random() * 100, // Random horizontal position (%)
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: Math.random() * 500, // Random delay up to 500ms
        duration: 2000 + Math.random() * 1000, // 2-3s fall time
      }));

      setConfettiPieces(newPieces);
      setIsVisible(true);

      // Clean up after duration
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => setConfettiPieces([]), 500); // Allow fade out
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [active, duration, pieces, isMounted]);

  if (confettiPieces.length === 0) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 pointer-events-none z-50 overflow-hidden transition-opacity duration-500",
        isVisible ? "opacity-100" : "opacity-0",
        className
      )}
    >
      {confettiPieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute w-3 h-3 rounded-sm animate-confetti-fall"
          style={{
            left: `${piece.x}%`,
            top: "-20px",
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}ms`,
            animationDuration: `${piece.duration}ms`,
          }}
        />
      ))}

      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg) scale(0.5);
            opacity: 0;
          }
        }
        .animate-confetti-fall {
          animation: confetti-fall ease-out forwards;
        }
      `}</style>
    </div>
  );
}

/**
 * Hook to manage confetti state
 */
export function useConfetti() {
  const [showConfetti, setShowConfetti] = useState(false);

  const triggerConfetti = useCallback(() => {
    setShowConfetti(true);
    // Auto-reset after animation
    setTimeout(() => setShowConfetti(false), 100);
  }, []);

  return { showConfetti, triggerConfetti };
}
