import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground border-2 border-[hsl(221_83%_45%)] shadow-md hover:shadow-primary hover:scale-105 hover:bg-primary/95 hover:border-[hsl(221_83%_50%)] active:scale-95 dark:bg-primary dark:text-primary-foreground dark:border-[hsl(221_83%_60%)] dark:hover:bg-primary/90 dark:hover:shadow-primary-lg dark:hover:border-[hsl(221_83%_65%)]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-md hover:shadow-lg hover:scale-105 hover:bg-destructive/95 active:scale-95",
        outline:
          "border-2 border-input bg-background shadow-sm hover:shadow-md hover:scale-105 hover:bg-accent hover:text-accent-foreground hover:border-accent active:scale-95",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:shadow-md hover:scale-105 hover:bg-secondary/90 active:scale-95",
        ghost: 
          "hover:bg-accent hover:text-accent-foreground hover:scale-105 active:scale-95",
        link: 
          "text-primary underline-offset-4 hover:underline hover:text-primary/80",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
