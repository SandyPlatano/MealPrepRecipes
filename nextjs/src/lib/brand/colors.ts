/**
 * Brand Color Constants - Single Source of Truth
 *
 * MIDNIGHT EMBER Brand Identity for "Babe, What's for Dinner?"
 *
 * Palette:
 * - Midnight (#111111) - Primary dark background
 * - Ember (#F97316) - Primary accent/CTA
 * - Hunter (#1a4d2e) - Secondary accent
 * - Cream (#FDFBF7) - Primary text on dark
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
// CORE BRAND COLORS - MIDNIGHT EMBER
// ═══════════════════════════════════════════════════════════════════════════════

export const BRAND_COLORS = {
  /**
   * Primary Brand Color - Coral Orange
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
   * Secondary Brand Color - Hunter Green
   * Used for: Secondary accents, success states, natural/fresh feel
   * Psychology: Depth, sophistication, nature, calm
   */
  secondary: {
    name: "Hunter",
    hex: "#1a4d2e",
    hsl: "150 48% 20%",
    rgb: "26, 77, 46",
    rgbArray: [26, 77, 46] as const,
  },

  /**
   * Tertiary - Cream/Off-white
   * Used for: Text on dark backgrounds, subtle highlights
   */
  cream: {
    name: "Cream",
    hex: "#FDFBF7",
    hsl: "40 60% 98%",
    rgb: "253, 251, 247",
    rgbArray: [253, 251, 247] as const,
  },

  /**
   * Background - Midnight
   * Used for: Primary backgrounds, dark theme base
   */
  midnight: {
    name: "Midnight",
    hex: "#111111",
    hsl: "0 0% 7%",
    rgb: "17, 17, 17",
    rgbArray: [17, 17, 17] as const,
  },

  /**
   * Surface - Slightly lighter dark
   * Used for: Card backgrounds, elevated surfaces
   */
  surface: {
    name: "Surface",
    hex: "#222222",
    hsl: "0 0% 13%",
    rgb: "34, 34, 34",
    rgbArray: [34, 34, 34] as const,
  },

  /**
   * Neutral - Muted Gray
   * Used for: Muted text, borders, subtle elements
   */
  muted: {
    name: "Muted",
    hex: "#888888",
    hsl: "0 0% 53%",
    rgb: "136, 136, 136",
    rgbArray: [136, 136, 136] as const,
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// EMBER PALETTE (Primary Scale - Orange/Red)
// ═══════════════════════════════════════════════════════════════════════════════

export const EMBER_PALETTE = {
  50: { hex: "#FFF7ED", hsl: "25 100% 97%" },
  100: { hex: "#FFEDD5", hsl: "25 100% 93%" },
  200: { hex: "#FED7AA", hsl: "25 100% 85%" },
  300: { hex: "#FDBA74", hsl: "25 100% 75%" },
  400: { hex: "#FB923C", hsl: "25 95% 63%" },
  500: { hex: "#F97316", hsl: "25 95% 53%" }, // PRIMARY CORAL
  600: { hex: "#EA580C", hsl: "25 90% 45%" },
  700: { hex: "#C2410C", hsl: "25 85% 38%" },
  800: { hex: "#9A3412", hsl: "25 80% 30%" },
  900: { hex: "#7C2D12", hsl: "25 75% 22%" },
  950: { hex: "#431407", hsl: "25 70% 12%" },
} as const;

// Alias for backwards compatibility
export const CORAL_PALETTE = EMBER_PALETTE;

// ═══════════════════════════════════════════════════════════════════════════════
// HUNTER PALETTE (Secondary Scale - Dark Green)
// ═══════════════════════════════════════════════════════════════════════════════

export const HUNTER_PALETTE = {
  50: { hex: "#E8F5EC", hsl: "150 40% 94%" },
  100: { hex: "#D0EBD9", hsl: "150 40% 87%" },
  200: { hex: "#A1D6B3", hsl: "150 40% 74%" },
  300: { hex: "#72C28D", hsl: "150 40% 60%" },
  400: { hex: "#4A9F66", hsl: "150 40% 46%" },
  500: { hex: "#2d5a4a", hsl: "150 35% 27%" }, // Lighter hunter
  600: { hex: "#1e5631", hsl: "150 48% 23%" },
  700: { hex: "#1a4d2e", hsl: "150 48% 20%" }, // PRIMARY HUNTER
  800: { hex: "#14432a", hsl: "150 50% 17%" },
  900: { hex: "#0f3520", hsl: "150 55% 14%" },
  950: { hex: "#082010", hsl: "150 60% 8%" },
} as const;

// Alias for backwards compatibility
export const SAGE_PALETTE = HUNTER_PALETTE;

// ═══════════════════════════════════════════════════════════════════════════════
// SEMANTIC COLORS
// ═══════════════════════════════════════════════════════════════════════════════

export const SEMANTIC_COLORS = {
  success: {
    hex: "#1a4d2e",
    hsl: "150 48% 20%",
    description: "Success states, confirmations, completed actions",
  },
  warning: {
    hex: "#FF8C00",
    hsl: "33 100% 50%",
    description: "Warnings, cautions, attention-required states",
  },
  error: {
    hex: "#DC2626",
    hsl: "0 84% 50%",
    description: "Errors, destructive actions, critical alerts",
  },
  info: {
    hex: "#0EA5E9",
    hsl: "199 89% 48%",
    description: "Informational messages, tips, guidance",
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// BOLD ACCENT COLORS
// ═══════════════════════════════════════════════════════════════════════════════

export const BOLD_COLORS = {
  red: { hex: "#DC2626", hsl: "0 84% 50%" },
  orange: { hex: "#F97316", hsl: "25 95% 53%" },
  yellow: { hex: "#F59E0B", hsl: "38 92% 50%" },
  green: { hex: "#1a4d2e", hsl: "150 48% 20%" },
  teal: { hex: "#0D9488", hsl: "175 84% 32%" },
  blue: { hex: "#0EA5E9", hsl: "199 89% 48%" },
  purple: { hex: "#7C3AED", hsl: "262 83% 58%" },
  pink: { hex: "#EC4899", hsl: "330 81% 60%" },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// FOOD-THEMED COLORS (Legacy, for backwards compatibility)
// ═══════════════════════════════════════════════════════════════════════════════

export const FOOD_COLORS = {
  tomato: { hex: "#F97316", dark: "#EA580C" },
  avocado: { hex: "#1a4d2e", light: "#2d5a4a" },
  butter: { hex: "#F59E0B", dark: "#D97706" },
  eggplant: { hex: "#7C3AED", light: "#8B5CF6" },
  carrot: { hex: "#FB923C", dark: "#F97316" },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// DARK-ONLY BACKGROUNDS (Midnight Ember is dark-only)
// ═══════════════════════════════════════════════════════════════════════════════

export const BACKGROUNDS = {
  // Dark-only theme - no light mode
  default: {
    background: { hex: "#111111", hsl: "0 0% 7%" },
    card: { hex: "#1a1a1a", hsl: "0 0% 10%" },
    muted: { hex: "#222222", hsl: "0 0% 13%" },
    surface: { hex: "#2a2a2a", hsl: "0 0% 16%" },
  },
  // Legacy aliases
  light: {
    background: { hex: "#111111", hsl: "0 0% 7%" },
    card: { hex: "#1a1a1a", hsl: "0 0% 10%" },
    muted: { hex: "#222222", hsl: "0 0% 13%" },
  },
  dark: {
    background: { hex: "#111111", hsl: "0 0% 7%" },
    card: { hex: "#1a1a1a", hsl: "0 0% 10%" },
    muted: { hex: "#222222", hsl: "0 0% 13%" },
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// CHART COLORS (for data visualization)
// ═══════════════════════════════════════════════════════════════════════════════

export const CHART_COLORS = [
  BRAND_COLORS.primary.hex, // Ember
  BRAND_COLORS.secondary.hex, // Hunter
  BOLD_COLORS.yellow.hex,
  BOLD_COLORS.teal.hex,
  BOLD_COLORS.blue.hex,
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
export type EmberShade = keyof typeof EMBER_PALETTE;
export type HunterShade = keyof typeof HUNTER_PALETTE;
export type SemanticColorKey = keyof typeof SEMANTIC_COLORS;
export type BoldColorKey = keyof typeof BOLD_COLORS;
export type FoodColorKey = keyof typeof FOOD_COLORS;

// Legacy type aliases
export type CoralShade = EmberShade;
export type SageShade = HunterShade;
