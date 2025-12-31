import { cn } from "@/lib/utils"

interface RetroLogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

const sizeClasses = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
}

export function RetroLogo({ className, size = "md" }: RetroLogoProps) {
  return (
    <span
      className={cn(
        "font-mono font-bold tracking-tight",
        sizeClasses[size],
        className
      )}
    >
      <span className="text-[var(--color-sidebar-text)]">babewfd</span>
      <span className="text-[var(--color-brand-primary)]">.</span>
    </span>
  )
}
