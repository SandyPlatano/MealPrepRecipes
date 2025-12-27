/**
 * Folders Actions Index
 *
 * Re-exports all folder actions from modular files.
 * Import from '@/app/actions/folders' for all folder functionality.
 */

// CRUD operations
export {
  getFolders,
  getFolder,
  createFolder,
  updateFolder,
  duplicateFolder,
  deleteFolder,
  createDefaultFolders,
} from "./crud";

// Recipe-folder membership
export {
  getFolderRecipeIds,
  getAllFolderMemberships,
  getRecipeFolderIds,
  addRecipeToFolder,
  removeRecipeFromFolder,
  setRecipeFolders,
} from "./members";

// Folder categories
export {
  getFolderCategories,
  createFolderCategory,
  updateFolderCategory,
  deleteFolderCategory,
  createDefaultFolderCategories,
} from "./categories";
