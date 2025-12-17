"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { updateAiPersonality } from "@/app/actions/user-preferences";
import type { AiPersonalityType } from "@/types/user-preferences-v2";
import { AI_PERSONALITY_PRESETS } from "@/types/user-preferences-v2";
import { Sparkles, MessageCircle, Briefcase, Heart, Flame } from "lucide-react";

interface AiPersonalitySectionProps {
  userId: string;
  initialPersonality: AiPersonalityType;
  initialCustomPrompt: string | null;
}

const PERSONALITY_ICONS = {
  friendly: MessageCircle,
  professional: Briefcase,
  grandma: Heart,
  gordon: Flame,
  custom: Sparkles,
};

export function AiPersonalitySection({
  userId,
  initialPersonality,
  initialCustomPrompt,
}: AiPersonalitySectionProps) {
  const [personality, setPersonality] = useState<AiPersonalityType>(initialPersonality);
  const [customPrompt, setCustomPrompt] = useState(initialCustomPrompt || "");
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleSelectPersonality = async (selectedPersonality: AiPersonalityType) => {
    setPersonality(selectedPersonality);

    // Only save if not custom (custom requires saving the prompt too)
    if (selectedPersonality !== "custom") {
      setIsSaving(true);
      const result = await updateAiPersonality(userId, selectedPersonality);
      setIsSaving(false);

      if (result.error) {
        toast.error("Failed to update AI personality");
        setPersonality(personality);
      } else {
        toast.success("AI personality updated");
      }
    }
  };

  const handleSaveCustomPrompt = async () => {
    if (!customPrompt.trim()) {
      toast.error("Please enter a custom prompt");
      return;
    }

    setIsSaving(true);
    const result = await updateAiPersonality(userId, "custom", customPrompt);
    setIsSaving(false);

    if (result.error) {
      toast.error("Failed to save custom prompt");
    } else {
      toast.success("Custom AI prompt saved");
    }
  };

  const selectedPreset = AI_PERSONALITY_PRESETS.find((p) => p.id === personality);

  return (
    <div className="space-y-6">
      {/* Preset Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {AI_PERSONALITY_PRESETS.filter((preset) => preset.id !== "custom").map(
          (preset) => {
            const Icon = PERSONALITY_ICONS[preset.id as keyof typeof PERSONALITY_ICONS];
            const isSelected = personality === preset.id;

            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPersonality(preset.id)}
                className={cn(
                  "flex flex-col items-start p-4 rounded-lg border-2 transition-all text-left",
                  "hover:border-primary hover:shadow-md",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card"
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-5 w-5" />
                  <span className="font-semibold">{preset.name}</span>
                  {isSelected && (
                    <Badge variant="secondary" className="ml-auto">
                      Active
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {preset.description}
                </p>
                <div className="text-xs italic text-muted-foreground bg-muted/50 p-2 rounded w-full">
                  "{preset.prompt.substring(0, 80)}..."
                </div>
              </button>
            );
          }
        )}

        {/* Custom Option */}
        <button
          onClick={() => handleSelectPersonality("custom")}
          className={cn(
            "flex flex-col items-start p-4 rounded-lg border-2 transition-all text-left",
            "hover:border-primary hover:shadow-md",
            personality === "custom"
              ? "border-primary bg-primary/5"
              : "border-border bg-card"
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5" />
            <span className="font-semibold">Custom</span>
            {personality === "custom" && (
              <Badge variant="secondary" className="ml-auto">
                Active
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Define your own AI personality
          </p>
        </button>
      </div>

      {/* Custom Prompt Editor */}
      {personality === "custom" && (
        <Card className="p-4 space-y-4">
          <div className="space-y-2">
            <Label>Custom AI Prompt</Label>
            <p className="text-sm text-muted-foreground">
              Define how the AI should behave when helping you with recipes and meal planning.
              Be specific about tone, style, and approach.
            </p>
          </div>

          <Textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Example: You are an enthusiastic home cook who loves sharing tips and tricks. Be encouraging and use lots of cooking metaphors..."
            className="min-h-[120px] font-mono text-sm"
          />

          <div className="flex items-center gap-2">
            <Button
              onClick={handleSaveCustomPrompt}
              disabled={isSaving || !customPrompt.trim()}
            >
              {isSaving ? "Saving..." : "Save Custom Prompt"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? "Hide" : "Show"} Preview
            </Button>
          </div>

          {showPreview && customPrompt.trim() && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs font-semibold mb-1">Preview:</p>
              <p className="text-sm italic">{customPrompt}</p>
            </div>
          )}
        </Card>
      )}

      {/* Current Selection Info */}
      {selectedPreset && personality !== "custom" && (
        <Card className="p-4 bg-muted/30">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              {PERSONALITY_ICONS[personality] &&
                (() => {
                  const Icon = PERSONALITY_ICONS[personality];
                  return <Icon className="h-4 w-4" />;
                })()}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">
                Current: {selectedPreset.name}
              </p>
              <p className="text-xs text-muted-foreground">
                The AI will use this personality when assisting you with recipes,
                meal planning, and cooking guidance.
              </p>
            </div>
          </div>
        </Card>
      )}

      {isSaving && (
        <p className="text-xs text-muted-foreground text-center">Saving...</p>
      )}
    </div>
  );
}
