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
      <div className="flex flex-col gap-0.5">
        <label htmlFor={`${id}-control`} className="text-sm font-medium text-[#1A1A1A]">
          {label}
        </label>
        {description && (
          <p className="text-xs text-gray-600">{description}</p>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

interface SettingSectionProps {
  title: string;
  description?: string;
  badge?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Groups related settings with a title and optional description
 */
export function SettingSection({
  title,
  description,
  badge,
  children,
  className,
}: SettingSectionProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-mono font-semibold text-[#1A1A1A]">{title}</h3>
          {badge && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded bg-[#D9F99D]/30 text-[#1A1A1A]">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="text-sm text-gray-600">{description}</p>
        )}
      </div>
      <div className="divide-y divide-gray-200">{children}</div>
    </div>
  );
}
