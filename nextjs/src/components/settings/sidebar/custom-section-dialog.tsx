"use client";

import { useState } from "react";
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
import { Smile, X, FolderPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

interface CustomSectionDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (title: string, emoji?: string) => Promise<void>;
}

export function CustomSectionDialog({
  open,
  onClose,
  onCreate,
}: CustomSectionDialogProps) {
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) return;

    setIsCreating(true);
    try {
      await onCreate(title.trim(), emoji || undefined);
      // Reset form
      setTitle("");
      setEmoji(null);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setTitle("");
    setEmoji(null);
    setShowEmojiPicker(false);
    onClose();
  };

  const handleEmojiSelect = (emojiData: { native: string }) => {
    setEmoji(emojiData.native);
    setShowEmojiPicker(false);
  };

  const handleClearEmoji = () => {
    setEmoji(null);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5" />
            Create Custom Section
          </DialogTitle>
          <DialogDescription>
            Add a new section to your sidebar with your own links and shortcuts.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="section-title">Section Name</Label>
            <Input
              id="section-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., My Favorites, Quick Links"
              autoFocus
            />
          </div>

          {/* Emoji Picker */}
          <div className="space-y-2">
            <Label>Icon (Optional)</Label>
            <div className="flex items-center gap-2">
              <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-12 w-12 text-xl",
                      !emoji && "text-muted-foreground"
                    )}
                  >
                    {emoji || <Smile className="h-5 w-5" />}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[10000]" align="start">
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
                Choose an emoji to represent this section
              </p>
            </div>
          </div>

          {/* Preview */}
          {title.trim() && (
            <div className="rounded-lg border bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground mb-2">Preview</p>
              <div className="flex items-center gap-2">
                {emoji && <span className="text-lg">{emoji}</span>}
                <span className="text-sm font-medium">{title}</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isCreating}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={isCreating || !title.trim()}
          >
            {isCreating ? "Creating..." : "Create Section"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
