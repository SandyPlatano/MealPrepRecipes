"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ICON_PICKER_CATEGORIES,
  SIDEBAR_ICON_MAP,
} from "@/lib/sidebar/sidebar-icons";
import type { SidebarIconName } from "@/types/sidebar-customization";

interface IconPickerGridProps {
  selectedIcon: SidebarIconName | null;
  onSelectIcon: (icon: SidebarIconName) => void;
  className?: string;
}

export function IconPickerGrid({
  selectedIcon,
  onSelectIcon,
  className,
}: IconPickerGridProps) {
  return (
    <ScrollArea className={cn("h-[280px] pr-3", className)}>
      <div className="flex flex-col gap-4">
        {ICON_PICKER_CATEGORIES.map((category) => (
          <div key={category.name}>
            <h4 className="text-xs font-medium text-muted-foreground mb-2">
              {category.name}
            </h4>
            <div className="grid grid-cols-6 gap-1">
              {category.icons.map((iconName) => {
                const IconComponent = SIDEBAR_ICON_MAP[iconName];
                const isSelected = selectedIcon === iconName;

                return (
                  <Button
                    key={iconName}
                    variant={isSelected ? "secondary" : "ghost"}
                    size="icon"
                    className={cn(
                      "h-9 w-9",
                      isSelected && "ring-2 ring-primary ring-offset-1"
                    )}
                    onClick={() => onSelectIcon(iconName)}
                    title={iconName}
                  >
                    <IconComponent className="size-4" />
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
