"use client";

/**
 * useListState - State management hook for CustomizableList
 *
 * Handles all CRUD operations, dialog state, and optimistic updates
 * for the customizable list component.
 */

import { useState, useCallback } from "react";
import { toast } from "sonner";
import type {
  BaseListItem,
  ListServerActions,
  ListState,
} from "./types";

interface UseListStateOptions<T extends BaseListItem, F> {
  initialItems: T[];
  initialFormData: F;
  actions: ListServerActions<T, F>;
  householdId: string;
  /** Transform item to form data when editing */
  itemToFormData?: (item: T) => F;
}

export function useListState<T extends BaseListItem, F>({
  initialItems,
  initialFormData,
  actions,
  householdId,
  itemToFormData,
}: UseListStateOptions<T, F>): ListState<T, F> {
  // Data state
  const [items, setItems] = useState<T[]>(initialItems);

  // Dialog state
  const [isCreating, setIsCreating] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<T | null>(null);

  // Form state
  const [formData, setFormData] = useState<F>(initialFormData);
  const [isSaving, setIsSaving] = useState(false);

  // Computed
  const isDialogOpen = isCreating || editingItem !== null;

  // Handlers
  const handleCreate = useCallback(() => {
    setFormData(initialFormData);
    setEditingItem(null);
    setIsCreating(true);
  }, [initialFormData]);

  const handleEdit = useCallback(
    (item: T) => {
      const data = itemToFormData ? itemToFormData(item) : (item as unknown as F);
      setFormData(data);
      setEditingItem(item);
      setIsCreating(false);
    },
    [itemToFormData]
  );

  const handleClose = useCallback(() => {
    setIsCreating(false);
    setEditingItem(null);
    setFormData(initialFormData);
  }, [initialFormData]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);

    try {
      if (editingItem) {
        // Update existing item
        const result = await actions.update(editingItem.id, formData);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        if (result.data) {
          setItems((prev) =>
            prev.map((item) => (item.id === editingItem.id ? result.data! : item))
          );
          toast.success("Updated successfully");
        }
      } else {
        // Create new item
        const result = await actions.create(householdId, formData);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        if (result.data) {
          setItems((prev) => [...prev, result.data!]);
          toast.success("Created successfully");
        }
      }
      handleClose();
    } finally {
      setIsSaving(false);
    }
  }, [editingItem, formData, actions, householdId, handleClose]);

  const handleRequestDelete = useCallback((item: T) => {
    setDeleteConfirmItem(item);
  }, []);

  const handleCancelDelete = useCallback(() => {
    setDeleteConfirmItem(null);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deleteConfirmItem) return;

    setIsSaving(true);
    try {
      const result = await actions.delete(deleteConfirmItem.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setItems((prev) => prev.filter((item) => item.id !== deleteConfirmItem.id));
      toast.success("Deleted successfully");
      setDeleteConfirmItem(null);
    } finally {
      setIsSaving(false);
    }
  }, [deleteConfirmItem, actions]);

  const handleReorder = useCallback(
    async (newItems: T[]) => {
      if (!actions.reorder) return;

      // Optimistic update
      const previousItems = items;
      setItems(newItems);

      const orderedIds = newItems.map((item) => item.id);
      const result = await actions.reorder(householdId, orderedIds);

      if (result.error) {
        // Revert on error
        setItems(previousItems);
        toast.error("Failed to reorder");
      }
    },
    [items, actions, householdId]
  );

  return {
    // Data
    items,
    setItems,

    // Dialog state
    isCreating,
    editingItem,
    deleteConfirmItem,
    isDialogOpen,

    // Form state
    formData,
    setFormData,
    isSaving,

    // Handlers
    handleCreate,
    handleEdit,
    handleClose,
    handleSave,
    handleDelete,
    handleRequestDelete,
    handleCancelDelete,
    handleReorder,
  };
}
