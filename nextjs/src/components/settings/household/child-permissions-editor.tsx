"use client";

import { SettingRow } from "@/components/settings/shared/setting-row";
import { Switch } from "@/components/ui/switch";
import { AdvancedToggle } from "@/components/settings/shared/advanced-toggle";
import type { ChildPermissions } from "@/types/household-permissions";

interface ChildPermissionsEditorProps {
  permissions: ChildPermissions;
  onChange: (permissions: ChildPermissions) => void;
  className?: string;
}

interface PermissionOption {
  key: keyof ChildPermissions;
  label: string;
  description: string;
}

const PERMISSION_OPTIONS: PermissionOption[] = [
  {
    key: "canViewRecipes",
    label: "View Recipes",
    description: "Allow viewing recipe details and instructions",
  },
  {
    key: "canViewMealPlan",
    label: "View Meal Plan",
    description: "Allow viewing the household meal plan",
  },
  {
    key: "canViewShoppingList",
    label: "View Shopping List",
    description: "Allow viewing the shopping list",
  },
  {
    key: "canCheckShoppingItems",
    label: "Check Items",
    description: "Allow checking off items from shopping list",
  },
  {
    key: "canLogCooking",
    label: "Log Cooking",
    description: "Allow marking meals as cooked",
  },
  {
    key: "canRateRecipes",
    label: "Rate Recipes",
    description: "Allow rating and reviewing recipes",
  },
  {
    key: "canSuggestRecipes",
    label: "Suggest Recipes",
    description: "Allow suggesting recipes to the meal plan",
  },
];

export function ChildPermissionsEditor({
  permissions,
  onChange,
  className,
}: ChildPermissionsEditorProps) {
  const handleToggle = (key: keyof ChildPermissions) => {
    onChange({
      ...permissions,
      [key]: !permissions[key],
    });
  };

  return (
    <AdvancedToggle
      label="Configure Child Account Permissions"
      defaultOpen={false}
      className={className}
    >
      <div className="divide-y divide-border">
        {PERMISSION_OPTIONS.map((option) => (
          <SettingRow
            key={option.key}
            id={`child-permission-${option.key}`}
            label={option.label}
            description={option.description}
          >
            <Switch
              id={`${option.key}-control`}
              checked={permissions[option.key]}
              onCheckedChange={() => handleToggle(option.key)}
            />
          </SettingRow>
        ))}
      </div>
    </AdvancedToggle>
  );
}
