import { cn } from "@/lib/utils"

interface MaterialIconProps {
  name: string
  className?: string
  filled?: boolean
  size?: "sm" | "md" | "lg" | "xl"
}

const sizeClasses = {
  sm: "text-base",   // 16px
  md: "text-xl",     // 20px
  lg: "text-2xl",    // 24px
  xl: "text-3xl",    // 30px
}

export function MaterialIcon({
  name,
  className,
  filled = false,
  size = "md",
}: MaterialIconProps) {
  return (
    <span
      className={cn(
        "material-symbols-outlined select-none",
        sizeClasses[size],
        filled && "filled",
        className
      )}
      style={{
        fontFamily: "'Material Symbols Outlined'",
        fontVariationSettings: filled
          ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"
          : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
      }}
      aria-hidden="true"
    >
      {name}
    </span>
  )
}
