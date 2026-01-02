"use client";

import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface SettingsCardProps {
  /** ID for scroll targeting from sidebar navigation */
  id: string;
  /** Icon displayed in the card header */
  icon: LucideIcon;
  /** Card title */
  title: string;
  /** Optional description below the title */
  description?: string;
  /** Card content */
  children: React.ReactNode;
  /** Optional className for the card */
  className?: string;
  /** Optional header action (e.g., toggle switch) */
  headerAction?: React.ReactNode;
}

/**
 * Unified card component for settings sections.
 * Provides consistent styling with icon, title, description, and content area.
 * The id prop is used for sidebar jump-link navigation.
 */
export function SettingsCard({
  id,
  icon: Icon,
  title,
  description,
  children,
  className,
  headerAction,
}: SettingsCardProps) {
  return (
    <Card
      id={id}
      className={cn(
        "bg-white rounded-xl border border-gray-200 shadow-sm group transition-colors",
        className
      )}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D9F99D]/20">
              <Icon className="h-4 w-4 text-[#1A1A1A]" />
            </div>
            <CardTitle className="text-base text-[#1A1A1A]">{title}</CardTitle>
          </div>
          {headerAction && (
            <div className="flex-shrink-0">{headerAction}</div>
          )}
        </div>
        {description && (
          <CardDescription className="mt-2 ml-11 text-gray-600">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <Separator className="mb-0 bg-gray-200" />
      <CardContent className="pt-6 flex flex-col gap-4">
        {children}
      </CardContent>
    </Card>
  );
}
