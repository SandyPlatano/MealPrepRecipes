import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Eye, Filter } from "lucide-react";
import type { CustomFieldDefinitionFormData } from "@/types/custom-fields";

interface DisplayStepProps {
  formData: CustomFieldDefinitionFormData;
  onUpdate: (updates: Partial<CustomFieldDefinitionFormData>) => void;
}

export function DisplayStep({ formData, onUpdate }: DisplayStepProps) {
  return (
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
          onCheckedChange={(checked) => onUpdate({ showInCard: checked })}
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
          onCheckedChange={(checked) => onUpdate({ showInFilters: checked })}
        />
      </div>
    </div>
  );
}
