"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { RecipeCard } from "../recipe-card";
import { Plus, UtensilsCrossed, FolderOpen, SearchX } from "lucide-react";
import type { RecipeWithFavoriteAndNutrition } from "@/types/recipe";
import type { CustomBadge } from "@/lib/nutrition/badge-calculator";
import type { FolderWithChildren } from "@/types/folder";

interface RecipeGridContentProps {
  // Recipe data
  allRecipes: RecipeWithFavoriteAndNutrition[];
  visibleRecipes: RecipeWithFavoriteAndNutrition[];
  filteredRecipes: RecipeWithFavoriteAndNutrition[];
  // User preferences
  userAllergenAlerts: string[];
  customDietaryRestrictions: string[];
  customBadges: CustomBadge[];
  // Folder context
  folderRecipeIds: string[] | null;
  folders: FolderWithChildren[];
  onAddToFolder?: (recipeId: string) => void;
  // Search
  searchTerm: string;
  // Pagination
  currentPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  pageNumbers: (number | "ellipsis")[];
  onPageChange: (page: number) => void;
  gridRef: React.RefObject<HTMLDivElement | null>;
  // Actions
  onClearFilters: () => void;
}

export function RecipeGridContent({
  allRecipes,
  visibleRecipes,
  filteredRecipes,
  userAllergenAlerts,
  customDietaryRestrictions,
  customBadges,
  folderRecipeIds,
  folders,
  onAddToFolder,
  searchTerm,
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  pageNumbers,
  onPageChange,
  gridRef,
  onClearFilters,
}: RecipeGridContentProps) {
  // Determine which empty state to show
  const renderEmptyState = () => {
    if (allRecipes.length === 0) {
      return (
        <EmptyState
          icon={<UtensilsCrossed className="h-12 w-12 text-muted-foreground" />}
          title="No recipes yet"
          description="Time to add your first culinary masterpiece!"
          action={
            <Link href="/app/recipes/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Recipe
              </Button>
            </Link>
          }
        />
      );
    }

    if (folderRecipeIds !== null && folderRecipeIds.length === 0) {
      return (
        <EmptyState
          icon={<FolderOpen className="h-12 w-12 text-muted-foreground" />}
          title="Folder is empty"
          description="This folder doesn't contain any recipes yet."
          size="sm"
        />
      );
    }

    return (
      <EmptyState
        icon={<SearchX className="h-12 w-12 text-muted-foreground" />}
        title="No matches"
        description="No recipes match your filters. Try loosening up a bit."
        action={
          <Button variant="outline" onClick={onClearFilters}>
            Clear all filters
          </Button>
        }
        size="sm"
      />
    );
  };

  if (filteredRecipes.length === 0) {
    return (
      <div ref={gridRef} className="flex flex-col scroll-mt-4">
        {renderEmptyState()}
      </div>
    );
  }

  return (
    <div ref={gridRef} className="flex flex-col scroll-mt-4">
      <TooltipProvider>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {visibleRecipes.map((recipe, index) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              userAllergenAlerts={userAllergenAlerts}
              customDietaryRestrictions={customDietaryRestrictions}
              customBadges={customBadges}
              animationIndex={index}
              folders={folders}
              onAddToFolder={onAddToFolder}
              searchTerm={searchTerm}
            />
          ))}
        </div>
      </TooltipProvider>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-3 mt-8">
          {/* Page info */}
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredRecipes.length)} of {filteredRecipes.length} recipes
          </p>

          {/* Pagination controls */}
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  aria-disabled={currentPage === 1}
                />
              </PaginationItem>

              {pageNumbers.map((page, idx) =>
                page === "ellipsis" ? (
                  <PaginationItem key={`ellipsis-${idx}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => onPageChange(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  aria-disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
