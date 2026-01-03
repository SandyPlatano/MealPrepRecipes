"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Star } from "lucide-react";
import type { RecipeType } from "@/types/recipe";

interface RecipeGridActiveFiltersProps {
  typeFilter: RecipeType | "all";
  proteinTypeFilter: string;
  dietFilter: string;
  favoritesOnly: boolean;
  minRating: number | null;
  onFilterChange: (key: string, value: unknown) => void;
  onClearFilters: () => void;
}

export function RecipeGridActiveFilters({
  typeFilter,
  proteinTypeFilter,
  dietFilter,
  favoritesOnly,
  minRating,
  onFilterChange,
  onClearFilters,
}: RecipeGridActiveFiltersProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap lg:hidden">
      <span className="text-xs text-muted-foreground font-medium">Active:</span>
      {typeFilter !== "all" && (
        <Badge variant="secondary" className="gap-1 text-xs">
          {typeFilter}
          <button type="button" onClick={() => onFilterChange("typeFilter", "all")} aria-label="Remove type filter">
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
      {proteinTypeFilter !== "all" && (
        <Badge variant="secondary" className="gap-1 text-xs">
          {proteinTypeFilter}
          <button type="button" onClick={() => onFilterChange("proteinTypeFilter", "all")} aria-label="Remove protein filter">
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
      {dietFilter !== "all" && (
        <Badge variant="secondary" className="gap-1 text-xs">
          {dietFilter}
          <button type="button" onClick={() => onFilterChange("dietFilter", "all")} aria-label="Remove diet filter">
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
      {favoritesOnly && (
        <Badge variant="secondary" className="gap-1 text-xs">
          Favorites
          <button type="button" onClick={() => onFilterChange("favoritesOnly", false)} aria-label="Remove favorites filter">
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
      {minRating !== null && (
        <Badge variant="secondary" className="gap-1 text-xs">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          {minRating}+
          <button type="button" onClick={() => onFilterChange("minRating", null)} aria-label="Remove rating filter">
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearFilters}
        className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
      >
        Clear
      </Button>
    </div>
  );
}
