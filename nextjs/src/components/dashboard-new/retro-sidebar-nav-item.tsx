"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useRetroSidebar } from "./retro-sidebar-context";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RetroSidebarNavItemProps {
  href: string;
  icon: ReactNode;
  label: string;
  badge?: number;
  exactMatch?: boolean;
  onClick?: () => void;
}

export function RetroSidebarNavItem({
  href,
  icon,
  label,
  badge,
  exactMatch = false,
  onClick,
}: RetroSidebarNavItemProps) {
  const pathname = usePathname();
  const { isIconOnly, closeMobile, isMobile } = useRetroSidebar();

  const isActive = exactMatch
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);

  const handleClick = () => {
    if (isMobile) closeMobile();
    onClick?.();
  };

  const content = (
    <span
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2 transition-colors",
        isIconOnly && "justify-center px-2",
        isActive
          ? `
            border border-gray-600 bg-gray-800 text-white
            shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]
          `
          : `
            text-gray-300
            hover:bg-gray-800 hover:text-white
          `
      )}
    >
      <span className="flex h-5 w-5 items-center justify-center">{icon}</span>
      {!isIconOnly && (
        <>
          <span className="flex-1 text-sm font-medium">{label}</span>
          {badge !== undefined && badge > 0 && (
            <span className={`
              rounded-full bg-primary px-1.5 py-0.5 text-xs font-medium
              text-white
            `}>
              {badge}
            </span>
          )}
        </>
      )}
    </span>
  );

  // Icon-only mode with tooltip
  if (isIconOnly) {
    if (onClick) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <button onClick={handleClick} className="w-full">
              {content}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className={`
            flex items-center gap-2 border-gray-700 bg-gray-800 text-white
          `}>
            <span>{label}</span>
            {badge !== undefined && badge > 0 && (
              <span className="rounded-full bg-primary px-1.5 py-0.5 text-xs">
                {badge}
              </span>
            )}
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={href} onClick={handleClick} className="block">
            {content}
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className={`
          flex items-center gap-2 border-gray-700 bg-gray-800 text-white
        `}>
          <span>{label}</span>
          {badge !== undefined && badge > 0 && (
            <span className="rounded-full bg-primary px-1.5 py-0.5 text-xs">
              {badge}
            </span>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  // Expanded mode
  if (onClick) {
    return (
      <button onClick={handleClick} className="w-full text-left">
        {content}
      </button>
    );
  }

  return (
    <Link href={href} onClick={handleClick} className="block">
      {content}
    </Link>
  );
}
