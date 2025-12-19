"use client";

import { cn } from "@/lib/utils";
import { Check, Loader2, AlertCircle, Cloud } from "lucide-react";
import type { SaveStatus } from "@/contexts/settings-context";

interface AutoSaveIndicatorProps {
  status: SaveStatus;
  lastSavedAt?: Date | null;
  className?: string;
}

export function AutoSaveIndicator({
  status,
  lastSavedAt,
  className,
}: AutoSaveIndicatorProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-xs transition-all duration-300",
        status === "idle" && "text-muted-foreground opacity-60",
        status === "saving" && "text-muted-foreground",
        status === "saved" && "text-green-600 dark:text-green-500",
        status === "error" && "text-destructive",
        className
      )}
    >
      {status === "saving" && (
        <>
          <Loader2 className="size-3.5 animate-spin" />
          <span>Saving...</span>
        </>
      )}
      {status === "saved" && (
        <>
          <Check className="size-3.5" />
          <span>Saved</span>
        </>
      )}
      {status === "error" && (
        <>
          <AlertCircle className="size-3.5" />
          <span>Failed to save</span>
        </>
      )}
      {status === "idle" && lastSavedAt && (
        <>
          <Cloud className="size-3.5" />
          <span>Saved {formatRelativeTime(lastSavedAt)}</span>
        </>
      )}
    </div>
  );
}

function formatRelativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;

  return date.toLocaleDateString();
}
