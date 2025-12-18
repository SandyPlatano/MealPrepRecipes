"use client";

import {
  Calendar,
  ShoppingCart,
  Heart,
  BarChart3,
  BookOpen,
} from "lucide-react";
import { SidebarSection } from "./sidebar-section";
import { SidebarNavItem } from "./sidebar-nav-item";

interface SidebarMealPlanProps {
  shoppingListCount?: number;
  favoritesCount?: number;
}

export function SidebarMealPlan({
  shoppingListCount,
  favoritesCount,
}: SidebarMealPlanProps) {
  return (
    <SidebarSection title="Meal Planning" icon={Calendar} defaultOpen>
      <div className="px-2 space-y-0.5">
        <SidebarNavItem
          href="/app"
          icon={Calendar}
          label="Plan"
          exactMatch
        />
        <SidebarNavItem
          href="/app/shop"
          icon={ShoppingCart}
          label="Shopping List"
          badge={shoppingListCount}
        />
        <SidebarNavItem
          href="/app/recipes"
          icon={BookOpen}
          label="Recipes"
        />
        <SidebarNavItem
          href="/app/history"
          icon={Heart}
          label="Favorites"
          badge={favoritesCount}
        />
        <SidebarNavItem
          href="/app/stats"
          icon={BarChart3}
          label="Stats"
        />
      </div>
    </SidebarSection>
  );
}
