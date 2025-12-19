"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RotateCcw, Smile, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  SectionConfig,
  BuiltInSectionId,
} from "@/types/sidebar-customization";
import { isBuiltInSection } from "@/types/sidebar-customization";
import {
  getIconComponent,
  DEFAULT_SECTION_ICONS,
} from "@/lib/sidebar/sidebar-icons";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

// Default labels for built-in sections
const DEFAULT_SECTION_LABELS: Record<BuiltInSectionId, string> = {
  "quick-nav": "Quick Nav",
  pinned: "Pinned",
  "meal-planning": "Meal Planning",
  collections: "Collections",
};

interface SectionEditDialogProps {
  section: SectionConfig;
  open: boolean;
  onClose: () => void;
  onSave: (label: string, emoji: string | null) => Promise<void>;
  onReset?: () => Promise<void>;
}

export function SectionEditDialog({
  section,
  open,
  onClose,
  onSave,
  onReset,
}: SectionEditDialogProps) {
  const [label, setLabel] = useState("");
  const [emoji, setEmoji] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form when section changes
  useEffect(() => {
    if (section) {
      if (isBuiltInSection(section)) {
        setLabel(
          section.customTitle || DEFAULT_SECTION_LABELS[section.id] || ""
        );
        setEmoji(section.customEmoji || null);
      } else {
        setLabel(section.title);
        setEmoji(section.emoji || null);
      }
    }
  }, [section]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(label, emoji);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!onReset) return;
    setIsSaving(true);
    try {
      await onReset();
    } finally {
      setIsSaving(false);
    }
  };

  const handleEmojiSelect = (emojiData: { native: string }) => {
    setEmoji(emojiData.native);
    setShowEmojiPicker(false);
  };

  const handleClearEmoji = () => {
    setEmoji(null);
  };

  // Get default icon for the section
  const defaultIcon = isBuiltInSection(section)
    ? DEFAULT_SECTION_ICONS[section.id]
    : null;

  const isBuiltIn = isBuiltInSection(section);
  const defaultLabel = isBuiltIn ? DEFAULT_SECTION_LABELS[section.id] : "";

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Edit {isBuiltIn ? "Section" : "Custom Section"}
          </DialogTitle>
          <DialogDescription>
            Customize how this section appears in your sidebar.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {/* Label Input */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="section-label">Section Name</Label>
            <Input
              id="section-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={defaultLabel || "Enter section name"}
            />
            {isBuiltIn && label !== defaultLabel && (
              <p className="text-xs text-muted-foreground">
                Default: {defaultLabel}
              </p>
            )}
          </div>

          {/* Emoji Picker */}
          <div className="flex flex-col gap-2">
            <Label>Icon / Emoji</Label>
            <div className="flex items-center gap-2">
              <Popover
                open={showEmojiPicker}
                onOpenChange={setShowEmojiPicker}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-14 w-14 text-2xl",
                      !emoji && "text-muted-foreground"
                    )}
                  >
                    {emoji ? (
                      emoji
                    ) : defaultIcon ? (
                      (() => {
                        const IconComponent = defaultIcon;
                        return <IconComponent className="h-6 w-6" />;
                      })()
                    ) : (
                      <Smile className="h-6 w-6" />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[10000]" align="start" usePortal={false}>
                  <Picker
                    data={data}
                    onEmojiSelect={handleEmojiSelect}
                    theme="auto"
                    previewPosition="none"
                    skinTonePosition="search"
                  />
                </PopoverContent>
              </Popover>

              {emoji && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearEmoji}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}

              <p className="text-sm text-muted-foreground flex-1">
                {emoji
                  ? "Click the emoji to change it, or X to remove"
                  : "Click to choose an emoji"}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {onReset && (
            <Button
              variant="ghost"
              onClick={handleReset}
              disabled={isSaving}
              className="sm:mr-auto"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Default
            </Button>
          )}
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !label.trim()}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
