"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface WasteMetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  className?: string;
}

/**
 * Display card for a single waste metric
 */
export function WasteMetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = "text-primary",
  trend,
  className,
}: WasteMetricCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div
            className={cn(
              "rounded-full p-2.5 bg-primary/10",
              iconColor.includes("green") && "bg-green-500/10",
              iconColor.includes("blue") && "bg-blue-500/10",
              iconColor.includes("amber") && "bg-amber-500/10",
              iconColor.includes("purple") && "bg-purple-500/10"
            )}
          >
            <Icon className={cn("h-5 w-5", iconColor)} />
          </div>
        </div>

        {trend && (
          <div className="mt-3 flex items-center gap-1 text-xs">
            <span
              className={cn(
                "font-medium",
                trend.isPositive ? "text-green-600" : "text-red-600"
              )}
            >
              {trend.isPositive ? "+" : ""}
              {trend.value}%
            </span>
            <span className="text-muted-foreground">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton loader for metric card
 */
export function WasteMetricCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-4 w-20 bg-muted animate-pulse rounded" />
            <div className="h-8 w-16 bg-muted animate-pulse rounded" />
          </div>
          <div className="rounded-full p-2.5 bg-muted animate-pulse">
            <div className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
