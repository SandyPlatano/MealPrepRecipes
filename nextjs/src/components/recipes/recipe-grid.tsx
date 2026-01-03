"use client";

import { useState } from "react";
import { BulkDietTagger } from "./bulk-diet-tagger";
import { useRecipeFilters } from "@/hooks/use-recipe-filters";
import { useRecipeGrid } from "@/hooks/use-recipe-grid";
import type { RecipeWithFavoriteAndNutrition } from "@/types/recipe";
import type { CustomBadge } from "@/lib/nutrition/badge-calculator";
import type { FolderWithChildren } from "@/types/folder";
import {
  RecipeGridHeader,
  RecipeGridToolbar,
  RecipeGridFilters,
  RecipeGridActiveFilters,
  RecipeGridSidebar,
  RecipeGridContent,
} from "./recipe-grid/index";

interface RecipeGridProps {
  recipes: RecipeWithFavoriteAndNutrition[];
  recipeCookCounts?: Record<string, number>;
  userAllergenAlerts?: string[];
  customDietaryRestrictions?: string[];
  customBadges?: CustomBadge[];
  onDiscoverClick?: () => void;
  folderRecipeIds?: string[] | null;
  folders?: FolderWithChildren[];
  onAddToFolder?: (recipeId: string) => void;
  totalRecipes?: number;
}

type SortOption = "recent" | "most-cooked" | "highest-rated" | "alphabetical";

export function RecipeGrid({
  recipes: initialRecipes,
  recipeCookCounts = {},
  userAllergenAlerts = [],
  customDietaryRestrictions = [],
  customBadges = [],
  onDiscoverClick,
  folderRecipeIds = null,
  folders = [],
  onAddToFolder,
}: RecipeGridProps) {
  // Use persistent filter state (saved to localStorage)
  const {
    search,
    typeFilter,
    proteinTypeFilter,
    tagFilter,
    dietFilter,
    favoritesOnly,
    minRating,
    ratedFilter,
    showFilters,
    sortBy,
    hasActiveFilters,
    setFilter,
    clearFilters,
  } = useRecipeFilters();

  // Use recipe grid logic (filtering, sorting, pagination)
  const {
    proteins,
    tags,
    filteredRecipes,
    visibleRecipes,
    totalPages,
    startIndex,
    endIndex,
    currentPage,
    gridRef,
    setCurrentPage,
    getPageNumbers,
  } = useRecipeGrid({
    recipes: initialRecipes,
    recipeCookCounts,
    folderRecipeIds,
  });

  // Local state
  const [showBulkTagger, setShowBulkTagger] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Count active filters for badge
  const activeFilterCount = [
    typeFilter !== "all",
    proteinTypeFilter !== "all",
    tagFilter !== "all",
    dietFilter !== "all",
    favoritesOnly,
    minRating !== null,
    ratedFilter !== "all",
  ].filter(Boolean).length;

  // Generic filter change handler
  const handleFilterChange = (key: string, value: unknown) => {
    setFilter(key as never, value as never);
  };

  // Clear all filters
  const handleClearFilters = () => {
    clearFilters(true);
  };

  return (
    <div className="flex flex-col lg:flex-row lg:gap-6">
      {/* Desktop Sidebar - visible on lg+ */}
      <RecipeGridSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeFilterCount={activeFilterCount}
      >
        <RecipeGridFilters
          typeFilter={typeFilter}
          proteinTypeFilter={proteinTypeFilter}
          tagFilter={tagFilter}
          dietFilter={dietFilter}
          favoritesOnly={favoritesOnly}
          minRating={minRating}
          ratedFilter={ratedFilter}
          proteins={proteins}
          tags={tags}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          onBulkTagClick={() => setShowBulkTagger(true)}
          hasActiveFilters={hasActiveFilters}
        />
      </RecipeGridSidebar>

      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-3">
        {/* Row 1: Search + Add Recipe */}
        <RecipeGridHeader
          search={search}
          onSearchChange={(value: string) => setFilter("search", value)}
          onSearchClear={() => setFilter("search", "")}
        />

        {/* Row 2: Pills + Recipe Count */}
        <RecipeGridToolbar
          sortBy={sortBy}
          onSortChange={(value: SortOption) => setFilter("sortBy", value)}
          showFilters={showFilters}
          onToggleFilters={() => setFilter("showFilters", !showFilters)}
          activeFilterCount={activeFilterCount}
          filteredRecipeCount={filteredRecipes.length}
          onDiscoverClick={onDiscoverClick}
        />

        {/* Mobile: Active Filters Row - only on mobile/tablet when filters panel is closed */}
        {hasActiveFilters && !showFilters && (
          <RecipeGridActiveFilters
            typeFilter={typeFilter}
            proteinTypeFilter={proteinTypeFilter}
            dietFilter={dietFilter}
            favoritesOnly={favoritesOnly}
            minRating={minRating}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
        )}

        {/* Mobile: Expanded Filters Panel - only on mobile/tablet */}
        {showFilters && (
          <div className="lg:hidden p-4 border rounded-lg bg-muted/30">
            <RecipeGridFilters
              typeFilter={typeFilter}
              proteinTypeFilter={proteinTypeFilter}
              tagFilter={tagFilter}
              dietFilter={dietFilter}
              favoritesOnly={favoritesOnly}
              minRating={minRating}
              ratedFilter={ratedFilter}
              proteins={proteins}
              tags={tags}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              onBulkTagClick={() => setShowBulkTagger(true)}
              hasActiveFilters={hasActiveFilters}
            />
          </div>
        )}

        {/* Recipe Grid */}
        <RecipeGridContent
          allRecipes={initialRecipes}
          visibleRecipes={visibleRecipes}
          filteredRecipes={filteredRecipes}
          userAllergenAlerts={userAllergenAlerts}
          customDietaryRestrictions={customDietaryRestrictions}
          customBadges={customBadges}
          folderRecipeIds={folderRecipeIds}
          folders={folders}
          onAddToFolder={onAddToFolder}
          searchTerm={search}
          currentPage={currentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          endIndex={endIndex}
          pageNumbers={getPageNumbers()}
          onPageChange={setCurrentPage}
          gridRef={gridRef}
          onClearFilters={handleClearFilters}
        />
      </div>

      {/* Bulk Diet Tagger Dialog */}
      <BulkDietTagger
        open={showBulkTagger}
        onOpenChange={setShowBulkTagger}
        recipes={initialRecipes}
      />
    </div>
  );
}
