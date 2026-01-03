import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type {
  CustomFieldDefinition,
  CustomFieldDefinitionFormData,
  SelectOption,
} from "@/types/custom-fields";
import { TypeSelectorStep } from "./type-selector-step";
import { ConfigStep } from "./config-step";
import { OptionsStep } from "./options-step";
import { DisplayStep } from "./display-step";
import { PreviewStep } from "./preview-step";
import { WizardStep, COLOR_OPTIONS } from "./constants";

interface FieldWizardDialogProps {
  isOpen: boolean;
  editingField: CustomFieldDefinition | null;
  onClose: () => void;
  onSave: (formData: CustomFieldDefinitionFormData) => void;
  isSaving: boolean;
}

export function FieldWizardDialog({
  isOpen,
  editingField,
  onClose,
  onSave,
  isSaving,
}: FieldWizardDialogProps) {
  const [wizardStep, setWizardStep] = useState<WizardStep>(
    editingField ? "config" : "type"
  );
  const [formData, setFormData] = useState<CustomFieldDefinitionFormData>(
    editingField
      ? {
          name: editingField.name,
          fieldType: editingField.fieldType,
          description: editingField.description || "",
          isRequired: editingField.isRequired,
          showInCard: editingField.showInCard,
          showInFilters: editingField.showInFilters,
          options: editingField.options || [],
          icon: editingField.icon || undefined,
        }
      : {
          name: "",
          fieldType: "text",
          description: "",
          isRequired: false,
          showInCard: false,
          showInFilters: true,
          options: [],
        }
  );

  const resetWizard = () => {
    setWizardStep(editingField ? "config" : "type");
    setFormData(
      editingField
        ? {
            name: editingField.name,
            fieldType: editingField.fieldType,
            description: editingField.description || "",
            isRequired: editingField.isRequired,
            showInCard: editingField.showInCard,
            showInFilters: editingField.showInFilters,
            options: editingField.options || [],
            icon: editingField.icon || undefined,
          }
        : {
            name: "",
            fieldType: "text",
            description: "",
            isRequired: false,
            showInCard: false,
            showInFilters: true,
            options: [],
          }
    );
  };

  const handleClose = () => {
    resetWizard();
    onClose();
  };

  const handleUpdate = (updates: Partial<CustomFieldDefinitionFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

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

  const handleUpdateOption = (index: number, updates: Partial<SelectOption>) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options?.map((opt, i) => (i === index ? { ...opt, ...updates } : opt)),
    }));
  };

  const handleRemoveOption = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options?.filter((_, i) => i !== index),
    }));
  };

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
        return editingField ? null : "type";
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

  const getStepDescription = (): string => {
    switch (wizardStep) {
      case "type":
        return "Choose the type of field";
      case "config":
        return "Configure field properties";
      case "options":
        return "Add options for this field";
      case "display":
        return "Configure display settings";
      case "preview":
        return "Preview how your field will look";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingField ? "Edit Field" : "Create Custom Field"}
          </DialogTitle>
          <DialogDescription>{getStepDescription()}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {wizardStep === "type" && (
            <TypeSelectorStep
              selectedType={formData.fieldType}
              onTypeSelect={(type) => handleUpdate({ fieldType: type })}
            />
          )}

          {wizardStep === "config" && (
            <ConfigStep formData={formData} onUpdate={handleUpdate} />
          )}

          {wizardStep === "options" && (
            <OptionsStep
              options={formData.options || []}
              onAddOption={handleAddOption}
              onUpdateOption={handleUpdateOption}
              onRemoveOption={handleRemoveOption}
            />
          )}

          {wizardStep === "display" && (
            <DisplayStep formData={formData} onUpdate={handleUpdate} />
          )}

          {wizardStep === "preview" && <PreviewStep formData={formData} />}
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
              <Button onClick={() => onSave(formData)} disabled={isSaving}>
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
  );
}
