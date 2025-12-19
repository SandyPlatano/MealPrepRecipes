"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SidebarSection } from "./sidebar-section";
import { useSidebar } from "./sidebar-context";
import type { CustomSectionConfig, CustomSectionItem } from "@/types/sidebar-customization";
import {
  isInternalLinkItem,
  isExternalLinkItem,
  isDividerItem
} from "@/types/sidebar-customization";
import { getIconComponent } from "@/lib/sidebar/sidebar-icons";

interface SidebarCustomSectionProps {
  section: CustomSectionConfig;
}

export function SidebarCustomSection({ section }: SidebarCustomSectionProps) {
  const { isIconOnly, closeMobile, isMobile } = useSidebar();
  const pathname = usePathname();

  // Get the icon component from the section config
  const SectionIcon = section.icon ? getIconComponent(section.icon) : null;

  const handleClick = () => {
    if (isMobile) {
      closeMobile();
    }
  };

  // Render individual items
  const renderItem = (item: CustomSectionItem) => {
    if (isDividerItem(item)) {
      return (
        <div key={item.id} className="px-3 py-2">
          {item.label ? (
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              {item.label}
            </span>
          ) : (
            <div className="border-t" />
          )}
        </div>
      );
    }

    if (isInternalLinkItem(item)) {
      const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
      const ItemIcon = item.icon ? getIconComponent(item.icon) : null;

      return (
        <CustomLinkButton
          key={item.id}
          href={item.href}
          label={item.label}
          icon={ItemIcon}
          emoji={item.emoji}
          isActive={isActive}
          isIconOnly={isIconOnly}
          onClick={handleClick}
        />
      );
    }

    if (isExternalLinkItem(item)) {
      const ItemIcon = item.icon ? getIconComponent(item.icon) : null;

      return (
        <CustomLinkButton
          key={item.id}
          href={item.url}
          label={item.label}
          icon={ItemIcon}
          emoji={item.emoji}
          isExternal
          isIconOnly={isIconOnly}
          onClick={handleClick}
        />
      );
    }

    // Recipe and folder links would need additional data fetching
    // For now, render as simple links
    return null;
  };

  return (
    <SidebarSection
      title={section.title}
      icon={SectionIcon || undefined}
      emoji={section.emoji || undefined}
      defaultOpen={!section.defaultCollapsed}
    >
      <div className="px-2 flex flex-col gap-0.5">
        {section.items
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map(renderItem)}
        {section.items.length === 0 && (
          <p className="px-3 py-2 text-sm text-muted-foreground italic">
            No items yet
          </p>
        )}
      </div>
    </SidebarSection>
  );
}

// Internal component for rendering links
interface CustomLinkButtonProps {
  href: string;
  label: string;
  icon?: LucideIcon | null;
  emoji?: string | null;
  isActive?: boolean;
  isExternal?: boolean;
  isIconOnly: boolean;
  onClick: () => void;
}

function CustomLinkButton({
  href,
  label,
  icon: Icon,
  emoji,
  isActive = false,
  isExternal = false,
  isIconOnly,
  onClick,
}: CustomLinkButtonProps) {
  const content = (
    <Button
      variant="ghost"
      asChild
      className={cn(
        "w-full justify-start gap-3 h-9 px-3 relative group",
        isIconOnly && "justify-center px-0",
        isActive && [
          "bg-primary/10 text-primary",
          "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2",
          "before:h-4 before:w-0.5 before:bg-primary before:rounded-r",
        ],
        !isActive && "text-muted-foreground hover:text-foreground hover:bg-accent"
      )}
    >
      <Link
        href={href}
        onClick={onClick}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
      >
        {emoji ? (
          <span className="text-sm shrink-0">{emoji}</span>
        ) : Icon ? (
          <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-primary")} />
        ) : null}
        {!isIconOnly && (
          <>
            <span className="flex-1 truncate text-sm font-medium">{label}</span>
            {isExternal && <ExternalLink className="h-3 w-3 text-muted-foreground" />}
          </>
        )}
      </Link>
    </Button>
  );

  if (isIconOnly) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-2">
          <span>{label}</span>
          {isExternal && <ExternalLink className="h-3 w-3" />}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}
