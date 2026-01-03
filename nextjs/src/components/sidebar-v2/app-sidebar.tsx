"use client";

import * as React from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { ChefHat } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";
import { NavCollections } from "./nav-collections";
import { NavPinned } from "./nav-pinned";
import { NavUser } from "./nav-user";
import type { FolderCategoryWithFolders } from "@/types/folder";
import type { SystemSmartFolder } from "@/types/smart-folder";

export interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: User | null;
  logoutAction: () => Promise<void>;
  categories?: FolderCategoryWithFolders[];
  systemSmartFolders?: SystemSmartFolder[];
  totalRecipeCount?: number;
  shoppingListCount?: number;
  favoritesCount?: number;
}

export function AppSidebar({
  user,
  logoutAction,
  categories,
  systemSmartFolders,
  totalRecipeCount,
  shoppingListCount,
  favoritesCount,
  ...props
}: AppSidebarProps) {
  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-border/40"
      {...props}
    >
      {/* Header with Logo */}
      <SidebarHeader className="p-4">
        <Link
          href="/app"
          className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center"
        >
          <div className="p-1.5 rounded-lg bg-[#D9F99D] shrink-0">
            <ChefHat className="h-5 w-5 text-[#1A1A1A]" />
          </div>
          <span className="font-bold text-lg group-data-[collapsible=icon]:hidden">
            MealPrep
          </span>
        </Link>
      </SidebarHeader>

      {/* Main Content */}
      <SidebarContent>
        {/* Primary Navigation */}
        <NavMain
          shoppingListCount={shoppingListCount}
          favoritesCount={favoritesCount}
        />

        {/* Pinned Items */}
        <NavPinned />

        {/* Recipe Folders */}
        <NavCollections
          categories={categories}
          systemSmartFolders={systemSmartFolders}
          totalRecipeCount={totalRecipeCount}
        />
      </SidebarContent>

      {/* Footer with User/Settings */}
      <SidebarFooter>
        <NavUser user={user} logoutAction={logoutAction} />
      </SidebarFooter>

      {/* Rail for collapsed mode toggle */}
      <SidebarRail />
    </Sidebar>
  );
}
