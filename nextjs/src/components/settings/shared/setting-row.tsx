"use client";

import { cn } from "@/lib/utils";

interface SettingRowProps {
  id: string;
  label: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Reusable setting row layout with label, description, and control
 * The id is used for search scroll-to functionality
 */
export function SettingRow({
  id,
  label,
  description,
  children,
  className,
}: SettingRowProps) {
  return (
    <div
      id={id}
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 transition-all duration-300 rounded-lg px-2 -mx-2",
        className
      )}
    >
      <div className="space-y-0.5">
        <label htmlFor={`${id}-control`} className="text-sm font-medium">
          {label}
        </label>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

interface SettingSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Groups related settings with a title and optional description
 */
export function SettingSection({
  title,
  description,
  children,
  className,
}: SettingSectionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-1">
        <h3 className="text-base font-mono font-semibold">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="divide-y divide-border">{children}</div>
    </div>
  );
}
