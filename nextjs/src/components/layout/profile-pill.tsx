"use client"

import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface ProfilePillProps {
  user: User | null
  className?: string
}

export function ProfilePill({
  user,
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

  const handleSettingsClick = () => {
    router.push("/app/settings")
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-2 py-1.5 rounded-full",
        "bg-white border border-gray-200",
        "hover:bg-gray-50 transition-colors",
        className
      )}
    >
      {/* Avatar with lime ring */}
      <Avatar className="h-7 w-7 ring-2 ring-[#D9F99D] ring-offset-1 ring-offset-white">
        <AvatarImage src={avatarUrl} alt={displayName} />
        <AvatarFallback className="text-xs font-bold bg-[#D9F99D] text-[#1A1A1A]">
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Settings */}
      <button
        onClick={handleSettingsClick}
        className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Settings"
      >
        <Settings className="size-4 text-gray-600" />
      </button>
    </div>
  )
}
