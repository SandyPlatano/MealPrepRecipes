import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

// ─────────────────────────────────────────────────────────────
// StatCard - Display a metric with optional trend indicator
// ─────────────────────────────────────────────────────────────

interface StatCardProps {
  value: string;
  label: string;
  trend?: string;
  trendUp?: boolean;
  borderColor?: string;
  className?: string;
}

export function StatCard({
  value,
  label,
  trend,
  trendUp,
  borderColor,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-4 md:p-6",
        "transition-all duration-200 hover:shadow-md",
        className
      )}
      style={borderColor ? { borderColor } : undefined}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-2xl font-bold md:text-3xl">{value}</p>
          <p className="mt-1 text-sm text-muted-foreground">{label}</p>
        </div>
        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
              trendUp
                ? "bg-sage-100 text-sage-700 dark:bg-sage-900/30 dark:text-sage-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            )}
          >
            {trendUp ? (
              <TrendingUp className="size-3" />
            ) : (
              <TrendingDown className="size-3" />
            )}
            {trend}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MiniStatCard - Compact stat card with color indicator
// ─────────────────────────────────────────────────────────────

interface MiniStatCardProps {
  value: string;
  label: string;
  color?: string;
  className?: string;
}

export function MiniStatCard({
  value,
  label,
  color,
  className,
}: MiniStatCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border-l-4 bg-card p-4",
        "transition-all duration-200 hover:shadow-sm",
        className
      )}
      style={{ borderLeftColor: color || "hsl(var(--primary))" }}
    >
      <p className="font-mono text-xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
