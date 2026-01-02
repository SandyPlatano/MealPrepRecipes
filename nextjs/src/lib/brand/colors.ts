/**
 * Brand Color Constants - Warm & Cozy Design System
 *
 * "Babe, What's for Dinner?" Brand Identity
 *
 * Palette:
 * - Warm Off-White (#FFFCF6) - Page background
 * - Dark (#1A1A1A) - Text, buttons, primary UI
 * - White (#FFFFFF) - Cards, surfaces
 * - Lime (#D9F99D) - Primary accent, CTAs, highlights
 * - Yellow (#FDE047) - Charts, secondary accent
 * - Purple (#EDE9FE) - Feature card backgrounds
 * - Orange (#FFF0E6) - Feature card backgrounds
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
// CORE BRAND COLORS - WARM & COZY
// ═══════════════════════════════════════════════════════════════════════════════

export const BRAND_COLORS = {
  /**
   * Primary UI - Dark
   * Used for: Text, primary buttons, borders
   */
  primary: {
    name: "Primary Dark",
    hex: "#1A1A1A",
    hsl: "0 0% 10%",
    rgb: "26, 26, 26",
    rgbArray: [26, 26, 26] as const,
  },

  /**
   * Accent - Lime Green
   * Used for: CTAs, highlights, trust sections, selection
   */
  lime: {
    name: "Lime",
    hex: "#D9F99D",
    hsl: "75 91% 80%",
    rgb: "217, 249, 157",
    rgbArray: [217, 249, 157] as const,
  },

  /**
   * Accent - Yellow
   * Used for: Charts, secondary highlights, feature cards
   */
  yellow: {
    name: "Yellow",
    hex: "#FDE047",
    hsl: "47 96% 64%",
    rgb: "253, 224, 71",
    rgbArray: [253, 224, 71] as const,
  },

  /**
   * Accent - Purple
   * Used for: Feature card backgrounds
   */
  purple: {
    name: "Purple",
    hex: "#EDE9FE",
    hsl: "251 91% 95%",
    rgb: "237, 233, 254",
    rgbArray: [237, 233, 254] as const,
  },

  /**
   * Accent - Orange
   * Used for: Feature card backgrounds
   */
  orange: {
    name: "Orange",
    hex: "#FFF0E6",
    hsl: "27 100% 95%",
    rgb: "255, 240, 230",
    rgbArray: [255, 240, 230] as const,
  },

  /**
   * Background - Warm Off-White
   * Used for: Page backgrounds
   */
  background: {
    name: "Warm Off-White",
    hex: "#FFFCF6",
    hsl: "40 100% 99%",
    rgb: "255, 252, 246",
    rgbArray: [255, 252, 246] as const,
  },

  /**
   * Surface - White
   * Used for: Cards, elevated surfaces
   */
  surface: {
    name: "White",
    hex: "#FFFFFF",
    hsl: "0 0% 100%",
    rgb: "255, 255, 255",
    rgbArray: [255, 255, 255] as const,
  },

  /**
   * Border - Light Gray
   * Used for: Subtle borders, dividers
   */
  border: {
    name: "Border Gray",
    hex: "#E5E7EB",
    hsl: "220 13% 91%",
    rgb: "229, 231, 235",
    rgbArray: [229, 231, 235] as const,
  },

  /**
   * Text Muted - Gray
   * Used for: Secondary text, labels
   */
  textMuted: {
    name: "Text Muted",
    hex: "#4B5563",
    hsl: "220 9% 46%",
    rgb: "75, 85, 99",
    rgbArray: [75, 85, 99] as const,
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// GRAY SCALE
// ═══════════════════════════════════════════════════════════════════════════════

export const GRAY_PALETTE = {
  50: { hex: "#F9FAFB", hsl: "210 20% 98%", name: "Gray 50" },
  100: { hex: "#F3F4F6", hsl: "220 14% 96%", name: "Gray 100" },
  200: { hex: "#E5E7EB", hsl: "220 13% 91%", name: "Gray 200" },
  300: { hex: "#D1D5DB", hsl: "216 12% 84%", name: "Gray 300" },
  400: { hex: "#9CA3AF", hsl: "218 11% 65%", name: "Gray 400" },
  500: { hex: "#6B7280", hsl: "220 9% 46%", name: "Gray 500" },
  600: { hex: "#4B5563", hsl: "215 14% 34%", name: "Gray 600" },
  700: { hex: "#374151", hsl: "217 19% 27%", name: "Gray 700" },
  800: { hex: "#1F2937", hsl: "215 28% 17%", name: "Gray 800" },
  900: { hex: "#111827", hsl: "221 39% 11%", name: "Gray 900" },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// COOK ASSIGNMENT COLORS
// ═══════════════════════════════════════════════════════════════════════════════

export const COOK_COLORS = {
  cook1: { hex: "#1A1A1A", name: "Dark" },
  cook2: { hex: "#059669", name: "Emerald" },
  cook3: { hex: "#D97706", name: "Amber" },
  cook4: { hex: "#2563EB", name: "Blue" },
  cook5: { hex: "#7C3AED", name: "Violet" },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// SEMANTIC COLORS
// ═══════════════════════════════════════════════════════════════════════════════

export const SEMANTIC_COLORS = {
  success: {
    hex: "#10B981",
    light: "#D1FAE5",
    dark: "#065F46",
    hsl: "160 84% 39%",
    description: "Success states, confirmations, completed actions",
  },
  warning: {
    hex: "#F59E0B",
    light: "#FEF3C7",
    dark: "#92400E",
    hsl: "38 92% 50%",
    description: "Warnings, cautions, attention-required states",
  },
  error: {
    hex: "#EF4444",
    light: "#FEE2E2",
    dark: "#991B1B",
    hsl: "0 84% 60%",
    description: "Errors, destructive actions, critical alerts",
  },
  info: {
    hex: "#3B82F6",
    light: "#DBEAFE",
    dark: "#1E40AF",
    hsl: "217 91% 60%",
    description: "Informational messages, tips, guidance",
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// BACKGROUNDS
// ═══════════════════════════════════════════════════════════════════════════════

export const BACKGROUNDS = {
  default: {
    background: { hex: "#FFFCF6", hsl: "40 100% 99%" }, // Warm off-white
    card: { hex: "#FFFFFF", hsl: "0 0% 100%" }, // White
    muted: { hex: "#F3F4F6", hsl: "220 14% 96%" }, // Light gray
  },
  dark: {
    background: { hex: "#0F172A", hsl: "222 47% 11%" }, // Dark slate
    card: { hex: "#1E293B", hsl: "217 33% 17%" }, // Slate 800
    muted: { hex: "#334155", hsl: "215 25% 27%" }, // Slate 700
  },
  footer: {
    background: { hex: "#0D1117", hsl: "215 28% 7%" }, // GitHub dark
    text: { hex: "#9CA3AF", hsl: "218 11% 65%" }, // Gray 400
    title: { hex: "#FFFFFF", hsl: "0 0% 100%" }, // White
  },
  sidebar: {
    background: { hex: "#0D1117", hsl: "215 28% 7%" }, // GitHub dark
    surface: { hex: "#161B22", hsl: "215 23% 11%" }, // Slightly lighter
    border: { hex: "#30363D", hsl: "212 12% 21%" }, // Border
    text: { hex: "#F0F6FC", hsl: "210 40% 98%" }, // Light text
    textMuted: { hex: "#8B949E", hsl: "210 12% 58%" }, // Muted text
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// ACCENT SECTIONS (for landing page)
// ═══════════════════════════════════════════════════════════════════════════════

export const ACCENT_SECTIONS = {
  trustStrip: {
    background: { hex: "#EFFFE3", hsl: "92 100% 94%" }, // Light lime
    darkBackground: { hex: "#1A2E1A", hsl: "120 29% 14%" }, // Dark green
  },
  cta: {
    background: { hex: "#E4F8C9", hsl: "88 74% 88%" }, // Soft lime
    darkBackground: { hex: "#1F2937", hsl: "215 28% 17%" }, // Gray 800
  },
  featureYellow: {
    background: { hex: "#FFF6D8", hsl: "47 100% 92%" }, // Soft yellow
  },
  featurePurple: {
    background: { hex: "#EDE9FE", hsl: "251 91% 95%" }, // Soft purple
  },
  featureOrange: {
    background: { hex: "#FFF0E6", hsl: "27 100% 95%" }, // Soft orange
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// CHART COLORS (for data visualization)
// ═══════════════════════════════════════════════════════════════════════════════

export const CHART_COLORS = [
  BRAND_COLORS.lime.hex, // Lime
  SEMANTIC_COLORS.success.hex, // Emerald
  BRAND_COLORS.yellow.hex, // Yellow
  SEMANTIC_COLORS.error.hex, // Red
  "#8B5CF6", // Violet
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
