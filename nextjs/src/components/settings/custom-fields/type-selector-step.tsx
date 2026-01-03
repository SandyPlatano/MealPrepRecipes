import { cn } from "@/lib/utils";
import type { CustomFieldType } from "@/types/custom-fields";
import { FIELD_TYPES, FIELD_TYPE_META } from "./constants";

interface TypeSelectorStepProps {
  selectedType: CustomFieldType;
  onTypeSelect: (type: CustomFieldType) => void;
}

export function TypeSelectorStep({ selectedType, onTypeSelect }: TypeSelectorStepProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {FIELD_TYPES.map((type) => {
        const meta = FIELD_TYPE_META[type];
        const Icon = meta.icon;
        const isSelected = selectedType === type;

        return (
          <button
            type="button"
            key={type}
            onClick={() => onTypeSelect(type)}
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
  );
}
