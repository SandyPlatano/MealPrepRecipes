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
        "px-4 rounded-lg",
        "bg-white border border-gray-200",
        "hover:border-[#D9F99D] hover:ring-1 hover:ring-[#D9F99D]",
        "focus-visible:outline-none focus-visible:border-[#D9F99D] focus-visible:ring-2 focus-visible:ring-[#D9F99D]",
        "transition-all duration-150",
        "text-gray-600 hover:text-gray-900",
        className
      )}
      aria-label="Open search (Press / to open)"
    >
      <Search className="size-4 shrink-0" />
      <span className="flex-1 text-left text-sm">Search...</span>
      <kbd className="hidden sm:inline-flex text-[10px] font-medium px-1.5 py-0.5 rounded border border-gray-300 bg-gray-100 text-gray-600">
        /
      </kbd>
    </button>
  )
}
