"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { IconPickerGrid } from "./icon-picker-grid";
import type { SidebarIconName } from "@/types/sidebar-customization";
import {
  getIconComponent,
  DEFAULT_MEAL_PLANNING_ICONS,
} from "@/lib/sidebar/sidebar-icons";
import { EmojiPicker } from "@/components/ui/emoji-picker";

// Default labels for built-in meal planning items
const DEFAULT_ITEM_LABELS: Record<string, string> = {
  plan: "Plan",
  "shopping-list": "Shopping List",
  recipes: "Recipes",
  favorites: "Favorites",
  stats: "Stats",
};

interface SidebarItemEditDialogProps {
  /** The item ID being edited */
  itemId: string;
  /** Current custom name (null = default) */
  currentName: string | null;
  /** Current custom emoji (null = none) */
  currentEmoji: string | null;
  /** Current custom icon (null = default) */
  currentIcon: SidebarIconName | null;
  /** Whether the dialog is open */
  open: boolean;
  /** Close handler */
  onClose: () => void;
  /** Save handler - receives name, emoji, and icon */
  onSave: (
    name: string | null,
    emoji: string | null,
    icon: SidebarIconName | null
  ) => Promise<void>;
  /** Reset handler - called when resetting to defaults */
  onReset?: () => Promise<void>;
  /** Whether this is a built-in item (shows reset button) */
  isBuiltIn?: boolean;
}

type IconMode = "emoji" | "icon";

export function SidebarItemEditDialog({
  itemId,
  currentName,
  currentEmoji,
  currentIcon,
  open,
  onClose,
  onSave,
  onReset,
  isBuiltIn = true,
}: SidebarItemEditDialogProps) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState<string | null>(null);
  const [icon, setIcon] = useState<SidebarIconName | null>(null);
  const [iconMode, setIconMode] = useState<IconMode>("emoji");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Get default values
  const defaultLabel = DEFAULT_ITEM_LABELS[itemId] || itemId;
  const defaultIcon = DEFAULT_MEAL_PLANNING_ICONS[itemId];
  const DefaultIconComponent = defaultIcon || null;

  // Initialize form when dialog opens or item changes
  useEffect(() => {
    if (open) {
      setName(currentName || "");
      setEmoji(currentEmoji || null);
      setIcon(currentIcon || null);
      // Set initial mode based on what's currently set
      if (currentEmoji) {
        setIconMode("emoji");
      } else if (currentIcon) {
        setIconMode("icon");
      } else {
        setIconMode("emoji");
      }
    }
  }, [open, itemId, currentName, currentEmoji, currentIcon]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Only save non-empty name, otherwise null (use default)
      const nameToSave = name.trim() || null;
      // Only save the active mode's value
      const emojiToSave = iconMode === "emoji" ? emoji : null;
      const iconToSave = iconMode === "icon" ? icon : null;

      await onSave(nameToSave, emojiToSave, iconToSave);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!onReset) return;
    setIsSaving(true);
    try {
      await onReset();
      onClose();
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

  const handleSelectIcon = (selectedIcon: SidebarIconName) => {
    setIcon(selectedIcon);
  };

  const handleClearIcon = () => {
    setIcon(null);
  };

  const handleModeChange = (mode: string) => {
    setIconMode(mode as IconMode);
    // Clear the other mode's value when switching
    if (mode === "emoji") {
      setIcon(null);
    } else {
      setEmoji(null);
    }
  };

  // Get current icon component for preview
  const currentIconComponent = icon
    ? getIconComponent(icon)
    : DefaultIconComponent;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Navigation Item</DialogTitle>
          <DialogDescription>
            Customize how this item appears in your sidebar.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {/* Name Input */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="item-name">Display Name</Label>
            <Input
              id="item-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={defaultLabel}
              autoFocus
            />
            {isBuiltIn && name !== "" && name !== defaultLabel && (
              <p className="text-xs text-muted-foreground">
                Default: {defaultLabel}
              </p>
            )}
          </div>

          {/* Icon / Emoji Tabs */}
          <div className="flex flex-col gap-2">
            <Label>Icon / Emoji</Label>
            <Tabs value={iconMode} onValueChange={handleModeChange}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="emoji">Emoji</TabsTrigger>
                <TabsTrigger value="icon">Icon</TabsTrigger>
              </TabsList>

              {/* Emoji Tab */}
              <TabsContent value="emoji" className="mt-3">
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
                        ) : DefaultIconComponent ? (
                          <DefaultIconComponent className="size-6" />
                        ) : (
                          <Smile className="size-6" />
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 z-[10000]"
                      align="start"
                      usePortal={false}
                    >
                      <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                    </PopoverContent>
                  </Popover>

                  {emoji && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleClearEmoji}
                      className="h-8 w-8"
                    >
                      <X className="size-4" />
                    </Button>
                  )}

                  <p className="text-sm text-muted-foreground flex-1">
                    {emoji
                      ? "Click the emoji to change it"
                      : "Click to choose an emoji"}
                  </p>
                </div>
              </TabsContent>

              {/* Icon Tab */}
              <TabsContent value="icon" className="mt-3">
                <div className="flex flex-col gap-3">
                  {/* Current selection preview */}
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "h-14 w-14 rounded-md border flex items-center justify-center",
                        icon
                          ? "border-primary bg-primary/5"
                          : "border-dashed text-muted-foreground"
                      )}
                    >
                      {currentIconComponent ? (
                        (() => {
                          const IconComp = currentIconComponent;
                          return <IconComp className="size-6" />;
                        })()
                      ) : (
                        <Smile className="size-6" />
                      )}
                    </div>

                    {icon && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleClearIcon}
                        className="h-8 w-8"
                      >
                        <X className="size-4" />
                      </Button>
                    )}

                    <p className="text-sm text-muted-foreground flex-1">
                      {icon ? `Selected: ${icon}` : "Select an icon below"}
                    </p>
                  </div>

                  {/* Icon grid */}
                  <IconPickerGrid
                    selectedIcon={icon}
                    onSelectIcon={handleSelectIcon}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {onReset && isBuiltIn && (
            <Button
              variant="ghost"
              onClick={handleReset}
              disabled={isSaving}
              className="sm:mr-auto"
            >
              <RotateCcw className="size-4 mr-2" />
              Reset to Default
            </Button>
          )}
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
