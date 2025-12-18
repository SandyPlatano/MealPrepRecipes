"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useSidebar, SIDEBAR_DIMENSIONS } from "./sidebar-context";
import {
  getSnapPreset,
  snapToNearestPreset,
} from "@/lib/sidebar/sidebar-storage";

interface SidebarResizeHandleProps {
  className?: string;
}

export function SidebarResizeHandle({ className }: SidebarResizeHandleProps) {
  const { width, setWidth, isMobile, isCollapsed, expand } = useSidebar();
  const [isDragging, setIsDragging] = React.useState(false);
  const [showTooltip, setShowTooltip] = React.useState(false);
  const [tooltipWidth, setTooltipWidth] = React.useState(width);

  const startXRef = React.useRef(0);
  const startWidthRef = React.useRef(0);

  // Don't render on mobile - sidebar becomes a sheet
  if (isMobile) return null;

  const handleMouseDown = React.useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      setIsDragging(true);
      setShowTooltip(true);
      startXRef.current = e.clientX;
      startWidthRef.current = isCollapsed
        ? SIDEBAR_DIMENSIONS.MIN_WIDTH
        : width;

      // If collapsed, expand first so we can see the resize
      if (isCollapsed) {
        expand();
      }

      // Set global cursor and prevent text selection
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [isCollapsed, width, expand]
  );

  const handleMouseMove = React.useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const delta = e.clientX - startXRef.current;
      const rawWidth = startWidthRef.current + delta;

      // Clamp to min/max
      const clampedWidth = Math.max(
        SIDEBAR_DIMENSIONS.MIN_WIDTH,
        Math.min(SIDEBAR_DIMENSIONS.MAX_WIDTH, rawWidth)
      );

      // Apply snap
      const snappedWidth = snapToNearestPreset(clampedWidth);

      setTooltipWidth(snappedWidth);
      setWidth(snappedWidth);
    },
    [isDragging, setWidth]
  );

  const handleMouseUp = React.useCallback(() => {
    if (!isDragging) return;

    setIsDragging(false);
    setShowTooltip(false);

    // Reset global styles
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, [isDragging]);

  // Double-click resets to default width
  const handleDoubleClick = React.useCallback(() => {
    setWidth(SIDEBAR_DIMENSIONS.DEFAULT_WIDTH);
    if (isCollapsed) {
      expand();
    }
  }, [setWidth, isCollapsed, expand]);

  // Keyboard accessibility
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      const step = e.shiftKey ? 50 : 10;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          setWidth(
            snapToNearestPreset(
              Math.max(SIDEBAR_DIMENSIONS.MIN_WIDTH, width - step)
            )
          );
          break;
        case "ArrowRight":
          e.preventDefault();
          setWidth(
            snapToNearestPreset(
              Math.min(SIDEBAR_DIMENSIONS.MAX_WIDTH, width + step)
            )
          );
          break;
        case "Home":
          e.preventDefault();
          setWidth(SIDEBAR_DIMENSIONS.MIN_WIDTH);
          break;
        case "End":
          e.preventDefault();
          setWidth(SIDEBAR_DIMENSIONS.MAX_WIDTH);
          break;
      }
    },
    [width, setWidth]
  );

  // Attach global mouse events during drag
  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Sync tooltip width when not dragging
  React.useEffect(() => {
    if (!isDragging) {
      setTooltipWidth(width);
    }
  }, [width, isDragging]);

  // Get tooltip label
  const preset = getSnapPreset(tooltipWidth);
  const tooltipLabel = preset ? preset.label : `${tooltipWidth}px`;

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-valuenow={width}
      aria-valuemin={SIDEBAR_DIMENSIONS.MIN_WIDTH}
      aria-valuemax={SIDEBAR_DIMENSIONS.MAX_WIDTH}
      aria-label="Resize sidebar"
      tabIndex={0}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        // Positioning
        "absolute right-0 top-0 bottom-0 z-20",
        // Size - thin line with extended hit area via pseudo-element
        "w-1",
        // Cursor
        "cursor-col-resize",
        // Visual states
        "bg-transparent",
        "hover:bg-primary/30",
        "focus-visible:bg-primary/30 focus-visible:outline-none",
        isDragging && "bg-primary/50",
        // Smooth transition when not dragging
        !isDragging && "transition-colors duration-150",
        className
      )}
    >
      {/* Extended hit area for easier grabbing */}
      <div className="absolute inset-y-0 -left-1 -right-1" />

      {/* Tooltip during drag or hover */}
      {showTooltip && (
        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 left-3",
            "px-2 py-1 rounded-md text-xs font-medium",
            "bg-popover text-popover-foreground border shadow-md",
            "whitespace-nowrap pointer-events-none",
            "animate-in fade-in-0 zoom-in-95 duration-150"
          )}
        >
          {tooltipLabel}
        </div>
      )}
    </div>
  );
}
