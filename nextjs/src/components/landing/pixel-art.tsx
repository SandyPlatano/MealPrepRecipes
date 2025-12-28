'use client';

import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// PIXEL ART COMPONENT LIBRARY
// SVG-based pixel art with CSS animations for a playful, retro-tech aesthetic
// ═══════════════════════════════════════════════════════════════════════════

const PIXEL_SIZE = 4;
const COLORS = {
  dark: '#111111',
  cream: '#FDFBF7',
  orange: '#F97316',
  white: '#FFFFFF',
  gray: '#666666',
  lightGray: '#CCCCCC',
  skin: '#FFCC99',
  skinShadow: '#E5B080',
  hatWhite: '#FFFFFF',
  hatShadow: '#DDDDDD',
};

// Helper to create pixel rectangles
function Pixel({ x, y, color, size = PIXEL_SIZE }: { x: number; y: number; color: string; size?: number }) {
  return <rect x={x * size} y={y * size} width={size} height={size} fill={color} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// PIXEL ICONS - Various food and UI icons in pixel art style
// ─────────────────────────────────────────────────────────────────────────────

type PixelIconType = 'import' | 'calendar' | 'cart' | 'cook' | 'check' | 'arrow';

const iconData: Record<PixelIconType, { x: number; y: number; color: string }[]> = {
  import: [
    // Download arrow
    { x: 3, y: 0, color: COLORS.orange },
    { x: 4, y: 0, color: COLORS.orange },
    { x: 3, y: 1, color: COLORS.orange },
    { x: 4, y: 1, color: COLORS.orange },
    { x: 3, y: 2, color: COLORS.orange },
    { x: 4, y: 2, color: COLORS.orange },
    { x: 1, y: 3, color: COLORS.orange },
    { x: 2, y: 3, color: COLORS.orange },
    { x: 3, y: 3, color: COLORS.orange },
    { x: 4, y: 3, color: COLORS.orange },
    { x: 5, y: 3, color: COLORS.orange },
    { x: 6, y: 3, color: COLORS.orange },
    { x: 2, y: 4, color: COLORS.orange },
    { x: 3, y: 4, color: COLORS.orange },
    { x: 4, y: 4, color: COLORS.orange },
    { x: 5, y: 4, color: COLORS.orange },
    { x: 3, y: 5, color: COLORS.orange },
    { x: 4, y: 5, color: COLORS.orange },
    // Tray
    { x: 0, y: 7, color: COLORS.dark },
    { x: 1, y: 7, color: COLORS.dark },
    { x: 2, y: 7, color: COLORS.dark },
    { x: 3, y: 7, color: COLORS.dark },
    { x: 4, y: 7, color: COLORS.dark },
    { x: 5, y: 7, color: COLORS.dark },
    { x: 6, y: 7, color: COLORS.dark },
    { x: 7, y: 7, color: COLORS.dark },
  ],
  calendar: [
    // Top bar
    { x: 0, y: 0, color: COLORS.dark },
    { x: 1, y: 0, color: COLORS.dark },
    { x: 2, y: 0, color: COLORS.dark },
    { x: 3, y: 0, color: COLORS.dark },
    { x: 4, y: 0, color: COLORS.dark },
    { x: 5, y: 0, color: COLORS.dark },
    { x: 6, y: 0, color: COLORS.dark },
    { x: 7, y: 0, color: COLORS.dark },
    // Rings
    { x: 2, y: 0, color: COLORS.orange },
    { x: 5, y: 0, color: COLORS.orange },
    // Body
    { x: 0, y: 1, color: COLORS.dark },
    { x: 7, y: 1, color: COLORS.dark },
    { x: 0, y: 2, color: COLORS.dark },
    { x: 7, y: 2, color: COLORS.dark },
    // Grid lines
    { x: 1, y: 2, color: COLORS.cream },
    { x: 2, y: 2, color: COLORS.cream },
    { x: 3, y: 2, color: COLORS.cream },
    { x: 4, y: 2, color: COLORS.cream },
    { x: 5, y: 2, color: COLORS.cream },
    { x: 6, y: 2, color: COLORS.cream },
    { x: 0, y: 3, color: COLORS.dark },
    { x: 7, y: 3, color: COLORS.dark },
    { x: 2, y: 3, color: COLORS.gray },
    { x: 3, y: 3, color: COLORS.gray },
    { x: 5, y: 3, color: COLORS.orange },
    { x: 0, y: 4, color: COLORS.dark },
    { x: 7, y: 4, color: COLORS.dark },
    { x: 1, y: 4, color: COLORS.gray },
    { x: 4, y: 4, color: COLORS.gray },
    { x: 6, y: 4, color: COLORS.gray },
    { x: 0, y: 5, color: COLORS.dark },
    { x: 7, y: 5, color: COLORS.dark },
    { x: 2, y: 5, color: COLORS.gray },
    { x: 5, y: 5, color: COLORS.gray },
    { x: 0, y: 6, color: COLORS.dark },
    { x: 7, y: 6, color: COLORS.dark },
    // Bottom
    { x: 0, y: 7, color: COLORS.dark },
    { x: 1, y: 7, color: COLORS.dark },
    { x: 2, y: 7, color: COLORS.dark },
    { x: 3, y: 7, color: COLORS.dark },
    { x: 4, y: 7, color: COLORS.dark },
    { x: 5, y: 7, color: COLORS.dark },
    { x: 6, y: 7, color: COLORS.dark },
    { x: 7, y: 7, color: COLORS.dark },
  ],
  cart: [
    // Basket
    { x: 1, y: 1, color: COLORS.dark },
    { x: 2, y: 1, color: COLORS.dark },
    { x: 3, y: 1, color: COLORS.dark },
    { x: 4, y: 1, color: COLORS.dark },
    { x: 5, y: 1, color: COLORS.dark },
    { x: 6, y: 1, color: COLORS.dark },
    { x: 1, y: 2, color: COLORS.dark },
    { x: 2, y: 2, color: COLORS.orange },
    { x: 3, y: 2, color: COLORS.cream },
    { x: 4, y: 2, color: COLORS.orange },
    { x: 5, y: 2, color: COLORS.cream },
    { x: 6, y: 2, color: COLORS.dark },
    { x: 1, y: 3, color: COLORS.dark },
    { x: 2, y: 3, color: COLORS.cream },
    { x: 3, y: 3, color: COLORS.orange },
    { x: 4, y: 3, color: COLORS.cream },
    { x: 5, y: 3, color: COLORS.orange },
    { x: 6, y: 3, color: COLORS.dark },
    { x: 2, y: 4, color: COLORS.dark },
    { x: 3, y: 4, color: COLORS.dark },
    { x: 4, y: 4, color: COLORS.dark },
    { x: 5, y: 4, color: COLORS.dark },
    // Wheels
    { x: 2, y: 5, color: COLORS.dark },
    { x: 3, y: 5, color: COLORS.gray },
    { x: 4, y: 5, color: COLORS.dark },
    { x: 5, y: 5, color: COLORS.gray },
    { x: 3, y: 6, color: COLORS.dark },
    { x: 5, y: 6, color: COLORS.dark },
    // Handle
    { x: 0, y: 0, color: COLORS.dark },
    { x: 0, y: 1, color: COLORS.dark },
    { x: 0, y: 2, color: COLORS.dark },
    { x: 0, y: 3, color: COLORS.dark },
  ],
  cook: [
    // Pan
    { x: 0, y: 3, color: COLORS.gray },
    { x: 1, y: 3, color: COLORS.gray },
    { x: 2, y: 2, color: COLORS.gray },
    { x: 3, y: 2, color: COLORS.lightGray },
    { x: 4, y: 2, color: COLORS.lightGray },
    { x: 5, y: 2, color: COLORS.lightGray },
    { x: 6, y: 2, color: COLORS.gray },
    { x: 2, y: 3, color: COLORS.gray },
    { x: 3, y: 3, color: COLORS.lightGray },
    { x: 4, y: 3, color: COLORS.orange }, // Food
    { x: 5, y: 3, color: COLORS.lightGray },
    { x: 6, y: 3, color: COLORS.gray },
    { x: 2, y: 4, color: COLORS.gray },
    { x: 3, y: 4, color: COLORS.gray },
    { x: 4, y: 4, color: COLORS.gray },
    { x: 5, y: 4, color: COLORS.gray },
    { x: 6, y: 4, color: COLORS.gray },
    // Steam
    { x: 4, y: 0, color: COLORS.gray },
    { x: 3, y: 1, color: COLORS.gray },
    { x: 5, y: 1, color: COLORS.gray },
  ],
  check: [
    { x: 1, y: 4, color: COLORS.orange },
    { x: 2, y: 5, color: COLORS.orange },
    { x: 3, y: 6, color: COLORS.orange },
    { x: 4, y: 5, color: COLORS.orange },
    { x: 5, y: 4, color: COLORS.orange },
    { x: 6, y: 3, color: COLORS.orange },
    { x: 7, y: 2, color: COLORS.orange },
  ],
  arrow: [
    { x: 0, y: 3, color: COLORS.dark },
    { x: 1, y: 3, color: COLORS.dark },
    { x: 2, y: 3, color: COLORS.dark },
    { x: 3, y: 3, color: COLORS.dark },
    { x: 4, y: 3, color: COLORS.dark },
    { x: 5, y: 3, color: COLORS.dark },
    { x: 4, y: 1, color: COLORS.dark },
    { x: 5, y: 2, color: COLORS.dark },
    { x: 5, y: 4, color: COLORS.dark },
    { x: 4, y: 5, color: COLORS.dark },
  ],
};

export function PixelIcon({
  type,
  size = 32,
  className,
  animated = false,
}: {
  type: PixelIconType;
  size?: number;
  className?: string;
  animated?: boolean;
}) {
  const pixels = iconData[type] || [];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={cn(animated && 'animate-pixel-float', className)}
      style={{ imageRendering: 'pixelated' }}
    >
      {pixels.map((p, i) => (
        <Pixel key={i} x={p.x} y={p.y} color={p.color} />
      ))}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PIXEL STEP - Numbered step with icon for "How it works" section
// ─────────────────────────────────────────────────────────────────────────────

export function PixelStep({
  number,
  icon,
  title,
  description,
  className,
}: {
  number: number;
  icon: PixelIconType;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div className={cn('group text-center', className)}>
      <div className="relative inline-block mb-4">
        {/* Step number badge */}
        <div className="absolute -top-2 -left-2 w-8 h-8 bg-[#F97316] border-2 border-[#111111] flex items-center justify-center font-mono font-bold text-sm text-white z-10 shadow-brutal-sm">
          {number.toString().padStart(2, '0')}
        </div>
        {/* Icon container */}
        <div className="w-20 h-20 bg-[#FDFBF7] border-2 border-[#111111] flex items-center justify-center transition-all duration-200 group-hover:shadow-brutal-md group-hover:-translate-y-1">
          <PixelIcon type={icon} size={40} animated />
        </div>
      </div>
      <h3 className="font-mono font-bold text-lg text-[#111111] dark:text-[#FDFBF7] mb-2">{title}</h3>
      <p className="text-sm text-[#666666] max-w-[180px] mx-auto">{description}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PIXEL DATA PACKET - Animated flowing data visualization
// ─────────────────────────────────────────────────────────────────────────────

export function PixelDataFlow({ className }: { className?: string }) {
  return (
    <div className={cn('relative h-8 overflow-hidden', className)}>
      {/* Track */}
      <div className="absolute inset-y-2 left-0 right-0 border-t-2 border-b-2 border-dashed border-[#111111]/20" />

      {/* Animated packets */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute top-1 animate-data-flow"
          style={{ animationDelay: `${i * 0.6}s` }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24">
            <rect x="4" y="4" width="16" height="16" fill="#F97316" />
            <rect x="8" y="8" width="8" height="8" fill="#FDFBF7" />
          </svg>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PIXEL DECORATION - Background decorative elements
// ─────────────────────────────────────────────────────────────────────────────

export function PixelDecoration({
  variant = 'dots',
  className,
}: {
  variant?: 'dots' | 'corner' | 'line';
  className?: string;
}) {
  if (variant === 'dots') {
    return (
      <svg width="100" height="100" viewBox="0 0 100 100" className={cn('opacity-20', className)}>
        {Array.from({ length: 25 }).map((_, i) => (
          <rect
            key={i}
            x={(i % 5) * 20 + 8}
            y={Math.floor(i / 5) * 20 + 8}
            width="4"
            height="4"
            fill="currentColor"
          />
        ))}
      </svg>
    );
  }

  if (variant === 'corner') {
    return (
      <svg width="40" height="40" viewBox="0 0 40 40" className={className}>
        <rect x="0" y="0" width="8" height="8" fill="currentColor" />
        <rect x="0" y="12" width="4" height="4" fill="currentColor" />
        <rect x="12" y="0" width="4" height="4" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg width="100" height="8" viewBox="0 0 100 8" className={className}>
      {Array.from({ length: 12 }).map((_, i) => (
        <rect key={i} x={i * 8 + 2} y="2" width="4" height="4" fill="currentColor" />
      ))}
    </svg>
  );
}

// =============================================================================
// LOGO LOCKUPS - Icon + Text Combinations
// Using Connected7 (Hat Overlap) as the base icon
// =============================================================================

// Reusable icon component for lockups (Connected7 pattern)
function LockupIcon({ size = 48, colorMode = "dark" }: { size?: number; colorMode?: "dark" | "light" }) {
  // On light backgrounds, use dark colors for the hat so it's visible
  const hatMain = colorMode === "light" ? COLORS.dark : COLORS.hatWhite;
  const hatPleat = colorMode === "light" ? "#666666" : COLORS.hatShadow;
  const bubbleBg = colorMode === "light" ? COLORS.dark : COLORS.cream;
  const outline = colorMode === "light" ? COLORS.cream : COLORS.dark;

  const pixels: { x: number; y: number; color: string }[] = [
    // HAT
    { x: 6, y: 0, color: hatMain },
    { x: 7, y: 0, color: hatMain },
    { x: 8, y: 0, color: hatMain },
    { x: 5, y: 1, color: hatMain },
    { x: 6, y: 1, color: hatMain },
    { x: 7, y: 1, color: hatMain },
    { x: 8, y: 1, color: hatMain },
    { x: 9, y: 1, color: hatMain },
    { x: 3, y: 2, color: hatMain },
    { x: 4, y: 2, color: hatMain },
    { x: 5, y: 2, color: hatMain },
    { x: 6, y: 2, color: hatMain },
    { x: 7, y: 2, color: hatMain },
    { x: 8, y: 2, color: hatMain },
    { x: 9, y: 2, color: hatMain },
    { x: 10, y: 2, color: hatMain },
    { x: 11, y: 2, color: hatMain },
    { x: 4, y: 3, color: hatMain },
    { x: 5, y: 3, color: hatPleat },
    { x: 6, y: 3, color: hatMain },
    { x: 7, y: 3, color: hatPleat },
    { x: 8, y: 3, color: hatMain },
    { x: 9, y: 3, color: hatPleat },
    { x: 10, y: 3, color: hatMain },
    { x: 4, y: 4, color: hatMain },
    { x: 5, y: 4, color: hatPleat },
    { x: 6, y: 4, color: hatMain },
    { x: 7, y: 4, color: hatPleat },
    { x: 8, y: 4, color: hatMain },
    { x: 9, y: 4, color: hatPleat },
    { x: 10, y: 4, color: hatMain },
    // Dark band (always contrasting)
    { x: 4, y: 5, color: outline },
    { x: 5, y: 5, color: outline },
    { x: 6, y: 5, color: outline },
    { x: 7, y: 5, color: outline },
    { x: 8, y: 5, color: outline },
    { x: 9, y: 5, color: outline },
    { x: 10, y: 5, color: outline },
    // Hat pleats EXTEND into bubble (overlap)
    { x: 3, y: 6, color: outline },
    { x: 4, y: 6, color: bubbleBg },
    { x: 5, y: 6, color: hatPleat },
    { x: 6, y: 6, color: bubbleBg },
    { x: 7, y: 6, color: hatPleat },
    { x: 8, y: 6, color: bubbleBg },
    { x: 9, y: 6, color: hatPleat },
    { x: 10, y: 6, color: bubbleBg },
    { x: 11, y: 6, color: outline },
    // BUBBLE body
    { x: 3, y: 7, color: outline },
    { x: 4, y: 7, color: bubbleBg },
    { x: 5, y: 7, color: COLORS.orange },
    { x: 6, y: 7, color: bubbleBg },
    { x: 7, y: 7, color: COLORS.orange },
    { x: 8, y: 7, color: bubbleBg },
    { x: 9, y: 7, color: COLORS.orange },
    { x: 10, y: 7, color: bubbleBg },
    { x: 11, y: 7, color: outline },
    { x: 3, y: 8, color: outline },
    { x: 4, y: 8, color: bubbleBg },
    { x: 5, y: 8, color: bubbleBg },
    { x: 6, y: 8, color: bubbleBg },
    { x: 7, y: 8, color: bubbleBg },
    { x: 8, y: 8, color: bubbleBg },
    { x: 9, y: 8, color: bubbleBg },
    { x: 10, y: 8, color: bubbleBg },
    { x: 11, y: 8, color: outline },
    { x: 4, y: 9, color: outline },
    { x: 5, y: 9, color: outline },
    { x: 6, y: 9, color: outline },
    { x: 7, y: 9, color: outline },
    { x: 8, y: 9, color: outline },
    { x: 9, y: 9, color: outline },
    { x: 10, y: 9, color: outline },
    // Pointer
    { x: 2, y: 8, color: outline },
    { x: 1, y: 9, color: outline },
    { x: 2, y: 9, color: bubbleBg },
    { x: 3, y: 9, color: outline },
    { x: 0, y: 10, color: outline },
    { x: 1, y: 10, color: bubbleBg },
    { x: 2, y: 10, color: outline },
  ];

  return (
    <svg width={size} height={size * 0.85} viewBox="0 0 56 48" style={{ imageRendering: 'pixelated' }}>
      {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
    </svg>
  );
}

// OFFICIAL BRAND LOGO SYSTEM
// Based on #8 Speech Bubble Style - The chosen logo
// =============================================================================

/**
 * PixelBrandIcon - Just the pixel icon (no text)
 * Use for: favicons, mobile nav, loading states, tight spaces
 * @param colorMode - "dark" (for dark backgrounds) | "light" (for light backgrounds)
 */
export function PixelBrandIcon({
  className,
  size = 32,
  colorMode = "dark",
}: {
  className?: string;
  size?: number;
  colorMode?: "dark" | "light";
}) {
  return (
    <div className={cn('relative inline-block', className)}>
      <LockupIcon size={size} colorMode={colorMode} />
    </div>
  );
}

/**
 * PixelBrandLogoMini - Tiny logo for mobile nav
 * Use for: mobile header, collapsed sidebar
 * @param colorMode - "dark" (for dark backgrounds) | "light" (for light backgrounds)
 */
export function PixelBrandLogoMini({
  className,
  colorMode = "dark",
}: {
  className?: string;
  colorMode?: "dark" | "light";
}) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <LockupIcon size={28} colorMode={colorMode} />
      <span className="font-mono text-sm font-bold" style={{ color: COLORS.orange }}>
        BWFD
      </span>
    </div>
  );
}

/**
 * PixelBrandLogoCompact - Compact logo for nav headers
 * Use for: desktop nav, footer, compact spaces
 * @param variant - "speech" | "inline" | "icon-only"
 * @param colorMode - "dark" (for dark backgrounds) | "light" (for cream/light backgrounds)
 */
export function PixelBrandLogoCompact({
  className,
  variant = "speech",
  colorMode = "dark",
}: {
  className?: string;
  variant?: "speech" | "inline" | "icon-only";
  colorMode?: "dark" | "light";
}) {
  const textColor = colorMode === "light" ? COLORS.dark : COLORS.cream;
  const bubbleBg = colorMode === "light" ? COLORS.dark : COLORS.cream;
  const bubbleText = colorMode === "light" ? COLORS.cream : COLORS.dark;

  if (variant === "icon-only") {
    return <PixelBrandIcon className={className} size={36} colorMode={colorMode} />;
  }

  if (variant === "inline") {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <LockupIcon size={36} colorMode={colorMode} />
        <span className="font-mono text-sm tracking-tight">
          <span style={{ color: COLORS.orange }} className="font-bold">Babe,</span>
          <span style={{ color: textColor }}> What&apos;s for Dinner?</span>
        </span>
      </div>
    );
  }

  // Default: speech bubble style
  return (
    <div className={cn('flex items-end gap-1.5', className)}>
      <LockupIcon size={40} colorMode={colorMode} />
      <div
        className="px-2 py-1 rounded-md rounded-bl-none mb-1"
        style={{ backgroundColor: bubbleBg }}
      >
        <span className="font-mono text-xs font-bold" style={{ color: bubbleText }}>
          <span style={{ color: COLORS.orange }}>Babe,</span> What&apos;s for Dinner?
        </span>
      </div>
    </div>
  );
}

/**
 * PixelBrandLogo - Standard logo (default size)
 * Use for: headers, about pages, general branding
 * @param colorMode - "dark" (for dark backgrounds, cream bubble) | "light" (for light backgrounds, dark bubble)
 */
export function PixelBrandLogo({
  className,
  size = "md",
  colorMode = "dark",
}: {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  colorMode?: "dark" | "light";
}) {
  const sizes = {
    sm: { icon: 40, text: "text-sm", padding: "px-2 py-1", rounded: "rounded-md" },
    md: { icon: 56, text: "text-base", padding: "px-3 py-1.5", rounded: "rounded-lg" },
    lg: { icon: 72, text: "text-lg", padding: "px-4 py-2", rounded: "rounded-lg" },
    xl: { icon: 96, text: "text-xl", padding: "px-5 py-2.5", rounded: "rounded-xl" },
  };

  const s = sizes[size];
  const bubbleBg = colorMode === "light" ? COLORS.dark : COLORS.cream;
  const bubbleText = colorMode === "light" ? COLORS.cream : COLORS.dark;

  return (
    <div className={cn('flex items-end gap-2', className)}>
      <LockupIcon size={s.icon} colorMode={colorMode} />
      <div
        className={cn(s.padding, s.rounded, "rounded-bl-none mb-2")}
        style={{ backgroundColor: bubbleBg }}
      >
        <span className={cn("font-mono font-bold", s.text)} style={{ color: bubbleText }}>
          <span style={{ color: COLORS.orange }}>Babe,</span> What&apos;s for Dinner?
        </span>
      </div>
    </div>
  );
}

/**
 * PixelBrandLogoHero - Large hero/marketing logo
 * Use for: landing pages, hero sections, marketing
 * @param colorMode - "dark" (for dark backgrounds) | "light" (for light backgrounds)
 */
export function PixelBrandLogoHero({
  className,
  showTagline = false,
  colorMode = "dark",
}: {
  className?: string;
  showTagline?: boolean;
  colorMode?: "dark" | "light";
}) {
  const bubbleBg = colorMode === "light" ? COLORS.dark : COLORS.cream;
  const bubbleText = colorMode === "light" ? COLORS.cream : COLORS.dark;
  const taglineColor = colorMode === "light" ? COLORS.dark : COLORS.hatShadow;

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      <div className="flex items-end gap-3">
        <LockupIcon size={96} colorMode={colorMode} />
        <div
          className="px-5 py-3 rounded-xl rounded-bl-none mb-4"
          style={{ backgroundColor: bubbleBg }}
        >
          <span className="font-mono text-2xl font-bold" style={{ color: bubbleText }}>
            <span style={{ color: COLORS.orange }}>Babe,</span> What&apos;s for Dinner?
          </span>
        </div>
      </div>
      {showTagline && (
        <span
          className="font-mono text-sm tracking-widest uppercase"
          style={{ color: taglineColor }}
        >
          Your Meal Prep OS
        </span>
      )}
    </div>
  );
}

/**
 * PixelBrandLogoStacked - Vertically stacked for square spaces
 * Use for: app icons, square containers, social media avatars
 * @param colorMode - "dark" (for dark backgrounds, cream text) | "light" (for light backgrounds, dark text)
 */
export function PixelBrandLogoStacked({
  className,
  size = "md",
  colorMode = "dark",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  colorMode?: "dark" | "light";
}) {
  const sizes = {
    sm: { icon: 48, text: "text-xs" },
    md: { icon: 64, text: "text-sm" },
    lg: { icon: 80, text: "text-base" },
  };

  const s = sizes[size];
  const textColor = colorMode === "light" ? COLORS.dark : COLORS.cream;

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <LockupIcon size={s.icon} colorMode={colorMode} />
      <div className="text-center">
        <span className={cn("font-mono font-bold block", s.text)} style={{ color: COLORS.orange }}>
          Babe,
        </span>
        <span className={cn("font-mono", s.text)} style={{ color: textColor }}>
          What&apos;s for Dinner?
        </span>
      </div>
    </div>
  );
}
