"use client"

import { Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { useGlobalSearch } from "@/contexts/global-search-context"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface SidebarSearchBarProps {
  isIconOnly?: boolean
}

export function SidebarSearchBar({ isIconOnly }: SidebarSearchBarProps) {
  const { openSearch } = useGlobalSearch()

  if (isIconOnly) {
    return (
      <div className="flex justify-center py-2">
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={openSearch}
              className={cn(
                "h-9 w-9 rounded-lg",
                "text-[var(--color-sidebar-text-muted)]",
                "hover:text-[var(--color-sidebar-text)] hover:bg-[var(--color-sidebar-surface)]"
              )}
              aria-label="Search (Press / to open)"
            >
              <Search className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2">
            <span>Search</span>
            <kbd className="text-[10px] font-medium bg-muted px-1.5 py-0.5 rounded">/</kbd>
          </TooltipContent>
        </Tooltip>
      </div>
    )
  }

  return (
    <div className="px-3 py-2">
      <button
        onClick={openSearch}
        className={cn(
          "flex items-center gap-3 w-full h-9",
          "px-3 rounded-lg",
          "bg-[var(--color-sidebar-surface)]",
          "border border-[var(--color-sidebar-border)]",
          "hover:border-[var(--color-brand-primary)] hover:bg-[var(--color-sidebar-surface)]/80",
          "focus-visible:outline-none focus-visible:border-[var(--color-brand-primary)] focus-visible:ring-1 focus-visible:ring-[var(--color-brand-primary)]",
          "transition-all duration-150",
          "text-[var(--color-sidebar-text-muted)]"
        )}
        aria-label="Open search (Press / to open)"
      >
        <Search className="size-4 shrink-0" />
        <span className="flex-1 text-left text-sm">Search...</span>
        <kbd className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[var(--color-sidebar-bg)] text-[var(--color-sidebar-text-muted)] border border-[var(--color-sidebar-border)]">
          /
        </kbd>
      </button>
    </div>
  )
}
