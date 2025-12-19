import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface IconBadgeProps {
  icon: LucideIcon;
  color?: "primary" | "sage" | "muted" | "destructive" | "amber" | "blue" | "green";
  size?: "sm" | "default" | "lg";
  className?: string;
}

const colorMap = {
  primary: "bg-primary/10 text-primary",
  sage: "bg-sage-500/10 text-sage-600",
  muted: "bg-muted text-muted-foreground",
  destructive: "bg-destructive/10 text-destructive",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  green: "bg-green-500/10 text-green-600 dark:text-green-400",
};

const sizeMap = {
  sm: "p-1.5",
  default: "p-2",
  lg: "p-2.5",
};

const iconSizeMap = {
  sm: "size-3",
  default: "size-4",
  lg: "size-5",
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
