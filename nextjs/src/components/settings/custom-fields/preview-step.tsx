import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Star, Eye, Filter } from "lucide-react";
import type { CustomFieldDefinitionFormData } from "@/types/custom-fields";
import { FIELD_TYPE_META } from "./constants";

interface PreviewStepProps {
  formData: CustomFieldDefinitionFormData;
}

export function PreviewStep({ formData }: PreviewStepProps) {
  return (
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
        {formData.fieldType === "date" && <Input type="date" disabled />}
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
          {formData.isRequired && <Badge variant="secondary">Required</Badge>}
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
  );
}
