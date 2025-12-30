"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  createFieldDefinition,
  updateFieldDefinition,
  deleteFieldDefinition,
  reorderFieldDefinitions,
} from "@/app/actions/custom-fields";
import { COLOR_OPTIONS, type WizardStep } from "../constants";
import type {
  CustomFieldDefinition,
  CustomFieldDefinitionFormData,
  SelectOption,
} from "@/types/custom-fields";

const INITIAL_FORM_DATA: CustomFieldDefinitionFormData = {
  name: "",
  fieldType: "text",
  description: "",
  isRequired: false,
  showInCard: false,
  showInFilters: true,
  options: [],
};

interface UseFieldWizardProps {
  householdId: string;
  fields: CustomFieldDefinition[];
  setFields: React.Dispatch<React.SetStateAction<CustomFieldDefinition[]>>;
}

export function useFieldWizard({ householdId, fields, setFields }: UseFieldWizardProps) {
  // Dialog state
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingField, setEditingField] = useState<CustomFieldDefinition | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Wizard state
  const [wizardStep, setWizardStep] = useState<WizardStep>("type");
  const [formData, setFormData] = useState<CustomFieldDefinitionFormData>(INITIAL_FORM_DATA);

  // Reset wizard
  const resetWizard = useCallback(() => {
    setWizardStep("type");
    setFormData(INITIAL_FORM_DATA);
  }, []);

  // Open create dialog
  const handleCreate = useCallback(() => {
    resetWizard();
    setIsCreating(true);
  }, [resetWizard]);

  // Open edit dialog
  const handleEdit = useCallback((field: CustomFieldDefinition) => {
    setEditingField(field);
    setFormData({
      name: field.name,
      fieldType: field.fieldType,
      description: field.description || "",
      isRequired: field.isRequired,
      showInCard: field.showInCard,
      showInFilters: field.showInFilters,
      options: field.options || [],
      icon: field.icon || undefined,
    });
    setWizardStep("config"); // Skip type selection when editing
    setIsEditing(true);
  }, []);

  // Close dialogs
  const handleClose = useCallback(() => {
    setIsCreating(false);
    setIsEditing(false);
    setEditingField(null);
    resetWizard();
  }, [resetWizard]);

  // Save field (create or update)
  const handleSave = useCallback(async () => {
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
  }, [formData, editingField, householdId, setFields, handleClose]);

  // Delete field
  const handleDelete = useCallback(async (id: string) => {
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
  }, [setFields]);

  // Add option for select fields
  const handleAddOption = useCallback(() => {
    const newOption: SelectOption = {
      value: "",
      label: "",
      color: COLOR_OPTIONS[(formData.options?.length || 0) % COLOR_OPTIONS.length].value,
    };
    setFormData((prev) => ({
      ...prev,
      options: [...(prev.options || []), newOption],
    }));
  }, [formData.options?.length]);

  // Update option
  const handleUpdateOption = useCallback((index: number, updates: Partial<SelectOption>) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options?.map((opt, i) =>
        i === index ? { ...opt, ...updates } : opt
      ),
    }));
  }, []);

  // Remove option
  const handleRemoveOption = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options?.filter((_, i) => i !== index),
    }));
  }, []);

  // Wizard navigation
  const getNextStep = useCallback((): WizardStep | null => {
    switch (wizardStep) {
      case "type":
        return "config";
      case "config":
        return formData.fieldType === "select" || formData.fieldType === "multi_select"
          ? "options"
          : "display";
      case "options":
        return "display";
      case "display":
        return "preview";
      case "preview":
        return null;
    }
  }, [wizardStep, formData.fieldType]);

  const getPrevStep = useCallback((): WizardStep | null => {
    switch (wizardStep) {
      case "type":
        return null;
      case "config":
        return "type";
      case "options":
        return "config";
      case "display":
        return formData.fieldType === "select" || formData.fieldType === "multi_select"
          ? "options"
          : "config";
      case "preview":
        return "display";
    }
  }, [wizardStep, formData.fieldType]);

  const canProceed = useCallback((): boolean => {
    switch (wizardStep) {
      case "type":
        return !!formData.fieldType;
      case "config":
        return !!formData.name.trim();
      case "options":
        return (
          !!formData.options &&
          formData.options.length > 0 &&
          formData.options.every((o) => o.label.trim() && o.value.trim())
        );
      case "display":
        return true;
      case "preview":
        return true;
    }
  }, [wizardStep, formData]);

  // Reorder handler
  const handleReorder = useCallback(async (orderedIds: string[]) => {
    const result = await reorderFieldDefinitions(householdId, orderedIds);
    if (result.error) {
      toast.error("Failed to save order");
    }
  }, [householdId]);

  return {
    // Dialog state
    isCreating,
    isEditing,
    editingField,
    deleteConfirmId,
    isSaving,
    setDeleteConfirmId,

    // Wizard state
    wizardStep,
    setWizardStep,
    formData,
    setFormData,

    // Handlers
    handleCreate,
    handleEdit,
    handleClose,
    handleSave,
    handleDelete,
    handleAddOption,
    handleUpdateOption,
    handleRemoveOption,
    handleReorder,

    // Navigation
    getNextStep,
    getPrevStep,
    canProceed,
  };
}
