"use client"

import { cn } from "@/lib/utils"
import { Search } from "lucide-react"
import { useGlobalSearch } from "@/contexts/global-search-context"

interface HeaderSearchBarProps {
  className?: string
}

export function HeaderSearchBar({ className }: HeaderSearchBarProps) {
  const { openSearch } = useGlobalSearch()

  return (
    <button
      onClick={openSearch}
      className={cn(
        "flex items-center gap-3 w-full max-w-md h-10",
        "px-4 rounded-full",
        "bg-card border-2 border-black",
        "shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
        "hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
        "hover:translate-x-[-1px] hover:translate-y-[-1px]",
        "active:translate-x-[2px] active:translate-y-[2px]",
        "active:shadow-none",
        "transition-all duration-150",
        "text-muted-foreground hover:text-foreground",
        className
      )}
      aria-label="Open search (Press / to open)"
    >
      <Search className="size-4 shrink-0" />
      <span className="flex-1 text-left text-sm font-body">Search...</span>
      <kbd className="hidden sm:inline-flex text-[10px] font-medium px-1.5 py-0.5 rounded border border-border/50 bg-muted">
        /
      </kbd>
    </button>
  )
}
