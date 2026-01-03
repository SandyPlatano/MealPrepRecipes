"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DeleteConfirmation } from "./customizable-list";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Trash2,
  GripVertical,
  Type,
  Hash,
  ToggleLeft,
  Calendar,
  List,
  CheckSquare,
  Link2,
  Star,
  Eye,
  Filter,
  Pencil,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  createFieldDefinition,
  updateFieldDefinition,
  deleteFieldDefinition,
  reorderFieldDefinitions,
} from "@/app/actions/custom-fields";
import type {
  CustomFieldDefinition,
  CustomFieldDefinitionFormData,
  CustomFieldType,
  SelectOption,
} from "@/types/custom-fields";

interface CustomFieldsSectionProps {
  householdId: string;
  initialFields: CustomFieldDefinition[];
}

// Field type metadata
const FIELD_TYPE_META: Record<
  CustomFieldType,
  { icon: React.ComponentType<{ className?: string }>; label: string; description: string }
> = {
  text: {
    icon: Type,
    label: "Text",
    description: "Short text input (e.g., wine pairing, notes)",
  },
  number: {
    icon: Hash,
    label: "Number",
    description: "Numeric value (e.g., spice level, difficulty)",
  },
  boolean: {
    icon: ToggleLeft,
    label: "Yes/No",
    description: "True/false toggle (e.g., kid-approved, freezer-friendly)",
  },
  date: {
    icon: Calendar,
    label: "Date",
    description: "Date picker (e.g., last made, expiry date)",
  },
  select: {
    icon: List,
    label: "Select",
    description: "Single choice from options (e.g., cuisine type)",
  },
  multi_select: {
    icon: CheckSquare,
    label: "Multi-Select",
    description: "Multiple choices from options (e.g., dietary labels)",
  },
  url: {
    icon: Link2,
    label: "URL",
    description: "Web link (e.g., video tutorial, blog post)",
  },
  rating: {
    icon: Star,
    label: "Rating",
    description: "Star rating (e.g., taste, difficulty)",
  },
};

const FIELD_TYPES: CustomFieldType[] = [
  "text",
  "number",
  "boolean",
  "date",
  "select",
  "multi_select",
  "url",
  "rating",
];

const COLOR_OPTIONS = [
  { value: "#ef4444", label: "Red" },
  { value: "#f97316", label: "Orange" },
  { value: "#eab308", label: "Yellow" },
  { value: "#84cc16", label: "Lime" },
  { value: "#22c55e", label: "Green" },
  { value: "#14b8a6", label: "Teal" },
  { value: "#06b6d4", label: "Cyan" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#8b5cf6", label: "Purple" },
  { value: "#ec4899", label: "Pink" },
];

type WizardStep = "type" | "config" | "options" | "display" | "preview";

export function CustomFieldsSection({
  householdId,
  initialFields,
}: CustomFieldsSectionProps) {
  const [fields, setFields] = useState<CustomFieldDefinition[]>(initialFields);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingField, setEditingField] = useState<CustomFieldDefinition | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Wizard state
  const [wizardStep, setWizardStep] = useState<WizardStep>("type");
  const [formData, setFormData] = useState<CustomFieldDefinitionFormData>({
    name: "",
    fieldType: "text",
    description: "",
    isRequired: false,
    showInCard: false,
    showInFilters: true,
    options: [],
  });

  // Reset wizard when dialog closes
  const resetWizard = () => {
    setWizardStep("type");
    setFormData({
      name: "",
      fieldType: "text",
      description: "",
      isRequired: false,
      showInCard: false,
      showInFilters: true,
      options: [],
    });
  };

  // Open create dialog
  const handleCreate = () => {
    resetWizard();
    setIsCreating(true);
  };

  // Open edit dialog
  const handleEdit = (field: CustomFieldDefinition) => {
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
  };

  // Close dialogs
  const handleClose = () => {
    setIsCreating(false);
    setIsEditing(false);
    setEditingField(null);
    resetWizard();
  };

  // Save field (create or update)
  const handleSave = async () => {
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

  // Delete field
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

  // Drag and drop handlers
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

  // Add option for select fields
  const handleAddOption = () => {
    const newOption: SelectOption = {
      value: "",
      label: "",
      color: COLOR_OPTIONS[formData.options?.length || 0 % COLOR_OPTIONS.length].value,
    };
    setFormData((prev) => ({
      ...prev,
      options: [...(prev.options || []), newOption],
    }));
  };

  // Update option
  const handleUpdateOption = (index: number, updates: Partial<SelectOption>) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options?.map((opt, i) =>
        i === index ? { ...opt, ...updates } : opt
      ),
    }));
  };

  // Remove option
  const handleRemoveOption = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options?.filter((_, i) => i !== index),
    }));
  };

  // Wizard navigation
  const getNextStep = (): WizardStep | null => {
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
  };

  const getPrevStep = (): WizardStep | null => {
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
  };

  const canProceed = (): boolean => {
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
  };

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
            {fields.map((field, index) => {
              const Icon = FIELD_TYPE_META[field.fieldType].icon;
              return (
                <div
                  key={field.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border bg-card transition-all",
                    isDragging && draggedIndex === index && "opacity-50",
                    "hover:border-primary hover:shadow-sm"
                  )}
                >
                  <GripVertical className="size-5 text-muted-foreground cursor-grab active:cursor-grabbing" />
                  <Icon className="size-5 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{field.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {FIELD_TYPE_META[field.fieldType].label}
                      </Badge>
                    </div>
                    {field.description && (
                      <p className="text-sm text-muted-foreground truncate">
                        {field.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {field.isRequired && (
                      <Badge variant="secondary" className="text-xs">
                        Required
                      </Badge>
                    )}
                    {field.showInCard && (
                      <Badge variant="secondary" className="text-xs">
                        <Eye className="size-3 mr-1" />
                        Card
                      </Badge>
                    )}
                    {field.showInFilters && (
                      <Badge variant="secondary" className="text-xs">
                        <Filter className="size-3 mr-1" />
                        Filter
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(field)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteConfirmId(field.id)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreating || isEditing} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingField ? "Edit Field" : "Create Custom Field"}
            </DialogTitle>
            <DialogDescription>
              {wizardStep === "type" && "Choose the type of field"}
              {wizardStep === "config" && "Configure field properties"}
              {wizardStep === "options" && "Add options for this field"}
              {wizardStep === "display" && "Configure display settings"}
              {wizardStep === "preview" && "Preview how your field will look"}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {/* Step 1: Field Type Selection */}
            {wizardStep === "type" && (
              <div className="grid grid-cols-2 gap-3">
                {FIELD_TYPES.map((type) => {
                  const meta = FIELD_TYPE_META[type];
                  const Icon = meta.icon;
                  const isSelected = formData.fieldType === type;

                  return (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setFormData((prev) => ({ ...prev, fieldType: type }))}
                      className={cn(
                        "flex flex-col items-start p-4 rounded-lg border-2 transition-all text-left",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <Icon className="size-6 mb-2" />
                      <span className="font-medium">{meta.label}</span>
                      <span className="text-xs text-muted-foreground mt-1">
                        {meta.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Step 2: Configuration */}
            {wizardStep === "config" && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">Field Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g., Wine Pairing, Spice Level"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Explain what this field is for"
                    rows={3}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <Label>Required Field</Label>
                    <p className="text-sm text-muted-foreground">
                      Must be filled when creating recipes
                    </p>
                  </div>
                  <Switch
                    checked={formData.isRequired}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, isRequired: checked }))
                    }
                  />
                </div>
              </div>
            )}

            {/* Step 3: Options (for select types) */}
            {wizardStep === "options" && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <Label>Options</Label>
                  <Button variant="outline" size="sm" onClick={handleAddOption}>
                    <Plus className="size-4 mr-1" />
                    Add Option
                  </Button>
                </div>

                <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
                  {formData.options?.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={option.label}
                        onChange={(e) =>
                          handleUpdateOption(index, { label: e.target.value, value: e.target.value.toLowerCase().replace(/\s+/g, "_") })
                        }
                        placeholder="Option label"
                      />
                      <input
                        type="color"
                        value={option.color || "#3b82f6"}
                        onChange={(e) =>
                          handleUpdateOption(index, { color: e.target.value })
                        }
                        className="h-10 w-16 cursor-pointer rounded border"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveOption(index)}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {(!formData.options || formData.options.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Click "Add Option" to create options
                  </p>
                )}
              </div>
            )}

            {/* Step 4: Display Settings */}
            {wizardStep === "display" && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <Label className="flex items-center gap-2">
                      <Eye className="size-4" />
                      Show on Recipe Cards
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Display this field on recipe cards in lists
                    </p>
                  </div>
                  <Switch
                    checked={formData.showInCard}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, showInCard: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <Label className="flex items-center gap-2">
                      <Filter className="size-4" />
                      Show in Filters
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Allow filtering recipes by this field
                    </p>
                  </div>
                  <Switch
                    checked={formData.showInFilters}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, showInFilters: checked }))
                    }
                  />
                </div>
              </div>
            )}

            {/* Step 5: Preview */}
            {wizardStep === "preview" && (
              <div className="flex flex-col gap-4">
                <div className="rounded-lg border p-4 bg-muted/30">
                  <Label className="mb-2 block">{formData.name}</Label>
                  {formData.description && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {formData.description}
                    </p>
                  )}

                  {/* Preview different field types */}
                  {formData.fieldType === "text" && (
                    <Input placeholder="Enter text..." disabled />
                  )}
                  {formData.fieldType === "number" && (
                    <Input type="number" placeholder="0" disabled />
                  )}
                  {formData.fieldType === "boolean" && (
                    <div className="flex items-center gap-2">
                      <Switch disabled />
                      <span className="text-sm">Yes/No</span>
                    </div>
                  )}
                  {formData.fieldType === "date" && (
                    <Input type="date" disabled />
                  )}
                  {(formData.fieldType === "select" ||
                    formData.fieldType === "multi_select") && (
                    <div className="flex flex-wrap gap-2">
                      {formData.options?.map((opt, i) => (
                        <Badge
                          key={i}
                          style={{ backgroundColor: opt.color }}
                          className="text-white"
                        >
                          {opt.label}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {formData.fieldType === "url" && (
                    <Input type="url" placeholder="https://..." disabled />
                  )}
                  {formData.fieldType === "rating" && (
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="size-5 text-muted-foreground" />
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {FIELD_TYPE_META[formData.fieldType].label}
                    </Badge>
                    {formData.isRequired && (
                      <Badge variant="secondary">Required</Badge>
                    )}
                  </div>
                  <div className="flex gap-2 text-muted-foreground">
                    {formData.showInCard && (
                      <span className="flex items-center gap-1">
                        <Eye className="size-4" />
                        Visible on cards
                      </span>
                    )}
                    {formData.showInFilters && (
                      <span className="flex items-center gap-1">
                        <Filter className="size-4" />
                        Filterable
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex-row justify-between sm:justify-between">
            <Button
              variant="ghost"
              onClick={() => {
                const prev = getPrevStep();
                if (prev) {
                  setWizardStep(prev);
                } else {
                  handleClose();
                }
              }}
            >
              {getPrevStep() ? "Back" : "Cancel"}
            </Button>

            <div className="flex gap-2">
              {wizardStep === "preview" ? (
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "Saving..." : editingField ? "Update" : "Create"}
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    const next = getNextStep();
                    if (next) setWizardStep(next);
                  }}
                  disabled={!canProceed()}
                >
                  Next
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
