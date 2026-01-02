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
  ChevronRight,
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";
import { useSidebar } from "./sidebar-context";
import { SmartFolderDialog } from "@/components/folders/smart-folder-dialog";
import { CreateFolderDialog } from "@/components/folders/create-folder-dialog";
import { deleteSmartFolder, getSystemSmartFolders } from "@/app/actions/smart-folders";
import { deleteFolder, getFolderCategories } from "@/app/actions/folders";
import type { FolderWithChildren, FolderCategoryWithFolders, FolderCategory } from "@/types/folder";
import type { SystemSmartFolder } from "@/types/smart-folder";

// localStorage keys
const COLLAPSE_KEY = "sidebar_folders_collapsed";
const TOOLTIP_KEY = "folders_tooltip_shown";

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

  // Collapse state with localStorage persistence
  const [isOpen, setIsOpen] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);

  // Smart folder management state
  const [createSmartFolderOpen, setCreateSmartFolderOpen] = useState(false);
  const [editingSmartFolder, setEditingSmartFolder] = useState<FolderWithChildren | null>(null);
  const [deletingSmartFolder, setDeletingSmartFolder] = useState<FolderWithChildren | SystemSmartFolder | null>(null);
  const [isPending, startTransition] = useTransition();

  // Regular folder management state
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [deletingFolder, setDeletingFolder] = useState<FolderWithChildren | null>(null);

  // Client-side fetched data (since props may be empty)
  const [fetchedCategories, setFetchedCategories] = useState<FolderCategoryWithFolders[]>([]);
  const [fetchedSystemSmartFolders, setFetchedSystemSmartFolders] = useState<SystemSmartFolder[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Load collapse state and tooltip state from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Load collapse state
    const savedCollapse = localStorage.getItem(COLLAPSE_KEY);
    if (savedCollapse !== null) {
      setIsOpen(savedCollapse !== "true");
    }

    // Check if tooltip has been shown
    const tooltipShown = localStorage.getItem(TOOLTIP_KEY);
    if (!tooltipShown) {
      // Show tooltip after a brief delay
      const timer = setTimeout(() => setShowTooltip(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Persist collapse state
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (typeof window !== "undefined") {
      localStorage.setItem(COLLAPSE_KEY, (!open).toString());
    }
  };

  // Dismiss tooltip
  const handleDismissTooltip = () => {
    setShowTooltip(false);
    if (typeof window !== "undefined") {
      localStorage.setItem(TOOLTIP_KEY, "true");
    }
  };

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

  // Flatten all user folders from categories
  const allUserFolders: FolderWithChildren[] = effectiveCategories.flatMap((c) => c.folders);

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

  // Handle delete smart folder (both system and user)
  const handleDeleteSmartFolder = () => {
    if (!deletingSmartFolder) return;

    startTransition(async () => {
      const result = await deleteSmartFolder(deletingSmartFolder.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Smart folder deleted");
        router.refresh();
        loadSidebarData();
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
        loadSidebarData();
      }
      setDeletingFolder(null);
    });
  };

  // Total folder count for collapsed view
  const totalFolderCount = 1 + effectiveSystemSmartFolders.length + allUserFolders.length;

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
                isFilterActive("all") && "bg-[#D9F99D]/20 dark:bg-[#D9F99D]/10 text-[#1A1A1A] dark:text-[#E2E8F0]"
              )}
            >
              <Link href="/app/recipes" onClick={handleClick}>
                <FolderOpen className="h-4 w-4" />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <span>Folders ({totalFolderCount})</span>
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <>
      <div className="px-2 flex flex-col gap-0.5">
        <Collapsible open={isOpen} onOpenChange={handleOpenChange}>
          {/* Section Header */}
          <div className="flex items-center justify-between px-1 py-1">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                <ChevronRight
                  className={cn(
                    "size-3.5 transition-transform duration-200",
                    isOpen && "rotate-90"
                  )}
                />
                <span>FOLDERS</span>
                {!isOpen && (
                  <span className="text-muted-foreground/70">({totalFolderCount})</span>
                )}
              </Button>
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
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    title="Add folder"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onClick={() => setCreateFolderOpen(true)}>
                    <FolderPlus className="h-4 w-4 mr-2" />
                    New Folder
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCreateSmartFolderOpen(true)}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    New Smart Folder
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Onboarding tooltip - positioned next to button */}
              {showTooltip && (
                <div className="absolute left-full top-0 ml-2 z-50">
                  <div className="w-64 rounded-lg border bg-popover p-3 shadow-lg">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">💡 Organize your recipes</p>
                      <p className="text-xs text-muted-foreground">
                        Create folders to organize recipes, or use smart folders to filter by rating, cook time & more.
                      </p>
                      <Button size="sm" variant="secondary" className="w-full" onClick={handleDismissTooltip}>
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
            <FolderButton
              href="/app/recipes"
              icon={<BookOpen className="h-4 w-4 shrink-0" />}
              label="All Recipes"
              count={totalRecipeCount}
              isActive={isFilterActive("all")}
              onClick={handleClick}
            />

            {/* Divider */}
            {effectiveSystemSmartFolders.length > 0 && (
              <div className="h-px bg-border/50 my-1.5 mx-3" style={{ borderStyle: "dashed" }} />
            )}

            {/* Smart Folders */}
            {effectiveSystemSmartFolders.map((folder) => (
              <SmartFolderItem
                key={`system-${folder.id}`}
                folder={folder}
                isActive={isFilterActive("smart", folder.id, true)}
                onClick={handleClick}
                onDelete={() => setDeletingSmartFolder(folder)}
              />
            ))}

            {/* Divider before user folders */}
            {(effectiveSystemSmartFolders.length > 0 || allUserFolders.length > 0) && (
              <div className="h-px bg-border/50 my-1.5 mx-3" style={{ borderStyle: "dashed" }} />
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

            {/* Empty State for User Folders */}
            {allUserFolders.length === 0 && !isLoadingData && (
              <button
                onClick={() => setCreateFolderOpen(true)}
                className={cn(
                  "mx-2 my-1 p-3 rounded-md border border-dashed border-muted-foreground/30",
                  "text-muted-foreground hover:text-foreground hover:border-muted-foreground/50",
                  "transition-colors cursor-pointer text-left"
                )}
              >
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">Create a folder</p>
                    <p className="text-xs text-muted-foreground">to organize recipes</p>
                  </div>
                </div>
              </button>
            )}
          </CollapsibleContent>
        </Collapsible>
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
        folders={allUserFolders}
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
    </>
  );
}

// Simple folder button for All Recipes
interface FolderButtonProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  count?: number;
  isActive: boolean;
  onClick: () => void;
}

function FolderButton({ href, icon, label, count, isActive, onClick }: FolderButtonProps) {
  return (
    <Button
      variant="ghost"
      asChild
      className={cn(
        "w-full justify-start gap-3 h-10 px-3 relative",
        "transition-all duration-150",
        isActive && [
          "bg-[#D9F99D]/20 dark:bg-[#D9F99D]/10 text-[#1A1A1A] dark:text-[#E2E8F0] font-semibold",
          "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2",
          "before:h-6 before:w-1 before:bg-[#D9F99D] before:rounded-r",
        ],
        !isActive && "text-[var(--color-sidebar-text-muted)] hover:text-[var(--color-sidebar-text)] hover:bg-gray-100 dark:hover:bg-[var(--color-sidebar-surface)]/50"
      )}
    >
      <Link href={href} onClick={onClick}>
        {icon}
        <span className="flex-1 truncate text-sm font-medium">{label}</span>
        {count !== undefined && (
          <span className="ml-auto text-xs text-muted-foreground">{count}</span>
        )}
      </Link>
    </Button>
  );
}


// Smart Folder Item (system or user-created)
interface SmartFolderItemProps {
  folder: SystemSmartFolder | FolderWithChildren;
  isActive: boolean;
  onClick: () => void;
  onEdit?: () => void;
  onDelete: () => void;
}

function SmartFolderItem({ folder, isActive, onClick, onEdit, onDelete }: SmartFolderItemProps) {
  const isSystemFolder = "filter_config" in folder;
  const params = new URLSearchParams({
    filter: "smart",
    id: folder.id,
    ...(isSystemFolder ? { system: "true" } : {}),
  });

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className={cn(
            "group flex items-center gap-1 h-10 px-3 relative rounded-md",
            "transition-all duration-150",
            isActive && [
              "bg-[#D9F99D]/20 dark:bg-[#D9F99D]/10 text-[#1A1A1A] dark:text-[#E2E8F0] font-semibold",
              "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2",
              "before:h-6 before:w-1 before:bg-[#D9F99D] before:rounded-r",
            ],
            !isActive && "text-[var(--color-sidebar-text-muted)] hover:text-[var(--color-sidebar-text)] hover:bg-gray-100 dark:hover:bg-[var(--color-sidebar-surface)]/50"
          )}
        >
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
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-500" />
            )}
            <span className="flex-1 truncate text-sm">{folder.name}</span>
            {/* Sparkle badge for smart folders */}
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Sparkles className="h-3 w-3 text-amber-500/70 shrink-0 cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-[200px]">
                <p className="font-medium">Smart Folder</p>
                <p className="text-xs text-muted-foreground">Auto-updates based on filters like rating, cook time, or ingredients</p>
              </TooltipContent>
            </Tooltip>
          </Link>

          {/* Three-dot menu */}
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
              {onEdit && (
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Filters
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        {onEdit && (
          <>
            <ContextMenuItem onClick={onEdit}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Filters
            </ContextMenuItem>
            <ContextMenuSeparator />
          </>
        )}
        <ContextMenuItem className="text-destructive" onClick={onDelete}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

// User Folder Item (regular folders)
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
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className={cn(
            "group flex items-center gap-1 h-10 px-3 relative rounded-md",
            "transition-all duration-150",
            isActive && [
              "bg-[#D9F99D]/20 dark:bg-[#D9F99D]/10 text-[#1A1A1A] dark:text-[#E2E8F0] font-semibold",
              "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2",
              "before:h-6 before:w-1 before:bg-[#D9F99D] before:rounded-r",
            ],
            !isActive && "text-[var(--color-sidebar-text-muted)] hover:text-[var(--color-sidebar-text)] hover:bg-gray-100 dark:hover:bg-[var(--color-sidebar-surface)]/50"
          )}
        >
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
              <FolderOpen className="h-3.5 w-3.5 shrink-0" />
            )}
            <span className="flex-1 truncate text-sm">{folder.name}</span>
            {folder.recipe_count > 0 && (
              <span className="text-xs text-muted-foreground">{folder.recipe_count}</span>
            )}
          </Link>

          {/* Three-dot menu */}
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
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem className="text-destructive" onClick={onDelete}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
