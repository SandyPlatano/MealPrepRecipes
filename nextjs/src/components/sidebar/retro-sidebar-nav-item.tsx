"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { MaterialIcon } from "@/components/ui/material-icon"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useSidebar } from "./sidebar-context"

// Material Symbol name mapping for nav items
const MATERIAL_ICON_MAP: Record<string, string> = {
  recipes: "menu_book",
  "meal-plan": "calendar_month",
  plan: "calendar_month",
  shopping: "shopping_cart",
  shop: "shopping_cart",
  nutrition: "nutrition",
  statistics: "analytics",
  stats: "analytics",
  settings: "settings",
  logout: "logout",
  home: "home",
  dashboard: "grid_view",
  favorites: "favorite",
}

interface RetroSidebarNavItemProps {
  href: string
  icon: string // Material Symbol name or key from MATERIAL_ICON_MAP
  label: string
  badge?: number | string
  exactMatch?: boolean
  onClick?: () => void
}

export function RetroSidebarNavItem({
  href,
  icon,
  label,
  badge,
  exactMatch = false,
  onClick,
}: RetroSidebarNavItemProps) {
  const pathname = usePathname()
  const { isIconOnly, closeMobile, isMobile } = useSidebar()

  // Resolve icon name from map or use directly
  const iconName = MATERIAL_ICON_MAP[icon.toLowerCase()] || icon

  // Determine if this item is active
  const isActive = exactMatch
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`)

  const handleClick = () => {
    if (isMobile) {
      closeMobile()
    }
    onClick?.()
  }

  const content = (
    <Link
      href={href}
      onClick={handleClick}
      className={cn(
        "flex items-center gap-3 h-11 px-3 mx-2 rounded-lg",
        "transition-all duration-150 cursor-pointer",
        isIconOnly && "justify-center mx-1 px-0",
        isActive
          ? [
              "bg-[var(--color-sidebar-surface)]",
              "border border-[var(--color-sidebar-border)]",
              "text-[var(--color-sidebar-text)]",
            ]
          : [
              "bg-transparent border border-transparent",
              "text-[var(--color-sidebar-text-muted)]",
              "hover:text-[var(--color-sidebar-text)]",
              "hover:bg-[var(--color-sidebar-surface)]/50",
            ]
      )}
    >
      <MaterialIcon
        name={iconName}
        size="md"
        filled={isActive}
        className="shrink-0"
      />
      {!isIconOnly && (
        <>
          <span className="flex-1 truncate text-sm font-medium">{label}</span>
          {badge !== undefined && (
            <span
              className={cn(
                "ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full",
                "bg-[var(--color-brand-primary)] text-black"
              )}
            >
              {badge}
            </span>
          )}
        </>
      )}
    </Link>
  )

  // Wrap with tooltip when collapsed
  if (isIconOnly) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent
          side="right"
          className="flex items-center gap-2 bg-[var(--color-sidebar-surface)] text-[var(--color-sidebar-text)] border-[var(--color-sidebar-border)]"
        >
          <span>{label}</span>
          {badge !== undefined && (
            <span className="text-xs bg-[var(--color-brand-primary)] text-black px-1.5 py-0.5 rounded-full font-bold">
              {badge}
            </span>
          )}
        </TooltipContent>
      </Tooltip>
    )
  }

  return content
}

// Action button variant (not a link)
interface RetroSidebarActionItemProps {
  icon: string
  label: string
  onClick: () => void
}

export function RetroSidebarActionItem({
  icon,
  label,
  onClick,
}: RetroSidebarActionItemProps) {
  const { isIconOnly } = useSidebar()
  const iconName = MATERIAL_ICON_MAP[icon.toLowerCase()] || icon

  const content = (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 h-11 px-3 mx-2 rounded-lg w-[calc(100%-1rem)]",
        "transition-all duration-150 cursor-pointer",
        "bg-transparent border border-transparent",
        "text-[var(--color-sidebar-text-muted)]",
        "hover:text-[var(--color-sidebar-text)]",
        "hover:bg-[var(--color-sidebar-surface)]/50",
        isIconOnly && "justify-center mx-1 px-0 w-auto"
      )}
    >
      <MaterialIcon name={iconName} size="md" className="shrink-0" />
      {!isIconOnly && (
        <span className="flex-1 truncate text-sm font-medium text-left">
          {label}
        </span>
      )}
    </button>
  )

  if (isIconOnly) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent
          side="right"
          className="bg-[var(--color-sidebar-surface)] text-[var(--color-sidebar-text)] border-[var(--color-sidebar-border)]"
        >
          {label}
        </TooltipContent>
      </Tooltip>
    )
  }

  return content
}
