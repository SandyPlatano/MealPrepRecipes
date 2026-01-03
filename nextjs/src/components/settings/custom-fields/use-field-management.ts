import { useState } from "react";
import { toast } from "sonner";
import {
  createFieldDefinition,
  updateFieldDefinition,
  deleteFieldDefinition,
  reorderFieldDefinitions,
} from "@/app/actions/custom-fields";
import type {
  CustomFieldDefinition,
  CustomFieldDefinitionFormData,
} from "@/types/custom-fields";

interface UseFieldManagementProps {
  householdId: string;
  initialFields: CustomFieldDefinition[];
}

export function useFieldManagement({
  householdId,
  initialFields,
}: UseFieldManagementProps) {
  const [fields, setFields] = useState<CustomFieldDefinition[]>(initialFields);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingField, setEditingField] = useState<CustomFieldDefinition | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleCreate = () => {
    setIsCreating(true);
  };

  const handleEdit = (field: CustomFieldDefinition) => {
    setEditingField(field);
    setIsEditing(true);
  };

  const handleClose = () => {
    setIsCreating(false);
    setIsEditing(false);
    setEditingField(null);
  };

  const handleSave = async (formData: CustomFieldDefinitionFormData) => {
    if (!formData.name.trim()) {
      toast.error("Field name is required");
      return;
    }

    if (
      (formData.fieldType === "select" || formData.fieldType === "multi_select") &&
      (!formData.options || formData.options.length === 0)
    ) {
      toast.error("At least one option is required for select fields");
      return;
    }

    setIsSaving(true);

    if (editingField) {
      // Update existing
      const result = await updateFieldDefinition(editingField.id, formData);
      if (result.error) {
        toast.error(result.error);
        setIsSaving(false);
        return;
      }

      // Update local state
      setFields((prev) =>
        prev.map((f) =>
          f.id === editingField.id
            ? {
                ...f,
                name: formData.name,
                fieldType: formData.fieldType,
                description: formData.description || null,
                isRequired: formData.isRequired || false,
                showInCard: formData.showInCard || false,
                showInFilters: formData.showInFilters !== false,
                options: formData.options || null,
                icon: formData.icon || null,
              }
            : f
        )
      );

      toast.success("Field updated");
    } else {
      // Create new
      const result = await createFieldDefinition(householdId, formData);
      if (result.error) {
        toast.error(result.error);
        setIsSaving(false);
        return;
      }

      if (result.data) {
        setFields((prev) => [...prev, result.data!]);
      }

      toast.success("Field created");
    }

    setIsSaving(false);
    handleClose();
  };

  const handleDelete = async (id: string) => {
    setIsSaving(true);
    const result = await deleteFieldDefinition(id);
    setIsSaving(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    setFields((prev) => prev.filter((f) => f.id !== id));
    setDeleteConfirmId(null);
    toast.success("Field deleted");
  };

  const handleDragStart = (index: number) => {
    setIsDragging(true);
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newFields = [...fields];
    const draggedField = newFields[draggedIndex];
    newFields.splice(draggedIndex, 1);
    newFields.splice(index, 0, draggedField);

    setFields(newFields);
    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    setIsDragging(false);
    setDraggedIndex(null);

    // Save new order
    const orderedIds = fields.map((f) => f.id);
    const result = await reorderFieldDefinitions(householdId, orderedIds);

    if (result.error) {
      toast.error("Failed to save order");
    }
  };

  return {
    fields,
    isCreating,
    isEditing,
    editingField,
    deleteConfirmId,
    isSaving,
    isDragging,
    draggedIndex,
    handleCreate,
    handleEdit,
    handleClose,
    handleSave,
    handleDelete,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    setDeleteConfirmId,
  };
}
