/**
 * Sidebar state persistence using localStorage
 */

const SIDEBAR_WIDTH_KEY = "app-sidebar-width";
const SIDEBAR_COLLAPSED_KEY = "app-sidebar-collapsed";

export const SIDEBAR_DIMENSIONS = {
  MIN_WIDTH: 60,           // Icon-only mode
  DEFAULT_WIDTH: 260,      // Default expanded width
  MAX_WIDTH: 400,          // Maximum drag width
  COLLAPSE_THRESHOLD: 100, // Auto-collapse below this width
} as const;

/**
 * Snap presets for drag-to-resize functionality
 */
export const SIDEBAR_PRESETS = {
  ICON_ONLY: { width: 60, label: "Icon Only" },
  COMPACT: { width: 180, label: "Compact" },
  DEFAULT: { width: 260, label: "Default" },
  WIDE: { width: 360, label: "Wide" },
} as const;

export type SidebarPreset = typeof SIDEBAR_PRESETS[keyof typeof SIDEBAR_PRESETS];

/** Snap when within this many pixels of a preset */
export const SNAP_THRESHOLD = 20;

/**
 * Get the preset that matches a given width (if within threshold)
 */
export function getSnapPreset(width: number): SidebarPreset | null {
  const presets = Object.values(SIDEBAR_PRESETS);
  for (const preset of presets) {
    if (Math.abs(width - preset.width) <= SNAP_THRESHOLD) {
      return preset;
    }
  }
  return null;
}

/**
 * Snap a width to the nearest preset if within threshold
 */
export function snapToNearestPreset(width: number): number {
  const preset = getSnapPreset(width);
  return preset ? preset.width : width;
}

export interface SidebarStorageState {
  width: number;
  isCollapsed: boolean;
}

/**
 * Get sidebar state from localStorage
 */
export function getSidebarState(): SidebarStorageState {
  if (typeof window === "undefined") {
    return {
      width: SIDEBAR_DIMENSIONS.DEFAULT_WIDTH,
      isCollapsed: false,
    };
  }

  try {
    const width = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    const collapsed = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);

    return {
      width: width ? parseInt(width, 10) : SIDEBAR_DIMENSIONS.DEFAULT_WIDTH,
      isCollapsed: collapsed === "true",
    };
  } catch {
    return {
      width: SIDEBAR_DIMENSIONS.DEFAULT_WIDTH,
      isCollapsed: false,
    };
  }
}

/**
 * Save sidebar width to localStorage
 */
export function setSidebarWidth(width: number): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, String(width));
  } catch {
    // localStorage might be full or disabled
  }
}

/**
 * Save sidebar collapsed state to localStorage
 */
export function setSidebarCollapsed(isCollapsed: boolean): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(isCollapsed));
  } catch {
    // localStorage might be full or disabled
  }
}

/**
 * Clear sidebar state from localStorage
 */
export function clearSidebarState(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(SIDEBAR_WIDTH_KEY);
    localStorage.removeItem(SIDEBAR_COLLAPSED_KEY);
  } catch {
    // Ignore errors
  }
}
