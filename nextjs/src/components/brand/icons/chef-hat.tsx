/**
 * Custom Chef Hat Icons
 *
 * Multiple design variants for the "Babe, What's for Dinner?" brand.
 * These replace the generic Lucide ChefHat with custom, brand-specific designs.
 *
 * Variants:
 * - Classic: Clean, professional chef hat (toque)
 * - Friendly: Softer, more approachable curves
 * - Heart: Chef hat with subtle heart integration
 * - Minimal: Simplified for small sizes (favicon-ready)
 * - Animated: With optional steam/wiggle animation
 */

import { cn } from "@/lib/utils";

export interface ChefHatIconProps {
  className?: string;
  size?: number;
  variant?: "classic" | "friendly" | "heart" | "minimal";
  animated?: boolean;
  "aria-label"?: string;
}

/**
 * Classic Chef Hat - Clean, professional toque design
 * Best for: Headers, navigation, professional contexts
 */
export function ChefHatClassic({
  className,
  size = 24,
  animated = false,
  "aria-label": ariaLabel = "Chef hat icon",
}: ChefHatIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(animated && "animate-wiggle", className)}
      aria-label={ariaLabel}
      role="img"
    >
      {/* Chef hat body - classic toque shape */}
      <path
        d="M6 18V15C6 15 6 12 7 10C5 9.5 4 8 4 6.5C4 4 6 2 9 2C10.5 2 11.5 2.5 12 3C12.5 2.5 13.5 2 15 2C18 2 20 4 20 6.5C20 8 19 9.5 17 10C18 12 18 15 18 15V18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Hat band */}
      <path
        d="M6 18H18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Pleats on top */}
      <path
        d="M9 7V6M12 7V5M15 7V6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Optional steam when animated */}
      {animated && (
        <g className="animate-float" style={{ animationDuration: "2s" }}>
          <path
            d="M10 0C10 0 9.5 1 10 1.5S10.5 2 10 2.5"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.5"
          />
          <path
            d="M14 0.5C14 0.5 13.5 1 14 1.5S14.5 2 14 2.5"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.5"
          />
        </g>
      )}
    </svg>
  );
}

/**
 * Friendly Chef Hat - Softer, more approachable design
 * Best for: Marketing, onboarding, casual contexts
 */
export function ChefHatFriendly({
  className,
  size = 24,
  animated = false,
  "aria-label": ariaLabel = "Chef hat icon",
}: ChefHatIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(animated && "animate-bounce-in", className)}
      aria-label={ariaLabel}
      role="img"
    >
      {/* Puffy cloud-like top */}
      <path
        d="M12 2C9 2 7 3.5 6.5 5.5C4.5 5.8 3 7.5 3 9.5C3 11.5 4.5 13 6.5 13.2C6.2 14.5 6 16 6 17V19H18V17C18 16 17.8 14.5 17.5 13.2C19.5 13 21 11.5 21 9.5C21 7.5 19.5 5.8 17.5 5.5C17 3.5 15 2 12 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Decorative band with rounded corners */}
      <rect
        x="6"
        y="19"
        width="12"
        height="3"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="2"
      />
      {/* Cute face dots (subtle) */}
      <circle cx="9" cy="10" r="0.75" fill="currentColor" opacity="0.3" />
      <circle cx="15" cy="10" r="0.75" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

/**
 * Heart Chef Hat - Integrates heart shape for warmth
 * Best for: Brand hero, emotional contexts, "made with love"
 */
export function ChefHatHeart({
  className,
  size = 24,
  animated = false,
  "aria-label": ariaLabel = "Chef hat with heart icon",
}: ChefHatIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(animated && "animate-pulse-glow", className)}
      aria-label={ariaLabel}
      role="img"
    >
      {/* Chef hat body */}
      <path
        d="M6 18V15C6 15 6 12 7 10C5 9.5 4 8 4 6.5C4 4 6 2 9 2C10.5 2 11.5 2.5 12 3C12.5 2.5 13.5 2 15 2C18 2 20 4 20 6.5C20 8 19 9.5 17 10C18 12 18 15 18 15V18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Hat band */}
      <path
        d="M6 18H18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Heart integrated into the hat */}
      <path
        d="M12 13L10.5 11.5C9.5 10.5 9.5 9 10.5 8.5C11 8.2 11.5 8.3 12 8.8C12.5 8.3 13 8.2 13.5 8.5C14.5 9 14.5 10.5 13.5 11.5L12 13Z"
        fill="currentColor"
        opacity="0.8"
      />
    </svg>
  );
}

/**
 * Minimal Chef Hat - Simplified for small sizes
 * Best for: Favicons (16px), compact spaces, loading states
 */
export function ChefHatMinimal({
  className,
  size = 24,
  animated = false,
  "aria-label": ariaLabel = "Chef hat icon",
}: ChefHatIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(animated && "animate-wiggle", className)}
      aria-label={ariaLabel}
      role="img"
    >
      {/* Simple, bold shape that works at small sizes */}
      <path
        d="M4 9C4 6 6.5 4 9 4C10 4 11 4.3 12 5C13 4.3 14 4 15 4C17.5 4 20 6 20 9C20 10 19.5 11 18.5 11.5C19 13 19 15 19 16V18C19 19 18 20 17 20H7C6 20 5 19 5 18V16C5 15 5 13 5.5 11.5C4.5 11 4 10 4 9Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Dynamic Chef Hat - Selects variant based on props
 * Use this as the main export for flexibility
 */
export function ChefHatIcon({
  variant = "classic",
  ...props
}: ChefHatIconProps) {
  switch (variant) {
    case "friendly":
      return <ChefHatFriendly {...props} />;
    case "heart":
      return <ChefHatHeart {...props} />;
    case "minimal":
      return <ChefHatMinimal {...props} />;
    case "classic":
    default:
      return <ChefHatClassic {...props} />;
  }
}

// Default export
export default ChefHatIcon;
