"use client";

import * as React from "react";
import { useState, useEffect, useCallback, useTransition } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import {
  BookOpen,
  Sparkles,
  FolderOpen,
  FolderPlus,
  Plus,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { toast } from "sonner";
import { SmartFolderDialog } from "@/components/folders/smart-folder-dialog";
import { CreateFolderDialog } from "@/components/folders/create-folder-dialog";
import { deleteSmartFolder, getSystemSmartFolders } from "@/app/actions/smart-folders";
import { deleteFolder, getFolderCategories } from "@/app/actions/folders";
import type { FolderWithChildren, FolderCategoryWithFolders, FolderCategory } from "@/types/folder";
import type { SystemSmartFolder } from "@/types/smart-folder";

const COLLAPSE_KEY = "sidebar_folders_collapsed";

interface NavCollectionsProps {
  categories?: FolderCategoryWithFolders[];
  systemSmartFolders?: SystemSmartFolder[];
  totalRecipeCount?: number;
}

export function NavCollections({
  categories = [],
  systemSmartFolders = [],
  totalRecipeCount,
}: NavCollectionsProps) {
  const { isMobile, setOpenMobile } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Smart folder state
  const [createSmartFolderOpen, setCreateSmartFolderOpen] = useState(false);
  const [deletingSmartFolder, setDeletingSmartFolder] = useState<SystemSmartFolder | null>(null);

  // Regular folder state
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [deletingFolder, setDeletingFolder] = useState<FolderWithChildren | null>(null);

  // Client-side fetched data
  const [fetchedCategories, setFetchedCategories] = useState<FolderCategoryWithFolders[]>([]);
  const [fetchedSystemSmartFolders, setFetchedSystemSmartFolders] = useState<SystemSmartFolder[]>([]);

  // Load collapse state from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(COLLAPSE_KEY);
    if (saved !== null) setIsOpen(saved !== "true");
  }, []);

  // Persist collapse state
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (typeof window !== "undefined") {
      localStorage.setItem(COLLAPSE_KEY, (!open).toString());
    }
  };

  // Fetch data on mount
  const loadData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Use props if provided, otherwise use fetched data
  const effectiveCategories = categories.length > 0 ? categories : fetchedCategories;
  const effectiveSmartFolders = systemSmartFolders.length > 0 ? systemSmartFolders : fetchedSystemSmartFolders;
  const allUserFolders = effectiveCategories.flatMap((c) => c.folders);
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

  // Check current filter state
  const isOnRecipesPage = pathname === "/app/recipes" || pathname.startsWith("/app/recipes/");
  const currentFilter = searchParams.get("filter");
  const currentFilterId = searchParams.get("id");
  const isSystem = searchParams.get("system") === "true";

  const isFilterActive = (type: string, id?: string, system?: boolean) => {
    if (!isOnRecipesPage) return false;
    if (type === "all" && !currentFilter) return true;
    if (type === currentFilter && id === currentFilterId) {
      if (type === "smart") return system === isSystem;
      return true;
    }
    return false;
  };

  const handleClick = () => {
    if (isMobile) setOpenMobile(false);
  };

  // Delete handlers
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

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>
          <Collapsible open={isOpen} onOpenChange={handleOpenChange} className="w-full">
            <CollapsibleTrigger className="flex items-center gap-1 w-full">
              <ChevronRight
                className={cn(
                  "size-3.5 transition-transform duration-200",
                  isOpen && "rotate-90"
                )}
              />
              <span>Folders</span>
            </CollapsibleTrigger>
          </Collapsible>
        </SidebarGroupLabel>

        <SidebarGroupAction>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 hover:bg-sidebar-accent rounded">
                <Plus className="size-4" />
                <span className="sr-only">Add folder</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setCreateFolderOpen(true)}>
                <FolderPlus className="mr-2 h-4 w-4" />
                New Folder
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCreateSmartFolderOpen(true)}>
                <Sparkles className="mr-2 h-4 w-4" />
                New Smart Folder
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarGroupAction>

        <Collapsible open={isOpen} onOpenChange={handleOpenChange}>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                {/* All Recipes */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isFilterActive("all")}
                    tooltip="All Recipes"
                  >
                    <Link href="/app/recipes" onClick={handleClick}>
                      <BookOpen className="h-4 w-4" />
                      <span>All Recipes</span>
                      {totalRecipeCount !== undefined && (
                        <span className="ml-auto text-xs text-muted-foreground">
                          {totalRecipeCount}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Smart Folders */}
                {effectiveSmartFolders.length > 0 && (
                  <>
                    {effectiveSmartFolders.map((folder) => (
                      <SidebarMenuItem key={`smart-${folder.id}`}>
                        <SidebarMenuButton
                          asChild
                          isActive={isFilterActive("smart", folder.id, true)}
                          tooltip={folder.name}
                        >
                          <Link
                            href={`/app/recipes?filter=smart&id=${folder.id}&system=true`}
                            onClick={handleClick}
                          >
                            <Sparkles className="h-4 w-4 text-amber-500" />
                            <span className="truncate">{folder.name}</span>
                          </Link>
                        </SidebarMenuButton>
                        <SidebarMenuAction showOnHover>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-0.5">
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => setDeletingSmartFolder(folder)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </SidebarMenuAction>
                      </SidebarMenuItem>
                    ))}
                  </>
                )}

                {/* User Folders */}
                {allUserFolders.map((folder) => (
                  <SidebarMenuItem key={folder.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={isFilterActive("folder", folder.id)}
                      tooltip={folder.name}
                    >
                      <Link
                        href={`/app/recipes?filter=folder&id=${folder.id}`}
                        onClick={handleClick}
                      >
                        <FolderOpen className="h-4 w-4" />
                        <span className="truncate">{folder.name}</span>
                        {folder.recipe_count !== undefined && (
                          <span className="ml-auto text-xs text-muted-foreground">
                            {folder.recipe_count}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                    <SidebarMenuAction showOnHover>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-0.5">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setDeletingFolder(folder)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </SidebarMenuAction>
                  </SidebarMenuItem>
                ))}

                {/* Empty state */}
                {allUserFolders.length === 0 && effectiveSmartFolders.length === 0 && (
                  <SidebarMenuItem>
                    <button
                      onClick={() => setCreateFolderOpen(true)}
                      className="w-full p-3 text-left text-sm text-muted-foreground hover:text-foreground"
                    >
                      <Plus className="inline h-4 w-4 mr-2" />
                      Create your first folder
                    </button>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </Collapsible>
      </SidebarGroup>

      {/* Dialogs */}
      <SmartFolderDialog
        open={createSmartFolderOpen}
        onOpenChange={(open) => {
          setCreateSmartFolderOpen(open);
          if (!open) loadData();
        }}
        categories={allCategories}
      />

      <CreateFolderDialog
        open={createFolderOpen}
        onOpenChange={(open) => {
          setCreateFolderOpen(open);
          if (!open) loadData();
        }}
        folders={allUserFolders}
      />

      {/* Delete Smart Folder Confirmation */}
      <AlertDialog
        open={deletingSmartFolder !== null}
        onOpenChange={(open) => !open && setDeletingSmartFolder(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete smart folder?</AlertDialogTitle>
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

      {/* Delete Folder Confirmation */}
      <AlertDialog
        open={deletingFolder !== null}
        onOpenChange={(open) => !open && setDeletingFolder(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete folder?</AlertDialogTitle>
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
    </>
  );
}
