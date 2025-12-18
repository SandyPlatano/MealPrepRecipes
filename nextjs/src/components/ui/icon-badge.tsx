import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface IconBadgeProps {
  icon: LucideIcon;
  color?: "primary" | "sage" | "muted" | "destructive";
  size?: "sm" | "default" | "lg";
  className?: string;
}

const colorMap = {
  primary: "bg-primary/10 text-primary",
  sage: "bg-sage-500/10 text-sage-600",
  muted: "bg-muted text-muted-foreground",
  destructive: "bg-destructive/10 text-destructive",
};

const sizeMap = {
  sm: "p-1.5",
  default: "p-2",
  lg: "p-2.5",
};

const iconSizeMap = {
  sm: "h-3 w-3",
  default: "h-4 w-4",
  lg: "h-5 w-5",
};

export function IconBadge({
  icon: Icon,
  color = "primary",
  size = "default",
  className
}: IconBadgeProps) {
  return (
    <div className={cn("rounded-lg", colorMap[color], sizeMap[size], className)}>
      <Icon className={iconSizeMap[size]} />
    </div>
  );
}
