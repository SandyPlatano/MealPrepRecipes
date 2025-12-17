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
import type { FolderCategory } from "@/types/folder";
import { CATEGORY_EMOJIS } from "@/types/folder";
import { createFolderCategory, updateFolderCategory } from "@/app/actions/folders";

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: FolderCategory | null; // If provided, we're editing
}

export function CategoryDialog({
  open,
  onOpenChange,
  category,
}: CategoryDialogProps) {
  const isEditing = !!category;
  const [name, setName] = useState(category?.name || "");
  const [emoji, setEmoji] = useState<string | null>(category?.emoji || null);
  const [isPending, startTransition] = useTransition();

  // Reset form when dialog opens/closes or category changes
  useEffect(() => {
    if (open) {
      setName(category?.name || "");
      setEmoji(category?.emoji || null);
    }
  }, [open, category]);

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    startTransition(async () => {
      if (isEditing && category) {
        const result = await updateFolderCategory(category.id, {
          name: name.trim(),
          emoji,
        });
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success("Category updated");
          onOpenChange(false);
        }
      } else {
        const result = await createFolderCategory({
          name: name.trim(),
          emoji,
        });
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success("Category created");
          onOpenChange(false);
          // Reset form
          setName("");
          setEmoji(null);
        }
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Category" : "Create Category"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="category-name">Name</Label>
            <Input
              id="category-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Seasonal, Cooking Style"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit();
                }
              }}
            />
          </div>

          {/* Emoji */}
          <div className="space-y-2">
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
              {CATEGORY_EMOJIS.map((e) => (
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending
              ? isEditing
                ? "Saving..."
                : "Creating..."
              : isEditing
              ? "Save Changes"
              : "Create Category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
