"use client";

import {
  ChevronsLeft,
  ChevronsRight,
  CalendarDays,
  ShoppingCart,
  BarChart3,
  Heart,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RetroSidebarNavItem } from "./retro-sidebar-nav-item";
import { RetroSidebarCollections } from "./retro-sidebar-collections";
import { useRetroSidebar } from "./retro-sidebar-context";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface RetroSidebarProps {
  shoppingListCount?: number;
  favoritesCount?: number;
  totalRecipeCount?: number;
  onLogout: () => void;
}

export function RetroSidebar({
  shoppingListCount = 0,
  favoritesCount = 0,
  totalRecipeCount,
  onLogout,
}: RetroSidebarProps) {
  const { isCollapsed, isIconOnly, toggleCollapse } = useRetroSidebar();

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          `
            flex h-full flex-shrink-0 flex-col border-r-2 border-black
            bg-[#111827] text-white transition-all duration-200
          `,
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo + Collapse Toggle */}
        <div className={`
          flex items-center justify-between border-b border-gray-800 p-4
        `}>
          {!isIconOnly ? (
            <>
              <h1 className="font-display text-xl font-bold tracking-tighter">
                BWFD<span className="text-primary">.</span>
              </h1>
              <button
                onClick={toggleCollapse}
                className={`
                  rounded-lg p-1.5 text-gray-400 transition-colors
                  hover:bg-gray-800 hover:text-white
                `}
                title="Collapse sidebar (⌘\)"
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>
            </>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={toggleCollapse}
                  className={`
                    flex w-full items-center justify-center rounded-lg p-2
                    text-gray-400 transition-colors
                    hover:bg-gray-800 hover:text-white
                  `}
                >
                  <ChevronsRight className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className={`
                border-gray-700 bg-gray-800 text-white
              `}>
                <span>Expand sidebar</span>
                <kbd className={`
                  ml-2 rounded bg-gray-700 px-1.5 py-0.5 text-[10px]
                `}>⌘\</kbd>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {/* General Section */}
          <div className="mb-6">
            {!isIconOnly && (
              <h3 className={`
                mb-3 px-4 font-mono text-xs tracking-widest text-gray-400
                uppercase
              `}>
                General
              </h3>
            )}
            <ul className="space-y-1 px-2">
              <li>
                <RetroSidebarNavItem
                  href="/app"
                  icon={<CalendarDays className="h-5 w-5" />}
                  label="Plan"
                  exactMatch
                />
              </li>
              <li>
                <RetroSidebarNavItem
                  href="/app/shop"
                  icon={<ShoppingCart className="h-5 w-5" />}
                  label="Shop"
                  badge={shoppingListCount}
                />
              </li>
              <li>
                <RetroSidebarNavItem
                  href="/app/stats"
                  icon={<BarChart3 className="h-5 w-5" />}
                  label="Stats"
                />
              </li>
              <li>
                <RetroSidebarNavItem
                  href="/app/history"
                  icon={<Heart className="h-5 w-5" />}
                  label="Favorites"
                  badge={favoritesCount}
                />
              </li>
            </ul>
          </div>

          {/* Collections Section - Folders & Categories */}
          <div className="mb-6">
            {!isIconOnly && (
              <h3 className={`
                mb-3 px-4 font-mono text-xs tracking-widest text-gray-400
                uppercase
              `}>
                Recipes
              </h3>
            )}
            <RetroSidebarCollections totalRecipeCount={totalRecipeCount} />
          </div>

          {/* Tools Section */}
          <div>
            {!isIconOnly && (
              <h3 className={`
                mb-3 px-4 font-mono text-xs tracking-widest text-gray-400
                uppercase
              `}>
                Tools
              </h3>
            )}
            <ul className="space-y-1 px-2">
              <li>
                <RetroSidebarNavItem
                  href="/app/settings"
                  icon={<Settings className="h-5 w-5" />}
                  label="Settings"
                />
              </li>
            </ul>
          </div>
        </nav>

        {/* Logout */}
        <div className="border-t border-gray-700 p-2">
          <RetroSidebarNavItem
            href="#"
            icon={<LogOut className="h-5 w-5" />}
            label="Log out"
            onClick={onLogout}
          />
        </div>
      </aside>
    </TooltipProvider>
  );
}
