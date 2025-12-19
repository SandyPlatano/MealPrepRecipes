"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  searchSettings,
  type SearchableSetting,
} from "@/lib/settings/settings-search-index";
import { SETTINGS_CATEGORY_MAP } from "@/lib/settings/settings-categories";

export function SettingsSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    return searchSettings(query).slice(0, 8);
  }, [query]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  const handleSelect = useCallback(
    (setting: SearchableSetting) => {
      setOpen(false);
      setQuery("");

      // Navigate to the category page
      router.push(setting.path);

      // After navigation, scroll to the specific setting and highlight it
      setTimeout(() => {
        const element = document.getElementById(setting.componentId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.classList.add(
            "ring-2",
            "ring-primary",
            "ring-offset-2",
            "ring-offset-background"
          );
          setTimeout(() => {
            element.classList.remove(
              "ring-2",
              "ring-primary",
              "ring-offset-2",
              "ring-offset-background"
            );
          }, 2000);
        }
      }, 150);
    },
    [router]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open || results.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % results.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
          break;
        case "Enter":
          e.preventDefault();
          if (results[selectedIndex]) {
            handleSelect(results[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          setOpen(false);
          inputRef.current?.blur();
          break;
      }
    },
    [open, results, selectedIndex, handleSelect]
  );

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search settings..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          onKeyDown={handleKeyDown}
          className="pl-9 pr-4"
        />
      </div>

      {open && query && results.length > 0 && (
        <div
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-popover border rounded-lg shadow-lg z-50 overflow-hidden"
        >
          <div className="p-1">
            {results.map((setting, index) => {
              const category = SETTINGS_CATEGORY_MAP.get(setting.category);
              const isSelected = index === selectedIndex;

              return (
                <button
                  key={setting.id}
                  onClick={() => handleSelect(setting)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    "w-full flex items-start gap-3 p-2.5 rounded-md text-left transition-colors",
                    isSelected ? "bg-accent" : "hover:bg-accent/50"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">
                        {setting.label}
                      </span>
                      {setting.isAdvanced && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          Advanced
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <span>{category?.label}</span>
                      <ArrowRight className="size-3" />
                      <span className="truncate">{setting.description}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {open && query && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border rounded-lg shadow-lg z-50 p-4 text-center text-sm text-muted-foreground">
          No settings found for &quot;{query}&quot;
        </div>
      )}
    </div>
  );
}
