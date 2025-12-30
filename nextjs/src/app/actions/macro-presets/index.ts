/**
 * Macro Presets Server Actions
 *
 * Modular server actions for macro preset management.
 * Re-exports all preset operations from organized submodules.
 */

// Read operations
export { getMacroPresets, getMacroPreset } from "./read";

// Create/Update/Delete operations
export { createMacroPreset, updateMacroPreset, deleteMacroPreset } from "./write";

// Pin/Hide display operations
export { togglePresetPinned, togglePresetHidden, reorderPinnedPresets } from "./display";

// Seed operations
export { seedDefaultPresets } from "./seed";

// Quick add operations
export { quickAddFromPreset } from "./quick-add";
