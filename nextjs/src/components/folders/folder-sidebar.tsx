"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronLeft,
  ChevronRight,
  FolderPlus,
  Folders,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  FolderWithChildren,
  ActiveFolderFilter,
  SmartFolderType,
} from "@/types/folder";
import { SMART_FOLDERS } from "@/types/folder";
import { FolderTreeItem } from "./folder-tree-item";
import { CreateFolderDialog } from "./create-folder-dialog";

interface FolderSidebarProps {
  folders: FolderWithChildren[];
  activeFilter: ActiveFolderFilter;
  onFilterChange: (filter: ActiveFolderFilter) => void;
  recentlyAddedCount: number;
  totalRecipeCount: number;
}

export function FolderSidebar({
  folders,
  activeFilter,
  onFilterChange,
  recentlyAddedCount,
  totalRecipeCount,
}: FolderSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const smartFolderCounts: Record<SmartFolderType, number> = {
    recently_added: recentlyAddedCount,
  };

  const isSmartFolderActive = (id: SmartFolderType) =>
    activeFilter.type === "smart" && activeFilter.id === id;

  const isFolderActive = (id: string) =>
    activeFilter.type === "folder" && activeFilter.id === id;

  const isAllActive = activeFilter.type === "all";

  return (
    <div
      className={cn(
        "border-r bg-muted/30 transition-all duration-300 flex flex-col h-full",
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
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {!isCollapsed && (
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {/* All Recipes */}
            <Button
              variant={isAllActive ? "secondary" : "ghost"}
              className="w-full justify-between h-9"
              onClick={() => onFilterChange({ type: "all" })}
            >
              <span className="flex items-center">
                <BookOpen className="h-4 w-4 mr-2" />
                All Recipes
              </span>
              <span className="text-xs text-muted-foreground">
                {totalRecipeCount}
              </span>
            </Button>

            {/* Smart Folders */}
            <div className="pt-3">
              <p className="text-xs font-medium text-muted-foreground px-2 mb-1">
                Smart Folders
              </p>
              {Object.values(SMART_FOLDERS).map((folder) => (
                <Button
                  key={folder.id}
                  variant={isSmartFolderActive(folder.id) ? "secondary" : "ghost"}
                  className="w-full justify-between h-9"
                  onClick={() => onFilterChange({ type: "smart", id: folder.id })}
                >
                  <span className="flex items-center">
                    <span className="mr-2">{folder.emoji}</span>
                    {folder.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {smartFolderCounts[folder.id]}
                  </span>
                </Button>
              ))}
            </div>

            {/* User Folders */}
            <div className="pt-3">
              <div className="flex items-center justify-between px-2 mb-1">
                <p className="text-xs font-medium text-muted-foreground">
                  My Folders
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setCreateDialogOpen(true)}
                >
                  <FolderPlus className="h-3 w-3" />
                </Button>
              </div>

              {folders.length === 0 ? (
                <p className="text-xs text-muted-foreground px-2 py-4 text-center">
                  No folders yet
                </p>
              ) : (
                folders.map((folder) => (
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
                    activeChildId={
                      activeFilter.type === "folder" ? activeFilter.id : null
                    }
                    allFolders={folders}
                  />
                ))
              )}
            </div>
          </div>
        </ScrollArea>
      )}

      <CreateFolderDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        folders={folders}
      />
    </div>
  );
}
