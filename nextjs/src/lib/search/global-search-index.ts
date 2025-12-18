/**
 * Global Search Actions Index
 *
 * Defines all searchable quick actions for the command palette.
 */

import type { SearchableAction } from "@/types/global-search";

export const GLOBAL_ACTIONS_INDEX: SearchableAction[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // Navigation Actions
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "go-planner",
    label: "Go to Planner",
    description: "View your weekly meal plan",
    keywords: ["planner", "calendar", "week", "schedule", "meals", "plan"],
    category: "navigation",
    icon: "Calendar",
    behavior: "navigate",
    href: "/app",
  },
  {
    id: "go-recipes",
    label: "Go to Recipes",
    description: "Browse your recipe collection",
    keywords: ["recipes", "cookbook", "collection", "browse", "all"],
    category: "navigation",
    icon: "BookOpen",
    behavior: "navigate",
    href: "/app/recipes",
  },
  {
    id: "go-shopping",
    label: "Go to Shopping List",
    description: "View your shopping list",
    keywords: ["shopping", "list", "groceries", "buy", "cart", "shop"],
    category: "navigation",
    icon: "ShoppingCart",
    behavior: "navigate",
    href: "/app/shop",
  },
  {
    id: "go-settings",
    label: "Go to Settings",
    description: "Configure app preferences",
    keywords: ["settings", "preferences", "config", "options", "account"],
    category: "navigation",
    icon: "Settings",
    behavior: "navigate",
    href: "/app/settings",
  },
  {
    id: "go-discover",
    label: "Discover Recipes",
    description: "Explore recipes from other cooks",
    keywords: ["community", "discover", "explore", "social", "public", "browse"],
    category: "navigation",
    icon: "Users",
    behavior: "navigate",
    href: "/app/recipes/discover",
  },
  {
    id: "go-pantry",
    label: "Go to Pantry",
    description: "Manage your pantry inventory",
    keywords: ["pantry", "inventory", "stock", "ingredients", "have"],
    category: "navigation",
    icon: "Package",
    behavior: "navigate",
    href: "/app/pantry",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Create Actions
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "new-recipe",
    label: "Create New Recipe",
    description: "Add a new recipe to your collection",
    keywords: ["new", "create", "add", "recipe", "make"],
    category: "create",
    icon: "Plus",
    behavior: "navigate",
    href: "/app/recipes/new",
  },
  {
    id: "import-recipe",
    label: "Import Recipe from URL",
    description: "Import a recipe from a website",
    keywords: ["import", "url", "website", "paste", "link", "extract"],
    category: "create",
    icon: "Link",
    behavior: "function",
    functionId: "openImportDialog",
  },
  {
    id: "add-shopping-item",
    label: "Add to Shopping List",
    description: "Add an item to your shopping list",
    keywords: ["add", "shopping", "item", "grocery", "buy"],
    category: "create",
    icon: "ListPlus",
    behavior: "function",
    functionId: "openAddShoppingItem",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Utility Actions
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "toggle-dark-mode",
    label: "Toggle Dark Mode",
    description: "Switch between light and dark theme",
    keywords: ["dark", "light", "theme", "mode", "toggle", "night"],
    category: "utility",
    icon: "Moon",
    behavior: "function",
    functionId: "toggleDarkMode",
  },
  {
    id: "export-recipes",
    label: "Export Recipes",
    description: "Download your recipes",
    keywords: ["export", "download", "backup", "recipes", "save"],
    category: "utility",
    icon: "Download",
    behavior: "navigate",
    href: "/app/settings/data",
  },
  {
    id: "invite-household",
    label: "Invite to Household",
    description: "Invite someone to your household",
    keywords: ["invite", "household", "family", "share", "member", "add"],
    category: "utility",
    icon: "UserPlus",
    behavior: "navigate",
    href: "/app/settings/household",
  },
  {
    id: "keyboard-shortcuts",
    label: "View Keyboard Shortcuts",
    description: "See all available keyboard shortcuts",
    keywords: ["keyboard", "shortcuts", "hotkeys", "keys", "help"],
    category: "utility",
    icon: "Keyboard",
    behavior: "navigate",
    href: "/app/settings/shortcuts",
  },
];

/**
 * Search actions by query string
 * - All query words must match somewhere in the action's searchable text
 * - Prioritizes label prefix matches
 */
export function searchActions(query: string): SearchableAction[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const words = q.split(/\s+/);

  const matched = GLOBAL_ACTIONS_INDEX.filter((action) => {
    const searchableText = [
      action.label,
      action.description,
      ...action.keywords,
    ]
      .join(" ")
      .toLowerCase();

    // All words must match somewhere
    return words.every((word) => searchableText.includes(word));
  });

  // Sort: label prefix matches first, then by category order
  return matched
    .sort((a, b) => {
      const aLabelMatch = a.label.toLowerCase().startsWith(q);
      const bLabelMatch = b.label.toLowerCase().startsWith(q);
      if (aLabelMatch && !bLabelMatch) return -1;
      if (bLabelMatch && !aLabelMatch) return 1;

      // Then by category: navigation > create > utility
      const categoryOrder = { navigation: 0, create: 1, utility: 2 };
      return categoryOrder[a.category] - categoryOrder[b.category];
    })
    .slice(0, 6);
}
