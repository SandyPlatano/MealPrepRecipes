/**
 * Brand Logo Components
 *
 * Primary logo components for "Babe, What's for Dinner?"
 * Supports multiple sizes, variants, color schemes, and icon styles.
 */

import { cn } from "@/lib/utils";
import { ChefHat } from "lucide-react";
import {
  ChefHatIcon,
  ChefHatClassic,
  ChefHatFriendly,
  ChefHatHeart,
  ChefHatMinimal,
} from "./icons";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface BrandLogoProps {
  className?: string;
  /** Size preset for the logo */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Show the chef hat icon */
  showIcon?: boolean;
  /** Show the tagline below the logo */
  showTagline?: boolean;
  /** Icon style variant */
  iconVariant?: "lucide" | "classic" | "friendly" | "heart" | "minimal";
  /** Color scheme */
  colorScheme?: "default" | "monochrome" | "reversed" | "dark" | "light";
  /** Enable icon animation */
  animated?: boolean;
  /** Layout direction */
  layout?: "horizontal" | "stacked";
}

export interface BrandLogoCompactProps {
  className?: string;
  iconVariant?: "lucide" | "classic" | "friendly" | "heart" | "minimal";
  colorScheme?: "default" | "monochrome";
  animated?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIZE CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const sizeClasses = {
  xs: {
    icon: 14,
    iconClass: "w-3.5 h-3.5",
    babe: "text-base",
    rest: "text-xs",
    tagline: "text-[10px]",
    gap: "gap-1",
    stackGap: "gap-0.5",
  },
  sm: {
    icon: 16,
    iconClass: "w-4 h-4",
    babe: "text-lg",
    rest: "text-sm",
    tagline: "text-xs",
    gap: "gap-1.5",
    stackGap: "gap-0.5",
  },
  md: {
    icon: 20,
    iconClass: "w-5 h-5",
    babe: "text-2xl",
    rest: "text-base",
    tagline: "text-sm",
    gap: "gap-2",
    stackGap: "gap-1",
  },
  lg: {
    icon: 28,
    iconClass: "w-7 h-7",
    babe: "text-4xl",
    rest: "text-xl",
    tagline: "text-base",
    gap: "gap-2.5",
    stackGap: "gap-1",
  },
  xl: {
    icon: 40,
    iconClass: "w-10 h-10",
    babe: "text-6xl",
    rest: "text-2xl",
    tagline: "text-lg",
    gap: "gap-3",
    stackGap: "gap-1.5",
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// COLOR SCHEME CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const colorSchemes = {
  default: {
    icon: "text-black",
    babe: "text-black",
    rest: "text-black",
    tagline: "text-muted-foreground",
  },
  monochrome: {
    icon: "text-black",
    babe: "text-black",
    rest: "text-black",
    tagline: "text-muted-foreground",
  },
  reversed: {
    icon: "text-white",
    babe: "text-white",
    rest: "text-white",
    tagline: "text-white/70",
  },
  dark: {
    icon: "text-white",
    babe: "text-white",
    rest: "text-white",
    tagline: "text-white/60",
  },
  light: {
    icon: "text-black",
    babe: "text-black",
    rest: "text-black",
    tagline: "text-black/60",
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// ICON RENDERER
// ═══════════════════════════════════════════════════════════════════════════════

function renderIcon(
  variant: BrandLogoProps["iconVariant"],
  size: number,
  className: string,
  animated: boolean
) {
  switch (variant) {
    case "classic":
      return (
        <ChefHatClassic size={size} className={className} animated={animated} />
      );
    case "friendly":
      return (
        <ChefHatFriendly
          size={size}
          className={className}
          animated={animated}
        />
      );
    case "heart":
      return (
        <ChefHatHeart size={size} className={className} animated={animated} />
      );
    case "minimal":
      return (
        <ChefHatMinimal size={size} className={className} animated={animated} />
      );
    case "lucide":
    default:
      return <ChefHat className={className} />;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// BRAND LOGO - MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Main brand logo component with full customization options.
 *
 * @example
 * // Default usage
 * <BrandLogo />
 *
 * // Large with tagline
 * <BrandLogo size="lg" showTagline />
 *
 * // Custom icon and dark color scheme
 * <BrandLogo iconVariant="heart" colorScheme="dark" />
 *
 * // Stacked layout for hero sections
 * <BrandLogo size="xl" layout="stacked" showTagline />
 */
export function BrandLogo({
  className,
  size = "md",
  showIcon = true,
  showTagline = false,
  iconVariant = "lucide",
  colorScheme = "default",
  animated = false,
  layout = "horizontal",
}: BrandLogoProps) {
  const sizes = sizeClasses[size];
  const colors = colorSchemes[colorScheme];

  const isStacked = layout === "stacked";

  return (
    <span
      className={cn(
        "inline-flex",
        isStacked ? "flex-col items-center" : "flex-col items-start",
        className
      )}
    >
      <span
        className={cn(
          "inline-flex items-center",
          isStacked ? "flex-col" : "flex-row",
          isStacked ? sizes.stackGap : sizes.gap
        )}
      >
        {showIcon &&
          renderIcon(
            iconVariant,
            sizes.icon,
            cn(colors.icon, iconVariant === "lucide" ? sizes.iconClass : ""),
            animated
          )}
        <span
          className={cn(
            "inline-flex items-baseline gap-1",
            isStacked && "justify-center"
          )}
        >
          <span
            className={cn(
              "font-script font-semibold leading-none",
              colors.babe,
              sizes.babe
            )}
          >
            Babe,
          </span>
          <span
            className={cn(
              "font-primary font-bold leading-none",
              colors.rest,
              sizes.rest
            )}
          >
            What&apos;s for Dinner?
          </span>
        </span>
      </span>
      {showTagline && (
        <span
          className={cn(
            "font-primary tracking-wider uppercase mt-1",
            colors.tagline,
            sizes.tagline,
            !isStacked && showIcon ? "ml-7" : ""
          )}
        >
          Your Meal Prep OS
        </span>
      )}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BRAND LOGO COMPACT - NAV/FOOTER VERSION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Compact logo variant for navigation bars and footers.
 * Tighter spacing, fixed size, optimized for small spaces.
 *
 * @example
 * <BrandLogoCompact />
 * <BrandLogoCompact iconVariant="minimal" />
 */
export function BrandLogoCompact({
  className,
  iconVariant = "lucide",
  colorScheme = "default",
  animated = false,
}: BrandLogoCompactProps) {
  const colors = colorSchemes[colorScheme];

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      {renderIcon(
        iconVariant,
        20,
        cn(colors.icon, iconVariant === "lucide" ? "w-5 h-5" : ""),
        animated
      )}
      <span className="inline-flex items-baseline">
        <span
          className={cn(
            "font-script font-semibold text-lg leading-none",
            colors.babe
          )}
        >
          Babe,
        </span>
        <span
          className={cn(
            "font-primary font-bold text-sm leading-none ml-1",
            colors.rest
          )}
        >
          What&apos;s for Dinner?
        </span>
      </span>
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BRAND ICON ONLY - FOR TIGHT SPACES
// ═══════════════════════════════════════════════════════════════════════════════

export interface BrandIconProps {
  className?: string;
  size?: number;
  variant?: "lucide" | "classic" | "friendly" | "heart" | "minimal";
  animated?: boolean;
}

/**
 * Just the icon, for tight spaces like favicons, loading states, or avatars.
 *
 * @example
 * <BrandIcon size={32} />
 * <BrandIcon variant="heart" animated />
 */
export function BrandIcon({
  className,
  size = 24,
  variant = "classic",
  animated = false,
}: BrandIconProps) {
  return renderIcon(
    variant,
    size,
    cn("text-primary", className),
    animated
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAGLINE STANDALONE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Standalone tagline component for use where the logo already exists.
 */
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
        "font-primary text-muted-foreground tracking-wider uppercase",
        taglineSizes[size],
        className
      )}
    >
      Meal Prep OS
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// WORDMARK ONLY - NO ICON
// ═══════════════════════════════════════════════════════════════════════════════

export interface BrandWordmarkProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  colorScheme?: "default" | "monochrome" | "reversed";
}

/**
 * Text-only version of the logo (no icon).
 * Use when the icon context already exists nearby.
 *
 * @example
 * <BrandWordmark size="lg" />
 */
export function BrandWordmark({
  className,
  size = "md",
  colorScheme = "default",
}: BrandWordmarkProps) {
  const sizes = sizeClasses[size];
  const colors = colorSchemes[colorScheme];

  return (
    <span className={cn("inline-flex items-baseline gap-1", className)}>
      <span
        className={cn(
          "font-script font-semibold leading-none",
          colors.babe,
          sizes.babe
        )}
      >
        Babe,
      </span>
      <span
        className={cn(
          "font-primary font-bold leading-none",
          colors.rest,
          sizes.rest
        )}
      >
        What&apos;s for Dinner?
      </span>
    </span>
  );
}
