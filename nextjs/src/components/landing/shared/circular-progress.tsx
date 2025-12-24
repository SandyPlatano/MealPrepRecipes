import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// CircularProgress - SVG circular progress indicator
// ─────────────────────────────────────────────────────────────

interface CircularProgressProps {
  value: number;
  max: number;
  size?: "sm" | "md" | "lg";
  color?: string;
  displayValue?: string;
  label?: string;
  className?: string;
}

const sizeMap = {
  sm: { size: 80, stroke: 6, fontSize: "text-lg" },
  md: { size: 120, stroke: 8, fontSize: "text-2xl" },
  lg: { size: 160, stroke: 10, fontSize: "text-3xl" },
};

export function CircularProgress({
  value,
  max,
  size = "md",
  color = "hsl(var(--primary))",
  displayValue,
  label,
  className,
}: CircularProgressProps) {
  const config = sizeMap[size];
  const radius = (config.size - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / max, 1);
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative" style={{ width: config.size, height: config.size }}>
        <svg
          className="rotate-[-90deg]"
          width={config.size}
          height={config.size}
        >
          {/* Background circle */}
          <circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={config.stroke}
          />
          {/* Progress circle */}
          <circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={config.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500 ease-out"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("font-mono font-bold", config.fontSize)}>
            {displayValue ?? `${Math.round(progress * 100)}%`}
          </span>
        </div>
      </div>
      {label && (
        <span className="text-sm text-muted-foreground">{label}</span>
      )}
    </div>
  );
}
