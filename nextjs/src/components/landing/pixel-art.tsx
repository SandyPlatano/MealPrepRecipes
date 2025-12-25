'use client';

import { useEffect, useState } from 'react';
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
// PIXEL CHAT CHEF LOGOS - Multiple style variations
// ─────────────────────────────────────────────────────────────────────────────

// STYLE 1: CLASSIC TOQUE - Iconic tall chef hat with pleats + rounded chat bubble
export function PixelLogoPuffy({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // ══════════════════════════════════════════════════════════
    // CHEF HAT - Tall toque with puffy top and visible pleats
    // ══════════════════════════════════════════════════════════

    // Puffy top (mushroom cloud shape)
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 8, y: 0, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 9, y: 1, color: COLORS.hatWhite },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatWhite },
    { x: 10, y: 2, color: COLORS.hatWhite },
    // Pleats/folds (vertical lines showing texture)
    { x: 5, y: 3, color: COLORS.hatWhite },
    { x: 6, y: 3, color: COLORS.hatShadow },
    { x: 7, y: 3, color: COLORS.hatWhite },
    { x: 8, y: 3, color: COLORS.hatShadow },
    { x: 9, y: 3, color: COLORS.hatWhite },
    { x: 5, y: 4, color: COLORS.hatWhite },
    { x: 6, y: 4, color: COLORS.hatShadow },
    { x: 7, y: 4, color: COLORS.hatWhite },
    { x: 8, y: 4, color: COLORS.hatShadow },
    { x: 9, y: 4, color: COLORS.hatWhite },
    // Hat band (dark stripe at bottom of hat)
    { x: 4, y: 5, color: COLORS.dark },
    { x: 5, y: 5, color: COLORS.dark },
    { x: 6, y: 5, color: COLORS.dark },
    { x: 7, y: 5, color: COLORS.dark },
    { x: 8, y: 5, color: COLORS.dark },
    { x: 9, y: 5, color: COLORS.dark },
    { x: 10, y: 5, color: COLORS.dark },

    // ══════════════════════════════════════════════════════════
    // MESSAGE BUBBLE - Rounded rectangle with clear tail
    // ══════════════════════════════════════════════════════════

    // Top edge with rounded corners
    { x: 4, y: 6, color: COLORS.dark },
    { x: 5, y: 6, color: COLORS.dark },
    { x: 6, y: 6, color: COLORS.dark },
    { x: 7, y: 6, color: COLORS.dark },
    { x: 8, y: 6, color: COLORS.dark },
    { x: 9, y: 6, color: COLORS.dark },
    { x: 10, y: 6, color: COLORS.dark },
    // Body row 1
    { x: 3, y: 7, color: COLORS.dark },
    { x: 4, y: 7, color: COLORS.cream },
    { x: 5, y: 7, color: COLORS.cream },
    { x: 6, y: 7, color: COLORS.cream },
    { x: 7, y: 7, color: COLORS.cream },
    { x: 8, y: 7, color: COLORS.cream },
    { x: 9, y: 7, color: COLORS.cream },
    { x: 10, y: 7, color: COLORS.cream },
    { x: 11, y: 7, color: COLORS.dark },
    // Body row 2 - with typing dots
    { x: 3, y: 8, color: COLORS.dark },
    { x: 4, y: 8, color: COLORS.cream },
    { x: 5, y: 8, color: COLORS.orange }, // dot 1
    { x: 6, y: 8, color: COLORS.cream },
    { x: 7, y: 8, color: COLORS.orange }, // dot 2
    { x: 8, y: 8, color: COLORS.cream },
    { x: 9, y: 8, color: COLORS.orange }, // dot 3
    { x: 10, y: 8, color: COLORS.cream },
    { x: 11, y: 8, color: COLORS.dark },
    // Body row 3
    { x: 3, y: 9, color: COLORS.dark },
    { x: 4, y: 9, color: COLORS.cream },
    { x: 5, y: 9, color: COLORS.cream },
    { x: 6, y: 9, color: COLORS.cream },
    { x: 7, y: 9, color: COLORS.cream },
    { x: 8, y: 9, color: COLORS.cream },
    { x: 9, y: 9, color: COLORS.cream },
    { x: 10, y: 9, color: COLORS.cream },
    { x: 11, y: 9, color: COLORS.dark },
    // Bottom edge
    { x: 4, y: 10, color: COLORS.dark },
    { x: 5, y: 10, color: COLORS.dark },
    { x: 6, y: 10, color: COLORS.dark },
    { x: 7, y: 10, color: COLORS.dark },
    { x: 8, y: 10, color: COLORS.dark },
    { x: 9, y: 10, color: COLORS.dark },
    { x: 10, y: 10, color: COLORS.dark },

    // Chat tail (triangle pointing down-left)
    { x: 3, y: 10, color: COLORS.dark },
    { x: 3, y: 11, color: COLORS.dark },
    { x: 4, y: 11, color: COLORS.cream },
    { x: 5, y: 11, color: COLORS.dark },
    { x: 2, y: 12, color: COLORS.dark },
    { x: 3, y: 12, color: COLORS.cream },
    { x: 4, y: 12, color: COLORS.dark },
    { x: 1, y: 13, color: COLORS.dark },
    { x: 2, y: 13, color: COLORS.dark },
    { x: 3, y: 13, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.1} viewBox="0 0 56 60" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// STYLE 2: TALL TOQUE - Classic tall chef hat with pleats + typing dots
export function PixelLogoTallToque({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // ══════════════════════════════════════════════════════════
    // TALL CHEF HAT - Classic toque with height and pleats
    // ══════════════════════════════════════════════════════════

    // Puffy rounded top
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 8, y: 0, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 9, y: 1, color: COLORS.hatWhite },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatWhite },
    { x: 10, y: 2, color: COLORS.hatWhite },
    // Body with vertical pleats (alternating white/shadow)
    { x: 4, y: 3, color: COLORS.hatWhite },
    { x: 5, y: 3, color: COLORS.hatShadow },
    { x: 6, y: 3, color: COLORS.hatWhite },
    { x: 7, y: 3, color: COLORS.hatShadow },
    { x: 8, y: 3, color: COLORS.hatWhite },
    { x: 9, y: 3, color: COLORS.hatShadow },
    { x: 10, y: 3, color: COLORS.hatWhite },
    { x: 4, y: 4, color: COLORS.hatWhite },
    { x: 5, y: 4, color: COLORS.hatShadow },
    { x: 6, y: 4, color: COLORS.hatWhite },
    { x: 7, y: 4, color: COLORS.hatShadow },
    { x: 8, y: 4, color: COLORS.hatWhite },
    { x: 9, y: 4, color: COLORS.hatShadow },
    { x: 10, y: 4, color: COLORS.hatWhite },
    { x: 4, y: 5, color: COLORS.hatWhite },
    { x: 5, y: 5, color: COLORS.hatShadow },
    { x: 6, y: 5, color: COLORS.hatWhite },
    { x: 7, y: 5, color: COLORS.hatShadow },
    { x: 8, y: 5, color: COLORS.hatWhite },
    { x: 9, y: 5, color: COLORS.hatShadow },
    { x: 10, y: 5, color: COLORS.hatWhite },
    // Hat band (dark stripe at bottom)
    { x: 3, y: 6, color: COLORS.dark },
    { x: 4, y: 6, color: COLORS.dark },
    { x: 5, y: 6, color: COLORS.dark },
    { x: 6, y: 6, color: COLORS.dark },
    { x: 7, y: 6, color: COLORS.dark },
    { x: 8, y: 6, color: COLORS.dark },
    { x: 9, y: 6, color: COLORS.dark },
    { x: 10, y: 6, color: COLORS.dark },
    { x: 11, y: 6, color: COLORS.dark },

    // ══════════════════════════════════════════════════════════
    // MESSAGE BUBBLE - with typing dots
    // ══════════════════════════════════════════════════════════

    // Top edge
    { x: 3, y: 7, color: COLORS.dark },
    { x: 4, y: 7, color: COLORS.dark },
    { x: 5, y: 7, color: COLORS.dark },
    { x: 6, y: 7, color: COLORS.dark },
    { x: 7, y: 7, color: COLORS.dark },
    { x: 8, y: 7, color: COLORS.dark },
    { x: 9, y: 7, color: COLORS.dark },
    { x: 10, y: 7, color: COLORS.dark },
    { x: 11, y: 7, color: COLORS.dark },
    // Body row 1
    { x: 2, y: 8, color: COLORS.dark },
    { x: 3, y: 8, color: COLORS.cream },
    { x: 4, y: 8, color: COLORS.cream },
    { x: 5, y: 8, color: COLORS.cream },
    { x: 6, y: 8, color: COLORS.cream },
    { x: 7, y: 8, color: COLORS.cream },
    { x: 8, y: 8, color: COLORS.cream },
    { x: 9, y: 8, color: COLORS.cream },
    { x: 10, y: 8, color: COLORS.cream },
    { x: 11, y: 8, color: COLORS.cream },
    { x: 12, y: 8, color: COLORS.dark },
    // Body row 2 - with typing dots
    { x: 2, y: 9, color: COLORS.dark },
    { x: 3, y: 9, color: COLORS.cream },
    { x: 4, y: 9, color: COLORS.cream },
    { x: 5, y: 9, color: COLORS.orange }, // dot 1
    { x: 6, y: 9, color: COLORS.cream },
    { x: 7, y: 9, color: COLORS.orange }, // dot 2
    { x: 8, y: 9, color: COLORS.cream },
    { x: 9, y: 9, color: COLORS.orange }, // dot 3
    { x: 10, y: 9, color: COLORS.cream },
    { x: 11, y: 9, color: COLORS.cream },
    { x: 12, y: 9, color: COLORS.dark },
    // Body row 3
    { x: 2, y: 10, color: COLORS.dark },
    { x: 3, y: 10, color: COLORS.cream },
    { x: 4, y: 10, color: COLORS.cream },
    { x: 5, y: 10, color: COLORS.cream },
    { x: 6, y: 10, color: COLORS.cream },
    { x: 7, y: 10, color: COLORS.cream },
    { x: 8, y: 10, color: COLORS.cream },
    { x: 9, y: 10, color: COLORS.cream },
    { x: 10, y: 10, color: COLORS.cream },
    { x: 11, y: 10, color: COLORS.cream },
    { x: 12, y: 10, color: COLORS.dark },
    // Bottom edge
    { x: 3, y: 11, color: COLORS.dark },
    { x: 4, y: 11, color: COLORS.dark },
    { x: 5, y: 11, color: COLORS.dark },
    { x: 6, y: 11, color: COLORS.dark },
    { x: 7, y: 11, color: COLORS.dark },
    { x: 8, y: 11, color: COLORS.dark },
    { x: 9, y: 11, color: COLORS.dark },
    { x: 10, y: 11, color: COLORS.dark },
    { x: 11, y: 11, color: COLORS.dark },

    // Chat tail (triangle pointing down-left)
    { x: 2, y: 11, color: COLORS.dark },
    { x: 2, y: 12, color: COLORS.dark },
    { x: 3, y: 12, color: COLORS.cream },
    { x: 4, y: 12, color: COLORS.dark },
    { x: 1, y: 13, color: COLORS.dark },
    { x: 2, y: 13, color: COLORS.cream },
    { x: 3, y: 13, color: COLORS.dark },
    { x: 0, y: 14, color: COLORS.dark },
    { x: 1, y: 14, color: COLORS.dark },
    { x: 2, y: 14, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.2} viewBox="0 0 60 64" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// STYLE 3: BLOCKY RETRO - Hard 8-bit game style with pleats + typing dots
export function PixelLogoBlocky({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // ══════════════════════════════════════════════════════════
    // BLOCKY CHEF HAT - 8-bit style with bold outline + pleats
    // ══════════════════════════════════════════════════════════

    // Top outline
    { x: 4, y: 0, color: COLORS.dark },
    { x: 5, y: 0, color: COLORS.dark },
    { x: 6, y: 0, color: COLORS.dark },
    { x: 7, y: 0, color: COLORS.dark },
    { x: 8, y: 0, color: COLORS.dark },
    { x: 9, y: 0, color: COLORS.dark },
    { x: 10, y: 0, color: COLORS.dark },
    { x: 11, y: 0, color: COLORS.dark },
    // Hat body with pleats
    { x: 4, y: 1, color: COLORS.dark },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatShadow },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatShadow },
    { x: 9, y: 1, color: COLORS.hatWhite },
    { x: 10, y: 1, color: COLORS.hatShadow },
    { x: 11, y: 1, color: COLORS.dark },
    { x: 4, y: 2, color: COLORS.dark },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatShadow },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 8, y: 2, color: COLORS.hatShadow },
    { x: 9, y: 2, color: COLORS.hatWhite },
    { x: 10, y: 2, color: COLORS.hatShadow },
    { x: 11, y: 2, color: COLORS.dark },
    { x: 4, y: 3, color: COLORS.dark },
    { x: 5, y: 3, color: COLORS.hatWhite },
    { x: 6, y: 3, color: COLORS.hatShadow },
    { x: 7, y: 3, color: COLORS.hatWhite },
    { x: 8, y: 3, color: COLORS.hatShadow },
    { x: 9, y: 3, color: COLORS.hatWhite },
    { x: 10, y: 3, color: COLORS.hatShadow },
    { x: 11, y: 3, color: COLORS.dark },
    // Thick hat band
    { x: 3, y: 4, color: COLORS.dark },
    { x: 4, y: 4, color: COLORS.dark },
    { x: 5, y: 4, color: COLORS.dark },
    { x: 6, y: 4, color: COLORS.dark },
    { x: 7, y: 4, color: COLORS.dark },
    { x: 8, y: 4, color: COLORS.dark },
    { x: 9, y: 4, color: COLORS.dark },
    { x: 10, y: 4, color: COLORS.dark },
    { x: 11, y: 4, color: COLORS.dark },
    { x: 12, y: 4, color: COLORS.dark },

    // ══════════════════════════════════════════════════════════
    // SQUARE MESSAGE BOX - with typing dots
    // ══════════════════════════════════════════════════════════

    // Box body row 1
    { x: 3, y: 5, color: COLORS.dark },
    { x: 4, y: 5, color: COLORS.cream },
    { x: 5, y: 5, color: COLORS.cream },
    { x: 6, y: 5, color: COLORS.cream },
    { x: 7, y: 5, color: COLORS.cream },
    { x: 8, y: 5, color: COLORS.cream },
    { x: 9, y: 5, color: COLORS.cream },
    { x: 10, y: 5, color: COLORS.cream },
    { x: 11, y: 5, color: COLORS.cream },
    { x: 12, y: 5, color: COLORS.dark },
    // Box body row 2 - with typing dots
    { x: 3, y: 6, color: COLORS.dark },
    { x: 4, y: 6, color: COLORS.cream },
    { x: 5, y: 6, color: COLORS.cream },
    { x: 6, y: 6, color: COLORS.orange }, // dot 1
    { x: 7, y: 6, color: COLORS.cream },
    { x: 8, y: 6, color: COLORS.orange }, // dot 2
    { x: 9, y: 6, color: COLORS.cream },
    { x: 10, y: 6, color: COLORS.orange }, // dot 3
    { x: 11, y: 6, color: COLORS.cream },
    { x: 12, y: 6, color: COLORS.dark },
    // Box body row 3
    { x: 3, y: 7, color: COLORS.dark },
    { x: 4, y: 7, color: COLORS.cream },
    { x: 5, y: 7, color: COLORS.cream },
    { x: 6, y: 7, color: COLORS.cream },
    { x: 7, y: 7, color: COLORS.cream },
    { x: 8, y: 7, color: COLORS.cream },
    { x: 9, y: 7, color: COLORS.cream },
    { x: 10, y: 7, color: COLORS.cream },
    { x: 11, y: 7, color: COLORS.cream },
    { x: 12, y: 7, color: COLORS.dark },
    // Box body row 4
    { x: 3, y: 8, color: COLORS.dark },
    { x: 4, y: 8, color: COLORS.cream },
    { x: 5, y: 8, color: COLORS.cream },
    { x: 6, y: 8, color: COLORS.cream },
    { x: 7, y: 8, color: COLORS.cream },
    { x: 8, y: 8, color: COLORS.cream },
    { x: 9, y: 8, color: COLORS.cream },
    { x: 10, y: 8, color: COLORS.cream },
    { x: 11, y: 8, color: COLORS.cream },
    { x: 12, y: 8, color: COLORS.dark },
    // Box body row 5
    { x: 3, y: 9, color: COLORS.dark },
    { x: 4, y: 9, color: COLORS.cream },
    { x: 5, y: 9, color: COLORS.cream },
    { x: 6, y: 9, color: COLORS.cream },
    { x: 7, y: 9, color: COLORS.cream },
    { x: 8, y: 9, color: COLORS.cream },
    { x: 9, y: 9, color: COLORS.cream },
    { x: 10, y: 9, color: COLORS.cream },
    { x: 11, y: 9, color: COLORS.cream },
    { x: 12, y: 9, color: COLORS.dark },
    // Bottom edge
    { x: 3, y: 10, color: COLORS.dark },
    { x: 4, y: 10, color: COLORS.dark },
    { x: 5, y: 10, color: COLORS.dark },
    { x: 6, y: 10, color: COLORS.dark },
    { x: 7, y: 10, color: COLORS.dark },
    { x: 8, y: 10, color: COLORS.dark },
    { x: 9, y: 10, color: COLORS.dark },
    { x: 10, y: 10, color: COLORS.dark },
    { x: 11, y: 10, color: COLORS.dark },
    { x: 12, y: 10, color: COLORS.dark },

    // Blocky tail (angular)
    { x: 3, y: 11, color: COLORS.dark },
    { x: 4, y: 11, color: COLORS.cream },
    { x: 5, y: 11, color: COLORS.dark },
    { x: 2, y: 12, color: COLORS.dark },
    { x: 3, y: 12, color: COLORS.dark },
    { x: 4, y: 12, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size} viewBox="0 0 64 56" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// STYLE 4: MINIMAL - Super simple, favicon-ready with tiny pleats + dot
export function PixelLogoMinimal({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // ══════════════════════════════════════════════════════════
    // TINY CHEF HAT - Puffy top with mini pleats
    // ══════════════════════════════════════════════════════════

    // Puffy top
    { x: 5, y: 0, color: COLORS.hatWhite },
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    // Body with mini pleats
    { x: 4, y: 1, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatShadow },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatShadow },
    { x: 8, y: 1, color: COLORS.hatWhite },
    // Hat band
    { x: 3, y: 2, color: COLORS.dark },
    { x: 4, y: 2, color: COLORS.dark },
    { x: 5, y: 2, color: COLORS.dark },
    { x: 6, y: 2, color: COLORS.dark },
    { x: 7, y: 2, color: COLORS.dark },
    { x: 8, y: 2, color: COLORS.dark },
    { x: 9, y: 2, color: COLORS.dark },

    // ══════════════════════════════════════════════════════════
    // TINY MESSAGE BOX - with single orange accent
    // ══════════════════════════════════════════════════════════

    // Box row 1
    { x: 3, y: 3, color: COLORS.dark },
    { x: 4, y: 3, color: COLORS.cream },
    { x: 5, y: 3, color: COLORS.cream },
    { x: 6, y: 3, color: COLORS.cream },
    { x: 7, y: 3, color: COLORS.cream },
    { x: 8, y: 3, color: COLORS.cream },
    { x: 9, y: 3, color: COLORS.dark },
    // Box row 2 - with dot
    { x: 3, y: 4, color: COLORS.dark },
    { x: 4, y: 4, color: COLORS.cream },
    { x: 5, y: 4, color: COLORS.orange }, // single dot
    { x: 6, y: 4, color: COLORS.cream },
    { x: 7, y: 4, color: COLORS.orange }, // second dot
    { x: 8, y: 4, color: COLORS.cream },
    { x: 9, y: 4, color: COLORS.dark },
    // Box row 3
    { x: 3, y: 5, color: COLORS.dark },
    { x: 4, y: 5, color: COLORS.cream },
    { x: 5, y: 5, color: COLORS.cream },
    { x: 6, y: 5, color: COLORS.cream },
    { x: 7, y: 5, color: COLORS.cream },
    { x: 8, y: 5, color: COLORS.cream },
    { x: 9, y: 5, color: COLORS.dark },
    // Bottom edge
    { x: 3, y: 6, color: COLORS.dark },
    { x: 4, y: 6, color: COLORS.dark },
    { x: 5, y: 6, color: COLORS.dark },
    { x: 6, y: 6, color: COLORS.dark },
    { x: 7, y: 6, color: COLORS.dark },
    { x: 8, y: 6, color: COLORS.dark },
    { x: 9, y: 6, color: COLORS.dark },

    // Tiny tail
    { x: 3, y: 7, color: COLORS.dark },
    { x: 4, y: 7, color: COLORS.cream },
    { x: 5, y: 7, color: COLORS.dark },
    { x: 2, y: 8, color: COLORS.dark },
    { x: 3, y: 8, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size} viewBox="0 0 48 40" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// STYLE 5: WITH HEART - Love/couples themed with pleats + heart icon
export function PixelLogoHeart({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // ══════════════════════════════════════════════════════════
    // CHEF HAT - Puffy top with pleats
    // ══════════════════════════════════════════════════════════

    // Puffy top
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 8, y: 0, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 9, y: 1, color: COLORS.hatWhite },
    // Body with pleats
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatShadow },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatShadow },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatShadow },
    { x: 10, y: 2, color: COLORS.hatWhite },
    // Hat band
    { x: 3, y: 3, color: COLORS.dark },
    { x: 4, y: 3, color: COLORS.dark },
    { x: 5, y: 3, color: COLORS.dark },
    { x: 6, y: 3, color: COLORS.dark },
    { x: 7, y: 3, color: COLORS.dark },
    { x: 8, y: 3, color: COLORS.dark },
    { x: 9, y: 3, color: COLORS.dark },
    { x: 10, y: 3, color: COLORS.dark },
    { x: 11, y: 3, color: COLORS.dark },

    // ══════════════════════════════════════════════════════════
    // MESSAGE BOX - with pixel heart inside
    // ══════════════════════════════════════════════════════════

    // Box row 1
    { x: 3, y: 4, color: COLORS.dark },
    { x: 4, y: 4, color: COLORS.cream },
    { x: 5, y: 4, color: COLORS.cream },
    { x: 6, y: 4, color: COLORS.cream },
    { x: 7, y: 4, color: COLORS.cream },
    { x: 8, y: 4, color: COLORS.cream },
    { x: 9, y: 4, color: COLORS.cream },
    { x: 10, y: 4, color: COLORS.cream },
    { x: 11, y: 4, color: COLORS.dark },
    // Heart top lobes
    { x: 3, y: 5, color: COLORS.dark },
    { x: 4, y: 5, color: COLORS.cream },
    { x: 5, y: 5, color: COLORS.orange },
    { x: 6, y: 5, color: COLORS.orange },
    { x: 7, y: 5, color: COLORS.cream },
    { x: 8, y: 5, color: COLORS.orange },
    { x: 9, y: 5, color: COLORS.orange },
    { x: 10, y: 5, color: COLORS.cream },
    { x: 11, y: 5, color: COLORS.dark },
    // Heart middle
    { x: 3, y: 6, color: COLORS.dark },
    { x: 4, y: 6, color: COLORS.cream },
    { x: 5, y: 6, color: COLORS.orange },
    { x: 6, y: 6, color: COLORS.orange },
    { x: 7, y: 6, color: COLORS.orange },
    { x: 8, y: 6, color: COLORS.orange },
    { x: 9, y: 6, color: COLORS.orange },
    { x: 10, y: 6, color: COLORS.cream },
    { x: 11, y: 6, color: COLORS.dark },
    // Heart narrow
    { x: 3, y: 7, color: COLORS.dark },
    { x: 4, y: 7, color: COLORS.cream },
    { x: 5, y: 7, color: COLORS.cream },
    { x: 6, y: 7, color: COLORS.orange },
    { x: 7, y: 7, color: COLORS.orange },
    { x: 8, y: 7, color: COLORS.orange },
    { x: 9, y: 7, color: COLORS.cream },
    { x: 10, y: 7, color: COLORS.cream },
    { x: 11, y: 7, color: COLORS.dark },
    // Heart point
    { x: 3, y: 8, color: COLORS.dark },
    { x: 4, y: 8, color: COLORS.cream },
    { x: 5, y: 8, color: COLORS.cream },
    { x: 6, y: 8, color: COLORS.cream },
    { x: 7, y: 8, color: COLORS.orange },
    { x: 8, y: 8, color: COLORS.cream },
    { x: 9, y: 8, color: COLORS.cream },
    { x: 10, y: 8, color: COLORS.cream },
    { x: 11, y: 8, color: COLORS.dark },
    // Bottom edge
    { x: 3, y: 9, color: COLORS.dark },
    { x: 4, y: 9, color: COLORS.dark },
    { x: 5, y: 9, color: COLORS.dark },
    { x: 6, y: 9, color: COLORS.dark },
    { x: 7, y: 9, color: COLORS.dark },
    { x: 8, y: 9, color: COLORS.dark },
    { x: 9, y: 9, color: COLORS.dark },
    { x: 10, y: 9, color: COLORS.dark },
    { x: 11, y: 9, color: COLORS.dark },

    // Chat tail
    { x: 3, y: 10, color: COLORS.dark },
    { x: 4, y: 10, color: COLORS.cream },
    { x: 5, y: 10, color: COLORS.dark },
    { x: 2, y: 11, color: COLORS.dark },
    { x: 3, y: 11, color: COLORS.cream },
    { x: 4, y: 11, color: COLORS.dark },
    { x: 1, y: 12, color: COLORS.dark },
    { x: 2, y: 12, color: COLORS.dark },
    { x: 3, y: 12, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size} viewBox="0 0 56 56" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// STYLE 6: ROUND BUBBLE - Circular speech bubble with pleats + typing dots
export function PixelLogoRound({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // ══════════════════════════════════════════════════════════
    // CUTE CHEF HAT - Small puffy hat with pleats
    // ══════════════════════════════════════════════════════════

    // Puffy top
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    // Body with mini pleats
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatShadow },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatShadow },
    // Hat band
    { x: 4, y: 2, color: COLORS.dark },
    { x: 5, y: 2, color: COLORS.dark },
    { x: 6, y: 2, color: COLORS.dark },
    { x: 7, y: 2, color: COLORS.dark },
    { x: 8, y: 2, color: COLORS.dark },
    { x: 9, y: 2, color: COLORS.dark },

    // ══════════════════════════════════════════════════════════
    // ROUND MESSAGE BUBBLE - with typing dots
    // ══════════════════════════════════════════════════════════

    // Round top edge
    { x: 4, y: 3, color: COLORS.dark },
    { x: 5, y: 3, color: COLORS.dark },
    { x: 6, y: 3, color: COLORS.dark },
    { x: 7, y: 3, color: COLORS.dark },
    { x: 8, y: 3, color: COLORS.dark },
    { x: 9, y: 3, color: COLORS.dark },
    // Body row 1
    { x: 3, y: 4, color: COLORS.dark },
    { x: 4, y: 4, color: COLORS.cream },
    { x: 5, y: 4, color: COLORS.cream },
    { x: 6, y: 4, color: COLORS.cream },
    { x: 7, y: 4, color: COLORS.cream },
    { x: 8, y: 4, color: COLORS.cream },
    { x: 9, y: 4, color: COLORS.cream },
    { x: 10, y: 4, color: COLORS.dark },
    // Body row 2 (wider)
    { x: 2, y: 5, color: COLORS.dark },
    { x: 3, y: 5, color: COLORS.cream },
    { x: 4, y: 5, color: COLORS.cream },
    { x: 5, y: 5, color: COLORS.cream },
    { x: 6, y: 5, color: COLORS.cream },
    { x: 7, y: 5, color: COLORS.cream },
    { x: 8, y: 5, color: COLORS.cream },
    { x: 9, y: 5, color: COLORS.cream },
    { x: 10, y: 5, color: COLORS.cream },
    { x: 11, y: 5, color: COLORS.dark },
    // Body row 3 - with typing dots
    { x: 2, y: 6, color: COLORS.dark },
    { x: 3, y: 6, color: COLORS.cream },
    { x: 4, y: 6, color: COLORS.cream },
    { x: 5, y: 6, color: COLORS.orange }, // dot 1
    { x: 6, y: 6, color: COLORS.cream },
    { x: 7, y: 6, color: COLORS.orange }, // dot 2
    { x: 8, y: 6, color: COLORS.cream },
    { x: 9, y: 6, color: COLORS.orange }, // dot 3
    { x: 10, y: 6, color: COLORS.cream },
    { x: 11, y: 6, color: COLORS.dark },
    // Body row 4 (wider)
    { x: 2, y: 7, color: COLORS.dark },
    { x: 3, y: 7, color: COLORS.cream },
    { x: 4, y: 7, color: COLORS.cream },
    { x: 5, y: 7, color: COLORS.cream },
    { x: 6, y: 7, color: COLORS.cream },
    { x: 7, y: 7, color: COLORS.cream },
    { x: 8, y: 7, color: COLORS.cream },
    { x: 9, y: 7, color: COLORS.cream },
    { x: 10, y: 7, color: COLORS.cream },
    { x: 11, y: 7, color: COLORS.dark },
    // Body row 5
    { x: 3, y: 8, color: COLORS.dark },
    { x: 4, y: 8, color: COLORS.cream },
    { x: 5, y: 8, color: COLORS.cream },
    { x: 6, y: 8, color: COLORS.cream },
    { x: 7, y: 8, color: COLORS.cream },
    { x: 8, y: 8, color: COLORS.cream },
    { x: 9, y: 8, color: COLORS.cream },
    { x: 10, y: 8, color: COLORS.dark },
    // Round bottom edge
    { x: 4, y: 9, color: COLORS.dark },
    { x: 5, y: 9, color: COLORS.dark },
    { x: 6, y: 9, color: COLORS.dark },
    { x: 7, y: 9, color: COLORS.dark },
    { x: 8, y: 9, color: COLORS.dark },
    { x: 9, y: 9, color: COLORS.dark },

    // Chat tail
    { x: 3, y: 9, color: COLORS.dark },
    { x: 3, y: 10, color: COLORS.dark },
    { x: 4, y: 10, color: COLORS.cream },
    { x: 5, y: 10, color: COLORS.dark },
    { x: 2, y: 11, color: COLORS.dark },
    { x: 3, y: 11, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size} viewBox="0 0 56 52" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// STYLE 7: BOLD OUTLINE - Thick borders, high contrast with pleats + orange frame
export function PixelLogoBold({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // ══════════════════════════════════════════════════════════
    // BOLD CHEF HAT - With outline and pleats
    // ══════════════════════════════════════════════════════════

    // Bold hat outline (top)
    { x: 5, y: 0, color: COLORS.dark },
    { x: 6, y: 0, color: COLORS.dark },
    { x: 7, y: 0, color: COLORS.dark },
    { x: 8, y: 0, color: COLORS.dark },
    { x: 9, y: 0, color: COLORS.dark },
    // Hat body with pleats
    { x: 4, y: 1, color: COLORS.dark },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatShadow },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatShadow },
    { x: 9, y: 1, color: COLORS.hatWhite },
    { x: 10, y: 1, color: COLORS.dark },
    { x: 4, y: 2, color: COLORS.dark },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatShadow },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 8, y: 2, color: COLORS.hatShadow },
    { x: 9, y: 2, color: COLORS.hatWhite },
    { x: 10, y: 2, color: COLORS.dark },
    { x: 4, y: 3, color: COLORS.dark },
    { x: 5, y: 3, color: COLORS.hatWhite },
    { x: 6, y: 3, color: COLORS.hatShadow },
    { x: 7, y: 3, color: COLORS.hatWhite },
    { x: 8, y: 3, color: COLORS.hatShadow },
    { x: 9, y: 3, color: COLORS.hatWhite },
    { x: 10, y: 3, color: COLORS.dark },
    // Thick hat band
    { x: 2, y: 4, color: COLORS.dark },
    { x: 3, y: 4, color: COLORS.dark },
    { x: 4, y: 4, color: COLORS.dark },
    { x: 5, y: 4, color: COLORS.dark },
    { x: 6, y: 4, color: COLORS.dark },
    { x: 7, y: 4, color: COLORS.dark },
    { x: 8, y: 4, color: COLORS.dark },
    { x: 9, y: 4, color: COLORS.dark },
    { x: 10, y: 4, color: COLORS.dark },
    { x: 11, y: 4, color: COLORS.dark },
    { x: 12, y: 4, color: COLORS.dark },

    // ══════════════════════════════════════════════════════════
    // BOLD MESSAGE BOX - Orange frame with typing dots
    // ══════════════════════════════════════════════════════════

    // Orange top border
    { x: 2, y: 5, color: COLORS.dark },
    { x: 3, y: 5, color: COLORS.orange },
    { x: 4, y: 5, color: COLORS.orange },
    { x: 5, y: 5, color: COLORS.orange },
    { x: 6, y: 5, color: COLORS.orange },
    { x: 7, y: 5, color: COLORS.orange },
    { x: 8, y: 5, color: COLORS.orange },
    { x: 9, y: 5, color: COLORS.orange },
    { x: 10, y: 5, color: COLORS.orange },
    { x: 11, y: 5, color: COLORS.orange },
    { x: 12, y: 5, color: COLORS.dark },
    // Body row 1
    { x: 2, y: 6, color: COLORS.dark },
    { x: 3, y: 6, color: COLORS.orange },
    { x: 4, y: 6, color: COLORS.cream },
    { x: 5, y: 6, color: COLORS.cream },
    { x: 6, y: 6, color: COLORS.cream },
    { x: 7, y: 6, color: COLORS.cream },
    { x: 8, y: 6, color: COLORS.cream },
    { x: 9, y: 6, color: COLORS.cream },
    { x: 10, y: 6, color: COLORS.cream },
    { x: 11, y: 6, color: COLORS.orange },
    { x: 12, y: 6, color: COLORS.dark },
    // Body row 2 - with typing dots
    { x: 2, y: 7, color: COLORS.dark },
    { x: 3, y: 7, color: COLORS.orange },
    { x: 4, y: 7, color: COLORS.cream },
    { x: 5, y: 7, color: COLORS.dark }, // dot 1
    { x: 6, y: 7, color: COLORS.cream },
    { x: 7, y: 7, color: COLORS.dark }, // dot 2
    { x: 8, y: 7, color: COLORS.cream },
    { x: 9, y: 7, color: COLORS.dark }, // dot 3
    { x: 10, y: 7, color: COLORS.cream },
    { x: 11, y: 7, color: COLORS.orange },
    { x: 12, y: 7, color: COLORS.dark },
    // Body row 3
    { x: 2, y: 8, color: COLORS.dark },
    { x: 3, y: 8, color: COLORS.orange },
    { x: 4, y: 8, color: COLORS.cream },
    { x: 5, y: 8, color: COLORS.cream },
    { x: 6, y: 8, color: COLORS.cream },
    { x: 7, y: 8, color: COLORS.cream },
    { x: 8, y: 8, color: COLORS.cream },
    { x: 9, y: 8, color: COLORS.cream },
    { x: 10, y: 8, color: COLORS.cream },
    { x: 11, y: 8, color: COLORS.orange },
    { x: 12, y: 8, color: COLORS.dark },
    // Orange bottom border
    { x: 2, y: 9, color: COLORS.dark },
    { x: 3, y: 9, color: COLORS.orange },
    { x: 4, y: 9, color: COLORS.orange },
    { x: 5, y: 9, color: COLORS.orange },
    { x: 6, y: 9, color: COLORS.orange },
    { x: 7, y: 9, color: COLORS.orange },
    { x: 8, y: 9, color: COLORS.orange },
    { x: 9, y: 9, color: COLORS.orange },
    { x: 10, y: 9, color: COLORS.orange },
    { x: 11, y: 9, color: COLORS.orange },
    { x: 12, y: 9, color: COLORS.dark },
    // Dark outline bottom
    { x: 2, y: 10, color: COLORS.dark },
    { x: 3, y: 10, color: COLORS.dark },
    { x: 4, y: 10, color: COLORS.dark },
    { x: 5, y: 10, color: COLORS.dark },
    { x: 6, y: 10, color: COLORS.dark },
    { x: 7, y: 10, color: COLORS.dark },
    { x: 8, y: 10, color: COLORS.dark },
    { x: 9, y: 10, color: COLORS.dark },
    { x: 10, y: 10, color: COLORS.dark },
    { x: 11, y: 10, color: COLORS.dark },
    { x: 12, y: 10, color: COLORS.dark },

    // Bold chat tail
    { x: 3, y: 11, color: COLORS.dark },
    { x: 4, y: 11, color: COLORS.orange },
    { x: 5, y: 11, color: COLORS.dark },
    { x: 2, y: 12, color: COLORS.dark },
    { x: 3, y: 12, color: COLORS.orange },
    { x: 4, y: 12, color: COLORS.dark },
    { x: 1, y: 13, color: COLORS.dark },
    { x: 2, y: 13, color: COLORS.dark },
    { x: 3, y: 13, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size} viewBox="0 0 60 60" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MESSAGE BOX VARIATIONS - Same chef hat, different bubble styles
// ─────────────────────────────────────────────────────────────────────────────

// MESSAGE BOX A: SOFT BUBBLE - Rounded, organic shape
export function PixelLogoSoftBubble({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // ══════════════════════════════════════════════════════════
    // CHEF HAT - Same pleated design
    // ══════════════════════════════════════════════════════════
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 8, y: 0, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 9, y: 1, color: COLORS.hatWhite },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatWhite },
    { x: 10, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 3, color: COLORS.hatWhite },
    { x: 6, y: 3, color: COLORS.hatShadow },
    { x: 7, y: 3, color: COLORS.hatWhite },
    { x: 8, y: 3, color: COLORS.hatShadow },
    { x: 9, y: 3, color: COLORS.hatWhite },
    { x: 5, y: 4, color: COLORS.hatWhite },
    { x: 6, y: 4, color: COLORS.hatShadow },
    { x: 7, y: 4, color: COLORS.hatWhite },
    { x: 8, y: 4, color: COLORS.hatShadow },
    { x: 9, y: 4, color: COLORS.hatWhite },
    { x: 4, y: 5, color: COLORS.dark },
    { x: 5, y: 5, color: COLORS.dark },
    { x: 6, y: 5, color: COLORS.dark },
    { x: 7, y: 5, color: COLORS.dark },
    { x: 8, y: 5, color: COLORS.dark },
    { x: 9, y: 5, color: COLORS.dark },
    { x: 10, y: 5, color: COLORS.dark },

    // ══════════════════════════════════════════════════════════
    // SOFT ROUNDED BUBBLE - Extra rounded corners
    // ══════════════════════════════════════════════════════════
    // Very rounded top (starts narrow)
    { x: 5, y: 6, color: COLORS.dark },
    { x: 6, y: 6, color: COLORS.dark },
    { x: 7, y: 6, color: COLORS.dark },
    { x: 8, y: 6, color: COLORS.dark },
    { x: 9, y: 6, color: COLORS.dark },
    // Row with rounded corners
    { x: 4, y: 7, color: COLORS.dark },
    { x: 5, y: 7, color: COLORS.cream },
    { x: 6, y: 7, color: COLORS.cream },
    { x: 7, y: 7, color: COLORS.cream },
    { x: 8, y: 7, color: COLORS.cream },
    { x: 9, y: 7, color: COLORS.cream },
    { x: 10, y: 7, color: COLORS.dark },
    // Widest row with dots
    { x: 3, y: 8, color: COLORS.dark },
    { x: 4, y: 8, color: COLORS.cream },
    { x: 5, y: 8, color: COLORS.orange },
    { x: 6, y: 8, color: COLORS.cream },
    { x: 7, y: 8, color: COLORS.orange },
    { x: 8, y: 8, color: COLORS.cream },
    { x: 9, y: 8, color: COLORS.orange },
    { x: 10, y: 8, color: COLORS.cream },
    { x: 11, y: 8, color: COLORS.dark },
    // Row 3
    { x: 3, y: 9, color: COLORS.dark },
    { x: 4, y: 9, color: COLORS.cream },
    { x: 5, y: 9, color: COLORS.cream },
    { x: 6, y: 9, color: COLORS.cream },
    { x: 7, y: 9, color: COLORS.cream },
    { x: 8, y: 9, color: COLORS.cream },
    { x: 9, y: 9, color: COLORS.cream },
    { x: 10, y: 9, color: COLORS.cream },
    { x: 11, y: 9, color: COLORS.dark },
    // Narrowing bottom
    { x: 4, y: 10, color: COLORS.dark },
    { x: 5, y: 10, color: COLORS.cream },
    { x: 6, y: 10, color: COLORS.cream },
    { x: 7, y: 10, color: COLORS.cream },
    { x: 8, y: 10, color: COLORS.cream },
    { x: 9, y: 10, color: COLORS.cream },
    { x: 10, y: 10, color: COLORS.dark },
    // Rounded bottom
    { x: 5, y: 11, color: COLORS.dark },
    { x: 6, y: 11, color: COLORS.dark },
    { x: 7, y: 11, color: COLORS.dark },
    { x: 8, y: 11, color: COLORS.dark },
    { x: 9, y: 11, color: COLORS.dark },
    // Smooth curved tail
    { x: 3, y: 10, color: COLORS.dark },
    { x: 2, y: 11, color: COLORS.dark },
    { x: 3, y: 11, color: COLORS.cream },
    { x: 4, y: 11, color: COLORS.dark },
    { x: 1, y: 12, color: COLORS.dark },
    { x: 2, y: 12, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.1} viewBox="0 0 56 56" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// MESSAGE BOX B: THOUGHT BUBBLE - Dreamy cloud with circle dots
export function PixelLogoThought({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // ══════════════════════════════════════════════════════════
    // CHEF HAT - Same pleated design
    // ══════════════════════════════════════════════════════════
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 8, y: 0, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 9, y: 1, color: COLORS.hatWhite },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatWhite },
    { x: 10, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 3, color: COLORS.hatWhite },
    { x: 6, y: 3, color: COLORS.hatShadow },
    { x: 7, y: 3, color: COLORS.hatWhite },
    { x: 8, y: 3, color: COLORS.hatShadow },
    { x: 9, y: 3, color: COLORS.hatWhite },
    { x: 5, y: 4, color: COLORS.hatWhite },
    { x: 6, y: 4, color: COLORS.hatShadow },
    { x: 7, y: 4, color: COLORS.hatWhite },
    { x: 8, y: 4, color: COLORS.hatShadow },
    { x: 9, y: 4, color: COLORS.hatWhite },
    { x: 4, y: 5, color: COLORS.dark },
    { x: 5, y: 5, color: COLORS.dark },
    { x: 6, y: 5, color: COLORS.dark },
    { x: 7, y: 5, color: COLORS.dark },
    { x: 8, y: 5, color: COLORS.dark },
    { x: 9, y: 5, color: COLORS.dark },
    { x: 10, y: 5, color: COLORS.dark },

    // ══════════════════════════════════════════════════════════
    // THOUGHT BUBBLE - Cloud shape
    // ══════════════════════════════════════════════════════════
    // Cloud top bumps
    { x: 5, y: 6, color: COLORS.dark },
    { x: 6, y: 6, color: COLORS.dark },
    { x: 8, y: 6, color: COLORS.dark },
    { x: 9, y: 6, color: COLORS.dark },
    // Cloud body
    { x: 4, y: 7, color: COLORS.dark },
    { x: 5, y: 7, color: COLORS.cream },
    { x: 6, y: 7, color: COLORS.cream },
    { x: 7, y: 7, color: COLORS.dark },
    { x: 8, y: 7, color: COLORS.cream },
    { x: 9, y: 7, color: COLORS.cream },
    { x: 10, y: 7, color: COLORS.dark },
    // Main body with dots
    { x: 3, y: 8, color: COLORS.dark },
    { x: 4, y: 8, color: COLORS.cream },
    { x: 5, y: 8, color: COLORS.orange },
    { x: 6, y: 8, color: COLORS.cream },
    { x: 7, y: 8, color: COLORS.orange },
    { x: 8, y: 8, color: COLORS.cream },
    { x: 9, y: 8, color: COLORS.orange },
    { x: 10, y: 8, color: COLORS.cream },
    { x: 11, y: 8, color: COLORS.dark },
    // Lower body
    { x: 3, y: 9, color: COLORS.dark },
    { x: 4, y: 9, color: COLORS.cream },
    { x: 5, y: 9, color: COLORS.cream },
    { x: 6, y: 9, color: COLORS.cream },
    { x: 7, y: 9, color: COLORS.cream },
    { x: 8, y: 9, color: COLORS.cream },
    { x: 9, y: 9, color: COLORS.cream },
    { x: 10, y: 9, color: COLORS.cream },
    { x: 11, y: 9, color: COLORS.dark },
    // Cloud bottom
    { x: 4, y: 10, color: COLORS.dark },
    { x: 5, y: 10, color: COLORS.dark },
    { x: 6, y: 10, color: COLORS.dark },
    { x: 7, y: 10, color: COLORS.dark },
    { x: 8, y: 10, color: COLORS.dark },
    { x: 9, y: 10, color: COLORS.dark },
    { x: 10, y: 10, color: COLORS.dark },
    // Thought bubble circles (descending)
    { x: 4, y: 11, color: COLORS.dark },
    { x: 5, y: 11, color: COLORS.cream },
    { x: 6, y: 11, color: COLORS.dark },
    { x: 3, y: 12, color: COLORS.dark },
    { x: 4, y: 12, color: COLORS.dark },
    { x: 2, y: 13, color: COLORS.dark },
    { x: 3, y: 13, color: COLORS.cream },
    { x: 4, y: 13, color: COLORS.dark },
    { x: 1, y: 14, color: COLORS.dark },
    { x: 2, y: 14, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.2} viewBox="0 0 56 64" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// MESSAGE BOX C: ENVELOPE - Message/mail style
export function PixelLogoEnvelope({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // ══════════════════════════════════════════════════════════
    // CHEF HAT - Same pleated design
    // ══════════════════════════════════════════════════════════
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 8, y: 0, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 9, y: 1, color: COLORS.hatWhite },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatWhite },
    { x: 10, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 3, color: COLORS.hatWhite },
    { x: 6, y: 3, color: COLORS.hatShadow },
    { x: 7, y: 3, color: COLORS.hatWhite },
    { x: 8, y: 3, color: COLORS.hatShadow },
    { x: 9, y: 3, color: COLORS.hatWhite },
    { x: 5, y: 4, color: COLORS.hatWhite },
    { x: 6, y: 4, color: COLORS.hatShadow },
    { x: 7, y: 4, color: COLORS.hatWhite },
    { x: 8, y: 4, color: COLORS.hatShadow },
    { x: 9, y: 4, color: COLORS.hatWhite },
    { x: 4, y: 5, color: COLORS.dark },
    { x: 5, y: 5, color: COLORS.dark },
    { x: 6, y: 5, color: COLORS.dark },
    { x: 7, y: 5, color: COLORS.dark },
    { x: 8, y: 5, color: COLORS.dark },
    { x: 9, y: 5, color: COLORS.dark },
    { x: 10, y: 5, color: COLORS.dark },

    // ══════════════════════════════════════════════════════════
    // ENVELOPE - With flap and seal
    // ══════════════════════════════════════════════════════════
    // Top edge
    { x: 3, y: 6, color: COLORS.dark },
    { x: 4, y: 6, color: COLORS.dark },
    { x: 5, y: 6, color: COLORS.dark },
    { x: 6, y: 6, color: COLORS.dark },
    { x: 7, y: 6, color: COLORS.dark },
    { x: 8, y: 6, color: COLORS.dark },
    { x: 9, y: 6, color: COLORS.dark },
    { x: 10, y: 6, color: COLORS.dark },
    { x: 11, y: 6, color: COLORS.dark },
    // Envelope flap - diagonal lines pointing to center
    { x: 3, y: 7, color: COLORS.dark },
    { x: 4, y: 7, color: COLORS.cream },
    { x: 5, y: 7, color: COLORS.dark },
    { x: 6, y: 7, color: COLORS.cream },
    { x: 7, y: 7, color: COLORS.cream },
    { x: 8, y: 7, color: COLORS.cream },
    { x: 9, y: 7, color: COLORS.dark },
    { x: 10, y: 7, color: COLORS.cream },
    { x: 11, y: 7, color: COLORS.dark },
    // Flap point with seal
    { x: 3, y: 8, color: COLORS.dark },
    { x: 4, y: 8, color: COLORS.cream },
    { x: 5, y: 8, color: COLORS.cream },
    { x: 6, y: 8, color: COLORS.dark },
    { x: 7, y: 8, color: COLORS.orange }, // seal center
    { x: 8, y: 8, color: COLORS.dark },
    { x: 9, y: 8, color: COLORS.cream },
    { x: 10, y: 8, color: COLORS.cream },
    { x: 11, y: 8, color: COLORS.dark },
    // Body with text lines
    { x: 3, y: 9, color: COLORS.dark },
    { x: 4, y: 9, color: COLORS.cream },
    { x: 5, y: 9, color: COLORS.cream },
    { x: 6, y: 9, color: COLORS.cream },
    { x: 7, y: 9, color: COLORS.cream },
    { x: 8, y: 9, color: COLORS.cream },
    { x: 9, y: 9, color: COLORS.cream },
    { x: 10, y: 9, color: COLORS.cream },
    { x: 11, y: 9, color: COLORS.dark },
    // Body row with text lines
    { x: 3, y: 10, color: COLORS.dark },
    { x: 4, y: 10, color: COLORS.cream },
    { x: 5, y: 10, color: COLORS.orange },
    { x: 6, y: 10, color: COLORS.orange },
    { x: 7, y: 10, color: COLORS.orange },
    { x: 8, y: 10, color: COLORS.orange },
    { x: 9, y: 10, color: COLORS.cream },
    { x: 10, y: 10, color: COLORS.cream },
    { x: 11, y: 10, color: COLORS.dark },
    // Bottom edge
    { x: 3, y: 11, color: COLORS.dark },
    { x: 4, y: 11, color: COLORS.dark },
    { x: 5, y: 11, color: COLORS.dark },
    { x: 6, y: 11, color: COLORS.dark },
    { x: 7, y: 11, color: COLORS.dark },
    { x: 8, y: 11, color: COLORS.dark },
    { x: 9, y: 11, color: COLORS.dark },
    { x: 10, y: 11, color: COLORS.dark },
    { x: 11, y: 11, color: COLORS.dark },
    // Small tail
    { x: 2, y: 11, color: COLORS.dark },
    { x: 2, y: 12, color: COLORS.dark },
    { x: 3, y: 12, color: COLORS.cream },
    { x: 4, y: 12, color: COLORS.dark },
    { x: 1, y: 13, color: COLORS.dark },
    { x: 2, y: 13, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.1} viewBox="0 0 56 60" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// MESSAGE BOX D: TEXT LINES - Shows actual "text" content
export function PixelLogoTextLines({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // ══════════════════════════════════════════════════════════
    // CHEF HAT - Same pleated design
    // ══════════════════════════════════════════════════════════
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 8, y: 0, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 9, y: 1, color: COLORS.hatWhite },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatWhite },
    { x: 10, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 3, color: COLORS.hatWhite },
    { x: 6, y: 3, color: COLORS.hatShadow },
    { x: 7, y: 3, color: COLORS.hatWhite },
    { x: 8, y: 3, color: COLORS.hatShadow },
    { x: 9, y: 3, color: COLORS.hatWhite },
    { x: 5, y: 4, color: COLORS.hatWhite },
    { x: 6, y: 4, color: COLORS.hatShadow },
    { x: 7, y: 4, color: COLORS.hatWhite },
    { x: 8, y: 4, color: COLORS.hatShadow },
    { x: 9, y: 4, color: COLORS.hatWhite },
    { x: 4, y: 5, color: COLORS.dark },
    { x: 5, y: 5, color: COLORS.dark },
    { x: 6, y: 5, color: COLORS.dark },
    { x: 7, y: 5, color: COLORS.dark },
    { x: 8, y: 5, color: COLORS.dark },
    { x: 9, y: 5, color: COLORS.dark },
    { x: 10, y: 5, color: COLORS.dark },

    // ══════════════════════════════════════════════════════════
    // TEXT LINES BUBBLE - Shows "text" content
    // ══════════════════════════════════════════════════════════
    // Top edge
    { x: 4, y: 6, color: COLORS.dark },
    { x: 5, y: 6, color: COLORS.dark },
    { x: 6, y: 6, color: COLORS.dark },
    { x: 7, y: 6, color: COLORS.dark },
    { x: 8, y: 6, color: COLORS.dark },
    { x: 9, y: 6, color: COLORS.dark },
    { x: 10, y: 6, color: COLORS.dark },
    // Body row 1 - long text line
    { x: 3, y: 7, color: COLORS.dark },
    { x: 4, y: 7, color: COLORS.cream },
    { x: 5, y: 7, color: COLORS.orange },
    { x: 6, y: 7, color: COLORS.orange },
    { x: 7, y: 7, color: COLORS.orange },
    { x: 8, y: 7, color: COLORS.orange },
    { x: 9, y: 7, color: COLORS.orange },
    { x: 10, y: 7, color: COLORS.cream },
    { x: 11, y: 7, color: COLORS.dark },
    // Body row 2 - medium text line
    { x: 3, y: 8, color: COLORS.dark },
    { x: 4, y: 8, color: COLORS.cream },
    { x: 5, y: 8, color: COLORS.orange },
    { x: 6, y: 8, color: COLORS.orange },
    { x: 7, y: 8, color: COLORS.orange },
    { x: 8, y: 8, color: COLORS.cream },
    { x: 9, y: 8, color: COLORS.cream },
    { x: 10, y: 8, color: COLORS.cream },
    { x: 11, y: 8, color: COLORS.dark },
    // Body row 3 - short text line
    { x: 3, y: 9, color: COLORS.dark },
    { x: 4, y: 9, color: COLORS.cream },
    { x: 5, y: 9, color: COLORS.orange },
    { x: 6, y: 9, color: COLORS.orange },
    { x: 7, y: 9, color: COLORS.cream },
    { x: 8, y: 9, color: COLORS.cream },
    { x: 9, y: 9, color: COLORS.cream },
    { x: 10, y: 9, color: COLORS.cream },
    { x: 11, y: 9, color: COLORS.dark },
    // Body row 4 - empty
    { x: 3, y: 10, color: COLORS.dark },
    { x: 4, y: 10, color: COLORS.cream },
    { x: 5, y: 10, color: COLORS.cream },
    { x: 6, y: 10, color: COLORS.cream },
    { x: 7, y: 10, color: COLORS.cream },
    { x: 8, y: 10, color: COLORS.cream },
    { x: 9, y: 10, color: COLORS.cream },
    { x: 10, y: 10, color: COLORS.cream },
    { x: 11, y: 10, color: COLORS.dark },
    // Bottom edge
    { x: 4, y: 11, color: COLORS.dark },
    { x: 5, y: 11, color: COLORS.dark },
    { x: 6, y: 11, color: COLORS.dark },
    { x: 7, y: 11, color: COLORS.dark },
    { x: 8, y: 11, color: COLORS.dark },
    { x: 9, y: 11, color: COLORS.dark },
    { x: 10, y: 11, color: COLORS.dark },
    // Chat tail
    { x: 3, y: 11, color: COLORS.dark },
    { x: 3, y: 12, color: COLORS.dark },
    { x: 4, y: 12, color: COLORS.cream },
    { x: 5, y: 12, color: COLORS.dark },
    { x: 2, y: 13, color: COLORS.dark },
    { x: 3, y: 13, color: COLORS.cream },
    { x: 4, y: 13, color: COLORS.dark },
    { x: 1, y: 14, color: COLORS.dark },
    { x: 2, y: 14, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.2} viewBox="0 0 56 64" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// MESSAGE BOX E: MODERN APP - Bottom-right tail like iMessage
export function PixelLogoModernTail({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // ══════════════════════════════════════════════════════════
    // CHEF HAT - Same pleated design
    // ══════════════════════════════════════════════════════════
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 8, y: 0, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 9, y: 1, color: COLORS.hatWhite },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatWhite },
    { x: 10, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 3, color: COLORS.hatWhite },
    { x: 6, y: 3, color: COLORS.hatShadow },
    { x: 7, y: 3, color: COLORS.hatWhite },
    { x: 8, y: 3, color: COLORS.hatShadow },
    { x: 9, y: 3, color: COLORS.hatWhite },
    { x: 5, y: 4, color: COLORS.hatWhite },
    { x: 6, y: 4, color: COLORS.hatShadow },
    { x: 7, y: 4, color: COLORS.hatWhite },
    { x: 8, y: 4, color: COLORS.hatShadow },
    { x: 9, y: 4, color: COLORS.hatWhite },
    { x: 4, y: 5, color: COLORS.dark },
    { x: 5, y: 5, color: COLORS.dark },
    { x: 6, y: 5, color: COLORS.dark },
    { x: 7, y: 5, color: COLORS.dark },
    { x: 8, y: 5, color: COLORS.dark },
    { x: 9, y: 5, color: COLORS.dark },
    { x: 10, y: 5, color: COLORS.dark },

    // ══════════════════════════════════════════════════════════
    // MODERN BUBBLE - Bottom-right tail (iMessage style)
    // ══════════════════════════════════════════════════════════
    // Top edge
    { x: 3, y: 6, color: COLORS.dark },
    { x: 4, y: 6, color: COLORS.dark },
    { x: 5, y: 6, color: COLORS.dark },
    { x: 6, y: 6, color: COLORS.dark },
    { x: 7, y: 6, color: COLORS.dark },
    { x: 8, y: 6, color: COLORS.dark },
    { x: 9, y: 6, color: COLORS.dark },
    { x: 10, y: 6, color: COLORS.dark },
    { x: 11, y: 6, color: COLORS.dark },
    // Body row 1
    { x: 3, y: 7, color: COLORS.dark },
    { x: 4, y: 7, color: COLORS.cream },
    { x: 5, y: 7, color: COLORS.cream },
    { x: 6, y: 7, color: COLORS.cream },
    { x: 7, y: 7, color: COLORS.cream },
    { x: 8, y: 7, color: COLORS.cream },
    { x: 9, y: 7, color: COLORS.cream },
    { x: 10, y: 7, color: COLORS.cream },
    { x: 11, y: 7, color: COLORS.dark },
    // Body row 2 - with dots
    { x: 3, y: 8, color: COLORS.dark },
    { x: 4, y: 8, color: COLORS.cream },
    { x: 5, y: 8, color: COLORS.orange },
    { x: 6, y: 8, color: COLORS.cream },
    { x: 7, y: 8, color: COLORS.orange },
    { x: 8, y: 8, color: COLORS.cream },
    { x: 9, y: 8, color: COLORS.orange },
    { x: 10, y: 8, color: COLORS.cream },
    { x: 11, y: 8, color: COLORS.dark },
    // Body row 3
    { x: 3, y: 9, color: COLORS.dark },
    { x: 4, y: 9, color: COLORS.cream },
    { x: 5, y: 9, color: COLORS.cream },
    { x: 6, y: 9, color: COLORS.cream },
    { x: 7, y: 9, color: COLORS.cream },
    { x: 8, y: 9, color: COLORS.cream },
    { x: 9, y: 9, color: COLORS.cream },
    { x: 10, y: 9, color: COLORS.cream },
    { x: 11, y: 9, color: COLORS.dark },
    // Bottom edge - partial for tail
    { x: 3, y: 10, color: COLORS.dark },
    { x: 4, y: 10, color: COLORS.dark },
    { x: 5, y: 10, color: COLORS.dark },
    { x: 6, y: 10, color: COLORS.dark },
    { x: 7, y: 10, color: COLORS.dark },
    { x: 8, y: 10, color: COLORS.dark },
    { x: 9, y: 10, color: COLORS.cream },
    { x: 10, y: 10, color: COLORS.cream },
    { x: 11, y: 10, color: COLORS.dark },
    // Modern tail (bottom-right, curves down)
    { x: 9, y: 11, color: COLORS.dark },
    { x: 10, y: 11, color: COLORS.cream },
    { x: 11, y: 11, color: COLORS.dark },
    { x: 12, y: 11, color: COLORS.dark },
    { x: 10, y: 12, color: COLORS.dark },
    { x: 11, y: 12, color: COLORS.cream },
    { x: 12, y: 12, color: COLORS.dark },
    { x: 11, y: 13, color: COLORS.dark },
    { x: 12, y: 13, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.1} viewBox="0 0 56 60" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODERN VARIATIONS - Tweaks on the Modern App style
// ═══════════════════════════════════════════════════════════════════════════════

// V1: ROUNDER HAT - More puffy/rounded chef hat
export function PixelLogoModernV1({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // CHEF HAT - Extra round/puffy top
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 8, y: 0, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 9, y: 1, color: COLORS.hatWhite },
    // Extra roundness - bulge on sides
    { x: 3, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatWhite },
    { x: 10, y: 2, color: COLORS.hatWhite },
    { x: 11, y: 2, color: COLORS.hatWhite },
    // Pleats
    { x: 4, y: 3, color: COLORS.hatWhite },
    { x: 5, y: 3, color: COLORS.hatShadow },
    { x: 6, y: 3, color: COLORS.hatWhite },
    { x: 7, y: 3, color: COLORS.hatShadow },
    { x: 8, y: 3, color: COLORS.hatWhite },
    { x: 9, y: 3, color: COLORS.hatShadow },
    { x: 10, y: 3, color: COLORS.hatWhite },
    { x: 4, y: 4, color: COLORS.hatWhite },
    { x: 5, y: 4, color: COLORS.hatShadow },
    { x: 6, y: 4, color: COLORS.hatWhite },
    { x: 7, y: 4, color: COLORS.hatShadow },
    { x: 8, y: 4, color: COLORS.hatWhite },
    { x: 9, y: 4, color: COLORS.hatShadow },
    { x: 10, y: 4, color: COLORS.hatWhite },
    // Hat band
    { x: 4, y: 5, color: COLORS.dark },
    { x: 5, y: 5, color: COLORS.dark },
    { x: 6, y: 5, color: COLORS.dark },
    { x: 7, y: 5, color: COLORS.dark },
    { x: 8, y: 5, color: COLORS.dark },
    { x: 9, y: 5, color: COLORS.dark },
    { x: 10, y: 5, color: COLORS.dark },

    // MODERN BUBBLE - Same as original
    { x: 3, y: 6, color: COLORS.dark },
    { x: 4, y: 6, color: COLORS.dark },
    { x: 5, y: 6, color: COLORS.dark },
    { x: 6, y: 6, color: COLORS.dark },
    { x: 7, y: 6, color: COLORS.dark },
    { x: 8, y: 6, color: COLORS.dark },
    { x: 9, y: 6, color: COLORS.dark },
    { x: 10, y: 6, color: COLORS.dark },
    { x: 11, y: 6, color: COLORS.dark },
    { x: 3, y: 7, color: COLORS.dark },
    { x: 4, y: 7, color: COLORS.cream },
    { x: 5, y: 7, color: COLORS.cream },
    { x: 6, y: 7, color: COLORS.cream },
    { x: 7, y: 7, color: COLORS.cream },
    { x: 8, y: 7, color: COLORS.cream },
    { x: 9, y: 7, color: COLORS.cream },
    { x: 10, y: 7, color: COLORS.cream },
    { x: 11, y: 7, color: COLORS.dark },
    { x: 3, y: 8, color: COLORS.dark },
    { x: 4, y: 8, color: COLORS.cream },
    { x: 5, y: 8, color: COLORS.orange },
    { x: 6, y: 8, color: COLORS.cream },
    { x: 7, y: 8, color: COLORS.orange },
    { x: 8, y: 8, color: COLORS.cream },
    { x: 9, y: 8, color: COLORS.orange },
    { x: 10, y: 8, color: COLORS.cream },
    { x: 11, y: 8, color: COLORS.dark },
    { x: 3, y: 9, color: COLORS.dark },
    { x: 4, y: 9, color: COLORS.cream },
    { x: 5, y: 9, color: COLORS.cream },
    { x: 6, y: 9, color: COLORS.cream },
    { x: 7, y: 9, color: COLORS.cream },
    { x: 8, y: 9, color: COLORS.cream },
    { x: 9, y: 9, color: COLORS.cream },
    { x: 10, y: 9, color: COLORS.cream },
    { x: 11, y: 9, color: COLORS.dark },
    { x: 3, y: 10, color: COLORS.dark },
    { x: 4, y: 10, color: COLORS.dark },
    { x: 5, y: 10, color: COLORS.dark },
    { x: 6, y: 10, color: COLORS.dark },
    { x: 7, y: 10, color: COLORS.dark },
    { x: 8, y: 10, color: COLORS.dark },
    { x: 9, y: 10, color: COLORS.cream },
    { x: 10, y: 10, color: COLORS.cream },
    { x: 11, y: 10, color: COLORS.dark },
    { x: 9, y: 11, color: COLORS.dark },
    { x: 10, y: 11, color: COLORS.cream },
    { x: 11, y: 11, color: COLORS.dark },
    { x: 12, y: 11, color: COLORS.dark },
    { x: 10, y: 12, color: COLORS.dark },
    { x: 11, y: 12, color: COLORS.cream },
    { x: 12, y: 12, color: COLORS.dark },
    { x: 11, y: 13, color: COLORS.dark },
    { x: 12, y: 13, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.1} viewBox="0 0 56 60" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// V1 VARIATIONS (a-j) - Same rounder hat, different chat bubbles
// User wants clean/simple bubbles suitable for text "Babe What's For Dinner"
// ═══════════════════════════════════════════════════════════════════════════════

// V1a: Larger bubble with small bottom-left tail (like reference image)
export function PixelLogoV1a({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // CHEF HAT - V1 rounder hat (same across all variations)
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 8, y: 0, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 9, y: 1, color: COLORS.hatWhite },
    { x: 3, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatWhite },
    { x: 10, y: 2, color: COLORS.hatWhite },
    { x: 11, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 3, color: COLORS.hatWhite },
    { x: 5, y: 3, color: COLORS.hatShadow },
    { x: 6, y: 3, color: COLORS.hatWhite },
    { x: 7, y: 3, color: COLORS.hatShadow },
    { x: 8, y: 3, color: COLORS.hatWhite },
    { x: 9, y: 3, color: COLORS.hatShadow },
    { x: 10, y: 3, color: COLORS.hatWhite },
    { x: 4, y: 4, color: COLORS.hatWhite },
    { x: 5, y: 4, color: COLORS.hatShadow },
    { x: 6, y: 4, color: COLORS.hatWhite },
    { x: 7, y: 4, color: COLORS.hatShadow },
    { x: 8, y: 4, color: COLORS.hatWhite },
    { x: 9, y: 4, color: COLORS.hatShadow },
    { x: 10, y: 4, color: COLORS.hatWhite },
    { x: 4, y: 5, color: COLORS.dark },
    { x: 5, y: 5, color: COLORS.dark },
    { x: 6, y: 5, color: COLORS.dark },
    { x: 7, y: 5, color: COLORS.dark },
    { x: 8, y: 5, color: COLORS.dark },
    { x: 9, y: 5, color: COLORS.dark },
    { x: 10, y: 5, color: COLORS.dark },

    // CHAT BUBBLE - Large, clean, soft corners, small bottom-left tail
    // Top edge (soft corners)
    { x: 3, y: 6, color: COLORS.dark },
    { x: 4, y: 6, color: COLORS.dark },
    { x: 5, y: 6, color: COLORS.dark },
    { x: 6, y: 6, color: COLORS.dark },
    { x: 7, y: 6, color: COLORS.dark },
    { x: 8, y: 6, color: COLORS.dark },
    { x: 9, y: 6, color: COLORS.dark },
    { x: 10, y: 6, color: COLORS.dark },
    { x: 11, y: 6, color: COLORS.dark },
    // Body rows (cream interior)
    { x: 2, y: 7, color: COLORS.dark },
    { x: 3, y: 7, color: COLORS.cream },
    { x: 4, y: 7, color: COLORS.cream },
    { x: 5, y: 7, color: COLORS.cream },
    { x: 6, y: 7, color: COLORS.cream },
    { x: 7, y: 7, color: COLORS.cream },
    { x: 8, y: 7, color: COLORS.cream },
    { x: 9, y: 7, color: COLORS.cream },
    { x: 10, y: 7, color: COLORS.cream },
    { x: 11, y: 7, color: COLORS.cream },
    { x: 12, y: 7, color: COLORS.dark },
    { x: 2, y: 8, color: COLORS.dark },
    { x: 3, y: 8, color: COLORS.cream },
    { x: 4, y: 8, color: COLORS.cream },
    { x: 5, y: 8, color: COLORS.cream },
    { x: 6, y: 8, color: COLORS.cream },
    { x: 7, y: 8, color: COLORS.cream },
    { x: 8, y: 8, color: COLORS.cream },
    { x: 9, y: 8, color: COLORS.cream },
    { x: 10, y: 8, color: COLORS.cream },
    { x: 11, y: 8, color: COLORS.cream },
    { x: 12, y: 8, color: COLORS.dark },
    { x: 2, y: 9, color: COLORS.dark },
    { x: 3, y: 9, color: COLORS.cream },
    { x: 4, y: 9, color: COLORS.cream },
    { x: 5, y: 9, color: COLORS.cream },
    { x: 6, y: 9, color: COLORS.cream },
    { x: 7, y: 9, color: COLORS.cream },
    { x: 8, y: 9, color: COLORS.cream },
    { x: 9, y: 9, color: COLORS.cream },
    { x: 10, y: 9, color: COLORS.cream },
    { x: 11, y: 9, color: COLORS.cream },
    { x: 12, y: 9, color: COLORS.dark },
    { x: 2, y: 10, color: COLORS.dark },
    { x: 3, y: 10, color: COLORS.cream },
    { x: 4, y: 10, color: COLORS.cream },
    { x: 5, y: 10, color: COLORS.cream },
    { x: 6, y: 10, color: COLORS.cream },
    { x: 7, y: 10, color: COLORS.cream },
    { x: 8, y: 10, color: COLORS.cream },
    { x: 9, y: 10, color: COLORS.cream },
    { x: 10, y: 10, color: COLORS.cream },
    { x: 11, y: 10, color: COLORS.cream },
    { x: 12, y: 10, color: COLORS.dark },
    // Bottom edge with small tail
    { x: 3, y: 11, color: COLORS.dark },
    { x: 4, y: 11, color: COLORS.dark },
    { x: 5, y: 11, color: COLORS.dark },
    { x: 6, y: 11, color: COLORS.dark },
    { x: 7, y: 11, color: COLORS.dark },
    { x: 8, y: 11, color: COLORS.dark },
    { x: 9, y: 11, color: COLORS.dark },
    { x: 10, y: 11, color: COLORS.dark },
    { x: 11, y: 11, color: COLORS.dark },
    // Small tail (bottom-left)
    { x: 2, y: 11, color: COLORS.dark },
    { x: 1, y: 12, color: COLORS.dark },
    { x: 2, y: 12, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.1} viewBox="0 0 56 56" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// V1b: Same bubble but softer/more rounded corners
export function PixelLogoV1b({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // CHEF HAT - V1 rounder hat
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 8, y: 0, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 9, y: 1, color: COLORS.hatWhite },
    { x: 3, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatWhite },
    { x: 10, y: 2, color: COLORS.hatWhite },
    { x: 11, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 3, color: COLORS.hatWhite },
    { x: 5, y: 3, color: COLORS.hatShadow },
    { x: 6, y: 3, color: COLORS.hatWhite },
    { x: 7, y: 3, color: COLORS.hatShadow },
    { x: 8, y: 3, color: COLORS.hatWhite },
    { x: 9, y: 3, color: COLORS.hatShadow },
    { x: 10, y: 3, color: COLORS.hatWhite },
    { x: 4, y: 4, color: COLORS.hatWhite },
    { x: 5, y: 4, color: COLORS.hatShadow },
    { x: 6, y: 4, color: COLORS.hatWhite },
    { x: 7, y: 4, color: COLORS.hatShadow },
    { x: 8, y: 4, color: COLORS.hatWhite },
    { x: 9, y: 4, color: COLORS.hatShadow },
    { x: 10, y: 4, color: COLORS.hatWhite },
    { x: 4, y: 5, color: COLORS.dark },
    { x: 5, y: 5, color: COLORS.dark },
    { x: 6, y: 5, color: COLORS.dark },
    { x: 7, y: 5, color: COLORS.dark },
    { x: 8, y: 5, color: COLORS.dark },
    { x: 9, y: 5, color: COLORS.dark },
    { x: 10, y: 5, color: COLORS.dark },

    // CHAT BUBBLE - Extra soft corners (2px corner cuts)
    // Top edge (very soft - narrower)
    { x: 4, y: 6, color: COLORS.dark },
    { x: 5, y: 6, color: COLORS.dark },
    { x: 6, y: 6, color: COLORS.dark },
    { x: 7, y: 6, color: COLORS.dark },
    { x: 8, y: 6, color: COLORS.dark },
    { x: 9, y: 6, color: COLORS.dark },
    { x: 10, y: 6, color: COLORS.dark },
    // Second row (wider)
    { x: 3, y: 7, color: COLORS.dark },
    { x: 4, y: 7, color: COLORS.cream },
    { x: 5, y: 7, color: COLORS.cream },
    { x: 6, y: 7, color: COLORS.cream },
    { x: 7, y: 7, color: COLORS.cream },
    { x: 8, y: 7, color: COLORS.cream },
    { x: 9, y: 7, color: COLORS.cream },
    { x: 10, y: 7, color: COLORS.cream },
    { x: 11, y: 7, color: COLORS.dark },
    // Body rows
    { x: 2, y: 8, color: COLORS.dark },
    { x: 3, y: 8, color: COLORS.cream },
    { x: 4, y: 8, color: COLORS.cream },
    { x: 5, y: 8, color: COLORS.cream },
    { x: 6, y: 8, color: COLORS.cream },
    { x: 7, y: 8, color: COLORS.cream },
    { x: 8, y: 8, color: COLORS.cream },
    { x: 9, y: 8, color: COLORS.cream },
    { x: 10, y: 8, color: COLORS.cream },
    { x: 11, y: 8, color: COLORS.cream },
    { x: 12, y: 8, color: COLORS.dark },
    { x: 2, y: 9, color: COLORS.dark },
    { x: 3, y: 9, color: COLORS.cream },
    { x: 4, y: 9, color: COLORS.cream },
    { x: 5, y: 9, color: COLORS.cream },
    { x: 6, y: 9, color: COLORS.cream },
    { x: 7, y: 9, color: COLORS.cream },
    { x: 8, y: 9, color: COLORS.cream },
    { x: 9, y: 9, color: COLORS.cream },
    { x: 10, y: 9, color: COLORS.cream },
    { x: 11, y: 9, color: COLORS.cream },
    { x: 12, y: 9, color: COLORS.dark },
    // Bottom rows (soft corners again)
    { x: 3, y: 10, color: COLORS.dark },
    { x: 4, y: 10, color: COLORS.cream },
    { x: 5, y: 10, color: COLORS.cream },
    { x: 6, y: 10, color: COLORS.cream },
    { x: 7, y: 10, color: COLORS.cream },
    { x: 8, y: 10, color: COLORS.cream },
    { x: 9, y: 10, color: COLORS.cream },
    { x: 10, y: 10, color: COLORS.cream },
    { x: 11, y: 10, color: COLORS.dark },
    { x: 4, y: 11, color: COLORS.dark },
    { x: 5, y: 11, color: COLORS.dark },
    { x: 6, y: 11, color: COLORS.dark },
    { x: 7, y: 11, color: COLORS.dark },
    { x: 8, y: 11, color: COLORS.dark },
    { x: 9, y: 11, color: COLORS.dark },
    { x: 10, y: 11, color: COLORS.dark },
    // Small tail
    { x: 2, y: 10, color: COLORS.dark },
    { x: 1, y: 11, color: COLORS.dark },
    { x: 2, y: 11, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.0} viewBox="0 0 56 52" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// V1c: Wider bubble, minimal/subtle tail
export function PixelLogoV1c({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // CHEF HAT - V1 rounder hat
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 8, y: 0, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 9, y: 1, color: COLORS.hatWhite },
    { x: 3, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatWhite },
    { x: 10, y: 2, color: COLORS.hatWhite },
    { x: 11, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 3, color: COLORS.hatWhite },
    { x: 5, y: 3, color: COLORS.hatShadow },
    { x: 6, y: 3, color: COLORS.hatWhite },
    { x: 7, y: 3, color: COLORS.hatShadow },
    { x: 8, y: 3, color: COLORS.hatWhite },
    { x: 9, y: 3, color: COLORS.hatShadow },
    { x: 10, y: 3, color: COLORS.hatWhite },
    { x: 4, y: 4, color: COLORS.hatWhite },
    { x: 5, y: 4, color: COLORS.hatShadow },
    { x: 6, y: 4, color: COLORS.hatWhite },
    { x: 7, y: 4, color: COLORS.hatShadow },
    { x: 8, y: 4, color: COLORS.hatWhite },
    { x: 9, y: 4, color: COLORS.hatShadow },
    { x: 10, y: 4, color: COLORS.hatWhite },
    { x: 4, y: 5, color: COLORS.dark },
    { x: 5, y: 5, color: COLORS.dark },
    { x: 6, y: 5, color: COLORS.dark },
    { x: 7, y: 5, color: COLORS.dark },
    { x: 8, y: 5, color: COLORS.dark },
    { x: 9, y: 5, color: COLORS.dark },
    { x: 10, y: 5, color: COLORS.dark },

    // CHAT BUBBLE - Wide, minimal tail
    // Top edge
    { x: 2, y: 6, color: COLORS.dark },
    { x: 3, y: 6, color: COLORS.dark },
    { x: 4, y: 6, color: COLORS.dark },
    { x: 5, y: 6, color: COLORS.dark },
    { x: 6, y: 6, color: COLORS.dark },
    { x: 7, y: 6, color: COLORS.dark },
    { x: 8, y: 6, color: COLORS.dark },
    { x: 9, y: 6, color: COLORS.dark },
    { x: 10, y: 6, color: COLORS.dark },
    { x: 11, y: 6, color: COLORS.dark },
    { x: 12, y: 6, color: COLORS.dark },
    // Body
    { x: 1, y: 7, color: COLORS.dark },
    { x: 2, y: 7, color: COLORS.cream },
    { x: 3, y: 7, color: COLORS.cream },
    { x: 4, y: 7, color: COLORS.cream },
    { x: 5, y: 7, color: COLORS.cream },
    { x: 6, y: 7, color: COLORS.cream },
    { x: 7, y: 7, color: COLORS.cream },
    { x: 8, y: 7, color: COLORS.cream },
    { x: 9, y: 7, color: COLORS.cream },
    { x: 10, y: 7, color: COLORS.cream },
    { x: 11, y: 7, color: COLORS.cream },
    { x: 12, y: 7, color: COLORS.cream },
    { x: 13, y: 7, color: COLORS.dark },
    { x: 1, y: 8, color: COLORS.dark },
    { x: 2, y: 8, color: COLORS.cream },
    { x: 3, y: 8, color: COLORS.cream },
    { x: 4, y: 8, color: COLORS.cream },
    { x: 5, y: 8, color: COLORS.cream },
    { x: 6, y: 8, color: COLORS.cream },
    { x: 7, y: 8, color: COLORS.cream },
    { x: 8, y: 8, color: COLORS.cream },
    { x: 9, y: 8, color: COLORS.cream },
    { x: 10, y: 8, color: COLORS.cream },
    { x: 11, y: 8, color: COLORS.cream },
    { x: 12, y: 8, color: COLORS.cream },
    { x: 13, y: 8, color: COLORS.dark },
    { x: 1, y: 9, color: COLORS.dark },
    { x: 2, y: 9, color: COLORS.cream },
    { x: 3, y: 9, color: COLORS.cream },
    { x: 4, y: 9, color: COLORS.cream },
    { x: 5, y: 9, color: COLORS.cream },
    { x: 6, y: 9, color: COLORS.cream },
    { x: 7, y: 9, color: COLORS.cream },
    { x: 8, y: 9, color: COLORS.cream },
    { x: 9, y: 9, color: COLORS.cream },
    { x: 10, y: 9, color: COLORS.cream },
    { x: 11, y: 9, color: COLORS.cream },
    { x: 12, y: 9, color: COLORS.cream },
    { x: 13, y: 9, color: COLORS.dark },
    // Bottom edge
    { x: 2, y: 10, color: COLORS.dark },
    { x: 3, y: 10, color: COLORS.dark },
    { x: 4, y: 10, color: COLORS.dark },
    { x: 5, y: 10, color: COLORS.dark },
    { x: 6, y: 10, color: COLORS.dark },
    { x: 7, y: 10, color: COLORS.dark },
    { x: 8, y: 10, color: COLORS.dark },
    { x: 9, y: 10, color: COLORS.dark },
    { x: 10, y: 10, color: COLORS.dark },
    { x: 11, y: 10, color: COLORS.dark },
    { x: 12, y: 10, color: COLORS.dark },
    // Tiny tail
    { x: 1, y: 10, color: COLORS.dark },
    { x: 0, y: 11, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 0.9} viewBox="0 0 60 50" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// V1d: Classic rectangle with diagonal corner cuts
export function PixelLogoV1d({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // CHEF HAT - V1 rounder hat
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 8, y: 0, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 9, y: 1, color: COLORS.hatWhite },
    { x: 3, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatWhite },
    { x: 10, y: 2, color: COLORS.hatWhite },
    { x: 11, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 3, color: COLORS.hatWhite },
    { x: 5, y: 3, color: COLORS.hatShadow },
    { x: 6, y: 3, color: COLORS.hatWhite },
    { x: 7, y: 3, color: COLORS.hatShadow },
    { x: 8, y: 3, color: COLORS.hatWhite },
    { x: 9, y: 3, color: COLORS.hatShadow },
    { x: 10, y: 3, color: COLORS.hatWhite },
    { x: 4, y: 4, color: COLORS.hatWhite },
    { x: 5, y: 4, color: COLORS.hatShadow },
    { x: 6, y: 4, color: COLORS.hatWhite },
    { x: 7, y: 4, color: COLORS.hatShadow },
    { x: 8, y: 4, color: COLORS.hatWhite },
    { x: 9, y: 4, color: COLORS.hatShadow },
    { x: 10, y: 4, color: COLORS.hatWhite },
    { x: 4, y: 5, color: COLORS.dark },
    { x: 5, y: 5, color: COLORS.dark },
    { x: 6, y: 5, color: COLORS.dark },
    { x: 7, y: 5, color: COLORS.dark },
    { x: 8, y: 5, color: COLORS.dark },
    { x: 9, y: 5, color: COLORS.dark },
    { x: 10, y: 5, color: COLORS.dark },

    // CHAT BUBBLE - Rectangle with diagonal corner cuts (clipped corners)
    // Top edge (with corner notch on right)
    { x: 2, y: 6, color: COLORS.dark },
    { x: 3, y: 6, color: COLORS.dark },
    { x: 4, y: 6, color: COLORS.dark },
    { x: 5, y: 6, color: COLORS.dark },
    { x: 6, y: 6, color: COLORS.dark },
    { x: 7, y: 6, color: COLORS.dark },
    { x: 8, y: 6, color: COLORS.dark },
    { x: 9, y: 6, color: COLORS.dark },
    { x: 10, y: 6, color: COLORS.dark },
    { x: 11, y: 6, color: COLORS.dark },
    // Body
    { x: 2, y: 7, color: COLORS.dark },
    { x: 3, y: 7, color: COLORS.cream },
    { x: 4, y: 7, color: COLORS.cream },
    { x: 5, y: 7, color: COLORS.cream },
    { x: 6, y: 7, color: COLORS.cream },
    { x: 7, y: 7, color: COLORS.cream },
    { x: 8, y: 7, color: COLORS.cream },
    { x: 9, y: 7, color: COLORS.cream },
    { x: 10, y: 7, color: COLORS.cream },
    { x: 11, y: 7, color: COLORS.cream },
    { x: 12, y: 7, color: COLORS.dark },
    { x: 2, y: 8, color: COLORS.dark },
    { x: 3, y: 8, color: COLORS.cream },
    { x: 4, y: 8, color: COLORS.cream },
    { x: 5, y: 8, color: COLORS.cream },
    { x: 6, y: 8, color: COLORS.cream },
    { x: 7, y: 8, color: COLORS.cream },
    { x: 8, y: 8, color: COLORS.cream },
    { x: 9, y: 8, color: COLORS.cream },
    { x: 10, y: 8, color: COLORS.cream },
    { x: 11, y: 8, color: COLORS.cream },
    { x: 12, y: 8, color: COLORS.dark },
    { x: 2, y: 9, color: COLORS.dark },
    { x: 3, y: 9, color: COLORS.cream },
    { x: 4, y: 9, color: COLORS.cream },
    { x: 5, y: 9, color: COLORS.cream },
    { x: 6, y: 9, color: COLORS.cream },
    { x: 7, y: 9, color: COLORS.cream },
    { x: 8, y: 9, color: COLORS.cream },
    { x: 9, y: 9, color: COLORS.cream },
    { x: 10, y: 9, color: COLORS.cream },
    { x: 11, y: 9, color: COLORS.cream },
    { x: 12, y: 9, color: COLORS.dark },
    // Bottom edge (with corner notch on right)
    { x: 2, y: 10, color: COLORS.dark },
    { x: 3, y: 10, color: COLORS.dark },
    { x: 4, y: 10, color: COLORS.dark },
    { x: 5, y: 10, color: COLORS.dark },
    { x: 6, y: 10, color: COLORS.dark },
    { x: 7, y: 10, color: COLORS.dark },
    { x: 8, y: 10, color: COLORS.dark },
    { x: 9, y: 10, color: COLORS.dark },
    { x: 10, y: 10, color: COLORS.dark },
    { x: 11, y: 10, color: COLORS.dark },
    // Small tail (bottom-left)
    { x: 1, y: 10, color: COLORS.dark },
    { x: 0, y: 11, color: COLORS.dark },
    { x: 1, y: 11, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.0} viewBox="0 0 56 52" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// V1e: Bubble with longer curved tail
export function PixelLogoV1e({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // CHEF HAT - V1 rounder hat
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 8, y: 0, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 9, y: 1, color: COLORS.hatWhite },
    { x: 3, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatWhite },
    { x: 10, y: 2, color: COLORS.hatWhite },
    { x: 11, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 3, color: COLORS.hatWhite },
    { x: 5, y: 3, color: COLORS.hatShadow },
    { x: 6, y: 3, color: COLORS.hatWhite },
    { x: 7, y: 3, color: COLORS.hatShadow },
    { x: 8, y: 3, color: COLORS.hatWhite },
    { x: 9, y: 3, color: COLORS.hatShadow },
    { x: 10, y: 3, color: COLORS.hatWhite },
    { x: 4, y: 4, color: COLORS.hatWhite },
    { x: 5, y: 4, color: COLORS.hatShadow },
    { x: 6, y: 4, color: COLORS.hatWhite },
    { x: 7, y: 4, color: COLORS.hatShadow },
    { x: 8, y: 4, color: COLORS.hatWhite },
    { x: 9, y: 4, color: COLORS.hatShadow },
    { x: 10, y: 4, color: COLORS.hatWhite },
    { x: 4, y: 5, color: COLORS.dark },
    { x: 5, y: 5, color: COLORS.dark },
    { x: 6, y: 5, color: COLORS.dark },
    { x: 7, y: 5, color: COLORS.dark },
    { x: 8, y: 5, color: COLORS.dark },
    { x: 9, y: 5, color: COLORS.dark },
    { x: 10, y: 5, color: COLORS.dark },

    // CHAT BUBBLE - with longer curved tail
    { x: 3, y: 6, color: COLORS.dark },
    { x: 4, y: 6, color: COLORS.dark },
    { x: 5, y: 6, color: COLORS.dark },
    { x: 6, y: 6, color: COLORS.dark },
    { x: 7, y: 6, color: COLORS.dark },
    { x: 8, y: 6, color: COLORS.dark },
    { x: 9, y: 6, color: COLORS.dark },
    { x: 10, y: 6, color: COLORS.dark },
    { x: 11, y: 6, color: COLORS.dark },
    { x: 2, y: 7, color: COLORS.dark },
    { x: 3, y: 7, color: COLORS.cream },
    { x: 4, y: 7, color: COLORS.cream },
    { x: 5, y: 7, color: COLORS.cream },
    { x: 6, y: 7, color: COLORS.cream },
    { x: 7, y: 7, color: COLORS.cream },
    { x: 8, y: 7, color: COLORS.cream },
    { x: 9, y: 7, color: COLORS.cream },
    { x: 10, y: 7, color: COLORS.cream },
    { x: 11, y: 7, color: COLORS.cream },
    { x: 12, y: 7, color: COLORS.dark },
    { x: 2, y: 8, color: COLORS.dark },
    { x: 3, y: 8, color: COLORS.cream },
    { x: 4, y: 8, color: COLORS.cream },
    { x: 5, y: 8, color: COLORS.cream },
    { x: 6, y: 8, color: COLORS.cream },
    { x: 7, y: 8, color: COLORS.cream },
    { x: 8, y: 8, color: COLORS.cream },
    { x: 9, y: 8, color: COLORS.cream },
    { x: 10, y: 8, color: COLORS.cream },
    { x: 11, y: 8, color: COLORS.cream },
    { x: 12, y: 8, color: COLORS.dark },
    { x: 2, y: 9, color: COLORS.dark },
    { x: 3, y: 9, color: COLORS.cream },
    { x: 4, y: 9, color: COLORS.cream },
    { x: 5, y: 9, color: COLORS.cream },
    { x: 6, y: 9, color: COLORS.cream },
    { x: 7, y: 9, color: COLORS.cream },
    { x: 8, y: 9, color: COLORS.cream },
    { x: 9, y: 9, color: COLORS.cream },
    { x: 10, y: 9, color: COLORS.cream },
    { x: 11, y: 9, color: COLORS.cream },
    { x: 12, y: 9, color: COLORS.dark },
    { x: 3, y: 10, color: COLORS.dark },
    { x: 4, y: 10, color: COLORS.dark },
    { x: 5, y: 10, color: COLORS.dark },
    { x: 6, y: 10, color: COLORS.dark },
    { x: 7, y: 10, color: COLORS.dark },
    { x: 8, y: 10, color: COLORS.dark },
    { x: 9, y: 10, color: COLORS.dark },
    { x: 10, y: 10, color: COLORS.dark },
    { x: 11, y: 10, color: COLORS.dark },
    // Longer curved tail
    { x: 1, y: 10, color: COLORS.dark },
    { x: 2, y: 10, color: COLORS.dark },
    { x: 0, y: 11, color: COLORS.dark },
    { x: 1, y: 11, color: COLORS.cream },
    { x: 2, y: 11, color: COLORS.dark },
    { x: 0, y: 12, color: COLORS.dark },
    { x: 1, y: 12, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.1} viewBox="0 0 56 56" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// V1f: More rectangular/horizontal bubble (wider)
export function PixelLogoV1f({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // CHEF HAT - V1 rounder hat (centered over wider bubble)
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 8, y: 0, color: COLORS.hatWhite },
    { x: 9, y: 0, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 9, y: 1, color: COLORS.hatWhite },
    { x: 10, y: 1, color: COLORS.hatWhite },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatWhite },
    { x: 10, y: 2, color: COLORS.hatWhite },
    { x: 11, y: 2, color: COLORS.hatWhite },
    { x: 12, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 3, color: COLORS.hatWhite },
    { x: 6, y: 3, color: COLORS.hatShadow },
    { x: 7, y: 3, color: COLORS.hatWhite },
    { x: 8, y: 3, color: COLORS.hatShadow },
    { x: 9, y: 3, color: COLORS.hatWhite },
    { x: 10, y: 3, color: COLORS.hatShadow },
    { x: 11, y: 3, color: COLORS.hatWhite },
    { x: 5, y: 4, color: COLORS.hatWhite },
    { x: 6, y: 4, color: COLORS.hatShadow },
    { x: 7, y: 4, color: COLORS.hatWhite },
    { x: 8, y: 4, color: COLORS.hatShadow },
    { x: 9, y: 4, color: COLORS.hatWhite },
    { x: 10, y: 4, color: COLORS.hatShadow },
    { x: 11, y: 4, color: COLORS.hatWhite },
    { x: 5, y: 5, color: COLORS.dark },
    { x: 6, y: 5, color: COLORS.dark },
    { x: 7, y: 5, color: COLORS.dark },
    { x: 8, y: 5, color: COLORS.dark },
    { x: 9, y: 5, color: COLORS.dark },
    { x: 10, y: 5, color: COLORS.dark },
    { x: 11, y: 5, color: COLORS.dark },

    // CHAT BUBBLE - Wide horizontal rectangle
    { x: 2, y: 6, color: COLORS.dark },
    { x: 3, y: 6, color: COLORS.dark },
    { x: 4, y: 6, color: COLORS.dark },
    { x: 5, y: 6, color: COLORS.dark },
    { x: 6, y: 6, color: COLORS.dark },
    { x: 7, y: 6, color: COLORS.dark },
    { x: 8, y: 6, color: COLORS.dark },
    { x: 9, y: 6, color: COLORS.dark },
    { x: 10, y: 6, color: COLORS.dark },
    { x: 11, y: 6, color: COLORS.dark },
    { x: 12, y: 6, color: COLORS.dark },
    { x: 13, y: 6, color: COLORS.dark },
    { x: 14, y: 6, color: COLORS.dark },
    { x: 1, y: 7, color: COLORS.dark },
    { x: 2, y: 7, color: COLORS.cream },
    { x: 3, y: 7, color: COLORS.cream },
    { x: 4, y: 7, color: COLORS.cream },
    { x: 5, y: 7, color: COLORS.cream },
    { x: 6, y: 7, color: COLORS.cream },
    { x: 7, y: 7, color: COLORS.cream },
    { x: 8, y: 7, color: COLORS.cream },
    { x: 9, y: 7, color: COLORS.cream },
    { x: 10, y: 7, color: COLORS.cream },
    { x: 11, y: 7, color: COLORS.cream },
    { x: 12, y: 7, color: COLORS.cream },
    { x: 13, y: 7, color: COLORS.cream },
    { x: 14, y: 7, color: COLORS.cream },
    { x: 15, y: 7, color: COLORS.dark },
    { x: 1, y: 8, color: COLORS.dark },
    { x: 2, y: 8, color: COLORS.cream },
    { x: 3, y: 8, color: COLORS.cream },
    { x: 4, y: 8, color: COLORS.cream },
    { x: 5, y: 8, color: COLORS.cream },
    { x: 6, y: 8, color: COLORS.cream },
    { x: 7, y: 8, color: COLORS.cream },
    { x: 8, y: 8, color: COLORS.cream },
    { x: 9, y: 8, color: COLORS.cream },
    { x: 10, y: 8, color: COLORS.cream },
    { x: 11, y: 8, color: COLORS.cream },
    { x: 12, y: 8, color: COLORS.cream },
    { x: 13, y: 8, color: COLORS.cream },
    { x: 14, y: 8, color: COLORS.cream },
    { x: 15, y: 8, color: COLORS.dark },
    { x: 2, y: 9, color: COLORS.dark },
    { x: 3, y: 9, color: COLORS.dark },
    { x: 4, y: 9, color: COLORS.dark },
    { x: 5, y: 9, color: COLORS.dark },
    { x: 6, y: 9, color: COLORS.dark },
    { x: 7, y: 9, color: COLORS.dark },
    { x: 8, y: 9, color: COLORS.dark },
    { x: 9, y: 9, color: COLORS.dark },
    { x: 10, y: 9, color: COLORS.dark },
    { x: 11, y: 9, color: COLORS.dark },
    { x: 12, y: 9, color: COLORS.dark },
    { x: 13, y: 9, color: COLORS.dark },
    { x: 14, y: 9, color: COLORS.dark },
    // Small tail
    { x: 0, y: 9, color: COLORS.dark },
    { x: 1, y: 9, color: COLORS.dark },
    { x: 0, y: 10, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 0.7} viewBox="0 0 68 44" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// V1g: Bubble positioned more to the left under hat
export function PixelLogoV1g({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // CHEF HAT - V1 rounder hat
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 8, y: 0, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 9, y: 1, color: COLORS.hatWhite },
    { x: 3, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatWhite },
    { x: 10, y: 2, color: COLORS.hatWhite },
    { x: 11, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 3, color: COLORS.hatWhite },
    { x: 5, y: 3, color: COLORS.hatShadow },
    { x: 6, y: 3, color: COLORS.hatWhite },
    { x: 7, y: 3, color: COLORS.hatShadow },
    { x: 8, y: 3, color: COLORS.hatWhite },
    { x: 9, y: 3, color: COLORS.hatShadow },
    { x: 10, y: 3, color: COLORS.hatWhite },
    { x: 4, y: 4, color: COLORS.hatWhite },
    { x: 5, y: 4, color: COLORS.hatShadow },
    { x: 6, y: 4, color: COLORS.hatWhite },
    { x: 7, y: 4, color: COLORS.hatShadow },
    { x: 8, y: 4, color: COLORS.hatWhite },
    { x: 9, y: 4, color: COLORS.hatShadow },
    { x: 10, y: 4, color: COLORS.hatWhite },
    { x: 4, y: 5, color: COLORS.dark },
    { x: 5, y: 5, color: COLORS.dark },
    { x: 6, y: 5, color: COLORS.dark },
    { x: 7, y: 5, color: COLORS.dark },
    { x: 8, y: 5, color: COLORS.dark },
    { x: 9, y: 5, color: COLORS.dark },
    { x: 10, y: 5, color: COLORS.dark },

    // CHAT BUBBLE - Shifted left (starts at x:0)
    { x: 1, y: 6, color: COLORS.dark },
    { x: 2, y: 6, color: COLORS.dark },
    { x: 3, y: 6, color: COLORS.dark },
    { x: 4, y: 6, color: COLORS.dark },
    { x: 5, y: 6, color: COLORS.dark },
    { x: 6, y: 6, color: COLORS.dark },
    { x: 7, y: 6, color: COLORS.dark },
    { x: 8, y: 6, color: COLORS.dark },
    { x: 9, y: 6, color: COLORS.dark },
    { x: 0, y: 7, color: COLORS.dark },
    { x: 1, y: 7, color: COLORS.cream },
    { x: 2, y: 7, color: COLORS.cream },
    { x: 3, y: 7, color: COLORS.cream },
    { x: 4, y: 7, color: COLORS.cream },
    { x: 5, y: 7, color: COLORS.cream },
    { x: 6, y: 7, color: COLORS.cream },
    { x: 7, y: 7, color: COLORS.cream },
    { x: 8, y: 7, color: COLORS.cream },
    { x: 9, y: 7, color: COLORS.cream },
    { x: 10, y: 7, color: COLORS.dark },
    { x: 0, y: 8, color: COLORS.dark },
    { x: 1, y: 8, color: COLORS.cream },
    { x: 2, y: 8, color: COLORS.cream },
    { x: 3, y: 8, color: COLORS.cream },
    { x: 4, y: 8, color: COLORS.cream },
    { x: 5, y: 8, color: COLORS.cream },
    { x: 6, y: 8, color: COLORS.cream },
    { x: 7, y: 8, color: COLORS.cream },
    { x: 8, y: 8, color: COLORS.cream },
    { x: 9, y: 8, color: COLORS.cream },
    { x: 10, y: 8, color: COLORS.dark },
    { x: 0, y: 9, color: COLORS.dark },
    { x: 1, y: 9, color: COLORS.cream },
    { x: 2, y: 9, color: COLORS.cream },
    { x: 3, y: 9, color: COLORS.cream },
    { x: 4, y: 9, color: COLORS.cream },
    { x: 5, y: 9, color: COLORS.cream },
    { x: 6, y: 9, color: COLORS.cream },
    { x: 7, y: 9, color: COLORS.cream },
    { x: 8, y: 9, color: COLORS.cream },
    { x: 9, y: 9, color: COLORS.cream },
    { x: 10, y: 9, color: COLORS.dark },
    { x: 0, y: 10, color: COLORS.dark },
    { x: 1, y: 10, color: COLORS.cream },
    { x: 2, y: 10, color: COLORS.cream },
    { x: 3, y: 10, color: COLORS.cream },
    { x: 4, y: 10, color: COLORS.cream },
    { x: 5, y: 10, color: COLORS.cream },
    { x: 6, y: 10, color: COLORS.cream },
    { x: 7, y: 10, color: COLORS.cream },
    { x: 8, y: 10, color: COLORS.cream },
    { x: 9, y: 10, color: COLORS.cream },
    { x: 10, y: 10, color: COLORS.dark },
    // Bottom
    { x: 1, y: 11, color: COLORS.dark },
    { x: 2, y: 11, color: COLORS.dark },
    { x: 3, y: 11, color: COLORS.dark },
    { x: 4, y: 11, color: COLORS.dark },
    { x: 5, y: 11, color: COLORS.dark },
    { x: 6, y: 11, color: COLORS.dark },
    { x: 7, y: 11, color: COLORS.dark },
    { x: 8, y: 11, color: COLORS.dark },
    { x: 9, y: 11, color: COLORS.dark },
    // Tail on bottom left corner
    { x: 0, y: 11, color: COLORS.dark },
    { x: 0, y: 12, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.1} viewBox="0 0 52 56" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// V1h: Taller bubble (more vertical space for text)
export function PixelLogoV1h({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // CHEF HAT - V1 rounder hat
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 8, y: 0, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 9, y: 1, color: COLORS.hatWhite },
    { x: 3, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatWhite },
    { x: 10, y: 2, color: COLORS.hatWhite },
    { x: 11, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 3, color: COLORS.hatWhite },
    { x: 5, y: 3, color: COLORS.hatShadow },
    { x: 6, y: 3, color: COLORS.hatWhite },
    { x: 7, y: 3, color: COLORS.hatShadow },
    { x: 8, y: 3, color: COLORS.hatWhite },
    { x: 9, y: 3, color: COLORS.hatShadow },
    { x: 10, y: 3, color: COLORS.hatWhite },
    { x: 4, y: 4, color: COLORS.hatWhite },
    { x: 5, y: 4, color: COLORS.hatShadow },
    { x: 6, y: 4, color: COLORS.hatWhite },
    { x: 7, y: 4, color: COLORS.hatShadow },
    { x: 8, y: 4, color: COLORS.hatWhite },
    { x: 9, y: 4, color: COLORS.hatShadow },
    { x: 10, y: 4, color: COLORS.hatWhite },
    { x: 4, y: 5, color: COLORS.dark },
    { x: 5, y: 5, color: COLORS.dark },
    { x: 6, y: 5, color: COLORS.dark },
    { x: 7, y: 5, color: COLORS.dark },
    { x: 8, y: 5, color: COLORS.dark },
    { x: 9, y: 5, color: COLORS.dark },
    { x: 10, y: 5, color: COLORS.dark },

    // CHAT BUBBLE - Taller (6 rows of interior)
    { x: 3, y: 6, color: COLORS.dark },
    { x: 4, y: 6, color: COLORS.dark },
    { x: 5, y: 6, color: COLORS.dark },
    { x: 6, y: 6, color: COLORS.dark },
    { x: 7, y: 6, color: COLORS.dark },
    { x: 8, y: 6, color: COLORS.dark },
    { x: 9, y: 6, color: COLORS.dark },
    { x: 10, y: 6, color: COLORS.dark },
    { x: 11, y: 6, color: COLORS.dark },
    { x: 2, y: 7, color: COLORS.dark },
    { x: 3, y: 7, color: COLORS.cream },
    { x: 4, y: 7, color: COLORS.cream },
    { x: 5, y: 7, color: COLORS.cream },
    { x: 6, y: 7, color: COLORS.cream },
    { x: 7, y: 7, color: COLORS.cream },
    { x: 8, y: 7, color: COLORS.cream },
    { x: 9, y: 7, color: COLORS.cream },
    { x: 10, y: 7, color: COLORS.cream },
    { x: 11, y: 7, color: COLORS.cream },
    { x: 12, y: 7, color: COLORS.dark },
    { x: 2, y: 8, color: COLORS.dark },
    { x: 3, y: 8, color: COLORS.cream },
    { x: 4, y: 8, color: COLORS.cream },
    { x: 5, y: 8, color: COLORS.cream },
    { x: 6, y: 8, color: COLORS.cream },
    { x: 7, y: 8, color: COLORS.cream },
    { x: 8, y: 8, color: COLORS.cream },
    { x: 9, y: 8, color: COLORS.cream },
    { x: 10, y: 8, color: COLORS.cream },
    { x: 11, y: 8, color: COLORS.cream },
    { x: 12, y: 8, color: COLORS.dark },
    { x: 2, y: 9, color: COLORS.dark },
    { x: 3, y: 9, color: COLORS.cream },
    { x: 4, y: 9, color: COLORS.cream },
    { x: 5, y: 9, color: COLORS.cream },
    { x: 6, y: 9, color: COLORS.cream },
    { x: 7, y: 9, color: COLORS.cream },
    { x: 8, y: 9, color: COLORS.cream },
    { x: 9, y: 9, color: COLORS.cream },
    { x: 10, y: 9, color: COLORS.cream },
    { x: 11, y: 9, color: COLORS.cream },
    { x: 12, y: 9, color: COLORS.dark },
    { x: 2, y: 10, color: COLORS.dark },
    { x: 3, y: 10, color: COLORS.cream },
    { x: 4, y: 10, color: COLORS.cream },
    { x: 5, y: 10, color: COLORS.cream },
    { x: 6, y: 10, color: COLORS.cream },
    { x: 7, y: 10, color: COLORS.cream },
    { x: 8, y: 10, color: COLORS.cream },
    { x: 9, y: 10, color: COLORS.cream },
    { x: 10, y: 10, color: COLORS.cream },
    { x: 11, y: 10, color: COLORS.cream },
    { x: 12, y: 10, color: COLORS.dark },
    { x: 2, y: 11, color: COLORS.dark },
    { x: 3, y: 11, color: COLORS.cream },
    { x: 4, y: 11, color: COLORS.cream },
    { x: 5, y: 11, color: COLORS.cream },
    { x: 6, y: 11, color: COLORS.cream },
    { x: 7, y: 11, color: COLORS.cream },
    { x: 8, y: 11, color: COLORS.cream },
    { x: 9, y: 11, color: COLORS.cream },
    { x: 10, y: 11, color: COLORS.cream },
    { x: 11, y: 11, color: COLORS.cream },
    { x: 12, y: 11, color: COLORS.dark },
    { x: 2, y: 12, color: COLORS.dark },
    { x: 3, y: 12, color: COLORS.cream },
    { x: 4, y: 12, color: COLORS.cream },
    { x: 5, y: 12, color: COLORS.cream },
    { x: 6, y: 12, color: COLORS.cream },
    { x: 7, y: 12, color: COLORS.cream },
    { x: 8, y: 12, color: COLORS.cream },
    { x: 9, y: 12, color: COLORS.cream },
    { x: 10, y: 12, color: COLORS.cream },
    { x: 11, y: 12, color: COLORS.cream },
    { x: 12, y: 12, color: COLORS.dark },
    // Bottom
    { x: 3, y: 13, color: COLORS.dark },
    { x: 4, y: 13, color: COLORS.dark },
    { x: 5, y: 13, color: COLORS.dark },
    { x: 6, y: 13, color: COLORS.dark },
    { x: 7, y: 13, color: COLORS.dark },
    { x: 8, y: 13, color: COLORS.dark },
    { x: 9, y: 13, color: COLORS.dark },
    { x: 10, y: 13, color: COLORS.dark },
    { x: 11, y: 13, color: COLORS.dark },
    // Tail
    { x: 1, y: 12, color: COLORS.dark },
    { x: 2, y: 13, color: COLORS.dark },
    { x: 0, y: 13, color: COLORS.dark },
    { x: 1, y: 13, color: COLORS.dark },
    { x: 0, y: 14, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.3} viewBox="0 0 56 64" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// V1i: Classic speech bubble shape (pointer tail)
export function PixelLogoV1i({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // CHEF HAT - V1 rounder hat
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 8, y: 0, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 9, y: 1, color: COLORS.hatWhite },
    { x: 3, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatWhite },
    { x: 10, y: 2, color: COLORS.hatWhite },
    { x: 11, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 3, color: COLORS.hatWhite },
    { x: 5, y: 3, color: COLORS.hatShadow },
    { x: 6, y: 3, color: COLORS.hatWhite },
    { x: 7, y: 3, color: COLORS.hatShadow },
    { x: 8, y: 3, color: COLORS.hatWhite },
    { x: 9, y: 3, color: COLORS.hatShadow },
    { x: 10, y: 3, color: COLORS.hatWhite },
    { x: 4, y: 4, color: COLORS.hatWhite },
    { x: 5, y: 4, color: COLORS.hatShadow },
    { x: 6, y: 4, color: COLORS.hatWhite },
    { x: 7, y: 4, color: COLORS.hatShadow },
    { x: 8, y: 4, color: COLORS.hatWhite },
    { x: 9, y: 4, color: COLORS.hatShadow },
    { x: 10, y: 4, color: COLORS.hatWhite },
    { x: 4, y: 5, color: COLORS.dark },
    { x: 5, y: 5, color: COLORS.dark },
    { x: 6, y: 5, color: COLORS.dark },
    { x: 7, y: 5, color: COLORS.dark },
    { x: 8, y: 5, color: COLORS.dark },
    { x: 9, y: 5, color: COLORS.dark },
    { x: 10, y: 5, color: COLORS.dark },

    // CHAT BUBBLE - Classic speech bubble (triangular pointer)
    { x: 3, y: 6, color: COLORS.dark },
    { x: 4, y: 6, color: COLORS.dark },
    { x: 5, y: 6, color: COLORS.dark },
    { x: 6, y: 6, color: COLORS.dark },
    { x: 7, y: 6, color: COLORS.dark },
    { x: 8, y: 6, color: COLORS.dark },
    { x: 9, y: 6, color: COLORS.dark },
    { x: 10, y: 6, color: COLORS.dark },
    { x: 11, y: 6, color: COLORS.dark },
    { x: 2, y: 7, color: COLORS.dark },
    { x: 3, y: 7, color: COLORS.cream },
    { x: 4, y: 7, color: COLORS.cream },
    { x: 5, y: 7, color: COLORS.cream },
    { x: 6, y: 7, color: COLORS.cream },
    { x: 7, y: 7, color: COLORS.cream },
    { x: 8, y: 7, color: COLORS.cream },
    { x: 9, y: 7, color: COLORS.cream },
    { x: 10, y: 7, color: COLORS.cream },
    { x: 11, y: 7, color: COLORS.cream },
    { x: 12, y: 7, color: COLORS.dark },
    { x: 2, y: 8, color: COLORS.dark },
    { x: 3, y: 8, color: COLORS.cream },
    { x: 4, y: 8, color: COLORS.cream },
    { x: 5, y: 8, color: COLORS.cream },
    { x: 6, y: 8, color: COLORS.cream },
    { x: 7, y: 8, color: COLORS.cream },
    { x: 8, y: 8, color: COLORS.cream },
    { x: 9, y: 8, color: COLORS.cream },
    { x: 10, y: 8, color: COLORS.cream },
    { x: 11, y: 8, color: COLORS.cream },
    { x: 12, y: 8, color: COLORS.dark },
    { x: 2, y: 9, color: COLORS.dark },
    { x: 3, y: 9, color: COLORS.cream },
    { x: 4, y: 9, color: COLORS.cream },
    { x: 5, y: 9, color: COLORS.cream },
    { x: 6, y: 9, color: COLORS.cream },
    { x: 7, y: 9, color: COLORS.cream },
    { x: 8, y: 9, color: COLORS.cream },
    { x: 9, y: 9, color: COLORS.cream },
    { x: 10, y: 9, color: COLORS.cream },
    { x: 11, y: 9, color: COLORS.cream },
    { x: 12, y: 9, color: COLORS.dark },
    { x: 2, y: 10, color: COLORS.dark },
    { x: 3, y: 10, color: COLORS.cream },
    { x: 4, y: 10, color: COLORS.cream },
    { x: 5, y: 10, color: COLORS.cream },
    { x: 6, y: 10, color: COLORS.cream },
    { x: 7, y: 10, color: COLORS.cream },
    { x: 8, y: 10, color: COLORS.cream },
    { x: 9, y: 10, color: COLORS.cream },
    { x: 10, y: 10, color: COLORS.cream },
    { x: 11, y: 10, color: COLORS.cream },
    { x: 12, y: 10, color: COLORS.dark },
    // Bottom with triangular pointer
    { x: 3, y: 11, color: COLORS.dark },
    { x: 4, y: 11, color: COLORS.dark },
    { x: 5, y: 11, color: COLORS.dark },
    { x: 6, y: 11, color: COLORS.dark },
    { x: 7, y: 11, color: COLORS.dark },
    { x: 8, y: 11, color: COLORS.dark },
    { x: 9, y: 11, color: COLORS.dark },
    { x: 10, y: 11, color: COLORS.dark },
    { x: 11, y: 11, color: COLORS.dark },
    // Triangular tail (pointer style)
    { x: 2, y: 11, color: COLORS.dark },
    { x: 1, y: 12, color: COLORS.dark },
    { x: 2, y: 12, color: COLORS.cream },
    { x: 3, y: 12, color: COLORS.dark },
    { x: 0, y: 13, color: COLORS.dark },
    { x: 1, y: 13, color: COLORS.dark },
    { x: 2, y: 13, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.2} viewBox="0 0 56 60" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// V1j: Ultra-clean minimal (no tail, just rounded box)
export function PixelLogoV1j({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // CHEF HAT - V1 rounder hat
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 8, y: 0, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 9, y: 1, color: COLORS.hatWhite },
    { x: 3, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatWhite },
    { x: 10, y: 2, color: COLORS.hatWhite },
    { x: 11, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 3, color: COLORS.hatWhite },
    { x: 5, y: 3, color: COLORS.hatShadow },
    { x: 6, y: 3, color: COLORS.hatWhite },
    { x: 7, y: 3, color: COLORS.hatShadow },
    { x: 8, y: 3, color: COLORS.hatWhite },
    { x: 9, y: 3, color: COLORS.hatShadow },
    { x: 10, y: 3, color: COLORS.hatWhite },
    { x: 4, y: 4, color: COLORS.hatWhite },
    { x: 5, y: 4, color: COLORS.hatShadow },
    { x: 6, y: 4, color: COLORS.hatWhite },
    { x: 7, y: 4, color: COLORS.hatShadow },
    { x: 8, y: 4, color: COLORS.hatWhite },
    { x: 9, y: 4, color: COLORS.hatShadow },
    { x: 10, y: 4, color: COLORS.hatWhite },
    { x: 4, y: 5, color: COLORS.dark },
    { x: 5, y: 5, color: COLORS.dark },
    { x: 6, y: 5, color: COLORS.dark },
    { x: 7, y: 5, color: COLORS.dark },
    { x: 8, y: 5, color: COLORS.dark },
    { x: 9, y: 5, color: COLORS.dark },
    { x: 10, y: 5, color: COLORS.dark },

    // CHAT BUBBLE - Ultra clean (no tail)
    // Top edge (soft corners)
    { x: 4, y: 6, color: COLORS.dark },
    { x: 5, y: 6, color: COLORS.dark },
    { x: 6, y: 6, color: COLORS.dark },
    { x: 7, y: 6, color: COLORS.dark },
    { x: 8, y: 6, color: COLORS.dark },
    { x: 9, y: 6, color: COLORS.dark },
    { x: 10, y: 6, color: COLORS.dark },
    // Body
    { x: 3, y: 7, color: COLORS.dark },
    { x: 4, y: 7, color: COLORS.cream },
    { x: 5, y: 7, color: COLORS.cream },
    { x: 6, y: 7, color: COLORS.cream },
    { x: 7, y: 7, color: COLORS.cream },
    { x: 8, y: 7, color: COLORS.cream },
    { x: 9, y: 7, color: COLORS.cream },
    { x: 10, y: 7, color: COLORS.cream },
    { x: 11, y: 7, color: COLORS.dark },
    { x: 3, y: 8, color: COLORS.dark },
    { x: 4, y: 8, color: COLORS.cream },
    { x: 5, y: 8, color: COLORS.cream },
    { x: 6, y: 8, color: COLORS.cream },
    { x: 7, y: 8, color: COLORS.cream },
    { x: 8, y: 8, color: COLORS.cream },
    { x: 9, y: 8, color: COLORS.cream },
    { x: 10, y: 8, color: COLORS.cream },
    { x: 11, y: 8, color: COLORS.dark },
    { x: 3, y: 9, color: COLORS.dark },
    { x: 4, y: 9, color: COLORS.cream },
    { x: 5, y: 9, color: COLORS.cream },
    { x: 6, y: 9, color: COLORS.cream },
    { x: 7, y: 9, color: COLORS.cream },
    { x: 8, y: 9, color: COLORS.cream },
    { x: 9, y: 9, color: COLORS.cream },
    { x: 10, y: 9, color: COLORS.cream },
    { x: 11, y: 9, color: COLORS.dark },
    // Bottom edge (soft corners)
    { x: 4, y: 10, color: COLORS.dark },
    { x: 5, y: 10, color: COLORS.dark },
    { x: 6, y: 10, color: COLORS.dark },
    { x: 7, y: 10, color: COLORS.dark },
    { x: 8, y: 10, color: COLORS.dark },
    { x: 9, y: 10, color: COLORS.dark },
    { x: 10, y: 10, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 0.9} viewBox="0 0 56 48" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// V2: BUBBLE LEFT - Chat bubble shifted 2px left
export function PixelLogoModernV2({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // CHEF HAT - Same pleated design (centered)
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 8, y: 0, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 9, y: 1, color: COLORS.hatWhite },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatWhite },
    { x: 10, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 3, color: COLORS.hatWhite },
    { x: 6, y: 3, color: COLORS.hatShadow },
    { x: 7, y: 3, color: COLORS.hatWhite },
    { x: 8, y: 3, color: COLORS.hatShadow },
    { x: 9, y: 3, color: COLORS.hatWhite },
    { x: 5, y: 4, color: COLORS.hatWhite },
    { x: 6, y: 4, color: COLORS.hatShadow },
    { x: 7, y: 4, color: COLORS.hatWhite },
    { x: 8, y: 4, color: COLORS.hatShadow },
    { x: 9, y: 4, color: COLORS.hatWhite },
    { x: 4, y: 5, color: COLORS.dark },
    { x: 5, y: 5, color: COLORS.dark },
    { x: 6, y: 5, color: COLORS.dark },
    { x: 7, y: 5, color: COLORS.dark },
    { x: 8, y: 5, color: COLORS.dark },
    { x: 9, y: 5, color: COLORS.dark },
    { x: 10, y: 5, color: COLORS.dark },

    // BUBBLE - Shifted 2px left (was x:3-11, now x:1-9)
    { x: 1, y: 6, color: COLORS.dark },
    { x: 2, y: 6, color: COLORS.dark },
    { x: 3, y: 6, color: COLORS.dark },
    { x: 4, y: 6, color: COLORS.dark },
    { x: 5, y: 6, color: COLORS.dark },
    { x: 6, y: 6, color: COLORS.dark },
    { x: 7, y: 6, color: COLORS.dark },
    { x: 8, y: 6, color: COLORS.dark },
    { x: 9, y: 6, color: COLORS.dark },
    { x: 1, y: 7, color: COLORS.dark },
    { x: 2, y: 7, color: COLORS.cream },
    { x: 3, y: 7, color: COLORS.cream },
    { x: 4, y: 7, color: COLORS.cream },
    { x: 5, y: 7, color: COLORS.cream },
    { x: 6, y: 7, color: COLORS.cream },
    { x: 7, y: 7, color: COLORS.cream },
    { x: 8, y: 7, color: COLORS.cream },
    { x: 9, y: 7, color: COLORS.dark },
    { x: 1, y: 8, color: COLORS.dark },
    { x: 2, y: 8, color: COLORS.cream },
    { x: 3, y: 8, color: COLORS.orange },
    { x: 4, y: 8, color: COLORS.cream },
    { x: 5, y: 8, color: COLORS.orange },
    { x: 6, y: 8, color: COLORS.cream },
    { x: 7, y: 8, color: COLORS.orange },
    { x: 8, y: 8, color: COLORS.cream },
    { x: 9, y: 8, color: COLORS.dark },
    { x: 1, y: 9, color: COLORS.dark },
    { x: 2, y: 9, color: COLORS.cream },
    { x: 3, y: 9, color: COLORS.cream },
    { x: 4, y: 9, color: COLORS.cream },
    { x: 5, y: 9, color: COLORS.cream },
    { x: 6, y: 9, color: COLORS.cream },
    { x: 7, y: 9, color: COLORS.cream },
    { x: 8, y: 9, color: COLORS.cream },
    { x: 9, y: 9, color: COLORS.dark },
    { x: 1, y: 10, color: COLORS.dark },
    { x: 2, y: 10, color: COLORS.dark },
    { x: 3, y: 10, color: COLORS.dark },
    { x: 4, y: 10, color: COLORS.dark },
    { x: 5, y: 10, color: COLORS.dark },
    { x: 6, y: 10, color: COLORS.dark },
    { x: 7, y: 10, color: COLORS.cream },
    { x: 8, y: 10, color: COLORS.cream },
    { x: 9, y: 10, color: COLORS.dark },
    // Tail (shifted)
    { x: 7, y: 11, color: COLORS.dark },
    { x: 8, y: 11, color: COLORS.cream },
    { x: 9, y: 11, color: COLORS.dark },
    { x: 10, y: 11, color: COLORS.dark },
    { x: 8, y: 12, color: COLORS.dark },
    { x: 9, y: 12, color: COLORS.cream },
    { x: 10, y: 12, color: COLORS.dark },
    { x: 9, y: 13, color: COLORS.dark },
    { x: 10, y: 13, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.1} viewBox="0 0 56 60" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// V3: SOFT CORNERS - Rounder hat + softer bubble corners
export function PixelLogoModernV3({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // CHEF HAT - Very round/puffy
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 8, y: 0, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 9, y: 1, color: COLORS.hatWhite },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatWhite },
    { x: 10, y: 2, color: COLORS.hatWhite },
    // Extra row for more roundness
    { x: 4, y: 3, color: COLORS.hatWhite },
    { x: 5, y: 3, color: COLORS.hatWhite },
    { x: 6, y: 3, color: COLORS.hatWhite },
    { x: 7, y: 3, color: COLORS.hatWhite },
    { x: 8, y: 3, color: COLORS.hatWhite },
    { x: 9, y: 3, color: COLORS.hatWhite },
    { x: 10, y: 3, color: COLORS.hatWhite },
    // Pleats
    { x: 5, y: 4, color: COLORS.hatWhite },
    { x: 6, y: 4, color: COLORS.hatShadow },
    { x: 7, y: 4, color: COLORS.hatWhite },
    { x: 8, y: 4, color: COLORS.hatShadow },
    { x: 9, y: 4, color: COLORS.hatWhite },
    // Hat band
    { x: 4, y: 5, color: COLORS.dark },
    { x: 5, y: 5, color: COLORS.dark },
    { x: 6, y: 5, color: COLORS.dark },
    { x: 7, y: 5, color: COLORS.dark },
    { x: 8, y: 5, color: COLORS.dark },
    { x: 9, y: 5, color: COLORS.dark },
    { x: 10, y: 5, color: COLORS.dark },

    // BUBBLE - Softer corners (notched corners)
    // Top edge with soft corners
    { x: 4, y: 6, color: COLORS.dark },
    { x: 5, y: 6, color: COLORS.dark },
    { x: 6, y: 6, color: COLORS.dark },
    { x: 7, y: 6, color: COLORS.dark },
    { x: 8, y: 6, color: COLORS.dark },
    { x: 9, y: 6, color: COLORS.dark },
    { x: 10, y: 6, color: COLORS.dark },
    // Body row 1 (soft left corner)
    { x: 3, y: 7, color: COLORS.dark },
    { x: 4, y: 7, color: COLORS.cream },
    { x: 5, y: 7, color: COLORS.cream },
    { x: 6, y: 7, color: COLORS.cream },
    { x: 7, y: 7, color: COLORS.cream },
    { x: 8, y: 7, color: COLORS.cream },
    { x: 9, y: 7, color: COLORS.cream },
    { x: 10, y: 7, color: COLORS.cream },
    { x: 11, y: 7, color: COLORS.dark },
    // Body row 2 - dots
    { x: 3, y: 8, color: COLORS.dark },
    { x: 4, y: 8, color: COLORS.cream },
    { x: 5, y: 8, color: COLORS.orange },
    { x: 6, y: 8, color: COLORS.cream },
    { x: 7, y: 8, color: COLORS.orange },
    { x: 8, y: 8, color: COLORS.cream },
    { x: 9, y: 8, color: COLORS.orange },
    { x: 10, y: 8, color: COLORS.cream },
    { x: 11, y: 8, color: COLORS.dark },
    // Body row 3
    { x: 3, y: 9, color: COLORS.dark },
    { x: 4, y: 9, color: COLORS.cream },
    { x: 5, y: 9, color: COLORS.cream },
    { x: 6, y: 9, color: COLORS.cream },
    { x: 7, y: 9, color: COLORS.cream },
    { x: 8, y: 9, color: COLORS.cream },
    { x: 9, y: 9, color: COLORS.cream },
    { x: 10, y: 9, color: COLORS.cream },
    { x: 11, y: 9, color: COLORS.dark },
    // Bottom edge (soft left corner)
    { x: 4, y: 10, color: COLORS.dark },
    { x: 5, y: 10, color: COLORS.dark },
    { x: 6, y: 10, color: COLORS.dark },
    { x: 7, y: 10, color: COLORS.dark },
    { x: 8, y: 10, color: COLORS.dark },
    { x: 9, y: 10, color: COLORS.cream },
    { x: 10, y: 10, color: COLORS.cream },
    { x: 11, y: 10, color: COLORS.dark },
    // Rounded tail
    { x: 9, y: 11, color: COLORS.dark },
    { x: 10, y: 11, color: COLORS.cream },
    { x: 11, y: 11, color: COLORS.dark },
    { x: 10, y: 12, color: COLORS.dark },
    { x: 11, y: 12, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.1} viewBox="0 0 56 60" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// V4: TALL TOQUE - Taller chef hat (more classic)
export function PixelLogoModernV4({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // CHEF HAT - Taller toque (starts higher)
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 8, y: 0, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 9, y: 1, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatWhite },
    // Extra height row
    { x: 5, y: 3, color: COLORS.hatWhite },
    { x: 6, y: 3, color: COLORS.hatWhite },
    { x: 7, y: 3, color: COLORS.hatWhite },
    { x: 8, y: 3, color: COLORS.hatWhite },
    { x: 9, y: 3, color: COLORS.hatWhite },
    // Pleats
    { x: 5, y: 4, color: COLORS.hatWhite },
    { x: 6, y: 4, color: COLORS.hatShadow },
    { x: 7, y: 4, color: COLORS.hatWhite },
    { x: 8, y: 4, color: COLORS.hatShadow },
    { x: 9, y: 4, color: COLORS.hatWhite },
    { x: 5, y: 5, color: COLORS.hatWhite },
    { x: 6, y: 5, color: COLORS.hatShadow },
    { x: 7, y: 5, color: COLORS.hatWhite },
    { x: 8, y: 5, color: COLORS.hatShadow },
    { x: 9, y: 5, color: COLORS.hatWhite },
    // Hat band
    { x: 4, y: 6, color: COLORS.dark },
    { x: 5, y: 6, color: COLORS.dark },
    { x: 6, y: 6, color: COLORS.dark },
    { x: 7, y: 6, color: COLORS.dark },
    { x: 8, y: 6, color: COLORS.dark },
    { x: 9, y: 6, color: COLORS.dark },
    { x: 10, y: 6, color: COLORS.dark },

    // MODERN BUBBLE (shifted down by 1)
    { x: 3, y: 7, color: COLORS.dark },
    { x: 4, y: 7, color: COLORS.dark },
    { x: 5, y: 7, color: COLORS.dark },
    { x: 6, y: 7, color: COLORS.dark },
    { x: 7, y: 7, color: COLORS.dark },
    { x: 8, y: 7, color: COLORS.dark },
    { x: 9, y: 7, color: COLORS.dark },
    { x: 10, y: 7, color: COLORS.dark },
    { x: 11, y: 7, color: COLORS.dark },
    { x: 3, y: 8, color: COLORS.dark },
    { x: 4, y: 8, color: COLORS.cream },
    { x: 5, y: 8, color: COLORS.cream },
    { x: 6, y: 8, color: COLORS.cream },
    { x: 7, y: 8, color: COLORS.cream },
    { x: 8, y: 8, color: COLORS.cream },
    { x: 9, y: 8, color: COLORS.cream },
    { x: 10, y: 8, color: COLORS.cream },
    { x: 11, y: 8, color: COLORS.dark },
    { x: 3, y: 9, color: COLORS.dark },
    { x: 4, y: 9, color: COLORS.cream },
    { x: 5, y: 9, color: COLORS.orange },
    { x: 6, y: 9, color: COLORS.cream },
    { x: 7, y: 9, color: COLORS.orange },
    { x: 8, y: 9, color: COLORS.cream },
    { x: 9, y: 9, color: COLORS.orange },
    { x: 10, y: 9, color: COLORS.cream },
    { x: 11, y: 9, color: COLORS.dark },
    { x: 3, y: 10, color: COLORS.dark },
    { x: 4, y: 10, color: COLORS.cream },
    { x: 5, y: 10, color: COLORS.cream },
    { x: 6, y: 10, color: COLORS.cream },
    { x: 7, y: 10, color: COLORS.cream },
    { x: 8, y: 10, color: COLORS.cream },
    { x: 9, y: 10, color: COLORS.cream },
    { x: 10, y: 10, color: COLORS.cream },
    { x: 11, y: 10, color: COLORS.dark },
    { x: 3, y: 11, color: COLORS.dark },
    { x: 4, y: 11, color: COLORS.dark },
    { x: 5, y: 11, color: COLORS.dark },
    { x: 6, y: 11, color: COLORS.dark },
    { x: 7, y: 11, color: COLORS.dark },
    { x: 8, y: 11, color: COLORS.dark },
    { x: 9, y: 11, color: COLORS.cream },
    { x: 10, y: 11, color: COLORS.cream },
    { x: 11, y: 11, color: COLORS.dark },
    // Tail
    { x: 9, y: 12, color: COLORS.dark },
    { x: 10, y: 12, color: COLORS.cream },
    { x: 11, y: 12, color: COLORS.dark },
    { x: 12, y: 12, color: COLORS.dark },
    { x: 10, y: 13, color: COLORS.dark },
    { x: 11, y: 13, color: COLORS.cream },
    { x: 12, y: 13, color: COLORS.dark },
    { x: 11, y: 14, color: COLORS.dark },
    { x: 12, y: 14, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.2} viewBox="0 0 56 64" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// V5: COMPACT - Tighter spacing, minimal
export function PixelLogoModernV5({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // CHEF HAT - Compact puffy style
    { x: 5, y: 0, color: COLORS.hatWhite },
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 4, y: 1, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    // Single pleat row (compact)
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatShadow },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatShadow },
    { x: 8, y: 2, color: COLORS.hatWhite },
    // Hat band
    { x: 3, y: 3, color: COLORS.dark },
    { x: 4, y: 3, color: COLORS.dark },
    { x: 5, y: 3, color: COLORS.dark },
    { x: 6, y: 3, color: COLORS.dark },
    { x: 7, y: 3, color: COLORS.dark },
    { x: 8, y: 3, color: COLORS.dark },
    { x: 9, y: 3, color: COLORS.dark },

    // COMPACT BUBBLE
    { x: 2, y: 4, color: COLORS.dark },
    { x: 3, y: 4, color: COLORS.dark },
    { x: 4, y: 4, color: COLORS.dark },
    { x: 5, y: 4, color: COLORS.dark },
    { x: 6, y: 4, color: COLORS.dark },
    { x: 7, y: 4, color: COLORS.dark },
    { x: 8, y: 4, color: COLORS.dark },
    { x: 9, y: 4, color: COLORS.dark },
    { x: 10, y: 4, color: COLORS.dark },
    { x: 2, y: 5, color: COLORS.dark },
    { x: 3, y: 5, color: COLORS.cream },
    { x: 4, y: 5, color: COLORS.cream },
    { x: 5, y: 5, color: COLORS.cream },
    { x: 6, y: 5, color: COLORS.cream },
    { x: 7, y: 5, color: COLORS.cream },
    { x: 8, y: 5, color: COLORS.cream },
    { x: 9, y: 5, color: COLORS.cream },
    { x: 10, y: 5, color: COLORS.dark },
    { x: 2, y: 6, color: COLORS.dark },
    { x: 3, y: 6, color: COLORS.cream },
    { x: 4, y: 6, color: COLORS.orange },
    { x: 5, y: 6, color: COLORS.cream },
    { x: 6, y: 6, color: COLORS.orange },
    { x: 7, y: 6, color: COLORS.cream },
    { x: 8, y: 6, color: COLORS.orange },
    { x: 9, y: 6, color: COLORS.cream },
    { x: 10, y: 6, color: COLORS.dark },
    { x: 2, y: 7, color: COLORS.dark },
    { x: 3, y: 7, color: COLORS.cream },
    { x: 4, y: 7, color: COLORS.cream },
    { x: 5, y: 7, color: COLORS.cream },
    { x: 6, y: 7, color: COLORS.cream },
    { x: 7, y: 7, color: COLORS.cream },
    { x: 8, y: 7, color: COLORS.cream },
    { x: 9, y: 7, color: COLORS.cream },
    { x: 10, y: 7, color: COLORS.dark },
    { x: 2, y: 8, color: COLORS.dark },
    { x: 3, y: 8, color: COLORS.dark },
    { x: 4, y: 8, color: COLORS.dark },
    { x: 5, y: 8, color: COLORS.dark },
    { x: 6, y: 8, color: COLORS.dark },
    { x: 7, y: 8, color: COLORS.dark },
    { x: 8, y: 8, color: COLORS.cream },
    { x: 9, y: 8, color: COLORS.cream },
    { x: 10, y: 8, color: COLORS.dark },
    // Compact tail
    { x: 8, y: 9, color: COLORS.dark },
    { x: 9, y: 9, color: COLORS.cream },
    { x: 10, y: 9, color: COLORS.dark },
    { x: 11, y: 9, color: COLORS.dark },
    { x: 9, y: 10, color: COLORS.dark },
    { x: 10, y: 10, color: COLORS.dark },
    { x: 11, y: 10, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 0.9} viewBox="0 0 52 48" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ORIGINAL PIXEL CHAT CHEF (keeping for backwards compatibility)
// ─────────────────────────────────────────────────────────────────────────────

export function PixelChatChef({
  className,
  size = 64,
  animated = false
}: {
  className?: string;
  size?: number;
  animated?: boolean;
}) {
  // 16x20 pixel grid for chat chef logo
  // Design: Puffy chef hat on top of rounded message box with chat tail

  const pixels: { x: number; y: number; color: string }[] = [
    // ═══════════════════════════════════════════════════════════════
    // CHEF HAT - Puffy toque style
    // ═══════════════════════════════════════════════════════════════

    // Hat top (puffy cloud shape)
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 8, y: 0, color: COLORS.hatWhite },
    { x: 9, y: 0, color: COLORS.hatShadow },

    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 9, y: 1, color: COLORS.hatWhite },
    { x: 10, y: 1, color: COLORS.hatShadow },

    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatWhite },
    { x: 10, y: 2, color: COLORS.hatWhite },
    { x: 11, y: 2, color: COLORS.hatShadow },

    { x: 4, y: 3, color: COLORS.hatWhite },
    { x: 5, y: 3, color: COLORS.hatWhite },
    { x: 6, y: 3, color: COLORS.hatWhite },
    { x: 7, y: 3, color: COLORS.hatWhite },
    { x: 8, y: 3, color: COLORS.hatWhite },
    { x: 9, y: 3, color: COLORS.hatWhite },
    { x: 10, y: 3, color: COLORS.hatWhite },
    { x: 11, y: 3, color: COLORS.hatShadow },

    // Hat brim (dark band)
    { x: 3, y: 4, color: COLORS.dark },
    { x: 4, y: 4, color: COLORS.dark },
    { x: 5, y: 4, color: COLORS.dark },
    { x: 6, y: 4, color: COLORS.dark },
    { x: 7, y: 4, color: COLORS.dark },
    { x: 8, y: 4, color: COLORS.dark },
    { x: 9, y: 4, color: COLORS.dark },
    { x: 10, y: 4, color: COLORS.dark },
    { x: 11, y: 4, color: COLORS.dark },
    { x: 12, y: 4, color: COLORS.dark },

    // ═══════════════════════════════════════════════════════════════
    // MESSAGE BOX - Rounded rectangle
    // ═══════════════════════════════════════════════════════════════

    // Top edge (with rounded corners)
    { x: 4, y: 5, color: COLORS.dark },
    { x: 5, y: 5, color: COLORS.dark },
    { x: 6, y: 5, color: COLORS.dark },
    { x: 7, y: 5, color: COLORS.dark },
    { x: 8, y: 5, color: COLORS.dark },
    { x: 9, y: 5, color: COLORS.dark },
    { x: 10, y: 5, color: COLORS.dark },
    { x: 11, y: 5, color: COLORS.dark },

    // Box body - left edge
    { x: 3, y: 6, color: COLORS.dark },
    { x: 3, y: 7, color: COLORS.dark },
    { x: 3, y: 8, color: COLORS.dark },
    { x: 3, y: 9, color: COLORS.dark },
    { x: 3, y: 10, color: COLORS.dark },
    { x: 3, y: 11, color: COLORS.dark },
    { x: 3, y: 12, color: COLORS.dark },

    // Box body - right edge
    { x: 12, y: 6, color: COLORS.dark },
    { x: 12, y: 7, color: COLORS.dark },
    { x: 12, y: 8, color: COLORS.dark },
    { x: 12, y: 9, color: COLORS.dark },
    { x: 12, y: 10, color: COLORS.dark },
    { x: 12, y: 11, color: COLORS.dark },
    { x: 12, y: 12, color: COLORS.dark },

    // Box interior fill (cream/white)
    { x: 4, y: 6, color: COLORS.cream },
    { x: 5, y: 6, color: COLORS.cream },
    { x: 6, y: 6, color: COLORS.cream },
    { x: 7, y: 6, color: COLORS.cream },
    { x: 8, y: 6, color: COLORS.cream },
    { x: 9, y: 6, color: COLORS.cream },
    { x: 10, y: 6, color: COLORS.cream },
    { x: 11, y: 6, color: COLORS.cream },

    { x: 4, y: 7, color: COLORS.cream },
    { x: 5, y: 7, color: COLORS.cream },
    { x: 6, y: 7, color: COLORS.cream },
    { x: 7, y: 7, color: COLORS.cream },
    { x: 8, y: 7, color: COLORS.cream },
    { x: 9, y: 7, color: COLORS.cream },
    { x: 10, y: 7, color: COLORS.cream },
    { x: 11, y: 7, color: COLORS.cream },

    { x: 4, y: 8, color: COLORS.cream },
    { x: 5, y: 8, color: COLORS.cream },
    { x: 6, y: 8, color: COLORS.cream },
    { x: 7, y: 8, color: COLORS.cream },
    { x: 8, y: 8, color: COLORS.cream },
    { x: 9, y: 8, color: COLORS.cream },
    { x: 10, y: 8, color: COLORS.cream },
    { x: 11, y: 8, color: COLORS.cream },

    // Orange accent line in middle
    { x: 5, y: 9, color: COLORS.orange },
    { x: 6, y: 9, color: COLORS.orange },
    { x: 7, y: 9, color: COLORS.orange },
    { x: 8, y: 9, color: COLORS.orange },
    { x: 9, y: 9, color: COLORS.orange },
    { x: 10, y: 9, color: COLORS.orange },
    { x: 4, y: 9, color: COLORS.cream },
    { x: 11, y: 9, color: COLORS.cream },

    { x: 4, y: 10, color: COLORS.cream },
    { x: 5, y: 10, color: COLORS.cream },
    { x: 6, y: 10, color: COLORS.cream },
    { x: 7, y: 10, color: COLORS.cream },
    { x: 8, y: 10, color: COLORS.cream },
    { x: 9, y: 10, color: COLORS.cream },
    { x: 10, y: 10, color: COLORS.cream },
    { x: 11, y: 10, color: COLORS.cream },

    { x: 4, y: 11, color: COLORS.cream },
    { x: 5, y: 11, color: COLORS.cream },
    { x: 6, y: 11, color: COLORS.cream },
    { x: 7, y: 11, color: COLORS.cream },
    { x: 8, y: 11, color: COLORS.cream },
    { x: 9, y: 11, color: COLORS.cream },
    { x: 10, y: 11, color: COLORS.cream },
    { x: 11, y: 11, color: COLORS.cream },

    { x: 4, y: 12, color: COLORS.cream },
    { x: 5, y: 12, color: COLORS.cream },
    { x: 6, y: 12, color: COLORS.cream },
    { x: 7, y: 12, color: COLORS.cream },
    { x: 8, y: 12, color: COLORS.cream },
    { x: 9, y: 12, color: COLORS.cream },
    { x: 10, y: 12, color: COLORS.cream },
    { x: 11, y: 12, color: COLORS.cream },

    // Bottom edge (with rounded corners)
    { x: 4, y: 13, color: COLORS.dark },
    { x: 5, y: 13, color: COLORS.dark },
    { x: 6, y: 13, color: COLORS.dark },
    { x: 7, y: 13, color: COLORS.dark },
    { x: 8, y: 13, color: COLORS.dark },
    { x: 9, y: 13, color: COLORS.dark },
    { x: 10, y: 13, color: COLORS.dark },
    { x: 11, y: 13, color: COLORS.dark },

    // ═══════════════════════════════════════════════════════════════
    // CHAT TAIL - Triangle pointing down-left
    // ═══════════════════════════════════════════════════════════════
    { x: 4, y: 14, color: COLORS.dark },
    { x: 5, y: 14, color: COLORS.cream },
    { x: 6, y: 14, color: COLORS.dark },

    { x: 3, y: 15, color: COLORS.dark },
    { x: 4, y: 15, color: COLORS.cream },
    { x: 5, y: 15, color: COLORS.dark },

    { x: 2, y: 16, color: COLORS.dark },
    { x: 3, y: 16, color: COLORS.dark },
    { x: 4, y: 16, color: COLORS.dark },
  ];

  return (
    <div className={cn(
      'relative inline-block',
      animated && 'animate-pixel-bounce',
      className
    )}>
      <svg
        width={size}
        height={size * 1.1}
        viewBox="0 0 64 72"
        className="pixel-art"
        style={{ imageRendering: 'pixelated' }}
      >
        {pixels.map((p, i) => (
          <Pixel key={i} x={p.x} y={p.y} color={p.color} />
        ))}
      </svg>

      {/* Animated steam when enabled */}
      {animated && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2">
          <svg
            width="24"
            height="16"
            viewBox="0 0 24 16"
            className="pixel-art animate-float opacity-60"
            style={{ imageRendering: 'pixelated' }}
          >
            <Pixel x={2} y={3} color={COLORS.gray} />
            <Pixel x={3} y={2} color={COLORS.gray} />
            <Pixel x={2} y={1} color={COLORS.gray} />
            <Pixel x={3} y={0} color={COLORS.gray} />

            <Pixel x={5} y={2} color={COLORS.gray} />
            <Pixel x={4} y={1} color={COLORS.gray} />
            <Pixel x={5} y={0} color={COLORS.gray} />
          </svg>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CHEF PIXEL - Animated chef character with blinking and waving
// ─────────────────────────────────────────────────────────────────────────────

export function ChefPixel({ className, size = 120 }: { className?: string; size?: number }) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [isWaving, setIsWaving] = useState(false);

  useEffect(() => {
    // Random blinking
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 3000 + Math.random() * 2000);

    // Periodic waving
    const waveInterval = setInterval(() => {
      setIsWaving(true);
      setTimeout(() => setIsWaving(false), 600);
    }, 5000);

    return () => {
      clearInterval(blinkInterval);
      clearInterval(waveInterval);
    };
  }, []);

  // 16x20 pixel grid for chef
  const pixels: { x: number; y: number; color: string }[] = [
    // Chef hat - tall toque
    { x: 5, y: 0, color: COLORS.hatWhite },
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 8, y: 0, color: COLORS.hatWhite },
    { x: 9, y: 0, color: COLORS.hatWhite },
    { x: 10, y: 0, color: COLORS.hatShadow },
    { x: 4, y: 1, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 9, y: 1, color: COLORS.hatWhite },
    { x: 10, y: 1, color: COLORS.hatShadow },
    { x: 11, y: 1, color: COLORS.hatShadow },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatWhite },
    { x: 10, y: 2, color: COLORS.hatWhite },
    { x: 11, y: 2, color: COLORS.hatShadow },
    // Hat brim
    { x: 3, y: 3, color: COLORS.hatWhite },
    { x: 4, y: 3, color: COLORS.hatWhite },
    { x: 5, y: 3, color: COLORS.hatWhite },
    { x: 6, y: 3, color: COLORS.hatWhite },
    { x: 7, y: 3, color: COLORS.hatWhite },
    { x: 8, y: 3, color: COLORS.hatWhite },
    { x: 9, y: 3, color: COLORS.hatWhite },
    { x: 10, y: 3, color: COLORS.hatWhite },
    { x: 11, y: 3, color: COLORS.hatWhite },
    { x: 12, y: 3, color: COLORS.hatShadow },
    // Face
    { x: 5, y: 4, color: COLORS.skin },
    { x: 6, y: 4, color: COLORS.skin },
    { x: 7, y: 4, color: COLORS.skin },
    { x: 8, y: 4, color: COLORS.skin },
    { x: 9, y: 4, color: COLORS.skin },
    { x: 10, y: 4, color: COLORS.skinShadow },
    { x: 4, y: 5, color: COLORS.skin },
    { x: 5, y: 5, color: COLORS.skin },
    { x: 6, y: 5, color: COLORS.dark }, // Left eye
    { x: 7, y: 5, color: COLORS.skin },
    { x: 8, y: 5, color: COLORS.skin },
    { x: 9, y: 5, color: COLORS.dark }, // Right eye
    { x: 10, y: 5, color: COLORS.skin },
    { x: 11, y: 5, color: COLORS.skinShadow },
    { x: 4, y: 6, color: COLORS.skin },
    { x: 5, y: 6, color: COLORS.skin },
    { x: 6, y: 6, color: COLORS.skin },
    { x: 7, y: 6, color: COLORS.skin },
    { x: 8, y: 6, color: COLORS.skin },
    { x: 9, y: 6, color: COLORS.skin },
    { x: 10, y: 6, color: COLORS.skin },
    { x: 11, y: 6, color: COLORS.skinShadow },
    // Smile
    { x: 5, y: 7, color: COLORS.skin },
    { x: 6, y: 7, color: COLORS.orange }, // Smile
    { x: 7, y: 7, color: COLORS.orange },
    { x: 8, y: 7, color: COLORS.orange },
    { x: 9, y: 7, color: COLORS.orange },
    { x: 10, y: 7, color: COLORS.skin },
    // Chin
    { x: 5, y: 8, color: COLORS.skin },
    { x: 6, y: 8, color: COLORS.skin },
    { x: 7, y: 8, color: COLORS.skin },
    { x: 8, y: 8, color: COLORS.skin },
    { x: 9, y: 8, color: COLORS.skin },
    { x: 10, y: 8, color: COLORS.skinShadow },
    // Body - chef coat
    { x: 4, y: 9, color: COLORS.hatWhite },
    { x: 5, y: 9, color: COLORS.hatWhite },
    { x: 6, y: 9, color: COLORS.hatWhite },
    { x: 7, y: 9, color: COLORS.dark }, // Button
    { x: 8, y: 9, color: COLORS.hatWhite },
    { x: 9, y: 9, color: COLORS.hatWhite },
    { x: 10, y: 9, color: COLORS.hatWhite },
    { x: 11, y: 9, color: COLORS.hatShadow },
    { x: 3, y: 10, color: COLORS.hatWhite },
    { x: 4, y: 10, color: COLORS.hatWhite },
    { x: 5, y: 10, color: COLORS.hatWhite },
    { x: 6, y: 10, color: COLORS.hatWhite },
    { x: 7, y: 10, color: COLORS.dark }, // Button
    { x: 8, y: 10, color: COLORS.hatWhite },
    { x: 9, y: 10, color: COLORS.hatWhite },
    { x: 10, y: 10, color: COLORS.hatWhite },
    { x: 11, y: 10, color: COLORS.hatWhite },
    { x: 12, y: 10, color: COLORS.hatShadow },
    { x: 3, y: 11, color: COLORS.hatWhite },
    { x: 4, y: 11, color: COLORS.hatWhite },
    { x: 5, y: 11, color: COLORS.hatWhite },
    { x: 6, y: 11, color: COLORS.hatWhite },
    { x: 7, y: 11, color: COLORS.dark }, // Button
    { x: 8, y: 11, color: COLORS.hatWhite },
    { x: 9, y: 11, color: COLORS.hatWhite },
    { x: 10, y: 11, color: COLORS.hatWhite },
    { x: 11, y: 11, color: COLORS.hatWhite },
    { x: 12, y: 11, color: COLORS.hatShadow },
    // Arms
    { x: 1, y: 10, color: COLORS.skin }, // Left arm
    { x: 2, y: 10, color: COLORS.skin },
    { x: 13, y: 10, color: COLORS.skin }, // Right arm
    { x: 14, y: 10, color: COLORS.skin },
    { x: 1, y: 11, color: COLORS.skin },
    { x: 2, y: 11, color: COLORS.hatWhite },
    { x: 13, y: 11, color: COLORS.hatWhite },
    { x: 14, y: 11, color: COLORS.skin },
    // Pan in right hand
    { x: 14, y: 9, color: COLORS.gray },
    { x: 15, y: 9, color: COLORS.gray },
    { x: 13, y: 8, color: COLORS.gray },
    { x: 14, y: 8, color: COLORS.gray },
    { x: 15, y: 8, color: COLORS.gray },
    { x: 13, y: 7, color: COLORS.gray },
    { x: 14, y: 7, color: COLORS.lightGray },
    { x: 15, y: 7, color: COLORS.gray },
    // Lower body
    { x: 4, y: 12, color: COLORS.hatWhite },
    { x: 5, y: 12, color: COLORS.hatWhite },
    { x: 6, y: 12, color: COLORS.hatWhite },
    { x: 7, y: 12, color: COLORS.hatWhite },
    { x: 8, y: 12, color: COLORS.hatWhite },
    { x: 9, y: 12, color: COLORS.hatWhite },
    { x: 10, y: 12, color: COLORS.hatWhite },
    { x: 11, y: 12, color: COLORS.hatShadow },
    // Legs/pants
    { x: 5, y: 13, color: COLORS.dark },
    { x: 6, y: 13, color: COLORS.dark },
    { x: 7, y: 13, color: COLORS.dark },
    { x: 8, y: 13, color: COLORS.dark },
    { x: 9, y: 13, color: COLORS.dark },
    { x: 10, y: 13, color: COLORS.dark },
    { x: 5, y: 14, color: COLORS.dark },
    { x: 6, y: 14, color: COLORS.dark },
    { x: 9, y: 14, color: COLORS.dark },
    { x: 10, y: 14, color: COLORS.dark },
    // Feet
    { x: 4, y: 15, color: COLORS.dark },
    { x: 5, y: 15, color: COLORS.dark },
    { x: 6, y: 15, color: COLORS.dark },
    { x: 9, y: 15, color: COLORS.dark },
    { x: 10, y: 15, color: COLORS.dark },
    { x: 11, y: 15, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block animate-pixel-bounce', className)}>
      <svg
        width={size}
        height={size * 1.25}
        viewBox="0 0 64 80"
        className="pixel-art"
        style={{ imageRendering: 'pixelated' }}
      >
        {pixels.map((p, i) => {
          // Handle blinking - replace eyes with skin color
          if (isBlinking && ((p.x === 6 && p.y === 5) || (p.x === 9 && p.y === 5))) {
            return <Pixel key={i} x={p.x} y={p.y} color={COLORS.skin} />;
          }
          return <Pixel key={i} x={p.x} y={p.y} color={p.color} />;
        })}
      </svg>
      {/* Waving hand animation */}
      {isWaving && (
        <div className="absolute -right-2 top-8 animate-wave">
          <svg width="20" height="20" viewBox="0 0 16 16" className="pixel-art">
            <Pixel x={0} y={0} color={COLORS.skin} />
            <Pixel x={1} y={0} color={COLORS.skin} />
            <Pixel x={0} y={1} color={COLORS.skin} />
            <Pixel x={1} y={1} color={COLORS.skin} />
          </svg>
        </div>
      )}
    </div>
  );
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
      className={cn('pixel-art', animated && 'animate-pixel-float', className)}
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
          <svg width="24" height="24" viewBox="0 0 24 24" className="pixel-art">
            <rect x="4" y="4" width="16" height="16" fill="#F97316" />
            <rect x="8" y="8" width="8" height="8" fill="#FDFBF7" />
          </svg>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FINAL VARIATIONS - V1 rounder hat + orange dots + left-side tail
// These combine the approved V1 hat with original orange accents and left tail
// ─────────────────────────────────────────────────────────────────────────────

// FINAL A: Classic left tail (like original reference image)
export function PixelLogoFinalA({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // CHEF HAT - V1 rounder hat (wider, puffier)
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 8, y: 0, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 9, y: 1, color: COLORS.hatWhite },
    // Wider at row 2 for rounder look
    { x: 3, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatWhite },
    { x: 10, y: 2, color: COLORS.hatWhite },
    { x: 11, y: 2, color: COLORS.hatWhite },
    // Pleats
    { x: 4, y: 3, color: COLORS.hatWhite },
    { x: 5, y: 3, color: COLORS.hatShadow },
    { x: 6, y: 3, color: COLORS.hatWhite },
    { x: 7, y: 3, color: COLORS.hatShadow },
    { x: 8, y: 3, color: COLORS.hatWhite },
    { x: 9, y: 3, color: COLORS.hatShadow },
    { x: 10, y: 3, color: COLORS.hatWhite },
    { x: 4, y: 4, color: COLORS.hatWhite },
    { x: 5, y: 4, color: COLORS.hatShadow },
    { x: 6, y: 4, color: COLORS.hatWhite },
    { x: 7, y: 4, color: COLORS.hatShadow },
    { x: 8, y: 4, color: COLORS.hatWhite },
    { x: 9, y: 4, color: COLORS.hatShadow },
    { x: 10, y: 4, color: COLORS.hatWhite },
    // Hat band
    { x: 4, y: 5, color: COLORS.dark },
    { x: 5, y: 5, color: COLORS.dark },
    { x: 6, y: 5, color: COLORS.dark },
    { x: 7, y: 5, color: COLORS.dark },
    { x: 8, y: 5, color: COLORS.dark },
    { x: 9, y: 5, color: COLORS.dark },
    { x: 10, y: 5, color: COLORS.dark },

    // MESSAGE BUBBLE - with orange dots and LEFT tail
    { x: 4, y: 6, color: COLORS.dark },
    { x: 5, y: 6, color: COLORS.dark },
    { x: 6, y: 6, color: COLORS.dark },
    { x: 7, y: 6, color: COLORS.dark },
    { x: 8, y: 6, color: COLORS.dark },
    { x: 9, y: 6, color: COLORS.dark },
    { x: 10, y: 6, color: COLORS.dark },
    { x: 3, y: 7, color: COLORS.dark },
    { x: 4, y: 7, color: COLORS.cream },
    { x: 5, y: 7, color: COLORS.cream },
    { x: 6, y: 7, color: COLORS.cream },
    { x: 7, y: 7, color: COLORS.cream },
    { x: 8, y: 7, color: COLORS.cream },
    { x: 9, y: 7, color: COLORS.cream },
    { x: 10, y: 7, color: COLORS.cream },
    { x: 11, y: 7, color: COLORS.dark },
    { x: 3, y: 8, color: COLORS.dark },
    { x: 4, y: 8, color: COLORS.cream },
    { x: 5, y: 8, color: COLORS.orange },
    { x: 6, y: 8, color: COLORS.cream },
    { x: 7, y: 8, color: COLORS.orange },
    { x: 8, y: 8, color: COLORS.cream },
    { x: 9, y: 8, color: COLORS.orange },
    { x: 10, y: 8, color: COLORS.cream },
    { x: 11, y: 8, color: COLORS.dark },
    { x: 3, y: 9, color: COLORS.dark },
    { x: 4, y: 9, color: COLORS.cream },
    { x: 5, y: 9, color: COLORS.cream },
    { x: 6, y: 9, color: COLORS.cream },
    { x: 7, y: 9, color: COLORS.cream },
    { x: 8, y: 9, color: COLORS.cream },
    { x: 9, y: 9, color: COLORS.cream },
    { x: 10, y: 9, color: COLORS.cream },
    { x: 11, y: 9, color: COLORS.dark },
    { x: 4, y: 10, color: COLORS.dark },
    { x: 5, y: 10, color: COLORS.dark },
    { x: 6, y: 10, color: COLORS.dark },
    { x: 7, y: 10, color: COLORS.dark },
    { x: 8, y: 10, color: COLORS.dark },
    { x: 9, y: 10, color: COLORS.dark },
    { x: 10, y: 10, color: COLORS.dark },
    // LEFT tail
    { x: 3, y: 10, color: COLORS.dark },
    { x: 2, y: 11, color: COLORS.dark },
    { x: 3, y: 11, color: COLORS.cream },
    { x: 4, y: 11, color: COLORS.dark },
    { x: 1, y: 12, color: COLORS.dark },
    { x: 2, y: 12, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.1} viewBox="0 0 56 56" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// FINAL B: Wider bubble, compact left tail
export function PixelLogoFinalB({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // CHEF HAT - V1 rounder hat
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 8, y: 0, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 9, y: 1, color: COLORS.hatWhite },
    { x: 3, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatWhite },
    { x: 10, y: 2, color: COLORS.hatWhite },
    { x: 11, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 3, color: COLORS.hatWhite },
    { x: 5, y: 3, color: COLORS.hatShadow },
    { x: 6, y: 3, color: COLORS.hatWhite },
    { x: 7, y: 3, color: COLORS.hatShadow },
    { x: 8, y: 3, color: COLORS.hatWhite },
    { x: 9, y: 3, color: COLORS.hatShadow },
    { x: 10, y: 3, color: COLORS.hatWhite },
    { x: 4, y: 4, color: COLORS.hatWhite },
    { x: 5, y: 4, color: COLORS.hatShadow },
    { x: 6, y: 4, color: COLORS.hatWhite },
    { x: 7, y: 4, color: COLORS.hatShadow },
    { x: 8, y: 4, color: COLORS.hatWhite },
    { x: 9, y: 4, color: COLORS.hatShadow },
    { x: 10, y: 4, color: COLORS.hatWhite },
    { x: 4, y: 5, color: COLORS.dark },
    { x: 5, y: 5, color: COLORS.dark },
    { x: 6, y: 5, color: COLORS.dark },
    { x: 7, y: 5, color: COLORS.dark },
    { x: 8, y: 5, color: COLORS.dark },
    { x: 9, y: 5, color: COLORS.dark },
    { x: 10, y: 5, color: COLORS.dark },

    // WIDER BUBBLE
    { x: 3, y: 6, color: COLORS.dark },
    { x: 4, y: 6, color: COLORS.dark },
    { x: 5, y: 6, color: COLORS.dark },
    { x: 6, y: 6, color: COLORS.dark },
    { x: 7, y: 6, color: COLORS.dark },
    { x: 8, y: 6, color: COLORS.dark },
    { x: 9, y: 6, color: COLORS.dark },
    { x: 10, y: 6, color: COLORS.dark },
    { x: 11, y: 6, color: COLORS.dark },
    { x: 2, y: 7, color: COLORS.dark },
    { x: 3, y: 7, color: COLORS.cream },
    { x: 4, y: 7, color: COLORS.cream },
    { x: 5, y: 7, color: COLORS.cream },
    { x: 6, y: 7, color: COLORS.cream },
    { x: 7, y: 7, color: COLORS.cream },
    { x: 8, y: 7, color: COLORS.cream },
    { x: 9, y: 7, color: COLORS.cream },
    { x: 10, y: 7, color: COLORS.cream },
    { x: 11, y: 7, color: COLORS.cream },
    { x: 12, y: 7, color: COLORS.dark },
    { x: 2, y: 8, color: COLORS.dark },
    { x: 3, y: 8, color: COLORS.cream },
    { x: 4, y: 8, color: COLORS.orange },
    { x: 5, y: 8, color: COLORS.cream },
    { x: 6, y: 8, color: COLORS.cream },
    { x: 7, y: 8, color: COLORS.orange },
    { x: 8, y: 8, color: COLORS.cream },
    { x: 9, y: 8, color: COLORS.cream },
    { x: 10, y: 8, color: COLORS.orange },
    { x: 11, y: 8, color: COLORS.cream },
    { x: 12, y: 8, color: COLORS.dark },
    { x: 2, y: 9, color: COLORS.dark },
    { x: 3, y: 9, color: COLORS.cream },
    { x: 4, y: 9, color: COLORS.cream },
    { x: 5, y: 9, color: COLORS.cream },
    { x: 6, y: 9, color: COLORS.cream },
    { x: 7, y: 9, color: COLORS.cream },
    { x: 8, y: 9, color: COLORS.cream },
    { x: 9, y: 9, color: COLORS.cream },
    { x: 10, y: 9, color: COLORS.cream },
    { x: 11, y: 9, color: COLORS.cream },
    { x: 12, y: 9, color: COLORS.dark },
    { x: 3, y: 10, color: COLORS.dark },
    { x: 4, y: 10, color: COLORS.dark },
    { x: 5, y: 10, color: COLORS.dark },
    { x: 6, y: 10, color: COLORS.dark },
    { x: 7, y: 10, color: COLORS.dark },
    { x: 8, y: 10, color: COLORS.dark },
    { x: 9, y: 10, color: COLORS.dark },
    { x: 10, y: 10, color: COLORS.dark },
    { x: 11, y: 10, color: COLORS.dark },
    // Small left tail
    { x: 2, y: 10, color: COLORS.dark },
    { x: 1, y: 11, color: COLORS.dark },
    { x: 2, y: 11, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.0} viewBox="0 0 56 52" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// FINAL C: Taller bubble with more space for text
export function PixelLogoFinalC({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // CHEF HAT - V1 rounder hat
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 8, y: 0, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 9, y: 1, color: COLORS.hatWhite },
    { x: 3, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatWhite },
    { x: 10, y: 2, color: COLORS.hatWhite },
    { x: 11, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 3, color: COLORS.hatWhite },
    { x: 5, y: 3, color: COLORS.hatShadow },
    { x: 6, y: 3, color: COLORS.hatWhite },
    { x: 7, y: 3, color: COLORS.hatShadow },
    { x: 8, y: 3, color: COLORS.hatWhite },
    { x: 9, y: 3, color: COLORS.hatShadow },
    { x: 10, y: 3, color: COLORS.hatWhite },
    { x: 4, y: 4, color: COLORS.hatWhite },
    { x: 5, y: 4, color: COLORS.hatShadow },
    { x: 6, y: 4, color: COLORS.hatWhite },
    { x: 7, y: 4, color: COLORS.hatShadow },
    { x: 8, y: 4, color: COLORS.hatWhite },
    { x: 9, y: 4, color: COLORS.hatShadow },
    { x: 10, y: 4, color: COLORS.hatWhite },
    { x: 4, y: 5, color: COLORS.dark },
    { x: 5, y: 5, color: COLORS.dark },
    { x: 6, y: 5, color: COLORS.dark },
    { x: 7, y: 5, color: COLORS.dark },
    { x: 8, y: 5, color: COLORS.dark },
    { x: 9, y: 5, color: COLORS.dark },
    { x: 10, y: 5, color: COLORS.dark },

    // TALLER BUBBLE - 5 rows of interior
    { x: 4, y: 6, color: COLORS.dark },
    { x: 5, y: 6, color: COLORS.dark },
    { x: 6, y: 6, color: COLORS.dark },
    { x: 7, y: 6, color: COLORS.dark },
    { x: 8, y: 6, color: COLORS.dark },
    { x: 9, y: 6, color: COLORS.dark },
    { x: 10, y: 6, color: COLORS.dark },
    { x: 3, y: 7, color: COLORS.dark },
    { x: 4, y: 7, color: COLORS.cream },
    { x: 5, y: 7, color: COLORS.cream },
    { x: 6, y: 7, color: COLORS.cream },
    { x: 7, y: 7, color: COLORS.cream },
    { x: 8, y: 7, color: COLORS.cream },
    { x: 9, y: 7, color: COLORS.cream },
    { x: 10, y: 7, color: COLORS.cream },
    { x: 11, y: 7, color: COLORS.dark },
    { x: 3, y: 8, color: COLORS.dark },
    { x: 4, y: 8, color: COLORS.cream },
    { x: 5, y: 8, color: COLORS.cream },
    { x: 6, y: 8, color: COLORS.cream },
    { x: 7, y: 8, color: COLORS.cream },
    { x: 8, y: 8, color: COLORS.cream },
    { x: 9, y: 8, color: COLORS.cream },
    { x: 10, y: 8, color: COLORS.cream },
    { x: 11, y: 8, color: COLORS.dark },
    { x: 3, y: 9, color: COLORS.dark },
    { x: 4, y: 9, color: COLORS.cream },
    { x: 5, y: 9, color: COLORS.orange },
    { x: 6, y: 9, color: COLORS.cream },
    { x: 7, y: 9, color: COLORS.orange },
    { x: 8, y: 9, color: COLORS.cream },
    { x: 9, y: 9, color: COLORS.orange },
    { x: 10, y: 9, color: COLORS.cream },
    { x: 11, y: 9, color: COLORS.dark },
    { x: 3, y: 10, color: COLORS.dark },
    { x: 4, y: 10, color: COLORS.cream },
    { x: 5, y: 10, color: COLORS.cream },
    { x: 6, y: 10, color: COLORS.cream },
    { x: 7, y: 10, color: COLORS.cream },
    { x: 8, y: 10, color: COLORS.cream },
    { x: 9, y: 10, color: COLORS.cream },
    { x: 10, y: 10, color: COLORS.cream },
    { x: 11, y: 10, color: COLORS.dark },
    { x: 3, y: 11, color: COLORS.dark },
    { x: 4, y: 11, color: COLORS.cream },
    { x: 5, y: 11, color: COLORS.cream },
    { x: 6, y: 11, color: COLORS.cream },
    { x: 7, y: 11, color: COLORS.cream },
    { x: 8, y: 11, color: COLORS.cream },
    { x: 9, y: 11, color: COLORS.cream },
    { x: 10, y: 11, color: COLORS.cream },
    { x: 11, y: 11, color: COLORS.dark },
    { x: 4, y: 12, color: COLORS.dark },
    { x: 5, y: 12, color: COLORS.dark },
    { x: 6, y: 12, color: COLORS.dark },
    { x: 7, y: 12, color: COLORS.dark },
    { x: 8, y: 12, color: COLORS.dark },
    { x: 9, y: 12, color: COLORS.dark },
    { x: 10, y: 12, color: COLORS.dark },
    // Left tail
    { x: 3, y: 12, color: COLORS.dark },
    { x: 2, y: 13, color: COLORS.dark },
    { x: 3, y: 13, color: COLORS.cream },
    { x: 4, y: 13, color: COLORS.dark },
    { x: 1, y: 14, color: COLORS.dark },
    { x: 2, y: 14, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.2} viewBox="0 0 56 64" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// FINAL D: Long swoopy left tail
export function PixelLogoFinalD({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // CHEF HAT - V1 rounder hat
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 8, y: 0, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 9, y: 1, color: COLORS.hatWhite },
    { x: 3, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatWhite },
    { x: 10, y: 2, color: COLORS.hatWhite },
    { x: 11, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 3, color: COLORS.hatWhite },
    { x: 5, y: 3, color: COLORS.hatShadow },
    { x: 6, y: 3, color: COLORS.hatWhite },
    { x: 7, y: 3, color: COLORS.hatShadow },
    { x: 8, y: 3, color: COLORS.hatWhite },
    { x: 9, y: 3, color: COLORS.hatShadow },
    { x: 10, y: 3, color: COLORS.hatWhite },
    { x: 4, y: 4, color: COLORS.hatWhite },
    { x: 5, y: 4, color: COLORS.hatShadow },
    { x: 6, y: 4, color: COLORS.hatWhite },
    { x: 7, y: 4, color: COLORS.hatShadow },
    { x: 8, y: 4, color: COLORS.hatWhite },
    { x: 9, y: 4, color: COLORS.hatShadow },
    { x: 10, y: 4, color: COLORS.hatWhite },
    { x: 4, y: 5, color: COLORS.dark },
    { x: 5, y: 5, color: COLORS.dark },
    { x: 6, y: 5, color: COLORS.dark },
    { x: 7, y: 5, color: COLORS.dark },
    { x: 8, y: 5, color: COLORS.dark },
    { x: 9, y: 5, color: COLORS.dark },
    { x: 10, y: 5, color: COLORS.dark },

    // BUBBLE
    { x: 4, y: 6, color: COLORS.dark },
    { x: 5, y: 6, color: COLORS.dark },
    { x: 6, y: 6, color: COLORS.dark },
    { x: 7, y: 6, color: COLORS.dark },
    { x: 8, y: 6, color: COLORS.dark },
    { x: 9, y: 6, color: COLORS.dark },
    { x: 10, y: 6, color: COLORS.dark },
    { x: 3, y: 7, color: COLORS.dark },
    { x: 4, y: 7, color: COLORS.cream },
    { x: 5, y: 7, color: COLORS.cream },
    { x: 6, y: 7, color: COLORS.cream },
    { x: 7, y: 7, color: COLORS.cream },
    { x: 8, y: 7, color: COLORS.cream },
    { x: 9, y: 7, color: COLORS.cream },
    { x: 10, y: 7, color: COLORS.cream },
    { x: 11, y: 7, color: COLORS.dark },
    { x: 3, y: 8, color: COLORS.dark },
    { x: 4, y: 8, color: COLORS.cream },
    { x: 5, y: 8, color: COLORS.orange },
    { x: 6, y: 8, color: COLORS.cream },
    { x: 7, y: 8, color: COLORS.orange },
    { x: 8, y: 8, color: COLORS.cream },
    { x: 9, y: 8, color: COLORS.orange },
    { x: 10, y: 8, color: COLORS.cream },
    { x: 11, y: 8, color: COLORS.dark },
    { x: 3, y: 9, color: COLORS.dark },
    { x: 4, y: 9, color: COLORS.cream },
    { x: 5, y: 9, color: COLORS.cream },
    { x: 6, y: 9, color: COLORS.cream },
    { x: 7, y: 9, color: COLORS.cream },
    { x: 8, y: 9, color: COLORS.cream },
    { x: 9, y: 9, color: COLORS.cream },
    { x: 10, y: 9, color: COLORS.cream },
    { x: 11, y: 9, color: COLORS.dark },
    { x: 4, y: 10, color: COLORS.dark },
    { x: 5, y: 10, color: COLORS.dark },
    { x: 6, y: 10, color: COLORS.dark },
    { x: 7, y: 10, color: COLORS.dark },
    { x: 8, y: 10, color: COLORS.dark },
    { x: 9, y: 10, color: COLORS.dark },
    { x: 10, y: 10, color: COLORS.dark },
    // LONG swoopy left tail
    { x: 3, y: 10, color: COLORS.dark },
    { x: 2, y: 11, color: COLORS.dark },
    { x: 3, y: 11, color: COLORS.cream },
    { x: 4, y: 11, color: COLORS.dark },
    { x: 1, y: 12, color: COLORS.dark },
    { x: 2, y: 12, color: COLORS.cream },
    { x: 3, y: 12, color: COLORS.dark },
    { x: 0, y: 13, color: COLORS.dark },
    { x: 1, y: 13, color: COLORS.dark },
    { x: 2, y: 13, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.15} viewBox="0 0 56 60" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// FINAL E: Bubble positioned under left side of hat
export function PixelLogoFinalE({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // CHEF HAT - V1 rounder hat (centered)
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 8, y: 0, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 9, y: 1, color: COLORS.hatWhite },
    { x: 3, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatWhite },
    { x: 10, y: 2, color: COLORS.hatWhite },
    { x: 11, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 3, color: COLORS.hatWhite },
    { x: 5, y: 3, color: COLORS.hatShadow },
    { x: 6, y: 3, color: COLORS.hatWhite },
    { x: 7, y: 3, color: COLORS.hatShadow },
    { x: 8, y: 3, color: COLORS.hatWhite },
    { x: 9, y: 3, color: COLORS.hatShadow },
    { x: 10, y: 3, color: COLORS.hatWhite },
    { x: 4, y: 4, color: COLORS.hatWhite },
    { x: 5, y: 4, color: COLORS.hatShadow },
    { x: 6, y: 4, color: COLORS.hatWhite },
    { x: 7, y: 4, color: COLORS.hatShadow },
    { x: 8, y: 4, color: COLORS.hatWhite },
    { x: 9, y: 4, color: COLORS.hatShadow },
    { x: 10, y: 4, color: COLORS.hatWhite },
    { x: 4, y: 5, color: COLORS.dark },
    { x: 5, y: 5, color: COLORS.dark },
    { x: 6, y: 5, color: COLORS.dark },
    { x: 7, y: 5, color: COLORS.dark },
    { x: 8, y: 5, color: COLORS.dark },
    { x: 9, y: 5, color: COLORS.dark },
    { x: 10, y: 5, color: COLORS.dark },

    // BUBBLE shifted LEFT
    { x: 2, y: 6, color: COLORS.dark },
    { x: 3, y: 6, color: COLORS.dark },
    { x: 4, y: 6, color: COLORS.dark },
    { x: 5, y: 6, color: COLORS.dark },
    { x: 6, y: 6, color: COLORS.dark },
    { x: 7, y: 6, color: COLORS.dark },
    { x: 8, y: 6, color: COLORS.dark },
    { x: 1, y: 7, color: COLORS.dark },
    { x: 2, y: 7, color: COLORS.cream },
    { x: 3, y: 7, color: COLORS.cream },
    { x: 4, y: 7, color: COLORS.cream },
    { x: 5, y: 7, color: COLORS.cream },
    { x: 6, y: 7, color: COLORS.cream },
    { x: 7, y: 7, color: COLORS.cream },
    { x: 8, y: 7, color: COLORS.cream },
    { x: 9, y: 7, color: COLORS.dark },
    { x: 1, y: 8, color: COLORS.dark },
    { x: 2, y: 8, color: COLORS.cream },
    { x: 3, y: 8, color: COLORS.orange },
    { x: 4, y: 8, color: COLORS.cream },
    { x: 5, y: 8, color: COLORS.orange },
    { x: 6, y: 8, color: COLORS.cream },
    { x: 7, y: 8, color: COLORS.orange },
    { x: 8, y: 8, color: COLORS.cream },
    { x: 9, y: 8, color: COLORS.dark },
    { x: 1, y: 9, color: COLORS.dark },
    { x: 2, y: 9, color: COLORS.cream },
    { x: 3, y: 9, color: COLORS.cream },
    { x: 4, y: 9, color: COLORS.cream },
    { x: 5, y: 9, color: COLORS.cream },
    { x: 6, y: 9, color: COLORS.cream },
    { x: 7, y: 9, color: COLORS.cream },
    { x: 8, y: 9, color: COLORS.cream },
    { x: 9, y: 9, color: COLORS.dark },
    { x: 2, y: 10, color: COLORS.dark },
    { x: 3, y: 10, color: COLORS.dark },
    { x: 4, y: 10, color: COLORS.dark },
    { x: 5, y: 10, color: COLORS.dark },
    { x: 6, y: 10, color: COLORS.dark },
    { x: 7, y: 10, color: COLORS.dark },
    { x: 8, y: 10, color: COLORS.dark },
    // Left tail
    { x: 1, y: 10, color: COLORS.dark },
    { x: 0, y: 11, color: COLORS.dark },
    { x: 1, y: 11, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.0} viewBox="0 0 56 52" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// FINAL F: Extra wide horizontal bubble
export function PixelLogoFinalF({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // CHEF HAT - V1 rounder hat
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 8, y: 0, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 9, y: 1, color: COLORS.hatWhite },
    { x: 3, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatWhite },
    { x: 10, y: 2, color: COLORS.hatWhite },
    { x: 11, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 3, color: COLORS.hatWhite },
    { x: 5, y: 3, color: COLORS.hatShadow },
    { x: 6, y: 3, color: COLORS.hatWhite },
    { x: 7, y: 3, color: COLORS.hatShadow },
    { x: 8, y: 3, color: COLORS.hatWhite },
    { x: 9, y: 3, color: COLORS.hatShadow },
    { x: 10, y: 3, color: COLORS.hatWhite },
    { x: 4, y: 4, color: COLORS.hatWhite },
    { x: 5, y: 4, color: COLORS.hatShadow },
    { x: 6, y: 4, color: COLORS.hatWhite },
    { x: 7, y: 4, color: COLORS.hatShadow },
    { x: 8, y: 4, color: COLORS.hatWhite },
    { x: 9, y: 4, color: COLORS.hatShadow },
    { x: 10, y: 4, color: COLORS.hatWhite },
    { x: 4, y: 5, color: COLORS.dark },
    { x: 5, y: 5, color: COLORS.dark },
    { x: 6, y: 5, color: COLORS.dark },
    { x: 7, y: 5, color: COLORS.dark },
    { x: 8, y: 5, color: COLORS.dark },
    { x: 9, y: 5, color: COLORS.dark },
    { x: 10, y: 5, color: COLORS.dark },

    // EXTRA WIDE bubble
    { x: 2, y: 6, color: COLORS.dark },
    { x: 3, y: 6, color: COLORS.dark },
    { x: 4, y: 6, color: COLORS.dark },
    { x: 5, y: 6, color: COLORS.dark },
    { x: 6, y: 6, color: COLORS.dark },
    { x: 7, y: 6, color: COLORS.dark },
    { x: 8, y: 6, color: COLORS.dark },
    { x: 9, y: 6, color: COLORS.dark },
    { x: 10, y: 6, color: COLORS.dark },
    { x: 11, y: 6, color: COLORS.dark },
    { x: 12, y: 6, color: COLORS.dark },
    { x: 1, y: 7, color: COLORS.dark },
    { x: 2, y: 7, color: COLORS.cream },
    { x: 3, y: 7, color: COLORS.cream },
    { x: 4, y: 7, color: COLORS.cream },
    { x: 5, y: 7, color: COLORS.cream },
    { x: 6, y: 7, color: COLORS.cream },
    { x: 7, y: 7, color: COLORS.cream },
    { x: 8, y: 7, color: COLORS.cream },
    { x: 9, y: 7, color: COLORS.cream },
    { x: 10, y: 7, color: COLORS.cream },
    { x: 11, y: 7, color: COLORS.cream },
    { x: 12, y: 7, color: COLORS.cream },
    { x: 13, y: 7, color: COLORS.dark },
    { x: 1, y: 8, color: COLORS.dark },
    { x: 2, y: 8, color: COLORS.cream },
    { x: 3, y: 8, color: COLORS.orange },
    { x: 4, y: 8, color: COLORS.cream },
    { x: 5, y: 8, color: COLORS.cream },
    { x: 6, y: 8, color: COLORS.orange },
    { x: 7, y: 8, color: COLORS.cream },
    { x: 8, y: 8, color: COLORS.cream },
    { x: 9, y: 8, color: COLORS.orange },
    { x: 10, y: 8, color: COLORS.cream },
    { x: 11, y: 8, color: COLORS.cream },
    { x: 12, y: 8, color: COLORS.cream },
    { x: 13, y: 8, color: COLORS.dark },
    { x: 1, y: 9, color: COLORS.dark },
    { x: 2, y: 9, color: COLORS.cream },
    { x: 3, y: 9, color: COLORS.cream },
    { x: 4, y: 9, color: COLORS.cream },
    { x: 5, y: 9, color: COLORS.cream },
    { x: 6, y: 9, color: COLORS.cream },
    { x: 7, y: 9, color: COLORS.cream },
    { x: 8, y: 9, color: COLORS.cream },
    { x: 9, y: 9, color: COLORS.cream },
    { x: 10, y: 9, color: COLORS.cream },
    { x: 11, y: 9, color: COLORS.cream },
    { x: 12, y: 9, color: COLORS.cream },
    { x: 13, y: 9, color: COLORS.dark },
    { x: 2, y: 10, color: COLORS.dark },
    { x: 3, y: 10, color: COLORS.dark },
    { x: 4, y: 10, color: COLORS.dark },
    { x: 5, y: 10, color: COLORS.dark },
    { x: 6, y: 10, color: COLORS.dark },
    { x: 7, y: 10, color: COLORS.dark },
    { x: 8, y: 10, color: COLORS.dark },
    { x: 9, y: 10, color: COLORS.dark },
    { x: 10, y: 10, color: COLORS.dark },
    { x: 11, y: 10, color: COLORS.dark },
    { x: 12, y: 10, color: COLORS.dark },
    // Left tail
    { x: 1, y: 10, color: COLORS.dark },
    { x: 0, y: 11, color: COLORS.dark },
    { x: 1, y: 11, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 0.9} viewBox="0 0 60 48" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// FINAL G: Clean minimal with tiny left notch
export function PixelLogoFinalG({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // CHEF HAT - V1 rounder hat
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 8, y: 0, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 9, y: 1, color: COLORS.hatWhite },
    { x: 3, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatWhite },
    { x: 10, y: 2, color: COLORS.hatWhite },
    { x: 11, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 3, color: COLORS.hatWhite },
    { x: 5, y: 3, color: COLORS.hatShadow },
    { x: 6, y: 3, color: COLORS.hatWhite },
    { x: 7, y: 3, color: COLORS.hatShadow },
    { x: 8, y: 3, color: COLORS.hatWhite },
    { x: 9, y: 3, color: COLORS.hatShadow },
    { x: 10, y: 3, color: COLORS.hatWhite },
    { x: 4, y: 4, color: COLORS.hatWhite },
    { x: 5, y: 4, color: COLORS.hatShadow },
    { x: 6, y: 4, color: COLORS.hatWhite },
    { x: 7, y: 4, color: COLORS.hatShadow },
    { x: 8, y: 4, color: COLORS.hatWhite },
    { x: 9, y: 4, color: COLORS.hatShadow },
    { x: 10, y: 4, color: COLORS.hatWhite },
    { x: 4, y: 5, color: COLORS.dark },
    { x: 5, y: 5, color: COLORS.dark },
    { x: 6, y: 5, color: COLORS.dark },
    { x: 7, y: 5, color: COLORS.dark },
    { x: 8, y: 5, color: COLORS.dark },
    { x: 9, y: 5, color: COLORS.dark },
    { x: 10, y: 5, color: COLORS.dark },

    // MINIMAL clean bubble
    { x: 4, y: 6, color: COLORS.dark },
    { x: 5, y: 6, color: COLORS.dark },
    { x: 6, y: 6, color: COLORS.dark },
    { x: 7, y: 6, color: COLORS.dark },
    { x: 8, y: 6, color: COLORS.dark },
    { x: 9, y: 6, color: COLORS.dark },
    { x: 10, y: 6, color: COLORS.dark },
    { x: 3, y: 7, color: COLORS.dark },
    { x: 4, y: 7, color: COLORS.cream },
    { x: 5, y: 7, color: COLORS.cream },
    { x: 6, y: 7, color: COLORS.cream },
    { x: 7, y: 7, color: COLORS.cream },
    { x: 8, y: 7, color: COLORS.cream },
    { x: 9, y: 7, color: COLORS.cream },
    { x: 10, y: 7, color: COLORS.cream },
    { x: 11, y: 7, color: COLORS.dark },
    { x: 3, y: 8, color: COLORS.dark },
    { x: 4, y: 8, color: COLORS.cream },
    { x: 5, y: 8, color: COLORS.orange },
    { x: 6, y: 8, color: COLORS.cream },
    { x: 7, y: 8, color: COLORS.orange },
    { x: 8, y: 8, color: COLORS.cream },
    { x: 9, y: 8, color: COLORS.orange },
    { x: 10, y: 8, color: COLORS.cream },
    { x: 11, y: 8, color: COLORS.dark },
    { x: 3, y: 9, color: COLORS.dark },
    { x: 4, y: 9, color: COLORS.cream },
    { x: 5, y: 9, color: COLORS.cream },
    { x: 6, y: 9, color: COLORS.cream },
    { x: 7, y: 9, color: COLORS.cream },
    { x: 8, y: 9, color: COLORS.cream },
    { x: 9, y: 9, color: COLORS.cream },
    { x: 10, y: 9, color: COLORS.cream },
    { x: 11, y: 9, color: COLORS.dark },
    { x: 4, y: 10, color: COLORS.dark },
    { x: 5, y: 10, color: COLORS.dark },
    { x: 6, y: 10, color: COLORS.dark },
    { x: 7, y: 10, color: COLORS.dark },
    { x: 8, y: 10, color: COLORS.dark },
    { x: 9, y: 10, color: COLORS.dark },
    { x: 10, y: 10, color: COLORS.dark },
    // Tiny left notch
    { x: 3, y: 10, color: COLORS.dark },
    { x: 2, y: 11, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.0} viewBox="0 0 56 52" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// FINAL H: Classic triangular speech pointer (left)
export function PixelLogoFinalH({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // CHEF HAT - V1 rounder hat
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 8, y: 0, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 9, y: 1, color: COLORS.hatWhite },
    { x: 3, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatWhite },
    { x: 10, y: 2, color: COLORS.hatWhite },
    { x: 11, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 3, color: COLORS.hatWhite },
    { x: 5, y: 3, color: COLORS.hatShadow },
    { x: 6, y: 3, color: COLORS.hatWhite },
    { x: 7, y: 3, color: COLORS.hatShadow },
    { x: 8, y: 3, color: COLORS.hatWhite },
    { x: 9, y: 3, color: COLORS.hatShadow },
    { x: 10, y: 3, color: COLORS.hatWhite },
    { x: 4, y: 4, color: COLORS.hatWhite },
    { x: 5, y: 4, color: COLORS.hatShadow },
    { x: 6, y: 4, color: COLORS.hatWhite },
    { x: 7, y: 4, color: COLORS.hatShadow },
    { x: 8, y: 4, color: COLORS.hatWhite },
    { x: 9, y: 4, color: COLORS.hatShadow },
    { x: 10, y: 4, color: COLORS.hatWhite },
    { x: 4, y: 5, color: COLORS.dark },
    { x: 5, y: 5, color: COLORS.dark },
    { x: 6, y: 5, color: COLORS.dark },
    { x: 7, y: 5, color: COLORS.dark },
    { x: 8, y: 5, color: COLORS.dark },
    { x: 9, y: 5, color: COLORS.dark },
    { x: 10, y: 5, color: COLORS.dark },

    // BUBBLE with classic triangular pointer
    { x: 4, y: 6, color: COLORS.dark },
    { x: 5, y: 6, color: COLORS.dark },
    { x: 6, y: 6, color: COLORS.dark },
    { x: 7, y: 6, color: COLORS.dark },
    { x: 8, y: 6, color: COLORS.dark },
    { x: 9, y: 6, color: COLORS.dark },
    { x: 10, y: 6, color: COLORS.dark },
    { x: 3, y: 7, color: COLORS.dark },
    { x: 4, y: 7, color: COLORS.cream },
    { x: 5, y: 7, color: COLORS.cream },
    { x: 6, y: 7, color: COLORS.cream },
    { x: 7, y: 7, color: COLORS.cream },
    { x: 8, y: 7, color: COLORS.cream },
    { x: 9, y: 7, color: COLORS.cream },
    { x: 10, y: 7, color: COLORS.cream },
    { x: 11, y: 7, color: COLORS.dark },
    { x: 3, y: 8, color: COLORS.dark },
    { x: 4, y: 8, color: COLORS.cream },
    { x: 5, y: 8, color: COLORS.orange },
    { x: 6, y: 8, color: COLORS.cream },
    { x: 7, y: 8, color: COLORS.orange },
    { x: 8, y: 8, color: COLORS.cream },
    { x: 9, y: 8, color: COLORS.orange },
    { x: 10, y: 8, color: COLORS.cream },
    { x: 11, y: 8, color: COLORS.dark },
    { x: 3, y: 9, color: COLORS.dark },
    { x: 4, y: 9, color: COLORS.cream },
    { x: 5, y: 9, color: COLORS.cream },
    { x: 6, y: 9, color: COLORS.cream },
    { x: 7, y: 9, color: COLORS.cream },
    { x: 8, y: 9, color: COLORS.cream },
    { x: 9, y: 9, color: COLORS.cream },
    { x: 10, y: 9, color: COLORS.cream },
    { x: 11, y: 9, color: COLORS.dark },
    { x: 4, y: 10, color: COLORS.dark },
    { x: 5, y: 10, color: COLORS.dark },
    { x: 6, y: 10, color: COLORS.dark },
    { x: 7, y: 10, color: COLORS.dark },
    { x: 8, y: 10, color: COLORS.dark },
    { x: 9, y: 10, color: COLORS.dark },
    { x: 10, y: 10, color: COLORS.dark },
    // Triangular pointer
    { x: 2, y: 9, color: COLORS.dark },
    { x: 1, y: 10, color: COLORS.dark },
    { x: 2, y: 10, color: COLORS.cream },
    { x: 3, y: 10, color: COLORS.dark },
    { x: 0, y: 11, color: COLORS.dark },
    { x: 1, y: 11, color: COLORS.cream },
    { x: 2, y: 11, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.0} viewBox="0 0 56 52" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// FINAL I: Smooth rounded bubble, no tail (ultra clean)
export function PixelLogoFinalI({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // CHEF HAT - V1 rounder hat
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 8, y: 0, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 9, y: 1, color: COLORS.hatWhite },
    { x: 3, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatWhite },
    { x: 10, y: 2, color: COLORS.hatWhite },
    { x: 11, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 3, color: COLORS.hatWhite },
    { x: 5, y: 3, color: COLORS.hatShadow },
    { x: 6, y: 3, color: COLORS.hatWhite },
    { x: 7, y: 3, color: COLORS.hatShadow },
    { x: 8, y: 3, color: COLORS.hatWhite },
    { x: 9, y: 3, color: COLORS.hatShadow },
    { x: 10, y: 3, color: COLORS.hatWhite },
    { x: 4, y: 4, color: COLORS.hatWhite },
    { x: 5, y: 4, color: COLORS.hatShadow },
    { x: 6, y: 4, color: COLORS.hatWhite },
    { x: 7, y: 4, color: COLORS.hatShadow },
    { x: 8, y: 4, color: COLORS.hatWhite },
    { x: 9, y: 4, color: COLORS.hatShadow },
    { x: 10, y: 4, color: COLORS.hatWhite },
    { x: 4, y: 5, color: COLORS.dark },
    { x: 5, y: 5, color: COLORS.dark },
    { x: 6, y: 5, color: COLORS.dark },
    { x: 7, y: 5, color: COLORS.dark },
    { x: 8, y: 5, color: COLORS.dark },
    { x: 9, y: 5, color: COLORS.dark },
    { x: 10, y: 5, color: COLORS.dark },

    // ULTRA CLEAN rounded bubble (no tail)
    { x: 5, y: 6, color: COLORS.dark },
    { x: 6, y: 6, color: COLORS.dark },
    { x: 7, y: 6, color: COLORS.dark },
    { x: 8, y: 6, color: COLORS.dark },
    { x: 9, y: 6, color: COLORS.dark },
    { x: 4, y: 7, color: COLORS.dark },
    { x: 5, y: 7, color: COLORS.cream },
    { x: 6, y: 7, color: COLORS.cream },
    { x: 7, y: 7, color: COLORS.cream },
    { x: 8, y: 7, color: COLORS.cream },
    { x: 9, y: 7, color: COLORS.cream },
    { x: 10, y: 7, color: COLORS.dark },
    { x: 3, y: 8, color: COLORS.dark },
    { x: 4, y: 8, color: COLORS.cream },
    { x: 5, y: 8, color: COLORS.orange },
    { x: 6, y: 8, color: COLORS.cream },
    { x: 7, y: 8, color: COLORS.orange },
    { x: 8, y: 8, color: COLORS.cream },
    { x: 9, y: 8, color: COLORS.orange },
    { x: 10, y: 8, color: COLORS.cream },
    { x: 11, y: 8, color: COLORS.dark },
    { x: 3, y: 9, color: COLORS.dark },
    { x: 4, y: 9, color: COLORS.cream },
    { x: 5, y: 9, color: COLORS.cream },
    { x: 6, y: 9, color: COLORS.cream },
    { x: 7, y: 9, color: COLORS.cream },
    { x: 8, y: 9, color: COLORS.cream },
    { x: 9, y: 9, color: COLORS.cream },
    { x: 10, y: 9, color: COLORS.cream },
    { x: 11, y: 9, color: COLORS.dark },
    { x: 4, y: 10, color: COLORS.dark },
    { x: 5, y: 10, color: COLORS.cream },
    { x: 6, y: 10, color: COLORS.cream },
    { x: 7, y: 10, color: COLORS.cream },
    { x: 8, y: 10, color: COLORS.cream },
    { x: 9, y: 10, color: COLORS.cream },
    { x: 10, y: 10, color: COLORS.dark },
    { x: 5, y: 11, color: COLORS.dark },
    { x: 6, y: 11, color: COLORS.dark },
    { x: 7, y: 11, color: COLORS.dark },
    { x: 8, y: 11, color: COLORS.dark },
    { x: 9, y: 11, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.0} viewBox="0 0 56 52" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// FINAL J: Modern rounded corners with small left tail
export function PixelLogoFinalJ({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // CHEF HAT - V1 rounder hat
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 8, y: 0, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 9, y: 1, color: COLORS.hatWhite },
    { x: 3, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatWhite },
    { x: 10, y: 2, color: COLORS.hatWhite },
    { x: 11, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 3, color: COLORS.hatWhite },
    { x: 5, y: 3, color: COLORS.hatShadow },
    { x: 6, y: 3, color: COLORS.hatWhite },
    { x: 7, y: 3, color: COLORS.hatShadow },
    { x: 8, y: 3, color: COLORS.hatWhite },
    { x: 9, y: 3, color: COLORS.hatShadow },
    { x: 10, y: 3, color: COLORS.hatWhite },
    { x: 4, y: 4, color: COLORS.hatWhite },
    { x: 5, y: 4, color: COLORS.hatShadow },
    { x: 6, y: 4, color: COLORS.hatWhite },
    { x: 7, y: 4, color: COLORS.hatShadow },
    { x: 8, y: 4, color: COLORS.hatWhite },
    { x: 9, y: 4, color: COLORS.hatShadow },
    { x: 10, y: 4, color: COLORS.hatWhite },
    { x: 4, y: 5, color: COLORS.dark },
    { x: 5, y: 5, color: COLORS.dark },
    { x: 6, y: 5, color: COLORS.dark },
    { x: 7, y: 5, color: COLORS.dark },
    { x: 8, y: 5, color: COLORS.dark },
    { x: 9, y: 5, color: COLORS.dark },
    { x: 10, y: 5, color: COLORS.dark },

    // MODERN BUBBLE with soft rounded corners
    { x: 5, y: 6, color: COLORS.dark },
    { x: 6, y: 6, color: COLORS.dark },
    { x: 7, y: 6, color: COLORS.dark },
    { x: 8, y: 6, color: COLORS.dark },
    { x: 9, y: 6, color: COLORS.dark },
    { x: 4, y: 7, color: COLORS.dark },
    { x: 5, y: 7, color: COLORS.cream },
    { x: 6, y: 7, color: COLORS.cream },
    { x: 7, y: 7, color: COLORS.cream },
    { x: 8, y: 7, color: COLORS.cream },
    { x: 9, y: 7, color: COLORS.cream },
    { x: 10, y: 7, color: COLORS.dark },
    { x: 3, y: 8, color: COLORS.dark },
    { x: 4, y: 8, color: COLORS.cream },
    { x: 5, y: 8, color: COLORS.orange },
    { x: 6, y: 8, color: COLORS.cream },
    { x: 7, y: 8, color: COLORS.orange },
    { x: 8, y: 8, color: COLORS.cream },
    { x: 9, y: 8, color: COLORS.orange },
    { x: 10, y: 8, color: COLORS.cream },
    { x: 11, y: 8, color: COLORS.dark },
    { x: 3, y: 9, color: COLORS.dark },
    { x: 4, y: 9, color: COLORS.cream },
    { x: 5, y: 9, color: COLORS.cream },
    { x: 6, y: 9, color: COLORS.cream },
    { x: 7, y: 9, color: COLORS.cream },
    { x: 8, y: 9, color: COLORS.cream },
    { x: 9, y: 9, color: COLORS.cream },
    { x: 10, y: 9, color: COLORS.cream },
    { x: 11, y: 9, color: COLORS.dark },
    { x: 4, y: 10, color: COLORS.dark },
    { x: 5, y: 10, color: COLORS.cream },
    { x: 6, y: 10, color: COLORS.cream },
    { x: 7, y: 10, color: COLORS.cream },
    { x: 8, y: 10, color: COLORS.cream },
    { x: 9, y: 10, color: COLORS.cream },
    { x: 10, y: 10, color: COLORS.dark },
    { x: 5, y: 11, color: COLORS.dark },
    { x: 6, y: 11, color: COLORS.dark },
    { x: 7, y: 11, color: COLORS.dark },
    { x: 8, y: 11, color: COLORS.dark },
    { x: 9, y: 11, color: COLORS.dark },
    // Small left notch tail
    { x: 3, y: 10, color: COLORS.dark },
    { x: 2, y: 11, color: COLORS.dark },
    { x: 3, y: 11, color: COLORS.cream },
    { x: 4, y: 11, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.0} viewBox="0 0 56 52" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TALLER CHEF HAT VARIATIONS (Hat1-Hat10)
// Same Final H bubble (triangular pointer), taller hats for clearer recognition
// ─────────────────────────────────────────────────────────────────────────────

// HAT 1: Classic Tall Toque - 3 extra rows at top
export function PixelLogoHat1({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // CHEF HAT - Taller classic toque (9 rows)
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 8, y: 0, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 9, y: 1, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 3, color: COLORS.hatWhite },
    { x: 5, y: 3, color: COLORS.hatWhite },
    { x: 6, y: 3, color: COLORS.hatWhite },
    { x: 7, y: 3, color: COLORS.hatWhite },
    { x: 8, y: 3, color: COLORS.hatWhite },
    { x: 9, y: 3, color: COLORS.hatWhite },
    { x: 10, y: 3, color: COLORS.hatWhite },
    { x: 4, y: 4, color: COLORS.hatWhite },
    { x: 5, y: 4, color: COLORS.hatWhite },
    { x: 6, y: 4, color: COLORS.hatWhite },
    { x: 7, y: 4, color: COLORS.hatWhite },
    { x: 8, y: 4, color: COLORS.hatWhite },
    { x: 9, y: 4, color: COLORS.hatWhite },
    { x: 10, y: 4, color: COLORS.hatWhite },
    { x: 3, y: 5, color: COLORS.hatWhite },
    { x: 4, y: 5, color: COLORS.hatWhite },
    { x: 5, y: 5, color: COLORS.hatWhite },
    { x: 6, y: 5, color: COLORS.hatWhite },
    { x: 7, y: 5, color: COLORS.hatWhite },
    { x: 8, y: 5, color: COLORS.hatWhite },
    { x: 9, y: 5, color: COLORS.hatWhite },
    { x: 10, y: 5, color: COLORS.hatWhite },
    { x: 11, y: 5, color: COLORS.hatWhite },
    // Pleats
    { x: 4, y: 6, color: COLORS.hatWhite },
    { x: 5, y: 6, color: COLORS.hatShadow },
    { x: 6, y: 6, color: COLORS.hatWhite },
    { x: 7, y: 6, color: COLORS.hatShadow },
    { x: 8, y: 6, color: COLORS.hatWhite },
    { x: 9, y: 6, color: COLORS.hatShadow },
    { x: 10, y: 6, color: COLORS.hatWhite },
    { x: 4, y: 7, color: COLORS.hatWhite },
    { x: 5, y: 7, color: COLORS.hatShadow },
    { x: 6, y: 7, color: COLORS.hatWhite },
    { x: 7, y: 7, color: COLORS.hatShadow },
    { x: 8, y: 7, color: COLORS.hatWhite },
    { x: 9, y: 7, color: COLORS.hatShadow },
    { x: 10, y: 7, color: COLORS.hatWhite },
    // Band
    { x: 4, y: 8, color: COLORS.dark },
    { x: 5, y: 8, color: COLORS.dark },
    { x: 6, y: 8, color: COLORS.dark },
    { x: 7, y: 8, color: COLORS.dark },
    { x: 8, y: 8, color: COLORS.dark },
    { x: 9, y: 8, color: COLORS.dark },
    { x: 10, y: 8, color: COLORS.dark },

    // BUBBLE (shifted down +3)
    { x: 4, y: 9, color: COLORS.dark },
    { x: 5, y: 9, color: COLORS.dark },
    { x: 6, y: 9, color: COLORS.dark },
    { x: 7, y: 9, color: COLORS.dark },
    { x: 8, y: 9, color: COLORS.dark },
    { x: 9, y: 9, color: COLORS.dark },
    { x: 10, y: 9, color: COLORS.dark },
    { x: 3, y: 10, color: COLORS.dark },
    { x: 4, y: 10, color: COLORS.cream },
    { x: 5, y: 10, color: COLORS.cream },
    { x: 6, y: 10, color: COLORS.cream },
    { x: 7, y: 10, color: COLORS.cream },
    { x: 8, y: 10, color: COLORS.cream },
    { x: 9, y: 10, color: COLORS.cream },
    { x: 10, y: 10, color: COLORS.cream },
    { x: 11, y: 10, color: COLORS.dark },
    { x: 3, y: 11, color: COLORS.dark },
    { x: 4, y: 11, color: COLORS.cream },
    { x: 5, y: 11, color: COLORS.orange },
    { x: 6, y: 11, color: COLORS.cream },
    { x: 7, y: 11, color: COLORS.orange },
    { x: 8, y: 11, color: COLORS.cream },
    { x: 9, y: 11, color: COLORS.orange },
    { x: 10, y: 11, color: COLORS.cream },
    { x: 11, y: 11, color: COLORS.dark },
    { x: 3, y: 12, color: COLORS.dark },
    { x: 4, y: 12, color: COLORS.cream },
    { x: 5, y: 12, color: COLORS.cream },
    { x: 6, y: 12, color: COLORS.cream },
    { x: 7, y: 12, color: COLORS.cream },
    { x: 8, y: 12, color: COLORS.cream },
    { x: 9, y: 12, color: COLORS.cream },
    { x: 10, y: 12, color: COLORS.cream },
    { x: 11, y: 12, color: COLORS.dark },
    { x: 4, y: 13, color: COLORS.dark },
    { x: 5, y: 13, color: COLORS.dark },
    { x: 6, y: 13, color: COLORS.dark },
    { x: 7, y: 13, color: COLORS.dark },
    { x: 8, y: 13, color: COLORS.dark },
    { x: 9, y: 13, color: COLORS.dark },
    { x: 10, y: 13, color: COLORS.dark },
    // Triangular pointer (shifted +3)
    { x: 2, y: 12, color: COLORS.dark },
    { x: 1, y: 13, color: COLORS.dark },
    { x: 2, y: 13, color: COLORS.cream },
    { x: 3, y: 13, color: COLORS.dark },
    { x: 0, y: 14, color: COLORS.dark },
    { x: 1, y: 14, color: COLORS.cream },
    { x: 2, y: 14, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.2} viewBox="0 0 56 64" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// HAT 2: Extra Tall Cylinder - Very tall narrow toque
export function PixelLogoHat2({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // CHEF HAT - Extra tall cylinder (11 rows)
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 8, y: 0, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 9, y: 1, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 3, color: COLORS.hatWhite },
    { x: 6, y: 3, color: COLORS.hatWhite },
    { x: 7, y: 3, color: COLORS.hatWhite },
    { x: 8, y: 3, color: COLORS.hatWhite },
    { x: 9, y: 3, color: COLORS.hatWhite },
    { x: 5, y: 4, color: COLORS.hatWhite },
    { x: 6, y: 4, color: COLORS.hatWhite },
    { x: 7, y: 4, color: COLORS.hatWhite },
    { x: 8, y: 4, color: COLORS.hatWhite },
    { x: 9, y: 4, color: COLORS.hatWhite },
    { x: 5, y: 5, color: COLORS.hatWhite },
    { x: 6, y: 5, color: COLORS.hatWhite },
    { x: 7, y: 5, color: COLORS.hatWhite },
    { x: 8, y: 5, color: COLORS.hatWhite },
    { x: 9, y: 5, color: COLORS.hatWhite },
    { x: 4, y: 6, color: COLORS.hatWhite },
    { x: 5, y: 6, color: COLORS.hatWhite },
    { x: 6, y: 6, color: COLORS.hatWhite },
    { x: 7, y: 6, color: COLORS.hatWhite },
    { x: 8, y: 6, color: COLORS.hatWhite },
    { x: 9, y: 6, color: COLORS.hatWhite },
    { x: 10, y: 6, color: COLORS.hatWhite },
    { x: 4, y: 7, color: COLORS.hatWhite },
    { x: 5, y: 7, color: COLORS.hatWhite },
    { x: 6, y: 7, color: COLORS.hatWhite },
    { x: 7, y: 7, color: COLORS.hatWhite },
    { x: 8, y: 7, color: COLORS.hatWhite },
    { x: 9, y: 7, color: COLORS.hatWhite },
    { x: 10, y: 7, color: COLORS.hatWhite },
    // Wider bottom
    { x: 3, y: 8, color: COLORS.hatWhite },
    { x: 4, y: 8, color: COLORS.hatWhite },
    { x: 5, y: 8, color: COLORS.hatWhite },
    { x: 6, y: 8, color: COLORS.hatWhite },
    { x: 7, y: 8, color: COLORS.hatWhite },
    { x: 8, y: 8, color: COLORS.hatWhite },
    { x: 9, y: 8, color: COLORS.hatWhite },
    { x: 10, y: 8, color: COLORS.hatWhite },
    { x: 11, y: 8, color: COLORS.hatWhite },
    // Pleats
    { x: 4, y: 9, color: COLORS.hatWhite },
    { x: 5, y: 9, color: COLORS.hatShadow },
    { x: 6, y: 9, color: COLORS.hatWhite },
    { x: 7, y: 9, color: COLORS.hatShadow },
    { x: 8, y: 9, color: COLORS.hatWhite },
    { x: 9, y: 9, color: COLORS.hatShadow },
    { x: 10, y: 9, color: COLORS.hatWhite },
    // Band
    { x: 4, y: 10, color: COLORS.dark },
    { x: 5, y: 10, color: COLORS.dark },
    { x: 6, y: 10, color: COLORS.dark },
    { x: 7, y: 10, color: COLORS.dark },
    { x: 8, y: 10, color: COLORS.dark },
    { x: 9, y: 10, color: COLORS.dark },
    { x: 10, y: 10, color: COLORS.dark },

    // BUBBLE (shifted down +5)
    { x: 4, y: 11, color: COLORS.dark },
    { x: 5, y: 11, color: COLORS.dark },
    { x: 6, y: 11, color: COLORS.dark },
    { x: 7, y: 11, color: COLORS.dark },
    { x: 8, y: 11, color: COLORS.dark },
    { x: 9, y: 11, color: COLORS.dark },
    { x: 10, y: 11, color: COLORS.dark },
    { x: 3, y: 12, color: COLORS.dark },
    { x: 4, y: 12, color: COLORS.cream },
    { x: 5, y: 12, color: COLORS.cream },
    { x: 6, y: 12, color: COLORS.cream },
    { x: 7, y: 12, color: COLORS.cream },
    { x: 8, y: 12, color: COLORS.cream },
    { x: 9, y: 12, color: COLORS.cream },
    { x: 10, y: 12, color: COLORS.cream },
    { x: 11, y: 12, color: COLORS.dark },
    { x: 3, y: 13, color: COLORS.dark },
    { x: 4, y: 13, color: COLORS.cream },
    { x: 5, y: 13, color: COLORS.orange },
    { x: 6, y: 13, color: COLORS.cream },
    { x: 7, y: 13, color: COLORS.orange },
    { x: 8, y: 13, color: COLORS.cream },
    { x: 9, y: 13, color: COLORS.orange },
    { x: 10, y: 13, color: COLORS.cream },
    { x: 11, y: 13, color: COLORS.dark },
    { x: 3, y: 14, color: COLORS.dark },
    { x: 4, y: 14, color: COLORS.cream },
    { x: 5, y: 14, color: COLORS.cream },
    { x: 6, y: 14, color: COLORS.cream },
    { x: 7, y: 14, color: COLORS.cream },
    { x: 8, y: 14, color: COLORS.cream },
    { x: 9, y: 14, color: COLORS.cream },
    { x: 10, y: 14, color: COLORS.cream },
    { x: 11, y: 14, color: COLORS.dark },
    { x: 4, y: 15, color: COLORS.dark },
    { x: 5, y: 15, color: COLORS.dark },
    { x: 6, y: 15, color: COLORS.dark },
    { x: 7, y: 15, color: COLORS.dark },
    { x: 8, y: 15, color: COLORS.dark },
    { x: 9, y: 15, color: COLORS.dark },
    { x: 10, y: 15, color: COLORS.dark },
    // Triangular pointer
    { x: 2, y: 14, color: COLORS.dark },
    { x: 1, y: 15, color: COLORS.dark },
    { x: 2, y: 15, color: COLORS.cream },
    { x: 3, y: 15, color: COLORS.dark },
    { x: 0, y: 16, color: COLORS.dark },
    { x: 1, y: 16, color: COLORS.cream },
    { x: 2, y: 16, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.35} viewBox="0 0 56 72" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// HAT 3: Poofy Top - Taller with rounded puffy top
export function PixelLogoHat3({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // CHEF HAT - Poofy top (10 rows)
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 3, color: COLORS.hatWhite },
    { x: 5, y: 3, color: COLORS.hatWhite },
    { x: 6, y: 3, color: COLORS.hatWhite },
    { x: 7, y: 3, color: COLORS.hatWhite },
    { x: 8, y: 3, color: COLORS.hatWhite },
    { x: 9, y: 3, color: COLORS.hatWhite },
    { x: 10, y: 3, color: COLORS.hatWhite },
    { x: 4, y: 4, color: COLORS.hatWhite },
    { x: 5, y: 4, color: COLORS.hatWhite },
    { x: 6, y: 4, color: COLORS.hatWhite },
    { x: 7, y: 4, color: COLORS.hatWhite },
    { x: 8, y: 4, color: COLORS.hatWhite },
    { x: 9, y: 4, color: COLORS.hatWhite },
    { x: 10, y: 4, color: COLORS.hatWhite },
    { x: 3, y: 5, color: COLORS.hatWhite },
    { x: 4, y: 5, color: COLORS.hatWhite },
    { x: 5, y: 5, color: COLORS.hatWhite },
    { x: 6, y: 5, color: COLORS.hatWhite },
    { x: 7, y: 5, color: COLORS.hatWhite },
    { x: 8, y: 5, color: COLORS.hatWhite },
    { x: 9, y: 5, color: COLORS.hatWhite },
    { x: 10, y: 5, color: COLORS.hatWhite },
    { x: 11, y: 5, color: COLORS.hatWhite },
    { x: 3, y: 6, color: COLORS.hatWhite },
    { x: 4, y: 6, color: COLORS.hatWhite },
    { x: 5, y: 6, color: COLORS.hatWhite },
    { x: 6, y: 6, color: COLORS.hatWhite },
    { x: 7, y: 6, color: COLORS.hatWhite },
    { x: 8, y: 6, color: COLORS.hatWhite },
    { x: 9, y: 6, color: COLORS.hatWhite },
    { x: 10, y: 6, color: COLORS.hatWhite },
    { x: 11, y: 6, color: COLORS.hatWhite },
    // Pleats
    { x: 4, y: 7, color: COLORS.hatWhite },
    { x: 5, y: 7, color: COLORS.hatShadow },
    { x: 6, y: 7, color: COLORS.hatWhite },
    { x: 7, y: 7, color: COLORS.hatShadow },
    { x: 8, y: 7, color: COLORS.hatWhite },
    { x: 9, y: 7, color: COLORS.hatShadow },
    { x: 10, y: 7, color: COLORS.hatWhite },
    { x: 4, y: 8, color: COLORS.hatWhite },
    { x: 5, y: 8, color: COLORS.hatShadow },
    { x: 6, y: 8, color: COLORS.hatWhite },
    { x: 7, y: 8, color: COLORS.hatShadow },
    { x: 8, y: 8, color: COLORS.hatWhite },
    { x: 9, y: 8, color: COLORS.hatShadow },
    { x: 10, y: 8, color: COLORS.hatWhite },
    // Band
    { x: 4, y: 9, color: COLORS.dark },
    { x: 5, y: 9, color: COLORS.dark },
    { x: 6, y: 9, color: COLORS.dark },
    { x: 7, y: 9, color: COLORS.dark },
    { x: 8, y: 9, color: COLORS.dark },
    { x: 9, y: 9, color: COLORS.dark },
    { x: 10, y: 9, color: COLORS.dark },

    // BUBBLE (shifted down +4)
    { x: 4, y: 10, color: COLORS.dark },
    { x: 5, y: 10, color: COLORS.dark },
    { x: 6, y: 10, color: COLORS.dark },
    { x: 7, y: 10, color: COLORS.dark },
    { x: 8, y: 10, color: COLORS.dark },
    { x: 9, y: 10, color: COLORS.dark },
    { x: 10, y: 10, color: COLORS.dark },
    { x: 3, y: 11, color: COLORS.dark },
    { x: 4, y: 11, color: COLORS.cream },
    { x: 5, y: 11, color: COLORS.cream },
    { x: 6, y: 11, color: COLORS.cream },
    { x: 7, y: 11, color: COLORS.cream },
    { x: 8, y: 11, color: COLORS.cream },
    { x: 9, y: 11, color: COLORS.cream },
    { x: 10, y: 11, color: COLORS.cream },
    { x: 11, y: 11, color: COLORS.dark },
    { x: 3, y: 12, color: COLORS.dark },
    { x: 4, y: 12, color: COLORS.cream },
    { x: 5, y: 12, color: COLORS.orange },
    { x: 6, y: 12, color: COLORS.cream },
    { x: 7, y: 12, color: COLORS.orange },
    { x: 8, y: 12, color: COLORS.cream },
    { x: 9, y: 12, color: COLORS.orange },
    { x: 10, y: 12, color: COLORS.cream },
    { x: 11, y: 12, color: COLORS.dark },
    { x: 3, y: 13, color: COLORS.dark },
    { x: 4, y: 13, color: COLORS.cream },
    { x: 5, y: 13, color: COLORS.cream },
    { x: 6, y: 13, color: COLORS.cream },
    { x: 7, y: 13, color: COLORS.cream },
    { x: 8, y: 13, color: COLORS.cream },
    { x: 9, y: 13, color: COLORS.cream },
    { x: 10, y: 13, color: COLORS.cream },
    { x: 11, y: 13, color: COLORS.dark },
    { x: 4, y: 14, color: COLORS.dark },
    { x: 5, y: 14, color: COLORS.dark },
    { x: 6, y: 14, color: COLORS.dark },
    { x: 7, y: 14, color: COLORS.dark },
    { x: 8, y: 14, color: COLORS.dark },
    { x: 9, y: 14, color: COLORS.dark },
    { x: 10, y: 14, color: COLORS.dark },
    // Triangular pointer
    { x: 2, y: 13, color: COLORS.dark },
    { x: 1, y: 14, color: COLORS.dark },
    { x: 2, y: 14, color: COLORS.cream },
    { x: 3, y: 14, color: COLORS.dark },
    { x: 0, y: 15, color: COLORS.dark },
    { x: 1, y: 15, color: COLORS.cream },
    { x: 2, y: 15, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.28} viewBox="0 0 56 68" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// HAT 4: Traditional Pleated - More visible pleats, taller
export function PixelLogoHat4({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // CHEF HAT - Traditional pleated (9 rows)
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 8, y: 0, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 9, y: 1, color: COLORS.hatWhite },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatWhite },
    { x: 10, y: 2, color: COLORS.hatWhite },
    { x: 3, y: 3, color: COLORS.hatWhite },
    { x: 4, y: 3, color: COLORS.hatWhite },
    { x: 5, y: 3, color: COLORS.hatWhite },
    { x: 6, y: 3, color: COLORS.hatWhite },
    { x: 7, y: 3, color: COLORS.hatWhite },
    { x: 8, y: 3, color: COLORS.hatWhite },
    { x: 9, y: 3, color: COLORS.hatWhite },
    { x: 10, y: 3, color: COLORS.hatWhite },
    { x: 11, y: 3, color: COLORS.hatWhite },
    // More pronounced pleats (4 rows)
    { x: 3, y: 4, color: COLORS.hatWhite },
    { x: 4, y: 4, color: COLORS.hatShadow },
    { x: 5, y: 4, color: COLORS.hatWhite },
    { x: 6, y: 4, color: COLORS.hatShadow },
    { x: 7, y: 4, color: COLORS.hatWhite },
    { x: 8, y: 4, color: COLORS.hatShadow },
    { x: 9, y: 4, color: COLORS.hatWhite },
    { x: 10, y: 4, color: COLORS.hatShadow },
    { x: 11, y: 4, color: COLORS.hatWhite },
    { x: 3, y: 5, color: COLORS.hatWhite },
    { x: 4, y: 5, color: COLORS.hatShadow },
    { x: 5, y: 5, color: COLORS.hatWhite },
    { x: 6, y: 5, color: COLORS.hatShadow },
    { x: 7, y: 5, color: COLORS.hatWhite },
    { x: 8, y: 5, color: COLORS.hatShadow },
    { x: 9, y: 5, color: COLORS.hatWhite },
    { x: 10, y: 5, color: COLORS.hatShadow },
    { x: 11, y: 5, color: COLORS.hatWhite },
    { x: 4, y: 6, color: COLORS.hatWhite },
    { x: 5, y: 6, color: COLORS.hatShadow },
    { x: 6, y: 6, color: COLORS.hatWhite },
    { x: 7, y: 6, color: COLORS.hatShadow },
    { x: 8, y: 6, color: COLORS.hatWhite },
    { x: 9, y: 6, color: COLORS.hatShadow },
    { x: 10, y: 6, color: COLORS.hatWhite },
    { x: 4, y: 7, color: COLORS.hatWhite },
    { x: 5, y: 7, color: COLORS.hatShadow },
    { x: 6, y: 7, color: COLORS.hatWhite },
    { x: 7, y: 7, color: COLORS.hatShadow },
    { x: 8, y: 7, color: COLORS.hatWhite },
    { x: 9, y: 7, color: COLORS.hatShadow },
    { x: 10, y: 7, color: COLORS.hatWhite },
    // Band
    { x: 4, y: 8, color: COLORS.dark },
    { x: 5, y: 8, color: COLORS.dark },
    { x: 6, y: 8, color: COLORS.dark },
    { x: 7, y: 8, color: COLORS.dark },
    { x: 8, y: 8, color: COLORS.dark },
    { x: 9, y: 8, color: COLORS.dark },
    { x: 10, y: 8, color: COLORS.dark },

    // BUBBLE (shifted down +3)
    { x: 4, y: 9, color: COLORS.dark },
    { x: 5, y: 9, color: COLORS.dark },
    { x: 6, y: 9, color: COLORS.dark },
    { x: 7, y: 9, color: COLORS.dark },
    { x: 8, y: 9, color: COLORS.dark },
    { x: 9, y: 9, color: COLORS.dark },
    { x: 10, y: 9, color: COLORS.dark },
    { x: 3, y: 10, color: COLORS.dark },
    { x: 4, y: 10, color: COLORS.cream },
    { x: 5, y: 10, color: COLORS.cream },
    { x: 6, y: 10, color: COLORS.cream },
    { x: 7, y: 10, color: COLORS.cream },
    { x: 8, y: 10, color: COLORS.cream },
    { x: 9, y: 10, color: COLORS.cream },
    { x: 10, y: 10, color: COLORS.cream },
    { x: 11, y: 10, color: COLORS.dark },
    { x: 3, y: 11, color: COLORS.dark },
    { x: 4, y: 11, color: COLORS.cream },
    { x: 5, y: 11, color: COLORS.orange },
    { x: 6, y: 11, color: COLORS.cream },
    { x: 7, y: 11, color: COLORS.orange },
    { x: 8, y: 11, color: COLORS.cream },
    { x: 9, y: 11, color: COLORS.orange },
    { x: 10, y: 11, color: COLORS.cream },
    { x: 11, y: 11, color: COLORS.dark },
    { x: 3, y: 12, color: COLORS.dark },
    { x: 4, y: 12, color: COLORS.cream },
    { x: 5, y: 12, color: COLORS.cream },
    { x: 6, y: 12, color: COLORS.cream },
    { x: 7, y: 12, color: COLORS.cream },
    { x: 8, y: 12, color: COLORS.cream },
    { x: 9, y: 12, color: COLORS.cream },
    { x: 10, y: 12, color: COLORS.cream },
    { x: 11, y: 12, color: COLORS.dark },
    { x: 4, y: 13, color: COLORS.dark },
    { x: 5, y: 13, color: COLORS.dark },
    { x: 6, y: 13, color: COLORS.dark },
    { x: 7, y: 13, color: COLORS.dark },
    { x: 8, y: 13, color: COLORS.dark },
    { x: 9, y: 13, color: COLORS.dark },
    { x: 10, y: 13, color: COLORS.dark },
    // Triangular pointer
    { x: 2, y: 12, color: COLORS.dark },
    { x: 1, y: 13, color: COLORS.dark },
    { x: 2, y: 13, color: COLORS.cream },
    { x: 3, y: 13, color: COLORS.dark },
    { x: 0, y: 14, color: COLORS.dark },
    { x: 1, y: 14, color: COLORS.cream },
    { x: 2, y: 14, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.2} viewBox="0 0 56 64" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// HAT 5: Mushroom Top - Wide puffy top, narrow stem
export function PixelLogoHat5({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // CHEF HAT - Mushroom shape (wide top)
    { x: 5, y: 0, color: COLORS.hatWhite },
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 8, y: 0, color: COLORS.hatWhite },
    { x: 9, y: 0, color: COLORS.hatWhite },
    { x: 4, y: 1, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 9, y: 1, color: COLORS.hatWhite },
    { x: 10, y: 1, color: COLORS.hatWhite },
    { x: 3, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatWhite },
    { x: 10, y: 2, color: COLORS.hatWhite },
    { x: 11, y: 2, color: COLORS.hatWhite },
    { x: 2, y: 3, color: COLORS.hatWhite },
    { x: 3, y: 3, color: COLORS.hatWhite },
    { x: 4, y: 3, color: COLORS.hatWhite },
    { x: 5, y: 3, color: COLORS.hatWhite },
    { x: 6, y: 3, color: COLORS.hatWhite },
    { x: 7, y: 3, color: COLORS.hatWhite },
    { x: 8, y: 3, color: COLORS.hatWhite },
    { x: 9, y: 3, color: COLORS.hatWhite },
    { x: 10, y: 3, color: COLORS.hatWhite },
    { x: 11, y: 3, color: COLORS.hatWhite },
    { x: 12, y: 3, color: COLORS.hatWhite },
    { x: 2, y: 4, color: COLORS.hatWhite },
    { x: 3, y: 4, color: COLORS.hatWhite },
    { x: 4, y: 4, color: COLORS.hatWhite },
    { x: 5, y: 4, color: COLORS.hatWhite },
    { x: 6, y: 4, color: COLORS.hatWhite },
    { x: 7, y: 4, color: COLORS.hatWhite },
    { x: 8, y: 4, color: COLORS.hatWhite },
    { x: 9, y: 4, color: COLORS.hatWhite },
    { x: 10, y: 4, color: COLORS.hatWhite },
    { x: 11, y: 4, color: COLORS.hatWhite },
    { x: 12, y: 4, color: COLORS.hatWhite },
    // Narrow stem with pleats
    { x: 4, y: 5, color: COLORS.hatWhite },
    { x: 5, y: 5, color: COLORS.hatShadow },
    { x: 6, y: 5, color: COLORS.hatWhite },
    { x: 7, y: 5, color: COLORS.hatShadow },
    { x: 8, y: 5, color: COLORS.hatWhite },
    { x: 9, y: 5, color: COLORS.hatShadow },
    { x: 10, y: 5, color: COLORS.hatWhite },
    { x: 4, y: 6, color: COLORS.hatWhite },
    { x: 5, y: 6, color: COLORS.hatShadow },
    { x: 6, y: 6, color: COLORS.hatWhite },
    { x: 7, y: 6, color: COLORS.hatShadow },
    { x: 8, y: 6, color: COLORS.hatWhite },
    { x: 9, y: 6, color: COLORS.hatShadow },
    { x: 10, y: 6, color: COLORS.hatWhite },
    { x: 4, y: 7, color: COLORS.hatWhite },
    { x: 5, y: 7, color: COLORS.hatShadow },
    { x: 6, y: 7, color: COLORS.hatWhite },
    { x: 7, y: 7, color: COLORS.hatShadow },
    { x: 8, y: 7, color: COLORS.hatWhite },
    { x: 9, y: 7, color: COLORS.hatShadow },
    { x: 10, y: 7, color: COLORS.hatWhite },
    // Band
    { x: 4, y: 8, color: COLORS.dark },
    { x: 5, y: 8, color: COLORS.dark },
    { x: 6, y: 8, color: COLORS.dark },
    { x: 7, y: 8, color: COLORS.dark },
    { x: 8, y: 8, color: COLORS.dark },
    { x: 9, y: 8, color: COLORS.dark },
    { x: 10, y: 8, color: COLORS.dark },

    // BUBBLE (shifted down +3)
    { x: 4, y: 9, color: COLORS.dark },
    { x: 5, y: 9, color: COLORS.dark },
    { x: 6, y: 9, color: COLORS.dark },
    { x: 7, y: 9, color: COLORS.dark },
    { x: 8, y: 9, color: COLORS.dark },
    { x: 9, y: 9, color: COLORS.dark },
    { x: 10, y: 9, color: COLORS.dark },
    { x: 3, y: 10, color: COLORS.dark },
    { x: 4, y: 10, color: COLORS.cream },
    { x: 5, y: 10, color: COLORS.cream },
    { x: 6, y: 10, color: COLORS.cream },
    { x: 7, y: 10, color: COLORS.cream },
    { x: 8, y: 10, color: COLORS.cream },
    { x: 9, y: 10, color: COLORS.cream },
    { x: 10, y: 10, color: COLORS.cream },
    { x: 11, y: 10, color: COLORS.dark },
    { x: 3, y: 11, color: COLORS.dark },
    { x: 4, y: 11, color: COLORS.cream },
    { x: 5, y: 11, color: COLORS.orange },
    { x: 6, y: 11, color: COLORS.cream },
    { x: 7, y: 11, color: COLORS.orange },
    { x: 8, y: 11, color: COLORS.cream },
    { x: 9, y: 11, color: COLORS.orange },
    { x: 10, y: 11, color: COLORS.cream },
    { x: 11, y: 11, color: COLORS.dark },
    { x: 3, y: 12, color: COLORS.dark },
    { x: 4, y: 12, color: COLORS.cream },
    { x: 5, y: 12, color: COLORS.cream },
    { x: 6, y: 12, color: COLORS.cream },
    { x: 7, y: 12, color: COLORS.cream },
    { x: 8, y: 12, color: COLORS.cream },
    { x: 9, y: 12, color: COLORS.cream },
    { x: 10, y: 12, color: COLORS.cream },
    { x: 11, y: 12, color: COLORS.dark },
    { x: 4, y: 13, color: COLORS.dark },
    { x: 5, y: 13, color: COLORS.dark },
    { x: 6, y: 13, color: COLORS.dark },
    { x: 7, y: 13, color: COLORS.dark },
    { x: 8, y: 13, color: COLORS.dark },
    { x: 9, y: 13, color: COLORS.dark },
    { x: 10, y: 13, color: COLORS.dark },
    // Triangular pointer
    { x: 2, y: 12, color: COLORS.dark },
    { x: 1, y: 13, color: COLORS.dark },
    { x: 2, y: 13, color: COLORS.cream },
    { x: 3, y: 13, color: COLORS.dark },
    { x: 0, y: 14, color: COLORS.dark },
    { x: 1, y: 14, color: COLORS.cream },
    { x: 2, y: 14, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.2} viewBox="0 0 56 64" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// HAT 6: Double Puff - Two distinct puffs
export function PixelLogoHat6({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // CHEF HAT - Double puff (stacked)
    // Top puff
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 8, y: 0, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 9, y: 1, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatWhite },
    // Middle puff (wider)
    { x: 4, y: 3, color: COLORS.hatWhite },
    { x: 5, y: 3, color: COLORS.hatWhite },
    { x: 6, y: 3, color: COLORS.hatWhite },
    { x: 7, y: 3, color: COLORS.hatWhite },
    { x: 8, y: 3, color: COLORS.hatWhite },
    { x: 9, y: 3, color: COLORS.hatWhite },
    { x: 10, y: 3, color: COLORS.hatWhite },
    { x: 3, y: 4, color: COLORS.hatWhite },
    { x: 4, y: 4, color: COLORS.hatWhite },
    { x: 5, y: 4, color: COLORS.hatWhite },
    { x: 6, y: 4, color: COLORS.hatWhite },
    { x: 7, y: 4, color: COLORS.hatWhite },
    { x: 8, y: 4, color: COLORS.hatWhite },
    { x: 9, y: 4, color: COLORS.hatWhite },
    { x: 10, y: 4, color: COLORS.hatWhite },
    { x: 11, y: 4, color: COLORS.hatWhite },
    { x: 3, y: 5, color: COLORS.hatWhite },
    { x: 4, y: 5, color: COLORS.hatWhite },
    { x: 5, y: 5, color: COLORS.hatWhite },
    { x: 6, y: 5, color: COLORS.hatWhite },
    { x: 7, y: 5, color: COLORS.hatWhite },
    { x: 8, y: 5, color: COLORS.hatWhite },
    { x: 9, y: 5, color: COLORS.hatWhite },
    { x: 10, y: 5, color: COLORS.hatWhite },
    { x: 11, y: 5, color: COLORS.hatWhite },
    // Pleats
    { x: 4, y: 6, color: COLORS.hatWhite },
    { x: 5, y: 6, color: COLORS.hatShadow },
    { x: 6, y: 6, color: COLORS.hatWhite },
    { x: 7, y: 6, color: COLORS.hatShadow },
    { x: 8, y: 6, color: COLORS.hatWhite },
    { x: 9, y: 6, color: COLORS.hatShadow },
    { x: 10, y: 6, color: COLORS.hatWhite },
    { x: 4, y: 7, color: COLORS.hatWhite },
    { x: 5, y: 7, color: COLORS.hatShadow },
    { x: 6, y: 7, color: COLORS.hatWhite },
    { x: 7, y: 7, color: COLORS.hatShadow },
    { x: 8, y: 7, color: COLORS.hatWhite },
    { x: 9, y: 7, color: COLORS.hatShadow },
    { x: 10, y: 7, color: COLORS.hatWhite },
    // Band
    { x: 4, y: 8, color: COLORS.dark },
    { x: 5, y: 8, color: COLORS.dark },
    { x: 6, y: 8, color: COLORS.dark },
    { x: 7, y: 8, color: COLORS.dark },
    { x: 8, y: 8, color: COLORS.dark },
    { x: 9, y: 8, color: COLORS.dark },
    { x: 10, y: 8, color: COLORS.dark },

    // BUBBLE (shifted down +3)
    { x: 4, y: 9, color: COLORS.dark },
    { x: 5, y: 9, color: COLORS.dark },
    { x: 6, y: 9, color: COLORS.dark },
    { x: 7, y: 9, color: COLORS.dark },
    { x: 8, y: 9, color: COLORS.dark },
    { x: 9, y: 9, color: COLORS.dark },
    { x: 10, y: 9, color: COLORS.dark },
    { x: 3, y: 10, color: COLORS.dark },
    { x: 4, y: 10, color: COLORS.cream },
    { x: 5, y: 10, color: COLORS.cream },
    { x: 6, y: 10, color: COLORS.cream },
    { x: 7, y: 10, color: COLORS.cream },
    { x: 8, y: 10, color: COLORS.cream },
    { x: 9, y: 10, color: COLORS.cream },
    { x: 10, y: 10, color: COLORS.cream },
    { x: 11, y: 10, color: COLORS.dark },
    { x: 3, y: 11, color: COLORS.dark },
    { x: 4, y: 11, color: COLORS.cream },
    { x: 5, y: 11, color: COLORS.orange },
    { x: 6, y: 11, color: COLORS.cream },
    { x: 7, y: 11, color: COLORS.orange },
    { x: 8, y: 11, color: COLORS.cream },
    { x: 9, y: 11, color: COLORS.orange },
    { x: 10, y: 11, color: COLORS.cream },
    { x: 11, y: 11, color: COLORS.dark },
    { x: 3, y: 12, color: COLORS.dark },
    { x: 4, y: 12, color: COLORS.cream },
    { x: 5, y: 12, color: COLORS.cream },
    { x: 6, y: 12, color: COLORS.cream },
    { x: 7, y: 12, color: COLORS.cream },
    { x: 8, y: 12, color: COLORS.cream },
    { x: 9, y: 12, color: COLORS.cream },
    { x: 10, y: 12, color: COLORS.cream },
    { x: 11, y: 12, color: COLORS.dark },
    { x: 4, y: 13, color: COLORS.dark },
    { x: 5, y: 13, color: COLORS.dark },
    { x: 6, y: 13, color: COLORS.dark },
    { x: 7, y: 13, color: COLORS.dark },
    { x: 8, y: 13, color: COLORS.dark },
    { x: 9, y: 13, color: COLORS.dark },
    { x: 10, y: 13, color: COLORS.dark },
    // Triangular pointer
    { x: 2, y: 12, color: COLORS.dark },
    { x: 1, y: 13, color: COLORS.dark },
    { x: 2, y: 13, color: COLORS.cream },
    { x: 3, y: 13, color: COLORS.dark },
    { x: 0, y: 14, color: COLORS.dark },
    { x: 1, y: 14, color: COLORS.cream },
    { x: 2, y: 14, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.2} viewBox="0 0 56 64" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// HAT 7: Tall Slim - Narrow but very tall
export function PixelLogoHat7({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // CHEF HAT - Tall slim (12 rows)
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 8, y: 0, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 3, color: COLORS.hatWhite },
    { x: 6, y: 3, color: COLORS.hatWhite },
    { x: 7, y: 3, color: COLORS.hatWhite },
    { x: 8, y: 3, color: COLORS.hatWhite },
    { x: 9, y: 3, color: COLORS.hatWhite },
    { x: 5, y: 4, color: COLORS.hatWhite },
    { x: 6, y: 4, color: COLORS.hatWhite },
    { x: 7, y: 4, color: COLORS.hatWhite },
    { x: 8, y: 4, color: COLORS.hatWhite },
    { x: 9, y: 4, color: COLORS.hatWhite },
    { x: 5, y: 5, color: COLORS.hatWhite },
    { x: 6, y: 5, color: COLORS.hatWhite },
    { x: 7, y: 5, color: COLORS.hatWhite },
    { x: 8, y: 5, color: COLORS.hatWhite },
    { x: 9, y: 5, color: COLORS.hatWhite },
    { x: 5, y: 6, color: COLORS.hatWhite },
    { x: 6, y: 6, color: COLORS.hatWhite },
    { x: 7, y: 6, color: COLORS.hatWhite },
    { x: 8, y: 6, color: COLORS.hatWhite },
    { x: 9, y: 6, color: COLORS.hatWhite },
    { x: 4, y: 7, color: COLORS.hatWhite },
    { x: 5, y: 7, color: COLORS.hatWhite },
    { x: 6, y: 7, color: COLORS.hatWhite },
    { x: 7, y: 7, color: COLORS.hatWhite },
    { x: 8, y: 7, color: COLORS.hatWhite },
    { x: 9, y: 7, color: COLORS.hatWhite },
    { x: 10, y: 7, color: COLORS.hatWhite },
    { x: 3, y: 8, color: COLORS.hatWhite },
    { x: 4, y: 8, color: COLORS.hatWhite },
    { x: 5, y: 8, color: COLORS.hatWhite },
    { x: 6, y: 8, color: COLORS.hatWhite },
    { x: 7, y: 8, color: COLORS.hatWhite },
    { x: 8, y: 8, color: COLORS.hatWhite },
    { x: 9, y: 8, color: COLORS.hatWhite },
    { x: 10, y: 8, color: COLORS.hatWhite },
    { x: 11, y: 8, color: COLORS.hatWhite },
    // Pleats
    { x: 4, y: 9, color: COLORS.hatWhite },
    { x: 5, y: 9, color: COLORS.hatShadow },
    { x: 6, y: 9, color: COLORS.hatWhite },
    { x: 7, y: 9, color: COLORS.hatShadow },
    { x: 8, y: 9, color: COLORS.hatWhite },
    { x: 9, y: 9, color: COLORS.hatShadow },
    { x: 10, y: 9, color: COLORS.hatWhite },
    { x: 4, y: 10, color: COLORS.hatWhite },
    { x: 5, y: 10, color: COLORS.hatShadow },
    { x: 6, y: 10, color: COLORS.hatWhite },
    { x: 7, y: 10, color: COLORS.hatShadow },
    { x: 8, y: 10, color: COLORS.hatWhite },
    { x: 9, y: 10, color: COLORS.hatShadow },
    { x: 10, y: 10, color: COLORS.hatWhite },
    // Band
    { x: 4, y: 11, color: COLORS.dark },
    { x: 5, y: 11, color: COLORS.dark },
    { x: 6, y: 11, color: COLORS.dark },
    { x: 7, y: 11, color: COLORS.dark },
    { x: 8, y: 11, color: COLORS.dark },
    { x: 9, y: 11, color: COLORS.dark },
    { x: 10, y: 11, color: COLORS.dark },

    // BUBBLE (shifted down +6)
    { x: 4, y: 12, color: COLORS.dark },
    { x: 5, y: 12, color: COLORS.dark },
    { x: 6, y: 12, color: COLORS.dark },
    { x: 7, y: 12, color: COLORS.dark },
    { x: 8, y: 12, color: COLORS.dark },
    { x: 9, y: 12, color: COLORS.dark },
    { x: 10, y: 12, color: COLORS.dark },
    { x: 3, y: 13, color: COLORS.dark },
    { x: 4, y: 13, color: COLORS.cream },
    { x: 5, y: 13, color: COLORS.cream },
    { x: 6, y: 13, color: COLORS.cream },
    { x: 7, y: 13, color: COLORS.cream },
    { x: 8, y: 13, color: COLORS.cream },
    { x: 9, y: 13, color: COLORS.cream },
    { x: 10, y: 13, color: COLORS.cream },
    { x: 11, y: 13, color: COLORS.dark },
    { x: 3, y: 14, color: COLORS.dark },
    { x: 4, y: 14, color: COLORS.cream },
    { x: 5, y: 14, color: COLORS.orange },
    { x: 6, y: 14, color: COLORS.cream },
    { x: 7, y: 14, color: COLORS.orange },
    { x: 8, y: 14, color: COLORS.cream },
    { x: 9, y: 14, color: COLORS.orange },
    { x: 10, y: 14, color: COLORS.cream },
    { x: 11, y: 14, color: COLORS.dark },
    { x: 3, y: 15, color: COLORS.dark },
    { x: 4, y: 15, color: COLORS.cream },
    { x: 5, y: 15, color: COLORS.cream },
    { x: 6, y: 15, color: COLORS.cream },
    { x: 7, y: 15, color: COLORS.cream },
    { x: 8, y: 15, color: COLORS.cream },
    { x: 9, y: 15, color: COLORS.cream },
    { x: 10, y: 15, color: COLORS.cream },
    { x: 11, y: 15, color: COLORS.dark },
    { x: 4, y: 16, color: COLORS.dark },
    { x: 5, y: 16, color: COLORS.dark },
    { x: 6, y: 16, color: COLORS.dark },
    { x: 7, y: 16, color: COLORS.dark },
    { x: 8, y: 16, color: COLORS.dark },
    { x: 9, y: 16, color: COLORS.dark },
    { x: 10, y: 16, color: COLORS.dark },
    // Triangular pointer
    { x: 2, y: 15, color: COLORS.dark },
    { x: 1, y: 16, color: COLORS.dark },
    { x: 2, y: 16, color: COLORS.cream },
    { x: 3, y: 16, color: COLORS.dark },
    { x: 0, y: 17, color: COLORS.dark },
    { x: 1, y: 17, color: COLORS.cream },
    { x: 2, y: 17, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.45} viewBox="0 0 56 76" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// HAT 8: Rounded Dome - Very rounded top
export function PixelLogoHat8({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // CHEF HAT - Rounded dome
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 3, color: COLORS.hatWhite },
    { x: 5, y: 3, color: COLORS.hatWhite },
    { x: 6, y: 3, color: COLORS.hatWhite },
    { x: 7, y: 3, color: COLORS.hatWhite },
    { x: 8, y: 3, color: COLORS.hatWhite },
    { x: 9, y: 3, color: COLORS.hatWhite },
    { x: 10, y: 3, color: COLORS.hatWhite },
    { x: 3, y: 4, color: COLORS.hatWhite },
    { x: 4, y: 4, color: COLORS.hatWhite },
    { x: 5, y: 4, color: COLORS.hatWhite },
    { x: 6, y: 4, color: COLORS.hatWhite },
    { x: 7, y: 4, color: COLORS.hatWhite },
    { x: 8, y: 4, color: COLORS.hatWhite },
    { x: 9, y: 4, color: COLORS.hatWhite },
    { x: 10, y: 4, color: COLORS.hatWhite },
    { x: 11, y: 4, color: COLORS.hatWhite },
    { x: 3, y: 5, color: COLORS.hatWhite },
    { x: 4, y: 5, color: COLORS.hatWhite },
    { x: 5, y: 5, color: COLORS.hatWhite },
    { x: 6, y: 5, color: COLORS.hatWhite },
    { x: 7, y: 5, color: COLORS.hatWhite },
    { x: 8, y: 5, color: COLORS.hatWhite },
    { x: 9, y: 5, color: COLORS.hatWhite },
    { x: 10, y: 5, color: COLORS.hatWhite },
    { x: 11, y: 5, color: COLORS.hatWhite },
    { x: 3, y: 6, color: COLORS.hatWhite },
    { x: 4, y: 6, color: COLORS.hatWhite },
    { x: 5, y: 6, color: COLORS.hatWhite },
    { x: 6, y: 6, color: COLORS.hatWhite },
    { x: 7, y: 6, color: COLORS.hatWhite },
    { x: 8, y: 6, color: COLORS.hatWhite },
    { x: 9, y: 6, color: COLORS.hatWhite },
    { x: 10, y: 6, color: COLORS.hatWhite },
    { x: 11, y: 6, color: COLORS.hatWhite },
    // Pleats
    { x: 4, y: 7, color: COLORS.hatWhite },
    { x: 5, y: 7, color: COLORS.hatShadow },
    { x: 6, y: 7, color: COLORS.hatWhite },
    { x: 7, y: 7, color: COLORS.hatShadow },
    { x: 8, y: 7, color: COLORS.hatWhite },
    { x: 9, y: 7, color: COLORS.hatShadow },
    { x: 10, y: 7, color: COLORS.hatWhite },
    { x: 4, y: 8, color: COLORS.hatWhite },
    { x: 5, y: 8, color: COLORS.hatShadow },
    { x: 6, y: 8, color: COLORS.hatWhite },
    { x: 7, y: 8, color: COLORS.hatShadow },
    { x: 8, y: 8, color: COLORS.hatWhite },
    { x: 9, y: 8, color: COLORS.hatShadow },
    { x: 10, y: 8, color: COLORS.hatWhite },
    // Band
    { x: 4, y: 9, color: COLORS.dark },
    { x: 5, y: 9, color: COLORS.dark },
    { x: 6, y: 9, color: COLORS.dark },
    { x: 7, y: 9, color: COLORS.dark },
    { x: 8, y: 9, color: COLORS.dark },
    { x: 9, y: 9, color: COLORS.dark },
    { x: 10, y: 9, color: COLORS.dark },

    // BUBBLE (shifted down +4)
    { x: 4, y: 10, color: COLORS.dark },
    { x: 5, y: 10, color: COLORS.dark },
    { x: 6, y: 10, color: COLORS.dark },
    { x: 7, y: 10, color: COLORS.dark },
    { x: 8, y: 10, color: COLORS.dark },
    { x: 9, y: 10, color: COLORS.dark },
    { x: 10, y: 10, color: COLORS.dark },
    { x: 3, y: 11, color: COLORS.dark },
    { x: 4, y: 11, color: COLORS.cream },
    { x: 5, y: 11, color: COLORS.cream },
    { x: 6, y: 11, color: COLORS.cream },
    { x: 7, y: 11, color: COLORS.cream },
    { x: 8, y: 11, color: COLORS.cream },
    { x: 9, y: 11, color: COLORS.cream },
    { x: 10, y: 11, color: COLORS.cream },
    { x: 11, y: 11, color: COLORS.dark },
    { x: 3, y: 12, color: COLORS.dark },
    { x: 4, y: 12, color: COLORS.cream },
    { x: 5, y: 12, color: COLORS.orange },
    { x: 6, y: 12, color: COLORS.cream },
    { x: 7, y: 12, color: COLORS.orange },
    { x: 8, y: 12, color: COLORS.cream },
    { x: 9, y: 12, color: COLORS.orange },
    { x: 10, y: 12, color: COLORS.cream },
    { x: 11, y: 12, color: COLORS.dark },
    { x: 3, y: 13, color: COLORS.dark },
    { x: 4, y: 13, color: COLORS.cream },
    { x: 5, y: 13, color: COLORS.cream },
    { x: 6, y: 13, color: COLORS.cream },
    { x: 7, y: 13, color: COLORS.cream },
    { x: 8, y: 13, color: COLORS.cream },
    { x: 9, y: 13, color: COLORS.cream },
    { x: 10, y: 13, color: COLORS.cream },
    { x: 11, y: 13, color: COLORS.dark },
    { x: 4, y: 14, color: COLORS.dark },
    { x: 5, y: 14, color: COLORS.dark },
    { x: 6, y: 14, color: COLORS.dark },
    { x: 7, y: 14, color: COLORS.dark },
    { x: 8, y: 14, color: COLORS.dark },
    { x: 9, y: 14, color: COLORS.dark },
    { x: 10, y: 14, color: COLORS.dark },
    // Triangular pointer
    { x: 2, y: 13, color: COLORS.dark },
    { x: 1, y: 14, color: COLORS.dark },
    { x: 2, y: 14, color: COLORS.cream },
    { x: 3, y: 14, color: COLORS.dark },
    { x: 0, y: 15, color: COLORS.dark },
    { x: 1, y: 15, color: COLORS.cream },
    { x: 2, y: 15, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.28} viewBox="0 0 56 68" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// HAT 9: French Toque - Classic French chef style
export function PixelLogoHat9({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // CHEF HAT - French toque (tall with pronounced crown)
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 8, y: 0, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 9, y: 1, color: COLORS.hatWhite },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatWhite },
    { x: 10, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 3, color: COLORS.hatWhite },
    { x: 5, y: 3, color: COLORS.hatWhite },
    { x: 6, y: 3, color: COLORS.hatWhite },
    { x: 7, y: 3, color: COLORS.hatWhite },
    { x: 8, y: 3, color: COLORS.hatWhite },
    { x: 9, y: 3, color: COLORS.hatWhite },
    { x: 10, y: 3, color: COLORS.hatWhite },
    { x: 4, y: 4, color: COLORS.hatWhite },
    { x: 5, y: 4, color: COLORS.hatWhite },
    { x: 6, y: 4, color: COLORS.hatWhite },
    { x: 7, y: 4, color: COLORS.hatWhite },
    { x: 8, y: 4, color: COLORS.hatWhite },
    { x: 9, y: 4, color: COLORS.hatWhite },
    { x: 10, y: 4, color: COLORS.hatWhite },
    // Wider base
    { x: 3, y: 5, color: COLORS.hatWhite },
    { x: 4, y: 5, color: COLORS.hatWhite },
    { x: 5, y: 5, color: COLORS.hatWhite },
    { x: 6, y: 5, color: COLORS.hatWhite },
    { x: 7, y: 5, color: COLORS.hatWhite },
    { x: 8, y: 5, color: COLORS.hatWhite },
    { x: 9, y: 5, color: COLORS.hatWhite },
    { x: 10, y: 5, color: COLORS.hatWhite },
    { x: 11, y: 5, color: COLORS.hatWhite },
    // Pleats with more detail
    { x: 3, y: 6, color: COLORS.hatWhite },
    { x: 4, y: 6, color: COLORS.hatShadow },
    { x: 5, y: 6, color: COLORS.hatWhite },
    { x: 6, y: 6, color: COLORS.hatShadow },
    { x: 7, y: 6, color: COLORS.hatWhite },
    { x: 8, y: 6, color: COLORS.hatShadow },
    { x: 9, y: 6, color: COLORS.hatWhite },
    { x: 10, y: 6, color: COLORS.hatShadow },
    { x: 11, y: 6, color: COLORS.hatWhite },
    { x: 4, y: 7, color: COLORS.hatWhite },
    { x: 5, y: 7, color: COLORS.hatShadow },
    { x: 6, y: 7, color: COLORS.hatWhite },
    { x: 7, y: 7, color: COLORS.hatShadow },
    { x: 8, y: 7, color: COLORS.hatWhite },
    { x: 9, y: 7, color: COLORS.hatShadow },
    { x: 10, y: 7, color: COLORS.hatWhite },
    // Band
    { x: 4, y: 8, color: COLORS.dark },
    { x: 5, y: 8, color: COLORS.dark },
    { x: 6, y: 8, color: COLORS.dark },
    { x: 7, y: 8, color: COLORS.dark },
    { x: 8, y: 8, color: COLORS.dark },
    { x: 9, y: 8, color: COLORS.dark },
    { x: 10, y: 8, color: COLORS.dark },

    // BUBBLE (shifted down +3)
    { x: 4, y: 9, color: COLORS.dark },
    { x: 5, y: 9, color: COLORS.dark },
    { x: 6, y: 9, color: COLORS.dark },
    { x: 7, y: 9, color: COLORS.dark },
    { x: 8, y: 9, color: COLORS.dark },
    { x: 9, y: 9, color: COLORS.dark },
    { x: 10, y: 9, color: COLORS.dark },
    { x: 3, y: 10, color: COLORS.dark },
    { x: 4, y: 10, color: COLORS.cream },
    { x: 5, y: 10, color: COLORS.cream },
    { x: 6, y: 10, color: COLORS.cream },
    { x: 7, y: 10, color: COLORS.cream },
    { x: 8, y: 10, color: COLORS.cream },
    { x: 9, y: 10, color: COLORS.cream },
    { x: 10, y: 10, color: COLORS.cream },
    { x: 11, y: 10, color: COLORS.dark },
    { x: 3, y: 11, color: COLORS.dark },
    { x: 4, y: 11, color: COLORS.cream },
    { x: 5, y: 11, color: COLORS.orange },
    { x: 6, y: 11, color: COLORS.cream },
    { x: 7, y: 11, color: COLORS.orange },
    { x: 8, y: 11, color: COLORS.cream },
    { x: 9, y: 11, color: COLORS.orange },
    { x: 10, y: 11, color: COLORS.cream },
    { x: 11, y: 11, color: COLORS.dark },
    { x: 3, y: 12, color: COLORS.dark },
    { x: 4, y: 12, color: COLORS.cream },
    { x: 5, y: 12, color: COLORS.cream },
    { x: 6, y: 12, color: COLORS.cream },
    { x: 7, y: 12, color: COLORS.cream },
    { x: 8, y: 12, color: COLORS.cream },
    { x: 9, y: 12, color: COLORS.cream },
    { x: 10, y: 12, color: COLORS.cream },
    { x: 11, y: 12, color: COLORS.dark },
    { x: 4, y: 13, color: COLORS.dark },
    { x: 5, y: 13, color: COLORS.dark },
    { x: 6, y: 13, color: COLORS.dark },
    { x: 7, y: 13, color: COLORS.dark },
    { x: 8, y: 13, color: COLORS.dark },
    { x: 9, y: 13, color: COLORS.dark },
    { x: 10, y: 13, color: COLORS.dark },
    // Triangular pointer
    { x: 2, y: 12, color: COLORS.dark },
    { x: 1, y: 13, color: COLORS.dark },
    { x: 2, y: 13, color: COLORS.cream },
    { x: 3, y: 13, color: COLORS.dark },
    { x: 0, y: 14, color: COLORS.dark },
    { x: 1, y: 14, color: COLORS.cream },
    { x: 2, y: 14, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.2} viewBox="0 0 56 64" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// HAT 10: Modern Tall - Contemporary taller chef cap
export function PixelLogoHat10({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // CHEF HAT - Modern tall cap
    { x: 5, y: 0, color: COLORS.hatWhite },
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 8, y: 0, color: COLORS.hatWhite },
    { x: 9, y: 0, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 9, y: 1, color: COLORS.hatWhite },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatWhite },
    { x: 10, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 3, color: COLORS.hatWhite },
    { x: 5, y: 3, color: COLORS.hatWhite },
    { x: 6, y: 3, color: COLORS.hatWhite },
    { x: 7, y: 3, color: COLORS.hatWhite },
    { x: 8, y: 3, color: COLORS.hatWhite },
    { x: 9, y: 3, color: COLORS.hatWhite },
    { x: 10, y: 3, color: COLORS.hatWhite },
    { x: 4, y: 4, color: COLORS.hatWhite },
    { x: 5, y: 4, color: COLORS.hatWhite },
    { x: 6, y: 4, color: COLORS.hatWhite },
    { x: 7, y: 4, color: COLORS.hatWhite },
    { x: 8, y: 4, color: COLORS.hatWhite },
    { x: 9, y: 4, color: COLORS.hatWhite },
    { x: 10, y: 4, color: COLORS.hatWhite },
    { x: 3, y: 5, color: COLORS.hatWhite },
    { x: 4, y: 5, color: COLORS.hatWhite },
    { x: 5, y: 5, color: COLORS.hatWhite },
    { x: 6, y: 5, color: COLORS.hatWhite },
    { x: 7, y: 5, color: COLORS.hatWhite },
    { x: 8, y: 5, color: COLORS.hatWhite },
    { x: 9, y: 5, color: COLORS.hatWhite },
    { x: 10, y: 5, color: COLORS.hatWhite },
    { x: 11, y: 5, color: COLORS.hatWhite },
    // Subtle pleats
    { x: 4, y: 6, color: COLORS.hatWhite },
    { x: 5, y: 6, color: COLORS.hatWhite },
    { x: 6, y: 6, color: COLORS.hatShadow },
    { x: 7, y: 6, color: COLORS.hatWhite },
    { x: 8, y: 6, color: COLORS.hatShadow },
    { x: 9, y: 6, color: COLORS.hatWhite },
    { x: 10, y: 6, color: COLORS.hatWhite },
    { x: 4, y: 7, color: COLORS.hatWhite },
    { x: 5, y: 7, color: COLORS.hatWhite },
    { x: 6, y: 7, color: COLORS.hatShadow },
    { x: 7, y: 7, color: COLORS.hatWhite },
    { x: 8, y: 7, color: COLORS.hatShadow },
    { x: 9, y: 7, color: COLORS.hatWhite },
    { x: 10, y: 7, color: COLORS.hatWhite },
    // Band
    { x: 4, y: 8, color: COLORS.dark },
    { x: 5, y: 8, color: COLORS.dark },
    { x: 6, y: 8, color: COLORS.dark },
    { x: 7, y: 8, color: COLORS.dark },
    { x: 8, y: 8, color: COLORS.dark },
    { x: 9, y: 8, color: COLORS.dark },
    { x: 10, y: 8, color: COLORS.dark },

    // BUBBLE (shifted down +3)
    { x: 4, y: 9, color: COLORS.dark },
    { x: 5, y: 9, color: COLORS.dark },
    { x: 6, y: 9, color: COLORS.dark },
    { x: 7, y: 9, color: COLORS.dark },
    { x: 8, y: 9, color: COLORS.dark },
    { x: 9, y: 9, color: COLORS.dark },
    { x: 10, y: 9, color: COLORS.dark },
    { x: 3, y: 10, color: COLORS.dark },
    { x: 4, y: 10, color: COLORS.cream },
    { x: 5, y: 10, color: COLORS.cream },
    { x: 6, y: 10, color: COLORS.cream },
    { x: 7, y: 10, color: COLORS.cream },
    { x: 8, y: 10, color: COLORS.cream },
    { x: 9, y: 10, color: COLORS.cream },
    { x: 10, y: 10, color: COLORS.cream },
    { x: 11, y: 10, color: COLORS.dark },
    { x: 3, y: 11, color: COLORS.dark },
    { x: 4, y: 11, color: COLORS.cream },
    { x: 5, y: 11, color: COLORS.orange },
    { x: 6, y: 11, color: COLORS.cream },
    { x: 7, y: 11, color: COLORS.orange },
    { x: 8, y: 11, color: COLORS.cream },
    { x: 9, y: 11, color: COLORS.orange },
    { x: 10, y: 11, color: COLORS.cream },
    { x: 11, y: 11, color: COLORS.dark },
    { x: 3, y: 12, color: COLORS.dark },
    { x: 4, y: 12, color: COLORS.cream },
    { x: 5, y: 12, color: COLORS.cream },
    { x: 6, y: 12, color: COLORS.cream },
    { x: 7, y: 12, color: COLORS.cream },
    { x: 8, y: 12, color: COLORS.cream },
    { x: 9, y: 12, color: COLORS.cream },
    { x: 10, y: 12, color: COLORS.cream },
    { x: 11, y: 12, color: COLORS.dark },
    { x: 4, y: 13, color: COLORS.dark },
    { x: 5, y: 13, color: COLORS.dark },
    { x: 6, y: 13, color: COLORS.dark },
    { x: 7, y: 13, color: COLORS.dark },
    { x: 8, y: 13, color: COLORS.dark },
    { x: 9, y: 13, color: COLORS.dark },
    { x: 10, y: 13, color: COLORS.dark },
    // Triangular pointer
    { x: 2, y: 12, color: COLORS.dark },
    { x: 1, y: 13, color: COLORS.dark },
    { x: 2, y: 13, color: COLORS.cream },
    { x: 3, y: 13, color: COLORS.dark },
    { x: 0, y: 14, color: COLORS.dark },
    { x: 1, y: 14, color: COLORS.cream },
    { x: 2, y: 14, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.2} viewBox="0 0 56 64" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// APRON STYLE LOGOS - Chef hat on top of apron icon
// ─────────────────────────────────────────────────────────────────────────────

// APRON 1: Classic - Traditional toque with simple apron
export function PixelLogoApron1({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // CHEF HAT - Classic rounded toque
    { x: 5, y: 0, color: COLORS.hatWhite },
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 4, y: 1, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatShadow },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatShadow },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 3, y: 3, color: COLORS.dark },
    { x: 4, y: 3, color: COLORS.dark },
    { x: 5, y: 3, color: COLORS.dark },
    { x: 6, y: 3, color: COLORS.dark },
    { x: 7, y: 3, color: COLORS.dark },
    { x: 8, y: 3, color: COLORS.dark },
    { x: 9, y: 3, color: COLORS.dark },

    // APRON - Neck strap
    { x: 6, y: 5, color: COLORS.dark },
    { x: 6, y: 6, color: COLORS.dark },

    // APRON - Shoulder straps
    { x: 4, y: 7, color: COLORS.dark },
    { x: 5, y: 7, color: COLORS.dark },
    { x: 7, y: 7, color: COLORS.dark },
    { x: 8, y: 7, color: COLORS.dark },

    // APRON - Body outline
    { x: 3, y: 8, color: COLORS.dark },
    { x: 4, y: 8, color: COLORS.cream },
    { x: 5, y: 8, color: COLORS.cream },
    { x: 6, y: 8, color: COLORS.cream },
    { x: 7, y: 8, color: COLORS.cream },
    { x: 8, y: 8, color: COLORS.cream },
    { x: 9, y: 8, color: COLORS.dark },
    { x: 3, y: 9, color: COLORS.dark },
    { x: 4, y: 9, color: COLORS.cream },
    { x: 5, y: 9, color: COLORS.cream },
    { x: 6, y: 9, color: COLORS.cream },
    { x: 7, y: 9, color: COLORS.cream },
    { x: 8, y: 9, color: COLORS.cream },
    { x: 9, y: 9, color: COLORS.dark },
    { x: 3, y: 10, color: COLORS.dark },
    { x: 4, y: 10, color: COLORS.cream },
    { x: 5, y: 10, color: COLORS.cream },
    { x: 6, y: 10, color: COLORS.cream },
    { x: 7, y: 10, color: COLORS.cream },
    { x: 8, y: 10, color: COLORS.cream },
    { x: 9, y: 10, color: COLORS.dark },
    // Pocket
    { x: 4, y: 11, color: COLORS.dark },
    { x: 5, y: 11, color: COLORS.dark },
    { x: 6, y: 11, color: COLORS.dark },
    { x: 7, y: 11, color: COLORS.dark },
    { x: 8, y: 11, color: COLORS.dark },
    { x: 3, y: 12, color: COLORS.dark },
    { x: 4, y: 12, color: COLORS.cream },
    { x: 5, y: 12, color: COLORS.cream },
    { x: 6, y: 12, color: COLORS.cream },
    { x: 7, y: 12, color: COLORS.cream },
    { x: 8, y: 12, color: COLORS.cream },
    { x: 9, y: 12, color: COLORS.dark },
    { x: 3, y: 13, color: COLORS.dark },
    { x: 4, y: 13, color: COLORS.cream },
    { x: 5, y: 13, color: COLORS.cream },
    { x: 6, y: 13, color: COLORS.cream },
    { x: 7, y: 13, color: COLORS.cream },
    { x: 8, y: 13, color: COLORS.cream },
    { x: 9, y: 13, color: COLORS.dark },
    // Bottom
    { x: 4, y: 14, color: COLORS.dark },
    { x: 5, y: 14, color: COLORS.dark },
    { x: 6, y: 14, color: COLORS.dark },
    { x: 7, y: 14, color: COLORS.dark },
    { x: 8, y: 14, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.2} viewBox="0 0 52 64" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// APRON 2: Tall Toque - Extra tall chef hat with apron
export function PixelLogoApron2({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // CHEF HAT - Tall toque
    { x: 5, y: 0, color: COLORS.hatWhite },
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 4, y: 1, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 3, color: COLORS.hatWhite },
    { x: 5, y: 3, color: COLORS.hatShadow },
    { x: 6, y: 3, color: COLORS.hatWhite },
    { x: 7, y: 3, color: COLORS.hatShadow },
    { x: 8, y: 3, color: COLORS.hatWhite },
    { x: 4, y: 4, color: COLORS.hatWhite },
    { x: 5, y: 4, color: COLORS.hatShadow },
    { x: 6, y: 4, color: COLORS.hatWhite },
    { x: 7, y: 4, color: COLORS.hatShadow },
    { x: 8, y: 4, color: COLORS.hatWhite },
    { x: 3, y: 5, color: COLORS.dark },
    { x: 4, y: 5, color: COLORS.dark },
    { x: 5, y: 5, color: COLORS.dark },
    { x: 6, y: 5, color: COLORS.dark },
    { x: 7, y: 5, color: COLORS.dark },
    { x: 8, y: 5, color: COLORS.dark },
    { x: 9, y: 5, color: COLORS.dark },

    // APRON - Neck strap
    { x: 6, y: 7, color: COLORS.dark },
    { x: 6, y: 8, color: COLORS.dark },

    // APRON - Shoulder straps
    { x: 4, y: 9, color: COLORS.dark },
    { x: 5, y: 9, color: COLORS.dark },
    { x: 7, y: 9, color: COLORS.dark },
    { x: 8, y: 9, color: COLORS.dark },

    // APRON - Body
    { x: 3, y: 10, color: COLORS.dark },
    { x: 4, y: 10, color: COLORS.cream },
    { x: 5, y: 10, color: COLORS.cream },
    { x: 6, y: 10, color: COLORS.cream },
    { x: 7, y: 10, color: COLORS.cream },
    { x: 8, y: 10, color: COLORS.cream },
    { x: 9, y: 10, color: COLORS.dark },
    { x: 3, y: 11, color: COLORS.dark },
    { x: 4, y: 11, color: COLORS.cream },
    { x: 5, y: 11, color: COLORS.cream },
    { x: 6, y: 11, color: COLORS.cream },
    { x: 7, y: 11, color: COLORS.cream },
    { x: 8, y: 11, color: COLORS.cream },
    { x: 9, y: 11, color: COLORS.dark },
    { x: 3, y: 12, color: COLORS.dark },
    { x: 4, y: 12, color: COLORS.cream },
    { x: 5, y: 12, color: COLORS.cream },
    { x: 6, y: 12, color: COLORS.cream },
    { x: 7, y: 12, color: COLORS.cream },
    { x: 8, y: 12, color: COLORS.cream },
    { x: 9, y: 12, color: COLORS.dark },
    // Pocket
    { x: 4, y: 13, color: COLORS.dark },
    { x: 5, y: 13, color: COLORS.dark },
    { x: 6, y: 13, color: COLORS.dark },
    { x: 7, y: 13, color: COLORS.dark },
    { x: 8, y: 13, color: COLORS.dark },
    { x: 3, y: 14, color: COLORS.dark },
    { x: 4, y: 14, color: COLORS.cream },
    { x: 5, y: 14, color: COLORS.cream },
    { x: 6, y: 14, color: COLORS.cream },
    { x: 7, y: 14, color: COLORS.cream },
    { x: 8, y: 14, color: COLORS.cream },
    { x: 9, y: 14, color: COLORS.dark },
    { x: 3, y: 15, color: COLORS.dark },
    { x: 4, y: 15, color: COLORS.cream },
    { x: 5, y: 15, color: COLORS.cream },
    { x: 6, y: 15, color: COLORS.cream },
    { x: 7, y: 15, color: COLORS.cream },
    { x: 8, y: 15, color: COLORS.cream },
    { x: 9, y: 15, color: COLORS.dark },
    { x: 4, y: 16, color: COLORS.dark },
    { x: 5, y: 16, color: COLORS.dark },
    { x: 6, y: 16, color: COLORS.dark },
    { x: 7, y: 16, color: COLORS.dark },
    { x: 8, y: 16, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.3} viewBox="0 0 52 72" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// APRON 3: Orange Accent - With orange pocket trim
export function PixelLogoApron3({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // CHEF HAT
    { x: 5, y: 0, color: COLORS.hatWhite },
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 4, y: 1, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatShadow },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatShadow },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 3, y: 3, color: COLORS.dark },
    { x: 4, y: 3, color: COLORS.dark },
    { x: 5, y: 3, color: COLORS.dark },
    { x: 6, y: 3, color: COLORS.dark },
    { x: 7, y: 3, color: COLORS.dark },
    { x: 8, y: 3, color: COLORS.dark },
    { x: 9, y: 3, color: COLORS.dark },

    // APRON - Neck strap
    { x: 6, y: 5, color: COLORS.dark },
    { x: 6, y: 6, color: COLORS.dark },

    // APRON - Shoulder straps
    { x: 4, y: 7, color: COLORS.dark },
    { x: 5, y: 7, color: COLORS.dark },
    { x: 7, y: 7, color: COLORS.dark },
    { x: 8, y: 7, color: COLORS.dark },

    // APRON - Body with orange trim
    { x: 3, y: 8, color: COLORS.dark },
    { x: 4, y: 8, color: COLORS.cream },
    { x: 5, y: 8, color: COLORS.cream },
    { x: 6, y: 8, color: COLORS.cream },
    { x: 7, y: 8, color: COLORS.cream },
    { x: 8, y: 8, color: COLORS.cream },
    { x: 9, y: 8, color: COLORS.dark },
    { x: 3, y: 9, color: COLORS.dark },
    { x: 4, y: 9, color: COLORS.cream },
    { x: 5, y: 9, color: COLORS.cream },
    { x: 6, y: 9, color: COLORS.cream },
    { x: 7, y: 9, color: COLORS.cream },
    { x: 8, y: 9, color: COLORS.cream },
    { x: 9, y: 9, color: COLORS.dark },
    { x: 3, y: 10, color: COLORS.dark },
    { x: 4, y: 10, color: COLORS.cream },
    { x: 5, y: 10, color: COLORS.cream },
    { x: 6, y: 10, color: COLORS.cream },
    { x: 7, y: 10, color: COLORS.cream },
    { x: 8, y: 10, color: COLORS.cream },
    { x: 9, y: 10, color: COLORS.dark },
    // Pocket with ORANGE trim
    { x: 4, y: 11, color: COLORS.orange },
    { x: 5, y: 11, color: COLORS.orange },
    { x: 6, y: 11, color: COLORS.orange },
    { x: 7, y: 11, color: COLORS.orange },
    { x: 8, y: 11, color: COLORS.orange },
    { x: 3, y: 12, color: COLORS.dark },
    { x: 4, y: 12, color: COLORS.cream },
    { x: 5, y: 12, color: COLORS.cream },
    { x: 6, y: 12, color: COLORS.cream },
    { x: 7, y: 12, color: COLORS.cream },
    { x: 8, y: 12, color: COLORS.cream },
    { x: 9, y: 12, color: COLORS.dark },
    { x: 3, y: 13, color: COLORS.dark },
    { x: 4, y: 13, color: COLORS.cream },
    { x: 5, y: 13, color: COLORS.cream },
    { x: 6, y: 13, color: COLORS.cream },
    { x: 7, y: 13, color: COLORS.cream },
    { x: 8, y: 13, color: COLORS.cream },
    { x: 9, y: 13, color: COLORS.dark },
    { x: 4, y: 14, color: COLORS.dark },
    { x: 5, y: 14, color: COLORS.dark },
    { x: 6, y: 14, color: COLORS.dark },
    { x: 7, y: 14, color: COLORS.dark },
    { x: 8, y: 14, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.2} viewBox="0 0 52 64" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// APRON 4: Poofy Hat - Mushroom-shaped chef hat
export function PixelLogoApron4({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // CHEF HAT - Poofy mushroom style
    { x: 4, y: 0, color: COLORS.hatWhite },
    { x: 5, y: 0, color: COLORS.hatWhite },
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 8, y: 0, color: COLORS.hatWhite },
    { x: 3, y: 1, color: COLORS.hatWhite },
    { x: 4, y: 1, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 9, y: 1, color: COLORS.hatWhite },
    { x: 3, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 2, color: COLORS.hatShadow },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatShadow },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 8, y: 2, color: COLORS.hatShadow },
    { x: 9, y: 2, color: COLORS.hatWhite },
    // Narrower band
    { x: 4, y: 3, color: COLORS.dark },
    { x: 5, y: 3, color: COLORS.dark },
    { x: 6, y: 3, color: COLORS.dark },
    { x: 7, y: 3, color: COLORS.dark },
    { x: 8, y: 3, color: COLORS.dark },

    // APRON - Neck strap
    { x: 6, y: 5, color: COLORS.dark },
    { x: 6, y: 6, color: COLORS.dark },

    // APRON - Shoulder straps (wider)
    { x: 3, y: 7, color: COLORS.dark },
    { x: 4, y: 7, color: COLORS.dark },
    { x: 5, y: 7, color: COLORS.dark },
    { x: 7, y: 7, color: COLORS.dark },
    { x: 8, y: 7, color: COLORS.dark },
    { x: 9, y: 7, color: COLORS.dark },

    // APRON - Body (wider)
    { x: 2, y: 8, color: COLORS.dark },
    { x: 3, y: 8, color: COLORS.cream },
    { x: 4, y: 8, color: COLORS.cream },
    { x: 5, y: 8, color: COLORS.cream },
    { x: 6, y: 8, color: COLORS.cream },
    { x: 7, y: 8, color: COLORS.cream },
    { x: 8, y: 8, color: COLORS.cream },
    { x: 9, y: 8, color: COLORS.cream },
    { x: 10, y: 8, color: COLORS.dark },
    { x: 2, y: 9, color: COLORS.dark },
    { x: 3, y: 9, color: COLORS.cream },
    { x: 4, y: 9, color: COLORS.cream },
    { x: 5, y: 9, color: COLORS.cream },
    { x: 6, y: 9, color: COLORS.cream },
    { x: 7, y: 9, color: COLORS.cream },
    { x: 8, y: 9, color: COLORS.cream },
    { x: 9, y: 9, color: COLORS.cream },
    { x: 10, y: 9, color: COLORS.dark },
    { x: 2, y: 10, color: COLORS.dark },
    { x: 3, y: 10, color: COLORS.cream },
    { x: 4, y: 10, color: COLORS.cream },
    { x: 5, y: 10, color: COLORS.cream },
    { x: 6, y: 10, color: COLORS.cream },
    { x: 7, y: 10, color: COLORS.cream },
    { x: 8, y: 10, color: COLORS.cream },
    { x: 9, y: 10, color: COLORS.cream },
    { x: 10, y: 10, color: COLORS.dark },
    // Pocket
    { x: 4, y: 11, color: COLORS.dark },
    { x: 5, y: 11, color: COLORS.dark },
    { x: 6, y: 11, color: COLORS.dark },
    { x: 7, y: 11, color: COLORS.dark },
    { x: 8, y: 11, color: COLORS.dark },
    { x: 2, y: 12, color: COLORS.dark },
    { x: 3, y: 12, color: COLORS.cream },
    { x: 4, y: 12, color: COLORS.cream },
    { x: 5, y: 12, color: COLORS.cream },
    { x: 6, y: 12, color: COLORS.cream },
    { x: 7, y: 12, color: COLORS.cream },
    { x: 8, y: 12, color: COLORS.cream },
    { x: 9, y: 12, color: COLORS.cream },
    { x: 10, y: 12, color: COLORS.dark },
    { x: 2, y: 13, color: COLORS.dark },
    { x: 3, y: 13, color: COLORS.cream },
    { x: 4, y: 13, color: COLORS.cream },
    { x: 5, y: 13, color: COLORS.cream },
    { x: 6, y: 13, color: COLORS.cream },
    { x: 7, y: 13, color: COLORS.cream },
    { x: 8, y: 13, color: COLORS.cream },
    { x: 9, y: 13, color: COLORS.cream },
    { x: 10, y: 13, color: COLORS.dark },
    { x: 3, y: 14, color: COLORS.dark },
    { x: 4, y: 14, color: COLORS.dark },
    { x: 5, y: 14, color: COLORS.dark },
    { x: 6, y: 14, color: COLORS.dark },
    { x: 7, y: 14, color: COLORS.dark },
    { x: 8, y: 14, color: COLORS.dark },
    { x: 9, y: 14, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.2} viewBox="0 0 52 64" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// APRON 5: Minimal - Clean, minimal design
export function PixelLogoApron5({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // CHEF HAT - Simple cap
    { x: 5, y: 0, color: COLORS.hatWhite },
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 4, y: 1, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 4, y: 2, color: COLORS.dark },
    { x: 5, y: 2, color: COLORS.dark },
    { x: 6, y: 2, color: COLORS.dark },
    { x: 7, y: 2, color: COLORS.dark },
    { x: 8, y: 2, color: COLORS.dark },

    // APRON - Simple single strap
    { x: 6, y: 4, color: COLORS.dark },

    // APRON - Shoulder straps
    { x: 4, y: 5, color: COLORS.dark },
    { x: 8, y: 5, color: COLORS.dark },

    // APRON - Body (no pocket, clean)
    { x: 3, y: 6, color: COLORS.dark },
    { x: 4, y: 6, color: COLORS.cream },
    { x: 5, y: 6, color: COLORS.cream },
    { x: 6, y: 6, color: COLORS.cream },
    { x: 7, y: 6, color: COLORS.cream },
    { x: 8, y: 6, color: COLORS.cream },
    { x: 9, y: 6, color: COLORS.dark },
    { x: 3, y: 7, color: COLORS.dark },
    { x: 4, y: 7, color: COLORS.cream },
    { x: 5, y: 7, color: COLORS.cream },
    { x: 6, y: 7, color: COLORS.cream },
    { x: 7, y: 7, color: COLORS.cream },
    { x: 8, y: 7, color: COLORS.cream },
    { x: 9, y: 7, color: COLORS.dark },
    { x: 3, y: 8, color: COLORS.dark },
    { x: 4, y: 8, color: COLORS.cream },
    { x: 5, y: 8, color: COLORS.cream },
    { x: 6, y: 8, color: COLORS.cream },
    { x: 7, y: 8, color: COLORS.cream },
    { x: 8, y: 8, color: COLORS.cream },
    { x: 9, y: 8, color: COLORS.dark },
    { x: 3, y: 9, color: COLORS.dark },
    { x: 4, y: 9, color: COLORS.cream },
    { x: 5, y: 9, color: COLORS.cream },
    { x: 6, y: 9, color: COLORS.cream },
    { x: 7, y: 9, color: COLORS.cream },
    { x: 8, y: 9, color: COLORS.cream },
    { x: 9, y: 9, color: COLORS.dark },
    { x: 3, y: 10, color: COLORS.dark },
    { x: 4, y: 10, color: COLORS.cream },
    { x: 5, y: 10, color: COLORS.cream },
    { x: 6, y: 10, color: COLORS.cream },
    { x: 7, y: 10, color: COLORS.cream },
    { x: 8, y: 10, color: COLORS.cream },
    { x: 9, y: 10, color: COLORS.dark },
    { x: 4, y: 11, color: COLORS.dark },
    { x: 5, y: 11, color: COLORS.dark },
    { x: 6, y: 11, color: COLORS.dark },
    { x: 7, y: 11, color: COLORS.dark },
    { x: 8, y: 11, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size} viewBox="0 0 52 52" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// APRON 6: Bold - Thick outlines, high contrast
export function PixelLogoApron6({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // CHEF HAT - Bold with thick edges
    { x: 4, y: 0, color: COLORS.dark },
    { x: 5, y: 0, color: COLORS.dark },
    { x: 6, y: 0, color: COLORS.dark },
    { x: 7, y: 0, color: COLORS.dark },
    { x: 8, y: 0, color: COLORS.dark },
    { x: 3, y: 1, color: COLORS.dark },
    { x: 4, y: 1, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 9, y: 1, color: COLORS.dark },
    { x: 3, y: 2, color: COLORS.dark },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatShadow },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatShadow },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.dark },
    { x: 3, y: 3, color: COLORS.dark },
    { x: 4, y: 3, color: COLORS.dark },
    { x: 5, y: 3, color: COLORS.dark },
    { x: 6, y: 3, color: COLORS.dark },
    { x: 7, y: 3, color: COLORS.dark },
    { x: 8, y: 3, color: COLORS.dark },
    { x: 9, y: 3, color: COLORS.dark },

    // APRON - Neck strap (thick)
    { x: 5, y: 5, color: COLORS.dark },
    { x: 6, y: 5, color: COLORS.dark },
    { x: 7, y: 5, color: COLORS.dark },
    { x: 5, y: 6, color: COLORS.dark },
    { x: 6, y: 6, color: COLORS.dark },
    { x: 7, y: 6, color: COLORS.dark },

    // APRON - Shoulder straps (thick)
    { x: 3, y: 7, color: COLORS.dark },
    { x: 4, y: 7, color: COLORS.dark },
    { x: 5, y: 7, color: COLORS.dark },
    { x: 7, y: 7, color: COLORS.dark },
    { x: 8, y: 7, color: COLORS.dark },
    { x: 9, y: 7, color: COLORS.dark },

    // APRON - Body
    { x: 2, y: 8, color: COLORS.dark },
    { x: 3, y: 8, color: COLORS.dark },
    { x: 4, y: 8, color: COLORS.cream },
    { x: 5, y: 8, color: COLORS.cream },
    { x: 6, y: 8, color: COLORS.cream },
    { x: 7, y: 8, color: COLORS.cream },
    { x: 8, y: 8, color: COLORS.cream },
    { x: 9, y: 8, color: COLORS.dark },
    { x: 10, y: 8, color: COLORS.dark },
    { x: 2, y: 9, color: COLORS.dark },
    { x: 3, y: 9, color: COLORS.cream },
    { x: 4, y: 9, color: COLORS.cream },
    { x: 5, y: 9, color: COLORS.cream },
    { x: 6, y: 9, color: COLORS.cream },
    { x: 7, y: 9, color: COLORS.cream },
    { x: 8, y: 9, color: COLORS.cream },
    { x: 9, y: 9, color: COLORS.cream },
    { x: 10, y: 9, color: COLORS.dark },
    { x: 2, y: 10, color: COLORS.dark },
    { x: 3, y: 10, color: COLORS.cream },
    { x: 4, y: 10, color: COLORS.cream },
    { x: 5, y: 10, color: COLORS.cream },
    { x: 6, y: 10, color: COLORS.cream },
    { x: 7, y: 10, color: COLORS.cream },
    { x: 8, y: 10, color: COLORS.cream },
    { x: 9, y: 10, color: COLORS.cream },
    { x: 10, y: 10, color: COLORS.dark },
    // Pocket
    { x: 4, y: 11, color: COLORS.dark },
    { x: 5, y: 11, color: COLORS.dark },
    { x: 6, y: 11, color: COLORS.dark },
    { x: 7, y: 11, color: COLORS.dark },
    { x: 8, y: 11, color: COLORS.dark },
    { x: 2, y: 12, color: COLORS.dark },
    { x: 3, y: 12, color: COLORS.cream },
    { x: 4, y: 12, color: COLORS.cream },
    { x: 5, y: 12, color: COLORS.cream },
    { x: 6, y: 12, color: COLORS.cream },
    { x: 7, y: 12, color: COLORS.cream },
    { x: 8, y: 12, color: COLORS.cream },
    { x: 9, y: 12, color: COLORS.cream },
    { x: 10, y: 12, color: COLORS.dark },
    { x: 2, y: 13, color: COLORS.dark },
    { x: 3, y: 13, color: COLORS.dark },
    { x: 4, y: 13, color: COLORS.cream },
    { x: 5, y: 13, color: COLORS.cream },
    { x: 6, y: 13, color: COLORS.cream },
    { x: 7, y: 13, color: COLORS.cream },
    { x: 8, y: 13, color: COLORS.cream },
    { x: 9, y: 13, color: COLORS.dark },
    { x: 10, y: 13, color: COLORS.dark },
    { x: 3, y: 14, color: COLORS.dark },
    { x: 4, y: 14, color: COLORS.dark },
    { x: 5, y: 14, color: COLORS.dark },
    { x: 6, y: 14, color: COLORS.dark },
    { x: 7, y: 14, color: COLORS.dark },
    { x: 8, y: 14, color: COLORS.dark },
    { x: 9, y: 14, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.2} viewBox="0 0 52 64" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// APRON 7: Orange Hat Band - Orange accent on hat
export function PixelLogoApron7({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // CHEF HAT with orange band
    { x: 5, y: 0, color: COLORS.hatWhite },
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 4, y: 1, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatShadow },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatShadow },
    { x: 8, y: 2, color: COLORS.hatWhite },
    // ORANGE BAND
    { x: 3, y: 3, color: COLORS.orange },
    { x: 4, y: 3, color: COLORS.orange },
    { x: 5, y: 3, color: COLORS.orange },
    { x: 6, y: 3, color: COLORS.orange },
    { x: 7, y: 3, color: COLORS.orange },
    { x: 8, y: 3, color: COLORS.orange },
    { x: 9, y: 3, color: COLORS.orange },

    // APRON - Neck strap
    { x: 6, y: 5, color: COLORS.dark },
    { x: 6, y: 6, color: COLORS.dark },

    // APRON - Shoulder straps
    { x: 4, y: 7, color: COLORS.dark },
    { x: 5, y: 7, color: COLORS.dark },
    { x: 7, y: 7, color: COLORS.dark },
    { x: 8, y: 7, color: COLORS.dark },

    // APRON - Body
    { x: 3, y: 8, color: COLORS.dark },
    { x: 4, y: 8, color: COLORS.cream },
    { x: 5, y: 8, color: COLORS.cream },
    { x: 6, y: 8, color: COLORS.cream },
    { x: 7, y: 8, color: COLORS.cream },
    { x: 8, y: 8, color: COLORS.cream },
    { x: 9, y: 8, color: COLORS.dark },
    { x: 3, y: 9, color: COLORS.dark },
    { x: 4, y: 9, color: COLORS.cream },
    { x: 5, y: 9, color: COLORS.cream },
    { x: 6, y: 9, color: COLORS.cream },
    { x: 7, y: 9, color: COLORS.cream },
    { x: 8, y: 9, color: COLORS.cream },
    { x: 9, y: 9, color: COLORS.dark },
    { x: 3, y: 10, color: COLORS.dark },
    { x: 4, y: 10, color: COLORS.cream },
    { x: 5, y: 10, color: COLORS.cream },
    { x: 6, y: 10, color: COLORS.cream },
    { x: 7, y: 10, color: COLORS.cream },
    { x: 8, y: 10, color: COLORS.cream },
    { x: 9, y: 10, color: COLORS.dark },
    // Pocket
    { x: 4, y: 11, color: COLORS.dark },
    { x: 5, y: 11, color: COLORS.dark },
    { x: 6, y: 11, color: COLORS.dark },
    { x: 7, y: 11, color: COLORS.dark },
    { x: 8, y: 11, color: COLORS.dark },
    { x: 3, y: 12, color: COLORS.dark },
    { x: 4, y: 12, color: COLORS.cream },
    { x: 5, y: 12, color: COLORS.cream },
    { x: 6, y: 12, color: COLORS.cream },
    { x: 7, y: 12, color: COLORS.cream },
    { x: 8, y: 12, color: COLORS.cream },
    { x: 9, y: 12, color: COLORS.dark },
    { x: 3, y: 13, color: COLORS.dark },
    { x: 4, y: 13, color: COLORS.cream },
    { x: 5, y: 13, color: COLORS.cream },
    { x: 6, y: 13, color: COLORS.cream },
    { x: 7, y: 13, color: COLORS.cream },
    { x: 8, y: 13, color: COLORS.cream },
    { x: 9, y: 13, color: COLORS.dark },
    { x: 4, y: 14, color: COLORS.dark },
    { x: 5, y: 14, color: COLORS.dark },
    { x: 6, y: 14, color: COLORS.dark },
    { x: 7, y: 14, color: COLORS.dark },
    { x: 8, y: 14, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.2} viewBox="0 0 52 64" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// APRON 8: Two Pockets - Apron with two side pockets
export function PixelLogoApron8({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // CHEF HAT
    { x: 5, y: 0, color: COLORS.hatWhite },
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 4, y: 1, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatShadow },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatShadow },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 3, y: 3, color: COLORS.dark },
    { x: 4, y: 3, color: COLORS.dark },
    { x: 5, y: 3, color: COLORS.dark },
    { x: 6, y: 3, color: COLORS.dark },
    { x: 7, y: 3, color: COLORS.dark },
    { x: 8, y: 3, color: COLORS.dark },
    { x: 9, y: 3, color: COLORS.dark },

    // APRON - Neck strap
    { x: 6, y: 5, color: COLORS.dark },
    { x: 6, y: 6, color: COLORS.dark },

    // APRON - Shoulder straps
    { x: 4, y: 7, color: COLORS.dark },
    { x: 5, y: 7, color: COLORS.dark },
    { x: 7, y: 7, color: COLORS.dark },
    { x: 8, y: 7, color: COLORS.dark },

    // APRON - Body with TWO pockets
    { x: 3, y: 8, color: COLORS.dark },
    { x: 4, y: 8, color: COLORS.cream },
    { x: 5, y: 8, color: COLORS.cream },
    { x: 6, y: 8, color: COLORS.cream },
    { x: 7, y: 8, color: COLORS.cream },
    { x: 8, y: 8, color: COLORS.cream },
    { x: 9, y: 8, color: COLORS.dark },
    { x: 3, y: 9, color: COLORS.dark },
    { x: 4, y: 9, color: COLORS.cream },
    { x: 5, y: 9, color: COLORS.cream },
    { x: 6, y: 9, color: COLORS.cream },
    { x: 7, y: 9, color: COLORS.cream },
    { x: 8, y: 9, color: COLORS.cream },
    { x: 9, y: 9, color: COLORS.dark },
    // Two pocket lines
    { x: 3, y: 10, color: COLORS.dark },
    { x: 4, y: 10, color: COLORS.dark },
    { x: 5, y: 10, color: COLORS.dark },
    { x: 6, y: 10, color: COLORS.cream },
    { x: 7, y: 10, color: COLORS.dark },
    { x: 8, y: 10, color: COLORS.dark },
    { x: 9, y: 10, color: COLORS.dark },
    { x: 3, y: 11, color: COLORS.dark },
    { x: 4, y: 11, color: COLORS.cream },
    { x: 5, y: 11, color: COLORS.cream },
    { x: 6, y: 11, color: COLORS.cream },
    { x: 7, y: 11, color: COLORS.cream },
    { x: 8, y: 11, color: COLORS.cream },
    { x: 9, y: 11, color: COLORS.dark },
    { x: 3, y: 12, color: COLORS.dark },
    { x: 4, y: 12, color: COLORS.cream },
    { x: 5, y: 12, color: COLORS.cream },
    { x: 6, y: 12, color: COLORS.cream },
    { x: 7, y: 12, color: COLORS.cream },
    { x: 8, y: 12, color: COLORS.cream },
    { x: 9, y: 12, color: COLORS.dark },
    { x: 3, y: 13, color: COLORS.dark },
    { x: 4, y: 13, color: COLORS.cream },
    { x: 5, y: 13, color: COLORS.cream },
    { x: 6, y: 13, color: COLORS.cream },
    { x: 7, y: 13, color: COLORS.cream },
    { x: 8, y: 13, color: COLORS.cream },
    { x: 9, y: 13, color: COLORS.dark },
    { x: 4, y: 14, color: COLORS.dark },
    { x: 5, y: 14, color: COLORS.dark },
    { x: 6, y: 14, color: COLORS.dark },
    { x: 7, y: 14, color: COLORS.dark },
    { x: 8, y: 14, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.2} viewBox="0 0 52 64" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// APRON 9: Full Orange - Orange apron with white hat
export function PixelLogoApron9({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // CHEF HAT (white)
    { x: 5, y: 0, color: COLORS.hatWhite },
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 4, y: 1, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatShadow },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatShadow },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 3, y: 3, color: COLORS.dark },
    { x: 4, y: 3, color: COLORS.dark },
    { x: 5, y: 3, color: COLORS.dark },
    { x: 6, y: 3, color: COLORS.dark },
    { x: 7, y: 3, color: COLORS.dark },
    { x: 8, y: 3, color: COLORS.dark },
    { x: 9, y: 3, color: COLORS.dark },

    // APRON - Neck strap (orange)
    { x: 6, y: 5, color: COLORS.orange },
    { x: 6, y: 6, color: COLORS.orange },

    // APRON - Shoulder straps (orange)
    { x: 4, y: 7, color: COLORS.orange },
    { x: 5, y: 7, color: COLORS.orange },
    { x: 7, y: 7, color: COLORS.orange },
    { x: 8, y: 7, color: COLORS.orange },

    // APRON - Body (ORANGE)
    { x: 3, y: 8, color: COLORS.dark },
    { x: 4, y: 8, color: COLORS.orange },
    { x: 5, y: 8, color: COLORS.orange },
    { x: 6, y: 8, color: COLORS.orange },
    { x: 7, y: 8, color: COLORS.orange },
    { x: 8, y: 8, color: COLORS.orange },
    { x: 9, y: 8, color: COLORS.dark },
    { x: 3, y: 9, color: COLORS.dark },
    { x: 4, y: 9, color: COLORS.orange },
    { x: 5, y: 9, color: COLORS.orange },
    { x: 6, y: 9, color: COLORS.orange },
    { x: 7, y: 9, color: COLORS.orange },
    { x: 8, y: 9, color: COLORS.orange },
    { x: 9, y: 9, color: COLORS.dark },
    { x: 3, y: 10, color: COLORS.dark },
    { x: 4, y: 10, color: COLORS.orange },
    { x: 5, y: 10, color: COLORS.orange },
    { x: 6, y: 10, color: COLORS.orange },
    { x: 7, y: 10, color: COLORS.orange },
    { x: 8, y: 10, color: COLORS.orange },
    { x: 9, y: 10, color: COLORS.dark },
    // Pocket (cream on orange)
    { x: 4, y: 11, color: COLORS.cream },
    { x: 5, y: 11, color: COLORS.cream },
    { x: 6, y: 11, color: COLORS.cream },
    { x: 7, y: 11, color: COLORS.cream },
    { x: 8, y: 11, color: COLORS.cream },
    { x: 3, y: 12, color: COLORS.dark },
    { x: 4, y: 12, color: COLORS.orange },
    { x: 5, y: 12, color: COLORS.orange },
    { x: 6, y: 12, color: COLORS.orange },
    { x: 7, y: 12, color: COLORS.orange },
    { x: 8, y: 12, color: COLORS.orange },
    { x: 9, y: 12, color: COLORS.dark },
    { x: 3, y: 13, color: COLORS.dark },
    { x: 4, y: 13, color: COLORS.orange },
    { x: 5, y: 13, color: COLORS.orange },
    { x: 6, y: 13, color: COLORS.orange },
    { x: 7, y: 13, color: COLORS.orange },
    { x: 8, y: 13, color: COLORS.orange },
    { x: 9, y: 13, color: COLORS.dark },
    { x: 4, y: 14, color: COLORS.dark },
    { x: 5, y: 14, color: COLORS.dark },
    { x: 6, y: 14, color: COLORS.dark },
    { x: 7, y: 14, color: COLORS.dark },
    { x: 8, y: 14, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.2} viewBox="0 0 52 64" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// APRON 10: Matching Reference - Closest to the reference image
export function PixelLogoApron10({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // CHEF HAT - Matches reference style
    { x: 5, y: 0, color: COLORS.hatWhite },
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 4, y: 1, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatShadow },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatShadow },
    { x: 8, y: 2, color: COLORS.hatWhite },
    // Band
    { x: 4, y: 3, color: COLORS.gray },
    { x: 5, y: 3, color: COLORS.gray },
    { x: 6, y: 3, color: COLORS.gray },
    { x: 7, y: 3, color: COLORS.gray },
    { x: 8, y: 3, color: COLORS.gray },

    // Gap between hat and apron (like reference)

    // APRON - Single neck loop
    { x: 6, y: 5, color: COLORS.gray },
    { x: 6, y: 6, color: COLORS.gray },

    // APRON - Shoulder straps (angled like reference)
    { x: 4, y: 7, color: COLORS.gray },
    { x: 5, y: 7, color: COLORS.gray },
    { x: 7, y: 7, color: COLORS.gray },
    { x: 8, y: 7, color: COLORS.gray },

    // APRON - Body (outlined)
    { x: 3, y: 8, color: COLORS.gray },
    { x: 4, y: 8, color: COLORS.cream },
    { x: 5, y: 8, color: COLORS.cream },
    { x: 6, y: 8, color: COLORS.cream },
    { x: 7, y: 8, color: COLORS.cream },
    { x: 8, y: 8, color: COLORS.cream },
    { x: 9, y: 8, color: COLORS.gray },
    { x: 3, y: 9, color: COLORS.gray },
    { x: 4, y: 9, color: COLORS.cream },
    { x: 5, y: 9, color: COLORS.cream },
    { x: 6, y: 9, color: COLORS.cream },
    { x: 7, y: 9, color: COLORS.cream },
    { x: 8, y: 9, color: COLORS.cream },
    { x: 9, y: 9, color: COLORS.gray },
    { x: 3, y: 10, color: COLORS.gray },
    { x: 4, y: 10, color: COLORS.cream },
    { x: 5, y: 10, color: COLORS.cream },
    { x: 6, y: 10, color: COLORS.cream },
    { x: 7, y: 10, color: COLORS.cream },
    { x: 8, y: 10, color: COLORS.cream },
    { x: 9, y: 10, color: COLORS.gray },
    // Pocket (outlined)
    { x: 4, y: 11, color: COLORS.gray },
    { x: 5, y: 11, color: COLORS.gray },
    { x: 6, y: 11, color: COLORS.gray },
    { x: 7, y: 11, color: COLORS.gray },
    { x: 8, y: 11, color: COLORS.gray },
    { x: 3, y: 12, color: COLORS.gray },
    { x: 4, y: 12, color: COLORS.cream },
    { x: 5, y: 12, color: COLORS.cream },
    { x: 6, y: 12, color: COLORS.cream },
    { x: 7, y: 12, color: COLORS.cream },
    { x: 8, y: 12, color: COLORS.cream },
    { x: 9, y: 12, color: COLORS.gray },
    { x: 3, y: 13, color: COLORS.gray },
    { x: 4, y: 13, color: COLORS.cream },
    { x: 5, y: 13, color: COLORS.cream },
    { x: 6, y: 13, color: COLORS.cream },
    { x: 7, y: 13, color: COLORS.cream },
    { x: 8, y: 13, color: COLORS.cream },
    { x: 9, y: 13, color: COLORS.gray },
    // Bottom
    { x: 4, y: 14, color: COLORS.gray },
    { x: 5, y: 14, color: COLORS.gray },
    { x: 6, y: 14, color: COLORS.gray },
    { x: 7, y: 14, color: COLORS.gray },
    { x: 8, y: 14, color: COLORS.gray },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.2} viewBox="0 0 52 64" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HAT-ONLY ICONS - Pure chef hat silhouettes optimized for app icons
// ─────────────────────────────────────────────────────────────────────────────

// HAT ICON 1: "Grand Toque" - Classic tall puffy chef hat
export function PixelHatIcon1({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // Puffy rounded top
    { x: 4, y: 0, color: COLORS.hatWhite },
    { x: 5, y: 0, color: COLORS.hatWhite },
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    // Wider second row
    { x: 3, y: 1, color: COLORS.hatWhite },
    { x: 4, y: 1, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    // Widest point
    { x: 2, y: 2, color: COLORS.hatWhite },
    { x: 3, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatWhite },
    // Pleated body rows
    { x: 2, y: 3, color: COLORS.hatWhite },
    { x: 3, y: 3, color: COLORS.hatShadow },
    { x: 4, y: 3, color: COLORS.hatWhite },
    { x: 5, y: 3, color: COLORS.hatShadow },
    { x: 6, y: 3, color: COLORS.hatWhite },
    { x: 7, y: 3, color: COLORS.hatShadow },
    { x: 8, y: 3, color: COLORS.hatWhite },
    { x: 9, y: 3, color: COLORS.hatShadow },
    { x: 2, y: 4, color: COLORS.hatWhite },
    { x: 3, y: 4, color: COLORS.hatShadow },
    { x: 4, y: 4, color: COLORS.hatWhite },
    { x: 5, y: 4, color: COLORS.hatShadow },
    { x: 6, y: 4, color: COLORS.hatWhite },
    { x: 7, y: 4, color: COLORS.hatShadow },
    { x: 8, y: 4, color: COLORS.hatWhite },
    { x: 9, y: 4, color: COLORS.hatShadow },
    { x: 2, y: 5, color: COLORS.hatWhite },
    { x: 3, y: 5, color: COLORS.hatShadow },
    { x: 4, y: 5, color: COLORS.hatWhite },
    { x: 5, y: 5, color: COLORS.hatShadow },
    { x: 6, y: 5, color: COLORS.hatWhite },
    { x: 7, y: 5, color: COLORS.hatShadow },
    { x: 8, y: 5, color: COLORS.hatWhite },
    { x: 9, y: 5, color: COLORS.hatShadow },
    { x: 2, y: 6, color: COLORS.hatWhite },
    { x: 3, y: 6, color: COLORS.hatShadow },
    { x: 4, y: 6, color: COLORS.hatWhite },
    { x: 5, y: 6, color: COLORS.hatShadow },
    { x: 6, y: 6, color: COLORS.hatWhite },
    { x: 7, y: 6, color: COLORS.hatShadow },
    { x: 8, y: 6, color: COLORS.hatWhite },
    { x: 9, y: 6, color: COLORS.hatShadow },
    // Solid bottom
    { x: 2, y: 7, color: COLORS.hatWhite },
    { x: 3, y: 7, color: COLORS.hatWhite },
    { x: 4, y: 7, color: COLORS.hatWhite },
    { x: 5, y: 7, color: COLORS.hatWhite },
    { x: 6, y: 7, color: COLORS.hatWhite },
    { x: 7, y: 7, color: COLORS.hatWhite },
    { x: 8, y: 7, color: COLORS.hatWhite },
    { x: 9, y: 7, color: COLORS.hatWhite },
    // Dark band
    { x: 2, y: 8, color: COLORS.dark },
    { x: 3, y: 8, color: COLORS.dark },
    { x: 4, y: 8, color: COLORS.dark },
    { x: 5, y: 8, color: COLORS.dark },
    { x: 6, y: 8, color: COLORS.dark },
    { x: 7, y: 8, color: COLORS.dark },
    { x: 8, y: 8, color: COLORS.dark },
    { x: 9, y: 8, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size} viewBox="0 0 48 40" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// HAT ICON 2: "Triple Crown" - Three distinct puffs (most recognizable chef hat shape)
export function PixelHatIcon2({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // Three puffs at top
    { x: 2, y: 0, color: COLORS.hatWhite },
    { x: 3, y: 0, color: COLORS.hatWhite },
    { x: 5, y: 0, color: COLORS.hatWhite },
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 8, y: 0, color: COLORS.hatWhite },
    { x: 9, y: 0, color: COLORS.hatWhite },
    // Connect puffs
    { x: 1, y: 1, color: COLORS.hatWhite },
    { x: 2, y: 1, color: COLORS.hatWhite },
    { x: 3, y: 1, color: COLORS.hatWhite },
    { x: 4, y: 1, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 9, y: 1, color: COLORS.hatWhite },
    { x: 10, y: 1, color: COLORS.hatWhite },
    // Solid crown
    { x: 2, y: 2, color: COLORS.hatWhite },
    { x: 3, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatWhite },
    // Pleated body
    { x: 2, y: 3, color: COLORS.hatWhite },
    { x: 3, y: 3, color: COLORS.hatShadow },
    { x: 4, y: 3, color: COLORS.hatWhite },
    { x: 5, y: 3, color: COLORS.hatShadow },
    { x: 6, y: 3, color: COLORS.hatWhite },
    { x: 7, y: 3, color: COLORS.hatShadow },
    { x: 8, y: 3, color: COLORS.hatWhite },
    { x: 9, y: 3, color: COLORS.hatShadow },
    { x: 2, y: 4, color: COLORS.hatWhite },
    { x: 3, y: 4, color: COLORS.hatShadow },
    { x: 4, y: 4, color: COLORS.hatWhite },
    { x: 5, y: 4, color: COLORS.hatShadow },
    { x: 6, y: 4, color: COLORS.hatWhite },
    { x: 7, y: 4, color: COLORS.hatShadow },
    { x: 8, y: 4, color: COLORS.hatWhite },
    { x: 9, y: 4, color: COLORS.hatShadow },
    { x: 2, y: 5, color: COLORS.hatWhite },
    { x: 3, y: 5, color: COLORS.hatShadow },
    { x: 4, y: 5, color: COLORS.hatWhite },
    { x: 5, y: 5, color: COLORS.hatShadow },
    { x: 6, y: 5, color: COLORS.hatWhite },
    { x: 7, y: 5, color: COLORS.hatShadow },
    { x: 8, y: 5, color: COLORS.hatWhite },
    { x: 9, y: 5, color: COLORS.hatShadow },
    { x: 2, y: 6, color: COLORS.hatWhite },
    { x: 3, y: 6, color: COLORS.hatShadow },
    { x: 4, y: 6, color: COLORS.hatWhite },
    { x: 5, y: 6, color: COLORS.hatShadow },
    { x: 6, y: 6, color: COLORS.hatWhite },
    { x: 7, y: 6, color: COLORS.hatShadow },
    { x: 8, y: 6, color: COLORS.hatWhite },
    { x: 9, y: 6, color: COLORS.hatShadow },
    // Solid bottom
    { x: 2, y: 7, color: COLORS.hatWhite },
    { x: 3, y: 7, color: COLORS.hatWhite },
    { x: 4, y: 7, color: COLORS.hatWhite },
    { x: 5, y: 7, color: COLORS.hatWhite },
    { x: 6, y: 7, color: COLORS.hatWhite },
    { x: 7, y: 7, color: COLORS.hatWhite },
    { x: 8, y: 7, color: COLORS.hatWhite },
    { x: 9, y: 7, color: COLORS.hatWhite },
    // Dark band
    { x: 2, y: 8, color: COLORS.dark },
    { x: 3, y: 8, color: COLORS.dark },
    { x: 4, y: 8, color: COLORS.dark },
    { x: 5, y: 8, color: COLORS.dark },
    { x: 6, y: 8, color: COLORS.dark },
    { x: 7, y: 8, color: COLORS.dark },
    { x: 8, y: 8, color: COLORS.dark },
    { x: 9, y: 8, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size} viewBox="0 0 48 40" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// HAT ICON 3: "Billowing" - Extra wide at top, mushroom shape
export function PixelHatIcon3({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // Extra wide puffy top
    { x: 1, y: 0, color: COLORS.hatWhite },
    { x: 2, y: 0, color: COLORS.hatWhite },
    { x: 3, y: 0, color: COLORS.hatWhite },
    { x: 4, y: 0, color: COLORS.hatWhite },
    { x: 5, y: 0, color: COLORS.hatWhite },
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 8, y: 0, color: COLORS.hatWhite },
    { x: 9, y: 0, color: COLORS.hatWhite },
    { x: 10, y: 0, color: COLORS.hatWhite },
    // Still very wide
    { x: 1, y: 1, color: COLORS.hatWhite },
    { x: 2, y: 1, color: COLORS.hatWhite },
    { x: 3, y: 1, color: COLORS.hatWhite },
    { x: 4, y: 1, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 9, y: 1, color: COLORS.hatWhite },
    { x: 10, y: 1, color: COLORS.hatWhite },
    // Taper begins
    { x: 2, y: 2, color: COLORS.hatWhite },
    { x: 3, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatWhite },
    // Pleated body with taper
    { x: 2, y: 3, color: COLORS.hatWhite },
    { x: 3, y: 3, color: COLORS.hatShadow },
    { x: 4, y: 3, color: COLORS.hatWhite },
    { x: 5, y: 3, color: COLORS.hatShadow },
    { x: 6, y: 3, color: COLORS.hatWhite },
    { x: 7, y: 3, color: COLORS.hatShadow },
    { x: 8, y: 3, color: COLORS.hatWhite },
    { x: 9, y: 3, color: COLORS.hatShadow },
    { x: 3, y: 4, color: COLORS.hatWhite },
    { x: 4, y: 4, color: COLORS.hatShadow },
    { x: 5, y: 4, color: COLORS.hatWhite },
    { x: 6, y: 4, color: COLORS.hatShadow },
    { x: 7, y: 4, color: COLORS.hatWhite },
    { x: 8, y: 4, color: COLORS.hatShadow },
    { x: 3, y: 5, color: COLORS.hatWhite },
    { x: 4, y: 5, color: COLORS.hatShadow },
    { x: 5, y: 5, color: COLORS.hatWhite },
    { x: 6, y: 5, color: COLORS.hatShadow },
    { x: 7, y: 5, color: COLORS.hatWhite },
    { x: 8, y: 5, color: COLORS.hatShadow },
    { x: 3, y: 6, color: COLORS.hatWhite },
    { x: 4, y: 6, color: COLORS.hatShadow },
    { x: 5, y: 6, color: COLORS.hatWhite },
    { x: 6, y: 6, color: COLORS.hatShadow },
    { x: 7, y: 6, color: COLORS.hatWhite },
    { x: 8, y: 6, color: COLORS.hatShadow },
    // Solid bottom
    { x: 3, y: 7, color: COLORS.hatWhite },
    { x: 4, y: 7, color: COLORS.hatWhite },
    { x: 5, y: 7, color: COLORS.hatWhite },
    { x: 6, y: 7, color: COLORS.hatWhite },
    { x: 7, y: 7, color: COLORS.hatWhite },
    { x: 8, y: 7, color: COLORS.hatWhite },
    // Dark band
    { x: 3, y: 8, color: COLORS.dark },
    { x: 4, y: 8, color: COLORS.dark },
    { x: 5, y: 8, color: COLORS.dark },
    { x: 6, y: 8, color: COLORS.dark },
    { x: 7, y: 8, color: COLORS.dark },
    { x: 8, y: 8, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size} viewBox="0 0 48 40" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// HAT ICON 4: "Tall Column" - Slim, tall cylinder shape
export function PixelHatIcon4({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // Rounded top
    { x: 4, y: 0, color: COLORS.hatWhite },
    { x: 5, y: 0, color: COLORS.hatWhite },
    { x: 6, y: 0, color: COLORS.hatWhite },
    // Slightly wider
    { x: 3, y: 1, color: COLORS.hatWhite },
    { x: 4, y: 1, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    // Pleated tall body
    { x: 3, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 2, color: COLORS.hatShadow },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatShadow },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 3, y: 3, color: COLORS.hatWhite },
    { x: 4, y: 3, color: COLORS.hatShadow },
    { x: 5, y: 3, color: COLORS.hatWhite },
    { x: 6, y: 3, color: COLORS.hatShadow },
    { x: 7, y: 3, color: COLORS.hatWhite },
    { x: 3, y: 4, color: COLORS.hatWhite },
    { x: 4, y: 4, color: COLORS.hatShadow },
    { x: 5, y: 4, color: COLORS.hatWhite },
    { x: 6, y: 4, color: COLORS.hatShadow },
    { x: 7, y: 4, color: COLORS.hatWhite },
    { x: 3, y: 5, color: COLORS.hatWhite },
    { x: 4, y: 5, color: COLORS.hatShadow },
    { x: 5, y: 5, color: COLORS.hatWhite },
    { x: 6, y: 5, color: COLORS.hatShadow },
    { x: 7, y: 5, color: COLORS.hatWhite },
    { x: 3, y: 6, color: COLORS.hatWhite },
    { x: 4, y: 6, color: COLORS.hatShadow },
    { x: 5, y: 6, color: COLORS.hatWhite },
    { x: 6, y: 6, color: COLORS.hatShadow },
    { x: 7, y: 6, color: COLORS.hatWhite },
    { x: 3, y: 7, color: COLORS.hatWhite },
    { x: 4, y: 7, color: COLORS.hatShadow },
    { x: 5, y: 7, color: COLORS.hatWhite },
    { x: 6, y: 7, color: COLORS.hatShadow },
    { x: 7, y: 7, color: COLORS.hatWhite },
    // Solid bottom
    { x: 3, y: 8, color: COLORS.hatWhite },
    { x: 4, y: 8, color: COLORS.hatWhite },
    { x: 5, y: 8, color: COLORS.hatWhite },
    { x: 6, y: 8, color: COLORS.hatWhite },
    { x: 7, y: 8, color: COLORS.hatWhite },
    // Dark band
    { x: 3, y: 9, color: COLORS.dark },
    { x: 4, y: 9, color: COLORS.dark },
    { x: 5, y: 9, color: COLORS.dark },
    { x: 6, y: 9, color: COLORS.dark },
    { x: 7, y: 9, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size} viewBox="0 0 44 44" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// HAT ICON 5: "Rounded Dome" - Softer, more rounded shape
export function PixelHatIcon5({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // Very rounded top
    { x: 5, y: 0, color: COLORS.hatWhite },
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 4, y: 1, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 3, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 8, y: 2, color: COLORS.hatWhite },
    // Widest with pleats
    { x: 2, y: 3, color: COLORS.hatWhite },
    { x: 3, y: 3, color: COLORS.hatWhite },
    { x: 4, y: 3, color: COLORS.hatShadow },
    { x: 5, y: 3, color: COLORS.hatWhite },
    { x: 6, y: 3, color: COLORS.hatShadow },
    { x: 7, y: 3, color: COLORS.hatWhite },
    { x: 8, y: 3, color: COLORS.hatShadow },
    { x: 9, y: 3, color: COLORS.hatWhite },
    { x: 2, y: 4, color: COLORS.hatWhite },
    { x: 3, y: 4, color: COLORS.hatShadow },
    { x: 4, y: 4, color: COLORS.hatWhite },
    { x: 5, y: 4, color: COLORS.hatShadow },
    { x: 6, y: 4, color: COLORS.hatWhite },
    { x: 7, y: 4, color: COLORS.hatShadow },
    { x: 8, y: 4, color: COLORS.hatWhite },
    { x: 9, y: 4, color: COLORS.hatShadow },
    { x: 2, y: 5, color: COLORS.hatWhite },
    { x: 3, y: 5, color: COLORS.hatShadow },
    { x: 4, y: 5, color: COLORS.hatWhite },
    { x: 5, y: 5, color: COLORS.hatShadow },
    { x: 6, y: 5, color: COLORS.hatWhite },
    { x: 7, y: 5, color: COLORS.hatShadow },
    { x: 8, y: 5, color: COLORS.hatWhite },
    { x: 9, y: 5, color: COLORS.hatShadow },
    { x: 2, y: 6, color: COLORS.hatWhite },
    { x: 3, y: 6, color: COLORS.hatShadow },
    { x: 4, y: 6, color: COLORS.hatWhite },
    { x: 5, y: 6, color: COLORS.hatShadow },
    { x: 6, y: 6, color: COLORS.hatWhite },
    { x: 7, y: 6, color: COLORS.hatShadow },
    { x: 8, y: 6, color: COLORS.hatWhite },
    { x: 9, y: 6, color: COLORS.hatShadow },
    // Solid bottom
    { x: 2, y: 7, color: COLORS.hatWhite },
    { x: 3, y: 7, color: COLORS.hatWhite },
    { x: 4, y: 7, color: COLORS.hatWhite },
    { x: 5, y: 7, color: COLORS.hatWhite },
    { x: 6, y: 7, color: COLORS.hatWhite },
    { x: 7, y: 7, color: COLORS.hatWhite },
    { x: 8, y: 7, color: COLORS.hatWhite },
    { x: 9, y: 7, color: COLORS.hatWhite },
    // Dark band
    { x: 2, y: 8, color: COLORS.dark },
    { x: 3, y: 8, color: COLORS.dark },
    { x: 4, y: 8, color: COLORS.dark },
    { x: 5, y: 8, color: COLORS.dark },
    { x: 6, y: 8, color: COLORS.dark },
    { x: 7, y: 8, color: COLORS.dark },
    { x: 8, y: 8, color: COLORS.dark },
    { x: 9, y: 8, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size} viewBox="0 0 48 40" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// IMPROVED CLARITY LOGOS - Tall toques with waist ties for maximum recognition
// ─────────────────────────────────────────────────────────────────────────────

// CHEF 1: "Grand Toque" - Maximum hat drama with 8-row tall puffy toque
export function PixelLogoChef1({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // CHEF HAT - Grand puffy toque (8 rows)
    // Row 0: Rounded top
    { x: 5, y: 0, color: COLORS.hatWhite },
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 8, y: 0, color: COLORS.hatWhite },
    // Row 1: Wider puff
    { x: 4, y: 1, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 9, y: 1, color: COLORS.hatWhite },
    // Row 2: Widest point
    { x: 3, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatWhite },
    { x: 10, y: 2, color: COLORS.hatWhite },
    // Row 3: Pleats begin
    { x: 3, y: 3, color: COLORS.hatWhite },
    { x: 4, y: 3, color: COLORS.hatShadow },
    { x: 5, y: 3, color: COLORS.hatWhite },
    { x: 6, y: 3, color: COLORS.hatShadow },
    { x: 7, y: 3, color: COLORS.hatWhite },
    { x: 8, y: 3, color: COLORS.hatShadow },
    { x: 9, y: 3, color: COLORS.hatWhite },
    { x: 10, y: 3, color: COLORS.hatShadow },
    // Row 4: Pleats
    { x: 3, y: 4, color: COLORS.hatWhite },
    { x: 4, y: 4, color: COLORS.hatShadow },
    { x: 5, y: 4, color: COLORS.hatWhite },
    { x: 6, y: 4, color: COLORS.hatShadow },
    { x: 7, y: 4, color: COLORS.hatWhite },
    { x: 8, y: 4, color: COLORS.hatShadow },
    { x: 9, y: 4, color: COLORS.hatWhite },
    { x: 10, y: 4, color: COLORS.hatShadow },
    // Row 5: Pleats
    { x: 3, y: 5, color: COLORS.hatWhite },
    { x: 4, y: 5, color: COLORS.hatShadow },
    { x: 5, y: 5, color: COLORS.hatWhite },
    { x: 6, y: 5, color: COLORS.hatShadow },
    { x: 7, y: 5, color: COLORS.hatWhite },
    { x: 8, y: 5, color: COLORS.hatShadow },
    { x: 9, y: 5, color: COLORS.hatWhite },
    { x: 10, y: 5, color: COLORS.hatShadow },
    // Row 6: Pleats
    { x: 3, y: 6, color: COLORS.hatWhite },
    { x: 4, y: 6, color: COLORS.hatShadow },
    { x: 5, y: 6, color: COLORS.hatWhite },
    { x: 6, y: 6, color: COLORS.hatShadow },
    { x: 7, y: 6, color: COLORS.hatWhite },
    { x: 8, y: 6, color: COLORS.hatShadow },
    { x: 9, y: 6, color: COLORS.hatWhite },
    { x: 10, y: 6, color: COLORS.hatShadow },
    // Row 7: Bottom of hat body
    { x: 3, y: 7, color: COLORS.hatWhite },
    { x: 4, y: 7, color: COLORS.hatWhite },
    { x: 5, y: 7, color: COLORS.hatWhite },
    { x: 6, y: 7, color: COLORS.hatWhite },
    { x: 7, y: 7, color: COLORS.hatWhite },
    { x: 8, y: 7, color: COLORS.hatWhite },
    { x: 9, y: 7, color: COLORS.hatWhite },
    { x: 10, y: 7, color: COLORS.hatWhite },
    // Row 8: Dark hat band
    { x: 3, y: 8, color: COLORS.dark },
    { x: 4, y: 8, color: COLORS.dark },
    { x: 5, y: 8, color: COLORS.dark },
    { x: 6, y: 8, color: COLORS.dark },
    { x: 7, y: 8, color: COLORS.dark },
    { x: 8, y: 8, color: COLORS.dark },
    { x: 9, y: 8, color: COLORS.dark },
    { x: 10, y: 8, color: COLORS.dark },

    // APRON - Neck strap
    { x: 6, y: 10, color: COLORS.dark },
    { x: 7, y: 10, color: COLORS.dark },
    { x: 6, y: 11, color: COLORS.dark },
    { x: 7, y: 11, color: COLORS.dark },

    // APRON - Shoulder straps
    { x: 4, y: 12, color: COLORS.dark },
    { x: 5, y: 12, color: COLORS.dark },
    { x: 8, y: 12, color: COLORS.dark },
    { x: 9, y: 12, color: COLORS.dark },

    // APRON - Bib (upper body)
    { x: 3, y: 13, color: COLORS.dark },
    { x: 4, y: 13, color: COLORS.cream },
    { x: 5, y: 13, color: COLORS.cream },
    { x: 6, y: 13, color: COLORS.cream },
    { x: 7, y: 13, color: COLORS.cream },
    { x: 8, y: 13, color: COLORS.cream },
    { x: 9, y: 13, color: COLORS.cream },
    { x: 10, y: 13, color: COLORS.dark },

    // WAIST TIES - Key identifier!
    { x: 1, y: 14, color: COLORS.dark },
    { x: 2, y: 14, color: COLORS.dark },
    { x: 3, y: 14, color: COLORS.dark },
    { x: 4, y: 14, color: COLORS.cream },
    { x: 5, y: 14, color: COLORS.cream },
    { x: 6, y: 14, color: COLORS.cream },
    { x: 7, y: 14, color: COLORS.cream },
    { x: 8, y: 14, color: COLORS.cream },
    { x: 9, y: 14, color: COLORS.cream },
    { x: 10, y: 14, color: COLORS.dark },
    { x: 11, y: 14, color: COLORS.dark },
    { x: 12, y: 14, color: COLORS.dark },

    // APRON - Body with pocket
    { x: 3, y: 15, color: COLORS.dark },
    { x: 4, y: 15, color: COLORS.cream },
    { x: 5, y: 15, color: COLORS.cream },
    { x: 6, y: 15, color: COLORS.cream },
    { x: 7, y: 15, color: COLORS.cream },
    { x: 8, y: 15, color: COLORS.cream },
    { x: 9, y: 15, color: COLORS.cream },
    { x: 10, y: 15, color: COLORS.dark },
    // Pocket line
    { x: 3, y: 16, color: COLORS.dark },
    { x: 4, y: 16, color: COLORS.cream },
    { x: 5, y: 16, color: COLORS.dark },
    { x: 6, y: 16, color: COLORS.dark },
    { x: 7, y: 16, color: COLORS.dark },
    { x: 8, y: 16, color: COLORS.dark },
    { x: 9, y: 16, color: COLORS.cream },
    { x: 10, y: 16, color: COLORS.dark },
    // More body
    { x: 3, y: 17, color: COLORS.dark },
    { x: 4, y: 17, color: COLORS.cream },
    { x: 5, y: 17, color: COLORS.cream },
    { x: 6, y: 17, color: COLORS.cream },
    { x: 7, y: 17, color: COLORS.cream },
    { x: 8, y: 17, color: COLORS.cream },
    { x: 9, y: 17, color: COLORS.cream },
    { x: 10, y: 17, color: COLORS.dark },
    // Tapered bottom
    { x: 4, y: 18, color: COLORS.dark },
    { x: 5, y: 18, color: COLORS.dark },
    { x: 6, y: 18, color: COLORS.dark },
    { x: 7, y: 18, color: COLORS.dark },
    { x: 8, y: 18, color: COLORS.dark },
    { x: 9, y: 18, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.3} viewBox="0 0 56 76" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// CHEF 2: "Dramatic Pleats" - Emphasis on vertical pleating
export function PixelLogoChef2({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // CHEF HAT - Structured with prominent pleats
    // Row 0: Rounded top
    { x: 5, y: 0, color: COLORS.hatWhite },
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    // Row 1: Wider
    { x: 4, y: 1, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    // Row 2-7: Strong pleats
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatShadow },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatShadow },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 3, color: COLORS.hatWhite },
    { x: 5, y: 3, color: COLORS.hatShadow },
    { x: 6, y: 3, color: COLORS.hatWhite },
    { x: 7, y: 3, color: COLORS.hatShadow },
    { x: 8, y: 3, color: COLORS.hatWhite },
    { x: 4, y: 4, color: COLORS.hatWhite },
    { x: 5, y: 4, color: COLORS.hatShadow },
    { x: 6, y: 4, color: COLORS.hatWhite },
    { x: 7, y: 4, color: COLORS.hatShadow },
    { x: 8, y: 4, color: COLORS.hatWhite },
    { x: 4, y: 5, color: COLORS.hatWhite },
    { x: 5, y: 5, color: COLORS.hatShadow },
    { x: 6, y: 5, color: COLORS.hatWhite },
    { x: 7, y: 5, color: COLORS.hatShadow },
    { x: 8, y: 5, color: COLORS.hatWhite },
    { x: 4, y: 6, color: COLORS.hatWhite },
    { x: 5, y: 6, color: COLORS.hatShadow },
    { x: 6, y: 6, color: COLORS.hatWhite },
    { x: 7, y: 6, color: COLORS.hatShadow },
    { x: 8, y: 6, color: COLORS.hatWhite },
    { x: 4, y: 7, color: COLORS.hatWhite },
    { x: 5, y: 7, color: COLORS.hatShadow },
    { x: 6, y: 7, color: COLORS.hatWhite },
    { x: 7, y: 7, color: COLORS.hatShadow },
    { x: 8, y: 7, color: COLORS.hatWhite },
    // Row 8: Dark band
    { x: 3, y: 8, color: COLORS.dark },
    { x: 4, y: 8, color: COLORS.dark },
    { x: 5, y: 8, color: COLORS.dark },
    { x: 6, y: 8, color: COLORS.dark },
    { x: 7, y: 8, color: COLORS.dark },
    { x: 8, y: 8, color: COLORS.dark },
    { x: 9, y: 8, color: COLORS.dark },

    // APRON - Thin neck
    { x: 6, y: 10, color: COLORS.dark },

    // Shoulder straps (wide)
    { x: 4, y: 11, color: COLORS.dark },
    { x: 5, y: 11, color: COLORS.dark },
    { x: 7, y: 11, color: COLORS.dark },
    { x: 8, y: 11, color: COLORS.dark },

    // Upper apron
    { x: 4, y: 12, color: COLORS.dark },
    { x: 5, y: 12, color: COLORS.cream },
    { x: 6, y: 12, color: COLORS.cream },
    { x: 7, y: 12, color: COLORS.cream },
    { x: 8, y: 12, color: COLORS.dark },

    // WAIST TIES - Prominent!
    { x: 2, y: 13, color: COLORS.dark },
    { x: 3, y: 13, color: COLORS.dark },
    { x: 4, y: 13, color: COLORS.dark },
    { x: 5, y: 13, color: COLORS.cream },
    { x: 6, y: 13, color: COLORS.cream },
    { x: 7, y: 13, color: COLORS.cream },
    { x: 8, y: 13, color: COLORS.dark },
    { x: 9, y: 13, color: COLORS.dark },
    { x: 10, y: 13, color: COLORS.dark },

    // Body
    { x: 4, y: 14, color: COLORS.dark },
    { x: 5, y: 14, color: COLORS.cream },
    { x: 6, y: 14, color: COLORS.cream },
    { x: 7, y: 14, color: COLORS.cream },
    { x: 8, y: 14, color: COLORS.dark },
    // Pocket
    { x: 4, y: 15, color: COLORS.dark },
    { x: 5, y: 15, color: COLORS.dark },
    { x: 6, y: 15, color: COLORS.dark },
    { x: 7, y: 15, color: COLORS.dark },
    { x: 8, y: 15, color: COLORS.dark },
    // Bottom
    { x: 4, y: 16, color: COLORS.dark },
    { x: 5, y: 16, color: COLORS.cream },
    { x: 6, y: 16, color: COLORS.cream },
    { x: 7, y: 16, color: COLORS.cream },
    { x: 8, y: 16, color: COLORS.dark },
    { x: 5, y: 17, color: COLORS.dark },
    { x: 6, y: 17, color: COLORS.dark },
    { x: 7, y: 17, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.3} viewBox="0 0 52 72" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// CHEF 3: "Triple Crown" - Three puffs for instant chef recognition
export function PixelLogoChef3({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // CHEF HAT - Triple puff crown
    // Row 0: Three puffs
    { x: 3, y: 0, color: COLORS.hatWhite },
    { x: 4, y: 0, color: COLORS.hatWhite },
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 9, y: 0, color: COLORS.hatWhite },
    { x: 10, y: 0, color: COLORS.hatWhite },
    // Row 1: Connect puffs
    { x: 2, y: 1, color: COLORS.hatWhite },
    { x: 3, y: 1, color: COLORS.hatWhite },
    { x: 4, y: 1, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 9, y: 1, color: COLORS.hatWhite },
    { x: 10, y: 1, color: COLORS.hatWhite },
    { x: 11, y: 1, color: COLORS.hatWhite },
    // Row 2: Solid crown
    { x: 3, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatWhite },
    { x: 10, y: 2, color: COLORS.hatWhite },
    // Rows 3-7: Pleats
    { x: 3, y: 3, color: COLORS.hatWhite },
    { x: 4, y: 3, color: COLORS.hatShadow },
    { x: 5, y: 3, color: COLORS.hatWhite },
    { x: 6, y: 3, color: COLORS.hatShadow },
    { x: 7, y: 3, color: COLORS.hatWhite },
    { x: 8, y: 3, color: COLORS.hatShadow },
    { x: 9, y: 3, color: COLORS.hatWhite },
    { x: 10, y: 3, color: COLORS.hatShadow },
    { x: 3, y: 4, color: COLORS.hatWhite },
    { x: 4, y: 4, color: COLORS.hatShadow },
    { x: 5, y: 4, color: COLORS.hatWhite },
    { x: 6, y: 4, color: COLORS.hatShadow },
    { x: 7, y: 4, color: COLORS.hatWhite },
    { x: 8, y: 4, color: COLORS.hatShadow },
    { x: 9, y: 4, color: COLORS.hatWhite },
    { x: 10, y: 4, color: COLORS.hatShadow },
    { x: 3, y: 5, color: COLORS.hatWhite },
    { x: 4, y: 5, color: COLORS.hatShadow },
    { x: 5, y: 5, color: COLORS.hatWhite },
    { x: 6, y: 5, color: COLORS.hatShadow },
    { x: 7, y: 5, color: COLORS.hatWhite },
    { x: 8, y: 5, color: COLORS.hatShadow },
    { x: 9, y: 5, color: COLORS.hatWhite },
    { x: 10, y: 5, color: COLORS.hatShadow },
    { x: 3, y: 6, color: COLORS.hatWhite },
    { x: 4, y: 6, color: COLORS.hatShadow },
    { x: 5, y: 6, color: COLORS.hatWhite },
    { x: 6, y: 6, color: COLORS.hatShadow },
    { x: 7, y: 6, color: COLORS.hatWhite },
    { x: 8, y: 6, color: COLORS.hatShadow },
    { x: 9, y: 6, color: COLORS.hatWhite },
    { x: 10, y: 6, color: COLORS.hatShadow },
    // Row 7: Solid bottom
    { x: 3, y: 7, color: COLORS.hatWhite },
    { x: 4, y: 7, color: COLORS.hatWhite },
    { x: 5, y: 7, color: COLORS.hatWhite },
    { x: 6, y: 7, color: COLORS.hatWhite },
    { x: 7, y: 7, color: COLORS.hatWhite },
    { x: 8, y: 7, color: COLORS.hatWhite },
    { x: 9, y: 7, color: COLORS.hatWhite },
    { x: 10, y: 7, color: COLORS.hatWhite },
    // Row 8: Dark band
    { x: 3, y: 8, color: COLORS.dark },
    { x: 4, y: 8, color: COLORS.dark },
    { x: 5, y: 8, color: COLORS.dark },
    { x: 6, y: 8, color: COLORS.dark },
    { x: 7, y: 8, color: COLORS.dark },
    { x: 8, y: 8, color: COLORS.dark },
    { x: 9, y: 8, color: COLORS.dark },
    { x: 10, y: 8, color: COLORS.dark },

    // APRON - Neck
    { x: 6, y: 10, color: COLORS.dark },
    { x: 7, y: 10, color: COLORS.dark },

    // Body
    { x: 4, y: 11, color: COLORS.dark },
    { x: 5, y: 11, color: COLORS.cream },
    { x: 6, y: 11, color: COLORS.cream },
    { x: 7, y: 11, color: COLORS.cream },
    { x: 8, y: 11, color: COLORS.cream },
    { x: 9, y: 11, color: COLORS.dark },

    // WAIST TIES - Wide
    { x: 2, y: 12, color: COLORS.dark },
    { x: 3, y: 12, color: COLORS.dark },
    { x: 4, y: 12, color: COLORS.dark },
    { x: 5, y: 12, color: COLORS.cream },
    { x: 6, y: 12, color: COLORS.cream },
    { x: 7, y: 12, color: COLORS.cream },
    { x: 8, y: 12, color: COLORS.cream },
    { x: 9, y: 12, color: COLORS.dark },
    { x: 10, y: 12, color: COLORS.dark },
    { x: 11, y: 12, color: COLORS.dark },

    // Lower body
    { x: 4, y: 13, color: COLORS.dark },
    { x: 5, y: 13, color: COLORS.cream },
    { x: 6, y: 13, color: COLORS.cream },
    { x: 7, y: 13, color: COLORS.cream },
    { x: 8, y: 13, color: COLORS.cream },
    { x: 9, y: 13, color: COLORS.dark },
    // Pocket
    { x: 4, y: 14, color: COLORS.dark },
    { x: 5, y: 14, color: COLORS.dark },
    { x: 6, y: 14, color: COLORS.dark },
    { x: 7, y: 14, color: COLORS.dark },
    { x: 8, y: 14, color: COLORS.dark },
    { x: 9, y: 14, color: COLORS.dark },
    // Bottom
    { x: 4, y: 15, color: COLORS.dark },
    { x: 5, y: 15, color: COLORS.cream },
    { x: 6, y: 15, color: COLORS.cream },
    { x: 7, y: 15, color: COLORS.cream },
    { x: 8, y: 15, color: COLORS.cream },
    { x: 9, y: 15, color: COLORS.dark },
    { x: 5, y: 16, color: COLORS.dark },
    { x: 6, y: 16, color: COLORS.dark },
    { x: 7, y: 16, color: COLORS.dark },
    { x: 8, y: 16, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.2} viewBox="0 0 56 68" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// CHEF 4: "Billowing Toque" - Wide at top, tapers down (mushroom shape)
export function PixelLogoChef4({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // CHEF HAT - Billowing mushroom shape
    // Row 0: Extra wide top
    { x: 2, y: 0, color: COLORS.hatWhite },
    { x: 3, y: 0, color: COLORS.hatWhite },
    { x: 4, y: 0, color: COLORS.hatWhite },
    { x: 5, y: 0, color: COLORS.hatWhite },
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 8, y: 0, color: COLORS.hatWhite },
    { x: 9, y: 0, color: COLORS.hatWhite },
    { x: 10, y: 0, color: COLORS.hatWhite },
    { x: 11, y: 0, color: COLORS.hatWhite },
    // Row 1: Still wide
    { x: 2, y: 1, color: COLORS.hatWhite },
    { x: 3, y: 1, color: COLORS.hatWhite },
    { x: 4, y: 1, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 9, y: 1, color: COLORS.hatWhite },
    { x: 10, y: 1, color: COLORS.hatWhite },
    { x: 11, y: 1, color: COLORS.hatWhite },
    // Row 2: Taper begins
    { x: 3, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatWhite },
    { x: 10, y: 2, color: COLORS.hatWhite },
    // Rows 3-8: Pleats with taper
    { x: 3, y: 3, color: COLORS.hatWhite },
    { x: 4, y: 3, color: COLORS.hatShadow },
    { x: 5, y: 3, color: COLORS.hatWhite },
    { x: 6, y: 3, color: COLORS.hatShadow },
    { x: 7, y: 3, color: COLORS.hatWhite },
    { x: 8, y: 3, color: COLORS.hatShadow },
    { x: 9, y: 3, color: COLORS.hatWhite },
    { x: 10, y: 3, color: COLORS.hatShadow },
    { x: 3, y: 4, color: COLORS.hatWhite },
    { x: 4, y: 4, color: COLORS.hatShadow },
    { x: 5, y: 4, color: COLORS.hatWhite },
    { x: 6, y: 4, color: COLORS.hatShadow },
    { x: 7, y: 4, color: COLORS.hatWhite },
    { x: 8, y: 4, color: COLORS.hatShadow },
    { x: 9, y: 4, color: COLORS.hatWhite },
    { x: 10, y: 4, color: COLORS.hatShadow },
    { x: 4, y: 5, color: COLORS.hatWhite },
    { x: 5, y: 5, color: COLORS.hatShadow },
    { x: 6, y: 5, color: COLORS.hatWhite },
    { x: 7, y: 5, color: COLORS.hatShadow },
    { x: 8, y: 5, color: COLORS.hatWhite },
    { x: 9, y: 5, color: COLORS.hatShadow },
    { x: 4, y: 6, color: COLORS.hatWhite },
    { x: 5, y: 6, color: COLORS.hatShadow },
    { x: 6, y: 6, color: COLORS.hatWhite },
    { x: 7, y: 6, color: COLORS.hatShadow },
    { x: 8, y: 6, color: COLORS.hatWhite },
    { x: 9, y: 6, color: COLORS.hatShadow },
    { x: 4, y: 7, color: COLORS.hatWhite },
    { x: 5, y: 7, color: COLORS.hatShadow },
    { x: 6, y: 7, color: COLORS.hatWhite },
    { x: 7, y: 7, color: COLORS.hatShadow },
    { x: 8, y: 7, color: COLORS.hatWhite },
    { x: 9, y: 7, color: COLORS.hatShadow },
    { x: 4, y: 8, color: COLORS.hatWhite },
    { x: 5, y: 8, color: COLORS.hatWhite },
    { x: 6, y: 8, color: COLORS.hatWhite },
    { x: 7, y: 8, color: COLORS.hatWhite },
    { x: 8, y: 8, color: COLORS.hatWhite },
    { x: 9, y: 8, color: COLORS.hatWhite },
    // Row 9: Dark band
    { x: 4, y: 9, color: COLORS.dark },
    { x: 5, y: 9, color: COLORS.dark },
    { x: 6, y: 9, color: COLORS.dark },
    { x: 7, y: 9, color: COLORS.dark },
    { x: 8, y: 9, color: COLORS.dark },
    { x: 9, y: 9, color: COLORS.dark },

    // APRON - Minimal to emphasize hat
    // Neck
    { x: 6, y: 11, color: COLORS.dark },
    { x: 7, y: 11, color: COLORS.dark },

    // Small bib
    { x: 5, y: 12, color: COLORS.dark },
    { x: 6, y: 12, color: COLORS.cream },
    { x: 7, y: 12, color: COLORS.cream },
    { x: 8, y: 12, color: COLORS.dark },

    // WAIST TIES
    { x: 3, y: 13, color: COLORS.dark },
    { x: 4, y: 13, color: COLORS.dark },
    { x: 5, y: 13, color: COLORS.dark },
    { x: 6, y: 13, color: COLORS.cream },
    { x: 7, y: 13, color: COLORS.cream },
    { x: 8, y: 13, color: COLORS.dark },
    { x: 9, y: 13, color: COLORS.dark },
    { x: 10, y: 13, color: COLORS.dark },

    // Body
    { x: 5, y: 14, color: COLORS.dark },
    { x: 6, y: 14, color: COLORS.cream },
    { x: 7, y: 14, color: COLORS.cream },
    { x: 8, y: 14, color: COLORS.dark },
    // Pocket line
    { x: 5, y: 15, color: COLORS.dark },
    { x: 6, y: 15, color: COLORS.dark },
    { x: 7, y: 15, color: COLORS.dark },
    { x: 8, y: 15, color: COLORS.dark },
    // Bottom
    { x: 5, y: 16, color: COLORS.dark },
    { x: 6, y: 16, color: COLORS.cream },
    { x: 7, y: 16, color: COLORS.cream },
    { x: 8, y: 16, color: COLORS.dark },
    { x: 6, y: 17, color: COLORS.dark },
    { x: 7, y: 17, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.3} viewBox="0 0 56 72" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// CHEF 5: "Classic Chef" - Balanced design, most versatile
export function PixelLogoChef5({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // CHEF HAT - Classic balanced toque
    // Row 0: Rounded top
    { x: 5, y: 0, color: COLORS.hatWhite },
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 8, y: 0, color: COLORS.hatWhite },
    // Row 1: Wider
    { x: 4, y: 1, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 9, y: 1, color: COLORS.hatWhite },
    // Row 2: Full width
    { x: 3, y: 2, color: COLORS.hatWhite },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatWhite },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatWhite },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatWhite },
    { x: 10, y: 2, color: COLORS.hatWhite },
    // Rows 3-6: Traditional pleats
    { x: 3, y: 3, color: COLORS.hatWhite },
    { x: 4, y: 3, color: COLORS.hatShadow },
    { x: 5, y: 3, color: COLORS.hatWhite },
    { x: 6, y: 3, color: COLORS.hatShadow },
    { x: 7, y: 3, color: COLORS.hatWhite },
    { x: 8, y: 3, color: COLORS.hatShadow },
    { x: 9, y: 3, color: COLORS.hatWhite },
    { x: 10, y: 3, color: COLORS.hatShadow },
    { x: 3, y: 4, color: COLORS.hatWhite },
    { x: 4, y: 4, color: COLORS.hatShadow },
    { x: 5, y: 4, color: COLORS.hatWhite },
    { x: 6, y: 4, color: COLORS.hatShadow },
    { x: 7, y: 4, color: COLORS.hatWhite },
    { x: 8, y: 4, color: COLORS.hatShadow },
    { x: 9, y: 4, color: COLORS.hatWhite },
    { x: 10, y: 4, color: COLORS.hatShadow },
    { x: 3, y: 5, color: COLORS.hatWhite },
    { x: 4, y: 5, color: COLORS.hatShadow },
    { x: 5, y: 5, color: COLORS.hatWhite },
    { x: 6, y: 5, color: COLORS.hatShadow },
    { x: 7, y: 5, color: COLORS.hatWhite },
    { x: 8, y: 5, color: COLORS.hatShadow },
    { x: 9, y: 5, color: COLORS.hatWhite },
    { x: 10, y: 5, color: COLORS.hatShadow },
    { x: 3, y: 6, color: COLORS.hatWhite },
    { x: 4, y: 6, color: COLORS.hatShadow },
    { x: 5, y: 6, color: COLORS.hatWhite },
    { x: 6, y: 6, color: COLORS.hatShadow },
    { x: 7, y: 6, color: COLORS.hatWhite },
    { x: 8, y: 6, color: COLORS.hatShadow },
    { x: 9, y: 6, color: COLORS.hatWhite },
    { x: 10, y: 6, color: COLORS.hatShadow },
    // Row 7: Solid bottom
    { x: 3, y: 7, color: COLORS.hatWhite },
    { x: 4, y: 7, color: COLORS.hatWhite },
    { x: 5, y: 7, color: COLORS.hatWhite },
    { x: 6, y: 7, color: COLORS.hatWhite },
    { x: 7, y: 7, color: COLORS.hatWhite },
    { x: 8, y: 7, color: COLORS.hatWhite },
    { x: 9, y: 7, color: COLORS.hatWhite },
    { x: 10, y: 7, color: COLORS.hatWhite },
    // Row 8: Dark band
    { x: 3, y: 8, color: COLORS.dark },
    { x: 4, y: 8, color: COLORS.dark },
    { x: 5, y: 8, color: COLORS.dark },
    { x: 6, y: 8, color: COLORS.dark },
    { x: 7, y: 8, color: COLORS.dark },
    { x: 8, y: 8, color: COLORS.dark },
    { x: 9, y: 8, color: COLORS.dark },
    { x: 10, y: 8, color: COLORS.dark },

    // APRON - Full featured
    // Visible neck loop
    { x: 6, y: 10, color: COLORS.dark },
    { x: 7, y: 10, color: COLORS.dark },

    // Upper bib (narrow)
    { x: 5, y: 11, color: COLORS.dark },
    { x: 6, y: 11, color: COLORS.cream },
    { x: 7, y: 11, color: COLORS.cream },
    { x: 8, y: 11, color: COLORS.dark },

    // Body widens
    { x: 4, y: 12, color: COLORS.dark },
    { x: 5, y: 12, color: COLORS.cream },
    { x: 6, y: 12, color: COLORS.cream },
    { x: 7, y: 12, color: COLORS.cream },
    { x: 8, y: 12, color: COLORS.cream },
    { x: 9, y: 12, color: COLORS.dark },

    // WAIST TIES - Extending
    { x: 2, y: 13, color: COLORS.dark },
    { x: 3, y: 13, color: COLORS.dark },
    { x: 4, y: 13, color: COLORS.dark },
    { x: 5, y: 13, color: COLORS.cream },
    { x: 6, y: 13, color: COLORS.cream },
    { x: 7, y: 13, color: COLORS.cream },
    { x: 8, y: 13, color: COLORS.cream },
    { x: 9, y: 13, color: COLORS.dark },
    { x: 10, y: 13, color: COLORS.dark },
    { x: 11, y: 13, color: COLORS.dark },

    // Body continues
    { x: 4, y: 14, color: COLORS.dark },
    { x: 5, y: 14, color: COLORS.cream },
    { x: 6, y: 14, color: COLORS.cream },
    { x: 7, y: 14, color: COLORS.cream },
    { x: 8, y: 14, color: COLORS.cream },
    { x: 9, y: 14, color: COLORS.dark },

    // Clear pocket
    { x: 4, y: 15, color: COLORS.dark },
    { x: 5, y: 15, color: COLORS.cream },
    { x: 6, y: 15, color: COLORS.dark },
    { x: 7, y: 15, color: COLORS.dark },
    { x: 8, y: 15, color: COLORS.cream },
    { x: 9, y: 15, color: COLORS.dark },

    // Lower body
    { x: 4, y: 16, color: COLORS.dark },
    { x: 5, y: 16, color: COLORS.cream },
    { x: 6, y: 16, color: COLORS.cream },
    { x: 7, y: 16, color: COLORS.cream },
    { x: 8, y: 16, color: COLORS.cream },
    { x: 9, y: 16, color: COLORS.dark },

    // Tapered hem
    { x: 5, y: 17, color: COLORS.dark },
    { x: 6, y: 17, color: COLORS.dark },
    { x: 7, y: 17, color: COLORS.dark },
    { x: 8, y: 17, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.3} viewBox="0 0 56 72" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DETAILED APRON LOGOS - More intricate apron designs
// ─────────────────────────────────────────────────────────────────────────────

// CHEF 6: "Bistro Apron" - Large pocket with decorative stitching
export function PixelLogoChef6({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // CHEF HAT - Triple Crown style (most recognizable)
    { x: 3, y: 0, color: COLORS.hatWhite },
    { x: 4, y: 0, color: COLORS.hatWhite },
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 9, y: 0, color: COLORS.hatWhite },
    { x: 10, y: 0, color: COLORS.hatWhite },
    // Connected crown
    { x: 2, y: 1, color: COLORS.hatWhite },
    { x: 3, y: 1, color: COLORS.hatWhite },
    { x: 4, y: 1, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 9, y: 1, color: COLORS.hatWhite },
    { x: 10, y: 1, color: COLORS.hatWhite },
    { x: 11, y: 1, color: COLORS.hatWhite },
    // Pleated body
    { x: 2, y: 2, color: COLORS.hatWhite },
    { x: 3, y: 2, color: COLORS.hatShadow },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatShadow },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatShadow },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatShadow },
    { x: 10, y: 2, color: COLORS.hatWhite },
    { x: 11, y: 2, color: COLORS.hatShadow },
    { x: 2, y: 3, color: COLORS.hatWhite },
    { x: 3, y: 3, color: COLORS.hatShadow },
    { x: 4, y: 3, color: COLORS.hatWhite },
    { x: 5, y: 3, color: COLORS.hatShadow },
    { x: 6, y: 3, color: COLORS.hatWhite },
    { x: 7, y: 3, color: COLORS.hatShadow },
    { x: 8, y: 3, color: COLORS.hatWhite },
    { x: 9, y: 3, color: COLORS.hatShadow },
    { x: 10, y: 3, color: COLORS.hatWhite },
    { x: 11, y: 3, color: COLORS.hatShadow },
    { x: 2, y: 4, color: COLORS.hatWhite },
    { x: 3, y: 4, color: COLORS.hatShadow },
    { x: 4, y: 4, color: COLORS.hatWhite },
    { x: 5, y: 4, color: COLORS.hatShadow },
    { x: 6, y: 4, color: COLORS.hatWhite },
    { x: 7, y: 4, color: COLORS.hatShadow },
    { x: 8, y: 4, color: COLORS.hatWhite },
    { x: 9, y: 4, color: COLORS.hatShadow },
    { x: 10, y: 4, color: COLORS.hatWhite },
    { x: 11, y: 4, color: COLORS.hatShadow },
    { x: 2, y: 5, color: COLORS.hatWhite },
    { x: 3, y: 5, color: COLORS.hatShadow },
    { x: 4, y: 5, color: COLORS.hatWhite },
    { x: 5, y: 5, color: COLORS.hatShadow },
    { x: 6, y: 5, color: COLORS.hatWhite },
    { x: 7, y: 5, color: COLORS.hatShadow },
    { x: 8, y: 5, color: COLORS.hatWhite },
    { x: 9, y: 5, color: COLORS.hatShadow },
    { x: 10, y: 5, color: COLORS.hatWhite },
    { x: 11, y: 5, color: COLORS.hatShadow },
    // Solid bottom
    { x: 2, y: 6, color: COLORS.hatWhite },
    { x: 3, y: 6, color: COLORS.hatWhite },
    { x: 4, y: 6, color: COLORS.hatWhite },
    { x: 5, y: 6, color: COLORS.hatWhite },
    { x: 6, y: 6, color: COLORS.hatWhite },
    { x: 7, y: 6, color: COLORS.hatWhite },
    { x: 8, y: 6, color: COLORS.hatWhite },
    { x: 9, y: 6, color: COLORS.hatWhite },
    { x: 10, y: 6, color: COLORS.hatWhite },
    { x: 11, y: 6, color: COLORS.hatWhite },
    // Dark band
    { x: 2, y: 7, color: COLORS.dark },
    { x: 3, y: 7, color: COLORS.dark },
    { x: 4, y: 7, color: COLORS.dark },
    { x: 5, y: 7, color: COLORS.dark },
    { x: 6, y: 7, color: COLORS.dark },
    { x: 7, y: 7, color: COLORS.dark },
    { x: 8, y: 7, color: COLORS.dark },
    { x: 9, y: 7, color: COLORS.dark },
    { x: 10, y: 7, color: COLORS.dark },
    { x: 11, y: 7, color: COLORS.dark },

    // APRON - Bistro style with large kangaroo pocket
    // Neck loop
    { x: 6, y: 9, color: COLORS.dark },
    { x: 7, y: 9, color: COLORS.dark },
    // Shoulder straps
    { x: 4, y: 10, color: COLORS.dark },
    { x: 5, y: 10, color: COLORS.dark },
    { x: 8, y: 10, color: COLORS.dark },
    { x: 9, y: 10, color: COLORS.dark },
    // Bib with decorative border
    { x: 3, y: 11, color: COLORS.dark },
    { x: 4, y: 11, color: COLORS.cream },
    { x: 5, y: 11, color: COLORS.cream },
    { x: 6, y: 11, color: COLORS.cream },
    { x: 7, y: 11, color: COLORS.cream },
    { x: 8, y: 11, color: COLORS.cream },
    { x: 9, y: 11, color: COLORS.cream },
    { x: 10, y: 11, color: COLORS.dark },
    // Stitching line
    { x: 3, y: 12, color: COLORS.dark },
    { x: 4, y: 12, color: COLORS.cream },
    { x: 5, y: 12, color: COLORS.gray },
    { x: 6, y: 12, color: COLORS.cream },
    { x: 7, y: 12, color: COLORS.gray },
    { x: 8, y: 12, color: COLORS.cream },
    { x: 9, y: 12, color: COLORS.cream },
    { x: 10, y: 12, color: COLORS.dark },
    // WAIST TIES
    { x: 1, y: 13, color: COLORS.dark },
    { x: 2, y: 13, color: COLORS.dark },
    { x: 3, y: 13, color: COLORS.dark },
    { x: 4, y: 13, color: COLORS.cream },
    { x: 5, y: 13, color: COLORS.cream },
    { x: 6, y: 13, color: COLORS.cream },
    { x: 7, y: 13, color: COLORS.cream },
    { x: 8, y: 13, color: COLORS.cream },
    { x: 9, y: 13, color: COLORS.cream },
    { x: 10, y: 13, color: COLORS.dark },
    { x: 11, y: 13, color: COLORS.dark },
    { x: 12, y: 13, color: COLORS.dark },
    // Large kangaroo pocket top
    { x: 3, y: 14, color: COLORS.dark },
    { x: 4, y: 14, color: COLORS.dark },
    { x: 5, y: 14, color: COLORS.dark },
    { x: 6, y: 14, color: COLORS.dark },
    { x: 7, y: 14, color: COLORS.dark },
    { x: 8, y: 14, color: COLORS.dark },
    { x: 9, y: 14, color: COLORS.dark },
    { x: 10, y: 14, color: COLORS.dark },
    // Pocket interior
    { x: 3, y: 15, color: COLORS.dark },
    { x: 4, y: 15, color: COLORS.gray },
    { x: 5, y: 15, color: COLORS.gray },
    { x: 6, y: 15, color: COLORS.gray },
    { x: 7, y: 15, color: COLORS.gray },
    { x: 8, y: 15, color: COLORS.gray },
    { x: 9, y: 15, color: COLORS.gray },
    { x: 10, y: 15, color: COLORS.dark },
    { x: 3, y: 16, color: COLORS.dark },
    { x: 4, y: 16, color: COLORS.gray },
    { x: 5, y: 16, color: COLORS.gray },
    { x: 6, y: 16, color: COLORS.gray },
    { x: 7, y: 16, color: COLORS.gray },
    { x: 8, y: 16, color: COLORS.gray },
    { x: 9, y: 16, color: COLORS.gray },
    { x: 10, y: 16, color: COLORS.dark },
    // Lower body
    { x: 3, y: 17, color: COLORS.dark },
    { x: 4, y: 17, color: COLORS.cream },
    { x: 5, y: 17, color: COLORS.cream },
    { x: 6, y: 17, color: COLORS.cream },
    { x: 7, y: 17, color: COLORS.cream },
    { x: 8, y: 17, color: COLORS.cream },
    { x: 9, y: 17, color: COLORS.cream },
    { x: 10, y: 17, color: COLORS.dark },
    // Hem
    { x: 4, y: 18, color: COLORS.dark },
    { x: 5, y: 18, color: COLORS.dark },
    { x: 6, y: 18, color: COLORS.dark },
    { x: 7, y: 18, color: COLORS.dark },
    { x: 8, y: 18, color: COLORS.dark },
    { x: 9, y: 18, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.4} viewBox="0 0 56 76" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// CHEF 7: "Baker's Apron" - Cross-back straps with flour accents
export function PixelLogoChef7({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // CHEF HAT - Triple Crown
    { x: 3, y: 0, color: COLORS.hatWhite },
    { x: 4, y: 0, color: COLORS.hatWhite },
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 9, y: 0, color: COLORS.hatWhite },
    { x: 10, y: 0, color: COLORS.hatWhite },
    { x: 2, y: 1, color: COLORS.hatWhite },
    { x: 3, y: 1, color: COLORS.hatWhite },
    { x: 4, y: 1, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 9, y: 1, color: COLORS.hatWhite },
    { x: 10, y: 1, color: COLORS.hatWhite },
    { x: 11, y: 1, color: COLORS.hatWhite },
    // Pleats
    { x: 2, y: 2, color: COLORS.hatWhite },
    { x: 3, y: 2, color: COLORS.hatShadow },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatShadow },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatShadow },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatShadow },
    { x: 10, y: 2, color: COLORS.hatWhite },
    { x: 11, y: 2, color: COLORS.hatShadow },
    { x: 2, y: 3, color: COLORS.hatWhite },
    { x: 3, y: 3, color: COLORS.hatShadow },
    { x: 4, y: 3, color: COLORS.hatWhite },
    { x: 5, y: 3, color: COLORS.hatShadow },
    { x: 6, y: 3, color: COLORS.hatWhite },
    { x: 7, y: 3, color: COLORS.hatShadow },
    { x: 8, y: 3, color: COLORS.hatWhite },
    { x: 9, y: 3, color: COLORS.hatShadow },
    { x: 10, y: 3, color: COLORS.hatWhite },
    { x: 11, y: 3, color: COLORS.hatShadow },
    { x: 2, y: 4, color: COLORS.hatWhite },
    { x: 3, y: 4, color: COLORS.hatShadow },
    { x: 4, y: 4, color: COLORS.hatWhite },
    { x: 5, y: 4, color: COLORS.hatShadow },
    { x: 6, y: 4, color: COLORS.hatWhite },
    { x: 7, y: 4, color: COLORS.hatShadow },
    { x: 8, y: 4, color: COLORS.hatWhite },
    { x: 9, y: 4, color: COLORS.hatShadow },
    { x: 10, y: 4, color: COLORS.hatWhite },
    { x: 11, y: 4, color: COLORS.hatShadow },
    { x: 2, y: 5, color: COLORS.hatWhite },
    { x: 3, y: 5, color: COLORS.hatShadow },
    { x: 4, y: 5, color: COLORS.hatWhite },
    { x: 5, y: 5, color: COLORS.hatShadow },
    { x: 6, y: 5, color: COLORS.hatWhite },
    { x: 7, y: 5, color: COLORS.hatShadow },
    { x: 8, y: 5, color: COLORS.hatWhite },
    { x: 9, y: 5, color: COLORS.hatShadow },
    { x: 10, y: 5, color: COLORS.hatWhite },
    { x: 11, y: 5, color: COLORS.hatShadow },
    // Solid bottom + band
    { x: 2, y: 6, color: COLORS.hatWhite },
    { x: 3, y: 6, color: COLORS.hatWhite },
    { x: 4, y: 6, color: COLORS.hatWhite },
    { x: 5, y: 6, color: COLORS.hatWhite },
    { x: 6, y: 6, color: COLORS.hatWhite },
    { x: 7, y: 6, color: COLORS.hatWhite },
    { x: 8, y: 6, color: COLORS.hatWhite },
    { x: 9, y: 6, color: COLORS.hatWhite },
    { x: 10, y: 6, color: COLORS.hatWhite },
    { x: 11, y: 6, color: COLORS.hatWhite },
    { x: 2, y: 7, color: COLORS.dark },
    { x: 3, y: 7, color: COLORS.dark },
    { x: 4, y: 7, color: COLORS.dark },
    { x: 5, y: 7, color: COLORS.dark },
    { x: 6, y: 7, color: COLORS.dark },
    { x: 7, y: 7, color: COLORS.dark },
    { x: 8, y: 7, color: COLORS.dark },
    { x: 9, y: 7, color: COLORS.dark },
    { x: 10, y: 7, color: COLORS.dark },
    { x: 11, y: 7, color: COLORS.dark },

    // APRON - Cross-back straps
    // Cross straps at back
    { x: 4, y: 9, color: COLORS.dark },
    { x: 9, y: 9, color: COLORS.dark },
    { x: 5, y: 10, color: COLORS.dark },
    { x: 8, y: 10, color: COLORS.dark },
    { x: 6, y: 10, color: COLORS.dark },
    { x: 7, y: 10, color: COLORS.dark },
    // Wide bib
    { x: 3, y: 11, color: COLORS.dark },
    { x: 4, y: 11, color: COLORS.cream },
    { x: 5, y: 11, color: COLORS.cream },
    { x: 6, y: 11, color: COLORS.cream },
    { x: 7, y: 11, color: COLORS.cream },
    { x: 8, y: 11, color: COLORS.cream },
    { x: 9, y: 11, color: COLORS.cream },
    { x: 10, y: 11, color: COLORS.dark },
    // Flour dust accents
    { x: 3, y: 12, color: COLORS.dark },
    { x: 4, y: 12, color: COLORS.cream },
    { x: 5, y: 12, color: COLORS.hatWhite },
    { x: 6, y: 12, color: COLORS.cream },
    { x: 7, y: 12, color: COLORS.cream },
    { x: 8, y: 12, color: COLORS.hatWhite },
    { x: 9, y: 12, color: COLORS.cream },
    { x: 10, y: 12, color: COLORS.dark },
    // Waist ties (wide)
    { x: 0, y: 13, color: COLORS.dark },
    { x: 1, y: 13, color: COLORS.dark },
    { x: 2, y: 13, color: COLORS.dark },
    { x: 3, y: 13, color: COLORS.dark },
    { x: 4, y: 13, color: COLORS.cream },
    { x: 5, y: 13, color: COLORS.cream },
    { x: 6, y: 13, color: COLORS.cream },
    { x: 7, y: 13, color: COLORS.cream },
    { x: 8, y: 13, color: COLORS.cream },
    { x: 9, y: 13, color: COLORS.cream },
    { x: 10, y: 13, color: COLORS.dark },
    { x: 11, y: 13, color: COLORS.dark },
    { x: 12, y: 13, color: COLORS.dark },
    { x: 13, y: 13, color: COLORS.dark },
    // Double pocket
    { x: 3, y: 14, color: COLORS.dark },
    { x: 4, y: 14, color: COLORS.cream },
    { x: 5, y: 14, color: COLORS.cream },
    { x: 6, y: 14, color: COLORS.dark },
    { x: 7, y: 14, color: COLORS.dark },
    { x: 8, y: 14, color: COLORS.cream },
    { x: 9, y: 14, color: COLORS.cream },
    { x: 10, y: 14, color: COLORS.dark },
    // Pocket interiors
    { x: 3, y: 15, color: COLORS.dark },
    { x: 4, y: 15, color: COLORS.gray },
    { x: 5, y: 15, color: COLORS.gray },
    { x: 6, y: 15, color: COLORS.dark },
    { x: 7, y: 15, color: COLORS.dark },
    { x: 8, y: 15, color: COLORS.gray },
    { x: 9, y: 15, color: COLORS.gray },
    { x: 10, y: 15, color: COLORS.dark },
    // Lower body with flour
    { x: 3, y: 16, color: COLORS.dark },
    { x: 4, y: 16, color: COLORS.cream },
    { x: 5, y: 16, color: COLORS.cream },
    { x: 6, y: 16, color: COLORS.hatWhite },
    { x: 7, y: 16, color: COLORS.cream },
    { x: 8, y: 16, color: COLORS.cream },
    { x: 9, y: 16, color: COLORS.cream },
    { x: 10, y: 16, color: COLORS.dark },
    { x: 3, y: 17, color: COLORS.dark },
    { x: 4, y: 17, color: COLORS.cream },
    { x: 5, y: 17, color: COLORS.cream },
    { x: 6, y: 17, color: COLORS.cream },
    { x: 7, y: 17, color: COLORS.cream },
    { x: 8, y: 17, color: COLORS.hatWhite },
    { x: 9, y: 17, color: COLORS.cream },
    { x: 10, y: 17, color: COLORS.dark },
    // Hem
    { x: 4, y: 18, color: COLORS.dark },
    { x: 5, y: 18, color: COLORS.dark },
    { x: 6, y: 18, color: COLORS.dark },
    { x: 7, y: 18, color: COLORS.dark },
    { x: 8, y: 18, color: COLORS.dark },
    { x: 9, y: 18, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.4} viewBox="0 0 56 76" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// CHEF 8: "Butcher's Apron" - Long with tool loops
export function PixelLogoChef8({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // CHEF HAT - Triple Crown
    { x: 3, y: 0, color: COLORS.hatWhite },
    { x: 4, y: 0, color: COLORS.hatWhite },
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 9, y: 0, color: COLORS.hatWhite },
    { x: 10, y: 0, color: COLORS.hatWhite },
    { x: 2, y: 1, color: COLORS.hatWhite },
    { x: 3, y: 1, color: COLORS.hatWhite },
    { x: 4, y: 1, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 9, y: 1, color: COLORS.hatWhite },
    { x: 10, y: 1, color: COLORS.hatWhite },
    { x: 11, y: 1, color: COLORS.hatWhite },
    // Pleats
    { x: 2, y: 2, color: COLORS.hatWhite },
    { x: 3, y: 2, color: COLORS.hatShadow },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatShadow },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatShadow },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatShadow },
    { x: 10, y: 2, color: COLORS.hatWhite },
    { x: 11, y: 2, color: COLORS.hatShadow },
    { x: 2, y: 3, color: COLORS.hatWhite },
    { x: 3, y: 3, color: COLORS.hatShadow },
    { x: 4, y: 3, color: COLORS.hatWhite },
    { x: 5, y: 3, color: COLORS.hatShadow },
    { x: 6, y: 3, color: COLORS.hatWhite },
    { x: 7, y: 3, color: COLORS.hatShadow },
    { x: 8, y: 3, color: COLORS.hatWhite },
    { x: 9, y: 3, color: COLORS.hatShadow },
    { x: 10, y: 3, color: COLORS.hatWhite },
    { x: 11, y: 3, color: COLORS.hatShadow },
    { x: 2, y: 4, color: COLORS.hatWhite },
    { x: 3, y: 4, color: COLORS.hatShadow },
    { x: 4, y: 4, color: COLORS.hatWhite },
    { x: 5, y: 4, color: COLORS.hatShadow },
    { x: 6, y: 4, color: COLORS.hatWhite },
    { x: 7, y: 4, color: COLORS.hatShadow },
    { x: 8, y: 4, color: COLORS.hatWhite },
    { x: 9, y: 4, color: COLORS.hatShadow },
    { x: 10, y: 4, color: COLORS.hatWhite },
    { x: 11, y: 4, color: COLORS.hatShadow },
    { x: 2, y: 5, color: COLORS.hatWhite },
    { x: 3, y: 5, color: COLORS.hatShadow },
    { x: 4, y: 5, color: COLORS.hatWhite },
    { x: 5, y: 5, color: COLORS.hatShadow },
    { x: 6, y: 5, color: COLORS.hatWhite },
    { x: 7, y: 5, color: COLORS.hatShadow },
    { x: 8, y: 5, color: COLORS.hatWhite },
    { x: 9, y: 5, color: COLORS.hatShadow },
    { x: 10, y: 5, color: COLORS.hatWhite },
    { x: 11, y: 5, color: COLORS.hatShadow },
    // Solid bottom + band
    { x: 2, y: 6, color: COLORS.hatWhite },
    { x: 3, y: 6, color: COLORS.hatWhite },
    { x: 4, y: 6, color: COLORS.hatWhite },
    { x: 5, y: 6, color: COLORS.hatWhite },
    { x: 6, y: 6, color: COLORS.hatWhite },
    { x: 7, y: 6, color: COLORS.hatWhite },
    { x: 8, y: 6, color: COLORS.hatWhite },
    { x: 9, y: 6, color: COLORS.hatWhite },
    { x: 10, y: 6, color: COLORS.hatWhite },
    { x: 11, y: 6, color: COLORS.hatWhite },
    { x: 2, y: 7, color: COLORS.dark },
    { x: 3, y: 7, color: COLORS.dark },
    { x: 4, y: 7, color: COLORS.dark },
    { x: 5, y: 7, color: COLORS.dark },
    { x: 6, y: 7, color: COLORS.dark },
    { x: 7, y: 7, color: COLORS.dark },
    { x: 8, y: 7, color: COLORS.dark },
    { x: 9, y: 7, color: COLORS.dark },
    { x: 10, y: 7, color: COLORS.dark },
    { x: 11, y: 7, color: COLORS.dark },

    // APRON - Butcher style (long)
    // Neck loop
    { x: 6, y: 9, color: COLORS.dark },
    { x: 7, y: 9, color: COLORS.dark },
    // Straps
    { x: 5, y: 10, color: COLORS.dark },
    { x: 8, y: 10, color: COLORS.dark },
    // Wide bib
    { x: 3, y: 11, color: COLORS.dark },
    { x: 4, y: 11, color: COLORS.cream },
    { x: 5, y: 11, color: COLORS.cream },
    { x: 6, y: 11, color: COLORS.cream },
    { x: 7, y: 11, color: COLORS.cream },
    { x: 8, y: 11, color: COLORS.cream },
    { x: 9, y: 11, color: COLORS.cream },
    { x: 10, y: 11, color: COLORS.dark },
    { x: 3, y: 12, color: COLORS.dark },
    { x: 4, y: 12, color: COLORS.cream },
    { x: 5, y: 12, color: COLORS.cream },
    { x: 6, y: 12, color: COLORS.cream },
    { x: 7, y: 12, color: COLORS.cream },
    { x: 8, y: 12, color: COLORS.cream },
    { x: 9, y: 12, color: COLORS.cream },
    { x: 10, y: 12, color: COLORS.dark },
    // Waist ties
    { x: 1, y: 13, color: COLORS.dark },
    { x: 2, y: 13, color: COLORS.dark },
    { x: 3, y: 13, color: COLORS.dark },
    { x: 4, y: 13, color: COLORS.cream },
    { x: 5, y: 13, color: COLORS.cream },
    { x: 6, y: 13, color: COLORS.cream },
    { x: 7, y: 13, color: COLORS.cream },
    { x: 8, y: 13, color: COLORS.cream },
    { x: 9, y: 13, color: COLORS.cream },
    { x: 10, y: 13, color: COLORS.dark },
    { x: 11, y: 13, color: COLORS.dark },
    { x: 12, y: 13, color: COLORS.dark },
    // Tool loops
    { x: 3, y: 14, color: COLORS.dark },
    { x: 4, y: 14, color: COLORS.cream },
    { x: 5, y: 14, color: COLORS.dark },
    { x: 6, y: 14, color: COLORS.cream },
    { x: 7, y: 14, color: COLORS.dark },
    { x: 8, y: 14, color: COLORS.cream },
    { x: 9, y: 14, color: COLORS.dark },
    { x: 10, y: 14, color: COLORS.dark },
    // Long body (extra rows for butcher style)
    { x: 3, y: 15, color: COLORS.dark },
    { x: 4, y: 15, color: COLORS.cream },
    { x: 5, y: 15, color: COLORS.cream },
    { x: 6, y: 15, color: COLORS.cream },
    { x: 7, y: 15, color: COLORS.cream },
    { x: 8, y: 15, color: COLORS.cream },
    { x: 9, y: 15, color: COLORS.cream },
    { x: 10, y: 15, color: COLORS.dark },
    { x: 3, y: 16, color: COLORS.dark },
    { x: 4, y: 16, color: COLORS.cream },
    { x: 5, y: 16, color: COLORS.cream },
    { x: 6, y: 16, color: COLORS.cream },
    { x: 7, y: 16, color: COLORS.cream },
    { x: 8, y: 16, color: COLORS.cream },
    { x: 9, y: 16, color: COLORS.cream },
    { x: 10, y: 16, color: COLORS.dark },
    { x: 3, y: 17, color: COLORS.dark },
    { x: 4, y: 17, color: COLORS.cream },
    { x: 5, y: 17, color: COLORS.cream },
    { x: 6, y: 17, color: COLORS.cream },
    { x: 7, y: 17, color: COLORS.cream },
    { x: 8, y: 17, color: COLORS.cream },
    { x: 9, y: 17, color: COLORS.cream },
    { x: 10, y: 17, color: COLORS.dark },
    { x: 3, y: 18, color: COLORS.dark },
    { x: 4, y: 18, color: COLORS.cream },
    { x: 5, y: 18, color: COLORS.cream },
    { x: 6, y: 18, color: COLORS.cream },
    { x: 7, y: 18, color: COLORS.cream },
    { x: 8, y: 18, color: COLORS.cream },
    { x: 9, y: 18, color: COLORS.cream },
    { x: 10, y: 18, color: COLORS.dark },
    // Hem
    { x: 4, y: 19, color: COLORS.dark },
    { x: 5, y: 19, color: COLORS.dark },
    { x: 6, y: 19, color: COLORS.dark },
    { x: 7, y: 19, color: COLORS.dark },
    { x: 8, y: 19, color: COLORS.dark },
    { x: 9, y: 19, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.5} viewBox="0 0 56 80" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// CHEF 9: "French Apron" - Elegant with decorative trim border
export function PixelLogoChef9({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const TRIM = '#F97316'; // Orange accent trim
  const pixels: { x: number; y: number; color: string }[] = [
    // CHEF HAT - Triple Crown
    { x: 3, y: 0, color: COLORS.hatWhite },
    { x: 4, y: 0, color: COLORS.hatWhite },
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 9, y: 0, color: COLORS.hatWhite },
    { x: 10, y: 0, color: COLORS.hatWhite },
    { x: 2, y: 1, color: COLORS.hatWhite },
    { x: 3, y: 1, color: COLORS.hatWhite },
    { x: 4, y: 1, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 9, y: 1, color: COLORS.hatWhite },
    { x: 10, y: 1, color: COLORS.hatWhite },
    { x: 11, y: 1, color: COLORS.hatWhite },
    // Pleats
    { x: 2, y: 2, color: COLORS.hatWhite },
    { x: 3, y: 2, color: COLORS.hatShadow },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatShadow },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatShadow },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatShadow },
    { x: 10, y: 2, color: COLORS.hatWhite },
    { x: 11, y: 2, color: COLORS.hatShadow },
    { x: 2, y: 3, color: COLORS.hatWhite },
    { x: 3, y: 3, color: COLORS.hatShadow },
    { x: 4, y: 3, color: COLORS.hatWhite },
    { x: 5, y: 3, color: COLORS.hatShadow },
    { x: 6, y: 3, color: COLORS.hatWhite },
    { x: 7, y: 3, color: COLORS.hatShadow },
    { x: 8, y: 3, color: COLORS.hatWhite },
    { x: 9, y: 3, color: COLORS.hatShadow },
    { x: 10, y: 3, color: COLORS.hatWhite },
    { x: 11, y: 3, color: COLORS.hatShadow },
    { x: 2, y: 4, color: COLORS.hatWhite },
    { x: 3, y: 4, color: COLORS.hatShadow },
    { x: 4, y: 4, color: COLORS.hatWhite },
    { x: 5, y: 4, color: COLORS.hatShadow },
    { x: 6, y: 4, color: COLORS.hatWhite },
    { x: 7, y: 4, color: COLORS.hatShadow },
    { x: 8, y: 4, color: COLORS.hatWhite },
    { x: 9, y: 4, color: COLORS.hatShadow },
    { x: 10, y: 4, color: COLORS.hatWhite },
    { x: 11, y: 4, color: COLORS.hatShadow },
    { x: 2, y: 5, color: COLORS.hatWhite },
    { x: 3, y: 5, color: COLORS.hatShadow },
    { x: 4, y: 5, color: COLORS.hatWhite },
    { x: 5, y: 5, color: COLORS.hatShadow },
    { x: 6, y: 5, color: COLORS.hatWhite },
    { x: 7, y: 5, color: COLORS.hatShadow },
    { x: 8, y: 5, color: COLORS.hatWhite },
    { x: 9, y: 5, color: COLORS.hatShadow },
    { x: 10, y: 5, color: COLORS.hatWhite },
    { x: 11, y: 5, color: COLORS.hatShadow },
    // Solid + band
    { x: 2, y: 6, color: COLORS.hatWhite },
    { x: 3, y: 6, color: COLORS.hatWhite },
    { x: 4, y: 6, color: COLORS.hatWhite },
    { x: 5, y: 6, color: COLORS.hatWhite },
    { x: 6, y: 6, color: COLORS.hatWhite },
    { x: 7, y: 6, color: COLORS.hatWhite },
    { x: 8, y: 6, color: COLORS.hatWhite },
    { x: 9, y: 6, color: COLORS.hatWhite },
    { x: 10, y: 6, color: COLORS.hatWhite },
    { x: 11, y: 6, color: COLORS.hatWhite },
    { x: 2, y: 7, color: COLORS.dark },
    { x: 3, y: 7, color: COLORS.dark },
    { x: 4, y: 7, color: COLORS.dark },
    { x: 5, y: 7, color: COLORS.dark },
    { x: 6, y: 7, color: COLORS.dark },
    { x: 7, y: 7, color: COLORS.dark },
    { x: 8, y: 7, color: COLORS.dark },
    { x: 9, y: 7, color: COLORS.dark },
    { x: 10, y: 7, color: COLORS.dark },
    { x: 11, y: 7, color: COLORS.dark },

    // APRON - French style with orange trim
    // Neck
    { x: 6, y: 9, color: COLORS.dark },
    { x: 7, y: 9, color: COLORS.dark },
    // Straps
    { x: 5, y: 10, color: COLORS.dark },
    { x: 8, y: 10, color: COLORS.dark },
    // Bib with orange trim
    { x: 3, y: 11, color: TRIM },
    { x: 4, y: 11, color: COLORS.cream },
    { x: 5, y: 11, color: COLORS.cream },
    { x: 6, y: 11, color: COLORS.cream },
    { x: 7, y: 11, color: COLORS.cream },
    { x: 8, y: 11, color: COLORS.cream },
    { x: 9, y: 11, color: COLORS.cream },
    { x: 10, y: 11, color: TRIM },
    { x: 3, y: 12, color: TRIM },
    { x: 4, y: 12, color: COLORS.cream },
    { x: 5, y: 12, color: COLORS.cream },
    { x: 6, y: 12, color: COLORS.cream },
    { x: 7, y: 12, color: COLORS.cream },
    { x: 8, y: 12, color: COLORS.cream },
    { x: 9, y: 12, color: COLORS.cream },
    { x: 10, y: 12, color: TRIM },
    // Waist ties
    { x: 1, y: 13, color: COLORS.dark },
    { x: 2, y: 13, color: COLORS.dark },
    { x: 3, y: 13, color: TRIM },
    { x: 4, y: 13, color: COLORS.cream },
    { x: 5, y: 13, color: COLORS.cream },
    { x: 6, y: 13, color: COLORS.cream },
    { x: 7, y: 13, color: COLORS.cream },
    { x: 8, y: 13, color: COLORS.cream },
    { x: 9, y: 13, color: COLORS.cream },
    { x: 10, y: 13, color: TRIM },
    { x: 11, y: 13, color: COLORS.dark },
    { x: 12, y: 13, color: COLORS.dark },
    // Body with trim
    { x: 3, y: 14, color: TRIM },
    { x: 4, y: 14, color: COLORS.cream },
    { x: 5, y: 14, color: COLORS.cream },
    { x: 6, y: 14, color: COLORS.cream },
    { x: 7, y: 14, color: COLORS.cream },
    { x: 8, y: 14, color: COLORS.cream },
    { x: 9, y: 14, color: COLORS.cream },
    { x: 10, y: 14, color: TRIM },
    // Elegant pocket
    { x: 3, y: 15, color: TRIM },
    { x: 4, y: 15, color: COLORS.cream },
    { x: 5, y: 15, color: TRIM },
    { x: 6, y: 15, color: TRIM },
    { x: 7, y: 15, color: TRIM },
    { x: 8, y: 15, color: TRIM },
    { x: 9, y: 15, color: COLORS.cream },
    { x: 10, y: 15, color: TRIM },
    { x: 3, y: 16, color: TRIM },
    { x: 4, y: 16, color: COLORS.cream },
    { x: 5, y: 16, color: COLORS.gray },
    { x: 6, y: 16, color: COLORS.gray },
    { x: 7, y: 16, color: COLORS.gray },
    { x: 8, y: 16, color: COLORS.gray },
    { x: 9, y: 16, color: COLORS.cream },
    { x: 10, y: 16, color: TRIM },
    // Lower body
    { x: 3, y: 17, color: TRIM },
    { x: 4, y: 17, color: COLORS.cream },
    { x: 5, y: 17, color: COLORS.cream },
    { x: 6, y: 17, color: COLORS.cream },
    { x: 7, y: 17, color: COLORS.cream },
    { x: 8, y: 17, color: COLORS.cream },
    { x: 9, y: 17, color: COLORS.cream },
    { x: 10, y: 17, color: TRIM },
    // Hem with trim
    { x: 4, y: 18, color: TRIM },
    { x: 5, y: 18, color: TRIM },
    { x: 6, y: 18, color: TRIM },
    { x: 7, y: 18, color: TRIM },
    { x: 8, y: 18, color: TRIM },
    { x: 9, y: 18, color: TRIM },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.4} viewBox="0 0 56 76" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
    </div>
  );
}

// CHEF 10: "Japanese Apron" - Wide ties forming decorative bow
export function PixelLogoChef10({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const pixels: { x: number; y: number; color: string }[] = [
    // CHEF HAT - Triple Crown
    { x: 3, y: 0, color: COLORS.hatWhite },
    { x: 4, y: 0, color: COLORS.hatWhite },
    { x: 6, y: 0, color: COLORS.hatWhite },
    { x: 7, y: 0, color: COLORS.hatWhite },
    { x: 9, y: 0, color: COLORS.hatWhite },
    { x: 10, y: 0, color: COLORS.hatWhite },
    { x: 2, y: 1, color: COLORS.hatWhite },
    { x: 3, y: 1, color: COLORS.hatWhite },
    { x: 4, y: 1, color: COLORS.hatWhite },
    { x: 5, y: 1, color: COLORS.hatWhite },
    { x: 6, y: 1, color: COLORS.hatWhite },
    { x: 7, y: 1, color: COLORS.hatWhite },
    { x: 8, y: 1, color: COLORS.hatWhite },
    { x: 9, y: 1, color: COLORS.hatWhite },
    { x: 10, y: 1, color: COLORS.hatWhite },
    { x: 11, y: 1, color: COLORS.hatWhite },
    // Pleats
    { x: 2, y: 2, color: COLORS.hatWhite },
    { x: 3, y: 2, color: COLORS.hatShadow },
    { x: 4, y: 2, color: COLORS.hatWhite },
    { x: 5, y: 2, color: COLORS.hatShadow },
    { x: 6, y: 2, color: COLORS.hatWhite },
    { x: 7, y: 2, color: COLORS.hatShadow },
    { x: 8, y: 2, color: COLORS.hatWhite },
    { x: 9, y: 2, color: COLORS.hatShadow },
    { x: 10, y: 2, color: COLORS.hatWhite },
    { x: 11, y: 2, color: COLORS.hatShadow },
    { x: 2, y: 3, color: COLORS.hatWhite },
    { x: 3, y: 3, color: COLORS.hatShadow },
    { x: 4, y: 3, color: COLORS.hatWhite },
    { x: 5, y: 3, color: COLORS.hatShadow },
    { x: 6, y: 3, color: COLORS.hatWhite },
    { x: 7, y: 3, color: COLORS.hatShadow },
    { x: 8, y: 3, color: COLORS.hatWhite },
    { x: 9, y: 3, color: COLORS.hatShadow },
    { x: 10, y: 3, color: COLORS.hatWhite },
    { x: 11, y: 3, color: COLORS.hatShadow },
    { x: 2, y: 4, color: COLORS.hatWhite },
    { x: 3, y: 4, color: COLORS.hatShadow },
    { x: 4, y: 4, color: COLORS.hatWhite },
    { x: 5, y: 4, color: COLORS.hatShadow },
    { x: 6, y: 4, color: COLORS.hatWhite },
    { x: 7, y: 4, color: COLORS.hatShadow },
    { x: 8, y: 4, color: COLORS.hatWhite },
    { x: 9, y: 4, color: COLORS.hatShadow },
    { x: 10, y: 4, color: COLORS.hatWhite },
    { x: 11, y: 4, color: COLORS.hatShadow },
    { x: 2, y: 5, color: COLORS.hatWhite },
    { x: 3, y: 5, color: COLORS.hatShadow },
    { x: 4, y: 5, color: COLORS.hatWhite },
    { x: 5, y: 5, color: COLORS.hatShadow },
    { x: 6, y: 5, color: COLORS.hatWhite },
    { x: 7, y: 5, color: COLORS.hatShadow },
    { x: 8, y: 5, color: COLORS.hatWhite },
    { x: 9, y: 5, color: COLORS.hatShadow },
    { x: 10, y: 5, color: COLORS.hatWhite },
    { x: 11, y: 5, color: COLORS.hatShadow },
    // Solid + band
    { x: 2, y: 6, color: COLORS.hatWhite },
    { x: 3, y: 6, color: COLORS.hatWhite },
    { x: 4, y: 6, color: COLORS.hatWhite },
    { x: 5, y: 6, color: COLORS.hatWhite },
    { x: 6, y: 6, color: COLORS.hatWhite },
    { x: 7, y: 6, color: COLORS.hatWhite },
    { x: 8, y: 6, color: COLORS.hatWhite },
    { x: 9, y: 6, color: COLORS.hatWhite },
    { x: 10, y: 6, color: COLORS.hatWhite },
    { x: 11, y: 6, color: COLORS.hatWhite },
    { x: 2, y: 7, color: COLORS.dark },
    { x: 3, y: 7, color: COLORS.dark },
    { x: 4, y: 7, color: COLORS.dark },
    { x: 5, y: 7, color: COLORS.dark },
    { x: 6, y: 7, color: COLORS.dark },
    { x: 7, y: 7, color: COLORS.dark },
    { x: 8, y: 7, color: COLORS.dark },
    { x: 9, y: 7, color: COLORS.dark },
    { x: 10, y: 7, color: COLORS.dark },
    { x: 11, y: 7, color: COLORS.dark },

    // APRON - Japanese style with wide bow ties
    // Neck
    { x: 6, y: 9, color: COLORS.dark },
    { x: 7, y: 9, color: COLORS.dark },
    // Straps
    { x: 5, y: 10, color: COLORS.dark },
    { x: 8, y: 10, color: COLORS.dark },
    // Minimal bib
    { x: 4, y: 11, color: COLORS.dark },
    { x: 5, y: 11, color: COLORS.cream },
    { x: 6, y: 11, color: COLORS.cream },
    { x: 7, y: 11, color: COLORS.cream },
    { x: 8, y: 11, color: COLORS.cream },
    { x: 9, y: 11, color: COLORS.dark },
    { x: 4, y: 12, color: COLORS.dark },
    { x: 5, y: 12, color: COLORS.cream },
    { x: 6, y: 12, color: COLORS.cream },
    { x: 7, y: 12, color: COLORS.cream },
    { x: 8, y: 12, color: COLORS.cream },
    { x: 9, y: 12, color: COLORS.dark },
    // WIDE BOW TIES - decorative knot
    { x: 0, y: 13, color: COLORS.dark },
    { x: 1, y: 13, color: COLORS.cream },
    { x: 2, y: 13, color: COLORS.cream },
    { x: 3, y: 13, color: COLORS.dark },
    { x: 4, y: 13, color: COLORS.dark },
    { x: 5, y: 13, color: COLORS.cream },
    { x: 6, y: 13, color: COLORS.dark },
    { x: 7, y: 13, color: COLORS.dark },
    { x: 8, y: 13, color: COLORS.cream },
    { x: 9, y: 13, color: COLORS.dark },
    { x: 10, y: 13, color: COLORS.dark },
    { x: 11, y: 13, color: COLORS.cream },
    { x: 12, y: 13, color: COLORS.cream },
    { x: 13, y: 13, color: COLORS.dark },
    // Bow loops
    { x: 0, y: 14, color: COLORS.dark },
    { x: 1, y: 14, color: COLORS.cream },
    { x: 2, y: 14, color: COLORS.dark },
    { x: 4, y: 14, color: COLORS.dark },
    { x: 5, y: 14, color: COLORS.cream },
    { x: 6, y: 14, color: COLORS.cream },
    { x: 7, y: 14, color: COLORS.cream },
    { x: 8, y: 14, color: COLORS.cream },
    { x: 9, y: 14, color: COLORS.dark },
    { x: 11, y: 14, color: COLORS.dark },
    { x: 12, y: 14, color: COLORS.cream },
    { x: 13, y: 14, color: COLORS.dark },
    // Vertical pocket slot
    { x: 4, y: 15, color: COLORS.dark },
    { x: 5, y: 15, color: COLORS.cream },
    { x: 6, y: 15, color: COLORS.cream },
    { x: 7, y: 15, color: COLORS.cream },
    { x: 8, y: 15, color: COLORS.cream },
    { x: 9, y: 15, color: COLORS.dark },
    // Vertical pocket (Japanese style - single slot)
    { x: 4, y: 16, color: COLORS.dark },
    { x: 5, y: 16, color: COLORS.cream },
    { x: 6, y: 16, color: COLORS.dark },
    { x: 7, y: 16, color: COLORS.dark },
    { x: 8, y: 16, color: COLORS.cream },
    { x: 9, y: 16, color: COLORS.dark },
    { x: 4, y: 17, color: COLORS.dark },
    { x: 5, y: 17, color: COLORS.cream },
    { x: 6, y: 17, color: COLORS.gray },
    { x: 7, y: 17, color: COLORS.gray },
    { x: 8, y: 17, color: COLORS.cream },
    { x: 9, y: 17, color: COLORS.dark },
    // Hem
    { x: 5, y: 18, color: COLORS.dark },
    { x: 6, y: 18, color: COLORS.dark },
    { x: 7, y: 18, color: COLORS.dark },
    { x: 8, y: 18, color: COLORS.dark },
  ];

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={size} height={size * 1.4} viewBox="0 0 56 76" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
        {pixels.map((p, i) => <Pixel key={i} x={p.x} y={p.y} color={p.color} />)}
      </svg>
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
      <svg width="100" height="100" viewBox="0 0 100 100" className={cn('pixel-art opacity-20', className)}>
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
      <svg width="40" height="40" viewBox="0 0 40 40" className={cn('pixel-art', className)}>
        <rect x="0" y="0" width="8" height="8" fill="currentColor" />
        <rect x="0" y="12" width="4" height="4" fill="currentColor" />
        <rect x="12" y="0" width="4" height="4" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg width="100" height="8" viewBox="0 0 100 8" className={cn('pixel-art', className)}>
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
    <svg width={size} height={size * 0.85} viewBox="0 0 56 48" className="pixel-art" style={{ imageRendering: 'pixelated' }}>
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
