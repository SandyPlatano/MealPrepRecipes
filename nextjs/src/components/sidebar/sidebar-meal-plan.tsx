"use client";

import {
  Calendar,
  ShoppingCart,
  Heart,
  BarChart3,
  BookOpen,
  ExternalLink,
  Link as LinkIcon,
  type LucideIcon,
} from "lucide-react";
import { SidebarSection } from "./sidebar-section";
import { SidebarNavItem } from "./sidebar-nav-item";
import { useSidebar } from "./sidebar-context";
import {
  getIconComponent,
  DEFAULT_MEAL_PLANNING_ICONS,
} from "@/lib/sidebar/sidebar-icons";
import type {
  BuiltInSectionConfig,
  SidebarIconName,
} from "@/types/sidebar-customization";
import {
  isInternalLinkItem,
  isExternalLinkItem,
} from "@/types/sidebar-customization";

// Built-in item metadata
const BUILTIN_ITEMS: Record<
  string,
  { label: string; href: string; defaultIcon: LucideIcon; pinnableId: string }
> = {
  plan: {
    label: "Plan",
    href: "/app/plan",
    defaultIcon: Calendar,
    pinnableId: "page-plan",
  },
  "shopping-list": {
    label: "Shopping List",
    href: "/app/shop",
    defaultIcon: ShoppingCart,
    pinnableId: "page-shop",
  },
  recipes: {
    label: "Recipes",
    href: "/app/recipes",
    defaultIcon: BookOpen,
    pinnableId: "page-recipes",
  },
  favorites: {
    label: "Favorites",
    href: "/app/history",
    defaultIcon: Heart,
    pinnableId: "page-favorites",
  },
  stats: {
    label: "Stats",
    href: "/app/stats",
    defaultIcon: BarChart3,
    pinnableId: "page-stats",
  },
};

// Check if an item ID is a built-in
function isBuiltInItemId(id: string): boolean {
  return id in BUILTIN_ITEMS;
}

interface SidebarMealPlanProps {
  shoppingListCount?: number;
  favoritesCount?: number;
}

export function SidebarMealPlan({
  shoppingListCount,
  favoritesCount,
}: SidebarMealPlanProps) {
  const { sections } = useSidebar();

  // Get the meal-planning section configuration
  const mealPlanningSection = sections["meal-planning"] as
    | BuiltInSectionConfig
    | undefined;

  if (!mealPlanningSection) {
    // Fallback to static rendering if section not found
    return <StaticMealPlan shoppingListCount={shoppingListCount} favoritesCount={favoritesCount} />;
  }

  // Get section customization
  const sectionLabel = mealPlanningSection.customTitle || "Meal Planning";
  const sectionEmoji = mealPlanningSection.customEmoji || undefined;
  const SectionIcon = mealPlanningSection.customIcon
    ? getIconComponent(mealPlanningSection.customIcon)
    : null;

  // Get badge values for items
  const badgeValues: Record<string, number | undefined> = {
    "shopping-list": shoppingListCount,
    favorites: favoritesCount,
  };

  return (
    <SidebarSection
      title={sectionLabel}
      icon={sectionEmoji ? undefined : (SectionIcon || Calendar)}
      emoji={sectionEmoji}
      defaultOpen
    >
      <div className="px-2 flex flex-col gap-0.5">
        {mealPlanningSection.itemOrder.map((itemId) => {
          // Check if built-in
          if (isBuiltInItemId(itemId)) {
            const builtinMeta = BUILTIN_ITEMS[itemId];
            const itemConfig = mealPlanningSection.items[itemId];

            // Skip if hidden
            if (itemConfig?.hidden) {
              return null;
            }

            // Get customizations
            const label = itemConfig?.customName || builtinMeta.label;
            const emoji = itemConfig?.customEmoji || null;
            const customIcon = itemConfig?.customIcon
              ? getIconComponent(itemConfig.customIcon)
              : null;
            const icon = customIcon || builtinMeta.defaultIcon;
            const badge = badgeValues[itemId];

            return (
              <SidebarNavItem
                key={itemId}
                href={builtinMeta.href}
                icon={icon}
                label={label}
                emoji={emoji}
                badge={badge}
                pinnableType="page"
                pinnableId={builtinMeta.pinnableId}
              />
            );
          } else {
            // Custom item
            const customItem = mealPlanningSection.customItems.find(
              (item) => item.id === itemId
            );

            if (!customItem) {
              return null;
            }

            if (isInternalLinkItem(customItem)) {
              return (
                <SidebarNavItem
                  key={itemId}
                  href={customItem.href}
                  icon={LinkIcon}
                  label={customItem.label}
                  emoji={customItem.emoji}
                />
              );
            }

            if (isExternalLinkItem(customItem)) {
              return (
                <a
                  key={itemId}
                  href={customItem.url}
                  target={customItem.openInNewTab ? "_blank" : undefined}
                  rel={customItem.openInNewTab ? "noopener noreferrer" : undefined}
                  className="flex items-center gap-3 h-11 px-3 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-all duration-150"
                >
                  {customItem.emoji ? (
                    <span className="text-base shrink-0 w-4 h-4 flex items-center justify-center">
                      {customItem.emoji}
                    </span>
                  ) : (
                    <ExternalLink className="h-4 w-4 shrink-0" />
                  )}
                  <span className="flex-1 truncate text-sm font-medium">
                    {customItem.label}
                  </span>
                </a>
              );
            }

            return null;
          }
        })}
      </div>
    </SidebarSection>
  );
}

// Static fallback component (used when section config not available)
function StaticMealPlan({
  shoppingListCount,
  favoritesCount,
}: SidebarMealPlanProps) {
  return (
    <SidebarSection title="Meal Planning" icon={Calendar} defaultOpen>
      <div className="px-2 flex flex-col gap-0.5">
        <SidebarNavItem
          href="/app/plan"
          icon={Calendar}
          label="Plan"
          pinnableType="page"
          pinnableId="page-plan"
        />
        <SidebarNavItem
          href="/app/shop"
          icon={ShoppingCart}
          label="Shopping List"
          badge={shoppingListCount}
          pinnableType="page"
          pinnableId="page-shop"
        />
        <SidebarNavItem
          href="/app/recipes"
          icon={BookOpen}
          label="Recipes"
          pinnableType="page"
          pinnableId="page-recipes"
        />
        <SidebarNavItem
          href="/app/history"
          icon={Heart}
          label="Favorites"
          badge={favoritesCount}
          pinnableType="page"
          pinnableId="page-favorites"
        />
        <SidebarNavItem
          href="/app/stats"
          icon={BarChart3}
          label="Stats"
          pinnableType="page"
          pinnableId="page-stats"
        />
      </div>
    </SidebarSection>
  );
}
