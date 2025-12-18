"use client";

import { cn } from "@/lib/utils";
import { Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { SettingsChange } from "@/types/settings-history";
import { formatValueForDisplay } from "@/lib/settings/setting-labels";

interface UndoButtonProps {
  canUndo: boolean;
  lastChange: SettingsChange | null;
  onUndo: () => void;
  className?: string;
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return date.toLocaleTimeString();
}

export function UndoButton({
  canUndo,
  lastChange,
  onUndo,
  className,
}: UndoButtonProps) {
  if (!canUndo || !lastChange) return null;

  const timeAgo = formatTimeAgo(lastChange.timestamp);
  const fromValue = formatValueForDisplay(lastChange.oldValue);
  const toValue = formatValueForDisplay(lastChange.newValue);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onUndo}
            className={cn(
              "gap-1.5 text-muted-foreground hover:text-foreground transition-colors",
              className
            )}
          >
            <Undo2 className="h-3.5 w-3.5" />
            <span className="text-xs">Undo</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[200px]">
          <p className="font-medium">Undo: {lastChange.settingLabel}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {toValue} → {fromValue}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{timeAgo}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
