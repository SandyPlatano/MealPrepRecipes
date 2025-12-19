"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { FolderWithChildren } from "@/types/folder";
import { FOLDER_COLORS, FOLDER_EMOJIS } from "@/types/folder";
import { createFolder } from "@/app/actions/folders";

interface CreateFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folders: FolderWithChildren[];
  parentFolderId?: string;
  defaultCategoryId?: string;
}

export function CreateFolderDialog({
  open,
  onOpenChange,
  folders,
  parentFolderId,
  defaultCategoryId,
}: CreateFolderDialogProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [parentId, setParentId] = useState<string | null>(parentFolderId || null);
  const [categoryId, setCategoryId] = useState<string | null>(defaultCategoryId || null);
  const [isPending, startTransition] = useTransition();

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error("Please enter a folder name");
      return;
    }

    startTransition(async () => {
      const result = await createFolder({
        name: name.trim(),
        emoji,
        color,
        parent_folder_id: parentId,
        category_id: categoryId,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Folder created");
        onOpenChange(false);
        // Reset form
        setName("");
        setEmoji(null);
        setColor(null);
        setParentId(null);
        setCategoryId(defaultCategoryId || null);
        // Force refresh to update the sidebar with new folder
        router.refresh();
      }
    });
  };

  // Only root folders can be parents (max 2 levels)
  const parentOptions = folders.filter((f) => f.parent_folder_id === null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {parentFolderId ? "Create Subfolder" : "Create Folder"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {/* Name */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="folder-name">Name</Label>
            <Input
              id="folder-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Weeknight Dinners"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreate();
                }
              }}
            />
          </div>

          {/* Emoji */}
          <div className="flex flex-col gap-2">
            <Label>Icon (optional)</Label>
            <div className="flex flex-wrap gap-1.5">
              <Button
                variant={emoji === null ? "default" : "outline"}
                size="sm"
                className="h-9 px-3 text-xs"
                onClick={() => setEmoji(null)}
              >
                None
              </Button>
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
          <div className="flex flex-col gap-2">
            <Label>Color (optional)</Label>
            <div className="flex flex-wrap gap-2 items-center">
              <button
                className={`h-8 px-3 rounded-full border-2 border-dashed transition-transform text-xs ${
                  color === null
                    ? "ring-2 ring-offset-2 ring-primary scale-110 border-primary"
                    : "border-muted-foreground/30 hover:scale-105"
                }`}
                onClick={() => setColor(null)}
              >
                None
              </button>
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

          {/* Parent Folder (only show if not creating subfolder and has parent options) */}
          {!parentFolderId && parentOptions.length > 0 && (
            <div className="flex flex-col gap-2">
              <Label>Parent Folder (optional)</Label>
              <Select
                value={parentId || "none"}
                onValueChange={(v) => setParentId(v === "none" ? null : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="None (root level)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (root level)</SelectItem>
                  {parentOptions.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.emoji} {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isPending}>
            {isPending ? "Creating..." : "Create Folder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
