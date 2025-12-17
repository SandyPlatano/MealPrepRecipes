"use client";

import { useState, useTransition, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { FolderWithChildren } from "@/types/folder";
import { FOLDER_COLORS, FOLDER_EMOJIS } from "@/types/folder";
import { updateFolder } from "@/app/actions/folders";

interface EditFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folder: FolderWithChildren;
}

export function EditFolderDialog({
  open,
  onOpenChange,
  folder,
}: EditFolderDialogProps) {
  const [name, setName] = useState(folder.name);
  const [emoji, setEmoji] = useState<string>(folder.emoji || "📁");
  const [color, setColor] = useState<string>(folder.color || FOLDER_COLORS[0]);
  const [isPending, startTransition] = useTransition();

  // Reset form when folder changes
  useEffect(() => {
    setName(folder.name);
    setEmoji(folder.emoji || "📁");
    setColor(folder.color || FOLDER_COLORS[0]);
  }, [folder]);

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Please enter a folder name");
      return;
    }

    startTransition(async () => {
      const result = await updateFolder(folder.id, {
        name: name.trim(),
        emoji,
        color,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Folder updated");
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Folder</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="edit-folder-name">Name</Label>
            <Input
              id="edit-folder-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Weeknight Dinners"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSave();
                }
              }}
            />
          </div>

          {/* Emoji */}
          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="flex flex-wrap gap-1.5">
              {FOLDER_EMOJIS.map((e) => (
                <Button
                  key={e}
                  variant={emoji === e ? "default" : "outline"}
                  size="sm"
                  className="w-9 h-9 text-base p-0"
                  onClick={() => setEmoji(e)}
                >
                  {e}
                </Button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {FOLDER_COLORS.map((c) => (
                <button
                  key={c}
                  className={`w-8 h-8 rounded-full transition-transform ${
                    color === c
                      ? "ring-2 ring-offset-2 ring-primary scale-110"
                      : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
