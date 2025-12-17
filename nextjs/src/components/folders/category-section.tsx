"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { MoreHorizontal, Pencil, Trash2, FolderPlus } from "lucide-react";
import { toast } from "sonner";
import type { FolderCategoryWithFolders, FolderWithChildren, ActiveFolderFilter } from "@/types/folder";
import { deleteFolderCategory } from "@/app/actions/folders";
import { FolderTreeItem } from "./folder-tree-item";
import { CategoryDialog } from "./category-dialog";
import { CreateFolderDialog } from "./create-folder-dialog";

interface CategorySectionProps {
  category: FolderCategoryWithFolders;
  activeFilter: ActiveFolderFilter;
  onFilterChange: (filter: ActiveFolderFilter) => void;
  allFolders: FolderWithChildren[];
}

export function CategorySection({
  category,
  activeFilter,
  onFilterChange,
  allFolders,
}: CategorySectionProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isFolderActive = (id: string) =>
    activeFilter.type === "folder" && activeFilter.id === id;

  const activeChildId =
    activeFilter.type === "folder" ? activeFilter.id : null;

  const canDelete = !category.is_system && category.id !== "uncategorized";
  const canEdit = category.id !== "uncategorized";

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteFolderCategory(category.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Category deleted");
      }
      setDeleteDialogOpen(false);
    });
  };

  return (
    <>
      <div className="pt-4">
        <div className="flex items-center justify-between px-2 mb-2 group">
          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            {category.emoji && <span>{category.emoji}</span>}
            {category.name}
          </p>
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100"
              onClick={() => setCreateFolderOpen(true)}
              title="Add folder to this category"
            >
              <FolderPlus className="h-3 w-3" />
            </Button>
            {(canEdit || canDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canEdit && (
                    <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit Category
                    </DropdownMenuItem>
                  )}
                  {canDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteDialogOpen(true)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Category
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {category.folders.length === 0 ? (
          <p className="text-xs text-muted-foreground px-2 py-3 text-center">
            No folders
          </p>
        ) : (
          <div className="space-y-1">
            {category.folders.map((folder) => (
              <FolderTreeItem
                key={folder.id}
                folder={folder}
                isActive={isFolderActive(folder.id)}
                onSelect={() =>
                  onFilterChange({ type: "folder", id: folder.id })
                }
                onChildSelect={(id) =>
                  onFilterChange({ type: "folder", id })
                }
                activeChildId={activeChildId}
                allFolders={allFolders}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit Category Dialog */}
      {canEdit && (
        <CategoryDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          category={category}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the &quot;{category.name}&quot; category. Any folders
              in this category will be moved to Uncategorized.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Folder Dialog (pre-sets category) */}
      <CreateFolderDialog
        open={createFolderOpen}
        onOpenChange={setCreateFolderOpen}
        folders={allFolders}
        defaultCategoryId={category.id !== "uncategorized" ? category.id : undefined}
      />
    </>
  );
}
