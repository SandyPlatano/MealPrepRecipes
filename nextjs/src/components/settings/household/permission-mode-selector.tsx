"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Baby } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PermissionMode, HouseholdRole } from "@/types/household-permissions";
import { PERMISSION_MODE_CONFIG } from "@/types/household-permissions";

interface PermissionModeOption {
  value: PermissionMode;
  icon: typeof Shield;
  label: string;
  description: string;
  availableRoles: HouseholdRole[];
}

const PERMISSION_MODES: PermissionModeOption[] = [
  {
    value: "equal",
    icon: Users,
    label: PERMISSION_MODE_CONFIG.equal.label,
    description: PERMISSION_MODE_CONFIG.equal.description,
    availableRoles: PERMISSION_MODE_CONFIG.equal.availableRoles,
  },
  {
    value: "managed",
    icon: Shield,
    label: PERMISSION_MODE_CONFIG.managed.label,
    description: PERMISSION_MODE_CONFIG.managed.description,
    availableRoles: PERMISSION_MODE_CONFIG.managed.availableRoles,
  },
  {
    value: "family",
    icon: Baby,
    label: PERMISSION_MODE_CONFIG.family.label,
    description: PERMISSION_MODE_CONFIG.family.description,
    availableRoles: PERMISSION_MODE_CONFIG.family.availableRoles,
  },
];

interface PermissionModeSelectorProps {
  value: PermissionMode;
  onChange: (mode: PermissionMode) => void;
  isOwner: boolean;
  className?: string;
}

export function PermissionModeSelector({
  value,
  onChange,
  isOwner,
  className,
}: PermissionModeSelectorProps) {
  return (
    <RadioGroup
      value={value}
      onValueChange={(v) => onChange(v as PermissionMode)}
      disabled={!isOwner}
      className={cn("gap-3", className)}
    >
      {PERMISSION_MODES.map((mode) => {
        const Icon = mode.icon;
        const isSelected = value === mode.value;

        return (
          <label
            key={mode.value}
            htmlFor={`mode-${mode.value}`}
            className={cn(
              "flex items-start gap-4 rounded-lg border-2 p-4 cursor-pointer transition-all",
              isSelected
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50",
              !isOwner && "opacity-60 cursor-not-allowed"
            )}
          >
            <RadioGroupItem
              value={mode.value}
              id={`mode-${mode.value}`}
              className="mt-1"
            />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-primary" />
                <span className="font-medium">{mode.label}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {mode.description}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {mode.availableRoles.map((role) => (
                  <Badge key={role} variant="outline" className="text-xs">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
          </label>
        );
      })}
    </RadioGroup>
  );
}
