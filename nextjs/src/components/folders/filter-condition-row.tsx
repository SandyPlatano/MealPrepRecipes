"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Trash2 } from "lucide-react";
import type {
  SmartFilterCondition,
  SmartFilterField,
  SmartFilterOperator,
  SmartFilterFieldMeta,
} from "@/types/smart-folder";
import {
  SMART_FILTER_FIELDS,
  OPERATOR_LABELS,
  getFieldMeta,
} from "@/types/smart-folder";

interface FilterConditionRowProps {
  condition: SmartFilterCondition;
  onChange: (condition: SmartFilterCondition) => void;
  onRemove: () => void;
  canRemove: boolean;
}

// Group fields by category for the dropdown
const FIELD_CATEGORIES = [
  { key: "metadata", label: "Recipe Info" },
  { key: "time", label: "Time" },
  { key: "history", label: "Cooking History" },
  { key: "dietary", label: "Dietary" },
  { key: "nutrition", label: "Nutrition" },
] as const;

export function FilterConditionRow({
  condition,
  onChange,
  onRemove,
  canRemove,
}: FilterConditionRowProps) {
  const fieldMeta = getFieldMeta(condition.field);

  // Handle field change - reset operator and value when field changes
  const handleFieldChange = (newField: string) => {
    const newMeta = getFieldMeta(newField as SmartFilterField);
    const defaultOperator = newMeta?.operators[0] || "eq";
    const defaultValue = getDefaultValue(newMeta, defaultOperator);

    onChange({
      field: newField as SmartFilterField,
      operator: defaultOperator,
      value: defaultValue,
    });
  };

  // Handle operator change - may need to adjust value
  const handleOperatorChange = (newOperator: string) => {
    const op = newOperator as SmartFilterOperator;

    // For null checks, value should be null
    if (op === "is_null" || op === "is_not_null") {
      onChange({ ...condition, operator: op, value: null });
      return;
    }

    // For in/not_in operators, value should be array
    if (op === "in" || op === "not_in") {
      const currentValue: string[] = Array.isArray(condition.value)
        ? condition.value.map(String)
        : condition.value !== null && condition.value !== undefined
        ? [String(condition.value)]
        : [];
      onChange({ ...condition, operator: op, value: currentValue });
      return;
    }

    // Keep existing value for most cases
    onChange({ ...condition, operator: op });
  };

  // Handle value change
  const handleValueChange = (newValue: SmartFilterCondition["value"]) => {
    onChange({ ...condition, value: newValue });
  };

  return (
    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
      {/* Field Selector */}
      <Select value={condition.field} onValueChange={handleFieldChange}>
        <SelectTrigger className="w-[140px] sm:w-[160px]">
          <SelectValue placeholder="Select field" />
        </SelectTrigger>
        <SelectContent className="z-[10000]">
          {FIELD_CATEGORIES.map((category) => {
            const fields = SMART_FILTER_FIELDS.filter(
              (f) => f.category === category.key
            );
            if (fields.length === 0) return null;
            return (
              <SelectGroup key={category.key}>
                <SelectLabel>{category.label}</SelectLabel>
                {fields.map((field) => (
                  <SelectItem key={field.field} value={field.field}>
                    {field.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            );
          })}
        </SelectContent>
      </Select>

      {/* Operator Selector */}
      <Select value={condition.operator} onValueChange={handleOperatorChange}>
        <SelectTrigger className="w-[130px] sm:w-[150px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="z-[10000]">
          {fieldMeta?.operators.map((op) => (
            <SelectItem key={op} value={op}>
              {OPERATOR_LABELS[op]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Value Input - varies by field type and operator */}
      <div className="flex-1 min-w-[120px]">
        <ValueInput
          fieldMeta={fieldMeta}
          operator={condition.operator}
          value={condition.value}
          onChange={handleValueChange}
        />
      </div>

      {/* Remove Button */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        disabled={!canRemove}
        className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

// ============================================
// VALUE INPUT COMPONENT
// ============================================

interface ValueInputProps {
  fieldMeta: SmartFilterFieldMeta | undefined;
  operator: SmartFilterOperator;
  value: SmartFilterCondition["value"];
  onChange: (value: SmartFilterCondition["value"]) => void;
}

function ValueInput({ fieldMeta, operator, value, onChange }: ValueInputProps) {
  // Null operators don't need a value input
  if (operator === "is_null" || operator === "is_not_null") {
    return (
      <div className="text-sm text-muted-foreground italic px-3 py-2">
        (no value needed)
      </div>
    );
  }

  // Boolean fields
  if (fieldMeta?.type === "boolean") {
    return (
      <div className="flex items-center gap-2">
        <Switch
          checked={value === true}
          onCheckedChange={(checked) => onChange(checked)}
        />
        <span className="text-sm">{value === true ? "Yes" : "No"}</span>
      </div>
    );
  }

  // Enum fields (single or multi-select)
  if (fieldMeta?.type === "enum" && fieldMeta.enumOptions) {
    // Multi-select for in/not_in operators
    if (operator === "in" || operator === "not_in") {
      const selectedValues: string[] = Array.isArray(value)
        ? value.map(String)
        : [];
      return (
        <div className="flex flex-wrap gap-1">
          {fieldMeta.enumOptions.map((opt) => {
            const isSelected = selectedValues.includes(opt.value);
            return (
              <Button
                key={opt.value}
                type="button"
                variant={isSelected ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => {
                  if (isSelected) {
                    onChange(selectedValues.filter((v) => v !== opt.value));
                  } else {
                    onChange([...selectedValues, opt.value]);
                  }
                }}
              >
                {opt.label}
              </Button>
            );
          })}
        </div>
      );
    }

    // Single select for eq/neq operators
    return (
      <Select
        value={String(value ?? "")}
        onValueChange={(v) => onChange(v)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent className="z-[10000]">
          {fieldMeta.enumOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  // Number fields
  if (fieldMeta?.type === "number") {
    const numValue = typeof value === "number" ? value : "";
    return (
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={numValue}
          onChange={(e) =>
            onChange(e.target.value ? Number(e.target.value) : null)
          }
          placeholder="Enter value"
          className="w-full"
        />
        {fieldMeta.unit && (
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {fieldMeta.unit}
          </span>
        )}
      </div>
    );
  }

  // Date fields (within_days)
  if (fieldMeta?.type === "date" && operator === "within_days") {
    const numValue = typeof value === "number" ? value : "";
    return (
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min="1"
          value={numValue}
          onChange={(e) =>
            onChange(e.target.value ? Number(e.target.value) : null)
          }
          placeholder="Days"
          className="w-24"
        />
        <span className="text-sm text-muted-foreground">days</span>
      </div>
    );
  }

  // Tags fields - simple text input (comma separated or single)
  if (fieldMeta?.type === "tags") {
    return (
      <Input
        type="text"
        value={String(value ?? "")}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter tag"
        className="w-full"
      />
    );
  }

  // Default: text input
  return (
    <Input
      type="text"
      value={String(value ?? "")}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Enter value"
      className="w-full"
    />
  );
}

// ============================================
// HELPERS
// ============================================

function getDefaultValue(
  fieldMeta: SmartFilterFieldMeta | undefined,
  operator: SmartFilterOperator
): SmartFilterCondition["value"] {
  if (operator === "is_null" || operator === "is_not_null") {
    return null;
  }

  if (operator === "in" || operator === "not_in") {
    return [];
  }

  if (!fieldMeta) return null;

  switch (fieldMeta.type) {
    case "boolean":
      return true;
    case "number":
      return null;
    case "enum":
      return fieldMeta.enumOptions?.[0]?.value ?? null;
    case "date":
      return 30; // Default to 30 days
    case "tags":
      return "";
    default:
      return null;
  }
}
