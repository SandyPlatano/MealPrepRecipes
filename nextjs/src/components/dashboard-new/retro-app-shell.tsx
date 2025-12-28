"use client";

import type { User } from "@supabase/supabase-js";
import { RetroSidebarProvider } from "./retro-sidebar-context";
import { RetroSidebar } from "./retro-sidebar";
import { RetroHeader } from "./retro-header";

interface RetroAppShellProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
  shoppingListCount?: number;
  favoritesCount?: number;
  totalRecipeCount?: number;
}

export function RetroAppShell({
  children,
  user,
  onLogout,
  shoppingListCount = 0,
  favoritesCount = 0,
  totalRecipeCount,
}: RetroAppShellProps) {
  return (
    <RetroSidebarProvider>
      <div className="flex h-screen overflow-hidden bg-[#FEF6E4] text-[#111827]">
        {/* Sidebar */}
        <RetroSidebar
          shoppingListCount={shoppingListCount}
          favoritesCount={favoritesCount}
          totalRecipeCount={totalRecipeCount}
          onLogout={onLogout}
        />

        {/* Main area */}
        <main className="flex h-full flex-1 flex-col overflow-hidden">
          {/* Header */}
          <RetroHeader user={user} />

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </div>
        </main>
      </div>
    </RetroSidebarProvider>
  );
}
