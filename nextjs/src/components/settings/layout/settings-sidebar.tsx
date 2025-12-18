"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { SETTINGS_CATEGORIES, type SettingsSubSection } from "@/lib/settings/settings-categories";
import { ScrollArea } from "@/components/ui/scroll-area";

export function SettingsSidebar() {
  const pathname = usePathname();
  const [activeSubSection, setActiveSubSection] = useState<string | null>(null);

  const handleSubSectionClick = useCallback((subSection: SettingsSubSection) => {
    setActiveSubSection(subSection.id);

    // Find the target element and scroll to it
    const targetElement = document.getElementById(subSection.scrollTarget);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "start" });

      // Add a brief highlight effect
      targetElement.classList.add("ring-2", "ring-primary/50", "ring-offset-2");
      setTimeout(() => {
        targetElement.classList.remove("ring-2", "ring-primary/50", "ring-offset-2");
      }, 1500);
    }
  }, []);

  return (
    <aside className="hidden md:flex flex-col w-60 border-r bg-muted/30 h-full shrink-0">
      <div className="p-4 border-b">
        <h2 className="font-mono font-semibold text-lg">Settings</h2>
      </div>
      <ScrollArea className="flex-1">
        <nav className="p-3 space-y-1">
          {SETTINGS_CATEGORIES.map((category) => {
            const Icon = category.icon;
            const isActive =
              pathname === category.path ||
              pathname.startsWith(`${category.path}/`);
            const hasSubSections = isActive && category.subSections && category.subSections.length > 0;

            return (
              <div key={category.id}>
                <Link
                  href={category.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    "hover:bg-accent hover:text-accent-foreground",
                    isActive
                      ? "bg-primary/10 text-primary border-l-2 border-primary -ml-[2px] pl-[14px]"
                      : "text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span>{category.label}</span>
                </Link>

                {/* Sub-sections for active category */}
                {hasSubSections && (
                  <div className="mt-1 ml-4 space-y-0.5 border-l border-border/50 pl-3">
                    {category.subSections!.map((subSection) => (
                      <button
                        key={subSection.id}
                        onClick={() => handleSubSectionClick(subSection)}
                        className={cn(
                          "flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-xs font-medium transition-all text-left",
                          "hover:bg-accent hover:text-accent-foreground",
                          activeSubSection === subSection.id
                            ? "text-primary bg-primary/5"
                            : "text-muted-foreground"
                        )}
                      >
                        <ChevronRight className="h-3 w-3 flex-shrink-0" />
                        <span>{subSection.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </ScrollArea>
    </aside>
  );
}
