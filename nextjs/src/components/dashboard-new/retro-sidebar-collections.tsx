"use client";

import * as React from "react";
import { useState, useTransition, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import {
  ChevronRight,
  Plus,
  Trash2,
  MoreHorizontal,
  Sparkles,
  BookOpen,
  FolderOpen,
  FolderPlus,
  Layers,
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CreateFolderDialog } from "@/components/folders/create-folder-dialog";
import { SmartFolderDialog } from "@/components/folders/smart-folder-dialog";
import { CategoryDialog } from "@/components/folders/category-dialog";
import { deleteSmartFolder, getSystemSmartFolders } from "@/app/actions/smart-folders";
import { deleteFolder, getFolderCategories } from "@/app/actions/folders";
import type {
  FolderWithChildren,
  FolderCategoryWithFolders,
  FolderCategory,
} from "@/types/folder";
import type { SystemSmartFolder } from "@/types/smart-folder";
import { useRetroSidebar } from "./retro-sidebar-context";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// localStorage keys
const COLLAPSE_KEY = "sidebar_folders_collapsed";
const TOOLTIP_KEY = "folders_tooltip_shown";

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

  // Collapse state with localStorage persistence
  const [isOpen, setIsOpen] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);

  // Data state
  const [categories, setCategories] = useState<FolderCategoryWithFolders[]>([]);
  const [systemSmartFolders, setSystemSmartFolders] = useState<SystemSmartFolder[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Dialog states
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [createSmartFolderOpen, setCreateSmartFolderOpen] = useState(false);
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);
  const [deletingFolder, setDeletingFolder] = useState<FolderWithChildren | null>(null);
  const [deletingSmartFolder, setDeletingSmartFolder] = useState<SystemSmartFolder | null>(null);
  const [isPending, startTransition] = useTransition();

  // Load collapse state and tooltip state from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedCollapse = localStorage.getItem(COLLAPSE_KEY);
    if (savedCollapse !== null) {
      setIsOpen(savedCollapse !== "true");
    }

    const tooltipShown = localStorage.getItem(TOOLTIP_KEY);
    if (!tooltipShown) {
      const timer = setTimeout(() => setShowTooltip(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (typeof window !== "undefined") {
      localStorage.setItem(COLLAPSE_KEY, (!open).toString());
    }
  };

  const handleDismissTooltip = () => {
    setShowTooltip(false);
    if (typeof window !== "undefined") {
      localStorage.setItem(TOOLTIP_KEY, "true");
    }
  };

  // Fetch data
  const loadData = useCallback(async () => {
    const [categoriesResult, systemFoldersResult] = await Promise.all([
      getFolderCategories(),
      getSystemSmartFolders(),
    ]);

    if (!categoriesResult.error && categoriesResult.data) {
      setCategories(categoriesResult.data);
    }
    if (!systemFoldersResult.error && systemFoldersResult.data) {
      setSystemSmartFolders(systemFoldersResult.data);
    }
    setIsLoadingData(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Flatten all user folders from categories
  const allUserFolders: FolderWithChildren[] = categories.flatMap((c) => c.folders);

  // Build categories array for SmartFolderDialog
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

  const handleDeleteSmartFolder = () => {
    if (!deletingSmartFolder) return;
    startTransition(async () => {
      const result = await deleteSmartFolder(deletingSmartFolder.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Smart folder deleted");
        router.refresh();
        loadData();
      }
      setDeletingSmartFolder(null);
    });
  };

  // Total folder count for collapsed view
  const totalFolderCount = 1 + systemSmartFolders.length + allUserFolders.length;

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
                "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                isFilterActive("all")
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
            >
              <FolderOpen className="h-5 w-5" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" className="border-gray-700 bg-gray-800 text-white">
            <span>Folders ({totalFolderCount})</span>
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
        <Collapsible open={isOpen} onOpenChange={handleOpenChange}>
          {/* Section Header */}
          <div className="flex items-center justify-between px-3 py-1">
            <CollapsibleTrigger asChild>
              <button className="flex items-center gap-1.5 font-mono text-xs tracking-widest text-gray-400 uppercase transition-colors hover:text-gray-300">
                <ChevronRight
                  className={cn(
                    "h-3 w-3 transition-transform duration-200",
                    isOpen && "rotate-90"
                  )}
                />
                <span>FOLDERS</span>
                {!isOpen && (
                  <span className="text-gray-500">({totalFolderCount})</span>
                )}
              </button>
            </CollapsibleTrigger>

            {/* [+] Button with Dropdown Menu */}
            <div className="relative">
              <DropdownMenu
                onOpenChange={(open) => {
                  // Dismiss tooltip when dropdown opens
                  if (open && showTooltip) {
                    handleDismissTooltip();
                  }
                }}
              >
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onClick={() => setCreateFolderOpen(true)}>
                    <FolderPlus className="mr-2 h-4 w-4" />
                    New Folder
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCreateSmartFolderOpen(true)}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    New Smart Folder
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setCreateCategoryOpen(true)}>
                    <Layers className="mr-2 h-4 w-4" />
                    New Category
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Onboarding tooltip - positioned next to button */}
              {showTooltip && (
                <div className="absolute left-full top-0 ml-2 z-50">
                  <div className="w-64 rounded-lg border border-gray-700 bg-gray-800 p-3 shadow-lg">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-white">💡 Organize your recipes</p>
                      <p className="text-xs text-gray-400">
                        Create folders to organize recipes, or use smart folders to filter by rating, cook time & more.
                      </p>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="w-full bg-gray-700 text-white hover:bg-gray-600"
                        onClick={handleDismissTooltip}
                      >
                        Got it
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <CollapsibleContent className="flex flex-col gap-0.5">
            {/* All Recipes - Always First */}
            <Link
              href="/app/recipes"
              onClick={handleClick}
              className={cn(
                "mx-2 flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                isFilterActive("all")
                  ? "border border-gray-600 bg-gray-800 text-white shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              <BookOpen className="h-5 w-5" />
              <span className="flex-1 text-sm font-medium">All Recipes</span>
              {totalRecipeCount !== undefined && (
                <span className="text-xs text-gray-400">{totalRecipeCount}</span>
              )}
            </Link>

            {/* Divider */}
            {systemSmartFolders.length > 0 && (
              <div className="mx-4 my-1.5 border-t border-dashed border-gray-700" />
            )}

            {/* Smart Folders */}
            {systemSmartFolders.map((folder) => (
              <SmartFolderItem
                key={`system-${folder.id}`}
                folder={folder}
                isActive={isFilterActive("smart", folder.id, true)}
                onClick={handleClick}
                onDelete={() => setDeletingSmartFolder(folder)}
              />
            ))}

            {/* Divider before user folders */}
            {(systemSmartFolders.length > 0 || allUserFolders.length > 0) && (
              <div className="mx-4 my-1.5 border-t border-dashed border-gray-700" />
            )}

            {/* User Folders */}
            {allUserFolders.map((folder) => (
              <UserFolderItem
                key={folder.id}
                folder={folder}
                isActive={isFilterActive("folder", folder.id)}
                onClick={handleClick}
                onDelete={() => setDeletingFolder(folder)}
              />
            ))}
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Dialogs */}
      <CreateFolderDialog
        open={createFolderOpen}
        onOpenChange={(open) => {
          setCreateFolderOpen(open);
          if (!open) loadData();
        }}
        folders={allUserFolders}
      />

      <SmartFolderDialog
        open={createSmartFolderOpen}
        onOpenChange={(open) => {
          setCreateSmartFolderOpen(open);
          if (!open) loadData();
        }}
        categories={allCategories}
      />

      <CategoryDialog
        open={createCategoryOpen}
        onOpenChange={(open) => {
          setCreateCategoryOpen(open);
          if (!open) loadData();
        }}
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
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={deletingSmartFolder !== null}
        onOpenChange={(open) => !open && setDeletingSmartFolder(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this smart folder?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{deletingSmartFolder?.name}&quot;.
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
    </>
  );
}

// Smart Folder Item
interface SmartFolderItemProps {
  folder: SystemSmartFolder;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}

function SmartFolderItem({ folder, isActive, onClick, onDelete }: SmartFolderItemProps) {
  const params = new URLSearchParams({
    filter: "smart",
    id: folder.id,
    system: "true",
  });

  return (
    <div
      className={cn(
        "group mx-2 flex items-center gap-1 rounded-lg transition-colors",
        isActive
          ? "border border-gray-600 bg-gray-800 text-white shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]"
          : "text-gray-300 hover:bg-gray-800 hover:text-white"
      )}
    >
      <Link
        href={`/app/recipes?${params.toString()}`}
        onClick={onClick}
        className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2"
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
        <span className="flex-1 truncate text-sm font-medium">{folder.name}</span>
        {/* Sparkle badge */}
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <Sparkles className="h-3 w-3 shrink-0 text-amber-400/70 cursor-help" />
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-[200px] border-gray-700 bg-gray-800">
            <p className="font-medium text-white">Smart Folder</p>
            <p className="text-xs text-gray-400">Auto-updates based on filters like rating, cook time, or ingredients</p>
          </TooltipContent>
        </Tooltip>
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="mr-1 rounded p-1 opacity-0 transition-all group-hover:opacity-100 hover:bg-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// User Folder Item
interface UserFolderItemProps {
  folder: FolderWithChildren;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}

function UserFolderItem({ folder, isActive, onClick, onDelete }: UserFolderItemProps) {
  const params = new URLSearchParams({
    filter: "folder",
    id: folder.id,
  });

  return (
    <div
      className={cn(
        "group mx-2 flex items-center gap-1 rounded-lg transition-colors",
        isActive
          ? "border border-gray-600 bg-gray-800 text-white shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]"
          : "text-gray-300 hover:bg-gray-800 hover:text-white"
      )}
    >
      <Link
        href={`/app/recipes?${params.toString()}`}
        onClick={onClick}
        className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2"
      >
        {folder.emoji ? (
          <span className="text-sm">{folder.emoji}</span>
        ) : folder.color ? (
          <span
            className="h-3 w-3 shrink-0 rounded-full"
            style={{ backgroundColor: folder.color }}
          />
        ) : (
          <FolderOpen className="h-4 w-4" />
        )}
        <span className="flex-1 truncate text-sm font-medium">{folder.name}</span>
        {folder.recipe_count > 0 && (
          <span className="text-xs text-gray-400">{folder.recipe_count}</span>
        )}
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="mr-1 rounded p-1 opacity-0 transition-all group-hover:opacity-100 hover:bg-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
