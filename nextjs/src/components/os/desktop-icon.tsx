"use client";

import { cn } from "@/lib/utils";
import { type ReactNode, useState } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// MEAL PREP OS - Desktop Icon Component
// Clickable shortcut icons for the desktop
// ═══════════════════════════════════════════════════════════════════════════════

interface DesktopIconProps {
  /** Icon content (32x32 recommended) */
  icon: ReactNode;
  /** Label text below the icon */
  label: string;
  /** Callback when double-clicked */
  onDoubleClick?: () => void;
  /** Callback when single-clicked (selection) */
  onClick?: () => void;
  /** Whether this icon is selected */
  isSelected?: boolean;
  /** Additional class names */
  className?: string;
}

export function DesktopIcon({
  icon,
  label,
  onDoubleClick,
  onClick,
  isSelected,
  className,
}: DesktopIconProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex flex-col items-center gap-1 p-1 w-[72px]",
        "cursor-pointer select-none",
        "focus-visible:outline-none",
        "group",
        className
      )}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      {/* Icon */}
      <div
        className={cn(
          "w-8 h-8 flex items-center justify-center",
          "os-pixel-perfect",
          // Selection highlight
          isSelected && "bg-os-titlebar/50"
        )}
      >
        {icon}
      </div>

      {/* Label */}
      <span
        className={cn(
          "text-[11px] font-system text-center leading-tight",
          "px-1 max-w-full",
          // Text styling depends on desktop background
          "text-os-text-light drop-shadow-[1px_1px_0_rgba(0,0,0,0.8)]",
          // Selection state
          isSelected
            ? "bg-os-titlebar text-os-text-light"
            : "group-focus-visible:bg-os-titlebar group-focus-visible:text-os-text-light"
        )}
        style={{
          // Limit to 2 lines with ellipsis
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {label}
      </span>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Desktop Icon Grid
// ═══════════════════════════════════════════════════════════════════════════════

interface DesktopIconGridProps {
  children: ReactNode;
  className?: string;
}

export function DesktopIconGrid({ children, className }: DesktopIconGridProps) {
  return (
    <div
      className={cn(
        "grid gap-2 p-4",
        // Auto-fit columns for icon grid
        "grid-cols-[repeat(auto-fill,72px)]",
        "auto-rows-[84px]",
        // Align to top-left
        "content-start items-start justify-start",
        className
      )}
    >
      {children}
    </div>
  );
}

export default DesktopIcon;
