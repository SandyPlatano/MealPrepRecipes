"use client";

import { cn } from "@/lib/utils";
import { X, Minus, Square, Copy } from "lucide-react";
import { useState, type ReactNode } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// MEAL PREP OS - WindowChrome Component
// The core building block for all OS-style windows
// ═══════════════════════════════════════════════════════════════════════════════

interface WindowChromeProps {
  /** Window title displayed in the titlebar */
  title: string;
  /** Optional icon element (16x16 recommended) */
  icon?: ReactNode;
  /** Window content */
  children: ReactNode;
  /** Additional class names for the window container */
  className?: string;
  /** Additional class names for the content area */
  contentClassName?: string;
  /** Whether this window is currently active/focused */
  isActive?: boolean;
  /** Whether to show minimize button */
  showMinimize?: boolean;
  /** Whether to show maximize button */
  showMaximize?: boolean;
  /** Whether to show close button */
  showClose?: boolean;
  /** Callback when minimize is clicked */
  onMinimize?: () => void;
  /** Callback when maximize is clicked */
  onMaximize?: () => void;
  /** Callback when close is clicked */
  onClose?: () => void;
  /** Optional status bar content */
  statusBar?: ReactNode;
  /** Optional menu bar (File, Edit, View, etc.) */
  menuBar?: ReactNode;
  /** Optional toolbar content */
  toolbar?: ReactNode;
  /** Whether the window is maximized */
  isMaximized?: boolean;
  /** Width of the window (CSS value) */
  width?: string | number;
  /** Height of the window (CSS value) */
  height?: string | number;
  /** Enable animation when window opens */
  animate?: boolean;
}

export function WindowChrome({
  title,
  icon,
  children,
  className,
  contentClassName,
  isActive = true,
  showMinimize = true,
  showMaximize = true,
  showClose = true,
  onMinimize,
  onMaximize,
  onClose,
  statusBar,
  menuBar,
  toolbar,
  isMaximized = false,
  width,
  height,
  animate = true,
}: WindowChromeProps) {
  return (
    <div
      className={cn(
        // Base window styling
        "flex flex-col",
        "bg-os-chrome",
        "border-2 border-solid",
        // Raised bevel effect
        "border-t-os-raised border-l-os-raised",
        "border-b-os-darkest border-r-os-darkest",
        // Shadow
        "shadow-os-window",
        // Animation
        animate && "animate-os-window-open",
        className
      )}
      style={{
        width: width,
        height: height,
      }}
    >
      {/* ═══ Titlebar ═══ */}
      <div
        className={cn(
          "flex items-center gap-1 px-[3px] py-[2px] select-none",
          isActive
            ? "bg-gradient-to-r from-os-titlebar to-os-titlebar-gradient"
            : "bg-os-titlebar-inactive"
        )}
      >
        {/* Icon */}
        {icon && (
          <div className="w-4 h-4 flex items-center justify-center shrink-0 os-pixel-perfect">
            {icon}
          </div>
        )}

        {/* Title */}
        <span
          className={cn(
            "flex-1 text-[11px] font-bold truncate",
            "text-os-text-light font-system",
            "tracking-tight"
          )}
        >
          {title}
        </span>

        {/* Window buttons */}
        <div className="flex items-center gap-[2px]">
          {showMinimize && (
            <WindowButton onClick={onMinimize} aria-label="Minimize">
              <Minus className="w-2.5 h-2.5" strokeWidth={3} />
            </WindowButton>
          )}
          {showMaximize && (
            <WindowButton onClick={onMaximize} aria-label="Maximize">
              {isMaximized ? (
                <Copy className="w-2.5 h-2.5" strokeWidth={2} />
              ) : (
                <Square className="w-2.5 h-2.5" strokeWidth={2} />
              )}
            </WindowButton>
          )}
          {showClose && (
            <WindowButton onClick={onClose} aria-label="Close" isClose>
              <X className="w-3 h-3" strokeWidth={3} />
            </WindowButton>
          )}
        </div>
      </div>

      {/* ═══ Menu Bar (optional) ═══ */}
      {menuBar && (
        <div className="flex items-center bg-os-chrome border-b border-os-sunken px-1 py-[2px]">
          {menuBar}
        </div>
      )}

      {/* ═══ Toolbar (optional) ═══ */}
      {toolbar && (
        <div className="flex items-center gap-1 bg-os-chrome border-b border-os-sunken px-1 py-1">
          {toolbar}
        </div>
      )}

      {/* ═══ Content Area ═══ */}
      <div
        className={cn(
          "flex-1 overflow-auto",
          "bg-os-content",
          // Sunken border effect for content area
          "border-2 border-solid m-[2px]",
          "border-t-os-sunken border-l-os-sunken",
          "border-b-os-raised border-r-os-raised",
          "os-scrollbar os-select",
          contentClassName
        )}
      >
        {children}
      </div>

      {/* ═══ Status Bar (optional) ═══ */}
      {statusBar && (
        <div
          className={cn(
            "flex items-center gap-2 px-1 py-[2px]",
            "bg-os-chrome",
            "text-[11px] text-os-text font-system",
            "border-t border-os-raised"
          )}
        >
          {statusBar}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Window Button Component
// ═══════════════════════════════════════════════════════════════════════════════

interface WindowButtonProps {
  children: ReactNode;
  onClick?: () => void;
  isClose?: boolean;
  "aria-label": string;
}

function WindowButton({
  children,
  onClick,
  isClose,
  "aria-label": ariaLabel,
}: WindowButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <button
      type="button"
      className={cn(
        "w-4 h-4 flex items-center justify-center",
        "bg-os-chrome",
        // Raised bevel
        "border border-solid",
        isPressed
          ? "border-t-os-darkest border-l-os-darkest border-b-os-raised border-r-os-raised"
          : "border-t-os-raised border-l-os-raised border-b-os-darkest border-r-os-darkest",
        // Focus state
        "focus-visible:outline-1 focus-visible:outline-dotted focus-visible:outline-os-text focus-visible:-outline-offset-1",
        // Text color
        isClose ? "text-os-text" : "text-os-text"
      )}
      onClick={onClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Menu Bar Components
// ═══════════════════════════════════════════════════════════════════════════════

interface MenuItemProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export function MenuItem({ children, onClick, disabled }: MenuItemProps) {
  return (
    <button
      type="button"
      className={cn(
        "px-2 py-[1px] text-[11px] font-system",
        "hover:bg-os-titlebar hover:text-os-text-light",
        "focus-visible:bg-os-titlebar focus-visible:text-os-text-light",
        "focus-visible:outline-none",
        disabled && "text-os-text-disabled cursor-not-allowed"
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Status Bar Components
// ═══════════════════════════════════════════════════════════════════════════════

interface StatusBarPaneProps {
  children: ReactNode;
  className?: string;
  /** Whether this pane should expand to fill available space */
  flex?: boolean;
}

export function StatusBarPane({ children, className, flex }: StatusBarPaneProps) {
  return (
    <div
      className={cn(
        "px-2 py-[1px]",
        // Sunken effect
        "border border-solid",
        "border-t-os-sunken border-l-os-sunken",
        "border-b-os-raised border-r-os-raised",
        flex && "flex-1",
        className
      )}
    >
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Exports
// ═══════════════════════════════════════════════════════════════════════════════

export default WindowChrome;
