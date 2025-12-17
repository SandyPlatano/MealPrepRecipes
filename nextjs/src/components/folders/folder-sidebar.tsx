"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronLeft,
  ChevronRight,
  Folders,
  BookOpen,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  FolderWithChildren,
  FolderCategoryWithFolders,
  ActiveFolderFilter,
  SmartFolderType,
} from "@/types/folder";
import { SMART_FOLDERS } from "@/types/folder";
import { CategorySection } from "./category-section";
import { CategoryDialog } from "./category-dialog";

interface FolderSidebarProps {
  folders: FolderWithChildren[];
  categories: FolderCategoryWithFolders[];
  activeFilter: ActiveFolderFilter;
  onFilterChange: (filter: ActiveFolderFilter) => void;
  recentlyAddedCount: number;
  totalRecipeCount: number;
}

export function FolderSidebar({
  folders,
  categories,
  activeFilter,
  onFilterChange,
  recentlyAddedCount,
  totalRecipeCount,
}: FolderSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);

  const smartFolderCounts: Record<SmartFolderType, number> = {
    recently_added: recentlyAddedCount,
  };

  const isSmartFolderActive = (id: SmartFolderType) =>
    activeFilter.type === "smart" && activeFilter.id === id;

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
          <div className="p-3 space-y-2">
            {/* All Recipes */}
            <Button
              variant={isAllActive ? "secondary" : "ghost"}
              className="w-full justify-between h-10"
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
            <div className="pt-4">
              <p className="text-xs font-medium text-muted-foreground px-2 mb-2">
                Smart Folders
              </p>
              <div className="space-y-1">
                {Object.values(SMART_FOLDERS).map((folder) => (
                  <Button
                    key={folder.id}
                    variant={isSmartFolderActive(folder.id) ? "secondary" : "ghost"}
                    className="w-full justify-between h-10"
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
            </div>

            {/* User Categories with Folders */}
            {categories.map((category) => (
              <CategorySection
                key={category.id}
                category={category}
                activeFilter={activeFilter}
                onFilterChange={onFilterChange}
                allFolders={folders}
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
    </div>
  );
}
