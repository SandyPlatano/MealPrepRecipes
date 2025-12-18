"use client";

import React from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ContextMenuShortcut } from "@/hooks/use-context-menu-shortcuts";
import { toast } from "sonner";
import {
  Edit,
  Copy,
  FolderPlus,
  Pin,
  PinOff,
  Trash2,
  Palette,
  Smile,
  FolderTree,
  Check,
} from "lucide-react";
import { duplicateFolder, deleteFolder } from "@/app/actions/folders";
import type { RecipeFolder, FolderCategory } from "@/types/folder";
import { FOLDER_COLORS, FOLDER_EMOJIS } from "@/types/folder";

interface FolderContextMenuProps {
  folder: RecipeFolder;
  categories: FolderCategory[];
  isPinned: boolean;
  onEdit: () => void;
  onAddSubfolder: () => void;
  onPin: () => void;
  onUnpin: () => void;
  onChangeColor: (color: string) => Promise<void>;
  onChangeEmoji: (emoji: string) => Promise<void>;
  onMoveToCategory: (categoryId: string | null) => Promise<void>;
  children: React.ReactNode;
}

export function FolderContextMenu({
  folder,
  categories,
  isPinned,
  onEdit,
  onAddSubfolder,
  onPin,
  onUnpin,
  onChangeColor,
  onChangeEmoji,
  onMoveToCategory,
  children,
}: FolderContextMenuProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = React.useState(false);

  const handleDuplicate = async () => {
    try {
      const result = await duplicateFolder(folder.id);

      if (result.error) {
        toast.error("Failed to duplicate folder", {
          description: result.error,
        });
        return;
      }

      toast.success("Folder duplicated", {
        description: `Created "${result.data?.name}"`,
      });
    } catch (error) {
      toast.error("Failed to duplicate folder", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setDuplicateDialogOpen(false);
    }
  };

  const handleDelete = async () => {
    try {
      const result = await deleteFolder(folder.id);

      if (result.error) {
        toast.error("Failed to delete folder", {
          description: result.error,
        });
        return;
      }

      toast.success("Folder deleted", {
        description: `"${folder.name}" has been removed`,
      });
    } catch (error) {
      toast.error("Failed to delete folder", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleColorChange = async (color: string) => {
    try {
      await onChangeColor(color);
      toast.success("Color updated");
    } catch (error) {
      toast.error("Failed to update color");
    }
  };

  const handleEmojiChange = async (emoji: string) => {
    try {
      await onChangeEmoji(emoji);
      toast.success("Emoji updated");
    } catch (error) {
      toast.error("Failed to update emoji");
    }
  };

  const handleMoveToCategory = async (categoryId: string | null) => {
    try {
      await onMoveToCategory(categoryId);
      toast.success("Folder moved");
    } catch (error) {
      toast.error("Failed to move folder");
    }
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
        <ContextMenuContent className="w-56">
          {/* Edit */}
          <ContextMenuItem onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
            <ContextMenuShortcut shortcut="edit" />
          </ContextMenuItem>

          {/* Duplicate */}
          <ContextMenuItem onClick={() => setDuplicateDialogOpen(true)}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
            <ContextMenuShortcut shortcut="duplicate" />
          </ContextMenuItem>

          {/* Add Subfolder - only if not already a subfolder */}
          {!folder.parent_id && (
            <ContextMenuItem onClick={onAddSubfolder}>
              <FolderPlus className="mr-2 h-4 w-4" />
              Add Subfolder
              <ContextMenuShortcut shortcut="new" />
            </ContextMenuItem>
          )}

          <ContextMenuSeparator />

          {/* Move to Category */}
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <FolderTree className="mr-2 h-4 w-4" />
              Move to Category
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              <ContextMenuItem onClick={() => handleMoveToCategory(null)}>
                {!folder.category_id && (
                  <Check className="mr-2 h-4 w-4" />
                )}
                {folder.category_id && <span className="mr-6" />}
                No Category
              </ContextMenuItem>
              <ContextMenuSeparator />
              {categories.map((category) => (
                <ContextMenuItem
                  key={category.id}
                  onClick={() => handleMoveToCategory(category.id)}
                >
                  {folder.category_id === category.id && (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  {folder.category_id !== category.id && (
                    <span className="mr-6" />
                  )}
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>

          {/* Change Color */}
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <Palette className="mr-2 h-4 w-4" />
              Change Color
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              <div className="grid grid-cols-4 gap-1 p-2">
                {FOLDER_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(color)}
                    className="h-8 w-8 rounded-md border-2 hover:scale-110 transition-transform"
                    style={{
                      backgroundColor: color,
                      borderColor:
                        folder.color === color
                          ? "hsl(var(--primary))"
                          : "transparent",
                    }}
                    aria-label={`Set color to ${color}`}
                  />
                ))}
              </div>
            </ContextMenuSubContent>
          </ContextMenuSub>

          {/* Change Emoji */}
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <Smile className="mr-2 h-4 w-4" />
              Change Emoji
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-56">
              <div className="grid grid-cols-6 gap-1 p-2 max-h-64 overflow-y-auto">
                {FOLDER_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleEmojiChange(emoji)}
                    className="h-8 w-8 rounded-md hover:bg-accent flex items-center justify-center text-lg border-2"
                    style={{
                      borderColor:
                        folder.emoji === emoji
                          ? "hsl(var(--primary))"
                          : "transparent",
                    }}
                    aria-label={`Set emoji to ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </ContextMenuSubContent>
          </ContextMenuSub>

          <ContextMenuSeparator />

          {/* Pin / Unpin */}
          {isPinned ? (
            <ContextMenuItem onClick={onUnpin}>
              <PinOff className="mr-2 h-4 w-4" />
              Unpin
              <ContextMenuShortcut shortcut="unpin" />
            </ContextMenuItem>
          ) : (
            <ContextMenuItem onClick={onPin}>
              <Pin className="mr-2 h-4 w-4" />
              Pin to Sidebar
              <ContextMenuShortcut shortcut="pin" />
            </ContextMenuItem>
          )}

          <ContextMenuSeparator />

          {/* Delete */}
          <ContextMenuItem
            onClick={() => setDeleteDialogOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
            <ContextMenuShortcut shortcut="delete" />
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{folder.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              folder and remove all recipes from it. The recipes themselves will
              not be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Duplicate Confirmation Dialog */}
      <AlertDialog
        open={duplicateDialogOpen}
        onOpenChange={setDuplicateDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Duplicate "{folder.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will create a copy of the folder including all its recipes.
              Subfolders will not be duplicated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDuplicate}>
              Duplicate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
