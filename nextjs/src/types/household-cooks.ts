// ============================================================================
// Household Cooks Types
// Types for custom cooks (non-user family members) with optional avatars
// ============================================================================

export interface HouseholdCook {
  id: string;
  household_id: string;
  name: string;
  avatar_url: string | null;
  color: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCookData {
  name: string;
  color?: string;
}

export interface UpdateCookData {
  name?: string;
  color?: string;
  avatar_url?: string | null;
  display_order?: number;
}

// Default color palette for cook avatars (matches existing meal planner colors)
export const COOK_COLORS = [
  "#3b82f6", // Blue
  "#a855f7", // Purple
  "#10b981", // Green
  "#f59e0b", // Amber
  "#ec4899", // Pink
] as const;

export type CookColor = (typeof COOK_COLORS)[number];

// Get initials from a cook name
export function getCookInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

// Get a consistent color for a cook based on their name (for fallback)
export function getCookColor(name: string, index?: number): string {
  if (typeof index === "number") {
    return COOK_COLORS[index % COOK_COLORS.length];
  }
  // Use name hash for consistent color assignment
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COOK_COLORS[Math.abs(hash) % COOK_COLORS.length];
}
