/**
 * Smart Folders Server Actions
 *
 * Modular server actions for smart folder management.
 * Re-exports all smart folder operations from organized submodules.
 */

import type { SmartFilterCriteria } from "@/types/smart-folder";

// =====================================================
// SMART FOLDER FORM DATA
// =====================================================

export interface SmartFolderFormData {
  name: string;
  emoji?: string | null;
  color?: string | null;
  smart_filters: SmartFilterCriteria;
  category_id?: string | null;
}

// Read operations
export { getSystemSmartFolders, getUserSmartFolders } from "./read";

// Create/Update/Delete operations
export { createSmartFolder, updateSmartFolder, deleteSmartFolder } from "./write";

// Cache operations
export { getSmartFolderCache, hasSmartFolderCache, rebuildSmartFolderCache } from "./cache";

// Context operations
export { getCookingHistoryContext } from "./context";
