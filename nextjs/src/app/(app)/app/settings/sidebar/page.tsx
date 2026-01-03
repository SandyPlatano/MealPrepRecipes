"use client";

import { PanelLeft, Keyboard } from "lucide-react";
import { SettingsHeader } from "@/components/settings/layout/settings-header";
import { SettingSection } from "@/components/settings/shared/setting-row";
import { Card, CardContent } from "@/components/ui/card";

export default function SidebarSettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <SettingsHeader
        title="Sidebar"
        description="Your sidebar navigation settings"
      />

      <SettingSection
        title="Keyboard Shortcut"
        description="Quickly toggle the sidebar"
      >
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <PanelLeft className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Toggle Sidebar</p>
                  <p className="text-sm text-muted-foreground">
                    Collapse or expand the sidebar
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 text-xs font-medium bg-muted rounded border">
                  ⌘
                </kbd>
                <span className="text-muted-foreground">+</span>
                <kbd className="px-2 py-1 text-xs font-medium bg-muted rounded border">
                  B
                </kbd>
              </div>
            </div>
          </CardContent>
        </Card>
      </SettingSection>

      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <Keyboard className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">Tip</p>
            <p className="text-xs text-muted-foreground">
              Use <kbd className="px-1 py-0.5 text-xs bg-muted rounded">⌘B</kbd> (or <kbd className="px-1 py-0.5 text-xs bg-muted rounded">Ctrl+B</kbd> on Windows) to quickly toggle the sidebar while working.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
