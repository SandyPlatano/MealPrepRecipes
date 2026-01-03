import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { CustomFieldDefinitionFormData } from "@/types/custom-fields";

interface ConfigStepProps {
  formData: CustomFieldDefinitionFormData;
  onUpdate: (updates: Partial<CustomFieldDefinitionFormData>) => void;
}

export function ConfigStep({ formData, onUpdate }: ConfigStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Field Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="e.g., Wine Pairing, Spice Level"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={formData.description || ""}
          onChange={(e) => onUpdate({ description: e.target.value })}
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
          onCheckedChange={(checked) => onUpdate({ isRequired: checked })}
        />
      </div>
    </div>
  );
}
