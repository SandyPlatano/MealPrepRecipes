import { cn } from "@/lib/utils";
import { ChefHat } from "lucide-react";

interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showIcon?: boolean;
}

const sizeClasses = {
  sm: {
    icon: "w-4 h-4",
    meal: "text-lg",
    prep: "text-lg",
    os: "text-sm",
  },
  md: {
    icon: "w-5 h-5",
    meal: "text-2xl",
    prep: "text-2xl",
    os: "text-base",
  },
  lg: {
    icon: "w-7 h-7",
    meal: "text-4xl",
    prep: "text-4xl",
    os: "text-xl",
  },
  xl: {
    icon: "w-10 h-10",
    meal: "text-6xl",
    prep: "text-6xl",
    os: "text-2xl",
  },
};

export function BrandLogo({ className, size = "md", showIcon = true }: BrandLogoProps) {
  const sizes = sizeClasses[size];

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      {showIcon && (
        <ChefHat className={cn("text-primary", sizes.icon)} />
      )}
      <span className="inline-flex items-baseline gap-1">
        <span
          className={cn(
            "font-bold leading-none",
            sizes.meal
          )}
        >
          Meal Prep
        </span>
        <span
          className={cn(
            "font-mono font-bold text-primary leading-none",
            sizes.os
          )}
        >
          OS
        </span>
      </span>
    </span>
  );
}

// Simplified version for nav/footer where we need tighter spacing
export function BrandLogoCompact({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <ChefHat className="w-5 h-5 text-primary" />
      <span className="inline-flex items-baseline">
        <span className="font-bold text-lg leading-none">
          Meal Prep
        </span>
        <span className="font-mono font-bold text-sm text-primary leading-none ml-1">
          OS
        </span>
      </span>
    </span>
  );
}

// Keep the old "Babe, What's for Dinner?" logo for backwards compatibility
export function BabeWhatsForDinnerLogo({ className, size = "md" }: BrandLogoProps) {
  const oldSizeClasses = {
    sm: { babe: "text-lg", rest: "text-sm" },
    md: { babe: "text-2xl", rest: "text-base" },
    lg: { babe: "text-4xl", rest: "text-xl" },
    xl: { babe: "text-6xl", rest: "text-2xl" },
  };
  const sizes = oldSizeClasses[size];

  return (
    <span className={cn("inline-flex items-baseline gap-1", className)}>
      <span
        className={cn(
          "font-handwritten font-semibold text-primary leading-none",
          sizes.babe
        )}
      >
        Babe,
      </span>
      <span
        className={cn(
          "font-mono font-bold leading-none",
          sizes.rest
        )}
      >
        What&apos;s for Dinner?
      </span>
    </span>
  );
}
