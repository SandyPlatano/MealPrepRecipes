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
    <aside className="hidden md:flex flex-col w-60 border-r border-gray-200 bg-[#FFFCF6] h-full shrink-0">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-mono font-semibold text-lg text-[#1A1A1A]">Settings</h2>
      </div>
      <ScrollArea className="flex-1">
        <nav className="p-3 flex flex-col gap-1">
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
                    "hover:bg-white/80",
                    isActive
                      ? "bg-[#D9F99D] text-[#1A1A1A] border-l-2 border-[#1A1A1A] -ml-[2px] pl-[14px]"
                      : "text-gray-700"
                  )}
                >
                  <Icon className="size-4 flex-shrink-0" />
                  <span>{category.label}</span>
                </Link>

                {/* Sub-sections for active category */}
                {hasSubSections && (
                  <div className="mt-1 ml-4 flex flex-col gap-0.5 border-l border-gray-300 pl-3">
                    {category.subSections!.map((subSection) => (
                      <button
                        type="button"
                        key={subSection.id}
                        onClick={() => handleSubSectionClick(subSection)}
                        className={cn(
                          "flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-xs font-medium transition-all text-left",
                          "hover:bg-white/80",
                          activeSubSection === subSection.id
                            ? "text-[#1A1A1A] bg-[#D9F99D]/30"
                            : "text-gray-600"
                        )}
                      >
                        <ChevronRight className="size-3 flex-shrink-0" />
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
