/**
 * CustomizableList - Generic CRUD list component package
 *
 * Consolidates common patterns across settings sections:
 * - State management (items, dialogs, forms)
 * - Drag-to-reorder
 * - Create/Edit dialogs
 * - Delete confirmation
 * - Emoji/Color pickers
 */

// Main component
export { CustomizableList } from "./customizable-list";

// Sub-components
export { ListItem } from "./list-item";
export { ListDialog } from "./list-dialog";
export { DeleteConfirmation } from "./delete-confirmation";
export { ColorPickerField } from "./color-picker-field";
export { EmojiPickerField } from "./emoji-picker-field";
export { SortableWrapper, SortableItem, DragHandle } from "./sortable-wrapper";

// Hooks
export { useListState } from "./use-list-state";

// Types
export type {
  BaseListItem,
  ColorPaletteItem,
  ListFeatures,
  EmptyStateConfig,
  DialogConfig,
  DeleteConfirmConfig,
  CustomizableListConfig,
  ActionResult,
  ListServerActions,
  FormFieldsProps,
  ItemContentProps,
  DeleteDialogProps,
  CustomizableListProps,
  ListState,
  SortableItemProps,
} from "./types";
