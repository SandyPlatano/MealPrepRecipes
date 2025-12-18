/**
 * Brand Color Constants - Single Source of Truth
 *
 * This file defines all brand colors for "Babe, What's for Dinner?"
 * Use these constants in:
 * - Email templates (hex values)
 * - Dynamic OG images (hex/rgb values)
 * - TypeScript validation
 * - Documentation generation
 *
 * CSS variables in globals.css and Tailwind config should stay in sync.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// CORE BRAND COLORS
// ═══════════════════════════════════════════════════════════════════════════════

export const BRAND_COLORS = {
  /**
   * Primary Brand Color - Warm Coral/Orange
   * Used for: CTAs, links, primary accents, brand emphasis
   * Psychology: Energy, appetite, warmth, enthusiasm
   */
  primary: {
    name: "Coral",
    hex: "#F97316",
    hsl: "25 95% 53%",
    rgb: "249, 115, 22",
    rgbArray: [249, 115, 22] as const,
  },

  /**
   * Secondary Brand Color - Sage Green
   * Used for: Success states, secondary accents, natural/fresh feel
   * Psychology: Freshness, health, calm, nature
   */
  secondary: {
    name: "Sage",
    hex: "#6AA84F",
    hsl: "142 40% 45%",
    rgb: "106, 168, 79",
    rgbArray: [106, 168, 79] as const,
  },

  /**
   * Tertiary - Cream/Off-white
   * Used for: Backgrounds, subtle highlights, warmth
   */
  cream: {
    name: "Cream",
    hex: "#EEEFE9",
    hsl: "40 30% 96%",
    rgb: "238, 239, 233",
    rgbArray: [238, 239, 233] as const,
  },

  /**
   * Neutral - Warm Gray
   * Used for: Muted text, borders, subtle elements
   */
  warmGray: {
    name: "Warm Gray",
    hex: "#737373",
    hsl: "25 10% 45%",
    rgb: "115, 115, 115",
    rgbArray: [115, 115, 115] as const,
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// CORAL PALETTE (Primary Scale)
// ═══════════════════════════════════════════════════════════════════════════════

export const CORAL_PALETTE = {
  50: { hex: "#FFF7ED", hsl: "25 100% 97%" },
  100: { hex: "#FFEDD5", hsl: "25 100% 93%" },
  200: { hex: "#FED7AA", hsl: "25 100% 85%" },
  300: { hex: "#FDBA74", hsl: "25 100% 75%" },
  400: { hex: "#FB923C", hsl: "25 95% 63%" },
  500: { hex: "#F97316", hsl: "25 95% 53%" }, // PRIMARY
  600: { hex: "#EA580C", hsl: "25 90% 45%" },
  700: { hex: "#C2410C", hsl: "25 85% 38%" },
  800: { hex: "#9A3412", hsl: "25 80% 30%" },
  900: { hex: "#7C2D12", hsl: "25 75% 22%" },
  950: { hex: "#431407", hsl: "25 70% 12%" },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// SAGE PALETTE (Secondary Scale)
// ═══════════════════════════════════════════════════════════════════════════════

export const SAGE_PALETTE = {
  50: { hex: "#F0FDF4", hsl: "142 50% 97%" },
  100: { hex: "#DCFCE7", hsl: "142 45% 92%" },
  200: { hex: "#BBF7D0", hsl: "142 40% 82%" },
  300: { hex: "#86EFAC", hsl: "142 38% 68%" },
  400: { hex: "#4ADE80", hsl: "142 36% 55%" },
  500: { hex: "#6AA84F", hsl: "142 40% 45%" }, // SECONDARY
  600: { hex: "#16A34A", hsl: "142 42% 36%" },
  700: { hex: "#15803D", hsl: "142 40% 28%" },
  800: { hex: "#166534", hsl: "142 38% 22%" },
  900: { hex: "#14532D", hsl: "142 35% 16%" },
  950: { hex: "#052E16", hsl: "142 30% 10%" },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// SEMANTIC COLORS
// ═══════════════════════════════════════════════════════════════════════════════

export const SEMANTIC_COLORS = {
  success: {
    hex: "#6AA84F",
    hsl: "142 40% 45%",
    description: "Success states, confirmations, completed actions",
  },
  warning: {
    hex: "#F7A501",
    hsl: "40 95% 49%",
    description: "Warnings, cautions, attention-required states",
  },
  error: {
    hex: "#EF4444",
    hsl: "0 84% 60%",
    description: "Errors, destructive actions, critical alerts",
  },
  info: {
    hex: "#3B82F6",
    hsl: "217 91% 60%",
    description: "Informational messages, tips, guidance",
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// BOLD ACCENT COLORS (PostHog-inspired)
// ═══════════════════════════════════════════════════════════════════════════════

export const BOLD_COLORS = {
  red: { hex: "#F54E00", hsl: "18 100% 48%" },
  orange: { hex: "#EB9D2A", hsl: "39 83% 54%" },
  yellow: { hex: "#F7A501", hsl: "40 95% 49%" },
  green: { hex: "#6AA84F", hsl: "142 40% 45%" },
  teal: { hex: "#29DBBC", hsl: "168 71% 51%" },
  blue: { hex: "#2F80FA", hsl: "217 95% 58%" },
  purple: { hex: "#A621C8", hsl: "289 75% 46%" },
  pink: { hex: "#E34C6F", hsl: "349 73% 60%" },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// FOOD-THEMED COLORS (Legacy, for backwards compatibility)
// ═══════════════════════════════════════════════════════════════════════════════

export const FOOD_COLORS = {
  tomato: { hex: "#F54E00", dark: "#D94400" },
  avocado: { hex: "#6AA84F", light: "#7FBF5F" },
  butter: { hex: "#F7A501", dark: "#D99000" },
  eggplant: { hex: "#A621C8", light: "#B94AD6" },
  carrot: { hex: "#EB9D2A", dark: "#D08A20" },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// DARK/LIGHT MODE BACKGROUNDS
// ═══════════════════════════════════════════════════════════════════════════════

export const BACKGROUNDS = {
  light: {
    background: { hex: "#FEFDFB", hsl: "30 25% 99%" },
    card: { hex: "#FEFDFB", hsl: "30 20% 99%" },
    muted: { hex: "#F5F5F4", hsl: "30 10% 95%" },
  },
  dark: {
    background: { hex: "#121212", hsl: "0 0% 7%" },
    card: { hex: "#171717", hsl: "0 0% 9%" },
    muted: { hex: "#262626", hsl: "0 0% 15%" },
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// CHART COLORS (for data visualization)
// ═══════════════════════════════════════════════════════════════════════════════

export const CHART_COLORS = [
  BRAND_COLORS.primary.hex, // Coral
  BRAND_COLORS.secondary.hex, // Sage
  BOLD_COLORS.yellow.hex,
  BOLD_COLORS.teal.hex,
  BOLD_COLORS.purple.hex,
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
export type CoralShade = keyof typeof CORAL_PALETTE;
export type SageShade = keyof typeof SAGE_PALETTE;
export type SemanticColorKey = keyof typeof SEMANTIC_COLORS;
export type BoldColorKey = keyof typeof BOLD_COLORS;
export type FoodColorKey = keyof typeof FOOD_COLORS;
