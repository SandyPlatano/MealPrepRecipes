/**
 * CustomizableList - Generic Types
 *
 * Type definitions for the customizable list component that consolidates
 * CRUD operations, drag-to-reorder, emoji/color pickers across settings sections.
 */

import type { ReactNode } from "react";

// ============================================================================
// Base Types
// ============================================================================

/** Base item type - all custom items must extend this */
export interface BaseListItem {
  id: string;
  name: string;
  sortOrder?: number;
  isSystem?: boolean;
}

/** Color palette item */
export interface ColorPaletteItem {
  key: string;
  color: string;
  label: string;
}

// ============================================================================
// Configuration Types
// ============================================================================

/** Feature flags for optional functionality */
export interface ListFeatures {
  /** Show emoji picker in form */
  emoji?: boolean;
  /** Show color picker in form */
  color?: boolean;
  /** Enable drag-to-reorder */
  dragReorder?: boolean;
  /** Show "System" badge for isSystem items */
  systemItems?: boolean;
}

/** Empty state configuration */
export interface EmptyStateConfig {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
}

/** Dialog configuration */
export interface DialogConfig<T> {
  createTitle: string;
  editTitle: (item: T) => string;
}

/** Delete confirmation configuration */
export interface DeleteConfirmConfig<T> {
  title: string;
  description: (item: T) => string;
}

/** Main configuration object */
export interface CustomizableListConfig<T extends BaseListItem, F> {
  /** Section title */
  title: string;
  /** Section description */
  description: string;
  /** Icon for section header */
  icon?: React.ComponentType<{ className?: string }>;
  /** Empty state when no items */
  emptyState: EmptyStateConfig;
  /** Feature toggles */
  features: ListFeatures;
  /** Dialog titles */
  dialog: DialogConfig<T>;
  /** Delete confirmation text */
  deleteConfirmation: DeleteConfirmConfig<T>;
  /** Initial form data for creating new items */
  initialFormData: F;
}

// ============================================================================
// Server Action Types
// ============================================================================

/** Standard server action result */
export interface ActionResult<T> {
  data?: T;
  error?: string;
}

/** Server actions interface - standardized signature */
export interface ListServerActions<T extends BaseListItem, F> {
  /** Create a new item */
  create: (householdId: string, data: F) => Promise<ActionResult<T>>;
  /** Update an existing item */
  update: (id: string, data: Partial<F>) => Promise<ActionResult<T>>;
  /** Delete an item by ID */
  delete: (id: string) => Promise<ActionResult<void>>;
  /** Reorder items (optional) */
  reorder?: (householdId: string, orderedIds: string[]) => Promise<ActionResult<void>>;
}

// ============================================================================
// Render Props Types
// ============================================================================

/** Props passed to form fields render function */
export interface FormFieldsProps<F> {
  formData: F;
  setFormData: React.Dispatch<React.SetStateAction<F>>;
  isEditing: boolean;
  isSaving: boolean;
}

/** Props passed to item content render function */
export interface ItemContentProps<T> {
  item: T;
  isEditing: boolean;
}

/** Props passed to custom delete dialog render function */
export interface DeleteDialogProps<T> {
  item: T;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSaving: boolean;
}

// ============================================================================
// Component Props Types
// ============================================================================

/** Main component props */
export interface CustomizableListProps<T extends BaseListItem, F> {
  /** Household ID for server actions */
  householdId: string;
  /** Initial items to display */
  initialItems: T[];
  /** Configuration object */
  config: CustomizableListConfig<T, F>;
  /** Server actions for CRUD operations */
  actions: ListServerActions<T, F>;

  // Render slots
  /** Render content inside each item card */
  renderItemContent: (item: T) => ReactNode;
  /** Render badges/tags for each item (optional) */
  renderItemBadges?: (item: T) => ReactNode;
  /** Render form fields in create/edit dialog */
  renderFormFields: (props: FormFieldsProps<F>) => ReactNode;
  /** Render preview in dialog (optional) */
  renderPreview?: (formData: F) => ReactNode;
  /** Custom delete dialog (optional, for reassignment flows) */
  renderDeleteDialog?: (props: DeleteDialogProps<T>) => ReactNode;

  // Optional features
  /** Usage limit display (e.g., "3 of 10 custom types") */
  usageLimit?: { count: number; limit: number };
  /** Callback when item is clicked (if not opening edit dialog) */
  onItemClick?: (item: T) => void;
  /** Color palette for color picker */
  colorPalette?: ColorPaletteItem[];
}

// ============================================================================
// Hook Types
// ============================================================================

/** State returned from useListState hook */
export interface ListState<T extends BaseListItem, F> {
  // Data
  items: T[];
  setItems: React.Dispatch<React.SetStateAction<T[]>>;

  // Dialog state
  isCreating: boolean;
  editingItem: T | null;
  deleteConfirmItem: T | null;
  isDialogOpen: boolean;

  // Form state
  formData: F;
  setFormData: React.Dispatch<React.SetStateAction<F>>;
  isSaving: boolean;

  // Handlers
  handleCreate: () => void;
  handleEdit: (item: T) => void;
  handleClose: () => void;
  handleSave: () => Promise<void>;
  handleDelete: () => Promise<void>;
  handleRequestDelete: (item: T) => void;
  handleCancelDelete: () => void;
  handleReorder: (newItems: T[]) => Promise<void>;
}

// ============================================================================
// Sortable Types
// ============================================================================

/** Props for sortable item wrapper */
export interface SortableItemProps {
  id: string;
  children: ReactNode;
  onEdit?: () => void;
  isDragDisabled?: boolean;
}
