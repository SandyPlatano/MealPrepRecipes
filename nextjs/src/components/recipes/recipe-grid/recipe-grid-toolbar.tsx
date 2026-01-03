"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowDownUp, SlidersHorizontal, Sparkles } from "lucide-react";

type SortOption = "recent" | "most-cooked" | "highest-rated" | "alphabetical";

interface RecipeGridToolbarProps {
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  activeFilterCount: number;
  filteredRecipeCount: number;
  onDiscoverClick?: () => void;
}

const sortLabels: Record<SortOption, string> = {
  recent: "Recent",
  "most-cooked": "Most Cooked",
  "highest-rated": "Top Rated",
  alphabetical: "A-Z",
};

export function RecipeGridToolbar({
  sortBy,
  onSortChange,
  showFilters,
  onToggleFilters,
  activeFilterCount,
  filteredRecipeCount,
  onDiscoverClick,
}: RecipeGridToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        {/* Sort Pill */}
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="h-9 px-3 rounded-full border-input bg-background hover:bg-accent transition-colors w-auto gap-1.5">
            <ArrowDownUp className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline text-sm">{sortLabels[sortBy]}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recently Added</SelectItem>
            <SelectItem value="most-cooked">Most Cooked</SelectItem>
            <SelectItem value="highest-rated">Highest Rated</SelectItem>
            <SelectItem value="alphabetical">Alphabetical</SelectItem>
          </SelectContent>
        </Select>

        {/* Filter Pill - only on mobile/tablet */}
        <Button
          variant={showFilters ? "secondary" : "outline"}
          onClick={onToggleFilters}
          className="h-9 px-3 rounded-full relative lg:hidden"
        >
          <SlidersHorizontal className="h-3.5 w-3.5 sm:mr-1.5" />
          <span className="hidden sm:inline text-sm">Filters</span>
          {activeFilterCount > 0 && (
            <span className="ml-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </Button>

        {/* Discover Pill */}
        {onDiscoverClick && (
          <Button
            variant="outline"
            className="h-9 px-3 rounded-full"
            onClick={onDiscoverClick}
          >
            <Sparkles className="h-3.5 w-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline text-sm">Discover</span>
          </Button>
        )}
      </div>

      {/* Recipe Count */}
      <p className="text-sm text-muted-foreground whitespace-nowrap">
        {filteredRecipeCount} {filteredRecipeCount === 1 ? "recipe" : "recipes"}
      </p>
    </div>
  );
}
