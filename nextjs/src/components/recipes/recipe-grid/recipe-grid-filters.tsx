"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { StarRatingFilter } from "@/components/ui/star-rating-filter";
import { X, Tags, Leaf, Wheat, Flame, Mountain, Ship, Milk, TrendingDown, Star } from "lucide-react";
import type { RecipeType } from "@/types/recipe";

const recipeTypes: RecipeType[] = [
  "Dinner",
  "Breakfast",
  "Baking",
  "Dessert",
  "Snack",
  "Side Dish",
];

const dietTypes = [
  { label: "Vegan", icon: Leaf },
  { label: "Vegetarian", icon: Leaf },
  { label: "Keto", icon: Flame },
  { label: "Paleo", icon: Mountain },
  { label: "Mediterranean", icon: Ship },
  { label: "Gluten-Free", icon: Wheat },
  { label: "Dairy-Free", icon: Milk },
  { label: "Low-Carb", icon: TrendingDown },
];

interface RecipeGridFiltersProps {
  // Filter values
  typeFilter: RecipeType | "all";
  proteinTypeFilter: string;
  tagFilter: string;
  dietFilter: string;
  favoritesOnly: boolean;
  minRating: number | null;
  ratedFilter: "all" | "rated" | "unrated";
  // Available options
  proteins: string[];
  tags: string[];
  // Actions
  onFilterChange: (key: string, value: unknown) => void;
  onClearFilters: () => void;
  onBulkTagClick: () => void;
  // State
  hasActiveFilters: boolean;
}

export function RecipeGridFilters({
  typeFilter,
  proteinTypeFilter,
  tagFilter,
  dietFilter,
  favoritesOnly,
  minRating,
  ratedFilter,
  proteins,
  tags,
  onFilterChange,
  onClearFilters,
  onBulkTagClick,
  hasActiveFilters,
}: RecipeGridFiltersProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium">Type</label>
          <Select
            value={typeFilter}
            onValueChange={(value) => onFilterChange("typeFilter", value as RecipeType | "all")}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {recipeTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {proteins.length > 0 && (
          <div className="flex flex-col">
            <label className="text-sm font-medium">Protein</label>
            <Select value={proteinTypeFilter} onValueChange={(value) => onFilterChange("proteinTypeFilter", value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Proteins</SelectItem>
                {proteins.map((protein) => (
                  <SelectItem key={protein} value={protein}>
                    {protein}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {tags.length > 0 && (
          <div className="flex flex-col">
            <label className="text-sm font-medium">Tag</label>
            <Select value={tagFilter} onValueChange={(value) => onFilterChange("tagFilter", value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {tags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer h-10">
            <Checkbox
              checked={favoritesOnly}
              onCheckedChange={(checked) => onFilterChange("favoritesOnly", checked === true)}
            />
            <span className="text-sm">Favorites only</span>
          </label>
        </div>
      </div>

      {/* Diet Type Filters */}
      <div className="flex flex-col gap-2 pt-3 border-t overflow-hidden">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Diet Types</label>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={onBulkTagClick}
          >
            <Tags className="h-3 w-3" />
            Bulk Tag
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <ToggleGroup
            type="single"
            value={dietFilter}
            onValueChange={(value) => onFilterChange("dietFilter", value || "all")}
            spacing={1}
            className="flex-wrap"
          >
            <ToggleGroupItem
              value="all"
              className="rounded-full px-2.5 py-1 text-xs data-[state=on]:bg-[#D9F99D] data-[state=on]:text-[#1A1A1A] data-[state=on]:border-[#D9F99D] bg-white border border-gray-200"
            >
              All Diets
            </ToggleGroupItem>
            {dietTypes.map((diet) => {
              const Icon = diet.icon;
              return (
                <ToggleGroupItem
                  key={diet.label}
                  value={diet.label}
                  className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs data-[state=on]:bg-[#D9F99D] data-[state=on]:text-[#1A1A1A] data-[state=on]:border-[#D9F99D] bg-white border border-gray-200"
                >
                  <Icon className="size-3.5" />
                  {diet.label}
                </ToggleGroupItem>
              );
            })}
          </ToggleGroup>
        </div>
      </div>

      {/* Rating Filters */}
      <div className="flex flex-wrap gap-4 pt-3 border-t">
        <StarRatingFilter
          value={minRating}
          onChange={(rating) => onFilterChange("minRating", rating)}
          label="Minimum Rating"
        />

        <div className="flex flex-col">
          <label className="text-sm font-medium">Show</label>
          <Select value={ratedFilter} onValueChange={(value) => onFilterChange("ratedFilter", value as "all" | "rated" | "unrated")}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Recipes</SelectItem>
              <SelectItem value="rated">Rated Only</SelectItem>
              <SelectItem value="unrated">Unrated Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2 pt-2 border-t flex-wrap">
          <span className="text-sm text-muted-foreground">Active:</span>
          {typeFilter !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {typeFilter}
              <button type="button" onClick={() => onFilterChange("typeFilter", "all")} aria-label="Remove type filter">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {proteinTypeFilter !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {proteinTypeFilter}
              <button type="button" onClick={() => onFilterChange("proteinTypeFilter", "all")} aria-label="Remove protein filter">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {tagFilter !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {tagFilter}
              <button type="button" onClick={() => onFilterChange("tagFilter", "all")} aria-label="Remove tag filter">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {dietFilter !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {dietFilter}
              <button type="button" onClick={() => onFilterChange("dietFilter", "all")} aria-label="Remove diet filter">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {favoritesOnly && (
            <Badge variant="secondary" className="gap-1">
              Favorites
              <button type="button" onClick={() => onFilterChange("favoritesOnly", false)} aria-label="Remove favorites filter">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {minRating !== null && (
            <Badge variant="secondary" className="gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {minRating}+ stars
              <button type="button" onClick={() => onFilterChange("minRating", null)} aria-label="Remove rating filter">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {ratedFilter !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {ratedFilter === "rated" ? "Rated" : "Unrated"}
              <button type="button" onClick={() => onFilterChange("ratedFilter", "all")} aria-label="Remove rated filter">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="ml-auto text-xs"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
