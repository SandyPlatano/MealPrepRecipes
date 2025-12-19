"use client";

import { useSettings } from "@/contexts/settings-context";
import { SettingsSearch } from "../search/settings-search";
import { AutoSaveIndicator } from "../shared/auto-save-indicator";
import { UndoButton } from "../shared/undo-button";

interface SettingsHeaderProps {
  title: string;
  description?: string;
}

export function SettingsHeader({ title, description }: SettingsHeaderProps) {
  const { saveStatus, lastSavedAt, canUndo, lastChange, undoLastChange } = useSettings();

  return (
    <div className="flex flex-col gap-4 pb-6 border-b">
      {/* Search bar - visible on all screens */}
      <div className="max-w-md">
        <SettingsSearch />
      </div>

      {/* Title, undo button, and save indicator */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-mono font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <UndoButton
            canUndo={canUndo}
            lastChange={lastChange}
            onUndo={undoLastChange}
          />
          <AutoSaveIndicator status={saveStatus} lastSavedAt={lastSavedAt} />
        </div>
      </div>
    </div>
  );
}
