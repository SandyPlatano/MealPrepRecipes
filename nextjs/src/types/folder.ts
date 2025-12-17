/**
 * Recipe Folder Types
 * Organize recipes into folders and subfolders (max 2 levels)
 * Includes smart folder support with filter criteria
 */

import type { SmartFilterCriteria } from "./smart-folder";

// =====================================================
// FOLDER CATEGORY TYPES
// =====================================================

/**
 * Folder category from database
 * Categories are like sections in the sidebar (e.g., "My Folders", "Seasonal", etc.)
 */
export interface FolderCategory {
  id: string;
  household_id: string;
  created_by_user_id: string;
  name: string;
  emoji: string | null;
  is_system: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * Category with its folders attached
 */
export interface FolderCategoryWithFolders extends FolderCategory {
  folders: FolderWithChildren[];
}

/**
 * Form data for creating/editing categories
 */
export interface FolderCategoryFormData {
  name: string;
  emoji?: string | null;
}

// =====================================================
// CORE FOLDER TYPES
// =====================================================

/**
 * Recipe folder from database
 * May be a regular folder or a smart folder with filter criteria
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
  category_id: string | null;
  sort_order: number;
  // Smart folder fields
  is_smart: boolean;
  smart_filters: SmartFilterCriteria | null;
  // Timestamps
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
// SMART FOLDER TYPES (Re-exported from smart-folder.ts)
// =====================================================

// Smart folder types are defined in @/types/smart-folder.ts
// Import from there for SmartFilterCriteria, SystemSmartFolder, etc.

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
  category_id?: string | null;
}

// =====================================================
// FILTER TYPES
// =====================================================

/**
 * Active folder filter state
 * - "all": Show all recipes (no filter)
 * - "folder": Filter by a regular folder
 * - "smart": Filter by a smart folder (system or user-created)
 */
export type ActiveFolderFilter =
  | { type: "all" }
  | { type: "folder"; id: string }
  | { type: "smart"; id: string; isSystem: boolean };

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

export const CATEGORY_EMOJIS = [
  "📂",
  "🗂️",
  "📁",
  "🗃️",
  "🏷️",
  "📋",
  "📑",
  "🍽️",
  "🌿",
  "🌞",
  "❄️",
  "🎃",
  "🎄",
  "🌸",
  "🍂",
  "⚡",
  "💪",
  "🌱",
  "🏆",
  "✨",
] as const;
