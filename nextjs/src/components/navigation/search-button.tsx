"use client";

/**
 * Search Button
 *
 * Header button that opens the global search modal.
 */

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGlobalSearch } from "@/contexts/global-search-context";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function SearchButton() {
  const { openSearch } = useGlobalSearch();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={openSearch}
          className="h-9 w-9"
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="flex items-center gap-2">
        <span>Search</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          /
        </kbd>
      </TooltipContent>
    </Tooltip>
  );
}
