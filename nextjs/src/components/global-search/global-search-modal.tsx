"use client";

/**
 * Global Search Modal
 *
 * Notion-style command palette for searching recipes, quick actions, and people.
 */

import { useCallback, useRef, useEffect } from "react";
import { useGlobalSearch } from "@/contexts/global-search-context";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Search,
  Loader2,
  Clock,
  BookOpen,
  User,
  Zap,
  Calendar,
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
} from "lucide-react";
import type { SearchResultItem, RecentItem } from "@/types/global-search";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

// Icon mapping for actions
const ACTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
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
};

// ─────────────────────────────────────────────────────────────────────────────
// Result Item Component
// ─────────────────────────────────────────────────────────────────────────────

interface ResultItemProps {
  item: SearchResultItem;
  isSelected: boolean;
  onSelect: () => void;
  onHover: () => void;
}

function ResultItem({ item, isSelected, onSelect, onHover }: ResultItemProps) {
  const ref = useRef<HTMLButtonElement>(null);

  // Scroll into view when selected via keyboard
  useEffect(() => {
    if (isSelected && ref.current) {
      ref.current.scrollIntoView({ block: "nearest" });
    }
  }, [isSelected]);

  const IconComponent = item.icon ? ACTION_ICONS[item.icon] : null;

  return (
    <button
      ref={ref}
      onClick={onSelect}
      onMouseEnter={onHover}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
        isSelected ? "bg-accent" : "hover:bg-accent/50"
      )}
    >
      {/* Image or Icon */}
      <div className="flex-shrink-0 w-10 h-10 rounded-md overflow-hidden bg-muted flex items-center justify-center">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : IconComponent ? (
          <IconComponent className="h-5 w-5 text-muted-foreground" />
        ) : item.type === "recipe" ? (
          <BookOpen className="h-5 w-5 text-muted-foreground" />
        ) : item.type === "profile" ? (
          <User className="h-5 w-5 text-muted-foreground" />
        ) : (
          <Zap className="h-5 w-5 text-muted-foreground" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">{item.label}</div>
        {item.subtitle && (
          <div className="text-xs text-muted-foreground truncate mt-0.5">
            {item.subtitle}
          </div>
        )}
      </div>

      {/* Type badge */}
      <div className="flex-shrink-0">
        <span
          className={cn(
            "text-[10px] px-2 py-0.5 rounded-full",
            item.type === "recipe" && "bg-orange-500/10 text-orange-500",
            item.type === "action" && "bg-blue-500/10 text-blue-500",
            item.type === "profile" && "bg-purple-500/10 text-purple-500"
          )}
        >
          {item.type === "recipe" && "Recipe"}
          {item.type === "action" && "Action"}
          {item.type === "profile" && "Person"}
        </span>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Recent Item Component
// ─────────────────────────────────────────────────────────────────────────────

interface RecentItemProps {
  item: RecentItem;
  isSelected: boolean;
  onSelect: () => void;
  onHover: () => void;
}

function RecentItemButton({ item, isSelected, onSelect, onHover }: RecentItemProps) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isSelected && ref.current) {
      ref.current.scrollIntoView({ block: "nearest" });
    }
  }, [isSelected]);

  const IconComponent = item.icon ? ACTION_ICONS[item.icon] : null;

  return (
    <button
      ref={ref}
      onClick={onSelect}
      onMouseEnter={onHover}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
        isSelected ? "bg-accent" : "hover:bg-accent/50"
      )}
    >
      {/* Image or Icon */}
      <div className="flex-shrink-0 w-8 h-8 rounded-md overflow-hidden bg-muted flex items-center justify-center">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : IconComponent ? (
          <IconComponent className="h-4 w-4 text-muted-foreground" />
        ) : item.type === "recipe" ? (
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        ) : item.type === "profile" ? (
          <User className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Clock className="h-4 w-4 text-muted-foreground" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">{item.label}</div>
        {item.subtitle && (
          <div className="text-xs text-muted-foreground truncate">
            {item.subtitle}
          </div>
        )}
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section Header
// ─────────────────────────────────────────────────────────────────────────────

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export function GlobalSearchModal() {
  const {
    isOpen,
    closeSearch,
    query,
    setQuery,
    results,
    matchedActions,
    isLoading,
    selectedIndex,
    setSelectedIndex,
    flatResults,
    recentItems,
    handleSelect,
  } = useGlobalSearch();

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure modal is rendered
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const hasQuery = query.trim().length > 0;
      const items = hasQuery ? flatResults : recentItems;
      const itemCount = items.length;

      if (itemCount === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((selectedIndex + 1) % itemCount);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((selectedIndex - 1 + itemCount) % itemCount);
          break;
        case "Enter":
          e.preventDefault();
          if (hasQuery && flatResults[selectedIndex]) {
            handleSelect(flatResults[selectedIndex]);
          } else if (!hasQuery && recentItems[selectedIndex]) {
            // Handle recent item selection
            const recent = recentItems[selectedIndex];
            handleSelect({
              type: recent.type === "page" ? "action" : recent.type,
              id: recent.id,
              label: recent.label,
              subtitle: recent.subtitle,
              imageUrl: recent.imageUrl,
              icon: recent.icon,
              href: recent.href,
            });
          }
          break;
        case "Escape":
          e.preventDefault();
          closeSearch();
          break;
      }
    },
    [query, flatResults, recentItems, selectedIndex, setSelectedIndex, handleSelect, closeSearch]
  );

  const hasQuery = query.trim().length > 0;
  const showRecents = !hasQuery && recentItems.length > 0;
  const showResults = hasQuery && (flatResults.length > 0 || isLoading);
  const showEmpty = hasQuery && !isLoading && flatResults.length === 0 && query.length >= 2;

  // Group results by type
  const recipeResults = flatResults.filter((r) => r.type === "recipe");
  const actionResults = flatResults.filter((r) => r.type === "action");
  const profileResults = flatResults.filter((r) => r.type === "profile");

  // Calculate index offsets for each section
  const recipeStartIndex = 0;
  const actionStartIndex = recipeResults.length;
  const profileStartIndex = recipeResults.length + actionResults.length;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeSearch()}>
      <DialogContent
        className="max-w-2xl p-0 gap-0 overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        <VisuallyHidden>
          <DialogTitle>Search</DialogTitle>
        </VisuallyHidden>

        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          {isLoading ? (
            <Loader2 className="h-5 w-5 text-muted-foreground animate-spin flex-shrink-0" />
          ) : (
            <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          )}
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search recipes, actions, people..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 p-0 h-auto text-base focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
          />
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto">
          {/* Recent Items */}
          {showRecents && (
            <div className="py-2">
              <SectionHeader>Recent</SectionHeader>
              <div className="px-2">
                {recentItems.map((item, index) => (
                  <RecentItemButton
                    key={`${item.type}-${item.id}`}
                    item={item}
                    isSelected={selectedIndex === index}
                    onSelect={() => {
                      handleSelect({
                        type: item.type === "page" ? "action" : item.type,
                        id: item.id,
                        label: item.label,
                        subtitle: item.subtitle,
                        imageUrl: item.imageUrl,
                        icon: item.icon,
                        href: item.href,
                      });
                    }}
                    onHover={() => setSelectedIndex(index)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {showResults && (
            <div className="py-2">
              {/* Recipes Section */}
              {recipeResults.length > 0 && (
                <div className="mb-2">
                  <SectionHeader>Recipes</SectionHeader>
                  <div className="px-2">
                    {recipeResults.map((item, index) => (
                      <ResultItem
                        key={item.id}
                        item={item}
                        isSelected={selectedIndex === recipeStartIndex + index}
                        onSelect={() => handleSelect(item)}
                        onHover={() => setSelectedIndex(recipeStartIndex + index)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Actions Section */}
              {actionResults.length > 0 && (
                <div className="mb-2">
                  <SectionHeader>Actions</SectionHeader>
                  <div className="px-2">
                    {actionResults.map((item, index) => (
                      <ResultItem
                        key={item.id}
                        item={item}
                        isSelected={selectedIndex === actionStartIndex + index}
                        onSelect={() => handleSelect(item)}
                        onHover={() => setSelectedIndex(actionStartIndex + index)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* People Section */}
              {profileResults.length > 0 && (
                <div className="mb-2">
                  <SectionHeader>People</SectionHeader>
                  <div className="px-2">
                    {profileResults.map((item, index) => (
                      <ResultItem
                        key={item.id}
                        item={item}
                        isSelected={selectedIndex === profileStartIndex + index}
                        onSelect={() => handleSelect(item)}
                        onHover={() => setSelectedIndex(profileStartIndex + index)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {showEmpty && (
            <div className="py-12 text-center">
              <Search className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No results found</p>
              <p className="text-sm text-muted-foreground/60 mt-1">
                Try a different search term
              </p>
            </div>
          )}

          {/* Initial State (no query, no recents) */}
          {!hasQuery && recentItems.length === 0 && (
            <div className="py-12 text-center">
              <Search className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">Search for anything</p>
              <p className="text-sm text-muted-foreground/60 mt-1">
                Recipes, quick actions, or people
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t bg-muted/30 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="inline-flex h-5 items-center rounded border bg-background px-1.5 font-mono text-[10px]">
                ↑
              </kbd>
              <kbd className="inline-flex h-5 items-center rounded border bg-background px-1.5 font-mono text-[10px]">
                ↓
              </kbd>
              <span className="ml-1">Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="inline-flex h-5 items-center rounded border bg-background px-1.5 font-mono text-[10px]">
                ↵
              </kbd>
              <span className="ml-1">Select</span>
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="inline-flex h-5 items-center rounded border bg-background px-1.5 font-mono text-[10px]">
              /
            </kbd>
            <span className="ml-1">to open</span>
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
