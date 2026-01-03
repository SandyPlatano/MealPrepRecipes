import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import type { SelectOption } from "@/types/custom-fields";
import { COLOR_OPTIONS } from "./constants";

interface OptionsStepProps {
  options: SelectOption[];
  onAddOption: () => void;
  onUpdateOption: (index: number, updates: Partial<SelectOption>) => void;
  onRemoveOption: (index: number) => void;
}

export function OptionsStep({
  options,
  onAddOption,
  onUpdateOption,
  onRemoveOption,
}: OptionsStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Label>Options</Label>
        <Button variant="outline" size="sm" onClick={onAddOption}>
          <Plus className="size-4 mr-1" />
          Add Option
        </Button>
      </div>

      <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={option.label}
              onChange={(e) =>
                onUpdateOption(index, {
                  label: e.target.value,
                  value: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                })
              }
              placeholder="Option label"
            />
            <input
              type="color"
              value={option.color || "#3b82f6"}
              onChange={(e) => onUpdateOption(index, { color: e.target.value })}
              className="h-10 w-16 cursor-pointer rounded border"
            />
            <Button variant="ghost" size="sm" onClick={() => onRemoveOption(index)}>
              <X className="size-4" />
            </Button>
          </div>
        ))}
      </div>

      {options.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Click "Add Option" to create options
        </p>
      )}
    </div>
  );
}
