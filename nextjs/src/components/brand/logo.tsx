import { cn } from "@/lib/utils";
import { ChefHat } from "lucide-react";

interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showIcon?: boolean;
  showTagline?: boolean;
}

const sizeClasses = {
  sm: {
    icon: "w-4 h-4",
    babe: "text-lg",
    rest: "text-sm",
    tagline: "text-xs",
  },
  md: {
    icon: "w-5 h-5",
    babe: "text-2xl",
    rest: "text-base",
    tagline: "text-sm",
  },
  lg: {
    icon: "w-7 h-7",
    babe: "text-4xl",
    rest: "text-xl",
    tagline: "text-base",
  },
  xl: {
    icon: "w-10 h-10",
    babe: "text-6xl",
    rest: "text-2xl",
    tagline: "text-lg",
  },
};

export function BrandLogo({
  className,
  size = "md",
  showIcon = true,
  showTagline = false,
}: BrandLogoProps) {
  const sizes = sizeClasses[size];

  return (
    <span className={cn("inline-flex flex-col", className)}>
      <span className="inline-flex items-center gap-2">
        {showIcon && <ChefHat className={cn("text-primary", sizes.icon)} />}
        <span className="inline-flex items-baseline gap-1">
          <span
            className={cn(
              "font-handwritten font-semibold text-primary leading-none",
              sizes.babe
            )}
          >
            Babe,
          </span>
          <span className={cn("font-mono font-bold leading-none", sizes.rest)}>
            What&apos;s for Dinner?
          </span>
        </span>
      </span>
      {showTagline && (
        <span
          className={cn(
            "font-mono text-clay-muted tracking-wider uppercase mt-1",
            showIcon ? "ml-7" : "",
            sizes.tagline
          )}
        >
          Your Meal Prep OS
        </span>
      )}
    </span>
  );
}

// Simplified version for nav/footer where we need tighter spacing
export function BrandLogoCompact({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <ChefHat className="w-5 h-5 text-primary" />
      <span className="inline-flex items-baseline">
        <span className="font-handwritten font-semibold text-primary text-lg leading-none">
          Babe,
        </span>
        <span className="font-mono font-bold text-sm leading-none ml-1">
          What&apos;s for Dinner?
        </span>
      </span>
    </span>
  );
}

// Alternative: Just the tagline for places where we need it standalone
export function MealPrepOSTagline({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const taglineSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <span
      className={cn(
        "font-mono text-clay-muted tracking-wider uppercase",
        taglineSizes[size],
        className
      )}
    >
      Meal Prep OS
    </span>
  );
}
