import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

const sizeClasses = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
}

export function Logo({ className, size = "md" }: LogoProps) {
  return (
    <span
      className={cn(
        "font-display font-bold tracking-tight",
        sizeClasses[size],
        className
      )}
    >
      <span className="text-[var(--color-sidebar-text)]">babewfd</span>
      <span className="text-[var(--color-brand-primary)]">.</span>
    </span>
  )
}
