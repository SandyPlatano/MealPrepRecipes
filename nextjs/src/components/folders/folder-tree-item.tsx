"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { FolderWithChildren, FolderCategory } from "@/types/folder";
import type { PinnedItem } from "@/types/user-preferences-v2";
import { updateFolder } from "@/app/actions/folders";
import { pinSidebarItemAuto, unpinSidebarItemAuto } from "@/app/actions/sidebar-preferences";
import { EditFolderDialog } from "./edit-folder-dialog";
import { CreateFolderDialog } from "./create-folder-dialog";
import { FolderContextMenu } from "./folder-context-menu";

interface FolderTreeItemProps {
  folder: FolderWithChildren;
  isActive: boolean;
  onSelect: () => void;
  onChildSelect: (id: string) => void;
  activeChildId: string | null;
  allFolders: FolderWithChildren[];
  categories: FolderCategory[];
  pinnedItems: PinnedItem[];
  depth?: number;
}

export function FolderTreeItem({
  folder,
  isActive,
  onSelect,
  onChildSelect,
  activeChildId,
  allFolders,
  categories,
  pinnedItems,
  depth = 0,
}: FolderTreeItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createSubfolderOpen, setCreateSubfolderOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const hasChildren = folder.children.length > 0;

  const isChildActive = folder.children.some(
    (child) => child.id === activeChildId
  );

  // Check if this folder is pinned
  const isPinned = pinnedItems.some(
    (item) => item.type === "folder" && item.id === folder.id
  );

  // Auto-expand if a child is active
  if (isChildActive && !isOpen) {
    setIsOpen(true);
  }

  const handleChangeColor = async (color: string) => {
    const result = await updateFolder(folder.id, { color });
    if (result.error) {
      throw new Error(result.error);
    }
  };

  const handleChangeEmoji = async (emoji: string) => {
    const result = await updateFolder(folder.id, { emoji });
    if (result.error) {
      throw new Error(result.error);
    }
  };

  const handleMoveToCategory = async (categoryId: string | null) => {
    const result = await updateFolder(folder.id, { category_id: categoryId });
    if (result.error) {
      throw new Error(result.error);
    }
  };

  const handlePin = async () => {
    const result = await pinSidebarItemAuto({
      type: "folder",
      id: folder.id,
      name: folder.name,
      emoji: folder.emoji || undefined,
    });
    if (result.error) {
      toast.error("Failed to pin folder");
    } else {
      toast.success("Folder pinned");
    }
  };

  const handleUnpin = async () => {
    const result = await unpinSidebarItemAuto(folder.id);
    if (result.error) {
      toast.error("Failed to unpin folder");
    } else {
      toast.success("Folder unpinned");
    }
  };

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <FolderContextMenu
          folder={folder}
          categories={categories}
          isPinned={isPinned}
          onEdit={() => setEditDialogOpen(true)}
          onAddSubfolder={() => setCreateSubfolderOpen(true)}
          onPin={handlePin}
          onUnpin={handleUnpin}
          onChangeColor={handleChangeColor}
          onChangeEmoji={handleChangeEmoji}
          onMoveToCategory={handleMoveToCategory}
        >
          <div
            className={cn(
              "flex items-center group",
              depth > 0 && "ml-4"
            )}
          >
            {hasChildren && (
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                  <ChevronRight
                    className={cn(
                      "h-3 w-3 transition-transform",
                      isOpen && "rotate-90"
                    )}
                  />
                </Button>
              </CollapsibleTrigger>
            )}
            {!hasChildren && <div className="w-6" />}

            <Button
              variant={isActive ? "secondary" : "ghost"}
              className="flex-1 justify-start h-10 px-2"
              onClick={onSelect}
              disabled={isPending}
            >
              {folder.color && (
                <span
                  className="w-2.5 h-2.5 rounded-full mr-2 shrink-0"
                  style={{ backgroundColor: folder.color }}
                />
              )}
              {folder.emoji && <span className="mr-1.5">{folder.emoji}</span>}
              {!folder.color && !folder.emoji && (
                <span className="w-4 h-4 mr-1.5 text-muted-foreground">📁</span>
              )}
              <span className="truncate">{folder.name}</span>
            </Button>
          </div>
        </FolderContextMenu>

        {hasChildren && (
          <CollapsibleContent>
            {folder.children.map((child) => (
              <FolderTreeItem
                key={child.id}
                folder={child}
                isActive={child.id === activeChildId}
                onSelect={() => onChildSelect(child.id)}
                onChildSelect={onChildSelect}
                activeChildId={activeChildId}
                allFolders={allFolders}
                categories={categories}
                pinnedItems={pinnedItems}
                depth={depth + 1}
              />
            ))}
          </CollapsibleContent>
        )}
      </Collapsible>

      <EditFolderDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        folder={folder}
      />

      <CreateFolderDialog
        open={createSubfolderOpen}
        onOpenChange={setCreateSubfolderOpen}
        folders={allFolders}
        parentFolderId={folder.id}
      />
    </>
  );
}
