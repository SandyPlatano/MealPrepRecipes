"use client";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes, useState } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// MEAL PREP OS - Button Component
// Classic Windows 95/98 style beveled button
// ═══════════════════════════════════════════════════════════════════════════════

const osButtonVariants = cva(
  // Base styles
  [
    "inline-flex items-center justify-center gap-1.5",
    "font-system text-[12px]",
    "cursor-pointer select-none",
    "transition-none", // No transitions for authentic retro feel
    "focus-visible:outline-1 focus-visible:outline-dotted",
    "focus-visible:outline-os-text focus-visible:-outline-offset-4",
    "disabled:cursor-not-allowed disabled:text-os-text-disabled",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-os-chrome text-os-text",
          "border-2 border-solid",
          "border-t-os-raised border-l-os-raised",
          "border-b-os-darkest border-r-os-darkest",
          "shadow-[inset_1px_1px_0_var(--os-lightest)]",
        ],
        primary: [
          "bg-os-chrome text-os-text",
          "border-2 border-solid",
          "border-t-os-raised border-l-os-raised",
          "border-b-os-darkest border-r-os-darkest",
          "shadow-[inset_1px_1px_0_var(--os-lightest)]",
          // Thick black border for default/primary button
          "ring-1 ring-os-text",
        ],
        toolbar: [
          "bg-os-chrome text-os-text",
          "border border-solid",
          "border-t-os-raised border-l-os-raised",
          "border-b-os-darkest border-r-os-darkest",
        ],
        ghost: [
          "bg-transparent text-os-text",
          "border border-transparent",
          "hover:bg-os-chrome",
          "hover:border-t-os-raised hover:border-l-os-raised",
          "hover:border-b-os-darkest hover:border-r-os-darkest",
        ],
        menu: [
          "bg-transparent text-os-text",
          "hover:bg-os-titlebar hover:text-os-text-light",
          "px-2 py-0.5",
        ],
        // Food accent variants
        tomato: [
          "bg-food-tomato text-white",
          "border-2 border-solid",
          "border-t-[#ff8a7a] border-l-[#ff8a7a]",
          "border-b-[#cc4f39] border-r-[#cc4f39]",
        ],
        avocado: [
          "bg-food-avocado text-white",
          "border-2 border-solid",
          "border-t-[#7ab317] border-l-[#7ab317]",
          "border-b-[#3d5c02] border-r-[#3d5c02]",
        ],
      },
      size: {
        default: "h-[23px] px-3 py-0.5",
        sm: "h-[19px] px-2 py-0 text-[11px]",
        lg: "h-[28px] px-4 py-1",
        icon: "h-[23px] w-[23px] p-0",
        "icon-sm": "h-[19px] w-[19px] p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface OsButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof osButtonVariants> {
  /** Show pressed state */
  pressed?: boolean;
}

export const OsButton = forwardRef<HTMLButtonElement, OsButtonProps>(
  ({ className, variant, size, pressed, disabled, children, ...props }, ref) => {
    const [isMouseDown, setIsMouseDown] = useState(false);
    const isPressed = pressed || isMouseDown;

    return (
      <button
        type="button"
        ref={ref}
        className={cn(
          osButtonVariants({ variant, size }),
          // Pressed state - invert bevels
          isPressed &&
            variant !== "ghost" &&
            variant !== "menu" && [
              "border-t-os-darkest border-l-os-darkest",
              "border-b-os-raised border-r-os-raised",
              "shadow-[inset_1px_1px_0_var(--os-sunken)]",
              // Shift content down-right to simulate physical press
              "[&>*]:translate-x-px [&>*]:translate-y-px",
            ],
          className
        )}
        disabled={disabled}
        onMouseDown={() => setIsMouseDown(true)}
        onMouseUp={() => setIsMouseDown(false)}
        onMouseLeave={() => setIsMouseDown(false)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

OsButton.displayName = "OsButton";

export default OsButton;
