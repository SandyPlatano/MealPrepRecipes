/**
 * Sidebar Actions Index
 *
 * Re-exports all sidebar actions from modular files.
 * Import from '@/app/actions/sidebar' for all sidebar functionality.
 */

// Section ordering
export {
  reorderSections,
  reorderSectionsAuto,
  reorderBuiltInItems,
  reorderBuiltInItemsAuto,
} from "./ordering";

// Section operations (built-in and custom)
export {
  updateBuiltInSection,
  updateBuiltInSectionAuto,
  createCustomSection,
  createCustomSectionAuto,
  updateCustomSection,
  updateCustomSectionAuto,
  deleteCustomSection,
  deleteCustomSectionAuto,
  resetSectionCustomization,
  resetSectionCustomizationAuto,
} from "./sections";

// Item operations (built-in sections)
export {
  updateBuiltInItem,
  updateBuiltInItemAuto,
  addCustomItemToBuiltInSection,
  addCustomItemToBuiltInSectionAuto,
  removeCustomItemFromBuiltInSection,
  removeCustomItemFromBuiltInSectionAuto,
  resetBuiltInItem,
  resetBuiltInItemAuto,
} from "./items";

// Item operations (custom sections)
export {
  addCustomSectionItem,
  addCustomSectionItemAuto,
  updateCustomSectionItem,
  updateCustomSectionItemAuto,
  removeCustomSectionItem,
  removeCustomSectionItemAuto,
} from "./items";
