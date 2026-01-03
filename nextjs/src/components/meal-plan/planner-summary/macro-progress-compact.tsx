import { cn } from "@/lib/utils";
import type { MacroProgressCompactProps } from "./types";

export function MacroProgressCompact({
  label,
  actual,
  target,
  progress,
  unit = "",
}: MacroProgressCompactProps) {
  const percentage = Math.min(progress.percentage, 100);

  // Use soft brand colors instead of traffic lights
  const barColor = {
    sage: "bg-brand-sage",
    muted: "bg-muted-foreground/40",
    coral: "bg-brand-coral/60",
  }[progress.color];

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="font-mono text-muted-foreground tabular-nums">
          {actual !== null ? Math.round(actual) : "—"}
          <span className="text-xs">
            {" "}
            / {target}
            {unit}
          </span>
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full transition-all duration-500 ease-out", barColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
