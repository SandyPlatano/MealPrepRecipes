"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import {
  ChevronLeft,
  ChevronRight,
  Folders,
  BookOpen,
  Plus,
  Sparkles,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type {
  FolderWithChildren,
  FolderCategoryWithFolders,
  ActiveFolderFilter,
  FolderCategory,
} from "@/types/folder";
import type { SystemSmartFolder } from "@/types/smart-folder";
import type { PinnedItem } from "@/types/user-preferences-v2";
import { CategorySection } from "./category-section";
import { CategoryDialog } from "./category-dialog";
import { SmartFolderDialog } from "./smart-folder-dialog";
import { deleteSmartFolder } from "@/app/actions/smart-folders";

interface FolderSidebarProps {
  folders: FolderWithChildren[];
  categories: FolderCategoryWithFolders[];
  activeFilter: ActiveFolderFilter;
  onFilterChange: (filter: ActiveFolderFilter) => void;
  totalRecipeCount: number;
  // Smart folder data
  systemSmartFolders: SystemSmartFolder[];
  userSmartFolders: FolderWithChildren[];
  smartFolderCounts: Record<string, number>;
  // Pinned items
  pinnedItems: PinnedItem[];
}

export function FolderSidebar({
  folders,
  categories,
  activeFilter,
  onFilterChange,
  totalRecipeCount,
  systemSmartFolders,
  userSmartFolders,
  smartFolderCounts,
  pinnedItems,
}: FolderSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);
  const [createSmartFolderOpen, setCreateSmartFolderOpen] = useState(false);
  const [editingSmartFolder, setEditingSmartFolder] = useState<FolderWithChildren | null>(null);
  const [deletingSmartFolder, setDeletingSmartFolder] = useState<FolderWithChildren | null>(null);
  const [isPending, startTransition] = useTransition();

  // Check if a smart folder is active
  const isSmartFolderActive = (id: string, isSystem: boolean) =>
    activeFilter.type === "smart" &&
    activeFilter.id === id &&
    activeFilter.isSystem === isSystem;

  const isAllActive = activeFilter.type === "all";

  // Handle smart folder selection
  const handleSmartFolderClick = (id: string, isSystem: boolean) => {
    onFilterChange({ type: "smart", id, isSystem });
  };

  // Handle delete smart folder
  const handleDeleteSmartFolder = () => {
    if (!deletingSmartFolder) return;

    startTransition(async () => {
      const result = await deleteSmartFolder(deletingSmartFolder.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Smart folder deleted");
        // If the deleted folder was active, switch to all
        if (
          activeFilter.type === "smart" &&
          activeFilter.id === deletingSmartFolder.id
        ) {
          onFilterChange({ type: "all" });
        }
      }
      setDeletingSmartFolder(null);
    });
  };

  // Get all categories for the smart folder dialog
  const allCategories: FolderCategory[] = categories.map((c) => ({
    id: c.id,
    household_id: c.household_id,
    created_by_user_id: c.created_by_user_id,
    name: c.name,
    emoji: c.emoji,
    is_system: c.is_system,
    sort_order: c.sort_order,
    created_at: c.created_at,
    updated_at: c.updated_at,
  }));

  return (
    <div
      className={cn(
        "border-r bg-muted/30 transition-all duration-300 flex flex-col h-full overflow-hidden",
        isCollapsed ? "w-12" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b shrink-0">
        {!isCollapsed && (
          <h2 className="font-semibold text-sm flex items-center gap-2">
            <Folders className="h-4 w-4" />
            Folders
          </h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expand folders" : "Collapse folders"}
        >
          {isCollapsed ? (
            <Folders className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {!isCollapsed && (
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-2">
            {/* All Recipes */}
            <Button
              variant={isAllActive ? "secondary" : "ghost"}
              className="w-full justify-start h-10"
              onClick={() => onFilterChange({ type: "all" })}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              All Recipes
            </Button>

            {/* Smart Folders Section */}
            <div className="pt-4">
              <div className="flex items-center justify-between px-2 mb-2">
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3" />
                  Smart Folders
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  onClick={() => setCreateSmartFolderOpen(true)}
                  title="Create smart folder"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              <div className="space-y-1">
                {/* System Smart Folders (Read-only) */}
                {systemSmartFolders.map((folder) => (
                  <Button
                    key={`system-${folder.id}`}
                    variant={isSmartFolderActive(folder.id, true) ? "secondary" : "ghost"}
                    className="w-full justify-start h-10"
                    onClick={() => handleSmartFolderClick(folder.id, true)}
                  >
                    {folder.emoji && <span className="mr-2">{folder.emoji}</span>}
                    {!folder.emoji && folder.color && (
                      <span
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: folder.color }}
                      />
                    )}
                    {!folder.emoji && !folder.color && (
                      <Sparkles className="h-3 w-3 mr-2 text-muted-foreground" />
                    )}
                    {folder.name}
                  </Button>
                ))}

                {/* User Smart Folders (Editable) */}
                {userSmartFolders.map((folder) => (
                  <div
                    key={`user-${folder.id}`}
                    className="flex items-center group"
                  >
                    <Button
                      variant={isSmartFolderActive(folder.id, false) ? "secondary" : "ghost"}
                      className="flex-1 justify-start h-10"
                      onClick={() => handleSmartFolderClick(folder.id, false)}
                    >
                      {folder.emoji && <span className="mr-2">{folder.emoji}</span>}
                      {!folder.emoji && folder.color && (
                        <span
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: folder.color }}
                        />
                      )}
                      {!folder.emoji && !folder.color && (
                        <Sparkles className="h-3 w-3 mr-2 text-brand-coral" />
                      )}
                      <span className="truncate">{folder.name}</span>
                    </Button>

                    {/* Edit/Delete Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100 data-[state=open]:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingSmartFolder(folder)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeletingSmartFolder(folder)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}

                {/* Empty state for smart folders */}
                {systemSmartFolders.length === 0 && userSmartFolders.length === 0 && (
                  <p className="text-xs text-muted-foreground px-2 py-3 text-center">
                    No smart folders yet
                  </p>
                )}
              </div>
            </div>

            {/* User Categories with Folders */}
            {categories.map((category) => (
              <CategorySection
                key={category.id}
                category={category}
                activeFilter={activeFilter}
                onFilterChange={onFilterChange}
                allFolders={folders}
                allCategories={allCategories}
                pinnedItems={pinnedItems}
              />
            ))}

            {/* Add Category Button */}
            <div className="pt-4 border-t mt-4">
              <Button
                variant="ghost"
                className="w-full justify-start h-9 text-muted-foreground hover:text-foreground"
                onClick={() => setCreateCategoryOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </div>
          </div>
        </ScrollArea>
      )}

      {/* Create Category Dialog */}
      <CategoryDialog
        open={createCategoryOpen}
        onOpenChange={setCreateCategoryOpen}
      />

      {/* Create Smart Folder Dialog */}
      <SmartFolderDialog
        open={createSmartFolderOpen}
        onOpenChange={setCreateSmartFolderOpen}
        categories={allCategories}
      />

      {/* Edit Smart Folder Dialog */}
      <SmartFolderDialog
        open={editingSmartFolder !== null}
        onOpenChange={(open) => !open && setEditingSmartFolder(null)}
        folder={editingSmartFolder}
        categories={allCategories}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deletingSmartFolder !== null}
        onOpenChange={(open) => !open && setDeletingSmartFolder(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this smart folder?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the &quot;{deletingSmartFolder?.name}&quot; smart folder.
              Your recipes will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSmartFolder}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
