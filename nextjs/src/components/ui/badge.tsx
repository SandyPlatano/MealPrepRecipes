import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border border-gray-300 dark:border-gray-600 px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D9F99D] focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground",
        secondary:
          "bg-secondary text-secondary-foreground",
        destructive:
          "bg-destructive text-destructive-foreground",
        outline: "bg-transparent text-foreground",
        warning:
          "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  // Check if className contains important modifiers (like !bg-, !text-, etc.)
  // If so, skip applying variant styles to allow custom styling to take precedence
  const classNameStr = className || "";
  const hasImportantModifiers = classNameStr.includes("!bg-") || classNameStr.includes("!text-");
  
  // Base classes without variant styles - ensure border is included
  const baseClasses = "inline-flex items-center rounded-full border border-gray-300 dark:border-gray-600 px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D9F99D] focus-visible:ring-offset-2";
  
  // If we have important modifiers and no explicit variant, only apply base classes
  // Apply className last to ensure important modifiers take precedence
  if (hasImportantModifiers && variant === undefined) {
    // Merge classes ensuring custom className with important modifiers comes last
    // This allows the important modifiers to override any conflicting base classes
    return (
      <div {...props} className={cn(baseClasses, className)} />
    );
  }
  
  return (
    <div {...props} className={cn(badgeVariants({ variant }), className)} />
  );
}

export { Badge, badgeVariants };
