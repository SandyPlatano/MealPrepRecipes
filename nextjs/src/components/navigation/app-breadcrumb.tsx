"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";
import React from "react";

interface BreadcrumbConfig {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

// Static route labels
const ROUTE_LABELS: Record<string, string> = {
  app: "Home",
  recipes: "Recipes",
  plan: "Meal Plan",
  shop: "Shopping",
  stats: "Stats",
  settings: "Settings",
  new: "New Recipe",
  edit: "Edit",
  cook: "Cooking Mode",
  print: "Print",
  discover: "Discover",
  nutrition: "Nutrition",
  impact: "Your Impact",
  costs: "Costs",
  help: "Help",
};

interface AppBreadcrumbProps {
  /** Optional custom title for the current page (e.g., recipe title) */
  currentTitle?: string;
  /** Optional crumbs to prepend */
  customCrumbs?: BreadcrumbConfig[];
  /** Hide the home crumb */
  hideHome?: boolean;
}

/**
 * Dynamic breadcrumb navigation that reads the current path
 */
export function AppBreadcrumb({
  currentTitle,
  customCrumbs = [],
  hideHome = false,
}: AppBreadcrumbProps) {
  const pathname = usePathname();

  // Parse path into segments (skip empty strings)
  const segments = pathname.split("/").filter(Boolean);

  // Build breadcrumb items from path
  const items: BreadcrumbConfig[] = [];

  // Add home if not hidden
  if (!hideHome) {
    items.push({
      label: "Home",
      href: "/app",
      icon: <Home className="h-4 w-4" />,
    });
  }

  // Add custom crumbs
  items.push(...customCrumbs);

  // Build path progressively
  let currentPath = "";
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += `/${segment}`;

    // Skip 'app' segment (already added as Home) and route groups
    if (segment === "app" || segment.startsWith("(")) continue;

    // Check if this is a UUID (recipe ID, etc.)
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        segment
      );

    // For the last segment, use currentTitle if provided
    const isLast = i === segments.length - 1;

    if (isUuid) {
      // For UUIDs, use the custom title if this is the last segment
      if (isLast && currentTitle) {
        items.push({
          label: currentTitle,
          // No href for current page
        });
      } else if (currentTitle) {
        // UUID in the middle of the path (e.g., /recipes/[id]/edit)
        items.push({
          label: currentTitle,
          href: currentPath,
        });
      }
    } else {
      // Regular segment - look up label or capitalize
      const label =
        ROUTE_LABELS[segment] ||
        segment.charAt(0).toUpperCase() + segment.slice(1);

      if (isLast) {
        items.push({ label });
      } else {
        items.push({
          label,
          href: currentPath,
        });
      }
    }
  }

  // Don't show breadcrumb if only home
  if (items.length <= 1) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {item.href ? (
                <BreadcrumbLink
                  href={item.href}
                  className="flex items-center gap-1.5"
                >
                  {item.icon}
                  <span className="max-w-[150px] truncate">{item.label}</span>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="flex items-center gap-1.5">
                  {item.icon}
                  <span className="max-w-[200px] truncate">{item.label}</span>
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
