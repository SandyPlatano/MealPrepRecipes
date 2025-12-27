"use client";

import * as React from "react";
import { useState, useTransition, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import {
  BookOpen,
  Sparkles,
  FolderOpen,
  FolderPlus,
  Plus,
  Pencil,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
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
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { SidebarDivider, CategoryDivider } from "./sidebar-section";
import { useSidebar } from "./sidebar-context";
import { SmartFolderDialog } from "@/components/folders/smart-folder-dialog";
import { CreateFolderDialog } from "@/components/folders/create-folder-dialog";
import { deleteSmartFolder, getSystemSmartFolders } from "@/app/actions/smart-folders";
import {
  deleteFolder,
  getFolderCategories,
  createFolderCategory,
  deleteFolderCategory,
  updateFolderCategory,
} from "@/app/actions/folders";
import type {
  FolderWithChildren,
  FolderCategoryWithFolders,
  FolderCategory,
} from "@/types/folder";
import type { SystemSmartFolder } from "@/types/smart-folder";
interface SidebarCollectionsProps {
  categories?: FolderCategoryWithFolders[];
  systemSmartFolders?: SystemSmartFolder[];
  totalRecipeCount?: number;
}

export function SidebarCollections({
  categories = [],
  systemSmartFolders = [],
  totalRecipeCount,
}: SidebarCollectionsProps) {
  const { isIconOnly, closeMobile, isMobile } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Smart folder management state
  const [createSmartFolderOpen, setCreateSmartFolderOpen] = useState(false);
  const [editingSmartFolder, setEditingSmartFolder] = useState<FolderWithChildren | null>(null);
  const [deletingSmartFolder, setDeletingSmartFolder] = useState<FolderWithChildren | null>(null);
  const [isPending, startTransition] = useTransition();

  // Regular folder management state
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [deletingFolder, setDeletingFolder] = useState<FolderWithChildren | null>(null);

  // Category management state
  const [editingCategory, setEditingCategory] = useState<FolderCategoryWithFolders | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryEmoji, setEditCategoryEmoji] = useState("");
  const [deletingCategory, setDeletingCategory] = useState<FolderCategoryWithFolders | null>(null);
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryEmoji, setNewCategoryEmoji] = useState("");

  // Client-side fetched data (since props may be empty)
  const [fetchedCategories, setFetchedCategories] = useState<FolderCategoryWithFolders[]>([]);
  const [fetchedSystemSmartFolders, setFetchedSystemSmartFolders] = useState<SystemSmartFolder[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Fetch categories and system smart folders on mount
  const loadSidebarData = useCallback(async () => {
    const [categoriesResult, systemFoldersResult] = await Promise.all([
      getFolderCategories(),
      getSystemSmartFolders(),
    ]);

    if (!categoriesResult.error && categoriesResult.data) {
      setFetchedCategories(categoriesResult.data);
    }
    if (!systemFoldersResult.error && systemFoldersResult.data) {
      setFetchedSystemSmartFolders(systemFoldersResult.data);
    }
    setIsLoadingData(false);
  }, []);

  useEffect(() => {
    loadSidebarData();
  }, [loadSidebarData]);

  // Use fetched data if props are empty
  const effectiveCategories = categories.length > 0 ? categories : fetchedCategories;
  const effectiveSystemSmartFolders = systemSmartFolders.length > 0 ? systemSmartFolders : fetchedSystemSmartFolders;

  // Check if we're on the recipes page
  const isOnRecipesPage = pathname === "/app/recipes" || pathname.startsWith("/app/recipes/");

  // Get current filter from URL
  const currentFilter = searchParams.get("filter");
  const currentFilterId = searchParams.get("id");
  const isSystem = searchParams.get("system") === "true";

  const handleClick = () => {
    if (isMobile) {
      closeMobile();
    }
  };

  // Helper to check if a filter is active
  const isFilterActive = (type: string, id?: string, system?: boolean) => {
    if (!isOnRecipesPage) return false;
    if (type === "all" && !currentFilter) return true;
    if (type === currentFilter && id === currentFilterId) {
      if (type === "smart") return system === isSystem;
      return true;
    }
    return false;
  };

  // Build URL for filter
  const buildFilterUrl = (type: string, id?: string, system?: boolean) => {
    const params = new URLSearchParams();
    if (type !== "all") {
      params.set("filter", type);
      if (id) params.set("id", id);
      if (type === "smart" && system) params.set("system", "true");
    }
    const query = params.toString();
    return `/app/recipes${query ? `?${query}` : ""}`;
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
        router.refresh();
        loadSidebarData(); // Refetch sidebar data
      }
      setDeletingSmartFolder(null);
    });
  };

  // Handle delete regular folder
  const handleDeleteFolder = () => {
    if (!deletingFolder) return;

    startTransition(async () => {
      const result = await deleteFolder(deletingFolder.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Folder deleted");
        router.refresh();
        loadSidebarData(); // Refetch sidebar data
      }
      setDeletingFolder(null);
    });
  };

  // Handle edit category
  const handleEditCategory = (category: FolderCategoryWithFolders) => {
    setEditCategoryName(category.name);
    setEditCategoryEmoji(category.emoji || "");
    setEditingCategory(category);
  };

  // Handle save category edit
  const handleSaveCategoryEdit = () => {
    if (!editingCategory) return;

    startTransition(async () => {
      const result = await updateFolderCategory(editingCategory.id, {
        name: editCategoryName,
        emoji: editCategoryEmoji || null,
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Category updated");
        router.refresh();
        loadSidebarData();
      }
      setEditingCategory(null);
    });
  };

  // Handle delete category
  const handleDeleteCategory = () => {
    if (!deletingCategory) return;

    startTransition(async () => {
      const result = await deleteFolderCategory(deletingCategory.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Category deleted");
        router.refresh();
        loadSidebarData();
      }
      setDeletingCategory(null);
    });
  };

  // Handle create category
  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) return;

    startTransition(async () => {
      const result = await createFolderCategory({
        name: newCategoryName.trim(),
        emoji: newCategoryEmoji || null,
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Category created");
        router.refresh();
        loadSidebarData();
      }
      setCreateCategoryOpen(false);
      setNewCategoryName("");
      setNewCategoryEmoji("");
    });
  };

  // Get all folders for CreateFolderDialog
  const allFolders: FolderWithChildren[] = effectiveCategories.flatMap((c) => c.folders);

  // Build categories array for SmartFolderDialog
  const allCategories: FolderCategory[] = effectiveCategories.map((c) => ({
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

  // Collapsed icon-only view
  if (isIconOnly) {
    return (
      <div className="px-2 py-2 flex flex-col gap-1">
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              asChild
              className={cn(
                "h-10 w-10",
                isFilterActive("all") && "bg-primary/10 text-primary"
              )}
            >
              <Link href="/app/recipes" onClick={handleClick}>
                <BookOpen className="h-4 w-4" />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <span>All Recipes</span>
            {totalRecipeCount !== undefined && (
              <span className="ml-2 text-muted-foreground">({totalRecipeCount})</span>
            )}
          </TooltipContent>
        </Tooltip>

        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <div className="flex items-center justify-center h-8 text-muted-foreground">
              <FolderOpen className="h-4 w-4" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">
            <span>Folders</span>
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <>
      <div className="px-2 flex flex-col gap-0.5">
        {/* All Recipes */}
        <Button
          variant="ghost"
          asChild
          className={cn(
            "w-full justify-start gap-3 h-11 px-3 relative",
            "transition-all duration-150",
            isFilterActive("all") && [
              "bg-primary/15 text-primary font-semibold",
              "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2",
              "before:h-7 before:w-1 before:bg-primary before:rounded-r",
            ],
            !isFilterActive("all") && "text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
        >
          <Link href="/app/recipes" onClick={handleClick}>
            <BookOpen className="h-4 w-4 shrink-0" />
            <span className="flex-1 truncate text-sm font-medium">All Recipes</span>
            {totalRecipeCount !== undefined && (
              <span className="ml-auto text-xs text-muted-foreground">
                {totalRecipeCount}
              </span>
            )}
          </Link>
        </Button>

        {/* Quick Access - System smart folders (flat list) */}
        {effectiveSystemSmartFolders.length > 0 && (
          <>
            <SidebarDivider />
            {effectiveSystemSmartFolders.map((folder) => (
              <SmartFolderItem
                key={`system-${folder.id}`}
                id={folder.id}
                name={folder.name}
                emoji={folder.emoji}
                color={folder.color}
                isSystem
                isActive={isFilterActive("smart", folder.id, true)}
                onClick={handleClick}
              />
            ))}
          </>
        )}

        {/* Folders section divider */}
        {effectiveCategories.length > 0 && <SidebarDivider />}

        {/* Categories with folders - flat structure */}
        {effectiveCategories.map((category) => {
          const isUncategorized = category.id === "uncategorized";
          const canEdit = !isUncategorized;
          const canDelete = !isUncategorized && !category.is_system;

          return (
            <React.Fragment key={category.id}>
              <CategoryDivider
                label={category.name}
                emoji={category.emoji}
                onEdit={canEdit ? () => handleEditCategory(category) : undefined}
                onDelete={canDelete ? () => setDeletingCategory(category) : undefined}
                canEdit={canEdit}
                canDelete={canDelete}
              />
              {category.folders.map((folder) => (
                <FolderItem
                  key={folder.id}
                  folder={folder}
                  isActive={isFilterActive("folder", folder.id)}
                  onClick={handleClick}
                  onDelete={(f) => setDeletingFolder(f)}
                  onCreateNew={() => setCreateFolderOpen(true)}
                  isFilterActive={isFilterActive}
                />
              ))}
            </React.Fragment>
          );
        })}

        {/* Add folder/category menu */}
        <div className="flex justify-end px-1 pt-2">
          <AddFolderMenu
            onCreateFolder={() => setCreateFolderOpen(true)}
            onCreateCategory={() => setCreateCategoryOpen(true)}
          />
        </div>
      </div>

      {/* Create Smart Folder Dialog */}
      <SmartFolderDialog
        open={createSmartFolderOpen}
        onOpenChange={(open) => {
          setCreateSmartFolderOpen(open);
          if (!open) loadSidebarData();
        }}
        categories={allCategories}
      />

      {/* Edit Smart Folder Dialog */}
      <SmartFolderDialog
        open={editingSmartFolder !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingSmartFolder(null);
            loadSidebarData();
          }
        }}
        folder={editingSmartFolder}
        categories={allCategories}
      />

      {/* Delete Smart Folder Confirmation */}
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

      {/* Create Regular Folder Dialog */}
      <CreateFolderDialog
        open={createFolderOpen}
        onOpenChange={(open) => {
          setCreateFolderOpen(open);
          if (!open) loadSidebarData();
        }}
        folders={allFolders}
      />

      {/* Delete Regular Folder Confirmation */}
      <AlertDialog
        open={deletingFolder !== null}
        onOpenChange={(open) => !open && setDeletingFolder(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this folder?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the &quot;{deletingFolder?.name}&quot; folder.
              Your recipes will not be affected - they will remain in your collection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFolder}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Category Dialog */}
      <Dialog
        open={editingCategory !== null}
        onOpenChange={(open) => !open && setEditingCategory(null)}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the name and emoji for this category.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="category-name">Name</Label>
              <Input
                id="category-name"
                value={editCategoryName}
                onChange={(e) => setEditCategoryName(e.target.value)}
                placeholder="Category name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category-emoji">Emoji (optional)</Label>
              <Input
                id="category-emoji"
                value={editCategoryEmoji}
                onChange={(e) => setEditCategoryEmoji(e.target.value)}
                placeholder="📁"
                className="w-20"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingCategory(null)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveCategoryEdit}
              disabled={isPending || !editCategoryName.trim()}
            >
              {isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirmation */}
      <AlertDialog
        open={deletingCategory !== null}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the &quot;{deletingCategory?.name}&quot; category.
              All folders in this category will be reassigned to another category.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Category Dialog */}
      <Dialog
        open={createCategoryOpen}
        onOpenChange={(open) => {
          setCreateCategoryOpen(open);
          if (!open) {
            setNewCategoryName("");
            setNewCategoryEmoji("");
          }
        }}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Create Category</DialogTitle>
            <DialogDescription>
              Create a new category to organize your folders.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-category-name">Name</Label>
              <Input
                id="new-category-name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Category name"
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-category-emoji">Emoji (optional)</Label>
              <Input
                id="new-category-emoji"
                value={newCategoryEmoji}
                onChange={(e) => setNewCategoryEmoji(e.target.value)}
                placeholder="📁"
                className="w-20"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateCategoryOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateCategory}
              disabled={isPending || !newCategoryName.trim()}
            >
              {isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Add menu dropdown for creating folders and categories
interface AddFolderMenuProps {
  onCreateFolder: () => void;
  onCreateCategory: () => void;
}

function AddFolderMenu({ onCreateFolder, onCreateCategory }: AddFolderMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-foreground"
          title="Add folder or category"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={onCreateFolder}>
          <Plus className="h-4 w-4 mr-2" />
          New Folder
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onCreateCategory}>
          <FolderPlus className="h-4 w-4 mr-2" />
          New Category
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Smart Folder Item - System folders (read-only, no context menu)
interface SystemSmartFolderItemProps {
  id: string;
  name: string;
  emoji?: string | null;
  color?: string | null;
  isSystem: true;
  isActive: boolean;
  onClick: () => void;
}

// Smart Folder Item - User folders (editable, with context menu)
interface UserSmartFolderItemProps {
  folder: FolderWithChildren;
  isActive: boolean;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCreateNew: () => void;
}

type SmartFolderItemProps = SystemSmartFolderItemProps | UserSmartFolderItemProps;

function isSystemFolder(props: SmartFolderItemProps): props is SystemSmartFolderItemProps {
  return "isSystem" in props && props.isSystem === true;
}

function SmartFolderItem(props: SmartFolderItemProps) {
  // System folders - simple render without context menu
  if (isSystemFolder(props)) {
    const { id, name, emoji, color, isActive, onClick } = props;
    const params = new URLSearchParams({
      filter: "smart",
      id,
      system: "true",
    });

    return (
      <Button
        variant="ghost"
        asChild
        className={cn(
          "w-full justify-start gap-3 h-11 px-3 relative",
          "transition-all duration-150",
          isActive && [
            "bg-primary/15 text-primary font-semibold",
            "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2",
            "before:h-7 before:w-1 before:bg-primary before:rounded-r",
          ],
          !isActive && "text-muted-foreground hover:text-foreground hover:bg-accent"
        )}
      >
        <Link href={`/app/recipes?${params.toString()}`} onClick={onClick}>
          {emoji ? (
            <span className="text-sm">{emoji}</span>
          ) : color ? (
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: color }}
            />
          ) : (
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-brand-coral" />
          )}
          <span className="flex-1 truncate text-sm">{name}</span>
        </Link>
      </Button>
    );
  }

  // User folders - render with context menu and three-dot dropdown
  const { folder, isActive, onClick, onEdit, onDelete, onCreateNew } = props;
  const params = new URLSearchParams({
    filter: "smart",
    id: folder.id,
  });

  // Shared menu content for both context menu and dropdown
  const menuContent = (
    <>
      <DropdownMenuItem onClick={onEdit}>
        <Pencil className="h-4 w-4 mr-2" />
        Edit Smart Folder
      </DropdownMenuItem>
      <DropdownMenuItem onClick={onCreateNew}>
        <Plus className="h-4 w-4 mr-2" />
        Add Smart Folder
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        className="text-destructive focus:text-destructive"
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Delete Smart Folder
      </DropdownMenuItem>
    </>
  );

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className={cn(
            "group flex items-center gap-1 h-11 px-3 relative rounded-md",
            "transition-all duration-150",
            isActive && [
              "bg-primary/15 text-primary font-semibold",
              "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2",
              "before:h-7 before:w-1 before:bg-primary before:rounded-r",
            ],
            !isActive && "text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
        >
          {/* Folder link */}
          <Link
            href={`/app/recipes?${params.toString()}`}
            onClick={onClick}
            className="flex items-center gap-3 flex-1 min-w-0"
          >
            {folder.emoji ? (
              <span className="text-sm">{folder.emoji}</span>
            ) : folder.color ? (
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: folder.color }}
              />
            ) : (
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-brand-coral" />
            )}
            <span className="flex-1 truncate text-sm">{folder.name}</span>
          </Link>

          {/* Three-dot menu - visible on hover */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {menuContent}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={onEdit}>
          <Pencil className="h-4 w-4 mr-2" />
          Edit Smart Folder
        </ContextMenuItem>
        <ContextMenuItem onClick={onCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add Smart Folder
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          className="text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Smart Folder
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

// Folder Item (flat, no nesting)
interface FolderItemProps {
  folder: FolderWithChildren;
  isActive: boolean;
  onClick: () => void;
  onDelete: (folder: FolderWithChildren) => void;
  onCreateNew: () => void;
  isFilterActive: (type: string, id?: string, system?: boolean) => boolean;
}

function FolderItem({
  folder,
  isActive,
  onClick,
  onDelete,
  onCreateNew,
}: FolderItemProps) {
  const params = new URLSearchParams({
    filter: "folder",
    id: folder.id,
  });

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className={cn(
            "group flex items-center gap-1 h-11 px-3 relative rounded-md",
            "transition-all duration-150",
            isActive && [
              "bg-primary/15 text-primary font-semibold",
              "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2",
              "before:h-7 before:w-1 before:bg-primary before:rounded-r",
            ],
            !isActive && "text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
        >
          {/* Folder link */}
          <Link
            href={`/app/recipes?${params.toString()}`}
            onClick={onClick}
            className="flex items-center gap-2 flex-1 min-w-0"
          >
            {folder.emoji ? (
              <span className="text-sm">{folder.emoji}</span>
            ) : folder.color ? (
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: folder.color }}
              />
            ) : (
              <FolderOpen className="h-3.5 w-3.5 shrink-0" />
            )}
            <span className="flex-1 truncate text-sm flex items-center gap-1.5">
              {folder.name}
              {folder.is_smart && (
                <Sparkles className="h-3 w-3 text-amber-500" />
              )}
            </span>
            {folder.recipe_count > 0 && (
              <span className="text-xs text-muted-foreground">
                {folder.recipe_count}
              </span>
            )}
          </Link>

          {/* Three-dot menu - visible on hover */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                Add Folder
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(folder)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Folder
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={onCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add Folder
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          className="text-destructive"
          onClick={() => onDelete(folder)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Folder
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
