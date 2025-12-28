"use client";

import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface RetroAccountPillProps {
  user: User | null;
}

export function RetroAccountPill({ user }: RetroAccountPillProps) {
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const avatarUrl = user?.user_metadata?.avatar_url;
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={`
      flex items-center gap-2 rounded-full bg-black px-3 py-1.5 text-white
      shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]
    `}>
      {/* Avatar - now first */}
      <Link href="/app/settings/profile">
        <Avatar className="h-6 w-6 border border-white">
          <AvatarImage src={avatarUrl} alt={displayName} />
          <AvatarFallback className={`
            bg-tertiary text-[10px] font-medium text-white
          `}>
            {initials}
          </AvatarFallback>
        </Avatar>
      </Link>

      {/* Settings - now second */}
      <Link
        href="/app/settings"
        className={`
          rounded-full p-1 transition-colors
          hover:bg-white/10
        `}
        aria-label="Settings"
      >
        <Settings className="h-4 w-4" />
      </Link>
    </div>
  );
}
