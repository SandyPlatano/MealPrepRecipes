"use client";

import { cn } from "@/lib/utils";
import { useState, type ReactNode } from "react";
import { OsButton } from "./os-button";
import { ChefHat, Volume2, Bell, Wifi } from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// MEAL PREP OS - Taskbar Component
// The bottom bar with Start menu, running apps, and system tray
// ═══════════════════════════════════════════════════════════════════════════════

interface TaskbarProps {
  /** Currently open windows */
  openWindows?: TaskbarWindow[];
  /** Currently active window ID */
  activeWindowId?: string;
  /** Callback when a taskbar window button is clicked */
  onWindowClick?: (id: string) => void;
  /** Callback when Start button is clicked */
  onStartClick?: () => void;
  /** Whether the Start menu is open */
  startMenuOpen?: boolean;
  /** Custom system tray content */
  systemTray?: ReactNode;
}

interface TaskbarWindow {
  id: string;
  title: string;
  icon?: ReactNode;
}

export function Taskbar({
  openWindows = [],
  activeWindowId,
  onWindowClick,
  onStartClick,
  startMenuOpen,
  systemTray,
}: TaskbarProps) {
  const [time, setTime] = useState(() => {
    const now = new Date();
    return now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  });

  // Update time every minute
  useState(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      );
    }, 60000);
    return () => clearInterval(interval);
  });

  return (
    <div
      className={cn(
        "h-[28px] flex items-center",
        "bg-os-chrome",
        // Top border only
        "border-t-2 border-t-os-raised",
        "px-[2px] gap-[2px]"
      )}
    >
      {/* ═══ Start Button ═══ */}
      <OsButton
        onClick={onStartClick}
        pressed={startMenuOpen}
        className="h-[22px] px-2 font-bold"
      >
        <ChefHat className="w-4 h-4 text-food-tomato" />
        <span className="text-[11px]">Start</span>
      </OsButton>

      {/* ═══ Quick Launch Separator ═══ */}
      <div className="w-px h-5 bg-os-sunken mx-1" />

      {/* ═══ Taskbar Windows ═══ */}
      <div className="flex-1 flex items-center gap-[2px] overflow-hidden">
        {openWindows.map((window) => (
          <TaskbarWindowButton
            key={window.id}
            window={window}
            isActive={window.id === activeWindowId}
            onClick={() => onWindowClick?.(window.id)}
          />
        ))}
      </div>

      {/* ═══ System Tray ═══ */}
      <div
        className={cn(
          "flex items-center gap-2 h-[22px] px-2",
          // Sunken border
          "border border-solid",
          "border-t-os-sunken border-l-os-sunken",
          "border-b-os-raised border-r-os-raised"
        )}
      >
        {systemTray || (
          <>
            <Wifi className="w-3.5 h-3.5 text-os-text" />
            <Volume2 className="w-3.5 h-3.5 text-os-text" />
            <Bell className="w-3.5 h-3.5 text-os-text" />
          </>
        )}
        <span className="text-[11px] font-system text-os-text min-w-[55px] text-right">
          {time}
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Taskbar Window Button
// ═══════════════════════════════════════════════════════════════════════════════

interface TaskbarWindowButtonProps {
  window: TaskbarWindow;
  isActive: boolean;
  onClick: () => void;
}

function TaskbarWindowButton({
  window,
  isActive,
  onClick,
}: TaskbarWindowButtonProps) {
  return (
    <button
      className={cn(
        "h-[22px] min-w-[120px] max-w-[180px] px-2",
        "flex items-center gap-1.5",
        "text-[11px] font-system text-left truncate",
        "border border-solid",
        isActive
          ? [
              // Pressed/active state
              "bg-os-chrome",
              "border-t-os-darkest border-l-os-darkest",
              "border-b-os-raised border-r-os-raised",
              "shadow-[inset_1px_1px_0_var(--os-sunken)]",
              // Checkered pattern for active window
              "bg-[repeating-conic-gradient(var(--os-chrome)_0%_25%,var(--os-content)_0%_50%)]",
              "bg-[length:4px_4px]",
            ]
          : [
              // Raised state
              "bg-os-chrome",
              "border-t-os-raised border-l-os-raised",
              "border-b-os-darkest border-r-os-darkest",
            ]
      )}
      onClick={onClick}
    >
      {window.icon && (
        <span className="w-4 h-4 flex items-center justify-center shrink-0">
          {window.icon}
        </span>
      )}
      <span className="truncate">{window.title}</span>
    </button>
  );
}

export default Taskbar;
