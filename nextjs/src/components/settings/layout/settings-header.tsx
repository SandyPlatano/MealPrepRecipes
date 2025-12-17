"use client";

import { useSettingsSaveStatus } from "@/contexts/settings-context";
import { SettingsSearch } from "../search/settings-search";
import { AutoSaveIndicator } from "../shared/auto-save-indicator";

interface SettingsHeaderProps {
  title: string;
  description?: string;
}

export function SettingsHeader({ title, description }: SettingsHeaderProps) {
  const { saveStatus, lastSavedAt } = useSettingsSaveStatus();

  return (
    <div className="space-y-4 pb-6 border-b">
      {/* Search bar - visible on all screens */}
      <div className="max-w-md">
        <SettingsSearch />
      </div>

      {/* Title and save indicator */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-mono font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <AutoSaveIndicator status={saveStatus} lastSavedAt={lastSavedAt} />
      </div>
    </div>
  );
}
