"use client"

import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { Bell, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface ProfilePillProps {
  user: User | null
  notificationCount?: number
  className?: string
}

export function ProfilePill({
  user,
  notificationCount = 0,
  className,
}: ProfilePillProps) {
  const router = useRouter()

  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined
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

  const handleNotificationClick = () => {
    // TODO: Open notifications panel
    console.log("Notifications clicked")
  }

  const handleSettingsClick = () => {
    router.push("/app/settings")
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-2 py-1.5 rounded-full",
        "bg-[var(--color-brand-ink)] border-2 border-black",
        className
      )}
    >
      {/* Notifications */}
      <button
        onClick={handleNotificationClick}
        className="relative p-1.5 rounded-full hover:bg-white/10 transition-colors"
        aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount} unread)` : ""}`}
      >
        <Bell className="size-4 text-white" />
        {notificationCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center text-[10px] font-bold bg-[var(--color-brand-primary)] text-black rounded-full">
            {notificationCount > 99 ? "99+" : notificationCount}
          </span>
        )}
      </button>

      {/* Settings */}
      <button
        onClick={handleSettingsClick}
        className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
        aria-label="Settings"
      >
        <Settings className="size-4 text-white" />
      </button>

      {/* Avatar with yellow ring */}
      <Avatar className="h-7 w-7 ring-2 ring-[var(--color-brand-primary)] ring-offset-1 ring-offset-[var(--color-brand-ink)]">
        <AvatarImage src={avatarUrl} alt={displayName} />
        <AvatarFallback className="text-xs font-bold bg-[var(--color-brand-primary)] text-black">
          {initials}
        </AvatarFallback>
      </Avatar>
    </div>
  )
}
