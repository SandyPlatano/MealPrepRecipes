"use client";

import * as React from "react";
import { useState, useTransition, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import {
  Folders,
  BookOpen,
  Sparkles,
  ChevronRight,
  FolderOpen,
  Plus,
  Pencil,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import { toast } from "sonner";
import { SidebarSection } from "./sidebar-section";
import { useSidebar } from "./sidebar-context";
import { SmartFolderDialog } from "@/components/folders/smart-folder-dialog";
import { CreateFolderDialog } from "@/components/folders/create-folder-dialog";
import { deleteSmartFolder } from "@/app/actions/smart-folders";
import { deleteFolder, getFolderCategories } from "@/app/actions/folders";
import { getIconComponent } from "@/lib/sidebar/sidebar-icons";
import type {
  FolderWithChildren,
  FolderCategoryWithFolders,
  FolderCategory,
} from "@/types/folder";
import type { SystemSmartFolder } from "@/types/smart-folder";
import type { SidebarIconName } from "@/types/sidebar-customization";

interface SidebarCollectionsProps {
  categories?: FolderCategoryWithFolders[];
  systemSmartFolders?: SystemSmartFolder[];
  userSmartFolders?: FolderWithChildren[];
  totalRecipeCount?: number;
  customLabel?: string | null;
  customIcon?: SidebarIconName | null;
  customEmoji?: string | null;
}

export function SidebarCollections({
  categories = [],
  systemSmartFolders = [],
  userSmartFolders = [],
  totalRecipeCount,
  customLabel,
  customIcon,
  customEmoji,
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

  // Client-side fetched categories (since props may be empty)
  const [fetchedCategories, setFetchedCategories] = useState<FolderCategoryWithFolders[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Fetch categories on mount and when router refreshes
  const loadCategories = useCallback(async () => {
    const result = await getFolderCategories();
    if (!result.error && result.data) {
      setFetchedCategories(result.data);
    }
    setIsLoadingCategories(false);
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Use fetched categories if props are empty
  const effectiveCategories = categories.length > 0 ? categories : fetchedCategories;

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
        loadCategories(); // Refetch sidebar data
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
        loadCategories(); // Refetch sidebar data
      }
      setDeletingFolder(null);
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
      <div className="px-2 py-2 space-y-1">
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
              <Folders className="h-4 w-4" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">
            <span>Collections</span>
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  const SectionIcon = customIcon ? getIconComponent(customIcon) : null;

  return (
    <SidebarSection
      title={customLabel || "Collections"}
      icon={customEmoji ? undefined : (SectionIcon || Folders)}
      emoji={customEmoji || undefined}
      defaultOpen
    >
      <div className="px-2 space-y-0.5">
        {/* All Recipes */}
        <Button
          variant="ghost"
          asChild
          className={cn(
            "w-full justify-start gap-3 h-10 px-3 relative",
            "transition-all duration-150",
            isFilterActive("all") && [
              "bg-primary/10 text-primary",
              "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2",
              "before:h-5 before:w-0.5 before:bg-primary before:rounded-r",
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

        {/* Smart Folders */}
        <div className="pt-2">
          <div className="flex items-center justify-between px-3 py-1">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" />
              Smart Folders
            </p>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 text-muted-foreground hover:text-foreground"
              onClick={() => setCreateSmartFolderOpen(true)}
              title="Create smart folder"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <div className="space-y-0.5">
            {systemSmartFolders.map((folder) => (
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
            {userSmartFolders.map((folder) => (
              <SmartFolderItem
                key={`user-${folder.id}`}
                folder={folder}
                isActive={isFilterActive("smart", folder.id, false)}
                onClick={handleClick}
                onEdit={() => setEditingSmartFolder(folder)}
                onDelete={() => setDeletingSmartFolder(folder)}
                onCreateNew={() => setCreateSmartFolderOpen(true)}
              />
            ))}
            {systemSmartFolders.length === 0 && userSmartFolders.length === 0 && (
              <EmptyState
                icon={<Sparkles className="h-8 w-8 text-muted-foreground" />}
                title="No smart folders yet"
                description="Create smart folders to organize recipes automatically"
                variant="default"
                size="sm"
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCreateSmartFolderOpen(true)}
                    className="mt-2"
                  >
                    <Plus className="h-3 w-3 mr-2" />
                    Create Smart Folder
                  </Button>
                }
              />
            )}
          </div>
        </div>

        {/* Folders Header */}
        <div className="pt-2">
          <div className="flex items-center justify-between px-3 py-1">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <FolderOpen className="h-3 w-3" />
              Folders
            </p>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 text-muted-foreground hover:text-foreground"
              onClick={() => setCreateFolderOpen(true)}
              title="Create folder"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Categories */}
        {effectiveCategories.map((category) => (
          <CategoryItem
            key={category.id}
            category={category}
            isFilterActive={isFilterActive}
            onItemClick={handleClick}
            onDeleteFolder={(folder) => setDeletingFolder(folder)}
            onCreateFolder={() => setCreateFolderOpen(true)}
          />
        ))}
      </div>

      {/* Create Smart Folder Dialog */}
      <SmartFolderDialog
        open={createSmartFolderOpen}
        onOpenChange={(open) => {
          setCreateSmartFolderOpen(open);
          if (!open) loadCategories(); // Refetch when dialog closes
        }}
        categories={allCategories}
      />

      {/* Edit Smart Folder Dialog */}
      <SmartFolderDialog
        open={editingSmartFolder !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingSmartFolder(null);
            loadCategories(); // Refetch when dialog closes
          }
        }}
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

      {/* Create Regular Folder Dialog */}
      <CreateFolderDialog
        open={createFolderOpen}
        onOpenChange={(open) => {
          setCreateFolderOpen(open);
          if (!open) loadCategories(); // Refetch when dialog closes
        }}
        folders={allFolders}
      />

      {/* Delete Regular Folder Confirmation Dialog */}
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
    </SidebarSection>
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
          "w-full justify-start gap-3 h-9 px-3 relative",
          "transition-all duration-150",
          isActive && [
            "bg-primary/10 text-primary",
            "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2",
            "before:h-4 before:w-0.5 before:bg-primary before:rounded-r",
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
            "group flex items-center gap-1 h-9 px-3 relative rounded-md",
            "transition-all duration-150",
            isActive && [
              "bg-primary/10 text-primary",
              "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2",
              "before:h-4 before:w-0.5 before:bg-primary before:rounded-r",
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

// Category Item with expandable folders
interface CategoryItemProps {
  category: FolderCategoryWithFolders;
  isFilterActive: (type: string, id?: string, system?: boolean) => boolean;
  onItemClick: () => void;
  onDeleteFolder: (folder: FolderWithChildren) => void;
  onCreateFolder: () => void;
}

function CategoryItem({
  category,
  isFilterActive,
  onItemClick,
  onDeleteFolder,
  onCreateFolder,
}: CategoryItemProps) {
  const [isOpen, setIsOpen] = React.useState(true);

  if (category.folders.length === 0) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="pt-2">
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-1 h-7 px-3 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ChevronRight
            className={cn(
              "h-3 w-3 transition-transform duration-200",
              isOpen && "rotate-90"
            )}
          />
          {category.emoji && <span>{category.emoji}</span>}
          <span className="uppercase tracking-wider">{category.name}</span>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-0.5 pt-0.5">
        {category.folders.map((folder) => (
          <FolderItem
            key={folder.id}
            folder={folder}
            isActive={isFilterActive("folder", folder.id)}
            onClick={onItemClick}
            onDelete={onDeleteFolder}
            onCreateNew={onCreateFolder}
            isFilterActive={isFilterActive}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

// Folder Item (can be nested)
interface FolderItemProps {
  folder: FolderWithChildren;
  isActive: boolean;
  onClick: () => void;
  onDelete: (folder: FolderWithChildren) => void;
  onCreateNew: () => void;
  depth?: number;
  isFilterActive: (type: string, id?: string, system?: boolean) => boolean;
}

function FolderItem({
  folder,
  isActive,
  onClick,
  onDelete,
  onCreateNew,
  depth = 0,
  isFilterActive,
}: FolderItemProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const hasChildren = folder.children && folder.children.length > 0;

  const params = new URLSearchParams({
    filter: "folder",
    id: folder.id,
  });

  const content = (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className={cn(
            "group flex items-center gap-1 h-9 px-3 relative rounded-md",
            "transition-all duration-150",
            depth > 0 && "ml-4",
            isActive && [
              "bg-primary/10 text-primary",
              "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2",
              "before:h-4 before:w-0.5 before:bg-primary before:rounded-r",
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
            <span className="flex-1 truncate text-sm">{folder.name}</span>
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

  if (!hasChildren) {
    return content;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
            <ChevronRight
              className={cn(
                "h-3 w-3 transition-transform duration-200",
                isOpen && "rotate-90"
              )}
            />
          </Button>
        </CollapsibleTrigger>
        {content}
      </div>
      <CollapsibleContent className="space-y-0.5">
        {folder.children.map((child) => (
          <FolderItem
            key={child.id}
            folder={child}
            isActive={isFilterActive("folder", child.id)}
            onClick={onClick}
            onDelete={onDelete}
            onCreateNew={onCreateNew}
            depth={depth + 1}
            isFilterActive={isFilterActive}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
