"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DeleteConfirmation } from "../customizable-list";
import type { CustomFieldDefinition } from "@/types/custom-fields";
import { FieldListItem } from "./field-list-item";
import { FieldWizardDialog } from "./field-wizard-dialog";
import { useFieldManagement } from "./use-field-management";

interface CustomFieldsSectionProps {
  householdId: string;
  initialFields: CustomFieldDefinition[];
}

export function CustomFieldsSection({
  householdId,
  initialFields,
}: CustomFieldsSectionProps) {
  const {
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
  } = useFieldManagement({ householdId, initialFields });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle>Custom Recipe Fields</CardTitle>
            <CardDescription>
              Add custom metadata fields to your recipes (wine pairing, spice level, etc.)
            </CardDescription>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="size-4 mr-2" />
            Add Field
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {fields.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No custom fields yet</p>
            <p className="text-sm mt-1">Click "Add Field" to create your first custom field</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {fields.map((field, index) => (
              <FieldListItem
                key={field.id}
                field={field}
                index={index}
                isDragging={isDragging}
                draggedIndex={draggedIndex}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onEdit={handleEdit}
                onDelete={setDeleteConfirmId}
              />
            ))}
          </div>
        )}
      </CardContent>

      {/* Create/Edit Dialog */}
      <FieldWizardDialog
        isOpen={isCreating || isEditing}
        editingField={editingField}
        onClose={handleClose}
        onSave={handleSave}
        isSaving={isSaving}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmation
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => deleteConfirmId && handleDelete(deleteConfirmId)}
        title="Delete Custom Field?"
        description="This will permanently delete this field and all its values from all recipes. This action cannot be undone."
      />
    </Card>
  );
}
