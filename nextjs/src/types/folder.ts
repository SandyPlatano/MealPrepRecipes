/**
 * Recipe Folder Types
 * Organize recipes into folders and subfolders (max 2 levels)
 */

// =====================================================
// CORE FOLDER TYPES
// =====================================================

/**
 * Recipe folder from database
 */
export interface RecipeFolder {
  id: string;
  household_id: string;
  created_by_user_id: string;
  name: string;
  emoji: string | null;
  color: string | null;
  parent_folder_id: string | null;
  cover_recipe_id: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * Folder with nested children and computed fields
 */
export interface FolderWithChildren extends RecipeFolder {
  children: FolderWithChildren[];
  recipe_count: number;
  cover_image_url: string | null;
}

/**
 * Folder-recipe junction record
 */
export interface RecipeFolderMember {
  id: string;
  folder_id: string;
  recipe_id: string;
  added_at: string;
  added_by_user_id: string | null;
}

// =====================================================
// SMART FOLDER TYPES
// =====================================================

/**
 * Smart folder types (virtual, computed on-the-fly)
 */
export type SmartFolderType = "recently_added";

/**
 * Smart folder definition
 */
export interface SmartFolder {
  id: SmartFolderType;
  name: string;
  emoji: string;
  color: string;
  description: string;
  isVirtual: true;
}

/**
 * Predefined smart folders
 */
export const SMART_FOLDERS: Record<SmartFolderType, SmartFolder> = {
  recently_added: {
    id: "recently_added",
    name: "Recently Added",
    emoji: "🆕",
    color: "#6366F1",
    description: "Recipes added in the last 30 days",
    isVirtual: true,
  },
};

// =====================================================
// FORM TYPES
// =====================================================

/**
 * Form data for creating/editing folders
 */
export interface FolderFormData {
  name: string;
  emoji?: string | null;
  color?: string | null;
  parent_folder_id?: string | null;
  cover_recipe_id?: string | null;
}

// =====================================================
// FILTER TYPES
// =====================================================

/**
 * Active folder filter state
 */
export type ActiveFolderFilter =
  | { type: "folder"; id: string }
  | { type: "smart"; id: SmartFolderType }
  | { type: "all" };

// =====================================================
// UI CONSTANTS
// =====================================================

export const FOLDER_COLORS = [
  "#FF6B6B", // Coral
  "#4ECDC4", // Teal
  "#FFE66D", // Yellow
  "#95E1D3", // Mint
  "#DDA0DD", // Plum
  "#87CEEB", // Sky Blue
  "#F4A460", // Sandy Brown
  "#98D8C8", // Seafoam
] as const;

export const FOLDER_EMOJIS = [
  "🍽️",
  "🥗",
  "🍕",
  "🍰",
  "🥘",
  "🍜",
  "🥪",
  "🌮",
  "🍳",
  "🥞",
  "🧁",
  "🍪",
  "🥡",
  "🍝",
  "🌯",
  "🥙",
  "❤️",
  "⭐",
  "📦",
  "⚡",
  "🔥",
  "🏠",
  "👨‍👩‍👧",
  "🎉",
] as const;
