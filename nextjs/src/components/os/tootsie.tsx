"use client";

import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// MEAL PREP OS - Tootsie the Owl Mascot
// "How many steps does it take to make this recipe?"
// "ONE... TWO... THREE!" *skips to eating*
// A quirky, chaotic, impatient owl who just wants to eat
// ═══════════════════════════════════════════════════════════════════════════════

export type TootsieExpression =
  | "neutral"    // Default friendly look
  | "excited"    // Wide eyes, meal time approaching!
  | "hungry"     // Drooling, looking at recipes
  | "sleepy"     // Droopy eyes, long cook times
  | "confused"   // Head tilt, no meals planned
  | "counting"   // One... two... three!
  | "eating"     // Nom nom nom
  | "celebrate"; // Wings up, cooking complete!

interface TootsieProps {
  /** Current expression/mood */
  expression?: TootsieExpression;
  /** Size of the mascot */
  size?: "sm" | "md" | "lg" | "xl";
  /** Whether to animate */
  animate?: boolean;
  /** Optional speech bubble text */
  speech?: string;
  /** Additional class names */
  className?: string;
  /** Click handler */
  onClick?: () => void;
}

// Size mappings
const sizes = {
  sm: { container: "w-8 h-8", speech: "text-[9px]" },
  md: { container: "w-16 h-16", speech: "text-[10px]" },
  lg: { container: "w-24 h-24", speech: "text-[11px]" },
  xl: { container: "w-32 h-32", speech: "text-[12px]" },
};

export function Tootsie({
  expression = "neutral",
  size = "md",
  animate = true,
  speech,
  className,
  onClick,
}: TootsieProps) {
  const sizeConfig = sizes[size];
  const [blink, setBlink] = useState(false);

  // Random blinking
  useEffect(() => {
    if (!animate || expression === "sleepy") return;

    const blinkInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        setBlink(true);
        setTimeout(() => setBlink(false), 150);
      }
    }, 2000);

    return () => clearInterval(blinkInterval);
  }, [animate, expression]);

  return (
    <div
      className={cn(
        "relative inline-flex flex-col items-center",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {/* Speech Bubble */}
      {speech && (
        <div
          className={cn(
            "absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full",
            "bg-food-butter text-os-text",
            "px-2 py-1 rounded",
            "border-2 border-os-darkest",
            "font-system whitespace-nowrap",
            sizeConfig.speech,
            // Speech bubble tail
            "after:absolute after:top-full after:left-1/2 after:-translate-x-1/2",
            "after:border-8 after:border-transparent after:border-t-food-butter"
          )}
        >
          {speech}
        </div>
      )}

      {/* Owl SVG */}
      <div
        className={cn(
          sizeConfig.container,
          "os-pixel-perfect",
          animate && expression === "excited" && "animate-os-bounce",
          animate && expression === "celebrate" && "animate-os-bounce"
        )}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          style={{ imageRendering: "pixelated" }}
        >
          {/* ═══ Body ═══ */}
          <rect x="8" y="12" width="16" height="16" fill="#8B5A2B" />
          <rect x="10" y="14" width="12" height="12" fill="#A0522D" />

          {/* ═══ Belly ═══ */}
          <rect x="12" y="18" width="8" height="8" fill="#DEB887" />

          {/* ═══ Head ═══ */}
          <rect x="6" y="4" width="20" height="14" fill="#8B5A2B" />
          <rect x="8" y="6" width="16" height="10" fill="#A0522D" />

          {/* ═══ Ear Tufts ═══ */}
          <rect x="6" y="2" width="4" height="4" fill="#8B5A2B" />
          <rect x="22" y="2" width="4" height="4" fill="#8B5A2B" />

          {/* ═══ Chef Hat (slightly askew) ═══ */}
          <rect x="7" y="0" width="16" height="6" fill="#FFFFFF" />
          <rect x="9" y="-2" width="12" height="4" fill="#FFFFFF" />
          <rect x="5" y="4" width="2" height="2" fill="#FFFFFF" />

          {/* ═══ Eyes ═══ */}
          {renderEyes(expression, blink)}

          {/* ═══ Beak ═══ */}
          <rect x="14" y="12" width="4" height="3" fill="#FFA500" />
          <rect x="15" y="15" width="2" height="1" fill="#FF8C00" />

          {/* ═══ Wings ═══ */}
          {renderWings(expression)}

          {/* ═══ Feet ═══ */}
          <rect x="10" y="28" width="4" height="2" fill="#FFA500" />
          <rect x="18" y="28" width="4" height="2" fill="#FFA500" />

          {/* ═══ Expression-specific additions ═══ */}
          {renderExpressionDetails(expression)}
        </svg>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Eye rendering based on expression
// ═══════════════════════════════════════════════════════════════════════════════

function renderEyes(expression: TootsieExpression, blink: boolean) {
  // Blinking overrides expression temporarily
  if (blink) {
    return (
      <>
        <rect x="9" y="9" width="5" height="1" fill="#000000" />
        <rect x="18" y="9" width="5" height="1" fill="#000000" />
      </>
    );
  }

  switch (expression) {
    case "sleepy":
      return (
        <>
          {/* Half-closed eyes */}
          <rect x="9" y="8" width="5" height="3" fill="#FFFFFF" />
          <rect x="18" y="8" width="5" height="3" fill="#FFFFFF" />
          <rect x="9" y="8" width="5" height="2" fill="#000000" />
          <rect x="18" y="8" width="5" height="2" fill="#000000" />
        </>
      );

    case "excited":
    case "celebrate":
      return (
        <>
          {/* Big sparkly eyes */}
          <rect x="8" y="6" width="7" height="7" fill="#FFFFFF" />
          <rect x="17" y="6" width="7" height="7" fill="#FFFFFF" />
          <rect x="10" y="8" width="3" height="3" fill="#000000" />
          <rect x="19" y="8" width="3" height="3" fill="#000000" />
          {/* Sparkle */}
          <rect x="9" y="7" width="1" height="1" fill="#FFFFFF" />
          <rect x="18" y="7" width="1" height="1" fill="#FFFFFF" />
        </>
      );

    case "hungry":
      return (
        <>
          {/* Heart eyes */}
          <rect x="9" y="7" width="5" height="5" fill="#FF6347" />
          <rect x="18" y="7" width="5" height="5" fill="#FF6347" />
          <rect x="10" y="6" width="1" height="1" fill="#FF6347" />
          <rect x="12" y="6" width="1" height="1" fill="#FF6347" />
          <rect x="19" y="6" width="1" height="1" fill="#FF6347" />
          <rect x="21" y="6" width="1" height="1" fill="#FF6347" />
        </>
      );

    case "confused":
      return (
        <>
          {/* One eye squinted */}
          <rect x="9" y="7" width="5" height="5" fill="#FFFFFF" />
          <rect x="18" y="8" width="5" height="3" fill="#FFFFFF" />
          <rect x="10" y="8" width="3" height="3" fill="#000000" />
          <rect x="19" y="9" width="3" height="1" fill="#000000" />
          {/* Question mark above head */}
        </>
      );

    case "counting":
      return (
        <>
          {/* Focused eyes looking to side */}
          <rect x="9" y="7" width="5" height="5" fill="#FFFFFF" />
          <rect x="18" y="7" width="5" height="5" fill="#FFFFFF" />
          <rect x="12" y="9" width="2" height="2" fill="#000000" />
          <rect x="21" y="9" width="2" height="2" fill="#000000" />
        </>
      );

    case "eating":
      return (
        <>
          {/* Happy closed eyes */}
          <rect x="9" y="9" width="5" height="1" fill="#000000" />
          <rect x="18" y="9" width="5" height="1" fill="#000000" />
          <rect x="9" y="8" width="1" height="1" fill="#000000" />
          <rect x="13" y="8" width="1" height="1" fill="#000000" />
          <rect x="18" y="8" width="1" height="1" fill="#000000" />
          <rect x="22" y="8" width="1" height="1" fill="#000000" />
        </>
      );

    default: // neutral
      return (
        <>
          {/* Normal round eyes */}
          <rect x="9" y="7" width="5" height="5" fill="#FFFFFF" />
          <rect x="18" y="7" width="5" height="5" fill="#FFFFFF" />
          <rect x="10" y="8" width="3" height="3" fill="#000000" />
          <rect x="19" y="8" width="3" height="3" fill="#000000" />
        </>
      );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Wing rendering based on expression
// ═══════════════════════════════════════════════════════════════════════════════

function renderWings(expression: TootsieExpression) {
  if (expression === "celebrate") {
    // Wings up!
    return (
      <>
        <rect x="4" y="10" width="4" height="8" fill="#8B5A2B" />
        <rect x="24" y="10" width="4" height="8" fill="#8B5A2B" />
        <rect x="2" y="8" width="4" height="4" fill="#8B5A2B" />
        <rect x="26" y="8" width="4" height="4" fill="#8B5A2B" />
      </>
    );
  }

  // Normal wings at sides
  return (
    <>
      <rect x="4" y="14" width="4" height="8" fill="#8B5A2B" />
      <rect x="24" y="14" width="4" height="8" fill="#8B5A2B" />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Expression-specific details (drool, sweat, etc.)
// ═══════════════════════════════════════════════════════════════════════════════

function renderExpressionDetails(expression: TootsieExpression) {
  switch (expression) {
    case "hungry":
      // Drool
      return (
        <>
          <rect x="15" y="16" width="1" height="2" fill="#87CEEB" />
          <rect x="15" y="18" width="1" height="1" fill="#87CEEB" />
        </>
      );

    case "confused":
      // Question mark
      return (
        <>
          <rect x="26" y="2" width="3" height="1" fill="#FFFFFF" />
          <rect x="28" y="3" width="1" height="2" fill="#FFFFFF" />
          <rect x="27" y="5" width="1" height="1" fill="#FFFFFF" />
          <rect x="27" y="7" width="1" height="1" fill="#FFFFFF" />
        </>
      );

    case "eating":
      // Food crumbs
      return (
        <>
          <rect x="12" y="16" width="1" height="1" fill="#DEB887" />
          <rect x="19" y="15" width="1" height="1" fill="#DEB887" />
        </>
      );

    case "celebrate":
      // Confetti
      return (
        <>
          <rect x="2" y="4" width="2" height="2" fill="#FF6347" />
          <rect x="28" y="6" width="2" height="2" fill="#568203" />
          <rect x="4" y="0" width="2" height="2" fill="#F0C674" />
          <rect x="26" y="2" width="2" height="2" fill="#ED9121" />
        </>
      );

    default:
      return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Pre-made Tootsie with common expressions
// ═══════════════════════════════════════════════════════════════════════════════

export function TootsieNeutral(props: Omit<TootsieProps, "expression">) {
  return <Tootsie expression="neutral" {...props} />;
}

export function TootsieExcited(props: Omit<TootsieProps, "expression">) {
  return <Tootsie expression="excited" speech="Ooh! Dinner time?!" {...props} />;
}

export function TootsieHungry(props: Omit<TootsieProps, "expression">) {
  return <Tootsie expression="hungry" speech="I'm STARVING..." {...props} />;
}

export function TootsieSleepy(props: Omit<TootsieProps, "expression">) {
  return <Tootsie expression="sleepy" speech="zzz..." {...props} />;
}

export function TootsieConfused(props: Omit<TootsieProps, "expression">) {
  return <Tootsie expression="confused" speech="No meals planned?" {...props} />;
}

export function TootsieCounting(props: Omit<TootsieProps, "expression">) {
  return <Tootsie expression="counting" speech="ONE... TWO... THREE!" {...props} />;
}

export function TootsieEating(props: Omit<TootsieProps, "expression">) {
  return <Tootsie expression="eating" speech="*nom nom nom*" {...props} />;
}

export function TootsieCelebrate(props: Omit<TootsieProps, "expression">) {
  return <Tootsie expression="celebrate" speech="WOOHOO!" {...props} />;
}

export default Tootsie;
