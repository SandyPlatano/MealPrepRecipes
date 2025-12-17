"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { FolderPlus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { FolderWithChildren } from "@/types/folder";
import type { Recipe } from "@/types/recipe";
import { setRecipeFolders } from "@/app/actions/folders";

interface AddToFolderSheetProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
  folders: FolderWithChildren[];
  currentFolderIds: string[];
}

export function AddToFolderSheet({
  recipe,
  isOpen,
  onClose,
  folders,
  currentFolderIds,
}: AddToFolderSheetProps) {
  const [selectedFolderIds, setSelectedFolderIds] = useState<Set<string>>(
    new Set(currentFolderIds)
  );
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (isOpen) {
      setSelectedFolderIds(new Set(currentFolderIds));
    }
  }, [isOpen, currentFolderIds]);

  const toggleFolder = (folderId: string) => {
    const newSet = new Set(selectedFolderIds);
    if (newSet.has(folderId)) {
      newSet.delete(folderId);
    } else {
      newSet.add(folderId);
    }
    setSelectedFolderIds(newSet);
  };

  const handleSave = () => {
    if (!recipe) return;

    startTransition(async () => {
      const result = await setRecipeFolders(
        recipe.id,
        Array.from(selectedFolderIds)
      );

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Folders updated");
        onClose();
      }
    });
  };

  // Flatten folders for display with depth info
  const flattenFolders = (
    folderList: FolderWithChildren[],
    depth = 0
  ): Array<{ folder: FolderWithChildren; depth: number }> => {
    const result: Array<{ folder: FolderWithChildren; depth: number }> = [];
    folderList.forEach((folder) => {
      result.push({ folder, depth });
      if (folder.children.length > 0) {
        result.push(...flattenFolders(folder.children, depth + 1));
      }
    });
    return result;
  };

  const flatFolders = flattenFolders(folders);

  if (!recipe) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="h-[60vh] rounded-t-2xl">
        {/* Header */}
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5 text-primary" />
            Add to Folders
          </SheetTitle>
          <p className="text-sm text-muted-foreground truncate">
            {recipe.title}
          </p>
        </SheetHeader>

        {/* Folder list */}
        <ScrollArea className="flex-1 -mx-6 px-6">
          {flatFolders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No folders yet. Create one to organize your recipes.
            </p>
          ) : (
            <div className="space-y-1 pb-4">
              {flatFolders.map(({ folder, depth }) => (
                <button
                  key={folder.id}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg transition-colors",
                    selectedFolderIds.has(folder.id)
                      ? "bg-primary/10"
                      : "hover:bg-muted"
                  )}
                  style={{ paddingLeft: `${12 + depth * 16}px` }}
                  onClick={() => toggleFolder(folder.id)}
                >
                  <div
                    className={cn(
                      "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                      selectedFolderIds.has(folder.id)
                        ? "bg-primary border-primary"
                        : "border-muted-foreground/30"
                    )}
                  >
                    {selectedFolderIds.has(folder.id) && (
                      <Check className="h-3 w-3 text-primary-foreground" />
                    )}
                  </div>
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: folder.color || "#6B7280" }}
                  />
                  <span className="mr-1">{folder.emoji || "📁"}</span>
                  <span className="flex-1 text-left truncate">
                    {folder.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {folder.recipe_count}
                  </span>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <SheetFooter className="pt-4">
          <Button
            className="w-full h-12 text-base font-medium"
            disabled={isPending}
            onClick={handleSave}
          >
            {isPending ? "Saving..." : "Save"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
