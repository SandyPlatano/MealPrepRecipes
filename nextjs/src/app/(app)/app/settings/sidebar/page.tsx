"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { SettingsHeader } from "@/components/settings/layout/settings-header";
import { SettingSection, SettingRow } from "@/components/settings/shared/setting-row";
import { SidebarSectionsManager } from "@/components/settings/sidebar/sidebar-sections-manager";
import { CustomLinkEditor } from "@/components/settings/sidebar/custom-link-editor";
import { useSidebar } from "@/components/sidebar/sidebar-context";
import type { CustomSectionConfig } from "@/types/sidebar-customization";

export default function SidebarSettingsPage() {
  const {
    sections,
    sectionOrder,
    reducedMotion,
    addCustomSectionItem,
    removeCustomSectionItem,
  } = useSidebar();

  // Track which custom sections are expanded for link editing
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Get custom sections in order
  const customSections = sectionOrder
    .map((id) => sections[id])
    .filter((s): s is CustomSectionConfig => s?.type === "custom");

  const toggleSectionExpanded = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  return (
    <div className="space-y-8">
      <SettingsHeader
        title="Sidebar"
        description="Customize your sidebar sections, order, and appearance"
      />

      {/* Section 1: Section Order & Visibility */}
      <SettingSection
        title="Sections"
        description="Drag to reorder sections. Click the eye to show or hide them."
      >
        <div className="pt-2">
          <SidebarSectionsManager />
        </div>
      </SettingSection>

      {/* Section 2: Custom Section Links */}
      {customSections.length > 0 && (
        <SettingSection
          title="Custom Section Links"
          description="Manage the links in your custom sections"
        >
          <div className="space-y-3 pt-2">
            {customSections.map((section) => {
              const isExpanded = expandedSections.has(section.id);
              return (
                <div
                  key={section.id}
                  className="border rounded-lg overflow-hidden"
                >
                  {/* Section Header */}
                  <button
                    type="button"
                    className={cn(
                      "w-full flex items-center gap-3 p-3 text-left hover:bg-muted/50 transition-colors",
                      isExpanded && "bg-muted/30"
                    )}
                    onClick={() => toggleSectionExpanded(section.id)}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                    {section.emoji && (
                      <span className="text-lg shrink-0">{section.emoji}</span>
                    )}
                    <span className="text-sm font-medium flex-1">
                      {section.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {section.items.length} {section.items.length === 1 ? "link" : "links"}
                    </span>
                  </button>

                  {/* Section Content */}
                  {isExpanded && (
                    <div className="border-t p-3 bg-muted/20">
                      <CustomLinkEditor
                        section={section}
                        onAddItem={addCustomSectionItem}
                        onRemoveItem={removeCustomSectionItem}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </SettingSection>
      )}

      {/* Section 3: Display Options */}
      <SettingSection
        title="Display"
        description="Additional display options for the sidebar"
      >
        <SettingRow
          id="reduced-motion"
          label="Reduce motion"
          description="Disable animations and transitions in the sidebar"
        >
          <Switch
            id="reduced-motion-control"
            checked={reducedMotion}
            disabled
            // TODO: Wire up to context when implemented
          />
        </SettingRow>
      </SettingSection>

      {/* Helpful tips */}
      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <Settings2 className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Sidebar Tips</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Drag sections to change their order in the sidebar</li>
              <li>• Click the pencil icon to rename sections or add emojis</li>
              <li>• Hide sections you don&apos;t use with the eye icon</li>
              <li>• Create custom sections for your favorite links and recipes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
