"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronRight, Pencil, FolderPlus, Trash2 } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { FolderWithChildren } from "@/types/folder";
import { deleteFolder } from "@/app/actions/folders";
import { EditFolderDialog } from "./edit-folder-dialog";
import { CreateFolderDialog } from "./create-folder-dialog";

interface FolderTreeItemProps {
  folder: FolderWithChildren;
  isActive: boolean;
  onSelect: () => void;
  onChildSelect: (id: string) => void;
  activeChildId: string | null;
  allFolders: FolderWithChildren[];
  depth?: number;
}

export function FolderTreeItem({
  folder,
  isActive,
  onSelect,
  onChildSelect,
  activeChildId,
  allFolders,
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

  // Auto-expand if a child is active
  if (isChildActive && !isOpen) {
    setIsOpen(true);
  }

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteFolder(folder.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Folder deleted");
      }
    });
  };

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <ContextMenu>
          <ContextMenuTrigger asChild>
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
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onClick={() => setEditDialogOpen(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Folder
            </ContextMenuItem>
            {depth === 0 && (
              <ContextMenuItem onClick={() => setCreateSubfolderOpen(true)}>
                <FolderPlus className="h-4 w-4 mr-2" />
                Add Subfolder
              </ContextMenuItem>
            )}
            <ContextMenuSeparator />
            <ContextMenuItem
              className="text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Folder
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

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
