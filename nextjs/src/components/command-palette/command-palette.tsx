"use client";

import * as React from "react";
import { useGlobalSearch } from "@/contexts/global-search-context";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Calendar,
  BookOpen,
  ShoppingCart,
  Settings,
  Users,
  Package,
  Plus,
  Link,
  ListPlus,
  Moon,
  Download,
  UserPlus,
  Keyboard,
  Clock,
  ChefHat,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

// Map icon names to Lucide components
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Calendar,
  BookOpen,
  ShoppingCart,
  Settings,
  Users,
  Package,
  Plus,
  Link,
  ListPlus,
  Moon,
  Download,
  UserPlus,
  Keyboard,
  Clock,
  ChefHat,
};

export function CommandPalette() {
  const {
    isOpen,
    closeSearch,
    query,
    setQuery,
    flatResults,
    recentItems,
    handleSelect,
    isLoading,
  } = useGlobalSearch();

  const [selectedIndex, setSelectedIndex] = React.useState(0);

  // Reset selection when results change
  React.useEffect(() => {
    setSelectedIndex(0);
  }, [flatResults.length]);

  // Keyboard navigation
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Let the Command component handle input focus
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < flatResults.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (flatResults[selectedIndex]) {
          handleSelect(flatResults[selectedIndex]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, flatResults, selectedIndex, handleSelect]);

  // Render icon component
  const renderIcon = (iconName: string | undefined) => {
    if (!iconName) return <ChefHat className="h-4 w-4 text-gray-400" />;
    const IconComponent = ICON_MAP[iconName];
    if (!IconComponent)
      return <ChefHat className="h-4 w-4 text-gray-400" />;
    return <IconComponent className="h-4 w-4 text-gray-600" />;
  };

  // Show recent items when no query
  const showRecent = !query.trim() && recentItems.length > 0;

  // Group results by type
  const recipes = flatResults.filter((r) => r.type === "recipe");
  const actions = flatResults.filter((r) => r.type === "action");
  const profiles = flatResults.filter((r) => r.type === "profile");

  return (
    <CommandDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeSearch();
      }}
      title="Search"
      description="Search for recipes, actions, and more"
      className="border-gray-200 rounded-xl shadow-lg"
    >
      <CommandInput
        placeholder="Search recipes, actions..."
        value={query}
        onValueChange={setQuery}
        className="border-b border-gray-200"
      />
      <CommandList className="max-h-[400px] p-2">
        <CommandEmpty>
          {isLoading ? (
            <div className="py-6 text-center text-sm text-gray-500">
              Searching...
            </div>
          ) : (
            <div className="py-6 text-center text-sm text-gray-500">
              No results found.
            </div>
          )}
        </CommandEmpty>

        {/* Recent Items (shown when no query) */}
        {showRecent && (
          <>
            <CommandGroup heading="Recent">
              {recentItems.slice(0, 5).map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.label}
                  onSelect={() => {
                    handleSelect({
                      type:
                        item.type === "page"
                          ? "action"
                          : (item.type as "recipe" | "action" | "profile"),
                      id: item.id,
                      label: item.label,
                      subtitle: item.subtitle,
                      imageUrl: item.imageUrl,
                      icon: item.icon,
                      href: item.href,
                    });
                  }}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer",
                    "hover:bg-gray-50",
                    "data-[selected=true]:bg-[#D9F99D]/20 data-[selected=true]:border-[#D9F99D]"
                  )}
                >
                  {item.imageUrl ? (
                    <div className="relative h-8 w-8 shrink-0 rounded overflow-hidden border border-gray-200">
                      <Image
                        src={item.imageUrl}
                        alt={item.label}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-gray-100 border border-gray-200">
                      {renderIcon(item.icon)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {item.label}
                    </div>
                    {item.subtitle && (
                      <div className="text-xs text-gray-500 truncate">
                        {item.subtitle}
                      </div>
                    )}
                  </div>
                  <Clock className="h-3 w-3 text-gray-400 shrink-0" />
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator className="my-2" />
          </>
        )}

        {/* Recipes */}
        {recipes.length > 0 && (
          <CommandGroup heading="Recipes">
            {recipes.map((result, index) => (
              <CommandItem
                key={result.id}
                value={result.label}
                onSelect={() => handleSelect(result)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer",
                  "hover:bg-gray-50 transition-colors duration-150",
                  "data-[selected=true]:bg-[#D9F99D]/30 data-[selected=true]:border-[#D9F99D]"
                )}
              >
                {result.imageUrl ? (
                  <div className="relative h-10 w-10 shrink-0 rounded overflow-hidden border border-gray-200">
                    <Image
                      src={result.imageUrl}
                      alt={result.label}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-gray-100 border border-gray-200">
                    <ChefHat className="h-5 w-5 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {result.label}
                  </div>
                  {result.subtitle && (
                    <div className="text-xs text-gray-500 truncate">
                      {result.subtitle}
                    </div>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Actions */}
        {actions.length > 0 && (
          <>
            {recipes.length > 0 && <CommandSeparator className="my-2" />}
            <CommandGroup heading="Actions">
              {actions.map((result) => (
                <CommandItem
                  key={result.id}
                  value={result.label}
                  onSelect={() => handleSelect(result)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer",
                    "hover:bg-gray-50 transition-colors duration-150",
                    "data-[selected=true]:bg-[#D9F99D]/30 data-[selected=true]:border-[#D9F99D]"
                  )}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-gray-100 border border-gray-200">
                    {renderIcon(result.icon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {result.label}
                    </div>
                    {result.subtitle && (
                      <div className="text-xs text-gray-500 truncate">
                        {result.subtitle}
                      </div>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* Profiles */}
        {profiles.length > 0 && (
          <>
            {(recipes.length > 0 || actions.length > 0) && (
              <CommandSeparator className="my-2" />
            )}
            <CommandGroup heading="People">
              {profiles.map((result) => (
                <CommandItem
                  key={result.id}
                  value={result.label}
                  onSelect={() => handleSelect(result)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer",
                    "hover:bg-gray-50 transition-colors duration-150",
                    "data-[selected=true]:bg-[#D9F99D]/30 data-[selected=true]:border-[#D9F99D]"
                  )}
                >
                  {result.imageUrl ? (
                    <div className="relative h-8 w-8 shrink-0 rounded-full overflow-hidden border border-gray-200">
                      <Image
                        src={result.imageUrl}
                        alt={result.label}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 border border-gray-200">
                      <Users className="h-4 w-4 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {result.label}
                    </div>
                    {result.subtitle && (
                      <div className="text-xs text-gray-500 truncate">
                        {result.subtitle}
                      </div>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>

      {/* Footer hint */}
      <div className="border-t border-gray-200 px-4 py-2 text-xs text-gray-500 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-gray-100 border border-gray-300 text-gray-600">
              ↑
            </kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-gray-100 border border-gray-300 text-gray-600">
              ↓
            </kbd>
            <span className="ml-1">navigate</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-gray-100 border border-gray-300 text-gray-600">
              ↵
            </kbd>
            <span className="ml-1">select</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-gray-100 border border-gray-300 text-gray-600">
              esc
            </kbd>
            <span className="ml-1">close</span>
          </span>
        </div>
      </div>
    </CommandDialog>
  );
}
