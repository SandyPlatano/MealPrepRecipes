"use client";

import type { User } from "@supabase/supabase-js";
import { RetroSearchTrigger } from "./retro-search-trigger";
import { RetroAccountPill } from "./retro-account-pill";

interface RetroHeaderProps {
  user: User | null;
}

export function RetroHeader({ user }: RetroHeaderProps) {
  return (
    <header className={`
      flex h-20 flex-shrink-0 items-center justify-between border-b-2
      border-black bg-[#FEF6E4] px-8
    `}>
      {/* Search - left side, 1/3 width */}
      <div className="flex w-1/3 items-center">
        <RetroSearchTrigger />
      </div>

      {/* Account pill - right side */}
      <div className="flex items-center gap-4">
        <RetroAccountPill user={user} />
      </div>
    </header>
  );
}
