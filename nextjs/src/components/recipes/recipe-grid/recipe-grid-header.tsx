"use client";

import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Plus } from "lucide-react";

interface RecipeGridHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  onSearchClear: () => void;
}

export function RecipeGridHeader({
  search,
  onSearchChange,
  onSearchClear,
}: RecipeGridHeaderProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search recipes, ingredients, tags..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-11"
        />
        {search && (
          <button
            type="button"
            onClick={onSearchClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      <Link href="/app/recipes/new">
        <Button className="h-11 px-3 sm:px-4">
          <Plus className="size-4 sm:mr-2" />
          <span className="hidden sm:inline">Add Recipe</span>
        </Button>
      </Link>
    </div>
  );
}
