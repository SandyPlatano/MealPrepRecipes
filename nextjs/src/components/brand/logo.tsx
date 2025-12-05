import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: {
    babe: "text-lg",
    rest: "text-sm",
  },
  md: {
    babe: "text-2xl",
    rest: "text-base",
  },
  lg: {
    babe: "text-4xl",
    rest: "text-xl",
  },
  xl: {
    babe: "text-6xl",
    rest: "text-2xl",
  },
};

export function BrandLogo({ className, size = "md" }: BrandLogoProps) {
  const sizes = sizeClasses[size];

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

// Simplified version for nav/footer where we need tighter spacing
export function BrandLogoCompact({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-baseline", className)}>
      <span className="font-handwritten font-semibold text-xl text-primary leading-none mr-1">
        Babe,
      </span>
      <span className="font-mono font-bold text-lg leading-none">
        What&apos;s for Dinner?
      </span>
    </span>
  );
}
