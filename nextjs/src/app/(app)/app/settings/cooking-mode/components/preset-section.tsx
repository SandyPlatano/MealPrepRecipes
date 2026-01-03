"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Star } from "lucide-react";
import { COOK_MODE_PRESETS } from "@/lib/cook-mode-presets";
import type { CookModeSettings, CustomCookModePreset } from "@/types/settings";

const PRESET_ICONS = {
  Minus: () => <span>−</span>,
  Sparkles: () => <span>✨</span>,
  Hand: () => <span>✋</span>,
  Focus: () => <span>🎯</span>,
  Star: () => <Star className="h-4 w-4" />,
};

interface PresetSectionProps {
  customPresets: CustomCookModePreset[];
  onApplyPreset: (settings: CookModeSettings) => void;
  onCreatePreset: () => void;
  onDeletePreset: (presetId: string) => void;
  onSetDefault: (presetId: string | null) => void;
}

export function PresetSection({
  customPresets,
  onApplyPreset,
  onCreatePreset,
  onDeletePreset,
  onSetDefault,
}: PresetSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-mono font-semibold">Presets</h2>
          <p className="text-sm text-muted-foreground">
            Quick configurations for different cooking styles
          </p>
        </div>
        <Button onClick={onCreatePreset} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Create Preset
        </Button>
      </div>

      {/* Built-in Presets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {COOK_MODE_PRESETS.map((preset) => {
          const Icon = PRESET_ICONS[preset.icon as keyof typeof PRESET_ICONS];
          return (
            <Card key={preset.key} className="group hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {Icon && <Icon />}
                    <CardTitle className="text-base">{preset.name}</CardTitle>
                  </div>
                </div>
                <CardDescription className="text-xs">
                  {preset.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => onApplyPreset(preset.settings)}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Apply
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Custom Presets */}
      {customPresets.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-medium text-muted-foreground">Your Presets</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {customPresets.map((preset) => {
              const Icon = PRESET_ICONS[preset.icon as keyof typeof PRESET_ICONS] || PRESET_ICONS.Star;
              return (
                <Card key={preset.id} className="group hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Icon />
                        <CardTitle className="text-base">{preset.name}</CardTitle>
                      </div>
                      {preset.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => onApplyPreset(preset.settings)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        Apply
                      </Button>
                      <Button
                        onClick={() => onDeletePreset(preset.id)}
                        variant="ghost"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {!preset.isDefault && (
                      <Button
                        onClick={() => onSetDefault(preset.id)}
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs"
                      >
                        Set as Default
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
