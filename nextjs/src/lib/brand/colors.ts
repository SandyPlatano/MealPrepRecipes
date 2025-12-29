/**
 * Brand Color Constants - Single Source of Truth
 *
 * BWFD "Pale Lilac" Brand Identity for "Babe, What's for Dinner?"
 *
 * Palette:
 * - Ivory (#FFFCF9) - Primary background
 * - Pale Lilac (#DDC3E0) - Primary accent
 * - Chestnut (#7D4A5A) - Illustrations only
 * - Black (#000000) - Text, buttons, UI
 *
 * Use these constants in:
 * - Email templates (hex values)
 * - Dynamic OG images (hex/rgb values)
 * - TypeScript validation
 * - Documentation generation
 *
 * CSS variables in globals.css should stay in sync.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// CORE BRAND COLORS - PALE LILAC
// ═══════════════════════════════════════════════════════════════════════════════

export const BRAND_COLORS = {
  /**
   * Primary Accent - Pale Lilac
   * Used for: Secondary buttons, highlights, accent areas
   * Psychology: Warmth, creativity, elegance
   */
  paleLilac: {
    name: "Pale Lilac",
    hex: "#DDC3E0",
    hsl: "296 32% 82%",
    rgb: "221, 195, 224",
    rgbArray: [221, 195, 224] as const,
  },

  /**
   * Pale Lilac Light - Hover states
   */
  paleLilacLight: {
    name: "Pale Lilac Light",
    hex: "#EBD9ED",
    hsl: "296 32% 90%",
    rgb: "235, 217, 237",
    rgbArray: [235, 217, 237] as const,
  },

  /**
   * Pale Lilac Dark - Pressed states
   */
  paleLilacDark: {
    name: "Pale Lilac Dark",
    hex: "#C9A8CD",
    hsl: "296 32% 73%",
    rgb: "201, 168, 205",
    rgbArray: [201, 168, 205] as const,
  },

  /**
   * Illustration Color - Chestnut
   * Used for: Hand-drawn illustrations ONLY
   * Psychology: Warmth, earthiness, approachable
   */
  chestnut: {
    name: "Chestnut",
    hex: "#7D4A5A",
    hsl: "341 26% 39%",
    rgb: "125, 74, 90",
    rgbArray: [125, 74, 90] as const,
  },

  /**
   * Primary UI Color - Black
   * Used for: Text, primary buttons, borders
   */
  black: {
    name: "Black",
    hex: "#000000",
    hsl: "0 0% 0%",
    rgb: "0, 0, 0",
    rgbArray: [0, 0, 0] as const,
  },

  /**
   * Background - Ivory
   * Used for: Page backgrounds, subtle surfaces
   */
  ivory: {
    name: "Ivory",
    hex: "#FFFCF9",
    hsl: "40 100% 99%",
    rgb: "255, 252, 249",
    rgbArray: [255, 252, 249] as const,
  },

  /**
   * Surface - White
   * Used for: Cards, elevated surfaces
   */
  white: {
    name: "White",
    hex: "#FFFFFF",
    hsl: "0 0% 100%",
    rgb: "255, 255, 255",
    rgbArray: [255, 255, 255] as const,
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// GRAY SCALE
// ═══════════════════════════════════════════════════════════════════════════════

export const GRAY_PALETTE = {
  100: { hex: "#F7F5F6", hsl: "330 6% 97%", name: "Gray 100" },
  200: { hex: "#E8E4E8", hsl: "330 6% 91%", name: "Gray 200" },
  300: { hex: "#D1CCD1", hsl: "330 4% 82%", name: "Gray 300" },
  400: { hex: "#9E979E", hsl: "330 3% 61%", name: "Gray 400" },
  500: { hex: "#6B636B", hsl: "330 4% 42%", name: "Gray 500" },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// COOK ASSIGNMENT COLORS
// ═══════════════════════════════════════════════════════════════════════════════

export const COOK_COLORS = {
  cook1: { hex: "#000000", name: "Black" },
  cook2: { hex: "#4A7C59", name: "Forest" },
  cook3: { hex: "#8B6914", name: "Amber" },
  cook4: { hex: "#2E5984", name: "Navy" },
  cook5: { hex: "#6B4A7C", name: "Plum" },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// SEMANTIC COLORS
// ═══════════════════════════════════════════════════════════════════════════════

export const SEMANTIC_COLORS = {
  success: {
    hex: "#2D5A2D",
    light: "#E8F0E8",
    hsl: "120 33% 27%",
    description: "Success states, confirmations, completed actions",
  },
  warning: {
    hex: "#5A4A2D",
    light: "#FDF5ED",
    hsl: "40 35% 27%",
    description: "Warnings, cautions, attention-required states",
  },
  error: {
    hex: "#5A2D2D",
    light: "#FDEDED",
    hsl: "0 35% 27%",
    description: "Errors, destructive actions, critical alerts",
  },
  info: {
    hex: "#DDC3E0",
    light: "#EBD9ED",
    hsl: "296 32% 82%",
    description: "Informational messages, tips, guidance",
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// BACKGROUNDS
// ═══════════════════════════════════════════════════════════════════════════════

export const BACKGROUNDS = {
  default: {
    background: { hex: "#FFFCF9", hsl: "40 100% 99%" }, // Ivory
    card: { hex: "#FFFFFF", hsl: "0 0% 100%" }, // White
    muted: { hex: "#F7F5F6", hsl: "330 6% 97%" }, // Gray 100
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// CHART COLORS (for data visualization)
// ═══════════════════════════════════════════════════════════════════════════════

export const CHART_COLORS = [
  BRAND_COLORS.black.hex, // Black
  BRAND_COLORS.paleLilac.hex, // Pale Lilac
  COOK_COLORS.cook2.hex, // Forest
  COOK_COLORS.cook3.hex, // Amber
  BRAND_COLORS.chestnut.hex, // Chestnut
] as const;

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Convert hex to RGB array
 */
export function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) throw new Error(`Invalid hex color: ${hex}`);
  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ];
}

/**
 * Convert RGB to hex
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")
  );
}

/**
 * Calculate relative luminance for WCAG contrast calculations
 */
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  const [r, g, b] = rgb.map((val) => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors (WCAG formula)
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG standards
 */
export function meetsWcagContrast(
  foreground: string,
  background: string,
  level: "AA" | "AAA" = "AA",
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  const requirements = {
    AA: { normal: 4.5, large: 3 },
    AAA: { normal: 7, large: 4.5 },
  };
  const required = isLargeText
    ? requirements[level].large
    : requirements[level].normal;
  return ratio >= required;
}

/**
 * Get WCAG compliance level for a color pair
 */
export function getWcagLevel(
  foreground: string,
  background: string
): "AAA" | "AA" | "Fail" {
  const ratio = getContrastRatio(foreground, background);
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  return "Fail";
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export type BrandColorKey = keyof typeof BRAND_COLORS;
export type GrayShade = keyof typeof GRAY_PALETTE;
export type CookColorKey = keyof typeof COOK_COLORS;
export type SemanticColorKey = keyof typeof SEMANTIC_COLORS;
