/**
 * Quick Cart Components
 *
 * Global shopping cart bubble and modal for quick access from anywhere in the app.
 * Enhanced modal provides full shopping list features: drag-to-reorder, store mode,
 * AI substitutions, pantry integration, and recipe source tracking.
 */

export { QuickCartProvider, useQuickCartContext } from "./quick-cart-provider";
export { QuickCartBubble } from "./quick-cart-bubble";
export { QuickCartModal } from "./quick-cart-modal";
export { QuickCartModalHeader } from "./quick-cart-modal-header";
export { QuickCartModalActions } from "./quick-cart-modal-actions";
export { QuickCartModalContent } from "./quick-cart-modal-content";
export { QuickCartHeaderIcon } from "./quick-cart-header-icon";
// Deprecated: QuickCartPanel replaced by QuickCartModal
export { QuickCartPanel } from "./quick-cart-panel";
