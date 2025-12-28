"use client";

import * as React from "react";
import { useState, useTransition, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  MoreHorizontal,
  Sparkles,
  BookOpen,
  Folder,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CreateFolderDialog } from "@/components/folders/create-folder-dialog";
import { getSystemSmartFolders } from "@/app/actions/smart-folders";
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
} from "@/types/folder";
import type { SystemSmartFolder } from "@/types/smart-folder";
import { useRetroSidebar } from "./retro-sidebar-context";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RetroSidebarCollectionsProps {
  totalRecipeCount?: number;
}

export function RetroSidebarCollections({
  totalRecipeCount,
}: RetroSidebarCollectionsProps) {
  const { isIconOnly, closeMobile, isMobile } = useRetroSidebar();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Data state
  const [categories, setCategories] = useState<FolderCategoryWithFolders[]>([]);
  const [systemSmartFolders, setSystemSmartFolders] = useState<SystemSmartFolder[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Expanded categories state
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Dialog states
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [deletingFolder, setDeletingFolder] = useState<FolderWithChildren | null>(null);
  const [editingCategory, setEditingCategory] = useState<FolderCategoryWithFolders | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryEmoji, setEditCategoryEmoji] = useState("");
  const [deletingCategory, setDeletingCategory] = useState<FolderCategoryWithFolders | null>(null);
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryEmoji, setNewCategoryEmoji] = useState("");
  const [isPending, startTransition] = useTransition();

  // Fetch data
  const loadData = useCallback(async () => {
    const [categoriesResult, systemFoldersResult] = await Promise.all([
      getFolderCategories(),
      getSystemSmartFolders(),
    ]);

    if (!categoriesResult.error && categoriesResult.data) {
      setCategories(categoriesResult.data);
      // Expand all categories by default
      setExpandedCategories(new Set(categoriesResult.data.map((c) => c.id)));
    }
    if (!systemFoldersResult.error && systemFoldersResult.data) {
      setSystemSmartFolders(systemFoldersResult.data);
    }
    setIsLoadingData(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // URL and filter helpers
  const isOnRecipesPage = pathname === "/app/recipes" || pathname.startsWith("/app/recipes/");
  const currentFilter = searchParams.get("filter");
  const currentFilterId = searchParams.get("id");
  const isSystem = searchParams.get("system") === "true";

  const handleClick = () => {
    if (isMobile) closeMobile();
  };

  const isFilterActive = (type: string, id?: string, system?: boolean) => {
    if (!isOnRecipesPage) return false;
    if (type === "all" && !currentFilter) return true;
    if (type === currentFilter && id === currentFilterId) {
      if (type === "smart") return system === isSystem;
      return true;
    }
    return false;
  };

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

  // Category actions
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const handleEditCategory = (category: FolderCategoryWithFolders) => {
    setEditCategoryName(category.name);
    setEditCategoryEmoji(category.emoji || "");
    setEditingCategory(category);
  };

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
        loadData();
      }
      setEditingCategory(null);
    });
  };

  const handleDeleteCategory = () => {
    if (!deletingCategory) return;
    startTransition(async () => {
      const result = await deleteFolderCategory(deletingCategory.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Category deleted");
        router.refresh();
        loadData();
      }
      setDeletingCategory(null);
    });
  };

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
        loadData();
      }
      setCreateCategoryOpen(false);
      setNewCategoryName("");
      setNewCategoryEmoji("");
    });
  };

  const handleDeleteFolder = () => {
    if (!deletingFolder) return;
    startTransition(async () => {
      const result = await deleteFolder(deletingFolder.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Folder deleted");
        router.refresh();
        loadData();
      }
      setDeletingFolder(null);
    });
  };

  const allFolders: FolderWithChildren[] = categories.flatMap((c) => c.folders);

  // Collapsed icon-only view
  if (isIconOnly) {
    return (
      <div className="flex flex-col gap-1 px-2 py-2">
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Link
              href="/app/recipes"
              onClick={handleClick}
              className={cn(
                `
                  flex h-10 w-10 items-center justify-center rounded-lg
                  transition-colors
                `,
                isFilterActive("all")
                  ? "bg-gray-800 text-white"
                  : `
                    text-gray-400
                    hover:bg-gray-800 hover:text-white
                  `
              )}
            >
              <BookOpen className="h-5 w-5" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" className={`
            border-gray-700 bg-gray-800 text-white
          `}>
            <span>All Recipes</span>
            {totalRecipeCount !== undefined && (
              <span className="ml-2 text-gray-400">({totalRecipeCount})</span>
            )}
          </TooltipContent>
        </Tooltip>

        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <div className={`
              flex h-10 w-10 items-center justify-center text-gray-500
            `}>
              <Folder className="h-5 w-5" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className={`
            border-gray-700 bg-gray-800 text-white
          `}>
            <span>Folders</span>
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  if (isLoadingData) {
    return (
      <div className="px-4 py-2">
        <div className="mb-2 h-4 w-24 animate-pulse rounded bg-gray-700" />
        <div className="h-4 w-32 animate-pulse rounded bg-gray-700" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-0.5">
        {/* All Recipes */}
        <Link
          href="/app/recipes"
          onClick={handleClick}
          className={cn(
            `
              mx-2 flex items-center gap-3 rounded-lg px-3 py-2
              transition-colors
            `,
            isFilterActive("all")
              ? `
                border border-gray-600 bg-gray-800 text-white
                shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]
              `
              : `
                text-gray-300
                hover:bg-gray-800 hover:text-white
              `
          )}
        >
          <BookOpen className="h-5 w-5" />
          <span className="flex-1 text-sm font-medium">All Recipes</span>
          {totalRecipeCount !== undefined && (
            <span className="text-xs text-gray-400">{totalRecipeCount}</span>
          )}
        </Link>

        {/* System Smart Folders */}
        {systemSmartFolders.length > 0 && (
          <div className="mt-2">
            {systemSmartFolders.map((folder) => (
              <Link
                key={`system-${folder.id}`}
                href={buildFilterUrl("smart", folder.id, true)}
                onClick={handleClick}
                className={cn(
                  `
                    mx-2 flex items-center gap-3 rounded-lg px-3 py-2
                    transition-colors
                  `,
                  isFilterActive("smart", folder.id, true)
                    ? `
                      border border-gray-600 bg-gray-800 text-white
                      shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]
                    `
                    : `
                      text-gray-300
                      hover:bg-gray-800 hover:text-white
                    `
                )}
              >
                {folder.emoji ? (
                  <span className="text-sm">{folder.emoji}</span>
                ) : folder.color ? (
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: folder.color }}
                  />
                ) : (
                  <Sparkles className="h-4 w-4 text-amber-400" />
                )}
                <span className="text-sm font-medium">{folder.name}</span>
              </Link>
            ))}
          </div>
        )}

        {/* Categories with folders */}
        {categories.map((category) => {
          const isExpanded = expandedCategories.has(category.id);
          const isUncategorized = category.id === "uncategorized";
          const canEdit = !isUncategorized;
          const canDelete = !isUncategorized && !category.is_system;

          return (
            <div key={category.id} className="mt-3">
              {/* Category header */}
              <div className="group mb-1 flex items-center justify-between px-4">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className={`
                    flex items-center gap-1 font-mono text-xs tracking-widest
                    text-gray-400 uppercase transition-colors
                    hover:text-gray-300
                  `}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                  {category.emoji && <span>{category.emoji}</span>}
                  <span>{category.name}</span>
                </button>

                {(canEdit || canDelete) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className={`
                        rounded p-1 opacity-0 transition-all
                        group-hover:opacity-100
                        hover:bg-gray-800
                      `}>
                        <MoreHorizontal className="h-3 w-3 text-gray-400" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      {canEdit && (
                        <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {canDelete && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className={`
                              text-destructive
                              focus:text-destructive
                            `}
                            onClick={() => setDeletingCategory(category)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Folders in category */}
              {isExpanded && (
                <div className="space-y-0.5">
                  {category.folders.map((folder) => (
                    <div
                      key={folder.id}
                      className={cn(
                        `
                          group mx-2 flex items-center gap-1 rounded-lg
                          transition-colors
                        `,
                        isFilterActive("folder", folder.id)
                          ? `
                            border border-gray-600 bg-gray-800 text-white
                            shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]
                          `
                          : `
                            text-gray-300
                            hover:bg-gray-800 hover:text-white
                          `
                      )}
                    >
                      <Link
                        href={buildFilterUrl("folder", folder.id)}
                        onClick={handleClick}
                        className={`
                          flex min-w-0 flex-1 items-center gap-2 px-3 py-2
                        `}
                      >
                        {folder.emoji ? (
                          <span className="text-sm">{folder.emoji}</span>
                        ) : folder.color ? (
                          <span
                            className="h-3 w-3 shrink-0 rounded-full"
                            style={{ backgroundColor: folder.color }}
                          />
                        ) : (
                          <Folder className="h-4 w-4" />
                        )}
                        <span className={`
                          flex items-center gap-1 truncate text-sm
                        `}>
                          {folder.name}
                          {folder.is_smart && (
                            <Sparkles className="h-3 w-3 text-amber-400" />
                          )}
                        </span>
                        {folder.recipe_count > 0 && (
                          <span className="ml-auto text-xs text-gray-400">
                            {folder.recipe_count}
                          </span>
                        )}
                      </Link>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className={`
                              mr-1 rounded p-1 opacity-0 transition-all
                              group-hover:opacity-100
                              hover:bg-gray-700
                            `}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            className={`
                              text-destructive
                              focus:text-destructive
                            `}
                            onClick={() => setDeletingFolder(folder)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Add folder/category */}
        <div className="flex justify-end px-4 pt-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={`
                rounded p-1 text-gray-400 transition-colors
                hover:bg-gray-800 hover:text-white
              `}>
                <Plus className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setCreateFolderOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Folder
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCreateCategoryOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Category
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Dialogs */}
      <CreateFolderDialog
        open={createFolderOpen}
        onOpenChange={(open) => {
          setCreateFolderOpen(open);
          if (!open) loadData();
        }}
        folders={allFolders}
      />

      <AlertDialog
        open={deletingFolder !== null}
        onOpenChange={(open) => !open && setDeletingFolder(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this folder?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{deletingFolder?.name}&quot;.
              Your recipes will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFolder}
              disabled={isPending}
              className={`
                bg-destructive text-destructive-foreground
                hover:bg-destructive/90
              `}
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
            <Button variant="outline" onClick={() => setEditingCategory(null)}>
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

      <AlertDialog
        open={deletingCategory !== null}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{deletingCategory?.name}&quot;.
              Folders will be moved to another category.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              disabled={isPending}
              className={`
                bg-destructive text-destructive-foreground
                hover:bg-destructive/90
              `}
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
            <Button variant="outline" onClick={() => setCreateCategoryOpen(false)}>
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
