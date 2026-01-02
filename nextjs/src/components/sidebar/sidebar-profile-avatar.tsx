"use client"

import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface SidebarProfileAvatarProps {
  user: User | null
  isIconOnly?: boolean
}

export function SidebarProfileAvatar({ user, isIconOnly }: SidebarProfileAvatarProps) {
  const router = useRouter()

  const displayName =
    (user?.user_metadata?.full_name as string) ||
    user?.email?.split("@")[0] ||
    "User"
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined

  const handleClick = () => {
    router.push("/app/settings")
  }

  const avatar = (
    <button
      onClick={handleClick}
      className={cn(
        "rounded-full transition-all duration-150",
        "ring-2 ring-[var(--color-brand-primary)] ring-offset-1 ring-offset-[var(--color-sidebar-bg)]",
        "hover:ring-offset-2 hover:scale-105",
        "focus-visible:outline-none focus-visible:ring-offset-2"
      )}
      aria-label={`${displayName} - Go to settings`}
    >
      <Avatar className="h-7 w-7">
        <AvatarImage src={avatarUrl} alt={displayName} />
        <AvatarFallback className="text-xs font-bold bg-[var(--color-brand-primary)] text-[#1A1A1A]">
          {initials}
        </AvatarFallback>
      </Avatar>
    </button>
  )

  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        {avatar}
      </TooltipTrigger>
      <TooltipContent side={isIconOnly ? "right" : "bottom"} className="flex items-center gap-2">
        <span>{displayName}</span>
        <span className="text-muted-foreground">Settings</span>
      </TooltipContent>
    </Tooltip>
  )
}
